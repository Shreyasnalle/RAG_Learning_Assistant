import re

with open('frontend/frontend_code/pages/landing_page.jsx', 'r') as f:
    content = f.read()

# Make extensionCard full width inside its container
content = re.sub(
    r"(extensionCard:\s*\{[^}]*?)(width:\s*'(?:[^']*)'|width:\s*\d+)?(,[^}]*\})",
    r"\1width: '100%', maxWidth: '1120px', margin: '0 auto'\3",
    content
)

# And remove it from absolute positioning if it is, wait, it might be part of flex layout.
# Let's scale up extensionWindow content.
content = re.sub(
    r"(extensionWindow:\s*\{[^}]*?)(transform:\s*'(?:[^']*)')?(,[^}]*\})",
    r"\1transform: 'scale(1.25)', transformOrigin: 'top center'\3",
    content
)

# Fix motion timing on float animations
content = content.replace("ease-in-out", "cubic-bezier(0.34, 1.56, 0.64, 1)")

with open('frontend/frontend_code/pages/landing_page.jsx', 'w') as f:
    f.write(content)
print("Done")
