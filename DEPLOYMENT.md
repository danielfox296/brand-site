# Deployment to GitHub Pages

## Quick Setup

1. **Create a GitHub repository** named `[brand]-website` (or any name)

2. **Clone and add files:**
   ```bash
   git clone https://github.com/YOUR-USERNAME/[brand]-website.git
   cd [brand]-website
   cp index.html .
   git add index.html
   git commit -m "Initial site"
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Select "Deploy from a branch"
   - Choose `main` branch, root folder
   - Save

4. **Your site is live** at: `https://YOUR-USERNAME.github.io/[brand]-website/`

## Customization Before Deployment

Replace all instances of `[BRAND]` with your company name:
- Use Find & Replace in your text editor
- Or via command line: `sed -i 's/\[BRAND\]/YourBrandName/g' index.html`

## Important Notes

- **Single file deployment** — only `index.html` needed, no build process
- **Works offline** — test locally by opening `index.html` in your browser
- **Responsive** — looks great on mobile, tablet, desktop
- **No dependencies** — Google Fonts loaded via CDN, all JS vanilla

## Features

- Fixed navigation with smooth scroll links
- Intersection Observer fade-in animations (no library needed)
- Dark theme with warm amber accents (#D4A843)
- Two-column layouts on desktop, single column on mobile
- Separate sections for retailers and investors
- Premium typography: Manrope (headlines) + Inter (body)

## Customization Tips

- **Brand color:** Search/replace `#D4A843` and `#E8C960` with your accent colors
- **Text content:** All copy is editable in the HTML
- **Founder name:** Replace "Daniel" and "D" in the founder section
- **Contact info:** Update email and links in footer

## Testing

```bash
# Test locally
python3 -m http.server 8000
# Visit http://localhost:8000 in your browser
```

Or simply open `index.html` in any modern browser (file:// protocol works).
