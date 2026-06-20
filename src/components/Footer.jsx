import React from 'react';
import { Plane, ShieldCheck, Mail, Globe } from 'lucide-react';

export default function Footer({ setCurrentTab, scrollToSection }) {
  return (
    <footer className="bg-slate-950 border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 mt-20 text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Branding block */}
        <div className="space-y-3">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => {
              setCurrentTab('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-medium border border-gold-main/20 text-gold-main">
              <Plane className="w-4 h-4 transform -rotate-45" />
            </div>
            <span className="font-display font-bold text-base tracking-wider text-white">
              AERO<span className="text-gold-main font-normal">AURA</span>
            </span>
          </div>
          
          <p className="text-xs font-light leading-relaxed">
            Harnessing interest parameters to design world-class Cabin Crew & Ground Support training experiences for aspiring female professionals in India.
          </p>
        </div>

        {/* Links block */}
        <div className="space-y-3 text-sm">
          <h4 className="font-semibold text-white uppercase tracking-wider text-xs">Aviation Initiative</h4>
          <div className="flex flex-col gap-2 font-light text-xs">
            <button 
              onClick={() => { setCurrentTab('landing'); setTimeout(() => scrollToSection('about'), 100); }} 
              className="text-left hover:text-white transition-colors cursor-pointer"
            >
              Why This Survey
            </button>
            <button 
              onClick={() => { setCurrentTab('landing'); setTimeout(() => scrollToSection('eligibility'), 100); }} 
              className="text-left hover:text-white transition-colors cursor-pointer"
            >
              Check Academy Eligibility
            </button>
            <button 
              onClick={() => { setCurrentTab('landing'); setTimeout(() => scrollToSection('skills'), 100); }} 
              className="text-left hover:text-white transition-colors cursor-pointer"
            >
              Future Course Framework
            </button>
            <button 
              onClick={() => { setCurrentTab('landing'); setTimeout(() => scrollToSection('survey'), 100); }} 
              className="text-left hover:text-white transition-colors cursor-pointer text-gold-main"
            >
              ✈ Fill Boarding Pass
            </button>
          </div>
        </div>

        {/* Disclaimer / Trust Block */}
        <div className="space-y-3 text-xs leading-relaxed font-light">
          <div className="flex items-center gap-1.5 text-white font-semibold">
            <ShieldCheck className="w-4 h-4 text-sky-light" />
            <span>Research Disclaimer</span>
          </div>
          <p className="text-[11px] text-slate-500">
            <strong>IMPORTANT:</strong> This landing page is part of an active feasibility study and market validation effort. It is NOT an official airline job application, recruitment drive, training admission portal, or enrollment agreement. Contact details and preferences gathered will be utilized exclusively to design future training programs.
          </p>
        </div>

      </div>

      {/* Underbar */}
      <div className="max-w-7xl mx-auto border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-600 gap-4">
        <div>
          &copy; {new Date().getFullYear()} AeroAura Academy Initiative. All Rights Reserved.
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> contact@aeroaura.org</span>
          <span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> India</span>
        </div>
      </div>
    </footer>
  );
}
