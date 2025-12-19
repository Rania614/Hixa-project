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
- Connect to external API
- Or use localStorage for client-side persistence
- Or use any database storage solution

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
- Any static hosting service

## 📝 Notes

- All colors use HSL format for consistency
- Design system uses semantic tokens (avoid direct color values)
- Glass-morphism effects on cards (`glass-card` class)
- Smooth animations with custom keyframes
- Mobile-first responsive design
- Accessible components from Shadcn/ui

## 📊 Admin Dashboards API Connection Status

### ✅ متصل بالـ API (Connected to API)

1. **Content Management** (`/admin/content`)
   - ✅ متصل بالـ API بشكل كامل
   - يستخدم `useContentStore` للتفاعل مع الـ API
   - Endpoints: `/content`, `/content/hero`, `/content/about`, `/content/services`, `/content/projects`, `/content/partners`, `/content/jobs`
   - الوظائف: جلب المحتوى، تحديث، إضافة، حذف، إعادة ترتيب

2. **Admin Projects** (`/admin/projects`)
   - ✅ متصل بالـ API بشكل كامل
   - Endpoints: `/client/projects`, `/client/projects/{id}`, `/client/projects/statistics`
   - الوظائف: عرض المشاريع، إضافة، تعديل، حذف، رفع مرفقات، إحصائيات

3. **Subscribers** (`/admin/subscribers`)
   - ✅ متصل بالـ API بشكل كامل
   - Endpoints: `/subscribers`, `/subscribers/statistics`, `/subscribers/broadcast`
   - الوظائف: عرض المشتركين، حذف، إرسال برودكاست، إحصائيات

4. **Orders** (`/admin/orders`)
   - ✅ متصل بالـ API بشكل كامل
   - Endpoints: `/service-orders`, `/service-orders/{id}`, `/service-orders/{id}/status`
   - الوظائف: عرض الطلبات، تحديث الحالة، حذف، عرض التفاصيل

### ❌ غير متصل بالـ API (Not Connected - Using Static/Mock Data)

1. **Admin Dashboard** (`/admin/dashboard`)
   - ❌ غير متصل بالـ API
   - جميع البيانات والإحصائيات معطلة (commented out)
   - يحتاج إلى ربط بـ API endpoints للإحصائيات والملخصات

