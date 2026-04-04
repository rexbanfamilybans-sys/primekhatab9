import React, { useState, useRef, useEffect } from 'react';
import { collection, query, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles, Play, Search, List } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  content: React.ReactNode;
}

export const AIChatbot: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      content: 'Hello! I am your SahidAnime Assistant. I can help you find anime and play episodes directly from our database. Try searching for an anime or asking for a list!' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSearchAnime = async (searchTerm: string) => {
    try {
      const q = query(collection(db, 'anime'), limit(50));
      const snapshot = await getDocs(q);
      const allAnime = snapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
      
      const filtered = allAnime.filter(a => 
        a.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      return filtered;
    } catch (error) {
      console.error("Search Error:", error);
      return [];
    }
  };

  const handleListAllAnime = async () => {
    try {
      const q = query(collection(db, 'anime'), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, title: doc.data().title }));
    } catch (error) {
      return [];
    }
  };

  const handleGetEpisodes = async (animeId: string) => {
    try {
      const q = query(collection(db, `anime/${animeId}/episodes`), orderBy('order', 'asc'), limit(100));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        title: doc.data().title, 
        order: doc.data().order,
        access: doc.data().accessType 
      }));
    } catch (error) {
      return [];
    }
  };

  const handleGetPlans = async () => {
    try {
      const q = query(collection(db, 'plans'), orderBy('price', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        price: doc.data().price,
        duration: doc.data().duration
      }));
    } catch (error) {
      return [];
    }
  };

  const processCommand = async (text: string) => {
    const lowerText = text.toLowerCase();
    
    // 1. HELP / HELLO / HEY
    if (lowerText.includes('help') || lowerText === 'hi' || lowerText === 'hello' || lowerText === 'hey' || lowerText === 'hy') {
      const plans = await handleGetPlans();
      const plansText = plans.length > 0 
        ? plans.map(p => `${p.name}: ₹${p.price}/${p.duration}`).join(', ')
        : "Contact support for plans";

      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-bold text-blue-400">Sahid's ChatBot</p>
            <p className="text-xs leading-relaxed">
              Assalamu alaikum wa rahmatullahi wa barakatuh (aap par Salamati ho, The God aap par Rehmat Barkat banae rakhen). Qna Video Dekha? WhatsApp channel join kiya? nehi to pahle join karo.
            </p>
          </div>
          
          <div className="space-y-1 text-xs">
            <a href="https://whatsapp.com/channel/0029Vahd4QT9Gv7M1esnDz46" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">WhatsApp Channel</a>
            <a href="https://youtu.be/Ib5Hoi2r598" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline block">QNA Video</a>
          </div>

          <div className="p-2 bg-zinc-800/50 rounded-xl border border-zinc-700/50 text-xs">
            <p className="font-bold text-zinc-300 mb-1">Plans:</p>
            <p className="text-zinc-400">{plansText}</p>
          </div>

          <div className="space-y-1 text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
            <a href="https://www.facebook.com/SahidAnime4u" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 block">Facebook Page</a>
            <a href="https://t.me/BTTH_HindiDub" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 block">Telegram Channel</a>
          </div>

          <div className="pt-2 border-t border-zinc-800">
            <p className="text-[10px] text-zinc-500 mb-1">Quick Commands:</p>
            <div className="flex flex-wrap gap-1">
              <button onClick={() => setInput('list all')} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[10px]">List All</button>
              <button onClick={() => setInput('search ')} className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 rounded-md text-[10px]">Search</button>
            </div>
          </div>
        </div>
      );
    }

    // 2. PREMIUM CONTENT / PAYMENT INFO (e.g. BTTH Episode 189)
    if (lowerText.includes('btth') && (lowerText.includes('189') || lowerText.includes('paid') || lowerText.includes('premium'))) {
      const plans = await handleGetPlans();
      const plansText = plans.length > 0 
        ? plans.map(p => `${p.name}: ₹${p.price}/${p.duration}`).join(', ')
        : "Contact support for plans";

      return (
        <div className="space-y-3">
          <p className="text-xs leading-relaxed">
            Aray bhai, maafi chahunga! 🙏 BTTH Episode 189 paid content hai. Mere paas direct links nahi hote hain, aur password bina payment ke provide nahi kar sakta.
          </p>
          <p className="text-xs leading-relaxed">
            Aaj ki date ke hisaab se, is mahine ka subscription sirf <span className="text-blue-400 font-bold">{plansText}</span> ka hai. Agar aap payment kar dete hain, toh main turant aapko access aur password de dunga!
          </p>
          <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-2xl space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Payment Details</p>
            <div className="space-y-1 text-xs">
              <p><span className="text-zinc-500">UPI ID:</span> btthhindidubmasala@okicici</p>
              <p><span className="text-zinc-500">UPI Number:</span> 8343830288</p>
              <p><span className="text-zinc-500">Name:</span> Sahid Anime 4 You</p>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 italic">
            Payment karne ke baad screenshot bhej dijiyega, phir main aapko link aur password de dunga.
          </p>
        </div>
      );
    }

    // 2. PLAY COMMAND
    if (lowerText.includes('play') || lowerText.includes('watch')) {
      const match = lowerText.match(/(?:play|watch)\s+(.*?)\s+episode\s+(\d+)/i);
      if (match) {
        const animeName = match[1].trim();
        const epNum = parseInt(match[2]);
        
        const results = await handleSearchAnime(animeName);
        if (results.length > 0) {
          const anime = results[0];
          navigate(`/anime/${anime.id}?episode=${epNum}`);
          return `Starting ${anime.title} Episode ${epNum} for you! Enjoy watching.`;
        }
        return `I couldn't find an anime named "${animeName}". Please check the spelling.`;
      }
      return "To play an episode, please use the format: 'play [anime name] episode [number]'";
    }

    // 3. LIST ALL
    if (lowerText.includes('list') || lowerText.includes('all anime') || lowerText.includes('available')) {
      const all = await handleListAllAnime();
      if (all.length === 0) return "No anime available yet.";
      return (
        <div className="space-y-2">
          <p className="font-bold text-blue-400">Available Anime ({all.length}):</p>
          <div className="grid grid-cols-1 gap-1">
            {all.map(a => (
              <button 
                key={a.id}
                onClick={() => setInput(`episodes of ${a.title}`)}
                className="text-left text-xs p-1.5 hover:bg-zinc-700 rounded transition-colors flex items-center gap-2"
              >
                <Play className="w-3 h-3 text-blue-500" />
                {a.title}
              </button>
            ))}
          </div>
        </div>
      );
    }

    // 4. EPISODES OF
    if (lowerText.includes('episode')) {
      const match = lowerText.match(/(?:episodes of|episodes for|show episodes)\s+(.*)/i);
      const animeName = match ? match[1].trim() : lowerText.replace('episodes', '').trim();
      
      const results = await handleSearchAnime(animeName);
      if (results.length > 0) {
        const anime = results[0];
        const episodes = await handleGetEpisodes(anime.id);
        if (episodes.length === 0) return `No episodes found for ${anime.title}.`;
        
        return (
          <div className="space-y-2">
            <p className="font-bold text-blue-400">Episodes for {anime.title}:</p>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
              {episodes.map(ep => (
                <button 
                  key={ep.id}
                  onClick={() => {
                    navigate(`/anime/${anime.id}?episode=${ep.order}`);
                  }}
                  className="w-full text-left text-xs p-2 hover:bg-zinc-700 rounded transition-colors flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Play className="w-3 h-3 text-zinc-500 group-hover:text-blue-500" />
                    Ep {ep.order}: {ep.title}
                  </span>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded uppercase font-bold",
                    ep.access === 'free' ? "bg-green-500/20 text-green-500" : "bg-amber-500/20 text-amber-500"
                  )}>
                    {ep.access}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      }
    }

    // 5. DEFAULT SEARCH
    const searchResults = await handleSearchAnime(lowerText.replace('search', '').trim());
    if (searchResults.length > 0) {
      return (
        <div className="space-y-2">
          <p>I found {searchResults.length} matching anime:</p>
          <div className="space-y-1">
            {searchResults.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-zinc-800/50 p-2 rounded-xl border border-zinc-700/50">
                <span className="text-sm font-medium">{a.title}</span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => setInput(`episodes of ${a.title}`)}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-blue-400 transition-colors"
                    title="View Episodes"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/anime/${a.id}`)}
                    className="p-1.5 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-green-400 transition-colors"
                    title="Go to Page"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return "I'm not sure what you mean. Try 'list all' or 'search [anime name]'.";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Simulate bot thinking
    setTimeout(async () => {
      const response = await processCommand(userMessage);
      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="w-[350px] sm:w-[400px] h-[500px] bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600/20 rounded-2xl flex items-center justify-center">
            <Bot className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">SahidAnime Assistant</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Database Linked</span>
            </div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-xl transition-colors text-zinc-500"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            key={i}
            className={cn(
              "flex gap-3 max-w-[90%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
              msg.role === 'user' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
            )}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shadow-lg">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-xs text-zinc-500 font-medium">Searching database...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search anime or type 'help'..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-zinc-200"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
};
