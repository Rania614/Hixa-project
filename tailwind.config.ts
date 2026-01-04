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
          300: "#B0BBC3",  // بلاتينيوم مائل للأزرق البارد
          400: "#8A959E",
          500: "#6D7781",
        },

        // Base
        background: "#050505", 
        foreground: "#E5E4E2", 
        // التعديل هنا: جعل الذهب شفافاً بنسبة 20% للحواف الأساسية
        border: "rgba(212, 175, 55, 0.2)", 
        input: "#121212",
        ring: "#D4AF37",

        // Primary
        primary: {
          DEFAULT: "#D4AF37",  
          foreground: "#050505",
        },

        // Secondary
        secondary: {
          DEFAULT: "#1B1B1B", 
          foreground: "#B0BBC3", 
        },

        // Muted
        muted: {
          DEFAULT: "#121212",
          foreground: "#8A959E", 
        },

        // Accent / Brand Gold
        accent: {
          DEFAULT: "#D4AF37",
          dark: "#B8963E",
          foreground: "#050505",
        },

        // Cards
        card: {
          DEFAULT: "#121212",  
          foreground: "#F8F9FA", 
          // التعديل هنا: جعل حدود الكروت باهتة وشفافة أيضاً
          border: "rgba(212, 175, 55, 0.2)",
        },

        // Gold variations
        gold: {
          DEFAULT: "#D4AF37",
          dark: "#B8963E",
          light: "#F9E79F",
        },

        // Glass Overlay
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