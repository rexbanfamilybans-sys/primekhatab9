import React, { useEffect, useState, useRef } from 'react';
import { X, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdOverlayProps {
  onClose: () => void;
  isVisible: boolean;
}

export const AdOverlay: React.FC<AdOverlayProps> = ({ onClose, isVisible }) => {
  const { userData } = useAuth();
  const [countdown, setCountdown] = useState(10);
  const [canClose, setCanClose] = useState(false);

  const isPremium = userData?.subscription_status === 'active';

  useEffect(() => {
    if (isVisible && !isPremium) {
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

      return () => clearInterval(timer);
    }
  }, [isVisible, isPremium]);

  if (!isVisible || isPremium) return null;

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
          {/* Ad Network Container */}
          <div id="ad-container" className="w-full h-full flex items-center justify-center">
            {/* Native Banner Container */}
            <div id="container-c1aee88fc648fa4a6774370858ee2983" className="w-full h-full"></div>

            {/* Visual Placeholder (Visible only if ad is blocked or loading) */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/50 border-2 border-dashed border-zinc-800 rounded-2xl m-4 pointer-events-none -z-10">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4">
                <Play className="w-8 h-8 text-zinc-700 fill-current" />
              </div>
              <p className="text-zinc-500 font-bold text-sm">Ad Network Space</p>
              <p className="text-zinc-700 text-[10px] mt-1 uppercase tracking-widest">Sponsored content loading...</p>
            </div>
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a 
              href="https://www.profitablecpmratenetwork.com/s62w01hmq2?key=2155158c4f8e3efe7444c6fa5fa13530"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 flex items-center gap-2"
            >
              Visit Sponsor
            </a>
            {canClose && (
              <button 
                onClick={onClose}
                className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 shadow-2xl shadow-blue-600/40 flex items-center gap-2"
              >
                Continue to Video
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
