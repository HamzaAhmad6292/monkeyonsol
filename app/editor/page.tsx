"use client"

import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import React, { useEffect, useRef, useState } from 'react';

  // Enhanced mobile-friendly styling
const customStyles = `
  .tui-image-editor-button,
  .tui-image-editor-menu > .tui-image-editor-item,
  .tui-image-editor-submenu > .tui-image-editor-button,
  .tui-image-editor-range-wrap button,
  .tui-image-editor-controls button {
    border-radius: 8px !important;
    transition: background-color 0.2s ease !important;
    min-height: 44px !important;
    min-width: 44px !important;
  }
  
  /* Custom download button styling */
  .tui-image-editor-download-btn {
    background: #ff6600 !important;
    color: white !important;
    border-radius: 8px !important;
    transition: background-color 0.2s ease !important;
  }
  
  .tui-image-editor-download-btn:hover {
    background: #e55100 !important;
  }
  
  /* Mobile-specific styles */
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
    
    .tui-image-editor-header-logo {
      display: none !important;
    }
    
    .tui-image-editor-main-container {
      padding: 5px !important;
      padding-bottom: 5px !important;
    }
    
    .tui-image-editor-canvas-container {
      max-width: 100% !important;
      overflow-x: auto !important;
    }
    
    .lower-canvas, .upper-canvas {
      max-width: 100% !important;
      height: auto !important;
    }
    
    /* Hide desktop-specific UI */
    .tui-image-editor-menu-text,
    .tui-image-editor-menu-crop,
    .tui-image-editor-menu-rotate {
      display: none !important;
    }
  }
  
  /* PC-specific styles - remove vertical overflow */
  @media (min-width: 769px) {
    .tui-image-editor-main-container {
      overflow-y: hidden !important;
      height: calc(100vh - 120px) !important;
    }
    
    .tui-image-editor-canvas-container {
      overflow-y: hidden !important;
      max-height: calc(100vh - 200px) !important;
    }
  }
  
  /* Desktop logo styling */
  @media (min-width: 769px) {
    .tui-image-editor-container .tui-image-editor-header-logo {
      text-indent: -9999px !important;
      overflow: hidden !important;
      width: 25% !important;
      height: 120px !important; 
      background: url('/images/bg.png') no-repeat center center !important;
      background-size: contain !important;
      position: relative !important;
      z-index: 9999 !important;
    }
    
    /* Hide the original toast UI logo completely */
    .tui-image-editor-container .tui-image-editor-header-logo:before,
    .tui-image-editor-container .tui-image-editor-header-logo:after {
      display: none !important;
    }
    
    /* Additional coverage for any nested logo elements */
    .tui-image-editor-header-logo * {
      display: none !important;
    }
  }
  
  /* Button hover effects */
  .tui-image-editor-button:hover,
  .tui-image-editor-menu > .tui-image-editor-item:hover,
  .tui-image-editor-submenu > .tui-image-editor-button:hover,
  .tui-image-editor-range-wrap button:hover,
  .tui-image-editor-controls button:hover {
    background-color: #ff6600 !important;
    color: white !important;
  }
  
  .tui-image-editor-menu > .tui-image-editor-item.active,
  .tui-image-editor-submenu > .tui-image-editor-button.active {
    background-color: #e55100 !important;
    color: white !important;
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

import PerspT from 'perspective-transform';

async function warpImageOntoTemplate(uploadedImage: HTMLImageElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const template = new Image();
    template.src = "/images/new_template.png";

    template.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(template, 0, 0);

      // Original 4 corners
      const original = {
        topLeft:     { x: 485, y: 96 },
        topRight:    { x: 985, y: 57 },
        bottomRight: { x: 919, y: 799 },
        bottomLeft:  { x: 405, y: 749 },
      };

      // Compute center of the quadrilateral
      const center = {
        x: (original.topLeft.x + original.topRight.x + original.bottomRight.x + original.bottomLeft.x) / 4,
        y: (original.topLeft.y + original.topRight.y + original.bottomRight.y + original.bottomLeft.y) / 4,
      };

      // Move point 10% toward the center
      const shrinkPoint = (pt: { x: number, y: number }, factor = 0.1) => ({
        x: pt.x + (center.x - pt.x) * factor,
        y: pt.y + (center.y - pt.y) * factor,
      });

      const shrunk = {
        topLeft:     shrinkPoint(original.topLeft),
        topRight:    shrinkPoint(original.topRight),
        bottomRight: shrinkPoint(original.bottomRight),
        bottomLeft:  shrinkPoint(original.bottomLeft),
      };

      // Flattened destination coords
      const dstCoords = [
        shrunk.topLeft.x, shrunk.topLeft.y,
        shrunk.topRight.x, shrunk.topRight.y,
        shrunk.bottomRight.x, shrunk.bottomRight.y,
        shrunk.bottomLeft.x, shrunk.bottomLeft.y,
      ];

      const srcCoords = [
        0, 0,
        uploadedImage.width, 0,
        uploadedImage.width, uploadedImage.height,
        0, uploadedImage.height,
      ];

      const transform = PerspT(srcCoords, dstCoords);

      // Prepare source image data
      const offCanvas = document.createElement("canvas");
      offCanvas.width = uploadedImage.width;
      offCanvas.height = uploadedImage.height;
      const offCtx = offCanvas.getContext("2d")!;
      offCtx.drawImage(uploadedImage, 0, 0);
      const imgData = offCtx.getImageData(0, 0, uploadedImage.width, uploadedImage.height);

      // Map pixels
      for (let y = 0; y < uploadedImage.height; y++) {
        for (let x = 0; x < uploadedImage.width; x++) {
          const i = (y * uploadedImage.width + x) * 4;
          const [dx, dy] = transform.transform(x, y);
          const r = imgData.data[i];
          const g = imgData.data[i + 1];
          const b = imgData.data[i + 2];
          const a = imgData.data[i + 3];

          if (dx >= 0 && dy >= 0 && dx < canvas.width && dy < canvas.height) {
            ctx.fillStyle = `rgba(${r},${g},${b},${a / 255})`;
            // ctx.fillStyle = "rgba(255, 102, 0, 0.08)";

            ctx.fillRect(dx, dy, 1, 1);
          }
        }
      }
      

      resolve(canvas);
    };
  });
}



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

  // Updated to handle both mouse and touch events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Prevent default to avoid scrolling issues
      e.preventDefault();
      const touch = e.touches[0];
      if (touch) {
        setMouse({ x: touch.clientX, y: touch.clientY });
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        setMouse({ x: touch.clientX, y: touch.clientY });
      }
    };

    // Add both mouse and touch event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Updated angle calculation to work on both desktop and mobile
  useEffect(() => {
    if (!imgRef.current) return;
    
    const img = imgRef.current;
    const rect = img.getBoundingClientRect();
    const imgCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    const dx = mouse.x - imgCenter.x;
    const dy = mouse.y - imgCenter.y;
    const rad = Math.atan2(dy, dx);
    
    // Different base angles for mobile vs desktop
    const baseAngle = isMobile ? 90 : 150;
    setAngle((rad * (180 / Math.PI)) + baseAngle);
  }, [mouse, isMobile]);

  const handleEditorInit = (editor: any) => {
    editorRef.current = editor;
    
    // Override the default download button functionality
    setTimeout(() => {
      const downloadButton = document.querySelector('.tui-image-editor-download-btn');
      if (downloadButton) {
        // Remove existing event listeners by cloning the element
        const newDownloadButton = downloadButton.cloneNode(true);
        downloadButton.parentNode?.replaceChild(newDownloadButton, downloadButton);
        
        // Add our custom download functionality
        newDownloadButton.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await handleSave();
        });
      }
    }, 1000); // Wait for Toast UI to fully initialize
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

 const getFinalImage = async (): Promise<{ dataUrl: string }> => {
    if (!editorRef.current) throw new Error("Editor not available");
    
    const instance = editorRef.current.getInstance();
    const dataUrl = instance.toDataURL();
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        const finalCanvas = await warpImageOntoTemplate(img);
        resolve({
          dataUrl: finalCanvas.toDataURL("image/png")
        });
      };
      img.src = dataUrl;
    });
  };

  const handleShare = async () => {
    try {
      const { dataUrl } = await getFinalImage();
      
      // Create temporary URL for sharing
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "monkey-art.png", { type: "image/png" });
      const shareUrl = URL.createObjectURL(file);
      
      // Twitter Web Intent URL
      const tweetText = "Check out my AI-generated art with Monkey Picasso! 🎨🐵 #AIArt #MonkeyPicasso";
      const twitterIntentUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}`;
      
      // Open Twitter in new tab
      window.open(twitterIntentUrl, "_blank");
      
      // Clean up after 10 mins
      setTimeout(() => URL.revokeObjectURL(shareUrl), 600000);
    } catch (error) {
      console.error("Sharing failed:", error);
      alert("Sharing failed. Please try again.");
    }
  };

  const handleSave = async () => {
    if (!editorRef.current) return;
  
    const instance = editorRef.current.getInstance();
    const dataUrl = instance.toDataURL();
  
    const img = new Image();
    img.src = dataUrl;
  
    img.onload = async () => {
      const finalCanvas = await warpImageOntoTemplate(img);
      const link = document.createElement("a");
      link.download = "my-monkey-art.png";
      link.href = finalCanvas.toDataURL("image/png");
      link.click();
    };
  };
  
  

  // Mobile-specific configuration
  const mobileConfig = {
    loadImage: {
      path: '/images/big_white.png',
      name: 'White Canvas',
      size: { width: 800, height: 600 },
      useCanvasSize: true,
    },
    // menu: ['draw', 'text', 'filter', 'crop'],
    menu: ['draw', 'shape', 'filter', ],
    initMenu: 'draw',
    uiSize: {
      width: '100%',
      height: '100%',
    },
    menuBarPosition: 'bottom',
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
      <div className="flex-1 min-h-0 overflow-auto relative">
        <ToastEditor
          ref={editorRef}
          onInit={handleEditorInit}
          includeUI={isMobile ? mobileConfig : desktopConfig}
          cssMaxHeight={isMobile ? 600 : 800}
          cssMaxWidth={isMobile ? 800 : 1200}
          selectionStyle={{
            cornerSize: isMobile ? 35 : 20,
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

        {/* Mobile floating monkey image - now with rotation */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              right: 0,
              bottom: 300, // Above the native toolbar
              zIndex: 50,
              pointerEvents: 'none',
              width: 100,
              height: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: 0.9,
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
      </div>
      
      {/* Mobile action buttons - below editor content, scrollable */}
      {isMobile && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#2c2c2c',
          padding: '12px 16px',
          gap: 8,
        }}>
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
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              flex: 1,
              minHeight: 44,
            }}
          >
            Load
          </button>
          
          <button
            // onClick={() => {
            //   if (editorRef.current) {
            //     const dataUrl = editorRef.current.getInstance().toDataURL();
            //     const link = document.createElement('a');
            //     link.download = 'my-art.png';
            //     link.href = dataUrl;
            //     link.click();
            //   }
            // }}
            onClick={handleSave}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              flex: 1,
              minHeight: 44,
            }}
          >
            Save
          </button>
          
          <button
            onClick={handleShare}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              flex: 1,
              minHeight: 44,
            }}
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
}