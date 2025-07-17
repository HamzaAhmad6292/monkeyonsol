"use client"

import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import React, { useEffect, useRef, useState } from 'react';

// Custom CSS for mobile-friendly styling
const customStyles = `
  .tui-image-editor-button,
  .tui-image-editor-menu > .tui-image-editor-item,
  .tui-image-editor-submenu > .tui-image-editor-button,
  .tui-image-editor-range-wrap button,
  .tui-image-editor-controls button {
    border-radius: 8px !important;
    transition: background-color 0.2s ease !important;
    min-height: 44px !important; /* Better touch targets */
    min-width: 44px !important;
  }
  
  /* Mobile-specific touch targets */
  @media (max-width: 768px) {
    .tui-image-editor-button,
    .tui-image-editor-menu > .tui-image-editor-item,
    .tui-image-editor-submenu > .tui-image-editor-button {
      min-height: 50px !important;
      min-width: 50px !important;
      font-size: 14px !important;
    }
    
    .tui-image-editor-submenu {
      padding: 10px !important;
    }
    
    .tui-image-editor-range-wrap {
      margin: 10px 0 !important;
    }
    
    .tui-image-editor-range-wrap input[type="range"] {
      height: 44px !important;
    }
    
    /* Hide some UI elements on mobile for cleaner interface */
    .tui-image-editor-header-logo {
      display: none !important;
    }
    
    .tui-image-editor-main-container {
      padding: 5px !important;
    }
  }
  
  .tui-image-editor-button:hover,
  .tui-image-editor-menu > .tui-image-editor-item:hover,
  .tui-image-editor-submenu > .tui-image-editor-button:hover,
  .tui-image-editor-range-wrap button:hover,
  .tui-image-editor-controls button:hover {
    background-color: #ff6600 !important;
    color: white !important;
  }
  
  .tui-image-editor-button:hover *,
  .tui-image-editor-menu > .tui-image-editor-item:hover *,
  .tui-image-editor-submenu > .tui-image-editor-button:hover *,
  .tui-image-editor-range-wrap button:hover *,
  .tui-image-editor-controls button:hover * {
    color: white !important;
    fill: white !important;
  }
  
  .tui-image-editor-menu > .tui-image-editor-item.active,
  .tui-image-editor-submenu > .tui-image-editor-button.active {
    background-color: #e55100 !important;
    color: white !important;
  }
  
  .tui-image-editor-menu > .tui-image-editor-item.active *,
  .tui-image-editor-submenu > .tui-image-editor-button.active * {
    color: white !important;
    fill: white !important;
  }
  
  /* Desktop logo styling */
  @media (min-width: 769px) {
    .tui-image-editor-container .tui-image-editor-header-logo > img,
    .tui-image-editor-container .tui-image-editor-header-logo svg,
    .tui-image-editor-container .tui-image-editor-header-logo .tui-image-editor-header-logo-text {
      display: none !important;
      padding: 0 !important;
    }

    .tui-image-editor-container .tui-image-editor-header-logo {
      text-indent: 0 !important;
      width: 25% !important;
      height: 120px !important; 
      background: url('/images/bg.png') no-repeat center center !important;
      position: relative !important;
      z-index: 9999 !important;
    }
  }
  
  /* Mobile-specific canvas adjustments */
  @media (max-width: 768px) {
    .tui-image-editor-canvas-container {
      max-width: 100% !important;
      overflow-x: auto !important;
    }
    
    .lower-canvas, .upper-canvas {
      max-width: 100% !important;
      height: auto !important;
    }
  }
`;

