import { useEffect, useRef, useState } from 'react';

const navItems = [
  { label: 'About', background: '#8dd0f0', rotate: '-5deg', delay: '0.22s' },
  { label: 'Navigation', background: '#74c98f', rotate: '4deg', delay: '0.3s' },
  { label: 'Contact', background: '#d8a1f2', rotate: '3deg', delay: '0.38s' },
];

const letterCubes = [
  {
    letter: 'S',
    background: '#f16424',
    side: '#b53820',
    left: '4%',
    top: '43%',
    rotate: '-8deg',
    delay: '0.82s',
    float: '3.9s',
  },
  {
    letter: 'I',
    background: '#efe5ff',
    side: '#60b7e9',
    left: '11%',
    top: '54%',
    rotate: '14deg',
    delay: '0.93s',
    float: '4.2s',
  },
  {
    letter: 'M',
    background: '#7a6cf6',
    side: '#e77ac7',
    left: '3%',
    top: '66%',
    rotate: '-5deg',
    delay: '1.04s',
    float: '4.6s',
  },
  {
    letter: 'P',
    background: '#69d79b',
    side: '#52b7ec',
    left: '14%',
    top: '80%',
    rotate: '-9deg',
    delay: '1.15s',
    float: '3.8s',
  },
  {
    letter: 'L',
    background: '#f8d85d',
    side: '#64c57c',
    right: '12%',
    top: '65%',
    rotate: '13deg',
    delay: '1.06s',
    float: '4.1s',
  },
  {
    letter: 'Y',
    background: '#f3a1b7',
    side: '#d872bc',
    right: '4%',
    top: '76%',
    rotate: '12deg',
    delay: '1.17s',
    float: '4.4s',
  },
];

const decorativeIcons = [
  { type: 'sparkle', left: '13%', top: '41%', delay: '1.25s', scale: 1.15 },
  { type: 'sparkleSmall', left: '16%', top: '45%', delay: '1.32s', scale: 0.9 },
  { type: 'moon', left: '8%', top: '80%', delay: '1.36s', scale: 1 },
  { type: 'dot', left: '14%', top: '71%', delay: '1.42s', color: '#675cf2' },
  { type: 'diamond', left: '2.7%', top: '56%', delay: '1.48s', color: '#ffffff' },
  { type: 'chat', right: '10%', top: '43%', delay: '1.28s', scale: 1 },
  { type: 'magnet', right: '3.7%', top: '42%', delay: '1.38s', rotate: '22deg' },
  { type: 'magnet', right: '5%', top: '56%', delay: '1.45s', rotate: '-12deg' },
  { type: 'diamond', right: '13%', top: '58%', delay: '1.52s', color: '#f7cf4b' },
  { type: 'pointer', right: '14%', top: '85%', delay: '1.58s', scale: 0.95 },
];

const aboutBullets = [
  'Switching tabs to search for explanations, documentation or answers to your doubts interrupts your learning experience',
  'stays on your current tab to answer questions, summarize content, explain concepts and navigate you to the relevant part of the lecture',
  'Download and install the Chrome extension',
];

const browserDots = [
  { id: 'close', color: '#f35a4f', glow: '#ff9189' },
  { id: 'minimize', color: '#ffd65a', glow: '#fff0a6' },
  { id: 'maximize', color: '#79c863', glow: '#b6ef9f' },
];

const fontScript =
  '"Brush Script MT", "Segoe Script", "Comic Sans MS", cursive';

