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

export default function RetrievalPage({ onNavigate }) {
  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflowX: 'hidden',
      overflowY: 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      padding: '40px 20px'
    }}>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          background-color: #0d1f1c;
        }
        .back-btn:hover {
          opacity: 1 !important;
          text-shadow: 0 0 8px rgba(251, 133, 105, 0.6);
        }
        .step-card {
          background-color: rgba(255, 255, 255, 0.015);
          border: 1.5px solid rgba(251, 133, 105, 0.15);
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }
        .step-card:hover {
          border-color: rgba(251, 133, 105, 0.4);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
        }
        .example-box {
          background-color: rgba(13, 31, 28, 0.8);
          border-left: 4px solid #fb8569;
          padding: 16px;
          border-radius: 4px;
          margin-top: 12px;
        }
      `}</style>

      {/* Canvas Background */}
      <DotGridBackground />

      {/* Main Container */}
      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        maxWidth: '950px',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '50px 40px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        border: '1.5px solid rgba(251, 133, 105, 0.2)',
        boxSizing: 'border-box'
      }}>
        {/* Back Link */}
        <div style={{ position: 'absolute', top: '25px', left: '30px' }}>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); onNavigate(); }}
            className="back-btn"
            style={{
              color: '#fb8569',
              textDecoration: 'none',
              fontSize: '0.85rem',
              fontWeight: '600',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              opacity: 0.8,
              transition: 'opacity 0.2s ease'
            }}
          >
            ← BACK TO LANDING
          </a>
        </div>

        {/* Title */}
        <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '40px' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '400',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            margin: '0 0 10px 0'
          }}>
            Semantic Retrieval
          </h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>
            Find precise segments in transcripts and extract cited insights instantly from YouTube videos.
          </p>
        </div>

        {/* content columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {/* How it works */}
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              How it works
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="step-card">
                <span style={{ fontSize: '0.85rem', color: '#fb8569', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>STEP 01</span>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Transcript Chunking</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.5' }}>
                  The video transcript is parsed and grouped into cohesive, semantic blocks of text to maintain logical context.
                </p>
              </div>

              <div className="step-card">
                <span style={{ fontSize: '0.85rem', color: '#fb8569', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>STEP 02</span>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Vector Embeddings</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.5' }}>
                  Each block is converted into a vector embedding. When you search, your query is also embedded to search for semantic matches.
                </p>
              </div>

              <div className="step-card">
                <span style={{ fontSize: '0.85rem', color: '#fb8569', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>STEP 03</span>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px 0', fontWeight: 'bold' }}>Top-K Matching & RAG</h3>
                <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.7, lineHeight: '1.5' }}>
                  The RAG pipeline extracts the top 5 most relevant segments and feeds them into the model to construct a cited answer.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Example */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '500', marginBottom: '20px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Retrieval Example
            </h2>
            <div className="step-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', margin: '0 0 8px 0' }}>User Question:</p>
                <div style={{ fontStyle: 'italic', opacity: 0.9, backgroundColor: 'rgba(251, 133, 105, 0.1)', padding: '10px 14px', borderRadius: '4px', marginBottom: '20px' }}>
                  "What model did Anthropic launch and what is its performance?"
                </div>

                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', margin: '0 0 8px 0' }}>Retrieved Transcript segment:</p>
                <div className="example-box">
                  <span style={{ fontSize: '0.8rem', color: '#fb8569', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>[03:14 - 03:52]</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.8, lineHeight: '1.4' }}>
                    "...today Anthropic introduces Claude 3.5 Sonnet. It sets new industry benchmarks for graduate-level reasoning and undergraduate-level knowledge, outperforming competitive models..."
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(251, 133, 105, 0.15)', paddingTop: '16px' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', margin: '0 0 8px 0' }}>Generated Answer:</p>
                <p style={{ margin: 0, fontSize: '0.88rem', opacity: 0.9, lineHeight: '1.5' }}>
                  Anthropic launched **Claude 3.5 Sonnet**, which sets new industry benchmarks in graduate-level reasoning and undergraduate-level knowledge, outperforming other competitor models <span style={{ color: '#fb8569', fontWeight: 'bold' }}>[03:14]</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
