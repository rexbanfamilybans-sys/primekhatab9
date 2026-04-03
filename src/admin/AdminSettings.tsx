import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { 
  Send, 
  Save, 
  Loader2, 
  Shield, 
  Bell, 
  MessageSquare,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export const AdminSettings: React.FC = () => {
  const { user, userData } = useAuth();
  const [config, setConfig] = useState<TelegramConfig>({
    botToken: '',
    chatId: '',
    enabled: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    const isAdmin = userData?.role === 'admin' || user?.email === 'mrkhatab112@gmail.com' || user?.email === 'admin@rex.com';
    if (!isAdmin) return;

    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'telegram');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setConfig(docSnap.data() as TelegramConfig);
        }
      } catch (error) {
        console.error("Error fetching telegram config:", error);
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [user, userData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'telegram'), config);
      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving telegram config:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!config.botToken || !config.chatId) {
      return toast.error("Please provide both Bot Token and Chat ID");
    }

    setTesting(true);
    try {
      const message = "ðŸ”¥ *sahidanime Admin Notification Test*\n\nYour Telegram bot is successfully connected! You will receive notifications for new purchase requests here.";
      const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'Markdown'
        })
      });

      const data = await response.json();
      if (data.ok) {
        toast.success("Test message sent! Check your Telegram.");
      } else {
        throw new Error(data.description || "Failed to send message");
      }
    } catch (error: any) {
      console.error("Telegram Test Error:", error);
      toast.error(`Test failed: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight">Platform Settings</h1>
        <p className="text-zinc-500">Configure notifications and system integrations</p>
      </div>

      <div className="grid gap-8">
        {/* Telegram Integration Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-[2.5rem] p-8 space-y-8"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Telegram Notifications</h2>
                <p className="text-sm text-zinc-500">Receive real-time alerts for transactions</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Bot Token</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="password"
                  placeholder="123456789:ABCdef..."
                  value={config.botToken}
                  onChange={(e) => setConfig({ ...config, botToken: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Chat ID</label>
              <div className="relative group">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="text"
                  placeholder="-100123456789"
                  value={config.chatId}
                  onChange={(e) => setConfig({ ...config, chatId: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-4 flex gap-4">
            <Bell className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-blue-500">How to set up?</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                1. Create a bot via <a href="https://t.me/BotFather" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">@BotFather <ExternalLink className="w-3 h-3" /></a> to get your token.<br />
                2. Add the bot to your group/channel or message it directly.<br />
                3. Get your Chat ID via <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5">@userinfobot <ExternalLink className="w-3 h-3" /></a>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Settings</>}
            </button>
            <button
              onClick={handleTest}
              disabled={testing || !config.botToken}
              className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {testing ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Test Connection</>}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
