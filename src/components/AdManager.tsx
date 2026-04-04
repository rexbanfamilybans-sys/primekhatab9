import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export const AdManager: React.FC = () => {
  const { userData } = useAuth();
  const isPremium = userData?.subscription_status === 'active';

  useEffect(() => {
    // If user is premium, don't load any ads
    if (isPremium) return;

    // 1. Social Bar / Popunder Scripts
    const scripts = [
      'https://pl29055712.profitablecpmratenetwork.com/6a/74/c0/6a74c00222eb36e9b4ca20417c22916c.js',
      'https://pl29055682.profitablecpmratenetwork.com/19/79/4f/19794f46e4799aa3f6ac93ae4ff4fd87.js'
    ];

    const scriptElements: HTMLScriptElement[] = [];

    scripts.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
      scriptElements.push(script);
    });

    // 2. Native Banner / Container Script
    const nativeScript = document.createElement('script');
    nativeScript.src = 'https://pl29055710.profitablecpmratenetwork.com/c1aee88fc648fa4a6774370858ee2983/invoke.js';
    nativeScript.async = true;
    nativeScript.setAttribute('data-cfasync', 'false');
    document.head.appendChild(nativeScript);
    scriptElements.push(nativeScript);

    return () => {
      // Cleanup scripts when component unmounts or user becomes premium
      scriptElements.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [isPremium]);

  return null;
};
