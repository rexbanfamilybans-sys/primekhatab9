import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { MessageSquare, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface SupportConfig {
  telegram: string;
  whatsapp: string;
  enabled: boolean;
}

export const FloatingSupport: React.FC = () => {
  const [config, setConfig] = useState<SupportConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'support'), (doc) => {
      if (doc.exists()) {
        setConfig(doc.data() as SupportConfig);
      }
    }, (error) => {
      console.error("Firestore Error (Support):", error);
    });
    return () => unsub();
  }, []);

  if (!config || !config.enabled) return null;

  const hasTelegram = !!config.telegram;
  const hasWhatsapp = !!config.whatsapp;

  if (!hasTelegram && !hasWhatsapp) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col gap-3 mb-2">
            {hasWhatsapp && (
              <motion.a
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                href={config.whatsapp.startsWith('http') ? config.whatsapp : `https://wa.me/${config.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                title="WhatsApp Support"
              >
                <MessageSquare className="w-7 h-7" />
              </motion.a>
            )}
            {hasTelegram && (
              <motion.a
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: 0.05 }}
                href={config.telegram.startsWith('http') ? config.telegram : `https://t.me/${config.telegram}`}
                target="_blank"
                rel="noreferrer"
                className="w-14 h-14 bg-[#0088cc] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                title="Telegram Support"
              >
                <Send className="w-7 h-7" />
              </motion.a>
            )}
          </div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all active:scale-90",
          isOpen ? "bg-zinc-800 text-white rotate-90" : "bg-blue-600 text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
      </button>
    </div>
  );
};