function getIcon(icon) {
  const base = {
    position: 'absolute',
    animation: `riseIn 0.72s cubic-bezier(.2,.9,.25,1.18) ${icon.delay} both`,
    transform: `scale(${icon.scale || 1}) rotate(${icon.rotate || '0deg'})`,
    zIndex: 4,
  };

  const placement = {
    left: icon.left,
    right: icon.right,
    top: icon.top,
  };

  if (icon.type === 'sparkle' || icon.type === 'sparkleSmall') {
    const size = icon.type === 'sparkle' ? 42 : 25;

    return (
      <div
        key={`${icon.type}-${icon.left}-${icon.top}`}
        style={{ ...base, ...placement, width: size, height: size }}
        aria-hidden="true"
      >
        <span
          style={{
            position: 'absolute',
            inset: '16% 42%',
            background: '#fffaf0',
            border: '2px solid #15120f',
            borderRadius: '999px',
            boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            inset: '42% 16%',
            background: '#fffaf0',
            border: '2px solid #15120f',
            borderRadius: '999px',
          }}
        />
      </div>
    );
  }

  if (icon.type === 'moon') {
    return (
      <div
        key={`${icon.type}-${icon.left}-${icon.top}`}
        style={{
          ...base,
          ...placement,
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: '#ffd45a',
          border: '3px solid #15120f',
          boxShadow: '6px 5px 0 rgba(0,0,0,0.22)',
        }}
        aria-hidden="true"
      >
        <span
          style={{
            position: 'absolute',
            top: -5,
            left: 10,
            width: 31,
            height: 31,
            borderRadius: '50%',
            background: '#d94f2d',
          }}
        />
      </div>
    );
  }

  if (icon.type === 'chat') {
    return (
      <div
        key={`${icon.type}-${icon.right}-${icon.top}`}
        style={{
          ...base,
          ...placement,
          width: 78,
          height: 43,
          border: '3px solid #15120f',
          borderRadius: '26px 26px 22px 22px',
          background: '#fff9e8',
          boxShadow: '8px 8px 0 #1a1512',
        }}
        aria-hidden="true"
      >
        {['#f18ca4', '#d7b1f5', '#9ed6bf'].map((color, index) => (
          <span
            key={color}
            style={{
              position: 'absolute',
              left: 19 + index * 16,
              top: 12,
              width: 9,
              height: 9,
              borderRadius: '50%',
              background: color,
              border: '2px solid #15120f',
            }}
          />
        ))}
      </div>
    );
  }

  if (icon.type === 'magnet') {
    return (
      <div
        key={`${icon.type}-${icon.right}-${icon.top}-${icon.rotate}`}
        style={{ ...base, ...placement, width: 39, height: 47 }}
        aria-hidden="true"
      >
        <span
          style={{
            position: 'absolute',
            inset: 0,
            border: '8px solid #72bde9',
            borderBottomColor: 'transparent',
            borderRadius: '28px 28px 8px 8px',
            boxShadow: '4px 4px 0 #1a1512',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 0,
            bottom: 5,
            width: 10,
            height: 12,
            background: '#f392a8',
            border: '2px solid #15120f',
          }}
        />
        <span
          style={{
            position: 'absolute',
            right: 0,
            bottom: 5,
            width: 10,
            height: 12,
            background: '#f392a8',
            border: '2px solid #15120f',
          }}
        />
      </div>
    );
  }

  if (icon.type === 'pointer') {
    return (
      <div
        key={`${icon.type}-${icon.right}-${icon.top}`}
        style={{ ...base, ...placement, width: 58, height: 43 }}
        aria-hidden="true"
      >
        <span
          style={{
            position: 'absolute',
            left: 5,
            top: 16,
            width: 42,
            height: 13,
            background: '#f6eee0',
            border: '3px solid #15120f',
            transform: 'rotate(-18deg)',
          }}
        />
        <span
          style={{
            position: 'absolute',
            left: 2,
            top: 6,
            width: 24,
            height: 24,
            background: '#f4cf45',
            border: '3px solid #15120f',
            transform: 'rotate(17deg)',
            boxShadow: '7px 7px 0 #e68ca8',
          }}
        />
      </div>
    );
  }

  return (
    <span
      key={`${icon.type}-${icon.left}-${icon.right}-${icon.top}`}
      style={{
        ...base,
        ...placement,
        width: 12,
        height: 12,
        border: '2px solid #15120f',
        background: icon.color,
        transform: `rotate(45deg) scale(${icon.scale || 1})`,
      }}
      aria-hidden="true"
    />
  );
}

