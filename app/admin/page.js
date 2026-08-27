'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Mail,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  Check,
  ArrowLeft,
  Save,
  Globe,
  ExternalLink,
  Sliders,
  Inbox,
  GripVertical,
  LogOut,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '@/components/icons';

export default function AdminPage() {
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const [activeTab, setActiveTab] = useState('profile');
  const [cvData, setCvData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Change Password Form State
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passStatus, setPassStatus] = useState({ submitting: false, error: '', success: '' });

  // Drag & Drop State
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedType, setDraggedType] = useState(null);

  // Form states
  const [profileForm, setProfileForm] = useState({});
  const [expModal, setExpModal] = useState({ open: false, isEdit: false, item: { role: '', company: '', location: '', start_date: '', end_date: '', current: 0, description: '', achievements: [] } });
  const [eduModal, setEduModal] = useState({ open: false, isEdit: false, item: { degree: '', institution: '', location: '', start_date: '', end_date: '', gpa: '', description: '' } });
  const [skillModal, setSkillModal] = useState({ open: false, isEdit: false, item: { name: '', category: 'Frontend', proficiency: 80, icon: 'Code' } });
  const [projModal, setProjModal] = useState({ open: false, isEdit: false, item: { title: '', description: '', category: 'Full-Stack', image_url: '/projects/project1.svg', live_url: '', github_url: '', tags: [], featured: 0 } });

  // Toast Helper
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  // Helper date range formatter
  const formatDateRange = (start, end) => {
    if (!start) return end || '';
    if (!end || start === end) return start;
    return `${start} – ${end}`;
  };

  // Check Auth & Load CV Data
  const loadData = async () => {
    try {
      setLoading(true);
      
      const [cvRes, msgRes] = await Promise.all([
        fetch('/api/cv'),
        fetch('/api/contact')
      ]);

      const cvJson = await cvRes.json();
      if (cvJson.success) {
        setCvData(cvJson.data);
        setProfileForm(cvJson.data.profile || {});
      }

      const msgJson = await msgRes.json();
      if (msgJson.success) {
        setMessages(msgJson.messages || []);
      }
    } catch (err) {
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    } else if (authStatus === 'authenticated') {
      loadData();
    }
  }, [authStatus, router]);

  // NextAuth Logout Handler
  const handleLogout = () => {
    showToast('Logging out...');
    signOut({ callbackUrl: '/login' });
  };

  // Change Password Handler
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassStatus({ submitting: true, error: '', success: '' });

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassStatus({ submitting: false, error: 'Konfirmasi password baru tidak cocok.', success: '' });
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passForm.currentPassword,
          newPassword: passForm.newPassword
        })
      });
      const json = await res.json();

      if (json.success) {
        setPassStatus({ submitting: false, error: '', success: 'Password berhasil diperbarui!' });
        setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showToast('Password admin berhasil diubah!');
      } else {
        setPassStatus({ submitting: false, error: json.error || 'Gagal mengubah password.', success: '' });
      }
    } catch (err) {
      setPassStatus({ submitting: false, error: 'Terjadi kesalahan sistem.', success: '' });
    }
  };

  // DRAG AND DROP HANDLER
  const handleDropItem = async (type, targetIdx) => {
    if (draggedIndex === null || draggedIndex === targetIdx || draggedType !== type) return;

    let list = [];
    if (type === 'experiences') list = [...(cvData?.experiences || [])];
    else if (type === 'education') list = [...(cvData?.education || [])];
    else if (type === 'skills') list = [...(cvData?.skills || [])];
    else if (type === 'projects') list = [...(cvData?.projects || [])];

    const itemToMove = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIdx, 0, itemToMove);

    // Optimistically update UI state
    setCvData(prev => ({ ...prev, [type]: list }));

    // Persist reorder to database
    try {
      const res = await fetch('/api/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ table: type, items: list })
      });
      const json = await res.json();
      if (json.success) {
        showToast('Urutan berhasil diperbarui! ↕️');
      } else {
        showToast(json.error || 'Gagal merubah urutan', 'error');
      }
    } catch (err) {
      showToast('Gagal merubah urutan', 'error');
    } finally {
      setDraggedIndex(null);
      setDraggedType(null);
    }
  };

  // Save Profile Changes
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cv', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm)
      });
      const json = await res.json();
      if (json.success) {
        setCvData(json.data);
        showToast('Profile updated successfully!');
      } else {
        showToast(json.error || 'Failed to update profile', 'error');
      }
    } catch (err) {
      showToast('Network error saving profile', 'error');
    }
  };

  // Save/Update Experience
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    const method = expModal.isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/experiences', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expModal.item)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Pengalaman ${expModal.isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        setExpModal({ ...expModal, open: false });
        loadData();
      }
    } catch (err) {
      showToast('Error saving experience', 'error');
    }
  };

  // Delete Experience
  const handleDeleteExperience = async (id) => {
    if (!confirm('Hapus pengalaman kerja ini?')) return;
    try {
      const res = await fetch(`/api/experiences?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Pengalaman dihapus');
        loadData();
      }
    } catch (err) {
      showToast('Error deleting experience', 'error');
    }
  };

  // Save/Update Education
  const handleSaveEducation = async (e) => {
    e.preventDefault();
    const method = eduModal.isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/education', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eduModal.item)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Pendidikan ${eduModal.isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        setEduModal({ ...eduModal, open: false });
        loadData();
      }
    } catch (err) {
      showToast('Error saving education', 'error');
    }
  };

  // Delete Education
  const handleDeleteEducation = async (id) => {
    if (!confirm('Hapus riwayat pendidikan ini?')) return;
    try {
      const res = await fetch(`/api/education?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Pendidikan dihapus');
        loadData();
      }
    } catch (err) {
      showToast('Error deleting education', 'error');
    }
  };

  // Save/Update Skill
  const handleSaveSkill = async (e) => {
    e.preventDefault();
    const method = skillModal.isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/skills', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(skillModal.item)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Skill ${skillModal.isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        setSkillModal({ ...skillModal, open: false });
        loadData();
      }
    } catch (err) {
      showToast('Error saving skill', 'error');
    }
  };

  // Delete Skill
  const handleDeleteSkill = async (id) => {
    if (!confirm('Hapus skill ini?')) return;
    try {
      const res = await fetch(`/api/skills?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Skill dihapus');
        loadData();
      }
    } catch (err) {
      showToast('Error deleting skill', 'error');
    }
  };

  // Save/Update Project
  const handleSaveProject = async (e) => {
    e.preventDefault();
    const method = projModal.isEdit ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projModal.item)
      });
      const json = await res.json();
      if (json.success) {
        showToast(`Proyek ${projModal.isEdit ? 'diperbarui' : 'ditambahkan'}!`);
        setProjModal({ ...projModal, open: false });
        loadData();
      }
    } catch (err) {
      showToast('Error saving project', 'error');
    }
  };

  // Delete Project
  const handleDeleteProject = async (id) => {
    if (!confirm('Hapus proyek ini?')) return;
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Proyek dihapus');
        loadData();
      }
    } catch (err) {
      showToast('Error deleting project', 'error');
    }
  };

  // Delete Message
  const handleDeleteMessage = async (id) => {
    if (!confirm('Hapus pesan dari inbox?')) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        showToast('Pesan dihapus');
        loadData();
      }
    } catch (err) {
      showToast('Error deleting message', 'error');
    }
  };

  // Reset to Default Demo Data
  const handleResetDatabase = async () => {
    if (!confirm('WARNING: Reset database ke data demo default?')) return;
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setCvData(json.data);
        setProfileForm(json.data.profile || {});
        showToast('Database reset ke data demo default!');
        loadData();
      }
    } catch (err) {
      showToast('Error resetting database', 'error');
    }
  };

  if (authStatus === 'loading' || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--bg-primary)',
        color: 'var(--text-main)'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.3px' }}>
          Verifikasi NextAuth JWT Session...
        </p>
      </div>
    );
  }

  const { experiences = [], education = [], skills = [], projects = [] } = cvData || {};
  const authUsername = session?.user?.username || session?.user?.name || 'admin';

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingBottom: '60px' }}>
      
      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          padding: '14px 20px',
          borderRadius: 'var(--radius-sm)',
          background: toast.type === 'error' ? '#ef4444' : 'var(--gradient-primary)',
          color: '#ffffff',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Check size={18} />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Header Navbar */}
      <header className="glass-nav" style={{ padding: '16px 24px', marginBottom: '32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link href="/" className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }}>
              <ArrowLeft size={16} />
              <span>Kembali ke CV</span>
            </Link>
            <div>
              <h1 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={20} color="var(--accent-primary)" />
                Panel Setting CV (NextAuth JWT)
              </h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                Logged in as: <strong style={{ color: 'var(--accent-emerald)' }}>{authUsername}</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={handleResetDatabase} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
              <RefreshCw size={14} />
              <span>Reset Demo Data</span>
            </button>

            <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Container */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {[
            { id: 'profile', label: 'Profil Info', icon: User },
            { id: 'experiences', label: 'Pengalaman', icon: Briefcase, count: experiences.length },
            { id: 'education', label: 'Pendidikan', icon: GraduationCap, count: education.length },
            { id: 'skills', label: 'Skill', icon: Code, count: skills.length },
            { id: 'projects', label: 'Proyek', icon: FolderGit2, count: projects.length },
            { id: 'messages', label: 'Pesan Inbox', icon: Inbox, count: messages.length },
            { id: 'security', label: 'Keamanan / Password', icon: KeyRound }
          ].map(tab => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: active ? 'var(--accent-primary)' : 'var(--border-color)',
                  background: active ? 'var(--gradient-glow)' : 'var(--bg-card)',
                  color: active ? 'var(--accent-primary)' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <IconComponent size={18} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: active ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                    color: active ? '#fff' : 'var(--text-muted)',
                    fontSize: '0.75rem'
                  }}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Drag & Drop Hint Banner */}
        {activeTab !== 'profile' && activeTab !== 'messages' && activeTab !== 'security' && (
          <div style={{
            marginBottom: '24px',
            padding: '12px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.12)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            color: 'var(--accent-primary)',
            fontSize: '0.88rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <GripVertical size={18} />
            <span><strong>Petunjuk:</strong> Geser ikon pegangan (≡) untuk mengubah urutan posisi item secara <strong>Drag & Drop</strong>. Hasil urutan akan langsung tersimpan ke database.</span>
          </div>
        )}

        {/* TAB 1: PROFILE FORM */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="glass-card" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User color="var(--accent-primary)" size={22} />
              Edit Informasi Profil Utama
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={profileForm.name || ''}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Headline / Title</label>
                <input
                  type="text"
                  required
                  value={profileForm.title || ''}
                  onChange={e => setProfileForm({ ...profileForm, title: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Email</label>
                <input
                  type="email"
                  value={profileForm.email || ''}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Telepon / WhatsApp</label>
                <input
                  type="text"
                  value={profileForm.phone || ''}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Lokasi</label>
                <input
                  type="text"
                  value={profileForm.location || ''}
                  onChange={e => setProfileForm({ ...profileForm, location: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>URL Foto Avatar</label>
                <input
                  type="text"
                  value={profileForm.avatar_url || ''}
                  onChange={e => setProfileForm({ ...profileForm, avatar_url: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Bio / Summary</label>
              <textarea
                rows={4}
                value={profileForm.bio || ''}
                onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })}
                style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none', resize: 'vertical' }}
              />
            </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>Social & Portfolio Links</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>GitHub URL</label>
                <input
                  type="text"
                  value={profileForm.github || ''}
                  onChange={e => setProfileForm({ ...profileForm, github: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>LinkedIn URL</label>
                <input
                  type="text"
                  value={profileForm.linkedin || ''}
                  onChange={e => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>Twitter / X URL</label>
                <input
                  type="text"
                  value={profileForm.twitter || ''}
                  onChange={e => setProfileForm({ ...profileForm, twitter: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
              <Save size={18} />
              <span>Simpan Perubahan Profil</span>
            </button>
          </form>
        )}

        {/* TAB 2: EXPERIENCES */}
        {activeTab === 'experiences' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Kelola Pengalaman Kerja</h2>
              <button
                onClick={() => setExpModal({ open: true, isEdit: false, item: { role: '', company: '', location: '', start_date: '', end_date: '', current: 0, description: '', achievements: [] } })}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Tambah Pengalaman</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {experiences.map((exp, idx) => (
                <div
                  key={exp.id || idx}
                  draggable
                  onDragStart={(e) => { setDraggedIndex(idx); setDraggedType('experiences'); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => handleDropItem('experiences', idx)}
                  onDragEnd={() => { setDraggedIndex(null); setDraggedType(null); }}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'grab',
                    border: draggedIndex === idx ? '2px dashed var(--accent-primary)' : undefined,
                    opacity: draggedIndex === idx ? 0.5 : 1
                  }}
                >
                  <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }} title="Tarik untuk mengubah urutan">
                    <GripVertical size={24} />
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{exp.role}</h3>
                    <p style={{ color: 'var(--accent-primary)', fontWeight: 600, margin: '4px 0 8px 0' }}>
                      {exp.company} • {exp.location} ({formatDateRange(exp.start_date, exp.end_date)})
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{exp.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setExpModal({ open: true, isEdit: true, item: exp }); }}
                      className="btn-secondary"
                      style={{ padding: '8px 12px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteExperience(exp.id); }}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', color: '#f87171' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: EDUCATION */}
        {activeTab === 'education' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Kelola Riwayat Pendidikan</h2>
              <button
                onClick={() => setEduModal({ open: true, isEdit: false, item: { degree: '', institution: '', location: '', start_date: '', end_date: '', gpa: '', description: '' } })}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Tambah Pendidikan</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {education.map((edu, idx) => (
                <div
                  key={edu.id || idx}
                  draggable
                  onDragStart={(e) => { setDraggedIndex(idx); setDraggedType('education'); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => handleDropItem('education', idx)}
                  onDragEnd={() => { setDraggedIndex(null); setDraggedType(null); }}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    cursor: 'grab',
                    border: draggedIndex === idx ? '2px dashed var(--accent-primary)' : undefined,
                    opacity: draggedIndex === idx ? 0.5 : 1
                  }}
                >
                  <div style={{ color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }} title="Tarik untuk mengubah urutan">
                    <GripVertical size={24} />
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0 }}>{edu.degree}</h3>
                    <p style={{ color: 'var(--accent-emerald)', fontWeight: 600, margin: '4px 0 8px 0' }}>
                      {edu.institution} • {edu.location} ({formatDateRange(edu.start_date, edu.end_date)})
                    </p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{edu.description}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEduModal({ open: true, isEdit: true, item: edu }); }}
                      className="btn-secondary"
                      style={{ padding: '8px 12px' }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteEducation(edu.id); }}
                      className="btn-secondary"
                      style={{ padding: '8px 12px', color: '#f87171' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: SKILLS */}
        {activeTab === 'skills' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Kelola Technical Skills</h2>
              <button
                onClick={() => setSkillModal({ open: true, isEdit: false, item: { name: '', category: 'Frontend', proficiency: 80, icon: 'Code' } })}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Tambah Skill</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {skills.map((sk, idx) => (
                <div
                  key={sk.id || idx}
                  draggable
                  onDragStart={(e) => { setDraggedIndex(idx); setDraggedType('skills'); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => handleDropItem('skills', idx)}
                  onDragEnd={() => { setDraggedIndex(null); setDraggedType(null); }}
                  className="glass-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'grab',
                    border: draggedIndex === idx ? '2px dashed var(--accent-primary)' : undefined,
                    opacity: draggedIndex === idx ? 0.5 : 1
                  }}
                >
                  <div style={{ color: 'var(--text-dim)' }} title="Tarik untuk mengubah urutan">
                    <GripVertical size={20} />
                  </div>

                  <div style={{ flexGrow: 1 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, textTransform: 'uppercase' }}>{sk.category}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 4px 0' }}>{sk.name}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: 0 }}>Proficiency: {sk.proficiency}%</p>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setSkillModal({ open: true, isEdit: true, item: sk }); }}
                      className="btn-secondary"
                      style={{ padding: '6px 10px' }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSkill(sk.id); }}
                      className="btn-secondary"
                      style={{ padding: '6px 10px', color: '#f87171' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Kelola Portofolio Proyek</h2>
              <button
                onClick={() => setProjModal({ open: true, isEdit: false, item: { title: '', description: '', category: 'Full-Stack', image_url: '/projects/project1.svg', live_url: '', github_url: '', tags: ['Next.js', 'SQLite'], featured: 1 } })}
                className="btn-primary"
              >
                <Plus size={18} />
                <span>Tambah Proyek</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              {projects.map((proj, idx) => (
                <div
                  key={proj.id || idx}
                  draggable
                  onDragStart={(e) => { setDraggedIndex(idx); setDraggedType('projects'); e.dataTransfer.effectAllowed = 'move'; }}
                  onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
                  onDrop={() => handleDropItem('projects', idx)}
                  onDragEnd={() => { setDraggedIndex(null); setDraggedType(null); }}
                  className="glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'grab',
                    border: draggedIndex === idx ? '2px dashed var(--accent-primary)' : undefined,
                    opacity: draggedIndex === idx ? 0.5 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ color: 'var(--text-dim)' }} title="Tarik untuk mengubah urutan">
                        <GripVertical size={20} />
                      </div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>{proj.category}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setProjModal({ open: true, isEdit: true, item: proj }); }}
                        className="btn-secondary"
                        style={{ padding: '6px 10px' }}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                        className="btn-secondary"
                        style={{ padding: '6px 10px', color: '#f87171' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 8px 0' }}>{proj.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 16px 0', flexGrow: 1 }}>{proj.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px' }}>Inbox Pesan Kontak Public</h2>

            {messages.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Belum ada pesan yang masuk. Form kontak publik dapat dicoba dari halaman utama.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.map(msg => (
                  <div key={msg.id} className="glass-card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{msg.name}</h3>
                        <p style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>{msg.email}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="btn-secondary"
                          style={{ padding: '6px 10px', color: '#f87171' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', color: 'var(--text-main)' }}>Subjek: {msg.subject}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>{msg.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SECURITY & CHANGE PASSWORD */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="glass-card" style={{ padding: '36px', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <KeyRound color="var(--accent-primary)" size={22} />
              Ubah Password Admin
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  required
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })}
                  placeholder="Masukkan password saat ini"
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Password Baru (minimal 6 karakter)
                </label>
                <input
                  type="password"
                  required
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })}
                  placeholder="Masukkan password baru"
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-muted)' }}>
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={passForm.confirmPassword}
                  onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                  placeholder="Ketik ulang password baru"
                  style={{ width: '100%', padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                />
              </div>
            </div>

            {passStatus.error && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.88rem', marginBottom: '20px' }}>
                {passStatus.error}
              </div>
            )}

            {passStatus.success && (
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: 'var(--accent-emerald)', fontSize: '0.88rem', marginBottom: '20px' }}>
                {passStatus.success}
              </div>
            )}

            <button type="submit" disabled={passStatus.submitting} className="btn-primary" style={{ padding: '12px 28px' }}>
              <Save size={18} />
              <span>{passStatus.submitting ? 'Updating...' : 'Perbarui Password Admin'}</span>
            </button>
          </form>
        )}

      </div>

      {/* EXP MODAL */}
      {expModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleSaveExperience} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{expModal.isEdit ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Role / Jabatan</label>
                <input type="text" required value={expModal.item.role} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, role: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Perusahaan</label>
                <input type="text" required value={expModal.item.company} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, company: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Lokasi</label>
                <input type="text" value={expModal.item.location} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, location: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tahun Mulai</label>
                <input type="text" value={expModal.item.start_date} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, start_date: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tahun Selesai</label>
                <input type="text" value={expModal.item.end_date} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, end_date: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deskripsi</label>
              <textarea rows={3} value={expModal.item.description} onChange={e => setExpModal({ ...expModal, item: { ...expModal.item, description: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setExpModal({ ...expModal, open: false })} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* EDU MODAL */}
      {eduModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleSaveEducation} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{eduModal.isEdit ? 'Edit Pendidikan' : 'Tambah Pendidikan Baru'}</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Gelar / Degree</label>
                <input type="text" required value={eduModal.item.degree} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, degree: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Institusi / Universitas</label>
                <input type="text" required value={eduModal.item.institution} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, institution: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Lokasi</label>
                <input type="text" value={eduModal.item.location} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, location: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tahun Mulai</label>
                <input type="text" value={eduModal.item.start_date} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, start_date: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Tahun Selesai</label>
                <input type="text" value={eduModal.item.end_date} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, end_date: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deskripsi</label>
              <textarea rows={3} value={eduModal.item.description} onChange={e => setEduModal({ ...eduModal, item: { ...eduModal.item, description: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setEduModal({ ...eduModal, open: false })} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* SKILL MODAL */}
      {skillModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleSaveSkill} className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '32px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{skillModal.isEdit ? 'Edit Skill' : 'Tambah Skill Baru'}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Nama Skill</label>
              <input type="text" required value={skillModal.item.name} onChange={e => setSkillModal({ ...skillModal, item: { ...skillModal.item, name: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Kategori</label>
                <select value={skillModal.item.category} onChange={e => setSkillModal({ ...skillModal, item: { ...skillModal.item, category: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: '#1e293b', border: '1px solid var(--border-color)', color: '#fff' }}>
                  <option value="Frontend">Frontend</option>
                  <option value="Backend">Backend</option>
                  <option value="Database">Database</option>
                  <option value="Tools">Tools</option>
                  <option value="Design">Design</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Proficiency (%)</label>
                <input type="number" min="1" max="100" value={skillModal.item.proficiency} onChange={e => setSkillModal({ ...skillModal, item: { ...skillModal.item, proficiency: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setSkillModal({ ...skillModal, open: false })} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {/* PROJ MODAL */}
      {projModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <form onSubmit={handleSaveProject} className="glass-card" style={{ width: '100%', maxWidth: '600px', padding: '32px', background: '#0f172a' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>{projModal.isEdit ? 'Edit Proyek' : 'Tambah Proyek Baru'}</h3>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Judul Proyek</label>
              <input type="text" required value={projModal.item.title} onChange={e => setProjModal({ ...projModal, item: { ...projModal.item, title: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Deskripsi</label>
              <textarea rows={3} value={projModal.item.description} onChange={e => setProjModal({ ...projModal, item: { ...projModal.item, description: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Live Demo URL</label>
                <input type="text" value={projModal.item.live_url} onChange={e => setProjModal({ ...projModal, item: { ...projModal.item, live_url: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>GitHub Repository URL</label>
                <input type="text" value={projModal.item.github_url} onChange={e => setProjModal({ ...projModal, item: { ...projModal.item, github_url: e.target.value } })} style={{ width: '100%', padding: '10px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: '#fff' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" onClick={() => setProjModal({ ...projModal, open: false })} className="btn-secondary">Batal</button>
              <button type="submit" className="btn-primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
