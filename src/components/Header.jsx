import React from 'react';
import { Plane, BarChart3, HelpCircle, Award, CheckCircle } from 'lucide-react';

export default function Header({ currentTab, setCurrentTab, scrollToSection }) {
  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 py-3 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => {
            setCurrentTab('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-navy-medium to-sky-main border border-gold-main/30 shadow-lg group-hover:border-gold-main/70 transition-all duration-300">
            <Plane className="w-5 h-5 text-gold-main group-hover:rotate-12 transition-transform duration-300" />
            <div className="absolute inset-0 rounded-full bg-gold-main/10 animate-ping opacity-25 group-hover:opacity-40" />
          </div>
          <div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-wider text-white flex items-center gap-1">
              KEERZ<span className="text-gold-main font-normal"> AVIATION</span>
            </span>
            <span className="block text-[9px] uppercase tracking-[0.2em] text-sky-light/80 font-semibold -mt-1">
              Academy Initiative
            </span>
          </div>
        </div>

        {/* Navigation - Landing Page anchor links */}
        {currentTab === 'landing' && (
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-slate-300">
            <button 
              onClick={() => scrollToSection('about')} 
              className="hover:text-gold-main transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <HelpCircle className="w-4 h-4 text-sky-light/75" /> Why Survey
            </button>
            <button 
              onClick={() => scrollToSection('eligibility')} 
              className="hover:text-gold-main transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4 text-sky-light/75" /> Eligibility
            </button>
            <button 
              onClick={() => scrollToSection('skills')} 
              className="hover:text-gold-main transition-colors duration-200 cursor-pointer flex items-center gap-1"
            >
              <Award className="w-4 h-4 text-sky-light/75" /> Future Curriculum
            </button>
            <button 
              onClick={() => scrollToSection('survey')} 
              className="px-4 py-1.5 rounded-full bg-sky-main/20 border border-sky-main/40 text-sky-light hover:bg-sky-main/35 hover:text-white transition-all duration-300 cursor-pointer"
            >
              ✈ Take Survey
            </button>
          </nav>
        )}

        {/* Dashboard Toggle */}
        <div className="flex items-center gap-2">
          {currentTab === 'landing' ? (
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 rounded-lg bg-gradient-to-r from-gold-dark/85 to-gold-main/85 text-navy-dark text-xs sm:text-sm font-bold shadow-md hover:from-gold-main hover:to-gold-light hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-gold-light/40 cursor-pointer group"
            >
              <BarChart3 className="w-4 h-4 group-hover:rotate-6 transition-transform" />
              <span>Research Dashboard</span>
              <span className="hidden sm:inline bg-navy-dark/10 text-navy-dark text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ml-1 animate-pulse">
                Data
              </span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('landing')}
              className="flex items-center gap-2 px-3.5 py-2 sm:px-4 rounded-lg bg-white/5 border border-white/10 text-white text-xs sm:text-sm font-semibold hover:bg-white/10 hover:border-sky-light/40 transition-all duration-200 cursor-pointer"
            >
              ✈ Back to Landing Page
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
