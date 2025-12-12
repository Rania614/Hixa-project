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
      console.log("🔄 Fetching landing data from API...");
      
      // Try to fetch from /content first (if it exists)
      try {
        const response = await http.get("/content");
        console.log("✅ API Response received from /content:", response.data);
        
        const mapped = mapPayload(response.data);
        console.log("📦 Mapped payload:", mapped);

        // Update with real data from API
        set({
          ...mapped,
          loading: false,
          error: null,
        });
        console.log("✅ Landing data updated from API successfully");
        return;
      } catch (contentErr: any) {
        // If /content doesn't exist (404), try fetching from separate endpoints
        if (contentErr.response?.status === 404) {
          console.log("⚠️ /content endpoint not found, fetching from separate endpoints...");
          console.log("📡 Endpoints to fetch:", {
            hero: `${http.defaults.baseURL}/content/hero`,
            about: `${http.defaults.baseURL}/content/about`,
            services: `${http.defaults.baseURL}/content/services`,
            projects: `${http.defaults.baseURL}/content/projects`,
            partners: `${http.defaults.baseURL}/content/partners`,
            jobs: `${http.defaults.baseURL}/content/jobs`,
          });
          
          // Fetch from separate endpoints in parallel
          const [heroRes, aboutRes, servicesRes, projectsRes, partnersRes, jobsRes] = await Promise.allSettled([
            http.get("/content/hero").catch((err) => {
              console.error("❌ Failed to fetch /content/hero:", err.response?.status, err.message);
              return { data: null };
            }),
            http.get("/content/about").catch((err) => {
              console.error("❌ Failed to fetch /content/about:", err.response?.status, err.message);
              return { data: null };
            }),
            http.get("/content/services").catch((err) => {
              console.error("❌ Failed to fetch /content/services:", err.response?.status, err.message);
              return { data: null };
            }),
            http.get("/content/projects").catch((err) => {
              console.error("❌ Failed to fetch /content/projects:", err.response?.status, err.message);
              return { data: null };
            }),
            http.get("/content/partners").catch((err) => {
              console.error("❌ Failed to fetch /content/partners:", err.response?.status, err.message);
              return { data: null };
            }),
            http.get("/content/jobs").catch((err) => {
              console.error("❌ Failed to fetch /content/jobs:", err.response?.status, err.message);
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

          console.log("✅ Fetched from separate endpoints:", {
            hero: hero ? `✅ (${Object.keys(hero).length} keys)` : "❌ null",
            about: about ? `✅ (${Object.keys(about).length} keys)` : "❌ null",
            services: services ? `✅ (${Array.isArray(services) ? services.length : services.items?.length || 0} items)` : "❌ null",
            projects: projects ? `✅ (${Array.isArray(projects) ? projects.length : projects.items?.length || 0} items)` : "❌ null",
            partners: partners ? `✅ (${Array.isArray(partners) ? partners.length : partners.items?.length || 0} items)` : "❌ null",
            jobs: jobs ? `✅ (${Array.isArray(jobs) ? jobs.length : jobs.items?.length || 0} items)` : "❌ null",
          });

          // Combine all data
          const combinedData = {
            hero,
            about,
            services,
            projects,
            partners,
            jobs,
            cta: hero?.ctaSection || null,
          };

          const mapped = mapPayload(combinedData);
          console.log("📦 Mapped payload from separate endpoints:", mapped);

          // Update with real data from API
          set({
            ...mapped,
            loading: false,
            error: null,
          });
          console.log("✅ Landing data updated from separate endpoints successfully");
          return;
        }
        // If it's not a 404, re-throw the error
        throw contentErr;
      }
    } catch (err: any) {
      console.error("❌ Failed to fetch landing content:", err);
      console.error("❌ Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url,
      });
      
      // Only use fallback data if API fails
      console.warn("⚠️ Using fallback static data");
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