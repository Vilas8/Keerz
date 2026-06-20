import React from 'react';
import { motion } from 'framer-motion';
import { Plane, MapPin, Sparkles, Navigation } from 'lucide-react';

export default function Hero({ onCtaClick }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-white/5">
      
      {/* Background Animated Flight Path Lines */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 1440 600" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Curved path 1 */}
          <path 
            d="M-100,450 C300,400 500,100 1000,150 C1200,170 1400,350 1600,300" 
            stroke="url(#skyGradient)" 
            strokeWidth="2" 
            strokeDasharray="8 8"
          />
          {/* Curved path 2 */}
          <path 
            d="M-50,150 C400,250 800,50 1200,450" 
            stroke="url(#goldGradient)" 
            strokeWidth="1.5" 
            strokeDasharray="6 6"
          />
          {/* Gradients */}
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00cec9" />
              <stop offset="100%" stopColor="#079992" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#F3E5AB" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating Aircraft SVG that drifts */}
        <div className="absolute top-[20%] left-[10%] animate-float" style={{ animationDuration: '8s' }}>
          <Plane className="w-8 h-8 text-sky-light/30 transform rotate-[15deg]" />
        </div>
        <div className="absolute bottom-[30%] right-[15%] animate-float" style={{ animationDuration: '12s' }}>
          <Plane className="w-12 h-12 text-gold-light/20 transform rotate-[-25deg]" />
        </div>
      </div>

      {/* Cloud Particle Overlays */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-navy-dark to-transparent z-1 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto text-center">
        
        {/* Little badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full glass-panel-light border-gold-main/20 text-gold-main text-xs font-semibold tracking-wider uppercase mb-6 sm:mb-8"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-main animate-pulse" />
          <span>India-Wide Market Research Survey</span>
        </motion.div>

        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
        >
          Dreaming of Becoming a <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-light via-white to-gold-light font-display">
            Cabin Crew Professional?
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-8 md:mb-12 px-2"
        >
          We are planning a specialized Cabin Crew & Aviation Career Training Program for aspiring women across India. 
          Help us understand your interest by completing this short survey. Your feedback will help us launch training programs 
          in the cities where aspiring aviation professionals need them the most.
        </motion.p>

        {/* CTA Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
        >
          <button 
            onClick={onCtaClick}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold text-lg shadow-xl shadow-gold-main/15 hover:shadow-gold-main/25 hover:from-gold-light hover:to-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] cursor-pointer animate-pulse-gold group"
          >
            <Plane className="w-5 h-5 text-navy-dark transform group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            <span>Join the Interest List</span>
          </button>
          
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium py-2">
            <MapPin className="w-4 h-4 text-sky-light" />
            <span>Targeting 15+ Cities Across India</span>
          </div>
        </motion.div>

        {/* Floating statistics panel (quick validation teaser) */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: 'Primary Target', value: 'Women (18-27)' },
            { label: 'Qualification', value: 'Min 12th Pass' },
            { label: 'Focus Areas', value: 'Grooming & Posture' },
            { label: 'Syllabus Focus', value: 'Interview Prep' }
          ].map((stat, i) => (
            <div key={i} className="glass-panel rounded-xl p-4 border border-white/5 shadow-md flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                {stat.label}
              </span>
              <span className="text-sm sm:text-base font-bold text-sky-light">
                {stat.value}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
