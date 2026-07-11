import { useState } from 'react';

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
  const [hoveredNav, setHoveredNav] = useState(null);
  const [hoveredCube, setHoveredCube] = useState(null);

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
  };

  return (
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
  );
}
