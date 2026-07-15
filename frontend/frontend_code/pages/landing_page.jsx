import React, { useEffect, useRef, useState } from 'react';

const PricingVisual = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = 300;
    let height = 300;
    canvas.width = width;
    canvas.height = height;

    const homeX = width / 2;
    const homeY = height / 2;

    let ball = { x: homeX, y: homeY, targetX: homeX, targetY: homeY };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      // Limit influence area to make it subtle
      ball.targetX = homeX + (localX - homeX) * 0.2;
      ball.targetY = homeY + (localY - homeY) * 0.2;

      // Clamp movement within 35px
      const dx = ball.targetX - homeX;
      const dy = ball.targetY - homeY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 35) {
        ball.targetX = homeX + (dx / dist) * 35;
        ball.targetY = homeY + (dy / dist) * 35;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      ball.x += (ball.targetX - ball.x) * 0.5;
      ball.y += (ball.targetY - ball.y) * 0.5;

      // Draw background dot grid inside the circular bounds
      ctx.fillStyle = 'rgba(251, 133, 105, 0.15)';
      const dotSpacing = 16;
      for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
          const dx = x - homeX;
          const dy = y - homeY;
          if (dx * dx + dy * dy < 142 * 142) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      const numCircles = 8;
      const baseRadius = 15;
      const spacing = 16;

      for (let i = numCircles - 1; i >= 0; i--) {
        const radius = baseRadius + i * spacing;
        const factor = (numCircles - i) / numCircles; // Inner circles offset more
        
        // Offset circles only in the direction of the mouse displacement
        const cx = homeX + (ball.x - homeX) * factor;
        const cy = homeY + (ball.y - homeY) * factor;

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        
        if (i === 0) {
          ctx.fillStyle = '#fb8569'; // Strong orange solid circle
          ctx.fill();
        } else {
          ctx.strokeStyle = 'rgba(251, 133, 105, 0.8)'; // Darker orange outlines
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        width: '300px', 
        height: '300px', 
        opacity: 0.95,
        borderRadius: '50%',
        border: '1.5px solid rgba(251, 133, 105, 0.45)', // Outer rim matching the others
        boxSizing: 'border-box'
      }} 
    />
  );
};

