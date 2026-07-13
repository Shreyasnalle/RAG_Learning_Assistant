import React, { useEffect, useRef } from 'react';

export default function LandingPage() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    const DOT_SPACING = 32;
    const DOT_RADIUS = 1.5;
    const INTERACTION_RADIUS = 120;

    let mouse = { x: -1000, y: -1000 };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;

      dots = [];
      for (let x = 0; x < width; x += DOT_SPACING) {
        for (let y = 0; y < height; y += DOT_SPACING) {
          dots.push({ 
            x, 
            y, 
            baseX: x, 
            baseY: y, 
            vx: 0, 
            vy: 0, 
            size: DOT_RADIUS, 
            color: '#fb8569',
            scatterTimer: 0,
            mouseNearby: false
          });
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Spring force returning to base position slowly
        const springForceX = (dot.baseX - dot.x) * 0.02;
        const springForceY = (dot.baseY - dot.y) * 0.02;
        dot.vx += springForceX;
        dot.vy += springForceY;

        // When mouse gets close, trigger a 3-second (180 frames) decaying jitter
        if (distance < INTERACTION_RADIUS) {
          if (!dot.mouseNearby) {
            dot.mouseNearby = true;
            dot.scatterTimer = 180; 
          }
        } else {
          dot.mouseNearby = false;
        }

        if (dot.scatterTimer > 0) {
          dot.scatterTimer--;
          const decay = dot.scatterTimer / 180;
          const angle = Math.random() * Math.PI * 2;
          dot.vx += Math.cos(angle) * decay * 1.5;
          dot.vy += Math.sin(angle) * decay * 1.5;
        }

        // Apply friction and update position (dampened for slower ease-back)
        dot.vx *= 0.90;
        dot.vy *= 0.90;
        dot.x += dot.vx;
        dot.y += dot.vy;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#fb8569';
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    init();
    animate();

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleResize = () => {
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const navItem = (text) => (
    <div style={{ position: 'relative', display: 'inline-block' }} className="nav-link-wrapper">
      <a href="#" className="nav-link" style={{
        position: 'relative',
        color: '#fb8569',
        textDecoration: 'none',
        fontSize: '1rem',
        fontWeight: '600',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        paddingBottom: '4px',
        display: 'inline-block'
      }}>
        {text}
      </a>
      <div
        className="nav-underline"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '2px',
          backgroundColor: '#fb8569',
          transform: 'scaleX(0)',
          transformOrigin: 'left',
          transition: 'transform 0.4s cubic-bezier(0.19, 1, 0.22, 1)'
        }}
      />
    </div>
  );

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflow: 'hidden'
    }}>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        .nav-link-wrapper:hover .nav-underline {
          transform: scaleX(1) !important;
        }
        
        .signup-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px;
          color: #0d1f1c; /* Dark text */
          text-decoration: none;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 2px;
          overflow: hidden;
          transition: color 0.3s ease;
          background-color: transparent;
        }

        .signup-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #fb8569; /* Solid coral fill */
          z-index: -1;
          transform-origin: bottom;
          transition: transform 0.4s cubic-bezier(0.7, 0, 0.3, 1);
        }

        .signup-btn:hover {
          color: #fb8569;
        }

        .signup-btn:hover::before {
          transform: scaleY(0);
        }
      `}</style>

      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Header */}
      <header style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '4.5rem',
        padding: '30px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        justify: 'center',
        zIndex: 10,
        boxSizing: 'border-box',
        backgroundColor: '#0d1f1c',
        boxShadow: '0 0.25px 3px rgba(255, 201, 159, 0.33)',
      }}>
        <div style={{
          fontSize: '1.55rem',
          fontWeight: '800',
          letterSpacing: '0.15em',
          textTransform: 'uppercase'
        }}>
          SIMPLY
        </div>

        <nav style={{
          display: 'flex',
          gap: '2vw',
          alignItems: 'center'
        }}>
          {navItem('[ ABOUT ]')}
          {navItem('NAVIGATION')}
          {navItem('PRICING')}
          {navItem('CONTACT')}
          {navItem('NEXT')}

          <a href="#" className="signup-btn">
            SIGN IN/SIGN UP
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 5,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        padding: '0 8vw 15vh 8vw', 
        textAlign: 'center',
        gap : '2rem'
      }}>
        <h1 style={{
          fontSize: 'clamp(4rem, 8vw, 11rem)',
          fontWeight: '400',
          fontFamily: '"Satoshi", sans-serif', 
          letterSpacing: '0.05em',
          margin: '0 0 16px 0',
          lineHeight: '0.9',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <span>Learning shouldn't need ten tabs</span>
        </h1>
        <p style={{
          fontFamily: '"Satoshi", sans-serif',
          fontSize: 'clamp(0.95rem, 1.5vw, 1.35rem)',
          margin: 0,
          fontWeight: '500',
          letterSpacing: '0.08em',
        }}>
          No more tab switching for getting answers
        </p>
      </main>
    </div>
  );
}
