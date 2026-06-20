import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, GraduationCap, UserCheck, Star } from 'lucide-react';

export default function WhoIsItFor() {
  const criteria = [
    {
      icon: <Calendar className="w-6 h-6 text-gold-main" />,
      label: 'Age Group',
      value: '18 - 27 Years',
      detail: 'Aspiring candidates who fall within the standard aviation recruitment age window.'
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-sky-light" />,
      label: 'Education',
      value: 'Minimum 12th Pass',
      detail: 'Open to high school graduates, diploma holders, and college students/graduates.'
    },
    {
      icon: <UserCheck className="w-6 h-6 text-gold-main" />,
      label: 'Gender Focus',
      value: 'Female Candidates',
      detail: 'Designed specifically to empower and train young women for premium airline positions.'
    },
    {
      icon: <Star className="w-6 h-6 text-sky-light" />,
      label: 'Career Goal',
      value: 'Aviation Aspirant',
      detail: 'Interested in Cabin Crew, Air Hostess, Ground Staff, or Airport Customer Operations.'
    }
  ];

  return (
    <section id="eligibility" className="py-20 bg-navy-medium/20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Who Can Participate?
          </h2>
          <p className="text-slate-300 font-light text-base sm:text-lg">
            This demand validation survey is open to female candidates from all Indian states who fit the standard basic airline eligibility criteria.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteria.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 flex flex-col items-center text-center hover:border-sky-light/20 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-navy-medium/40 border border-white/10 flex items-center justify-center mb-6">
                {item.icon}
              </div>
              
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {item.label}
              </span>
              
              <h3 className="font-display text-xl font-bold text-white mb-3">
                {item.value}
              </h3>
              
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                {item.detail}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
