import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mail, ShieldAlert, X, Eye, EyeOff } from 'lucide-react';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    // Simulated secure check
    setTimeout(() => {
      if (email.trim() === 'keerthanatm2465@gmail.com' && password === 'admin') {
        onLoginSuccess();
        onClose();
      } else {
        setError('Invalid admin credentials. Access Denied.');
      }
      setLoading(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-navy-dark/85 backdrop-blur-md flex items-center justify-center p-4">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Heading */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-full bg-gold-main/10 border border-gold-main/20 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-5 h-5 text-gold-main" />
            </div>
            <h3 className="font-display text-xl font-bold text-white">Management Authorization</h3>
            <p className="text-slate-400 text-xs mt-1">
              Access to survey statistics is restricted to Keerz Academy administrators.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@keerz.in"
                  className="w-full pl-10 pr-4 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-gold-main transition-colors text-sm"
                />
              </div>
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Access Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-navy-dark/60 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-gold-main transition-colors text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-950/60 border border-red-500/20 text-red-200 text-xs">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}



            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-gold-main to-gold-light text-navy-dark font-bold text-sm rounded-xl shadow-lg hover:from-gold-light hover:to-white transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>

          </form>

        </motion.div>

      </div>
    </AnimatePresence>
  );
}
