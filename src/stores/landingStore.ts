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
      console.log("🔄 Fetching landing data from API...");
      
      // Add cache busting to ensure fresh data
      const cacheBuster = `?t=${Date.now()}`;
      
      // Try to fetch from /content first (if it exists)
      try {
        const response = await http.get(`/content${cacheBuster}`);
        console.log("✅ API Response received from /content:", response.data);
        console.log("📦 Services in response:", response.data?.services);
        console.log("📦 Services type:", typeof response.data?.services);
        console.log("📦 Services is array:", Array.isArray(response.data?.services));
        console.log("📦 Services has items:", response.data?.services?.items);
        
        const mapped = mapPayload(response.data);
        console.log("📦 Mapped payload:", mapped);
        console.log("📦 Mapped services:", mapped.services);
        console.log("📦 Mapped services count:", Array.isArray(mapped.services) ? mapped.services.length : 0);

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
            http.get(`/content/services${cacheBuster}`).catch((err) => {
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
          
          // Log services data in detail
          if (services) {
            console.log("📦 Services data received:", JSON.stringify(services, null, 2));
            console.log("📦 Services items:", services.items || services);
          } else {
            console.log("⚠️ No services data received");
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

          console.log("📦 Combined data before mapping:", {
            services: normalizedServices,
            servicesItems: normalizedServices?.items?.length || 0,
          });

          const mapped = mapPayload(combinedData);
          
          console.log("📦 Mapped services:", mapped.services);
          console.log("📦 Mapped services count:", Array.isArray(mapped.services) ? mapped.services.length : 0);
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