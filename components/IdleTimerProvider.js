'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Clock, RefreshCw, LogOut } from 'lucide-react';

// Default idle timeout: 5 minutes (300,000 ms)
const IDLE_TIMEOUT_MS = 1 * 60 * 1000;
// Countdown duration: 30 seconds
const COUNTDOWN_INITIAL = 10;

export default function IdleTimerProvider({ children }) {
  const { status } = useSession();
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_INITIAL);

  const showWarningModalRef = useRef(false);
  const idleTimerRef = useRef(null);
  const countdownIntervalRef = useRef(null);
  const lastDbTouchRef = useRef(Date.now());

  // Update session touch in SQLite DB
  const touchDbSession = useCallback(async () => {
    const now = Date.now();
    // Debounce DB touches to once every 60 seconds
    if (now - lastDbTouchRef.current < 60000) return;
    lastDbTouchRef.current = now;

    try {
      await fetch('/api/auth/session/touch', { method: 'POST' });
    } catch (err) {
      console.error('Failed to touch session in DB', err);
    }
  }, []);

  // Perform logout
  const handleLogout = useCallback(() => {
    showWarningModalRef.current = false;
    setShowWarningModal(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    signOut({ callbackUrl: '/login?expired=1' });
  }, []);

  // Start 30s Countdown
  const startCountdown = useCallback(() => {
    showWarningModalRef.current = true;
    setShowWarningModal(true);
    setCountdown(COUNTDOWN_INITIAL);

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [handleLogout]);

  // Reset Idle Timer
  const resetIdleTimer = useCallback(() => {
    if (showWarningModalRef.current) return; // Do not reset if modal is already active

    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);

    idleTimerRef.current = setTimeout(() => {
      startCountdown();
    }, IDLE_TIMEOUT_MS);

    touchDbSession();
  }, [startCountdown, touchDbSession]);

  // Extend Session Click Handler
  const handleExtendSession = () => {
    showWarningModalRef.current = false;
    setShowWarningModal(false);
    setCountdown(COUNTDOWN_INITIAL);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    lastDbTouchRef.current = 0;
    touchDbSession();
    resetIdleTimer();
  };

  useEffect(() => {
    if (status !== 'authenticated') {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      showWarningModalRef.current = false;
      setShowWarningModal(false);
      return;
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    const handleActivity = () => {
      if (!showWarningModalRef.current) {
        resetIdleTimer();
      }
    };

    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));
    resetIdleTimer();

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [status, resetIdleTimer]);

  return (
    <>
      {children}

      {/* 30-Second Countdown Warning Modal */}
      {showWarningModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div className="glass-card page-enter" style={{
            width: '100%',
            maxWidth: '460px',
            padding: '36px 32px',
            textAlign: 'center',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
          }}>

            {/* Amber Alert Badge */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.4)'
            }}>
              <Clock size={32} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 10px 0', color: 'var(--text-main)' }}>
              Sesi Anda Akan Berakhir!
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: 1.5, margin: '0 0 24px 0' }}>
              Tidak ada aktivitas terdeteksi. Untuk keamanan data Anda, sesi admin akan otomatis ter-logout dalam:
            </p>

            {/* Countdown Badge Circular Banner */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '12px 28px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              fontSize: '1.8rem',
              fontWeight: 800,
              marginBottom: '32px',
              fontVariantNumeric: 'tabular-nums'
            }}>
              <span>00:{countdown < 10 ? `0${countdown}` : countdown}</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>detik</span>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={handleExtendSession}
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '12px 16px', fontSize: '0.9rem' }}
              >
                <RefreshCw size={16} />
                <span>Tetap Masuk</span>
              </button>

              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ justifyContent: 'center', padding: '12px 16px', fontSize: '0.9rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
