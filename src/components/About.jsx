import React from 'react';
import { motion } from 'framer-motion';
import { Globe, BookOpen, Sparkles, ClipboardCheck } from 'lucide-react';

export default function About() {
  const cards = [
    {
      icon: <Globe className="w-6 h-6 text-gold-main" />,
      title: 'Career Opportunities',
      desc: 'Identifying regional talent hubs and guiding aspiring professionals towards global airline careers.'
    },
    {
      icon: <BookOpen className="w-6 h-6 text-sky-light" />,
      title: 'Industry-Focused Training',
      desc: 'Designing syllabus modules mapped to current premium airline training guidelines.'
    },
    {
      icon: <Sparkles className="w-6 h-6 text-gold-main" />,
      title: 'Confidence & Personality',
      desc: 'Shaping professional posture, body language, grooming, and elegant public presentation.'
    },
    {
      icon: <ClipboardCheck className="w-6 h-6 text-sky-light" />,
      title: 'Recruitment Preparation',
      desc: 'Equipping candidates for tough interview rounds, English speaking fluencies, and case studies.'
    }
  ];

  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Why We Are Conducting This Survey
        </h2>
        <p className="text-slate-300 font-light leading-relaxed text-base sm:text-lg">
          We are researching the demand for professional Cabin Crew and Air Hostess training programs across India. 
          Your responses will help us understand where aspiring aviation professionals are located, when they want 
          to start training, and what skills they want to develop.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-white/5 hover:border-gold-main/20 transition-all duration-300 group"
          >
            {/* Ambient background hover color */}
            <div className="absolute inset-0 bg-gradient-to-br from-sky-main/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Icon container */}
            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-white/10 border border-white/10 transition-colors duration-200">
              {card.icon}
            </div>

            <h3 className="text-lg font-bold text-white mb-2 font-display group-hover:text-gold-main transition-colors duration-200">
              {card.title}
            </h3>
            
            <p className="text-sm text-slate-400 font-light leading-relaxed">
              {card.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
