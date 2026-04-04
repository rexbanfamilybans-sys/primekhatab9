import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

interface AdComponentProps {
  type: 'popup';
  id?: string;
}

export const AdComponent: React.FC<AdComponentProps> = ({ type, id }) => {
  const { userData } = useAuth();
  const isPremium = userData?.subscription_status === 'active' || userData?.role === 'admin';

  useEffect(() => {
    if (isPremium) return;

    if (type === 'popup') {
      const script = document.createElement('script');
      script.src = 'https://pl29057229.profitablecpmratenetwork.com/4e/94/76/4e9476ec6ff715b6c34a5b897658330f.js';
      script.async = true;
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [isPremium, type]);

  if (isPremium || type === 'popup') return null;

  return (
    <div 
      id={id}
      className="flex justify-center items-center w-full overflow-hidden min-h-[60px] my-4"
    />
  );
};
