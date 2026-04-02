import React from 'react';
import { PLANS } from '../constants';
import { Check, ShieldCheck, Zap, Star, Globe, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export const AdminPlans: React.FC = () => {
  return (
    <div className="space-y-8 py-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black tracking-tight">Subscription Plans</h1>
        <div className="flex items-center gap-2 text-blue-400 bg-blue-500/10 px-4 py-2 rounded-xl w-fit border border-blue-500/20">
          <Info className="w-4 h-4" />
          <p className="text-xs font-bold uppercase tracking-wider">System Managed Plans</p>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <p className="text-zinc-400 text-sm leading-relaxed">
          Plans are currently managed via the <code className="text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">constants.ts</code> file to support complex multi-country pricing (India, Pakistan, Bangladesh) and manual payment verification. 
          To change prices or benefits, please update the system configuration.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <div key={plan.id} className={cn(
            "bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6 relative group transition-all duration-500 hover:border-blue-500/30",
            plan.id === 'vip' && "border-blue-500/50 shadow-2xl shadow-blue-600/10"
          )}>
            <div className="space-y-4">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center",
                plan.id === 'vip' ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
              )}>
                {plan.id === 'garib_pro_max' ? <Zap className="w-6 h-6" /> : plan.id === 'vip' ? <Crown className="w-6 h-6" /> : <Star className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-2xl font-black">{plan.name}</h3>
                <p className="text-zinc-500 text-xs mt-1 font-medium">{plan.description}</p>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Regional Pricing</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(plan.prices).map(([country, data]: [string, any]) => (
                    <div key={country} className="bg-black/40 p-2 rounded-lg border border-zinc-800/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <Globe className="w-3 h-3 text-blue-500" />
                        <span className="text-[10px] font-bold text-zinc-400">{country}</span>
                      </div>
                      <p className="text-sm font-black text-white">{data.symbol}{data.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Included Benefits</p>
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-4 h-4 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 text-blue-500" />
                  </div>
                  <span className="text-zinc-400 text-xs font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Crown = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);
