import Link from "next/link";
import { Check, Zap, Shield, Sparkles } from "lucide-react";

export default function PricingPage() {
  return (
    <main className="bg-space min-h-screen flex flex-col items-center pt-32 pb-24 px-6 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 text-center max-w-4xl mb-16 animate-fade-in-up">
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Simple pricing for <br />
          <span className="text-gradient-purple">serious job seekers.</span>
        </h1>
        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Start landing referrals for free. Upgrade to Pro when you are ready to accelerate your search and stand out.
        </p>
      </div>

      <div className="z-10 flex flex-col md:flex-row gap-8 w-full max-w-5xl justify-center items-stretch relative">
        
        {/* Starter Plan */}
        <div className="flex-1 glass-panel p-10 rounded-3xl border-t-4 border-text-muted hover:-translate-y-2 transition-transform duration-300 relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Shield className="text-text-muted" size={24} />
              Starter
            </h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-text-primary leading-none">$0</span>
              <span className="text-text-muted font-semibold">/forever</span>
            </div>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Perfect for getting started and exploring the referral network.
            </p>
            <Link href="/register" className="btn-secondary w-full justify-center mb-8 border border-glass-border bg-white/5 hover:bg-white/10 text-lg py-4">
              Get Started Free
            </Link>
            <ul className="space-y-4 text-text-secondary">
              <li className="flex gap-3 items-center"><Check size={20} className="text-text-muted" /> <span>1 Referral Request per month</span></li>
              <li className="flex gap-3 items-center"><Check size={20} className="text-text-muted" /> <span>Basic AI Resume Parsing</span></li>
              <li className="flex gap-3 items-center"><Check size={20} className="text-text-muted" /> <span>Standard Support</span></li>
            </ul>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="flex-1 glass-panel p-10 rounded-3xl border-t-4 border-primary hover:-translate-y-2 transition-transform duration-300 relative group overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-primary to-primary-hover text-white px-6 py-1.5 rounded-full text-xs font-black tracking-widest shadow-lg shadow-primary/40 z-20 flex items-center gap-2">
            <Sparkles size={14} />
            MOST POPULAR
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2">
              <Zap className="text-primary" size={24} />
              Pro
            </h3>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-6xl font-black text-text-primary leading-none">$19</span>
              <span className="text-text-muted font-semibold">/month</span>
            </div>
            <p className="text-text-secondary mb-8 leading-relaxed">
              Maximize your chances with priority matching and advanced AI tools.
            </p>
            
            <form action="/api/checkout" method="POST" className="mb-8">
              <button type="submit" className="btn-primary w-full justify-center text-lg py-4 group/btn relative overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">Upgrade to Pro <Zap size={18} className="group-hover/btn:animate-pulse" /></span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary-hover to-primary opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
              </button>
            </form>

            <ul className="space-y-4 text-text-secondary">
              <li className="flex gap-3 items-center"><Check size={20} className="text-primary-light" /> <span className="font-medium text-text-primary">10 Referral Requests per month</span></li>
              <li className="flex gap-3 items-center"><Check size={20} className="text-primary-light" /> <span>Priority Placement to Referrers</span></li>
              <li className="flex gap-3 items-center"><Check size={20} className="text-primary-light" /> <span>Advanced AI Cover Letter Generator</span></li>
              <li className="flex gap-3 items-center"><Check size={20} className="text-primary-light" /> <span>Profile Analytics (See who viewed)</span></li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