export default function LandingPage() {
  const aboutRef = useRef(null);
  const [aboutActive, setAboutActive] = useState(false);
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredCube, setHoveredCube] = useState(null);
  const [hoveredAbout, setHoveredAbout] = useState(null);

  useEffect(() => {
    const node = aboutRef.current;

    if (!node) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAboutActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.36 },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const styles = {
    section: {
      position: 'relative',
      minHeight: '720px',
      overflow: 'hidden',
      backgroundColor: '#d94f2d',
      backgroundImage:
        'linear-gradient(rgba(13, 13, 13, 0.34) 2px, transparent 2px), linear-gradient(90deg, rgba(13, 13, 13, 0.34) 2px, transparent 2px)',
      backgroundSize: '42px 42px',
      animation: 'gridScroll 4.6s linear infinite',
      color: '#11100f',
      fontFamily: '"Arial Rounded MT Bold", Arial, sans-serif',
      isolation: 'isolate',
    },
    header: {
      position: 'relative',
      zIndex: 8,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 28,
      width: 'min(1120px, calc(100% - 72px))',
      margin: '0 auto',
      paddingTop: 38,
      animation: 'riseIn 0.72s cubic-bezier(.2,.9,.25,1.18) 0.06s both',
    },
    logo: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 188,
      height: 74,
      padding: '0 36px',
      border: '4px solid #100f0d',
      borderRadius: 999,
      background: '#ffc928',
      boxShadow: '10px 12px 0 #100f0d',
      color: '#050505',
      fontFamily: fontScript,
      fontSize: '3.25rem',
      fontWeight: 800,
      lineHeight: 1,
      letterSpacing: 0,
    },
    navShell: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
      minHeight: 82,
      padding: '0 42px',
      background: '#ffd9a2',
      border: '4px solid #100f0d',
      boxShadow: '12px 13px 0 #100f0d',
      clipPath: 'polygon(6% 0, 100% 0, 96% 100%, 0 100%)',
      transform: 'skewX(-7deg)',
      flex: '0 1 665px',
    },
    navInner: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
      transform: 'skewX(7deg)',
    },
    hero: {
      position: 'relative',
      zIndex: 5,
      width: 'min(800px, 58vw)',
      margin: '120px auto 0',
      textAlign: 'center',
      animation: 'riseIn 0.8s cubic-bezier(.2,.9,.25,1.12) 0.55s both',
    },
    tagline: {
      margin: 0,
      color: '#fff8e7',
      fontFamily: fontScript,
      fontSize: '3.3rem',
      fontWeight: 800,
      lineHeight: 1.17,
      letterSpacing: 0,
      textShadow:
        '2px 2px 0 #181412, -1px 1px 0 #181412, 0 4px 0 rgba(0,0,0,0.28)',
    },
    scallop: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: -2,
      height: 84,
      zIndex: 7,
      background:
        'radial-gradient(circle at 28px -7px, transparent 34px, #fffdf0 35px) 0 0 / 56px 84px repeat-x',
      pointerEvents: 'none',
    },
    aboutSection: {
      position: 'relative',
      minHeight: 860,
      overflow: 'hidden',
      padding: '92px 24px 120px',
      backgroundColor: '#f7f8f8',
      fontFamily: fontScript,
      isolation: 'isolate',
    },
    aboutOuterFrame: {
      position: 'relative',
      zIndex: 1,
      width: 'min(1100px, calc(100vw - 48px))',
      minHeight: 690,
      margin: '0 auto',
      padding: '92px 72px 88px',
      border: '4px solid #11100f',
      borderRadius: 8,
      background: '#f7f8f8',
      overflow: 'hidden',
    },
    aboutWavyTop: {
      position: 'absolute',
      left: -5,
      right: -5,
      top: 28,
      height: 54,
      zIndex: 3,
      pointerEvents: 'none',
    },
    aboutInnerPanel: {
      position: 'relative',
      width: '100%',
      minHeight: 640,
      borderRadius: 8,
      padding: '54px 42px 82px',
      backgroundColor: '#f5eddc',
      backgroundImage:
        'linear-gradient(rgba(82, 61, 36, 0.15) 2px, transparent 2px), linear-gradient(90deg, rgba(82, 61, 36, 0.15) 2px, transparent 2px)',
      backgroundSize: '48px 48px',
      overflow: 'hidden',
    },
    aboutSweep: {
      position: 'absolute',
      inset: 0,
      zIndex: 0,
      backgroundColor: '#df6635',
      backgroundImage:
        'linear-gradient(rgba(255, 242, 210, 0.2) 2px, transparent 2px), linear-gradient(90deg, rgba(255, 242, 210, 0.2) 2px, transparent 2px)',
      backgroundSize: '48px 48px',
      transformOrigin: 'right center',
      transform: 'scaleX(0)',
      animation: aboutActive
        ? 'aboutSweep 1.12s cubic-bezier(.72,0,.18,1) 2.92s both'
        : 'none',
    },
    aboutStage: {
      position: 'relative',
      zIndex: 2,
      width: 'min(860px, 100%)',
      margin: '0 auto',
    },
    browserFrame: {
      position: 'relative',
      minHeight: 575,
      border: '4px solid #11100f',
      borderRadius: '28px 28px 22px 22px',
      background: '#f6eedc',
      boxShadow: '10px 10px 0 rgba(17, 16, 15, 0.78)',
      overflow: 'visible',
      opacity: aboutActive ? 1 : 0,
      animation: aboutActive
        ? 'aboutBlockIn 0.56s cubic-bezier(.2,.9,.25,1.18) 0.08s both'
        : 'none',
    },
    browserTop: {
      height: 70,
      display: 'flex',
      alignItems: 'center',
      gap: 13,
      padding: '0 30px',
      borderBottom: '4px solid #11100f',
      borderRadius: '24px 24px 0 0',
      background: '#f6eedc',
    },
    aboutTag: {
      position: 'absolute',
      top: -31,
      right: -18,
      zIndex: 5,
      minWidth: 250,
      height: 87,
      border: '4px solid #11100f',
      borderRadius: 14,
      background: '#ee6831',
      color: '#fff7df',
      display: 'grid',
      placeItems: 'center',
      fontFamily: fontScript,
      fontSize: '3.35rem',
      fontWeight: 900,
      letterSpacing: 0,
      lineHeight: 1,
      textShadow: '3px 4px 0 rgba(17,16,15,.24)',
      boxShadow: '7px 8px 0 rgba(17, 16, 15, 0.78)',
      cursor: 'pointer',
      opacity: aboutActive ? 1 : 0,
      animation: aboutActive
        ? 'aboutBlockIn 0.5s cubic-bezier(.2,.9,.25,1.18) 0.2s both'
        : 'none',
      transform:
        hoveredAbout === 'tag'
          ? 'translateY(-7px) rotate(-2deg) scale(1.04)'
          : 'translateY(0) rotate(0deg) scale(1)',
      transition: 'transform 180ms ease, box-shadow 180ms ease',
    },
    blueBox: {
      position: 'relative',
      minHeight: 501,
      padding: '34px 56px 42px',
      borderRadius: '0 0 18px 18px',
      background: '#1260ad',
      color: '#fff9e8',
      overflow: 'hidden',
      opacity: aboutActive ? 1 : 0,
      animation: aboutActive
        ? 'aboutBlockIn 0.55s cubic-bezier(.2,.9,.25,1.18) 0.28s both'
        : 'none',
    },
    bulletList: {
      position: 'relative',
      zIndex: 2,
      display: 'grid',
      gap: 25,
      margin: 0,
      padding: 0,
      listStyle: 'none',
      fontFamily: fontScript,
      fontSize: '2.14rem',
      fontWeight: 800,
      lineHeight: 1.27,
      letterSpacing: 0,
      textShadow: '1px 2px 0 rgba(17,16,15,.26)',
    },
    simplyPop: {
      color: '#ffd348',
      fontFamily: fontScript,
      fontWeight: 900,
      letterSpacing: 0,
      display: 'inline-block',
      textShadow: '3px 4px 0 #11100f',
      animation: aboutActive
        ? 'simplyInlineLoop 2.35s ease-in-out 1.72s infinite'
        : 'none',
    },
  };

  return (
    <>
      <section style={styles.section} aria-label="Simply landing hero">
      <style>
        {`
          @keyframes gridScroll {
            from { background-position: 0 0, 0 0; }
            to { background-position: 0 42px, 0 42px; }
          }

          @keyframes riseIn {
            from { opacity: 0; translate: 0 46px; }
            to { opacity: 1; translate: 0 0; }
          }

          @keyframes floatCube {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-16px); }
          }

          @keyframes aboutBlockIn {
            from { opacity: 0; translate: 0 42px; scale: .96; }
            to { opacity: 1; translate: 0 0; scale: 1; }
          }

          @keyframes aboutTextIn {
            from { opacity: 0; translate: 0 24px; }
            to { opacity: 1; translate: 0 0; }
          }

          @keyframes simplyInlineLoop {
            0%, 100% {
              translate: 0 0;
              scale: 1;
              filter: drop-shadow(0 0 0 rgba(255, 211, 72, 0));
            }
            50% {
              translate: 0 -5px;
              scale: 1.06;
              filter: drop-shadow(0 0 8px rgba(255, 211, 72, .55));
            }
          }

          @keyframes aboutSweep {
            from { transform: scaleX(0); }
            to { transform: scaleX(1); }
          }

          @keyframes orangeBallTravel {
            from { translate: -360px 0; rotate: 0deg; }
            to { translate: 790px 0; rotate: 410deg; }
          }

          @keyframes greenBlobTravel {
            from { translate: 285px 0; rotate: 0deg; }
            to { translate: -890px 0; rotate: -16deg; }
          }

          @keyframes sparkleBlink {
            0%, 100% { scale: 1; rotate: 0deg; }
            50% { scale: 1.14; rotate: 10deg; }
          }

          @media (max-width: 900px) {
            .simply-header {
              align-items: flex-start !important;
              flex-direction: column !important;
              width: calc(100% - 32px) !important;
              gap: 22px !important;
              padding-top: 24px !important;
            }

            .simply-logo {
              height: 60px !important;
              min-width: 148px !important;
              padding: 0 26px !important;
              font-size: 2.55rem !important;
              box-shadow: 7px 8px 0 #100f0d !important;
            }

            .simply-nav-shell {
              align-self: stretch !important;
              flex: none !important;
              min-height: 68px !important;
              padding: 0 20px !important;
              box-shadow: 8px 9px 0 #100f0d !important;
            }

            .simply-nav-inner {
              gap: 10px !important;
              width: 100% !important;
            }

            .simply-hero {
              width: calc(100% - 58px) !important;
              margin-top: 92px !important;
            }

            .simply-tagline {
              font-size: 2.42rem !important;
            }

            .letter-cube-wrap {
              scale: .78;
            }

            .about-outer-frame {
              width: calc(100vw - 28px) !important;
              padding: 82px 24px 70px !important;
            }

            .about-inner-panel {
              padding: 48px 20px 76px !important;
            }

            .about-stage {
              width: 100% !important;
            }

            .about-tag {
              right: 10px !important;
              min-width: 178px !important;
              height: 66px !important;
              font-size: 2.5rem !important;
            }

            .about-blue-box {
              padding: 28px 28px 36px !important;
            }

            .about-list {
              font-size: 1.64rem !important;
              gap: 22px !important;
            }

            .about-simply-pop {
              font-size: 4.15rem !important;
            }
          }

          @media (max-width: 560px) {
            .simply-nav-shell {
              clip-path: polygon(4% 0, 100% 0, 96% 100%, 0 100%) !important;
            }

            .simply-nav-inner {
              gap: 6px !important;
            }

            .simply-tagline {
              font-size: 2rem !important;
            }

            .letter-cube-wrap {
              scale: .62;
            }

            .about-section {
              padding: 72px 12px 96px !important;
            }

            .about-outer-frame {
              width: calc(100vw - 24px) !important;
              min-height: 760px !important;
              padding: 78px 12px 58px !important;
            }

            .about-inner-panel {
              min-height: 690px !important;
              padding: 42px 10px 70px !important;
            }

            .about-browser-frame {
              min-height: 650px !important;
            }

            .about-blue-box {
              min-height: 580px !important;
              padding: 26px 20px 34px !important;
            }

            .about-list {
              font-size: 1.34rem !important;
              gap: 18px !important;
            }

            .about-simply-pop {
              font-size: 3.25rem !important;
            }
          }
        `}
      </style>

      <header className="simply-header" style={styles.header}>
        <div
          className="simply-logo"
          style={{
            ...styles.logo,
            animation: 'riseIn 0.7s cubic-bezier(.2,.9,.25,1.18) 0.14s both',
          }}
        >
          Simply
        </div>

        <nav className="simply-nav-shell" style={styles.navShell} aria-label="Primary navigation">
          <div className="simply-nav-inner" style={styles.navInner}>
            {navItems.map((item) => {
              const isHovered = hoveredNav === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    minWidth: item.label === 'Navigation' ? 172 : 126,
                    height: 50,
                    padding: '0 24px',
                    border: '3px solid #100f0d',
                    borderRadius: 999,
                    background: item.background,
                    color: '#090909',
                    cursor: 'pointer',
                    fontFamily: fontScript,
                    fontSize: '1.72rem',
                    fontWeight: 800,
                    lineHeight: 1,
                    letterSpacing: 0,
                    boxShadow: isHovered
                      ? '0 8px 0 rgba(16, 15, 13, 0.8)'
                      : '0 4px 0 rgba(16, 15, 13, 0.55)',
                    transform: `${isHovered ? 'translateY(-5px) scale(1.06)' : 'translateY(0) scale(1)'} rotate(${item.rotate})`,
                    transition:
                      'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
                    filter: isHovered ? 'saturate(1.12)' : 'saturate(1)',
                    animation: `riseIn 0.66s cubic-bezier(.2,.9,.25,1.18) ${item.delay} both`,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <main className="simply-hero" style={styles.hero}>
        <h1 className="simply-tagline" style={styles.tagline}>
          Ask questions, understand concepts and learn beyond the video &mdash; without ever leaving the page.
        </h1>
      </main>

      {letterCubes.map((cube) => {
        const isHovered = hoveredCube === cube.letter;

        return (
          <div
            className="letter-cube-wrap"
            key={cube.letter}
            style={{
              position: 'absolute',
              left: cube.left,
              right: cube.right,
              top: cube.top,
              zIndex: 6,
              animation: `riseIn 0.72s cubic-bezier(.2,.9,.25,1.18) ${cube.delay} both`,
            }}
          >
            <div
              style={{
                animation: `floatCube ${cube.float} ease-in-out ${cube.delay} infinite`,
              }}
            >
              <button
                type="button"
                aria-label={`${cube.letter} decorative letter cube`}
                onMouseEnter={() => setHoveredCube(cube.letter)}
                onMouseLeave={() => setHoveredCube(null)}
                style={{
                  position: 'relative',
                  width: 76,
                  height: 76,
                  border: '4px solid #100f0d',
                  borderRadius: 11,
                  background: cube.background,
                  boxShadow: `10px 10px 0 ${cube.side}, 18px 18px 0 #100f0d`,
                  color: '#100f0d',
                  cursor: 'pointer',
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: '"Arial Black", "Arial Rounded MT Bold", Arial, sans-serif',
                  fontSize: '2.35rem',
                  fontWeight: 900,
                  lineHeight: 1,
                  transform: `${isHovered ? 'translateY(-8px) scale(1.1)' : 'translateY(0) scale(1)'} rotate(${cube.rotate})`,
                  transformOrigin: 'center',
                  transition: 'transform 190ms ease, box-shadow 190ms ease',
                }}
              >
                {cube.letter}
              </button>
            </div>
          </div>
        );
      })}

      {decorativeIcons.map(getIcon)}

      <div style={styles.scallop} aria-hidden="true" />
      </section>

      <section
        ref={aboutRef}
        className="about-section"
        style={styles.aboutSection}
        aria-label="About Simply"
      >
        <div className="about-outer-frame" style={styles.aboutOuterFrame}>
          <svg
            aria-hidden="true"
            preserveAspectRatio="none"
            viewBox="0 0 1100 54"
            style={styles.aboutWavyTop}
          >
            <path
              d="M0 16 C30 52 66 52 96 16 C126 -18 162 -18 192 16 C222 50 258 50 288 16 C318 -18 354 -18 384 16 C414 50 450 50 480 16 C510 -18 546 -18 576 16 C606 50 642 50 672 16 C702 -18 738 -18 768 16 C798 50 834 50 864 16 C894 -18 930 -18 960 16 C990 50 1026 50 1056 16 C1072 -2 1088 -2 1100 16"
              fill="none"
              stroke="#11100f"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>

          <div className="about-inner-panel" style={styles.aboutInnerPanel}>
            <div style={styles.aboutSweep} aria-hidden="true" />

            <div className="about-stage" style={styles.aboutStage}>
          <div
            aria-hidden="true"
            onMouseEnter={() => setHoveredAbout('orange-ball')}
            onMouseLeave={() => setHoveredAbout(null)}
            style={{
              position: 'absolute',
              left: -66,
              top: 360,
              zIndex: 4,
              width: 102,
              height: 102,
              borderRadius: '50%',
              background: '#d93f2d',
              border: '4px solid #11100f',
              boxShadow: '8px 9px 0 rgba(17,16,15,.82)',
              clipPath:
                'polygon(50% 0%, 57% 11%, 69% 5%, 73% 18%, 87% 17%, 86% 31%, 98% 38%, 90% 50%, 98% 62%, 86% 69%, 87% 83%, 73% 82%, 69% 95%, 57% 89%, 50% 100%, 43% 89%, 31% 95%, 27% 82%, 13% 83%, 14% 69%, 2% 62%, 10% 50%, 2% 38%, 14% 31%, 13% 17%, 27% 18%, 31% 5%, 43% 11%)',
              opacity: aboutActive ? 1 : 0,
              animation: aboutActive
                ? 'aboutBlockIn 0.5s cubic-bezier(.2,.9,.25,1.18) 0.44s both, orangeBallTravel 1.12s cubic-bezier(.72,0,.18,1) 2.92s both'
                : 'none',
              transform:
                hoveredAbout === 'orange-ball'
                  ? 'scale(1.08) rotate(8deg)'
                  : 'scale(1) rotate(0deg)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          />

          <div
            aria-hidden="true"
            onMouseEnter={() => setHoveredAbout('green-blob')}
            onMouseLeave={() => setHoveredAbout(null)}
            style={{
              position: 'absolute',
              right: -78,
              top: 250,
              zIndex: 1,
              width: 142,
              height: 142,
              background: '#7fbd59',
              border: '4px solid #11100f',
              boxShadow: '8px 9px 0 rgba(17,16,15,.82)',
              clipPath:
                'polygon(50% 0%, 57% 11%, 69% 4%, 75% 17%, 88% 14%, 88% 29%, 100% 37%, 91% 49%, 99% 62%, 86% 69%, 89% 84%, 74% 83%, 68% 96%, 56% 89%, 48% 100%, 40% 88%, 27% 94%, 23% 80%, 9% 82%, 12% 67%, 0% 59%, 10% 48%, 2% 35%, 16% 29%, 15% 15%, 30% 18%, 37% 5%)',
              opacity: aboutActive ? 1 : 0,
              animation: aboutActive
                ? 'aboutBlockIn 0.5s cubic-bezier(.2,.9,.25,1.18) 0.52s both, greenBlobTravel 1.05s cubic-bezier(.66,0,.18,1) 4.1s both'
                : 'none',
              transform:
                hoveredAbout === 'green-blob'
                  ? 'scale(1.07) rotate(-7deg)'
                  : 'scale(1) rotate(0deg)',
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          />

          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: -40,
              top: 135,
              zIndex: 5,
              width: 82,
              height: 82,
              opacity: aboutActive ? 1 : 0,
              animation: aboutActive
                ? 'aboutBlockIn 0.5s cubic-bezier(.2,.9,.25,1.18) 0.6s both, sparkleBlink 2.3s ease-in-out 2.8s infinite'
                : 'none',
            }}
          >
            <span
              style={{
                position: 'absolute',
                inset: '8% 41%',
                background: '#ffd557',
                border: '4px solid #11100f',
                borderRadius: 999,
              }}
            />
            <span
              style={{
                position: 'absolute',
                inset: '41% 8%',
                background: '#ffd557',
                border: '4px solid #11100f',
                borderRadius: 999,
              }}
            />
          </div>

          <div className="about-browser-frame" style={styles.browserFrame}>
            <div
              className="about-tag"
              onMouseEnter={() => setHoveredAbout('tag')}
              onMouseLeave={() => setHoveredAbout(null)}
              style={styles.aboutTag}
            >
              About
            </div>

            <div style={styles.browserTop}>
              {browserDots.map((dot, index) => {
                const hoveredDot = hoveredAbout === dot.id;

                return (
                  <button
                    key={dot.id}
                    type="button"
                    aria-label={`${dot.id} browser control`}
                    onMouseEnter={() => setHoveredAbout(dot.id)}
                    onMouseLeave={() => setHoveredAbout(null)}
                    style={{
                      width: 33,
                      height: 33,
                      borderRadius: '50%',
                      border: '4px solid #11100f',
                      background: dot.color,
                      cursor: 'pointer',
                      opacity: aboutActive ? 1 : 0,
                      animation: aboutActive
                        ? `aboutBlockIn 0.44s cubic-bezier(.2,.9,.25,1.18) ${0.28 + index * 0.1}s both`
                        : 'none',
                      boxShadow: hoveredDot
                        ? `0 0 0 7px ${dot.glow}, 0 8px 0 rgba(17,16,15,.32)`
                        : '0 4px 0 rgba(17,16,15,.22)',
                      transform:
                        dot.id === 'close' && hoveredDot
                          ? 'scale(1.18) rotate(-10deg)'
                          : dot.id === 'minimize' && hoveredDot
                            ? 'translateY(-5px) scale(1.14)'
                            : dot.id === 'maximize' && hoveredDot
                              ? 'scale(1.2) rotate(12deg)'
                              : 'scale(1) rotate(0deg)',
                      transition:
                        'transform 180ms ease, box-shadow 180ms ease, filter 180ms ease',
                    }}
                  />
                );
              })}
            </div>

            <div className="about-blue-box" style={styles.blueBox}>
              <ul className="about-list" style={styles.bulletList}>
                <li
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '22px 1fr',
                    gap: 18,
                    opacity: aboutActive ? 1 : 0,
                    animation: aboutActive
                      ? 'aboutTextIn 0.5s cubic-bezier(.2,.9,.25,1.12) 0.86s both'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>&bull;</span>
                  <span>{aboutBullets[0]}</span>
                </li>

                <li
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '22px 1fr',
                    gap: 18,
                    opacity: aboutActive ? 1 : 0,
                    animation: aboutActive
                      ? 'aboutTextIn 0.5s cubic-bezier(.2,.9,.25,1.12) 1.02s both'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>&bull;</span>
                  <span>
                    <strong
                      style={{
                        ...styles.simplyPop,
                      }}
                    >
                      Simply
                    </strong>{' '}
                    {aboutBullets[1]}
                  </span>
                </li>

                <li
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '22px 1fr',
                    gap: 18,
                    opacity: aboutActive ? 1 : 0,
                    animation: aboutActive
                      ? 'aboutTextIn 0.5s cubic-bezier(.2,.9,.25,1.12) 1.18s both'
                      : 'none',
                  }}
                >
                  <span style={{ fontSize: '2rem', lineHeight: 1 }}>&bull;</span>
                  <span>{aboutBullets[2]}</span>
                </li>
              </ul>
            </div>
          </div>

          {[
            { id: 'orange-pill', left: -102, bottom: -42, width: 300, color: '#ee6831', delay: 5.28 },
            { id: 'green-pill', left: 238, bottom: -40, width: 250, color: '#78b957', delay: 5.38 },
            { id: 'blue-pill', right: 178, bottom: -58, width: 92, color: '#1260ad', delay: 5.48 },
            { id: 'purple-pill', right: -86, bottom: -56, width: 236, color: '#a783c8', delay: 5.58 },
            { id: 'yellow-pill', right: -82, bottom: 64, width: 205, color: '#f5c63d', delay: 5.68 },
          ].map((shape) => {
            const isHovered = hoveredAbout === shape.id;

            return (
              <div
                key={shape.id}
                aria-hidden="true"
                onMouseEnter={() => setHoveredAbout(shape.id)}
                onMouseLeave={() => setHoveredAbout(null)}
                style={{
                  position: 'absolute',
                  left: shape.left,
                  right: shape.right,
                  bottom: shape.bottom,
                  zIndex: 3,
                  width: shape.width,
                  height: 72,
                  borderRadius: 999,
                  border: '4px solid #11100f',
                  background: shape.color,
                  boxShadow: isHovered
                    ? '8px 12px 0 rgba(17,16,15,.82)'
                    : '6px 8px 0 rgba(17,16,15,.72)',
                  cursor: 'pointer',
                  opacity: aboutActive ? 1 : 0,
                  animation: aboutActive
                    ? `aboutBlockIn 0.5s cubic-bezier(.2,.9,.25,1.18) ${shape.delay}s both`
                    : 'none',
                  transform: isHovered
                    ? 'translateY(-6px) scale(1.04)'
                    : 'translateY(0) scale(1)',
                  transition: 'transform 180ms ease, box-shadow 180ms ease',
                }}
              />
            );
          })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
