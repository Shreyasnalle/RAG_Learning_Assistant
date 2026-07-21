import React, { useEffect, useRef, useState } from 'react';

const ProductivityVisualizer = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 380;
    const height = 280;
    canvas.width = width;
    canvas.height = height;

    const columns = [
      { id: 0, x: 85, y: 215, width: 76, height: 110, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false },
      { id: 1, x: 190, y: 215, width: 76, height: 180, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false },
      { id: 2, x: 295, y: 215, width: 76, height: 145, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false }
    ];

    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    let animationFrameId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(20, 202);
      ctx.lineTo(360, 202);
      ctx.strokeStyle = '#fb8569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      columns.forEach(col => {
        const isHovered = (
          mouse.x >= col.x - col.width / 2 - 10 &&
          mouse.x <= col.x + col.width / 2 + 10 &&
          mouse.y >= col.y - col.height - 30 &&
          mouse.y <= col.y + 10
        );

        col.hovered = isHovered;
        col.targetScale = isHovered ? 1.12 : 1.0;
        col.currentScale += (col.targetScale - col.currentScale) * 0.15;

        if (isHovered) {
          col.dotOffset += 0.8;
        } else {
          col.dotOffset += 0.05;
        }

        const s = col.currentScale;
        const W = col.width * s;
        const H = col.height * s;
        const skew = W * 0.35;

        const topPeak = { x: col.x, y: col.y - H };
        const topLeft = { x: col.x - W / 2, y: col.y - H + skew / 2 };
        const topBottom = { x: col.x, y: col.y - H + skew };
        const topRight = { x: col.x + W / 2, y: col.y - H + skew / 2 };

        const bottomCenter = { x: col.x, y: col.y };
        const bottomLeft = { x: col.x - W / 2, y: col.y - skew / 2 };
        const bottomRight = { x: col.x + W / 2, y: col.y - skew / 2 };

        ctx.save();
        ctx.beginPath();
        const centerY = col.y - skew / 2;
        ctx.ellipse(col.x, centerY, W / 2, skew / 2, 0, 0, 2 * Math.PI);
        const shadowGrad = ctx.createRadialGradient(col.x, centerY, 0, col.x, centerY, W / 2);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();
        
        const leftGrad = ctx.createLinearGradient(topLeft.x, topLeft.y, bottomCenter.x, bottomCenter.y);
        leftGrad.addColorStop(0, '#242424');
        leftGrad.addColorStop(1, '#101010');
        ctx.fillStyle = leftGrad;
        ctx.fill();
        
        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = '#fb8569';
        const numDotCols = 5;
        const dotSpacingY = 12;
        for (let c = 0; c < numDotCols; c++) {
          const u = (c + 0.5) / numDotCols;
          const dx = -W/2 + u * (W/2);
          const px = col.x + dx;

          const yTop = topLeft.y * (1 - u) + topBottom.y * u;
          const yBottom = bottomLeft.y * (1 - u) + bottomCenter.y * u;

          const startY = yBottom - (col.dotOffset % dotSpacingY);
          for (let py = startY; py >= yTop; py -= dotSpacingY) {
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.closePath();
        
        const rightGrad = ctx.createLinearGradient(topBottom.x, topBottom.y, bottomRight.x, bottomRight.y);
        rightGrad.addColorStop(0, '#1a1a1a');
        rightGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = rightGrad;
        ctx.fill();
        
        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = 'rgba(251, 133, 105, 0.75)';
        for (let c = 0; c < numDotCols; c++) {
          const u = (c + 0.5) / numDotCols;
          const px = col.x + u * (W / 2);

          const yTop = topBottom.y * (1 - u) + topRight.y * u;
          const yBottom = bottomCenter.y * (1 - u) + bottomRight.y * u;

          const startY = yBottom - (col.dotOffset % dotSpacingY);
          for (let py = startY; py >= yTop; py -= dotSpacingY) {
            ctx.beginPath();
            ctx.arc(px, py, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topPeak.x, topPeak.y);
        ctx.lineTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.closePath();
        
        const topGrad = ctx.createLinearGradient(topLeft.x, topLeft.y, topRight.x, topRight.y);
        topGrad.addColorStop(0, '#ffac99');
        topGrad.addColorStop(1, '#fb8569');
        ctx.fillStyle = topGrad;
        ctx.fill();
        
        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.strokeStyle = 'rgba(251, 133, 105, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        margin: '20px auto 0 auto',
        maxWidth: '100%',
        height: 'auto',
        cursor: 'pointer',
        zIndex: 2
      }}
    />
  );
};

