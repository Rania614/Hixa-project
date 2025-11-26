# HIXA - Digital Excellence Platform

A modern, bilingual (English/Arabic) landing page with full admin dashboard for content management.

## 🚀 Features

- **Bilingual Support**: Full RTL/LTR support for English and Arabic
- **Dark Theme**: Luxury dark theme with gold accents (#0b0b0c background, #D4AF36 gold)
- **Admin Dashboard**: Complete content management system
- **State-Based Auth**: Simple authentication flow (no backend required)
- **Responsive Design**: Mobile-first, fully responsive across all devices
- **Modern Animations**: Smooth transitions and geometric floating elements
- **Theme System**: Prepared for easy Light Mode addition in the future

## 📦 Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd hixa-project

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 🎨 Design System

The project uses a comprehensive design system defined in `src/index.css` and `tailwind.config.ts`:

### Color Palette
- **Primary**: Gold (AF36) - `hsl(45, 65%, 52%)`
- **Background**: Dark (#0b0b0c) - `hsl(240, 5%, 4%)`
- **Foreground**: White - `hsl(0, 0%, 100%)`

### CSS Variables
```css
--gold: 45 65% 52%
--dark-bg: 240 5% 4%
--glass-bg: 240 5% 8%
--gradient-gold: linear-gradient(135deg, hsl(45 75% 62%) 0%, hsl(45 65% 52%) 100%)
```

## 🌓 Theme Switching

The project is currently configured for **Dark Mode only** but is fully prepared for Light Mode:

### Adding Light Mode

1. The theme system is already set up in `src/index.css` with `.light` class styles
2. All colors use HSL format for easy theme switching
3. CSS variables are defined for both light and dark themes

To enable light mode toggle:
```tsx
// Add to your context or component
const [theme, setTheme] = useState<'light' | 'dark'>('dark');

const toggleTheme = () => {
  const newTheme = theme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
  document.documentElement.classList.toggle('light', newTheme === 'light');
  document.documentElement.classList.toggle('dark', newTheme === 'dark');
};
```

## 🔑 Authentication Flow

The app uses a simple state-based authentication:

1. **Landing Page** (`/`): Shows marketing site with "Get Started" button
2. **Admin Login** (`/admin/login`): Simple login form (any credentials work)
3. **Admin Dashboard** (`/admin/dashboard`): Protected route with stats overview
4. **Content Management** (`/admin/content`): Full content editing interface

### Navigation Flow
- Clicking "Get Started" on landing → Redirects to Admin Dashboard
- Not authenticated → Redirected to Admin Login
- Authenticated → Access to all admin pages

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── AdminSidebar.tsx # Dashboard sidebar with navigation
│   ├── AdminTopBar.tsx  # Dashboard top bar
│   ├── Header.tsx       # Landing page header
│   ├── Hero.tsx         # Landing hero section
│   ├── About.tsx        # About section with value cards
│   ├── Services.tsx     # Services grid
│   ├── FeaturedProjects.tsx # Project showcase
│   ├── PlatformFeatures.tsx # Feature cards
│   ├── CTA.tsx          # Call to action section
│   ├── Footer.tsx       # Landing footer
│   └── LanguageToggle.tsx # EN/AR language switcher
├── context/
│   └── AppContext.tsx   # Global state (language, auth, content)
├── pages/
│   ├── Landing.tsx      # Main landing page
│   ├── AdminLogin.tsx   # Admin login page
│   ├── AdminDashboard.tsx # Admin dashboard
│   └── ContentManagement.tsx # Content editor
├── App.tsx              # Main app with routing
└── index.css            # Design system & global styles
```

## ✏️ Content Management

The admin panel allows editing all content in both languages:

### Editable Sections
- **Hero**: Title, subtitle, CTA button text
- **About**: Title, subtitle, 3 value cards (icon, title, description)
- **Services**: Add/edit/delete/reorder services
- **Projects**: Add/edit/delete/reorder featured projects with images
- **Platform Features**: Edit 4 feature cards
- **CTA**: Title, subtitle, button text
- **Footer**: Navigation links and social media URLs

### Content Storage
All content is stored in React state (`AppContext.tsx`). For persistence:
- Add Lovable Cloud for database storage
- Or connect to external API
- Or use localStorage for client-side persistence

## 🌍 RTL/LTR Support

The app automatically switches direction based on selected language:

```tsx
// Language change handler
const toggleLanguage = () => {
  const newLang = language === 'en' ? 'ar' : 'en';
  setLanguage(newLang);
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = newLang;
};
```

## 🎯 Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling system
- **Vite** - Build tool
- **React Router** - Navigation
- **Shadcn/ui** - Component library
- **Lucide React** - Icons

## 🚢 Deployment

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deploy the `dist` folder to any static hosting service:
- Vercel
- Netlify
- GitHub Pages
- Lovable Cloud

## 📝 Notes

- All colors use HSL format for consistency
- Design system uses semantic tokens (avoid direct color values)
- Glass-morphism effects on cards (`glass-card` class)
- Smooth animations with custom keyframes
- Mobile-first responsive design
- Accessible components from Shadcn/ui

## 🔮 Future Enhancements

- [ ] Connect to Lovable Cloud for data persistence
- [ ] Add Light Mode toggle
- [ ] Implement real authentication with JWT
- [ ] Add file upload for project images
- [ ] Create API endpoints for content management
- [ ] Add analytics dashboard
- [ ] Multi-language support (beyond EN/AR)

## 📄 License

MIT

---

Built with ❤️ using React + Tailwind CSS
