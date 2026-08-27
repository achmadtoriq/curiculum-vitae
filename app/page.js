'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Briefcase,
  GraduationCap,
  Code,
  FolderGit2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Download,
  Moon,
  Sun,
  Settings,
  Send,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Award,
  Layers,
  Terminal,
  UserCheck
} from 'lucide-react';
import { GithubIcon, LinkedinIcon, TwitterIcon } from '@/components/icons';

export default function PublicCvPage() {
  const router = useRouter();
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [activeProjectCategory, setActiveProjectCategory] = useState('All');

  // Smart Direct Admin Panel Navigation (checks NextAuth JWT session)
  const handleAdminNav = async (e) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch('/api/auth/session');
      const session = await res.json();
      if (session && session.user) {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    } catch (err) {
      router.push('/login');
    }
  };
  
  // Contact Form State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactStatus, setContactStatus] = useState({ submitting: false, message: '', isError: false });

  // Fetch CV data from SQLite API
  const fetchCvData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/cv');
      const result = await res.json();
      if (result.success) {
        setCvData(result.data);
      }
    } catch (err) {
      console.error('Error fetching CV data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCvData();
  }, []);

  // Theme Toggle Effect
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Print PDF function - opens dedicated executive PDF resume page
  const handlePrint = () => {
    window.open('/resume?print=true', '_blank');
  };

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactStatus({ submitting: true, message: '', isError: false });

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      const result = await res.json();

      if (result.success) {
        setContactStatus({ submitting: false, message: 'Message sent successfully! Thank you.', isError: false });
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        setContactStatus({ submitting: false, message: result.error || 'Failed to send message.', isError: true });
      }
    } catch (err) {
      setContactStatus({ submitting: false, message: 'An unexpected error occurred.', isError: true });
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        background: 'var(--bg-primary)'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          border: '4px solid var(--border-color)',
          borderTopColor: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading Electronic CV...</p>
      </div>
    );
  }

  const { profile, experiences = [], education = [], skills = [], projects = [] } = cvData || {};

  // Categories for Projects
  const projectCategories = ['All', ...new Set(projects.map(p => p.category).filter(Boolean))];
  const filteredProjects = activeProjectCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeProjectCategory);

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      
      {/* Dynamic Background Glow Blobs */}
      <div style={{
        position: 'fixed',
        top: '-10%',
        left: '-10%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'fixed',
        bottom: '-10%',
        right: '-10%',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(0,0,0,0) 70%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Sticky Navigation Header */}
      <header className="glass-nav" style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '16px 24px'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '20px',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)'
            }}>
              AB
            </div>
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>{profile.name}</h1>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>Electronic CV</p>
            </div>
          </div>

          {/* Section Navigation Links */}
          <nav className="no-print" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            <a href="#about" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>About</a>
            <a href="#experience" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Experience</a>
            <a href="#skills" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Skills</a>
            <a href="#projects" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Projects</a>
            <a href="#education" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Education</a>
            <a href="#contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500 }}>Contact</a>
          </nav>

          {/* Header Action Buttons */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={toggleTheme}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              title="Toggle Dark/Light Mode"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ padding: '8px 14px', fontSize: '0.85rem' }}
              title="Print CV or Download PDF"
            >
              <Download size={16} />
              <span>PDF / Print</span>
            </button>

            <button
              onClick={handleAdminNav}
              className="btn-primary"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              <Settings size={16} />
              <span>Admin Panel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px', position: 'relative', zIndex: 1 }}>

        {/* PRINT-ONLY EXECUTIVE RESUME HEADER */}
        <div className="print-header" style={{ marginBottom: '24px', borderBottom: '2pt solid #4338ca', paddingBottom: '16px' }}>
          <h1 style={{ fontSize: '24pt', fontWeight: 800, color: '#0f172a', margin: 0 }}>{profile.name}</h1>
          <h2 style={{ fontSize: '13pt', color: '#4338ca', fontWeight: 700, margin: '4px 0 12px 0', border: 'none', padding: 0 }}>{profile.title}</h2>
          
          <div style={{ fontSize: '9.5pt', color: '#334155', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website && <span>🌐 {profile.website}</span>}
            {profile.github && <span>💻 {profile.github}</span>}
            {profile.linkedin && <span>💼 {profile.linkedin}</span>}
          </div>

          {profile.bio && (
            <p style={{ marginTop: '12px', fontSize: '9.5pt', color: '#475569', lineHeight: 1.5 }}>
              {profile.bio}
            </p>
          )}
        </div>

        {/* HERO SECTION */}
        <section id="about" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px',
          alignItems: 'center',
          marginBottom: '60px'
        }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: 'var(--accent-emerald)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent-emerald)',
                boxShadow: '0 0 10px var(--accent-emerald)'
              }} />
              Available for Hire & Remote Projects
            </div>

            <h1 style={{
              fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: '16px'
            }}>
              Hi, I&apos;m <span className="gradient-text">{profile.name}</span>
            </h1>

            <h2 style={{
              fontSize: 'clamp(1.2rem, 3vw, 1.6rem)',
              color: 'var(--text-muted)',
              fontWeight: 600,
              marginBottom: '20px'
            }}>
              {profile.title}
            </h2>

            <p style={{
              fontSize: '1.05rem',
              color: 'var(--text-muted)',
              marginBottom: '32px',
              maxWidth: '600px',
              lineHeight: 1.7
            }}>
              {profile.bio}
            </p>

            {/* Quick Contact Badges */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              marginBottom: '36px',
              fontSize: '0.9rem',
              color: 'var(--text-muted)'
            }}>
              {profile.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} color="var(--accent-primary)" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.email && (
                <a href={`mailto:${profile.email}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'inherit', textDecoration: 'none' }}>
                  <Mail size={16} color="var(--accent-primary)" />
                  <span>{profile.email}</span>
                </a>
              )}
              {profile.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Phone size={16} color="var(--accent-primary)" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            {/* Social & Hero Action CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <a href="#contact" className="btn-primary">
                <Mail size={18} />
                <span>Get In Touch</span>
              </a>

              <button onClick={handlePrint} className="btn-secondary">
                <Download size={18} />
                <span>Download Resume</span>
              </button>

              {/* Social Links */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '8px' }}>
                {profile.github && (
                  <a href={profile.github} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}>
                    <GithubIcon size={18} />
                  </a>
                )}
                {profile.linkedin && (
                  <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}>
                    <LinkedinIcon size={18} />
                  </a>
                )}
                {profile.twitter && (
                  <a href={profile.twitter} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '10px', borderRadius: '50%' }}>
                    <TwitterIcon size={18} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Profile Photo Avatar Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute',
                inset: '-12px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--gradient-primary)',
                opacity: 0.3,
                filter: 'blur(20px)',
                zIndex: 0
              }} />
              
              <div className="glass-card animate-float" style={{
                position: 'relative',
                zIndex: 1,
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '360px',
                width: '100%'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '340px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden'
                }}>
                  <Image
                    src={profile.avatar_url || '/avatar.jpg'}
                    alt={profile.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    priority
                  />
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '16px',
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="var(--accent-secondary)" />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full-Stack Developer</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>6+ Yrs Exp</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KEY STATS BANNER */}
        <section className="glass-card" style={{
          padding: '32px 40px',
          marginBottom: '80px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          textAlign: 'center'
        }}>
          <div>
            <h3 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>6+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Years Experience</p>
          </div>
          <div>
            <h3 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>24+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Projects Delivered</p>
          </div>
          <div>
            <h3 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>100%</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Client Satisfaction</p>
          </div>
          <div>
            <h3 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 800 }}>15+</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Core Technologies</p>
          </div>
        </section>

        {/* WORK EXPERIENCE SECTION */}
        <section id="experience" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: 'var(--accent-primary)'
            }}>
              <Briefcase size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Work Experience</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Professional history and key achievements</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {experiences.map((exp, idx) => (
              <div key={exp.id || idx} className="glass-card" style={{ padding: '32px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, margin: 0 }}>{exp.role}</h3>
                    <h4 style={{ fontSize: '1rem', color: 'var(--accent-primary)', fontWeight: 600, marginTop: '4px' }}>
                      {exp.company} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>• {exp.location}</span>
                    </h4>
                  </div>
                  <div style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: exp.current ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${exp.current ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                    color: exp.current ? 'var(--accent-emerald)' : 'var(--text-muted)',
                    fontSize: '0.85rem',
                    fontWeight: 600
                  }}>
                    {exp.start_date} – {exp.end_date}
                  </div>
                </div>

                <p style={{ color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.7 }}>
                  {exp.description}
                </p>

                {/* Key Achievements Bullet points */}
                {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)' }}>Key Highlights & Impact:</h5>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {exp.achievements.map((ach, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                          <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ flexShrink: 0, marginTop: '3px' }} />
                          <span>{ach}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: 'var(--accent-secondary)'
            }}>
              <Code size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Technical Skills & Competencies</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Technologies, frameworks, and proficiencies</p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}>
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} className="glass-card" style={{ padding: '28px' }}>
                <h3 style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-primary)'
                }}>
                  <Layers size={18} />
                  {category}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {items.map((skill) => (
                    <div key={skill.id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600 }}>{skill.name}</span>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 500 }}>{skill.proficiency}%</span>
                      </div>
                      <div style={{
                        height: '8px',
                        width: '100%',
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${skill.proficiency}%`,
                          background: 'var(--gradient-primary)',
                          borderRadius: '4px',
                          transition: 'width 1s ease'
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PORTFOLIO PROJECTS SECTION */}
        <section id="projects" style={{ marginBottom: '80px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)'
              }}>
                <FolderGit2 size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Featured Projects</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Selected works & application showcases</p>
              </div>
            </div>

            {/* Category Filter Tabs */}
            <div className="no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {projectCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveProjectCategory(cat)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--border-color)',
                    background: activeProjectCategory === cat ? 'var(--gradient-primary)' : 'var(--bg-card)',
                    color: activeProjectCategory === cat ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px'
          }}>
            {filteredProjects.map((proj) => (
              <div key={proj.id} className="glass-card" style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '200px',
                  background: '#0f172a'
                }}>
                  <Image
                    src={proj.image_url || '/projects/project1.svg'}
                    alt={proj.title}
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                  {proj.featured ? (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'rgba(99, 102, 241, 0.9)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backdropFilter: 'blur(4px)'
                    }}>
                      Featured
                    </span>
                  ) : null}
                </div>

                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {proj.category}
                  </span>
                  
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '8px 0 12px 0' }}>
                    {proj.title}
                  </h3>

                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.6, flexGrow: 1 }}>
                    {proj.description}
                  </p>

                  {/* Tech Tags */}
                  {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.06)',
                          color: 'var(--text-muted)',
                          fontSize: '0.75rem',
                          fontWeight: 500
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Links */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                    {proj.live_url && (
                      <a href={proj.live_url} target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', flexGrow: 1, justifyContent: 'center' }}>
                        <ExternalLink size={14} />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {proj.github_url && (
                      <a href={proj.github_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                        <GithubIcon size={14} />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION & CERTIFICATIONS */}
        <section id="education" style={{ marginBottom: '80px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)'
            }}>
              <GraduationCap size={24} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Education & Certifications</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Academic background & formal credentials</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {education.map((edu, idx) => (
              <div key={edu.id || idx} className="glass-card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', fontWeight: 600 }}>
                    {edu.start_date} – {edu.end_date}
                  </span>
                  {edu.gpa && (
                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                      {edu.gpa}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 6px 0' }}>{edu.degree}</h3>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px' }}>
                  {edu.institution} <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>• {edu.location}</span>
                </h4>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {edu.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" style={{ marginBottom: '80px' }}>
          <div className="glass-card" style={{
            padding: '48px 36px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px'
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                padding: '10px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                marginBottom: '16px'
              }}>
                <Mail size={24} />
              </div>

              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
                Let&apos;s Work Together
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '32px' }}>
                Have a project in mind or want to discuss full-time opportunities? Send me a message and I&apos;ll get back to you within 24 hours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)' }}>
                    <Mail size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Email Me At</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{profile.email}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)' }}>
                    <Phone size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Phone / WhatsApp</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{profile.phone}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-primary)' }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', margin: 0 }}>Location</p>
                    <p style={{ fontWeight: 600, margin: 0 }}>{profile.location}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="john@example.com"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  placeholder="Project Discussion"
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-muted)' }}>
                  Your Message
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  placeholder="Tell me about your project..."
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-main)',
                    fontSize: '0.95rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              {contactStatus.message && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-sm)',
                  background: contactStatus.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  border: `1px solid ${contactStatus.isError ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                  color: contactStatus.isError ? '#f87171' : 'var(--accent-emerald)',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  {contactStatus.message}
                </div>
              )}

              <button
                type="submit"
                disabled={contactStatus.submitting}
                className="btn-primary"
                style={{ justifyContent: 'center', padding: '14px' }}
              >
                <Send size={18} />
                <span>{contactStatus.submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '32px 24px',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.9rem'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <button onClick={handleAdminNav} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>
              Panel Setting (Admin)
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
