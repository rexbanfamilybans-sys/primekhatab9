import React, { useEffect, useState, useRef } from 'react';
import { X, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdOverlayProps {
  onClose: () => void;
  isVisible: boolean;
}

export const AdOverlay: React.FC<AdOverlayProps> = ({ onClose, isVisible }) => {
  const [countdown, setCountdown] = useState(10);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setCountdown(10);
      setCanClose(false);
      
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClose(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense error:", e);
      }

      return () => clearInterval(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Ad Header */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="px-2 py-1 bg-yellow-500 text-black text-[10px] font-black uppercase tracking-widest rounded">AD</div>
            <div className="text-white/70 text-xs font-bold flex items-center gap-2">
              <Play className="w-3 h-3 fill-current" />
              Sponsored Content
            </div>
          </div>
          
          {canClose ? (
            <button 
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-xs font-black transition-all active:scale-95"
            >
              Skip Ad <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="px-4 py-2 bg-black/40 border border-white/10 rounded-full text-white/60 text-xs font-bold">
              Skip in {countdown}s
            </div>
          )}
        </div>

        {/* Ad Content Area */}
        <div className="w-full max-w-4xl aspect-video bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl flex items-center justify-center relative group">
          {/* Real AdSense Ad Unit */}
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '100%' }}
               data-ad-client="ca-pub-1698954746273329"
               data-ad-slot="video_overlay_slot"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
          
          {/* Visual Placeholder (Visible only if ad is blocked or loading) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50 border-2 border-dashed border-zinc-800 rounded-2xl m-4 pointer-events-none">
            <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
              <Play className="w-8 h-8 text-zinc-700 fill-current" />
            </div>
            <p className="text-zinc-500 font-bold text-sm">Google AdSense Space</p>
            <p className="text-zinc-700 text-[10px] mt-1 uppercase tracking-widest">Ads will appear here on your approved domain</p>
          </div>
          
          {!canClose && (
            <div className="absolute inset-0 bg-black/20 pointer-events-none group-hover:bg-transparent transition-colors" />
          )}
        </div>

        {/* Ad Footer */}
        <div className="mt-8 text-center space-y-4">
          <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em]">
            Support sahidanime by watching this short ad
          </p>
          {canClose && (
            <button 
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-2xl shadow-blue-600/40 flex items-center gap-2 mx-auto"
            >
              Continue to Video
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
