// MonkeyEditor.tsx
"use client"

import PerspT from 'perspective-transform';
import dynamic from 'next/dynamic';
import 'tui-image-editor/dist/tui-image-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import React, { useEffect, useRef, useState } from 'react';
import { TwitterShareButton, TwitterIcon } from 'react-share';

/* ------------------------------------------------------------------ */
/* 1. Custom CSS (mobile-only overrides)                               */
/* ------------------------------------------------------------------ */
const customStyles = `
  /* Base touch-friendly hit-slots */
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

  /* Hide the built-in download button so we can roll our own */
  .tui-image-editor-download-btn {
    display: none !important;
  }

  /* ---------- Mobile only ---------- */
  @media (max-width: 768px) {
    /* Hide header & logo on small screens */
    .tui-image-editor-header,
    .tui-image-editor-header-logo {
      display: none !important;
    }

    /* Bigger buttons & text */
    .tui-image-editor-button,
    .tui-image-editor-menu > .tui-image-editor-item,
    .tui-image-editor-submenu > .tui-image-editor-button {
      min-height: 50px !important;
      min-width: 50px !important;
      font-size: 16px !important;
    }

    /* More padding around sub-menus */
    .tui-image-editor-submenu {
      padding: 12px !important;
    }

    /* Wider range sliders for thumbs */
    .tui-image-editor-range-wrap input[type="range"] {
      height: 32px !important;
      touch-action: auto !important;
    }

    /* Prevent horizontal overflow */
    .tui-image-editor-canvas-container {
      max-width: 100vw !important;
      overflow-x: hidden !important;
    }

    /* Hide some desktop-only menus on mobile */
    .tui-image-editor-menu-text,
    .tui-image-editor-menu-crop,
    .tui-image-editor-menu-rotate {
      display: none !important;
    }
  }

  /* ---------- Desktop only ---------- */
  @media (min-width: 769px) {
    /* Prevent vertical scroll */
    .tui-image-editor-main-container {
      overflow-y: hidden !important;
      height: calc(100vh - 120px) !important;
    }
    .tui-image-editor-canvas-container {
      overflow-y: hidden !important;
      max-height: calc(100vh - 200px) !important;
    }

    /* Custom logo */
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
    .tui-image-editor-container .tui-image-editor-header-logo:before,
    .tui-image-editor-container .tui-image-editor-header-logo:after,
    .tui-image-editor-header-logo * {
      display: none !important;
    }
  }

  /* Hover/active states */
  .tui-image-editor-button:hover,
  .tui-image-editor-menu > .tui-image-editor-item:hover,
  .tui-image-editor-submenu > .tui-image-editor-button:hover,
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

/* ------------------------------------------------------------------ */
/* 2. Dynamic import for Toast UI Image Editor                         */
/* ------------------------------------------------------------------ */
const ToastEditor: any = dynamic(
  () =>
    import('@toast-ui/react-image-editor').then((mod) => {
      if (!mod.default) throw new Error('Failed to load Toast UI Image Editor');
      return mod.default;
    }),
  { ssr: false, loading: () => <div className="p-4 text-center">Loading editor…</div> }
);

/* ------------------------------------------------------------------ */
/* 3. Warp helper                                                      */
/* ------------------------------------------------------------------ */
async function warpImageOntoTemplate(uploadedImage: HTMLImageElement): Promise<HTMLCanvasElement> {
  return new Promise((resolve) => {
    const template = new Image();
    template.src = '/images/b_template.jpg';
    template.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 978;
      canvas.height = 990;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(template, 0, 0);

      const original = {
        topLeft: { x: 600, y: 310 },
        topRight: { x: 820, y: 300 },
        bottomRight: { x: 775, y: 620 },
        bottomLeft: { x: 550, y: 610 },
      };

      const center = {
        x: (original.topLeft.x + original.topRight.x + original.bottomRight.x + original.bottomLeft.x) / 4,
        y: (original.topLeft.y + original.topRight.y + original.bottomRight.y + original.bottomLeft.y) / 4,
      };

      const shrink = (pt: { x: number; y: number }, f = 0.1) => ({
        x: pt.x + (center.x - pt.x) * f,
        y: pt.y + (center.y - pt.y) * f,
      });

      const dst = [
        shrink(original.topLeft),
        shrink(original.topRight),
        shrink(original.bottomRight),
        shrink(original.bottomLeft),
      ].flatMap((p) => [p.x, p.y]);

      const src = [0, 0, uploadedImage.width, 0, uploadedImage.width, uploadedImage.height, 0, uploadedImage.height];
      const transform = PerspT(src, dst);

      const off = document.createElement('canvas');
      off.width = uploadedImage.width;
      off.height = uploadedImage.height;
      const offCtx = off.getContext('2d')!;
      offCtx.drawImage(uploadedImage, 0, 0);
      const imgData = offCtx.getImageData(0, 0, uploadedImage.width, uploadedImage.height);

      for (let y = 0; y < uploadedImage.height; y++) {
        for (let x = 0; x < uploadedImage.width; x++) {
          const i = (y * uploadedImage.width + x) * 4;
          const [dx, dy] = transform.transform(x, y);
          if (dx >= 0 && dy >= 0 && dx < canvas.width && dy < canvas.height) {
            ctx.fillStyle = `rgba(${imgData.data[i]},${imgData.data[i + 1]},${imgData.data[i + 2]},${imgData.data[i + 3] / 255})`;
            ctx.fillRect(dx, dy, 1, 1);
          }
        }
      }
      resolve(canvas);
    };
  });
}

/* ------------------------------------------------------------------ */
/* 4. React component                                                  */
/* ------------------------------------------------------------------ */
export default function MonkeyEditor() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [angle, setAngle] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const editorRef = useRef<any>(null);

  /* Detect mobile ---------------------------------------------------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* Mouse / touch tracking ------------------------------------------ */
  useEffect(() => {
    const onMove = (e: MouseEvent) => setMouse({ x: e.clientX, y: e.clientY });
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setMouse({ x: t.clientX, y: t.clientY });
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: false });
    window.addEventListener('touchstart', onTouch, { passive: false });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchstart', onTouch);
    };
  }, []);

  /* Angle update ----------------------------------------------------- */
  useEffect(() => {
    if (!imgRef.current) return;
    const rect = imgRef.current.getBoundingClientRect();
    const c = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    const rad = Math.atan2(mouse.y - c.y, mouse.x - c.x);
    setAngle(rad * (180 / Math.PI) + (isMobile ? 90 : 150));
  }, [mouse, isMobile]);

  /* Editor life-cycle ------------------------------------------------ */
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = customStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        try {
          editorRef.current.destroy();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  /* Configs ---------------------------------------------------------- */
  const mobileConfig = {
    loadImage: { path: '/images/big_white.png', name: 'White Canvas' },
    menu: ['draw', 'shape'],
    initMenu: 'draw',
    uiSize: { width: '100%', height: '100%' },
    menuBarPosition: 'bottom',
  } as const;

  const desktopConfig = {
    loadImage: { path: '/images/big_white.png', name: 'White Canvas' },
    menu: ['crop', 'flip', 'rotate', 'draw', 'shape', 'icon', 'text', 'filter'],
    initMenu: 'filter',
    uiSize: { width: '100%', height: '100%' },
    menuBarPosition: 'left',
  } as const;

  /* Save / Share helpers -------------------------------------------- */
  const handleSave = async () => {
    if (!editorRef.current) return;
    const dataUrl = editorRef.current.getInstance().toDataURL();
    const img = new Image();
    img.src = dataUrl;
    img.onload = async () => {
      const canvas = await warpImageOntoTemplate(img);
      const link = document.createElement('a');
      link.download = 'my-monkey-art.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
  };

  const handleShare = async () => {
    if (!editorRef.current) return;
    setIsUploading(true);
    try {
      const dataUrl = editorRef.current.getInstance().toDataURL();
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((r) => (img.onload = () => r()));
      const canvas = await warpImageOntoTemplate(img);

      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.99));
      if (!blob) throw new Error('blob error');
      const file = new File([blob], 'my-image.jpg', { type: 'image/jpeg' });

      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(file);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);

      // Twitter intent
      const text = encodeURIComponent('Check out my art on Monkey Canvas Pro! #MonkeyGoodBoy #$Monkey');
      const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
      window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    } catch (err: any) {
      alert(`Sharing failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* 5. Render --------------------------------------------------------- */
  /* ------------------------------------------------------------------ */
  return (
    <div className="h-screen flex flex-col">
      {/* SEO */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="Monkey Picasso Art" />
      <meta name="twitter:description" content="Create and share your monkey art!" />
      <meta name="twitter:image" content={imageUrl || '/default-image.png'} />

      {/* Editor wrapper */}
      <div
        className="flex-1 min-h-0 overflow-auto relative"
        style={isMobile ? { paddingBottom: 80 } : {}} // space for fixed bar
      >
        <ToastEditor
          ref={editorRef}
          onInit={(e: any) => (editorRef.current = e)}
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

        {/* Floating monkey (desktop) */}
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
              src="/images/monkey-picasso_no_bg.png"
              alt="Monkey"
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
          <div
            style={{
              position: 'fixed',
              right: 32,
              bottom: 16,
              zIndex: 51,
              width: 200,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? (
              <TwitterShareButton
                url={shareUrl}
                title="Check out my monkey art! 🎨🐵 #MonkeyPicasso"
                hashtags={['Art', 'DigitalArt']}
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
                {isUploading ? 'Uploading…' : 'Share to Twitter'}
              </button>
            )}
          </div>
        )}

        {/* Mobile floating monkey (smaller) */}
        {isMobile && (
          <div
            style={{
              position: 'fixed',
              right: 8,
              bottom: 300,
              zIndex: 50,
              pointerEvents: 'none',
              width: 90,
              height: 90,
              opacity: 0.9,
            }}
          >
            <img
              ref={imgRef}
              src="/images/monkey-picasso_no_bg.png"
              alt="Monkey"
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

      {/* Mobile fixed action bar */}
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
              fontSize: 16,
              cursor: 'pointer',
              flex: 1,
              minHeight: 48,
            }}
          >
            Load
          </button>

          <button
            onClick={handleSave}
            style={{
              background: '#444444',
              color: 'white',
              border: 'none',
              borderRadius: 6,
              padding: '12px 20px',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              flex: 1,
              minHeight: 48,
            }}
          >
            Save
          </button>

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
              fontSize: 16,
              cursor: isUploading ? 'not-allowed' : 'pointer',
              flex: 1,
              minHeight: 48,
            }}
          >
            {isUploading ? 'Uploading…' : 'Share'}
          </button>
        </div>
      )}
    </div>
  );
}