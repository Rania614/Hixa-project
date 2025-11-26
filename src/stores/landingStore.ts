import { create } from "zustand";
import { http } from "../services/http";
import { getInitialContentSnapshot } from "@/services/api";

// Define types for our data structures
interface ContentItem {
  id?: string;
  order?: number;
  title?: {
    en?: string;
    ar?: string;
  } | string;
  subtitle?: {
    en?: string;
    ar?: string;
  } | string;
  description?: {
    en?: string;
    ar?: string;
  } | string;
  text?: {
    en?: string;
    ar?: string;
  } | string;
  details?: {
    en?: string;
    ar?: string;
  } | string;
  cta?: {
    en?: string;
    ar?: string;
  } | string;
  button?: {
    en?: string;
    ar?: string;
  } | string;
  buttonText?: {
    en?: string;
    ar?: string;
  } | string;
  name?: string;
  values?: ContentItem[];
  ctaSection?: ContentItem;
  cta_button?: string;
}

interface LandingState {
  loading: boolean;
  error: any;

  hero: ContentItem | null;
  about: ContentItem | null;
  services: ContentItem[];
  projects: ContentItem[];
  partners: ContentItem[];
  jobs: ContentItem[];
  cta: ContentItem | null;

  fetchLandingData: () => Promise<void>;
}

const mapPayload = (payload: any) => {
  if (!payload) {
    return {
      hero: null,
      about: null,
      services: [],
      projects: [],
      partners: [],
      jobs: [],
      cta: null,
    };
  }

  // Handle services structure - can be { items: [] } or []
  const services = payload.services?.items 
    ? payload.services.items 
    : Array.isArray(payload.services)
    ? payload.services
    : [];

  // Handle projects structure - can be { items: [] } or []
  const projects = payload.projects?.items 
    ? payload.projects.items 
    : Array.isArray(payload.projects)
    ? payload.projects
    : [];

  // Handle partners structure - can be { items: [] } or []
  const partners = payload.partners?.items 
    ? payload.partners.items 
    : Array.isArray(payload.partners)
    ? payload.partners
    : [];

  // Handle jobs structure - can be { items: [] } or []
  const jobs = payload.jobs?.items 
    ? payload.jobs.items 
    : Array.isArray(payload.jobs)
    ? payload.jobs
    : [];

  return {
    hero: payload.hero ?? null,
    about: payload.about ?? null,
    services,
    projects,
    partners,
    jobs,
    cta: payload.cta ?? payload.hero?.ctaSection ?? null,
  };
};

export const useLandingStore = create<LandingState>((set) => ({
  loading: true, // Start with loading true to fetch real data first
  error: null,

  // Start with empty/null data - will be populated from API
  hero: null,
  about: null,
  services: [],
  projects: [],
  partners: [],
  jobs: [],
  cta: null,

  fetchLandingData: async () => {
    set({ loading: true });
    try {
      const response = await http.get("/content");
      const mapped = mapPayload(response.data);

      // Update with real data from API
      set({
        ...mapped,
        loading: false,
        error: null,
      });
    } catch (err) {
      console.error("Failed to fetch landing content:", err);
      // Only use fallback data if API fails
      const fallback = getInitialContentSnapshot();
      const fallbackMapped = mapPayload(fallback);
      set({
        ...fallbackMapped,
        loading: false,
        error: err,
      });
    }
  },
}));