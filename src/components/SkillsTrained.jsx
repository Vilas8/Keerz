import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Sparkles, MessageSquare, Mic, 
  Briefcase, Plane, Compass, Award 
} from 'lucide-react';

export default function SkillsTrained() {
  const topics = [
    {
      icon: <User className="w-5 h-5 text-gold-main" />,
      title: 'Body Language & Posture',
      desc: 'Developing an elegant professional presence, graceful walk, and poise matching standard crew guidelines.'
    },
    {
      icon: <Sparkles className="w-5 h-5 text-sky-light" />,
      title: 'Grooming & Presentation',
      desc: 'Mastering luxury cosmetics application, hairstyle rules, deportment, and airline uniform presentation rules.'
    },
    {
      icon: <MessageSquare className="w-5 h-5 text-gold-main" />,
      title: 'Communication Skills',
      desc: 'Honing spoken English fluency, passive listening, voice modulation, and clear airline announcements.'
    },
    {
      icon: <Mic className="w-5 h-5 text-sky-light" />,
      title: 'Public Speaking & Confidence',
      desc: 'Overcoming stage-fright, addressing large passenger groups confidently, and resolving conflicts.'
    },
    {
      icon: <Briefcase className="w-5 h-5 text-gold-main" />,
      title: 'Interview Preparation',
      desc: 'Structured training for group discussions, mock panels, technical queries, and resume optimization.'
    },
    {
      icon: <Plane className="w-5 h-5 text-sky-light" />,
      title: 'Aviation Industry Knowledge',
      desc: 'Fundamentals of aircraft layouts, airport terminals, international time-zones, and airline terminology.'
    },
    {
      icon: <Compass className="w-5 h-5 text-gold-main" />,
      title: 'Career Guidance',
      desc: 'Mentoring by former cabin crew leaders, cabin recruitment alerts, and international carrier hiring maps.'
    },
    {
      icon: <Award className="w-5 h-5 text-sky-light" />,
      title: 'Personality Development',
      desc: 'Cultivating hospitality etiquette, empathy, stress tolerance, and elite customer services habits.'
    }
  ];

  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/5">
      
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold tracking-widest text-gold-main uppercase block mb-2">
          Academy Vision
        </span>
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
          Future Training Programs May Include
        </h2>
        <p className="text-slate-300 font-light text-base sm:text-lg">
          If launched, our comprehensive syllabus will focus on practical skill development and airline interview readiness.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="glass-panel p-6 rounded-xl border border-white/5 hover:border-gold-main/20 hover:bg-white/5 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-navy-dark flex items-center justify-center border border-white/10 mb-4 shadow-sm">
                {topic.icon}
              </div>
              <h3 className="text-base font-bold text-white mb-2 font-display">
                {topic.title}
              </h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed">
                {topic.desc}
              </p>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-medium tracking-wider">
              <span>MODULE 0{i + 1}</span>
              <span className="text-sky-light/60">FUTURE SYLLABUS</span>
            </div>
          </motion.div>
        ))}
      </div>

    </section>
  );
}
