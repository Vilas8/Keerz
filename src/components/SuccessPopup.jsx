import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, CheckCircle2, MapPin, Calendar, Clock, Printer, X, Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { sendEmails } from '../utils/emailService';

// Helper configuration for html2canvas-pro to handle inline SVGs and oklch styles correctly
const getHtml2CanvasConfig = (ticketElement) => ({
  scale: 2,
  backgroundColor: '#ffffff',
  useCORS: true,
  allowTaint: false,
  logging: false,
  width: 650,
  scrollX: 0,
  scrollY: 0,
  windowWidth: 1024,
  onclone: (clonedDoc) => {
    const ticketClone = clonedDoc.getElementById('printable-boarding-ticket');
    if (!ticketClone) return;

    // Force a stable desktop dimensions in the cloned document
    ticketClone.style.width = '650px';
    ticketClone.style.minWidth = '650px';
    ticketClone.style.height = 'auto';
    ticketClone.style.position = 'relative';

    const originalSvgs = ticketElement.querySelectorAll('svg');
    const clonedSvgs = ticketClone.querySelectorAll('svg');

    clonedSvgs.forEach((clonedSvg, index) => {
      const originalSvg = originalSvgs[index];
      if (!originalSvg) return;

      const rect = originalSvg.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(originalSvg);

      // Force explicit dimensions for SVG element rendering
      clonedSvg.setAttribute('width', rect.width || 20);
      clonedSvg.setAttribute('height', rect.height || 20);
      clonedSvg.style.width = `${rect.width || 20}px`;
      clonedSvg.style.height = `${rect.height || 20}px`;

      // Copy fill and stroke styles directly inline to override oklch or class variables
      if (computedStyle.stroke && computedStyle.stroke !== 'none') {
        clonedSvg.style.stroke = computedStyle.stroke;
      }
      if (computedStyle.fill && computedStyle.fill !== 'none') {
        clonedSvg.style.fill = computedStyle.fill;
      }

      // Reset flight airplane takeoff animation to keep it static and visible
      if (clonedSvg.classList.contains('text-gold-dark')) {
        clonedSvg.style.opacity = '1';
        clonedSvg.style.transform = 'rotate(-12deg)';
        clonedSvg.style.transition = 'none';
      } else {
        const originalTransform = computedStyle.transform;
        if (originalTransform && originalTransform !== 'none') {
          clonedSvg.style.transform = originalTransform;
        }
      }
    });
  }
});

