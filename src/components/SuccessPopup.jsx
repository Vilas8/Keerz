import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, CheckCircle2, MapPin, Calendar, Clock, Printer, X } from 'lucide-react';

export default function SuccessPopup({ leadData, onClose }) {
  const [takeoffActive, setTakeoffActive] = useState(false);

  useEffect(() => {
    // Trigger plane animation shortly after popup loads
    const timer = setTimeout(() => {
      setTakeoffActive(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!leadData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-dark/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10">
        
        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-2xl w-full bg-slate-900 border border-gold-main/40 rounded-3xl overflow-hidden shadow-2xl"
        >
          
          {/* Close button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Banner */}
          <div className="bg-gradient-to-r from-navy-dark to-navy-medium p-8 text-center relative overflow-hidden border-b border-gold-main/20">
            {/* Takeoff aircraft silhouette */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-10 flex items-center justify-center">
              <Plane className="w-64 h-64 text-white -rotate-12" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              
              {/* Checkmark icon with pulsing border */}
              <div className="w-16 h-16 rounded-full bg-sky-main/10 border border-sky-light/40 flex items-center justify-center mb-4 shadow-lg shadow-sky-main/5">
                <CheckCircle2 className="w-9 h-9 text-sky-light" />
              </div>

              <span className="text-[10px] tracking-[0.25em] font-mono text-gold-main font-bold uppercase mb-1">
                Interest List Confirmed
              </span>
              
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Thank You for Your Feedback!
              </h3>
              
              <p className="text-slate-300 font-light text-sm max-w-lg leading-relaxed">
                Your response helps us understand where aspiring aviation professionals are located and how we can build the right training programs. We will notify you when training launches in your preferred city.
              </p>
            </div>
          </div>

          {/* PRINTABLE BOARDING TICKET */}
          <div className="p-6 sm:p-8 bg-slate-900">
            
            {/* The Ticket Body */}
            <div 
              id="printable-boarding-ticket"
              className="bg-white text-navy-dark p-6 rounded-2xl border-2 border-dashed border-slate-300 relative overflow-hidden select-none"
            >
              {/* Perforation Left & Right indicators */}
              <div className="absolute -left-3 top-[55%] w-6 h-6 rounded-full bg-slate-900 border border-slate-300" />
              <div className="absolute -right-3 top-[55%] w-6 h-6 rounded-full bg-slate-900 border border-slate-300" />

              {/* Ticket Top bar */}
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 text-sky-main transform -rotate-45" />
                  <span className="font-display font-black text-sm tracking-wider text-navy-dark">
                    KEERZ ACADEMY
                  </span>
                </div>
                <div className="text-right text-[10px] font-mono font-bold text-slate-400">
                  BOARDING SURVEY PASS
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 text-left mb-6">
                
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Passenger Name
                  </span>
                  <span className="text-sm font-bold text-navy-dark block truncate">
                    {leadData.full_name}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Contact Number
                  </span>
                  <span className="text-sm font-semibold text-navy-dark block">
                    {leadData.mobile}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Training City
                  </span>
                  <span className="text-sm font-bold text-sky-main flex items-center gap-0.5 truncate">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {leadData.preferred_training_city}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    State
                  </span>
                  <span className="text-sm font-semibold text-navy-dark block truncate">
                    {leadData.state}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Age Group
                  </span>
                  <span className="text-sm font-semibold text-navy-dark flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {leadData.age_group} Yrs
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Join Timeline
                  </span>
                  <span className="text-sm font-bold text-gold-dark flex items-center gap-1 truncate">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-gold-dark" />
                    {leadData.joining_timeline.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Mode
                  </span>
                  <span className="text-sm font-bold text-navy-dark block">
                    {leadData.training_mode}
                  </span>
                </div>

                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    Seat Assign
                  </span>
                  <span className="text-sm font-mono font-bold text-emerald-600 block">
                    #{(leadData.seriousness_score || 5)}A-LEAD
                  </span>
                </div>

              </div>

              {/* Perforation spacer */}
              <div className="h-0 border-t border-dashed border-slate-200 my-4" />

              {/* Bottom bar with barcode and flight details */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-left font-mono text-[9px] text-slate-400 leading-tight">
                  <div>TICKET NO: TK-{Math.floor(10000000 + Math.random() * 90000000)}</div>
                  <div>SURVEY CREATED: {new Date(leadData.created_at || Date.now()).toLocaleDateString('en-IN')}</div>
                </div>

                {/* Micro takeoff animation */}
                <div className="relative w-12 h-6 flex items-center overflow-hidden">
                  <Plane 
                    className={`w-5 h-5 text-gold-dark transform -rotate-12 transition-all duration-1000 ${takeoffActive ? 'translate-x-12 -translate-y-6 opacity-0' : 'translate-x-0'}`} 
                  />
                </div>

                <div className="flex items-center gap-0.5 bg-black/5 p-1.5 rounded h-8 overflow-hidden select-none shrink-0">
                  {[1,3,2,1,4,1,2,3,1,2,1,4,2,1,3,1,1,2,4,1,2,1,3].map((width, idx) => (
                    <div key={idx} className="bg-black h-full shrink-0" style={{ width: `${width}px` }} />
                  ))}
                </div>
              </div>

            </div>

            {/* Print action buttons */}
            <div className="flex items-center justify-center gap-4 mt-8 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-navy-medium border border-white/10 text-white font-medium hover:bg-navy-light transition-all duration-200 text-sm cursor-pointer"
              >
                <Printer className="w-4 h-4 text-sky-light" />
                <span>Print Ticket</span>
              </button>
              
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
              >
                Done
              </button>
            </div>

          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
