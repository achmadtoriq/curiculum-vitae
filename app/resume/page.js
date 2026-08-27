'use client';

import { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from '@/components/icons';

export default function ResumePrintPage() {
  const [cvData, setCvData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/cv')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCvData(json.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading && cvData) {
      // Auto-trigger print dialog after data renders if requested via query param
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('print') === 'true') {
        setTimeout(() => {
          window.print();
        }, 500);
      }
    }
  }, [loading, cvData]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontFamily: 'sans-serif' }}>
        <p>Generating PDF Resume...</p>
      </div>
    );
  }

  const { profile = {}, experiences = [], education = [], skills = [], projects = [] } = cvData || {};

  // Group skills
  const skillsByCategory = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  return (
    <div style={{
      background: '#e2e8f0',
      minHeight: '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Floating Action Controls on Web View */}
      <div className="no-print" style={{
        marginBottom: '20px',
        display: 'flex',
        gap: '12px',
        background: '#ffffff',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <button
          onClick={() => window.print()}
          style={{
            background: '#4338ca',
            color: '#ffffff',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🖨 Save / Download as PDF
        </button>
        <button
          onClick={() => window.close()}
          style={{
            background: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Close Preview
        </button>
      </div>

      {/* A4 PAPER PAGE CONTAINER */}
      <div className="pdf-paper" style={{
        width: '210mm',
        minHeight: '297mm',
        background: '#ffffff',
        color: '#0f172a',
        padding: '18mm 20mm',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        boxSizing: 'border-box',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: '9.5pt',
        lineHeight: 1.5
      }}>

        {/* HEADER SECTION */}
        <header style={{
          borderBottom: '2.5pt solid #3730a3',
          paddingBottom: '14px',
          marginBottom: '18px'
        }}>
          <h1 style={{
            fontSize: '24pt',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 2pt 0',
            letterSpacing: '-0.5px'
          }}>
            {profile.name}
          </h1>

          <h2 style={{
            fontSize: '12.5pt',
            fontWeight: 700,
            color: '#4338ca',
            margin: '0 0 10px 0',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {profile.title}
          </h2>

          {/* Contact Details Grid */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '14px',
            fontSize: '9pt',
            color: '#334155',
            fontWeight: 500
          }}>
            {profile.email && <span>✉ {profile.email}</span>}
            {profile.phone && <span>📞 {profile.phone}</span>}
            {profile.location && <span>📍 {profile.location}</span>}
            {profile.website && <span>🌐 {profile.website}</span>}
            {profile.github && <span>💻 {profile.github}</span>}
            {profile.linkedin && <span>💼 {profile.linkedin}</span>}
          </div>

          {profile.bio && (
            <p style={{
              marginTop: '12px',
              fontSize: '9.5pt',
              color: '#475569',
              lineHeight: 1.5,
              marginBottom: 0
            }}>
              {profile.bio}
            </p>
          )}
        </header>

        {/* WORK EXPERIENCE */}
        <section style={{ marginBottom: '20px' }}>
          <h3 style={{
            fontSize: '11.5pt',
            fontWeight: 800,
            color: '#3730a3',
            borderBottom: '1pt solid #cbd5e1',
            paddingBottom: '4px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Professional Experience
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {experiences.map((exp) => (
              <div key={exp.id} style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                  <h4 style={{ fontSize: '10.5pt', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {exp.role} <span style={{ color: '#4338ca', fontWeight: 600 }}>| {exp.company}</span>
                  </h4>
                  <span style={{ fontSize: '8.5pt', fontWeight: 600, color: '#64748b' }}>
                    {exp.start_date} – {exp.end_date}
                  </span>
                </div>

                <p style={{ fontSize: '8.5pt', color: '#64748b', margin: '0 0 6px 0', fontStyle: 'italic' }}>
                  {exp.location}
                </p>

                <p style={{ fontSize: '9pt', color: '#334155', margin: '0 0 6px 0', lineHeight: 1.45 }}>
                  {exp.description}
                </p>

                {Array.isArray(exp.achievements) && exp.achievements.length > 0 && (
                  <ul style={{ margin: '0 0 0 16px', padding: 0, fontSize: '8.5pt', color: '#334155' }}>
                    {exp.achievements.map((ach, i) => (
                      <li key={i} style={{ marginBottom: '3px' }}>{ach}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* SKILLS SECTION */}
        <section style={{ marginBottom: '20px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h3 style={{
            fontSize: '11.5pt',
            fontWeight: 800,
            color: '#3730a3',
            borderBottom: '1pt solid #cbd5e1',
            paddingBottom: '4px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Technical Skills
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {Object.entries(skillsByCategory).map(([category, items]) => (
              <div key={category} style={{
                background: '#f8fafc',
                border: '1pt solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px'
              }}>
                <strong style={{ fontSize: '9pt', color: '#4338ca', display: 'block', marginBottom: '4px' }}>
                  {category}
                </strong>
                <div style={{ fontSize: '8.5pt', color: '#334155', lineHeight: 1.5 }}>
                  {items.map((sk) => sk.name).join(' • ')}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section style={{ marginBottom: '20px', breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h3 style={{
            fontSize: '11.5pt',
            fontWeight: 800,
            color: '#3730a3',
            borderBottom: '1pt solid #cbd5e1',
            paddingBottom: '4px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Key Projects
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {projects.map((proj) => (
              <div key={proj.id} style={{
                border: '1pt solid #e2e8f0',
                borderRadius: '6px',
                padding: '8px 12px',
                background: '#ffffff'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '9.5pt', color: '#0f172a' }}>{proj.title}</strong>
                  <span style={{ fontSize: '7.5pt', color: '#4338ca', fontWeight: 700, textTransform: 'uppercase' }}>{proj.category}</span>
                </div>
                <p style={{ fontSize: '8.5pt', color: '#475569', margin: '0 0 6px 0', lineHeight: 1.4 }}>
                  {proj.description}
                </p>
                {Array.isArray(proj.tags) && proj.tags.length > 0 && (
                  <div style={{ fontSize: '8pt', color: '#64748b', fontWeight: 600 }}>
                    Tech: {proj.tags.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* EDUCATION SECTION */}
        <section style={{ breakInside: 'avoid', pageBreakInside: 'avoid' }}>
          <h3 style={{
            fontSize: '11.5pt',
            fontWeight: 800,
            color: '#3730a3',
            borderBottom: '1pt solid #cbd5e1',
            paddingBottom: '4px',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Education & Certifications
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontSize: '10pt', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    {edu.degree}
                  </h4>
                  <p style={{ fontSize: '8.5pt', color: '#4338ca', margin: '2px 0 0 0', fontWeight: 600 }}>
                    {edu.institution} <span style={{ color: '#64748b', fontWeight: 400 }}>• {edu.location}</span>
                  </p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '8.5pt', color: '#64748b', fontWeight: 600 }}>
                  {edu.start_date} – {edu.end_date}
                  {edu.gpa && <div style={{ color: '#0f172a', fontWeight: 700 }}>{edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: #ffffff !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          .pdf-paper {
            box-shadow: none !important;
            padding: 0 !important;
            width: 100% !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}