const ToastEditor: any = dynamic(
  () => import('@toast-ui/react-image-editor').then((mod) => {
    if (!mod.default) {
      throw new Error('Failed to load Toast UI Image Editor');
    }
    return mod.default;
  }),
  { 
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
);

export default function MonkeyEditor() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const editorRef = useRef<any>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    if (!imgRef.current || isMobile) return; // Skip animation on mobile
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const imgCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const dx = mouse.x - imgCenter.x;
    const dy = mouse.y - imgCenter.y;
    const rad = Math.atan2(dy, dx);
    setAngle((rad * (180 / Math.PI)) + 150);
  }, [mouse, isMobile]);

  const handleEditorInit = (editor: any) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
          editorRef.current = null;
        } catch (error) {
          console.error('Error cleaning up editor:', error);
        }
      }
    };
  }, []);

  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleShare = async () => {
    if (!editorRef.current) return;
    try {
      const dataUrl = editorRef.current.getInstance().toDataURL();
      const tweetText = encodeURIComponent("Check out my meme art! #MemeEditor");
      window.open(`https://twitter.com/intent/tweet?text=${tweetText}`);
    } catch (err) {
      alert('Failed to export image.');
    }
  };

  // Mobile-specific configuration
  const mobileConfig = {
    loadImage: {
      path: '/images/big_white.png',
      name: 'White Canvas',
      size: { width: 800, height: 600 },  // Smaller canvas for mobile
      useCanvasSize: true,
    },
    menu: ['draw', 'text', 'filter', 'crop'], // Limited menu for mobile
    initMenu: 'draw',
    uiSize: {
      width: '100%',
      height: '100%',
    },
    menuBarPosition: 'bottom', // Bottom menu for mobile
  };

  // Desktop configuration
  const desktopConfig = {
    loadImage: {
      path: '/images/big_white.png',
      name: 'White Canvas',
      size: { width: 1200, height: 800 },
      useCanvasSize: true,
    },
    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'filter'],
    initMenu: 'filter',
    uiSize: {
      width: '100%',
      height: '100%',
    },
    menuBarPosition: 'left',
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0 overt">
        <ToastEditor
          ref={editorRef}
          onInit={handleEditorInit}
          includeUI={isMobile ? mobileConfig : desktopConfig}
          cssMaxHeight={isMobile ? 600 : 800}
          cssMaxWidth={isMobile ? 800 : 1200}
          selectionStyle={{
            cornerSize: isMobile ? 35 : 20, // Larger touch targets on mobile
            rotatingPointOffset: isMobile ? 80 : 70,
          }}
          usageStatistics={false}
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Desktop floating monkey image */}
        {!isMobile && (
          <div
            style={{
              position: 'fixed',
              right: 32,
              bottom: 32,
              zIndex: 50,
              pointerEvents: 'none',
              width: 200,
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              ref={imgRef}
              src={"/images/monkey-picasso_no_bg.png"}
              alt="Monkey Picasso"
              style={{
                width: '100%',
                height: '100%',
                transform: `rotate(${angle}deg)`,
                transition: 'transform 0.2s linear',
                userSelect: 'none',
              }}
              draggable={false}
            />
          </div>
        )}
        
        {/* Desktop share button */}
        {!isMobile && (
          <div style={{
            position: 'fixed',
            right: 32,
            bottom: 16,
            zIndex: 51,
            width: 200,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <button
              onClick={handleShare}
              style={{
                background: '#1da1f2',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                marginTop: 12,
                width: '100%',
                transition: 'background 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#0d8ddb')}
              onMouseOut={e => (e.currentTarget.style.background = '#1da1f2')}
            >
              Share to Twitter
            </button>
          </div>
        )}

        {/* Mobile top toolbar with buttons */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            top: 10,
            left: 10,
            right: 10,
            zIndex: 52,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(10px)',
          }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file && editorRef.current) {
                      const url = URL.createObjectURL(file);
                      editorRef.current.getInstance().loadImageFromURL(url, file.name);
                    }
                  };
                  input.click();
                }}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                📁 Load
              </button>
              <button
                onClick={() => {
                  if (editorRef.current) {
                    const dataUrl = editorRef.current.getInstance().toDataURL();
                    const link = document.createElement('a');
                    link.download = 'my-art.png';
                    link.href = dataUrl;
                    link.click();
                  }
                }}
                style={{
                  background: '#FF9800',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                💾 Save
              </button>
              <button
                onClick={handleShare}
                style={{
                  background: '#1da1f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  minHeight: 36,
                }}
              >
                📤 Share
              </button>
            </div>
          </div>
        )}

        {/* Mobile floating monkey image - above bottom toolbar */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              right: 6,
              bottom: 300, // Above the bottom toolbar
              zIndex: 50,
              pointerEvents: 'none',
              width: 80, // Smaller size for mobile
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={"/images/monkey-picasso_no_bg.png"}
              alt="Monkey Picasso"
              style={{
                width: '100%',
                height: '100%',
                userSelect: 'none',
                // opacity: 0.8, // Slightly transparent so it doesn't interfere
              }}
              draggable={false}
            />
          </div>
        )}
      </div>
    </div>
  );
}