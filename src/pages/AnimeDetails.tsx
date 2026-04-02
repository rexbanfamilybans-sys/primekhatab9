import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { VideoPlayer } from '../components/VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Play, Lock, Crown, Info, List, Star, Share2, Plus, X, Globe, CreditCard, Loader2, Zap, ArrowRight, Upload } from 'lucide-react';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number;
}

import { PLANS, PAYMENT_METHODS } from '../constants';

interface Episode {
  id: string;
  title: string;
  videoUrl: string;
  accessType: 'free' | 'premium' | 'locked';
  order: number;
}

export const AnimeDetails: React.FC = () => {
  const { id } = useParams();
  const { userData } = useAuth();
  const { theme } = useTheme();
  const [anime, setAnime] = useState<any>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currency, setCurrency] = useState<CurrencyInfo>({ code: 'INR', symbol: '₹', rate: 1 });
  const [countryCode, setCountryCode] = useState('IN');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [transactionId, setTransactionId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return toast.error('Image size should be less than 2MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Detect currency based on IP/Location
    const detectCurrency = async () => {
      try {
        // Using ipwho.is as it's more reliable for free client-side HTTPS requests
        const res = await fetch('https://ipwho.is/');
        const data = await res.json();
        
        if (data.success) {
          setCountryCode(data.country_code || 'IN');
          const currencyCode = data.currency?.code || 'INR';
          const currencySymbol = data.currency?.symbol || '₹';
          
          if (currencyCode === 'INR') {
            setCurrency({ code: 'INR', symbol: '₹', rate: 1 });
          } else {
            const rate = currencyCode === 'USD' ? 0.012 : 0.011; 
            setCurrency({ 
              code: currencyCode, 
              symbol: currencySymbol, 
              rate: rate 
            });
          }
        } else {
          throw new Error('API returned success: false');
        }
      } catch (e) {
        console.warn('Currency detection failed, falling back to default (IN)', e);
        // Robust fallback to India
        setCountryCode('IN');
        setCurrency({ code: 'INR', symbol: '₹', rate: 1 });
      }
    };
    detectCurrency();
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchAnime = async () => {
      const docRef = doc(db, 'anime', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAnime({ id: docSnap.id, ...docSnap.data() });
      }
    };

    const q = query(collection(db, 'anime', id, 'episodes'));
    const unsub = onSnapshot(q, (snapshot) => {
      const epList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Episode));
      // Sort client-side to handle missing order
      setEpisodes(epList.sort((a, b) => (a.order || 0) - (b.order || 0)));
      setLoading(false);
    });

    fetchAnime();
    return () => unsub();
  }, [id]);

  const canWatch = (episode: Episode) => {
    if (episode.accessType === 'free') return true;
    if (episode.accessType === 'premium' && userData?.subscription_status === 'active') return true;
    if (userData?.role === 'admin') return true;
    return false;
  };

  const handleEpisodeSelect = (ep: Episode) => {
    if (canWatch(ep)) {
      setSelectedEpisode(ep);
      setShowPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (ep.accessType === 'premium') {
      setShowPremiumModal(true);
    } else {
      toast.error('This episode is currently locked');
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedPlan) return toast.error('Please select a plan');
    if (!screenshot) return toast.error('Please upload payment screenshot');
    if (!userData) return toast.error('Please login first');
    
    setIsSubmitting(true);
    try {
      const planPrice = selectedPlan.prices[countryCode] || selectedPlan.prices.DEFAULT;
      await addDoc(collection(db, 'purchaseRequests'), {
        userId: userData.uid,
        userName: userData.name || 'Anonymous',
        userEmail: userData.email,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: planPrice.amount.toString(),
        currency: planPrice.currency,
        country: countryCode,
        transactionId: 'SCREENSHOT_ONLY',
        screenshot: screenshot,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success('Request submitted! Admin will approve it soon.');
      setShowPremiumModal(false);
      setTransactionId('');
      setScreenshot(null);
      setSelectedPlan(null);
    } catch (error: any) {
      toast.error('Failed to submit request: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPrice = (plan: any) => {
    const p = plan.prices[countryCode] || plan.prices.DEFAULT;
    return `${p.symbol}${p.amount}`;
  };

  if (loading) return <div className="min-h-screen bg-black" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* 1. Video Player Section (Top) */}
      <div className="bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
        {selectedEpisode ? (
          <div className="aspect-video">
            <VideoPlayer 
              key={selectedEpisode.id}
              src={selectedEpisode.videoUrl} 
              title={`${anime?.title} - Episode ${selectedEpisode.order}`} 
            />
          </div>
        ) : (
          <div className="relative aspect-video">
            <img 
              src={anime?.posterUrl} 
              alt={anime?.title}
              className="w-full h-full object-cover opacity-40"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <h1 className="text-3xl lg:text-5xl font-black tracking-tighter">{anime?.title}</h1>
              <p className="text-zinc-400 text-sm max-w-xl line-clamp-2">{anime?.description}</p>
              {episodes.length > 0 && (
                <button 
                  onClick={() => handleEpisodeSelect(episodes[0])}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all active:scale-95"
                >
                  <Play className="w-4 h-4 fill-current" /> Start Watching
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Info & Episodes Section (Below Player) */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left: Anime Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl lg:text-3xl font-black tracking-tight">{anime?.title}</h2>
                <div className="flex items-center gap-3 text-xs font-bold text-zinc-500">
                  <span className="flex items-center gap-1 text-blue-500">
                    <Star className="w-3.5 h-3.5 fill-current" /> 9.8 Rating
                  </span>
                  <span>•</span>
                  <span>{anime?.genre}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className={cn(
              "p-4 rounded-2xl border transition-colors",
              theme === 'dark' ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-200"
            )}>
              <h3 className={cn(
                "text-sm font-bold mb-2",
                theme === 'dark' ? "text-zinc-400" : "text-zinc-500"
              )}>Description</h3>
              <p className={cn(
                "text-sm leading-relaxed",
                theme === 'dark' ? "text-zinc-300" : "text-zinc-700"
              )}>
                {anime?.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Episode List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <List className="w-4 h-4 text-blue-500" />
              Episodes
            </h3>
            <span className="text-xs text-zinc-500">{episodes.length} Total</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => handleEpisodeSelect(ep)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group",
                  selectedEpisode?.id === ep.id 
                    ? "bg-blue-600/10 border-blue-500/50" 
                    : theme === 'dark'
                      ? "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900"
                      : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100"
                )}
              >
                <div className={cn(
                  "w-10 h-10 shrink-0 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform",
                  theme === 'dark' ? "bg-zinc-800" : "bg-zinc-200"
                )}>
                  {selectedEpisode?.id === ep.id ? (
                    <Play className="w-4 h-4 text-blue-500 fill-current" />
                  ) : (
                    <span className="text-zinc-500 font-bold text-xs">{ep.order}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={cn(
                    "font-bold text-xs truncate",
                    selectedEpisode?.id === ep.id 
                      ? "text-blue-500" 
                      : theme === 'dark' ? "text-zinc-200" : "text-zinc-900"
                  )}>
                    {ep.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    {ep.accessType === 'premium' && (
                      <span className="flex items-center gap-1 text-[8px] font-bold text-yellow-500 uppercase">
                        <Crown className="w-2.5 h-2.5" /> Premium
                      </span>
                    )}
                    {ep.accessType === 'free' && (
                      <span className="text-[8px] font-bold text-green-500 uppercase">Free</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Premium Subscription Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={cn(
            "rounded-[2rem] p-6 w-full max-w-md space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar transition-colors duration-300",
            selectedPlan ? "bg-white text-zinc-900" : "bg-zinc-900 text-white border border-zinc-800"
          )}>
            {/* Background Glow */}
            <div className={cn(
              "absolute -top-24 -right-24 w-48 h-48 blur-[80px] rounded-full",
              selectedPlan ? "bg-blue-600/5" : "bg-blue-600/10"
            )} />
            
            <button 
              onClick={() => {
                setShowPremiumModal(false);
                setSelectedPlan(null);
                setTransactionId('');
                setScreenshot(null);
              }} 
              className={cn(
                "absolute top-4 right-4 p-2 transition-colors z-50 rounded-full",
                selectedPlan ? "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100" : "text-zinc-500 hover:text-white hover:bg-white/10"
              )}
            >
              <X className="w-6 h-6" />
            </button>

            {!selectedPlan ? (
              <div className="space-y-6 relative z-10">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Crown className="w-7 h-7 text-blue-500" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight">Unlock Premium</h2>
                  <p className="text-zinc-400 text-xs">Choose a plan to continue watching</p>
                </div>

                <div className="space-y-3">
                  {PLANS.map((plan) => {
                    const priceData = plan.prices[countryCode as keyof typeof plan.prices] || plan.prices.DEFAULT;
                    return (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className="w-full group relative flex items-center justify-between p-4 bg-zinc-800/30 border border-zinc-700/30 rounded-2xl hover:border-blue-500/50 hover:bg-zinc-800/50 transition-all text-left"
                      >
                        <div className="space-y-0.5">
                          <h3 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors">{plan.name}</h3>
                          <p className="text-[10px] text-zinc-500 font-medium">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-black text-white">{priceData.symbol}{priceData.amount}</p>
                          <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">/{priceData.duration}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20 rotate-3 mb-2">
                    <CreditCard className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-zinc-900">Complete Payment</h2>
                  <p className="text-zinc-500 text-xs">Plan: <span className="text-blue-600 font-bold">{selectedPlan.name}</span></p>
                </div>

                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 space-y-5">
                  {/* Payment Details at the Top */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-wider">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      {PAYMENT_METHODS[countryCode]?.method || PAYMENT_METHODS.DEFAULT.method} Details
                    </div>
                    <div className="p-4 bg-white rounded-xl border border-zinc-200 space-y-2 shadow-sm">
                      <div className="text-lg font-black text-zinc-900 select-all text-center tracking-tight">
                        {PAYMENT_METHODS[countryCode]?.details || PAYMENT_METHODS.DEFAULT.details}
                      </div>
                      <div className="text-center space-y-0.5">
                        <p className="text-[10px] text-zinc-500 font-bold">Account: {PAYMENT_METHODS[countryCode]?.name || PAYMENT_METHODS.DEFAULT.name}</p>
                        <p className="text-[9px] text-blue-600 italic">{PAYMENT_METHODS[countryCode]?.instruction || PAYMENT_METHODS.DEFAULT.instruction}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-200" />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Amount to Pay</p>
                      <p className="text-2xl font-black text-zinc-900">
                        {(selectedPlan.prices[countryCode as keyof typeof selectedPlan.prices] || selectedPlan.prices.DEFAULT).symbol}
                        {(selectedPlan.prices[countryCode as keyof typeof selectedPlan.prices] || selectedPlan.prices.DEFAULT).amount}
                      </p>
                    </div>
                    <div className="text-right space-y-0.5">
                      <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Region</p>
                      <div className="flex items-center justify-end gap-1.5 text-zinc-900 font-bold text-sm">
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        {countryCode}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">Upload Payment Screenshot</label>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="screenshot-upload-details"
                      />
                      <label 
                        htmlFor="screenshot-upload-details"
                        className="flex flex-col items-center justify-center w-full h-40 bg-white border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:border-blue-600 transition-all overflow-hidden shadow-sm"
                      >
                        {screenshot ? (
                          <img src={screenshot} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-zinc-400">
                            <div className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center">
                              <Upload className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-bold">Select Payment Photo</span>
                          </div>
                        )}
                      </label>
                      {screenshot && (
                        <button 
                          onClick={() => setScreenshot(null)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white shadow-lg hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => setSelectedPlan(null)}
                    className="flex-1 py-4 rounded-2xl font-black text-sm bg-zinc-100 hover:bg-zinc-200 text-zinc-900 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    disabled={isSubmitting || !screenshot}
                    onClick={handleSubmitRequest}
                    className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                      <>
                        Submit Payment Request
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
