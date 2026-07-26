import React, { useEffect, useRef } from 'react';

const DotGridBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    const DOT_SPACING = 32;
    const DOT_RADIUS = 1.5;

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dots = [];
      for (let x = 0; x < width; x += DOT_SPACING) {
        for (let y = 0; y < height; y += DOT_SPACING) {
          dots.push({ x, y, baseX: x, baseY: y });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#fb8569';
      dots.forEach(dot => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleResize = () => init();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0
      }}
    />
  );
};

export default function PoliciesPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      minHeight: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      boxSizing: 'border-box',
      padding: '40px 20px'
    }}>
      <style>{`
        * {
          font-family: 'Satoshi', sans-serif !important;
        }
        body, html {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #0d1f1c;
        }
        .nav-link-wrapper:hover .nav-underline {
          width: 100% !important;
        }
        .step-card {
          background-color: rgba(255, 255, 255, 0.015);
          border: 1.5px solid rgba(251, 133, 105, 0.15);
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 24px;
          transition: all 0.3s ease;
          color: #e4e2dd;
          line-height: 1.7;
          opacity: 0.9;
        }
        .step-card:hover {
          border-color: rgba(251, 133, 105, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .step-card h3 {
          color: #fb8569;
          margin-top: 0;
          margin-bottom: 16px;
          font-size: 1.25rem;
        }
        .step-card ul {
          list-style-type: disc;
          padding-left: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0;
        }
      `}</style>

      <DotGridBackground />

      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        maxWidth: '950px',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '80px 40px 50px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        border: '1.5px solid rgba(251, 133, 105, 0.2)',
        boxSizing: 'border-box',
        marginBottom: '40px'
      }}>
        <div style={{ position: 'absolute', top: '25px', left: '30px', display: 'inline-block' }} className="nav-link-wrapper">
          <a
            href="#/"
            onClick={(e) => { e.preventDefault(); onNavigate(); }}
            className="back-btn"
            style={{
              color: '#fb8569',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px',
              cursor: 'pointer'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            BACK HOME
          </a>
          <div className="nav-underline" style={{
            height: '2px',
            backgroundColor: '#fb8569',
            width: '0%',
            transition: 'width 0.3s ease',
            marginTop: '2px'
          }}></div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '50px', marginTop: '20px' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: '800', 
            margin: '0 0 16px 0',
            letterSpacing: '0.02em',
            color: '#fb8569'
          }}>
            Privacy Policy
          </h1>
          <p style={{ opacity: 0.7, fontSize: '1.1rem', margin: 0, color: '#e4e2dd' }}>Last updated: July 26, 2026</p>
        </div>

        <div className="step-card">
          <p style={{ margin: 0 }}>Simply ("we," "our," or "the extension") is a browser extension that helps users ask questions, get summaries, and understand concepts from YouTube videos without leaving the page. This policy explains what information we collect, how we use it, and how it is protected.</p>
        </div>

        <div className="step-card">
          <h3>Information We Collect</h3>
          <ul>
            <li><strong>Account information:</strong> When you sign up, we collect your name, email address, mobile number, and a securely hashed password. We never store your password in plain, readable form.</li>
            <li><strong>Video caption content:</strong> When you watch a YouTube video with the extension active, we read the video's caption/subtitle data directly from your browser session in order to answer your questions about that video. We do not access any other content on the page.</li>
            <li><strong>Chat history:</strong> We store the questions you ask and the answers you receive, associated with your account and the specific video, so you can view your past conversations when you return to a video.</li>
            <li><strong>Session information:</strong> We store a session token locally on your device after you log in, so you remain signed in across browser sessions.</li>
          </ul>
        </div>

        <div className="step-card">
          <h3>How We Use Your Information</h3>
          <p style={{ marginTop: 0, marginBottom: '16px' }}>We use the information above solely to:</p>
          <ul>
            <li>Authenticate your account and keep you signed in</li>
            <li>Generate answers to your questions using AI, grounded in the video's content</li>
            <li>Generate video summaries</li>
            <li>Show you your past conversations for a video when you return to it</li>
          </ul>
          <p style={{ marginTop: '16px', marginBottom: 0 }}>We do not use your data for advertising, profiling, or any purpose unrelated to providing the core functionality described above.</p>
        </div>

        <div className="step-card">
          <h3>Third-Party Services</h3>
          <p style={{ marginTop: 0, marginBottom: '16px' }}>We use the following trusted third-party services to operate Simply:</p>
          <ul>
            <li><strong>Supabase</strong> — for secure account authentication and database storage of your profile and chat history.</li>
            <li><strong>Groq</strong> — to process your questions and generate AI responses. Question text and relevant video content are sent to Groq's API solely to generate an answer; Groq does not receive your name, email, or password.</li>
          </ul>
          <p style={{ marginTop: '16px', marginBottom: 0 }}>We do not sell, rent, or share your personal information with any other third party.</p>
        </div>

        <div className="step-card">
          <h3>Data Retention</h3>
          <p style={{ margin: 0 }}>We retain your account information and chat history for as long as your account remains active. You may request deletion of your account and associated data at any time by contacting us (see below).</p>
        </div>

        <div className="step-card">
          <h3>Your Rights</h3>
          <p style={{ marginTop: 0, marginBottom: '16px' }}>You may:</p>
          <ul>
            <li>Request a copy of the data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and all associated data</li>
          </ul>
          <p style={{ marginTop: '16px', marginBottom: 0 }}>To exercise any of these rights, contact us using the email below.</p>
        </div>

        <div className="step-card">
          <h3>Children's Privacy</h3>
          <p style={{ margin: 0 }}>Simply is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.</p>
        </div>

        <div className="step-card">
          <h3>Security</h3>
          <p style={{ margin: 0 }}>We take reasonable technical measures to protect your data, including encrypted password storage and secure, authenticated database access. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>
        </div>

        <div className="step-card">
          <h3>Changes to This Policy</h3>
          <p style={{ margin: 0 }}>We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>
        </div>

        <div className="step-card">
          <h3>Contact Us</h3>
          <p style={{ margin: 0 }}>If you have questions about this privacy policy or your data, contact us at:<br/>
          <a href="mailto:shreyas.nalle7@gmail.com" style={{ color: '#fb8569', textDecoration: 'none' }}>shreyas.nalle7@gmail.com</a></p>
        </div>
      </div>
      
      <div style={{
        width: '100%',
        maxWidth: '950px',
        paddingTop: '24px',
        borderTop: '1px solid rgba(251, 133, 105, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8rem',
        color: '#e4e2dd',
        opacity: 0.7,
        letterSpacing: '0.05em',
        zIndex: 5
      }}>
        <span>Made with <span style={{ color: '#ff3b30' }}>❤️</span> by Shreyas Nalle</span>
      </div>
    </div>
  );
}