export default function SuccessPopup({ leadData, onClose }) {
  const [takeoffActive, setTakeoffActive] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [ticketImage, setTicketImage] = useState(null);
  const [ticketBlob, setTicketBlob] = useState(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailStatus, setEmailStatus] = useState('generating');
  const [emailErrorMsg, setEmailErrorMsg] = useState(null);

  useEffect(() => {
    // Trigger plane animation shortly after popup loads
    const timer = setTimeout(() => {
      setTakeoffActive(true);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Dispatch automated candidate and admin emails immediately on mount
    setEmailSent((prev) => {
      if (!prev) {
        setEmailStatus('sending');
        sendEmails(leadData)
          .then((res) => {
            if (res.success) {
              setEmailStatus('sent');
            } else {
              setEmailStatus('failed');
              setEmailErrorMsg(res.error || 'Server SMTP dispatch error.');
            }
          })
          .catch((err) => {
            setEmailStatus('failed');
            setEmailErrorMsg(err.message || 'Network error sending emails.');
          });
        return true;
      }
      return prev;
    });
  }, [leadData]);

  useEffect(() => {
    // Pre-generate the ticket image in the background for instant download/share
    const generateTicket = async () => {
      const ticketElement = document.getElementById('printable-boarding-ticket');
      if (!ticketElement) return;

      try {
        // Wait a small duration to ensure rendering is complete and fonts are loaded
        await new Promise(r => setTimeout(r, 800));
        
        const html2canvasFn = html2canvas.default || html2canvas;
        const canvas = await html2canvasFn(ticketElement, getHtml2CanvasConfig(ticketElement));

        const dataUrl = canvas.toDataURL('image/png');
        setTicketImage(dataUrl);

        canvas.toBlob((blob) => {
          if (blob) {
            setTicketBlob(blob);
          }
        }, 'image/png');
      } catch (err) {
        console.error('Failed to pre-generate ticket image in background:', err);
      }
    };

    generateTicket();
  }, []);

  if (!leadData) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateAndDownloadOnDemand = async () => {
    const ticketElement = document.getElementById('printable-boarding-ticket');
    if (!ticketElement) return;

    setDownloading(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const html2canvasFn = html2canvas.default || html2canvas;
      const canvas = await html2canvasFn(ticketElement, getHtml2CanvasConfig(ticketElement));
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `Keerz_Boarding_Pass_${leadData.full_name.replace(/\s+/g, '_')}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error generating PNG ticket on demand:', err);
    } finally {
      setDownloading(false);
    }
  };

  const generateAndShareOnDemand = async () => {
    const ticketElement = document.getElementById('printable-boarding-ticket');
    if (!ticketElement) return;

    setSharing(true);
    try {
      await new Promise(r => setTimeout(r, 100));
      const html2canvasFn = html2canvas.default || html2canvas;
      const canvas = await html2canvasFn(ticketElement, getHtml2CanvasConfig(ticketElement));
      
      canvas.toBlob(async (blob) => {
        if (!blob) {
          setSharing(false);
          return;
        }
        await shareBlob(blob);
      }, 'image/png');
    } catch (err) {
      console.error('Sharing failed on demand:', err);
      setSharing(false);
    }
  };

  const shareBlob = async (blob) => {
    try {
      const file = new File([blob], `Keerz_Aviation_Boarding_Pass.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Keerz Aviation Academy Boarding Pass',
          text: `I just registered my interest in the future Keerz Cabin Crew Academy! Preferred Training City: ${leadData.preferred_training_city} ✈️ Join the interest list now!`
        });
      } else if (navigator.share) {
        await navigator.share({
          title: 'Keerz Aviation Academy',
          text: `I just registered my interest in the future Keerz Cabin Crew Academy! Preferred Training City: ${leadData.preferred_training_city} ✈️ Join the interest list now!`,
          url: window.location.origin
        });
      } else {
        const shareText = encodeURIComponent(`I just registered my interest in the future Keerz Cabin Crew Academy! Preferred Training City: ${leadData.preferred_training_city} ✈️ Join here: ${window.location.origin}`);
        window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
      }
    } catch (shareErr) {
      console.warn('Web Share failed, attempting fallback:', shareErr);
      const shareText = encodeURIComponent(`I just registered my interest in the future Keerz Cabin Crew Academy! Preferred Training City: ${leadData.preferred_training_city} ✈️`);
      window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
    } finally {
      setSharing(false);
    }
  };

  const downloadTicketPng = async () => {
    if (!ticketImage && !ticketBlob) {
      await generateAndDownloadOnDemand();
      return;
    }

    try {
      const url = ticketImage || URL.createObjectURL(ticketBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Keerz_Boarding_Pass_${leadData.full_name.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (!ticketImage && ticketBlob) {
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Error downloading PNG ticket:', err);
    }
  };

  const shareTicket = async () => {
    if (!ticketBlob) {
      await generateAndShareOnDemand();
      return;
    }

    setSharing(true);
    await shareBlob(ticketBlob);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-dark/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-10 print-container">
        
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
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors cursor-pointer z-20 print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Success Banner */}
          <div className="bg-gradient-to-r from-navy-dark to-navy-medium p-8 text-center relative overflow-hidden border-b border-gold-main/20 print:hidden">
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

              {/* Email delivery status badge */}
              <div className={`mt-2 mb-4 px-4 py-1.5 rounded-full text-[11px] font-semibold border flex items-center gap-2 transition-all duration-300 ${
                emailStatus === 'generating' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                emailStatus === 'sending' ? 'bg-sky-500/10 border-sky-500/20 text-sky-400' :
                emailStatus === 'sent' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}>
                {emailStatus === 'generating' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Ticket Image...</span>
                  </>
                )}
                {emailStatus === 'sending' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Confirmation Emails...</span>
                  </>
                )}
                {emailStatus === 'sent' && (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Emails Delivered Successfully!</span>
                  </>
                )}
                {emailStatus === 'failed' && (
                  <span className="text-left text-[10px] leading-tight max-w-md break-all">
                    Email Failed: {emailErrorMsg || 'Check SMTP Credentials'}
                  </span>
                )}
              </div>

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

            {/* Print / Save / Share action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8 print:hidden w-full">
              
              <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-navy-medium border border-white/10 text-white font-medium hover:bg-navy-light transition-all duration-200 text-xs sm:text-sm cursor-pointer w-full sm:w-auto"
                >
                  <Printer className="w-4 h-4 text-sky-light" />
                  <span>Print Ticket</span>
                </button>

                <button
                  onClick={downloadTicketPng}
                  disabled={downloading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-navy-medium border border-white/10 text-white font-medium hover:bg-navy-light transition-all duration-200 text-xs sm:text-sm cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-sky-light" />
                  ) : (
                    <Download className="w-4 h-4 text-sky-light" />
                  )}
                  <span>Save Image</span>
                </button>

                <button
                  onClick={shareTicket}
                  disabled={sharing}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-navy-medium border border-white/10 text-white font-medium hover:bg-navy-light transition-all duration-200 text-xs sm:text-sm cursor-pointer disabled:opacity-50 w-full sm:w-auto"
                >
                  {sharing ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gold-main" />
                  ) : (
                    <Share2 className="w-4 h-4 text-gold-main" />
                  )}
                  <span>Share Pass</span>
                </button>
              </div>
              
              <button
                onClick={onClose}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs sm:text-sm cursor-pointer w-full sm:w-auto shrink-0"
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
