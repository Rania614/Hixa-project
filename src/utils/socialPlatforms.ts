import type { LucideIcon } from "lucide-react";
import {
  Facebook,
  Ghost,
  Globe,
  Instagram,
  Link2,
  Linkedin,
  Mail,
  MessageCircle,
  Music2,
  Send,
  Twitter,
  Youtube,
} from "lucide-react";

export type SocialPlatformId =
  | "instagram"
  | "whatsapp"
  | "twitter"
  | "telegram"
  | "facebook"
  | "linkedin"
  | "website"
  | "youtube"
  | "tiktok"
  | "snapchat"
  | "email"
  | "link";

export const SOCIAL_PLATFORM_ICONS: Record<SocialPlatformId, LucideIcon> = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  twitter: Twitter,
  telegram: Send,
  facebook: Facebook,
  linkedin: Linkedin,
  website: Globe,
  youtube: Youtube,
  tiktok: Music2,
  snapchat: Ghost,
  email: Mail,
  link: Link2,
};

export const SOCIAL_PLATFORM_OPTIONS: {
  id: SocialPlatformId;
  labelEn: string;
  labelAr: string;
}[] = [
  { id: "instagram", labelEn: "Instagram", labelAr: "إنستغرام" },
  { id: "whatsapp", labelEn: "WhatsApp", labelAr: "واتساب" },
  { id: "twitter", labelEn: "X (Twitter)", labelAr: "X (تويتر)" },
  { id: "telegram", labelEn: "Telegram", labelAr: "تيليجرام" },
  { id: "facebook", labelEn: "Facebook", labelAr: "فيسبوك" },
  { id: "linkedin", labelEn: "LinkedIn", labelAr: "لينكدإن" },
  { id: "website", labelEn: "Website", labelAr: "موقع إلكتروني" },
  { id: "youtube", labelEn: "YouTube", labelAr: "يوتيوب" },
  { id: "tiktok", labelEn: "TikTok", labelAr: "تيك توك" },
  { id: "snapchat", labelEn: "Snapchat", labelAr: "سناب شات" },
  { id: "email", labelEn: "Email", labelAr: "بريد إلكتروني" },
  { id: "link", labelEn: "Other link", labelAr: "رابط آخر" },
];

const ALIASES: Record<string, SocialPlatformId> = {
  ig: "instagram",
  insta: "instagram",
  instgram: "instagram",
  "insta-gram": "instagram",
  fb: "facebook",
  wa: "whatsapp",
  "whats-app": "whatsapp",
  "whats app": "whatsapp",
  whatsapp: "whatsapp",
  x: "twitter",
  twitter: "twitter",
  telegram: "telegram",
  tg: "telegram",
  linkedin: "linkedin",
  li: "linkedin",
  website: "website",
  web: "website",
  site: "website",
  homepage: "website",
  url: "website",
  youtube: "youtube",
  yt: "youtube",
  tiktok: "tiktok",
  snapchat: "snapchat",
  snap: "snapchat",
  email: "email",
  mail: "email",
  link: "link",
  other: "link",
};

function normalizeKey(value?: string): SocialPlatformId | null {
  if (!value?.trim()) return null;
  const key = value.toLowerCase().trim().replace(/\s+/g, "-");
  if (key in SOCIAL_PLATFORM_ICONS) return key as SocialPlatformId;
  return ALIASES[key] ?? null;
}

/** يستنتج المنصة من الرابط عند غياب الأيقونة */
export function detectSocialPlatformFromUrl(url?: string): SocialPlatformId | null {
  if (!url?.trim()) return null;
  const u = url.toLowerCase();

  if (u.includes("instagram.com") || u.includes("instagr.am")) return "instagram";
  if (u.includes("wa.me") || u.includes("whatsapp.com") || u.includes("chat.whatsapp"))
    return "whatsapp";
  if (u.includes("facebook.com") || u.includes("fb.com") || u.includes("fb.me"))
    return "facebook";
  if (u.includes("t.me") || u.includes("telegram.me") || u.includes("telegram.org"))
    return "telegram";
  if (u.includes("twitter.com") || u.includes("x.com")) return "twitter";
  if (u.includes("linkedin.com")) return "linkedin";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "youtube";
  if (u.includes("tiktok.com")) return "tiktok";
  if (u.includes("snapchat.com")) return "snapchat";
  if (u.startsWith("mailto:")) return "email";

  try {
    const hostname = new URL(u.startsWith("http") ? u : `https://${u}`).hostname;
    if (hostname.includes("hixa.com")) return "website";
  } catch {
    // ignore invalid URLs
  }

  return null;
}

export function resolveSocialPlatform(
  icon?: string,
  name?: string,
  url?: string
): SocialPlatformId {
  return (
    normalizeKey(icon) ??
    normalizeKey(name) ??
    detectSocialPlatformFromUrl(url) ??
    "link"
  );
}

export function getSocialIcon(icon?: string, name?: string, url?: string): LucideIcon {
  const platform = resolveSocialPlatform(icon, name, url);
  return SOCIAL_PLATFORM_ICONS[platform];
}
