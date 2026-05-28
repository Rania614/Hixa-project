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

  // Handle services structure - can be { items: [], title_en, title_ar, ... } or []
  // Keep the full services object if it has items, otherwise extract items if it's an array
  let services: any;
  if (payload.services?.items) {
    // Keep the full object (includes title, subtitle, items, details)
    services = payload.services;
  } else if (Array.isArray(payload.services)) {
    // If it's an array, wrap it in an object
    services = { items: payload.services };
  } else {
    // Default to empty object with items array
    services = { items: [] };
  }

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
      
      
      // Add cache busting to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      
      // Try to fetch from /content first (if it exists)
      try {
        const response = await http.get(`/content${cacheBuster}`);
        
        
        
        
        
        
        const mapped = mapPayload(response.data);
        
        
        
        
        
        

        // Update with real data from API
        set({
          ...mapped,
          loading: false,
          error: null,
        });
        
        return;
      } catch (contentErr: any) {
        // If /content doesn't exist (404), try fetching from separate endpoints
        if (contentErr.response?.status === 404) {
          
          
          
          // Fetch from separate endpoints in parallel
          const [heroRes, aboutRes, servicesRes, projectsRes, partnersRes, jobsRes] = await Promise.allSettled([
            http.get("/content/hero").catch((err) => {
              
              return { data: null };
            }),
            http.get("/content/about").catch((err) => {
              
              return { data: null };
            }),
            http.get(`/content/services${cacheBuster}`).catch((err) => {
              
              return { data: null };
            }),
            http.get("/content/projects").catch((err) => {
              
              return { data: null };
            }),
            http.get("/content/partners").catch((err) => {
              
              return { data: null };
            }),
            http.get("/content/jobs").catch((err) => {
              
              return { data: null };
            }),
          ]);

          // Extract data from responses
          const hero = heroRes.status === 'fulfilled' ? heroRes.value.data : null;
          const about = aboutRes.status === 'fulfilled' ? aboutRes.value.data : null;
          const services = servicesRes.status === 'fulfilled' ? servicesRes.value.data : null;
          const projects = projectsRes.status === 'fulfilled' ? projectsRes.value.data : null;
          const partners = partnersRes.status === 'fulfilled' ? partnersRes.value.data : null;
          const jobs = jobsRes.status === 'fulfilled' ? jobsRes.value.data : null;

          
          
          // Log services data in detail
          if (services) {
            
            
          } else {
            
          }

          // Combine all data
          // Normalize services structure before passing to mapPayload
          const normalizedServices = services?.items 
            ? services 
            : Array.isArray(services)
            ? { items: services }
            : null;
          
          const combinedData = {
            hero,
            about,
            services: normalizedServices,
            projects,
            partners,
            jobs,
            cta: hero?.ctaSection || null,
          };

          

          const mapped = mapPayload(combinedData);
          
          
          
          

          // Update with real data from API
          set({
            ...mapped,
            loading: false,
            error: null,
          });
          
          return;
        }
        // If it's not a 404, re-throw the error
        throw contentErr;
      }
    } catch (err: any) {
      
      
      
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