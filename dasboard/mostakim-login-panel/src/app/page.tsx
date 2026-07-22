'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Eye, EyeOff, Shield, AlertCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (!password.trim()) return triggerShake('Password is required.');

    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim() || undefined,
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) { triggerShake(data.error ?? 'Login failed.'); setLoading(false); return; }
      router.push('/otp');
    } catch {
      triggerShake('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <div className="blob w-[500px] h-[500px] bg-violet-700/25 top-[-100px] left-[-100px] animate-[blob_10s_infinite_alternate]" />
        <div className="blob w-[400px] h-[400px] bg-blue-600/20 bottom-[-80px] right-[-80px] animate-[blob_13s_infinite_alternate-reverse]" />
        <div className="blob w-[300px] h-[300px] bg-pink-600/10 top-[40%] left-[60%] animate-[blob_8s_infinite_alternate]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grad-border shadow-card">
          <div className="glass rounded-[25px] p-8 sm:p-10">

            {/* Logo & Branding */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                className="relative mb-5"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.4, type: 'spring', stiffness: 200 }}
              >
                <div className="absolute inset-0 rounded-full bg-violet-600/30 blur-xl scale-150" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-violet-500/40 shadow-glow">
                  <Image
                    src="/logo.png"
                    alt="MOSTAKIM DISCORD BOT Logo"
                    fill
                    sizes="80px"
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <h1 className="text-2xl font-extrabold grad-text tracking-tight mb-1">
                  MOSTAKIM DISCORD BOT
                </h1>
                <p className="text-[13px] text-white/40 font-medium uppercase tracking-widest">
                  Login Panel
                </p>
              </motion.div>

              <motion.div
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-[11px] text-white/50 font-medium tracking-wide">
                  Secure Discord Bot Management
                </span>
              </motion.div>
            </div>

            {/* Form */}
            <motion.form
              ref={formRef}
              onSubmit={handleSubmit}
              animate={shake ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-4"
              noValidate
            >
              {/* Mobile — optional */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Phone className="w-4 h-4 text-white/30" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={e => { setMobile(e.target.value); setError(''); }}
                  placeholder="Mobile Number (optional)"
                  className="input-dark"
                  autoComplete="tel"
                  inputMode="tel"
                  disabled={loading}
                />
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30" />
                </div>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="Password"
                  className={`input-dark ${error ? 'error' : ''}`}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn-grad mt-2 flex items-center justify-center gap-2"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending OTP…</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </motion.button>

              {/* Forgot Password */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  className="text-[13px] text-white/30 hover:text-white/60 transition-colors cursor-default"
                  onClick={() => setError('Contact the bot owner to reset your password.')}
                >
                  Forgot Password?
                </button>
              </div>
            </motion.form>

          </div>
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-white/20 text-xs mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          © {new Date().getFullYear()} MOSTAKIM · All rights reserved
        </motion.p>
      </motion.div>
    </main>
  );
}
