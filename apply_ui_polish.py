import re

with open('frontend/frontend_code/pages/landing_page.jsx', 'r') as f:
    content = f.read()

# 1. Update <style> block to include hover classes and cubic-bezier timings
new_styles = """
          /* Hover Classes */
          .hover-lift { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
          .hover-lift:hover { transform: translateY(-4px) scale(1.02) !important; filter: brightness(1.05); }
          
          .hover-scale { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); cursor: pointer; }
          .hover-scale:hover { transform: scale(1.05) !important; }

          .hover-dot { transition: all 0.2s ease-out; cursor: pointer; }
          .hover-dot:hover { filter: brightness(1.2); transform: scale(1.1); }
          
          .simply-nav-item, .click-here-btn, .footer-icon { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important; }
          .simply-nav-item:hover, .click-here-btn:hover, .footer-icon:hover { transform: translateY(-4px) scale(1.03) !important; }
"""

# Inject hover styles after gridScroll
content = re.sub(
    r'(@keyframes gridScroll \{[\s\S]*?\})',
    r'\1\n' + new_styles,
    content
)

# 2. About section nesting & Chrome Extension full width
# In the styles object:
# aboutOuterFrame padding
content = re.sub(
    r"(aboutOuterFrame:\s*\{[^}]*?)(padding:\s*'(?:[^']*)'|padding:\s*\d+)?(,[^}]*\})",
    r"\1padding: '40px'\3",
    content
)

# aboutInnerPanel padding
content = re.sub(
    r"(aboutInnerPanel:\s*\{[^}]*?)(padding:\s*'(?:[^']*)'|padding:\s*\d+)?(,[^}]*\})",
    r"\1padding: '60px'\3",
    content
)

# browserFrame border crispness
content = re.sub(
    r"(browserFrame:\s*\{[^}]*?border:\s*')\d+px",
    r"\1 4px",
    content
)

# extensionContainer layout for full width
content = re.sub(
    r"(extensionContainer:\s*\{[^}]*?)(width:\s*'(?:[^']*)'|width:\s*\d+)?(,[^}]*\})",
    r"\1width: '100%', maxWidth: '1200px', margin: '0 auto'\3",
    content
)

# extensionWindow scaling
content = re.sub(
    r"(extensionWindow:\s*\{[^}]*?)(transform:\s*'(?:[^']*)')?(,[^}]*\})",
    r"\1transform: 'scale(1.15)', transformOrigin: 'top center'\3",
    content
)

# 3. Add hover classes to JSX elements
# Header buttons
content = content.replace("className=\"simply-nav-item\"", "className=\"simply-nav-item hover-lift\"")
content = content.replace("className=\"simply-logo\"", "className=\"simply-logo hover-scale\"")
content = content.replace("className=\"about-tag\"", "className=\"about-tag hover-lift\"")

# Browser dots
content = content.replace("className=\"browser-dot\"", "className=\"browser-dot hover-dot\"")

# Footer stickers infinite animation
content = content.replace("animation: 'footerStickerFloat 4s ease-in-out infinite both'", "animation: 'footerStickerFloat 4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both'")
content = content.replace("animation: 'footerStickerFloatReverse 4.6s ease-in-out infinite both'", "animation: 'footerStickerFloatReverse 4.6s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite both'")

# Write back
with open('frontend/frontend_code/pages/landing_page.jsx', 'w') as f:
    f.write(content)
print("Regex updates applied successfully!")