2. **Admin Users** (`/admin/users`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات ثابتة (static sample data)
   - يحتاج إلى ربط بـ API endpoints لإدارة المستخدمين

3. **Admin Messages** (`/admin/messages`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات محادثات ثابتة
   - يحتاج إلى ربط بـ API endpoints للرسائل والمحادثات

4. **Admin Documents** (`/admin/documents`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات مستندات ثابتة
   - يحتاج إلى ربط بـ API endpoints لإدارة المستندات

5. **Admin Reports** (`/admin/reports`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات تقارير ثابتة
   - يحتاج إلى ربط بـ API endpoints للتقارير والتحليلات

6. **Admin Settings** (`/admin/settings`)
   - ❌ غير متصل بالـ API
   - واجهة إعدادات فقط بدون حفظ حقيقي
   - يحتاج إلى ربط بـ API endpoints لحفظ الإعدادات

7. **Admin Communication** (`/admin/communication`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات محادثات ثابتة
   - يحتاج إلى ربط بـ API endpoints للتواصل والمحادثات

### 📝 ملاحظات (Notes)

- الداشبوردات المتصلة تستخدم `http` service من `@/services/http` للتفاعل مع الـ API
- جميع الطلبات تستخدم Bearer Token للـ Authentication
- البيانات غير المتصلة تستخدم Mock/Static data للعرض فقط
- راجع ملف `API_ENDPOINTS.md` لمزيد من التفاصيل عن الـ API Endpoints المتاحة

---

## 👤 Client Dashboard API Connection Status

### ✅ متصل بالـ API (Connected to API)

1. **Client Projects** (`/client/projects`)
   - ✅ متصل بالـ API بشكل كامل
   - Endpoints: `/projects` أو `/client/projects`
   - الوظائف: عرض المشاريع، جلب التفاصيل، فلترة حسب الحالة

### ❌ غير متصل بالـ API (Not Connected - Using Static/Mock Data)

1. **Client Dashboard** (`/client/dashboard`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات مشاريع ثابتة (mock data)
   - يحتاج إلى ربط بـ API endpoints للإحصائيات والمشاريع النشطة

2. **Client Messages** (`/client/messages`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات محادثات ثابتة
   - يحتاج إلى ربط بـ API endpoints للرسائل والمحادثات

3. **Client Profile** (`/client/profile`)
   - ❌ غير متصل بالـ API
   - واجهة فقط بدون حفظ/جلب بيانات حقيقية
   - يحتاج إلى ربط بـ API endpoints للملف الشخصي

4. **Create Project** (`/client/create-project`)
   - ❌ غير متصل بالـ API
   - نموذج فقط بدون إرسال حقيقي
   - يحتاج إلى ربط بـ API endpoints لإنشاء المشاريع

5. **Project Details** (`/client/projects/:id`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات ثابتة
   - يحتاج إلى ربط بـ API endpoints لجلب تفاصيل المشروع

6. **Client Contracts** (`/client/contracts`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints للعقود

7. **Client Notifications** (`/client/notifications`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints للإشعارات

8. **Engineer Profile View** (`/client/engineer-profile/:id`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints لعرض ملف المهندس

---

## 🔧 Engineer Dashboard API Connection Status

### ❌ غير متصل بالـ API (Not Connected - Using Static/Mock Data)

جميع صفحات Engineer Dashboard غير متصلة بالـ API حالياً:

1. **Engineer Dashboard** (`/engineer/dashboard`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات ثابتة (إحصائيات ومشاريع)
   - يحتاج إلى ربط بـ API endpoints للإحصائيات والمشاريع

2. **Engineer Projects** (`/engineer/projects`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات مشاريع ثابتة
   - يحتاج إلى ربط بـ API endpoints لعرض مشاريع المهندس

3. **Engineer Messages** (`/engineer/messages`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات محادثات ثابتة
   - يحتاج إلى ربط بـ API endpoints للرسائل والمحادثات

4. **Engineer Profile** (`/engineer/profile`)
   - ❌ غير متصل بالـ API
   - واجهة فقط بدون حفظ/جلب بيانات حقيقية
   - يحتاج إلى ربط بـ API endpoints للملف الشخصي

5. **Engineer Portfolio** (`/engineer/portfolio`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints للمحفظة/الأعمال

6. **Add Work** (`/engineer/portfolio/add`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints لإضافة عمل للمحفظة

7. **Work Details** (`/engineer/portfolio/:id`)
   - ❌ غير متصل بالـ API
   - يحتاج إلى ربط بـ API endpoints لعرض تفاصيل العمل

8. **Available Projects** (`/engineer/available-projects`)
   - ❌ غير متصل بالـ API
   - يستخدم بيانات مشاريع ثابتة
   - يحتاج إلى ربط بـ API endpoints لعرض المشاريع المتاحة للتقدم

9. **Submit Proposal** (`/engineer/submit-proposal/:id`)
   - ❌ غير متصل بالـ API
   - نموذج فقط بدون إرسال حقيقي
   - يحتاج إلى ربط بـ API endpoints لإرسال العروض

10. **Engineer Project Details** (`/engineer/projects/:id`)
    - ❌ غير متصل بالـ API
    - يحتاج إلى ربط بـ API endpoints لتفاصيل المشروع

11. **Engineer Notifications** (`/engineer/notifications`)
    - ❌ غير متصل بالـ API
    - يحتاج إلى ربط بـ API endpoints للإشعارات

12. **Engineer Payouts** (`/engineer/payouts`)
    - ❌ غير متصل بالـ API
    - يحتاج إلى ربط بـ API endpoints للمدفوعات

---

## 🔮 Future Enhancements

- [ ] Add Light Mode toggle
- [ ] Implement real authentication with JWT
- [ ] Add file upload for project images
- [ ] Connect remaining dashboards to API (Users, Messages, Documents, Reports, Settings, Communication)
- [ ] Add analytics dashboard
- [ ] Multi-language support (beyond EN/AR)

## 📄 License

MIT

---

Built with ❤️ using React + Tailwind CSS
