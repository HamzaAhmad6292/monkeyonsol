"use client"

import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import React, { useEffect, useRef, useState } from 'react';
import { TwitterShareButton, TwitterIcon } from 'react-share';

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
    .tui-image-editor-header {
      display: none !important;
    }
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
      height: 28px !important;
      touch-action: auto !important;
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
    template.src = "/images/b_template.jpg";

    template.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 978;
      canvas.height = 990;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(template, 0, 0);

      // Original 4 corners
      const original = {
        topLeft:     { x: 600, y: 310 },
        topRight:    { x: 820, y: 300 },
        bottomRight: { x: 775, y: 620 },
        bottomLeft:  { x: 550, y: 610 },
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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: false });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // Updated angle calculation
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
    
    const baseAngle = isMobile ? 90 : 150;
    setAngle((rad * (180 / Math.PI)) + baseAngle);
  }, [mouse, isMobile]);

  const handleEditorInit = (editor: any) => {
    editorRef.current = editor;
    
    setTimeout(() => {
      const downloadButton = document.querySelector('.tui-image-editor-download-btn');
      if (downloadButton) {
        const newDownloadButton = downloadButton.cloneNode(true);
        downloadButton.parentNode?.replaceChild(newDownloadButton, downloadButton);
        
        newDownloadButton.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await handleSave();
        });
      }
    }, 1000);
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

  // Upload image to Vercel Blob Storage
  const uploadToBlob = async (blob: Blob): Promise<string> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', blob, 'monkey-art.png');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

const handleShare = async () => {
  if (!editorRef.current) return;

  setIsUploading(true);

  try {
    // 1. Get the warped image
    const instance = editorRef.current.getInstance();
    const dataUrl = instance.toDataURL();

    const img = new Image();
    img.src = dataUrl;
    await new Promise<void>((r) => (img.onload = () => r()));

    const finalCanvas = await warpImageOntoTemplate(img);

    // 2. Convert canvas → blob → file
    const blob: Blob | null = await new Promise((res) =>
      finalCanvas.toBlob(res, 'image/jpeg', 0.85)
    );
    if (!blob) throw new Error('Failed to create image blob');
    const file = new File([blob], 'my-image.jpg', { type: 'image/jpeg' });

    // 3. Trigger browser download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    URL.revokeObjectURL(link.href);

    // 4. Open Twitter share intent (works on desktop & mobile)
    const text = encodeURIComponent(
      'Check out my art on Monkey Canvas Pro! #MonkeyGoodBoy #$Monkey'
    );
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error('Sharing error:', error);
    alert(`Sharing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setIsUploading(false);
  }
};
  const handleSave = async () => {
    if (!editorRef.current) return;
  
    const instance = editorRef.current.getInstance();
    const dataUrl = instance.toDataURL();
  
    const img = new Image();
    img.src = dataUrl;
  
    img.onload = async () => {
      try {
        const finalCanvas = await warpImageOntoTemplate(img);
        const link = document.createElement("a");
        link.download = "my-monkey-art.png";
        link.href = finalCanvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error('Saving error:', error);
      }
    };
  };

  // Add undo, redo, reset handlers
  const handleUndo = () => {
    if (editorRef.current) {
      const inst = editorRef.current.getInstance();
      if (inst && inst.undo) inst.undo();
    }
  };
  const handleRedo = () => {
    if (editorRef.current) {
      const inst = editorRef.current.getInstance();
      if (inst && inst.redo) inst.redo();
    }
  };
  const handleReset = () => {
    if (editorRef.current) {
      const inst = editorRef.current.getInstance();
      if (inst && inst.clearUndoStack) inst.clearUndoStack();
      if (inst && inst.reset) inst.reset();
    }
  };

  // Mobile-specific configuration
  const mobileConfig = {
    loadImage: {
      path: '/images/big_white.png',
      name: 'White Canvas',
      size: { width: 800, height: 600 },
      useCanvasSize: true,
    },
    menu: ['draw', 'shape',],
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
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@YourTwitterHandle" />
      <meta name="twitter:title" content="Monkey Picasso Art" />
      <meta name="twitter:description" content="Create and share your monkey art!" />
      <meta name="twitter:image" content={imageUrl || '/default-image.png'} />
      
      <div className="flex-1 min-h-0 overflow-auto relative"
        style={isMobile ? { paddingBottom: 80 } : {}} // Add bottom padding on mobile
      >
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
            {imageUrl ? (
              <TwitterShareButton
                url={shareUrl}
                title="Check out my monkey art! 🎨🐵 #MonkeyPicasso"
                via="YourTwitterHandle"
                hashtags={['Art', 'DigitalArt']}
                related={['twitterapi']}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <TwitterIcon size={24} round />
                <span>Share to Twitter</span>
              </TwitterShareButton>
            ) : (
              <button
                onClick={handleShare}
                disabled={isUploading}
                style={{
                  background: isUploading ? '#aaa' : '#1da1f2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 24px',
                  fontWeight: 600,
                  fontSize: 18,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginTop: 12,
                  width: '100%',
                }}
              >
                {isUploading ? 'Uploading...' : 'Share to Twitter'}
              </button>
            )}
          </div>
        )}

        {/* Mobile floating monkey image */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              right: 0,
              bottom: 300,
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
      
      {/* Mobile action buttons */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            bottom: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#2c2c2c',
            padding: '12px 8px',
            gap: 8,
            zIndex: 100,
          }}
        >
          {/* Undo */}
          {/* <button
            onClick={handleUndo}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flex: 'none',
            }}
            aria-label="Undo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 14L4 9l5-5"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>
          </button>
          {/* Redo */}
          {/* <button
            onClick={handleRedo}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flex: 'none',
            }}
            aria-label="Redo"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 14l5-5-5-5"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>
          </button> */} 
          {/* Load */}
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
          {/* Save */}
          <button
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
          {/* Share */}
          <button
            onClick={handleShare}
            disabled={isUploading}
            style={{
              background: isUploading ? '#aaa' : '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 14,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              flex: 1,
              minHeight: 44,
            }}
          >
            {isUploading ? 'Uploading...' : 'Share'}
          </button>
          {/* Reset */}
          {/* <button
            onClick={handleReset}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: 0,
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              flex: 'none',
            }}
            aria-label="Reset"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 9a9 9 0 1 1-2.13 9"/></svg>
          </button> */}
        </div>
      )}
    </div>
  );
}