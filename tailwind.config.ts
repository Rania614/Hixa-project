import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // --- مجموعة البلاتينيوم الجديدة ---
        platinum: {
          50: "#F8F9FA",   // بلاتينيوم ناعم جداً للخلفيات
          100: "#E5E4E2",  // لون البلاتينيوم الأصلي
          200: "#D3D3D3",  // فضي فاتح
          300: "#B0BBC3",  // بلاتينيوم مائل للأزرق البارد (يعطي روح للموقع)
          400: "#8A959E",
          500: "#6D7781",
        },

        // Base
        background: "#050505", // أسود عميق جداً (أشيك من الأسود الصريح)
        foreground: "#E5E4E2", // النص الأساسي بلاتيني فاتح مريح للعين
        border: "#D4AF37",     // الذهب للحواف
        input: "#121212",
        ring: "#D4AF37",

        // Primary
        primary: {
          DEFAULT: "#D4AF37",  // جعلت البرايمري هو الدهبي لإبراز الهوية
          foreground: "#050505",
        },

        // Secondary (استخدام البلاتينيوم هنا)
        secondary: {
          DEFAULT: "#1B1B1B", // خلفية الكروت/الأقسام
          foreground: "#B0BBC3", // نص بلاتيني بارد
        },

        // Muted
        muted: {
          DEFAULT: "#121212",
          foreground: "#8A959E", // نص بلاتيني مطفي
        },

        // Accent / Brand Gold
        accent: {
          DEFAULT: "#D4AF37",
          dark: "#B8963E",
          foreground: "#050505",
        },

        // Cards (تطوير خلفية الكاردات)
        card: {
          DEFAULT: "#121212",  // رمادي فحمى داكن
          foreground: "#F8F9FA", // نص بلاتيني مشرق
          border: "#D4AF37",
        },

        // Gold variations
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#B8963E",
          light: "#F9E79F",
        },

        // Glass Overlay (بلاتيني شفاف)
        "glass-platinum": "rgba(229, 228, 226, 0.05)",
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        arabic: ["Cairo", "sans-serif"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;