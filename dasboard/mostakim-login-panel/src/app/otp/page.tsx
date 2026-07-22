'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

const OTP_LENGTH = 4;
const OTP_EXPIRY = 5 * 60; // 300 seconds

export default function OTPPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [timeLeft, setTimeLeft] = useState(OTP_EXPIRY);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Auto focus first box
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const triggerShake = (msg: string) => {
    setError(msg);
    setShake(true);
    setTimeout(() => setShake(false), 500);
    setDigits(Array(OTP_LENGTH).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 10);
  };

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[idx] = digit;
    setDigits(next);
    setError('');
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === 'Enter') handleVerify();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 0);
  };

  const handleVerify = useCallback(async () => {
    const otp = digits.join('');
    if (otp.length < OTP_LENGTH) return triggerShake('Please enter the complete 4-digit code.');
    if (loading || success) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoading(false);
        triggerShake(data.error ?? 'Invalid code.');
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push('/dashboard'), 1200);
    } catch {
      setLoading(false);
      triggerShake('Network error. Please try again.');
    }
  }, [digits, loading, success, router]);

  // Auto-submit when all digits filled
  useEffect(() => {
    if (digits.every(d => d) && !loading && !success && !error) {
      handleVerify();
    }
  }, [digits, handleVerify, loading, success, error]);

  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    setError('');
    try {
      const res = await fetch('/api/auth/resend-otp', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Failed to resend.'); setResending(false); return; }
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeLeft(OTP_EXPIRY);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch {
      setError('Network error.');
    } finally {
      setResending(false);
    }
  };

  // Circular progress
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const progress = (timeLeft / OTP_EXPIRY) * circ;

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0" aria-hidden>
        <div className="blob w-[500px] h-[500px] bg-violet-700/25 top-[-100px] left-[-100px] animate-[blob_10s_infinite_alternate]" />
        <div className="blob w-[400px] h-[400px] bg-blue-600/20 bottom-[-80px] right-[-80px] animate-[blob_13s_infinite_alternate-reverse]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[420px]"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="grad-border shadow-card">
          <div className="glass rounded-[25px] p-8 sm:p-10">

            {/* Back */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors mb-8 text-sm font-medium group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              Back to login
            </button>

            {/* Icon */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                className="relative mb-5"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              >
                <div className="absolute inset-0 rounded-full bg-blue-600/20 blur-xl scale-150" />
                <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-white/10">
                  <MessageSquare className="w-8 h-8 text-blue-400" />
                </div>
              </motion.div>

              <h1 className="text-xl font-bold text-white mb-2">Check your Discord DM</h1>
              <p className="text-sm text-white/40 text-center leading-relaxed max-w-[260px]">
                We sent a 4-digit verification code to your Discord account
              </p>
            </div>

            {/* OTP Boxes */}
            <motion.div
              className="flex justify-center gap-3 mb-6"
              animate={shake ? { x: [-8, 8, -5, 5, -2, 2, 0] } : {}}
              transition={{ duration: 0.4 }}
              onPaste={handlePaste}
            >
              {digits.map((d, i) => (
                <motion.input
                  key={i}
                  ref={el => { inputRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={d}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  disabled={loading || success}
                  className={`otp-box ${d ? 'filled' : ''} ${shake ? 'error' : ''} ${success ? '!border-emerald-500 !bg-emerald-500/10' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                />
              ))}
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Timer */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <svg width="72" height="72" className="-rotate-90">
                <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                <circle
                  cx="36" cy="36" r={radius} fill="none"
                  stroke={timeLeft > 60 ? '#7c3aed' : timeLeft > 20 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="4"
                  strokeDasharray={circ}
                  strokeDashoffset={circ - progress}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
                />
                <text
                  x="36" y="36"
                  dominantBaseline="middle"
                  textAnchor="middle"
                  fill="white"
                  fontSize="13"
                  fontWeight="700"
                  style={{ transform: 'rotate(90deg)', transformOrigin: '36px 36px' }}
                >
                  {formatTime(timeLeft)}
                </text>
              </svg>
              <div className="text-sm text-white/40">
                {canResend ? 'Code expired' : 'Code expires in'}
              </div>
            </div>

            {/* Verify Button */}
            <motion.button
              onClick={handleVerify}
              disabled={loading || success || digits.join('').length < OTP_LENGTH}
              className={`btn-grad flex items-center justify-center gap-2 mb-4 ${success ? '!from-emerald-600 !to-emerald-500' : ''}`}
              whileTap={{ scale: 0.97 }}
            >
              {success ? (
                <><CheckCircle2 className="w-4 h-4" /><span>Verified! Redirecting…</span></>
              ) : loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Verifying…</span></>
              ) : (
                <span>Verify Code</span>
              )}
            </motion.button>

            {/* Resend */}
            <div className="text-center">
              <button
                onClick={handleResend}
                disabled={!canResend || resending}
                className={`text-sm flex items-center justify-center gap-1.5 mx-auto transition-colors ${
                  canResend ? 'text-violet-400 hover:text-violet-300 cursor-pointer' : 'text-white/25 cursor-not-allowed'
                }`}
              >
                {resending
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Resending…</>
                  : <><RefreshCw className="w-3.5 h-3.5" /> Resend Code</>
                }
              </button>
            </div>
          </div>
        </div>

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
