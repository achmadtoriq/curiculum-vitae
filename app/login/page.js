'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Lock, User, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username: form.username,
        password: form.password
      });

      if (result?.ok && !result?.error) {
        router.push('/admin');
      } else {
        setError('Login gagal. Silakan periksa kembali username dan password Anda.');
      }
    } catch (err) {
      setError('Terjadi kesalahan sistem saat autentikasi NextAuth JWT.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '24px',
      position: 'relative'
    }}>
      
      {/* Background Ambient Glows */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '25%',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none'
      }} />

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 32px',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Back Link */}
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-muted)',
          textDecoration: 'none',
          fontSize: '0.85rem',
          marginBottom: '24px',
          fontWeight: 500
        }}>
          <ArrowLeft size={16} />
          <span>Kembali ke Web CV</span>
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            color: '#fff',
            boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}>
            <Lock size={26} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 6px 0' }}>
            Admin Panel Login
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            Masuk dengan NextAuth JWT untuk mengelola CV Elektronik
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="text"
                required
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                placeholder="Masukkan username"
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Masukkan password"
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 42px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid var(--border-color)',
                  color: '#fff',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-dim)',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.85rem',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '14px', marginTop: '8px' }}
          >
            <ShieldCheck size={18} />
            <span>{loading ? 'Authenticating...' : 'Masuk ke Admin Panel'}</span>
          </button>
        </form>

        {/* Demo Credentials Callout */}
        <div style={{
          marginTop: '32px',
          padding: '14px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-color)',
          fontSize: '0.82rem',
          color: 'var(--text-muted)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '4px' }}>🔑 Default NextAuth Credentials:</div>
          <div>Username: <code style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin</code></div>
          <div style={{ marginTop: '2px' }}>Password: <code style={{ color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>admin123</code></div>
        </div>

      </div>
    </div>
  );
}