export default function LandingPage({ onNavigateToAccount }) {
  const canvasRef = useRef(null);
  const [activeHighlight, setActiveHighlight] = useState(null);

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

  const navItem = (text, targetId) => {
    const handleClick = (e) => {
      e.preventDefault();
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (targetId !== 'contact') {
          setActiveHighlight(targetId);
          setTimeout(() => setActiveHighlight(null), 1000);
        }
      }
    };

    return (
      <div style={{ position: 'relative', display: 'inline-block' }} className="nav-link-wrapper">
        <a href={`#${targetId}`} onClick={handleClick} className="nav-link" style={{
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
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflowX: 'hidden',
      overflowY: 'auto'
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
          position: 'fixed',
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
          {navItem('[ ABOUT ]', 'about')}
          {navItem('NAVIGATION', 'navigation')}
          {navItem('PRICING', 'pricing')}
          {navItem('CONTACT', 'contact')}

          <a href="#/account" onClick={(e) => { e.preventDefault(); onNavigateToAccount(); }} className="signup-btn">
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
        height: '100vh', 
        padding: '0 8vw', 
        textAlign: 'center',
        gap : '2rem',
        boxSizing: 'border-box'
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

      <section style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        margin: '0 auto 100px auto',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '60px 48px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
      }}>
        {/* About Part */}
        <div id="about" style={{
          transform: activeHighlight === 'about' ? 'scale(1.025)' : 'scale(1)',
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.15em' }}>
            <span>ABOUT</span>
            <span>PART [01]</span>
          </div>
          <div style={{ height: '1.5px', backgroundColor: 'rgba(251, 133, 105, 0.2)', width: '100%', margin: '16px 0 60px 0' }} />
          
          <div style={{ display: 'flex', gap: '80px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', textAlign: 'left' }}>
              <h2 style={{ fontSize: '3rem', fontWeight: '400', margin: '0 0 24px 0', lineHeight: '1.1', fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.25rem'}}>
                SIMPLY by the numbers
              </h2>
              <p style={{ letterSpacing:'0.15rem',fontSize: '1.2rem', lineHeight: '1.6', opacity: 0.8, margin: '0 0 20px 0', fontFamily: '"Satoshi", sans-serif',}}>
                Simply is a modern RAG-based learning assistant designed specifically for YouTube videos. It allows you to query,answers, summarize and extract core insights from videos without the tedious tab switching
              </p>
              <p style={{ letterSpacing:'0.15rem', fontSize: '1.1rem', lineHeight: '1.6', opacity: 0.8, margin: 0 }}>
                Built to streamline your learning pipeline, it processes transcripts, understands it and answers where you watch.
              </p>
            </div>
            
            <div style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ 
                border: '1px solid rgba(251, 133, 105, 0.3)', 
                borderRadius: '16px', 
                width: '100%', 
                padding: '40px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '20px',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: '1.2rem', opacity: 0.7 , letterSpacing:'0.15rem', fontFamily: '"Satoshi", sans-serif'}}>PRODUCTIVITY</span>
                <div style={{ width: '1px', height: '40px', backgroundColor: 'rgba(251, 133, 105, 0.3)' }} />
                <div style={{ 
                  display: 'inline-flex', 
                  border: '1px solid rgba(251, 133, 105, 0.3)',
                  borderRadius: '8px',
                  overflow: 'hidden'
                }}>
                  <span style={{ backgroundColor: '#fb8569', color: '#0d1f1c', padding: '16px 24px', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.25rem'}}>10X</span>
                  <span style={{ padding: '16px 24px', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.25rem'}}>FASTER</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Separator Gap inside the single container */}
        <div style={{ height: '100px' }} />

        {/* Navigation Part */}
        <div id="navigation" style={{
          transform: activeHighlight === 'navigation' ? 'scale(1.025)' : 'scale(1)',
          transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          transformOrigin: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.15em'}}>
            <span>NAVIGATION</span>
            <span>PART [02]</span>
          </div>
          <div style={{ height: '1.5px', backgroundColor: 'rgba(251, 133, 105, 0.2)', width: '100%', margin: '16px 0 60px 0' }} />
          
          <div style={{
            border: '1.5px solid rgba(251, 133, 105, 0.3)',
            borderRadius: '24px',
            padding: '80px 48px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            boxSizing: 'border-box',
            position: 'relative'
          }}>
            <h3 style={{
              fontSize: 'clamp(2rem, 3.5vw, 3rem)',
              fontWeight: '400',
              lineHeight: '1.2',
              margin: 0,
              maxWidth: '850px',
              letterSpacing: '0.15em'
            }}>
              "Download SIMPLY from browser extensions"
            </h3>
            
            <a href="#" className="signup-btn" style={{
              padding: '12px 28px',
              fontSize: '1rem',
              fontWeight: '700',
              letterSpacing: '0.35em'
            }}>
              GET EXTENSION
            </a>
          </div>
        </div>
      </section>

      {/* Pricing Section (Part 04) */}
      <section id="pricing" style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        margin: '0 auto 100px auto',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '60px 48px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        boxSizing: 'border-box',
        transform: activeHighlight === 'pricing' ? 'scale(1.025)' : 'scale(1)',
        transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        transformOrigin: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', width: '100%', fontSize: '1rem', fontWeight: 'bold', letterSpacing: '0.15em' }}>
          <span>PRICING</span>
          <span>PART [04]</span>
        </div>
        <div style={{ height: '1.5px', backgroundColor: 'rgba(251, 133, 105, 0.2)', width: '100%', margin: '16px 0 60px 0' }} />
        
        {/* Container for Visuals and Pricing Cards */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '20px', flexWrap: 'wrap' }}>
          
          {/* Left Interactive Sphere Visual */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: '1 1 200px', minWidth: '200px' }}>
            <PricingVisual />
          </div>

          {/* Pricing Cards Container */}
          <div style={{ display: 'flex', gap: '30px', flex: '3 1 600px', justifyContent: 'center', flexWrap: 'wrap' }}>
            
            {/* Student Card */}
            <div style={{
              flex: '1 1 280px',
              maxWidth: '360px',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              border: '1.5px solid rgba(251, 133, 105, 0.3)',
              borderRadius: '24px',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '24px',
              boxSizing: 'border-box',
            }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.05em' }}>STUDENT</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0, fontFamily: '"Satoshi", sans-serif' }}>Perfect for getting started with SIMPLY</p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: '700', color: 'rgba(251, 133, 105, 0.3)' }}>$5<span style={{ fontSize: '1.1rem', fontWeight: '400' }}>/mo</span></span>
                  {/* Diagonal cut line */}
                  <div style={{
                    position: 'absolute',
                    top: '55%',
                    left: '-5%',
                    width: '110%',
                    height: '2.5px',
                    backgroundColor: '#fb8569',
                    transform: 'rotate(-12deg)'
                  }} />
                </div>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: '#fb8569', lineHeight: '1' }}>FREE</span>
              </div>

              <a href="#" className="signup-btn" style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 20px',
                fontSize: '0.95rem',
                fontWeight: '700',
                marginTop: '10px',
                textAlign: 'center',
                letterSpacing: '0.3em'
              }}>
                GET STARTED
              </a>
            </div>

            {/* Institutions Card */}
            <div style={{
              flex: '1 1 280px',
              maxWidth: '360px',
              backgroundColor: 'rgba(255, 255, 255, 0.015)',
              border: '1.5px solid rgba(251, 133, 105, 0.15)',
              borderRadius: '24px',
              padding: '40px 30px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              minHeight: '340px',
              boxSizing: 'border-box'
            }}>
              <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', margin: '0 0 8px 0', fontFamily: '"Satoshi", sans-serif', letterSpacing: '0.05em' }}>INSTITUTIONS</h3>
                <p style={{ fontSize: '0.9rem', opacity: 0.7, margin: 0, fontFamily: '"Satoshi", sans-serif' }}>Scale learning across your organization</p>
              </div>

              <div style={{ margin: '30px 0' }}>
                <span style={{ fontSize: '2rem', fontWeight: '800', opacity: 0.8, letterSpacing: '0.1em' }}>YET TO COME</span>
              </div>

              <div style={{
                width: '100%',
                border: '1.5px dashed rgba(251, 133, 105, 0.25)',
                borderRadius: '2px',
                color: 'rgba(251, 133, 105, 0.5)',
                textAlign: 'center',
                padding: '12px 0',
                fontSize: '0.9rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
              }}>
                COMING SOON
              </div>
            </div>

          </div>

          {/* Right Interactive Sphere Visual */}
          <div style={{ display: 'flex', justifyContent: 'center', flex: '1 1 200px', minWidth: '200px' }}>
            <PricingVisual />
          </div>

        </div>
      </section>

      {/* Footer Section */}
      <footer id="contact" style={{
        position: 'relative',
        zIndex: 5,
        width: '100%',
        backgroundColor: '#0d1f1c',
        padding: '60px 48px 40px 48px',
        boxSizing: 'border-box',
        color: '#fb8569',
        fontFamily: '"Satoshi", sans-serif',
      }}>
        {/* Top border bar */}
        <div style={{ height: '1.5px', backgroundColor: 'rgba(251, 133, 105, 0.25)', width: '100%', marginBottom: '24px' }} />

        {/* First Row: Brand, terms, socials */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          fontSize: '0.85rem',
          fontWeight: '500',
          letterSpacing: '0.08em'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.15em' }}>SIMPLY</span>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Terms</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Privacy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Disclosures</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', opacity: 0.8 }}>Cookie Settings</a>
            <span style={{ opacity: 0.6 }}>© AL Advisors Management Inc.</span>
          </div>

          {/* Social Links styled like reference brackets */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '1rem' }}>
              <span>[ </span>
              <span style={{ fontWeight: 'bold' }}>f</span>
              <span> ]</span>
            </a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '1rem' }}>
              <span>[ </span>
              <span style={{ fontWeight: 'bold' }}>in</span>
              <span> ]</span>
            </a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none', fontSize: '1rem' }}>
              <span>[ </span>
              <span style={{ fontWeight: 'bold' }}>𝕏</span>
              <span> ]</span>
            </a>
          </div>
        </div>

        {/* Middle border bar */}
        <div style={{ height: '1.5px', backgroundColor: 'rgba(251, 133, 105, 0.25)', width: '100%', margin: '24px 0' }} />

        {/* Features Section */}
        <div style={{ textAlign: 'left', marginBottom: '40px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 16px 0' }}>FEATURES</h4>
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', fontSize: '0.9rem', fontWeight: '600', letterSpacing: '0.1em' }}>
            <span style={{ opacity: 0.8 }}>RETRIEVAL</span>
            <span style={{ opacity: 0.8 }}>SUMMARY</span>
          </div>
        </div>

        {/* Very thin separator line */}
        <div style={{ height: '1px', backgroundColor: 'rgba(251, 133, 105, 0.1)', width: '100%', marginBottom: '24px' }} />

        {/* Copyright & Made with love Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          fontSize: '0.8rem',
          opacity: 0.7,
          letterSpacing: '0.05em'
        }}>
          <span>© 2026 Make Design. All rights reserved.</span>
          <span style={{ margin: '0 12px' }}>|</span>
          <span>Made with <span style={{ color: '#ff3b30' }}>❤️</span> by Shreyas Nalle</span>
        </div>
      </footer>
    </div>
  );
}