export default function AccountPage({ onNavigate }) {
  const canvasRef = useRef(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [transitionState, setTransitionState] = useState('idle');

  const handleToggleForm = (targetSignUp) => {
    if (transitionState !== 'idle') return;
    setTransitionState('sweeping-in');
    setTimeout(() => {
      setIsSignUp(targetSignUp);
      setTransitionState('sweeping-out');
    }, 600);
    setTimeout(() => {
      setTransitionState('idle');
    }, 1200);
  };


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width, height;
    let dots = [];
    const DOT_SPACING = 32;
    const DOT_RADIUS = 1.5;
    const INTERACTION_RADIUS = 180;

    let mouse = { x: -1000, y: -1000, lastMove: 0 };

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

      const isMouseMoving = (Date.now() - mouse.lastMove) < 150;

      dots.forEach(dot => {
        const dx = mouse.x - dot.x;
        const dy = mouse.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const springForceX = (dot.baseX - dot.x) * 0.025;
        const springForceY = (dot.baseY - dot.y) * 0.025;
        dot.vx += springForceX;
        dot.vy += springForceY;

        if (distance < INTERACTION_RADIUS && isMouseMoving) {
          const force = (INTERACTION_RADIUS - distance) / INTERACTION_RADIUS;
          const angle = Math.random() * Math.PI * 2;
          dot.vx += Math.cos(angle) * force * 2.0;
          dot.vy += Math.sin(angle) * force * 2.0;
        }

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
      mouse.lastMove = Date.now();
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

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0d1f1c',
      color: '#fb8569',
      fontFamily: '"Satoshi", sans-serif',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box'
    }}>
      <style>{`
        body, html {
          margin: 0;
          padding: 0;
          overflow: hidden;
          background-color: #0d1f1c;
        }

        .input-field {
          width: 100%;
          padding: 12px 16px;
          margin-bottom: 20px;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(251, 133, 105, 0.3);
          border-radius: 4px;
          color: #fb8569;
          font-family: "Satoshi", sans-serif;
          font-size: 1rem;
          box-sizing: border-box;
          outline: none;
          transition: border-color 0.3s ease;
        }

        .input-field:focus {
          border-color: #fb8569;
        }

        .continue-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 14px 20px;
          color: #0d1f1c;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          border: none;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: color 0.3s ease;
          background-color: transparent;
        }

        .continue-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #fb8569;
          z-index: -1;
          transform-origin: bottom;
          transition: transform 0.4s cubic-bezier(0.7, 0, 0.3, 1);
        }

        .continue-btn:hover {
          color: #fb8569;
        }

        .continue-btn:hover::before {
          transform: scaleY(0);
        }
        
        .continue-btn:active {
          border: 1.5px solid #fb8569;
        }

        .account-card-content {
          display: flex;
          align-items: stretch;
          justify-content: space-between;
          width: 100%;
        }

        .account-divider {
          width: 1.5px;
          background-color: rgba(251, 133, 105, 0.3);
          margin: 0 40px;
        }

        @media (max-width: 768px) {
          .account-card-content {
            flex-direction: column !important;
          }
          .account-divider {
            width: 100% !important;
            height: 1.5px !important;
            margin: 30px 0 !important;
          }
          .left-column {
            text-align: center !important;
            padding-right: 0 !important;
            margin-bottom: 20px;
          }
        }
      `}</style>

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

      <div style={{
        position: 'relative',
        zIndex: 5,
        width: '90%',
        maxWidth: '850px',
        minHeight: '75%',
        backgroundColor: '#0d1f1c',
        borderRadius: '24px',
        padding: '60px 48px',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.6)',
        border: '1.5px solid rgba(251, 133, 105, 0.2)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#fb8569',
          zIndex: 10,
          transform: (transitionState === 'sweeping-in') ? 'scaleX(1)' : 'scaleX(0)',
          transformOrigin: transitionState === 'sweeping-in' ? 'left' : 'right',
          transition: transitionState === 'idle' ? 'none' : 'transform 0.6s cubic-bezier(0.7, 0, 0.3, 1)',
          pointerEvents: 'none'
        }} />

        <div style={{ position: 'absolute', top: '20px', left: '30px', zIndex: 6 }}>
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }} style={{
            color: '#fb8569',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '600',
            letterSpacing: '0.15em',
            textTransform: 'uppercase'
          }}>
            ← BACK
          </a>
        </div>

        <div className="account-card-content" style={{ flexDirection: isSignUp ? 'row-reverse' : 'row' }}>
          <div className="left-column" style={{
            flex: '1 1 45%',
            paddingRight: isSignUp ? '0' : '20px',
            paddingLeft: isSignUp ? '20px' : '0',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            textAlign: 'left',
            boxSizing: 'border-box'
          }}>
            <h1 style={{
              fontSize: 'clamp(2.2rem, 3.5vw, 3rem)',
              fontWeight: '400',
              lineHeight: '1.1',
              letterSpacing: '0.2rem',
              textTransform: 'uppercase',
              margin: '0 0 20px 0'
            }}>
              SIMPLY
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 1.3vw, 1.2rem)',
              lineHeight: '1.6',
              opacity: 0.8,
              margin: '0 0 24px 0',
              letterSpacing: '0.08em'
            }}>
              Your learning shouldn't require ten tabs. Process transcripts, query concepts, and extract cited insights right where you watch.
            </p>
            <ProductivityVisualizer />
          </div>

          <div className="account-divider" />

          <div style={{
            flex: '1 1 45%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxSizing: 'border-box'
          }}>
            {!isSignUp ? (
              <>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '400',
                  marginBottom: '30px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  SIGN IN
                </h2>

                <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
                  <input 
                    type="email" 
                    placeholder="EMAIL ID" 
                    className="input-field"
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="PASSWORD" 
                    className="input-field"
                    required 
                  />
                  
                  <button type="submit" className="continue-btn">
                    CONTINUE
                  </button>
                </form>

                <div 
                  onClick={() => handleToggleForm(true)}
                  style={{ 
                    marginTop: '24px', 
                    fontSize: '0.85rem', 
                    opacity: 0.9, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  <span>Don't have an account? </span>
                  <span style={{ color: '#fb8569', fontWeight: 'bold', textDecoration: 'underline' }}>
                    create a new one here
                  </span>
                </div>
              </>
            ) : (
              <>
                <h2 style={{
                  fontSize: '1.8rem',
                  fontWeight: '400',
                  marginBottom: '20px',
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  CREATE ACCOUNT
                </h2>

                <form onSubmit={(e) => e.preventDefault()} style={{ width: '100%' }}>
                  <input 
                    type="text" 
                    placeholder="NAME" 
                    className="input-field"
                    style={{ marginBottom: '12px' }}
                    required 
                  />
                  <input 
                    type="tel" 
                    placeholder="MOBILE NUMBER" 
                    className="input-field"
                    style={{ marginBottom: '12px' }}
                    required 
                  />
                  <input 
                    type="email" 
                    placeholder="EMAIL ID" 
                    className="input-field"
                    style={{ marginBottom: '12px' }}
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="PASSWORD" 
                    className="input-field"
                    style={{ marginBottom: '12px' }}
                    required 
                  />
                  <input 
                    type="password" 
                    placeholder="CONFIRM PASSWORD" 
                    className="input-field"
                    style={{ marginBottom: '16px' }}
                    required 
                  />
                  
                  <button type="submit" className="continue-btn">
                    CREATE ACCOUNT
                  </button>
                </form>

                <div 
                  onClick={() => handleToggleForm(false)}
                  style={{ 
                    marginTop: '20px', 
                    fontSize: '0.85rem', 
                    opacity: 0.9, 
                    textAlign: 'center',
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
                >
                  <span>Already have an account? </span>
                  <span style={{ color: '#fb8569', fontWeight: 'bold', textDecoration: 'underline' }}>
                    sign in here
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
