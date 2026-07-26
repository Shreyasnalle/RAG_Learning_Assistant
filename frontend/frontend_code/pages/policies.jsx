import React, { useEffect } from 'react';

export default function PoliciesPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0a100d',
      color: '#e4e2dd',
      fontFamily: '"Satoshi", sans-serif',
      padding: '48px 24px'
    }}>
      <header style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '64px'
      }}>
        <h1 
          onClick={onNavigate}
          style={{ 
            color: '#fb8569', 
            margin: 0, 
            fontSize: '1.25rem', 
            fontWeight: 800, 
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
        >
          SIMPLY
        </h1>
        <button 
          onClick={onNavigate}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#e4e2dd',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          BACK HOME
        </button>
      </header>

      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        lineHeight: 1.7,
        fontSize: '1rem',
        opacity: 0.9
      }}>
        <h2 style={{ color: '#fb8569', fontSize: '2rem', marginBottom: '8px' }}>Privacy Policy for Simply</h2>
        <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '48px' }}>Last updated: July 26, 2026</p>
        
        <p>Simply ("we," "our," or "the extension") is a browser extension that helps users ask questions, get summaries, and understand concepts from YouTube videos without leaving the page. This policy explains what information we collect, how we use it, and how it is protected.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Information We Collect</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li><strong>Account information:</strong> When you sign up, we collect your name, email address, mobile number, and a securely hashed password. We never store your password in plain, readable form.</li>
          <li><strong>Video caption content:</strong> When you watch a YouTube video with the extension active, we read the video's caption/subtitle data directly from your browser session in order to answer your questions about that video. We do not access any other content on the page.</li>
          <li><strong>Chat history:</strong> We store the questions you ask and the answers you receive, associated with your account and the specific video, so you can view your past conversations when you return to a video.</li>
          <li><strong>Session information:</strong> We store a session token locally on your device after you log in, so you remain signed in across browser sessions.</li>
        </ul>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>How We Use Your Information</h3>
        <p>We use the information above solely to:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li>Authenticate your account and keep you signed in</li>
          <li>Generate answers to your questions using AI, grounded in the video's content</li>
          <li>Generate video summaries</li>
          <li>Show you your past conversations for a video when you return to it</li>
        </ul>
        <p style={{ marginTop: '16px' }}>We do not use your data for advertising, profiling, or any purpose unrelated to providing the core functionality described above.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Third-Party Services</h3>
        <p>We use the following trusted third-party services to operate Simply:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li><strong>Supabase</strong> — for secure account authentication and database storage of your profile and chat history.</li>
          <li><strong>Groq</strong> — to process your questions and generate AI responses. Question text and relevant video content are sent to Groq's API solely to generate an answer; Groq does not receive your name, email, or password.</li>
        </ul>
        <p style={{ marginTop: '16px' }}>We do not sell, rent, or share your personal information with any other third party.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Data Retention</h3>
        <p>We retain your account information and chat history for as long as your account remains active. You may request deletion of your account and associated data at any time by contacting us (see below).</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Your Rights</h3>
        <p>You may:</p>
        <ul style={{ listStyleType: 'disc', paddingLeft: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <li>Request a copy of the data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your account and all associated data</li>
        </ul>
        <p style={{ marginTop: '16px' }}>To exercise any of these rights, contact us using the email below.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Children's Privacy</h3>
        <p>Simply is not intended for use by children under 13. We do not knowingly collect personal information from children under 13.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Security</h3>
        <p>We take reasonable technical measures to protect your data, including encrypted password storage and secure, authenticated database access. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Changes to This Policy</h3>
        <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated "Last updated" date.</p>

        <h3 style={{ color: '#fb8569', marginTop: '32px', marginBottom: '16px' }}>Contact Us</h3>
        <p>If you have questions about this privacy policy or your data, contact us at:<br/>
        <a href="mailto:shreyas.nalle7@gmail.com" style={{ color: '#fb8569', textDecoration: 'none' }}>shreyas.nalle7@gmail.com</a></p>
      </main>
      
      <footer style={{
        maxWidth: '800px',
        margin: '64px auto 0',
        paddingTop: '24px',
        borderTop: '1px solid rgba(251, 133, 105, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: '0.8rem',
        opacity: 0.7,
        letterSpacing: '0.05em'
      }}>
        <span>Made with <span style={{ color: '#ff3b30' }}>❤️</span> by Shreyas Nalle</span>
      </footer>
    </div>
  );
}
