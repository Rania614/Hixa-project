import { create } from "zustand";
import { http } from "../services/http";
import { toast } from "@/hooks/use-toast";
import { API_ENDPOINTS } from "@/config/endpoints";

interface ContentItem {
  id?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  name?: string;
  [key: string]: any; // Allow additional properties
}

interface ServicesData {
  items: ContentItem[];
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

interface ProjectsData {
  items: ContentItem[];
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

interface PartnersData {
  items: ContentItem[];
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

interface JobsData {
  items: ContentItem[];
  title_en?: string;
  title_ar?: string;
  subtitle_en?: string;
  subtitle_ar?: string;
}

interface ContentState {
  hero: ContentItem | null;
  about: ContentItem | null;
  services: ServicesData | ContentItem[];
  projects: ProjectsData | ContentItem[];
  partners: PartnersData | ContentItem[];
  jobs: JobsData | ContentItem[];
  loading: boolean;
  
  setContent: (data: Partial<ContentState>) => void;
  fetchContent: () => Promise<void>;
  updateHero: (hero: ContentItem) => Promise<void>;
  updateAbout: (about: ContentItem) => Promise<void>;
  updateServices: (services: ServicesData) => Promise<void>;
  addService: (service: ContentItem) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  reorderService: (id: string, direction: 'up' | 'down') => Promise<void>;
  updateProjects: (projects: ProjectsData) => Promise<void>;
  addProject: (project: ContentItem) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  reorderProject: (id: string, direction: 'up' | 'down') => Promise<void>;
  updatePartners: (partners: PartnersData) => Promise<void>;
  addPartner: (partner: ContentItem) => Promise<void>;
  deletePartner: (id: string) => Promise<void>;
  reorderPartner: (id: string, direction: 'up' | 'down') => Promise<void>;
  updateJobs: (jobs: JobsData) => Promise<void>;
  addJob: (job: ContentItem) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  hero: null,
  about: null,
  services: { items: [] },
  projects: { items: [] },
  partners: { items: [] },
  jobs: { items: [] },
  loading: false,
  
  setContent: (data) => set(data),
  
  fetchContent: async () => {
    set({ loading: true });
    try {
      const response = await http.get("/content");
      const data = response.data;
      
      // Services is now an object with item1, item2, item3, item4
      const services = data.services || {};
      
      // Normalize projects structure - handle both { items: [] } and [] formats
      const projects = data.projects?.items 
        ? data.projects 
        : Array.isArray(data.projects)
        ? { items: data.projects }
        : { items: [] };
      
      // Normalize partners structure - handle both { items: [] } and [] formats
      const partners = data.partners?.items 
        ? data.partners 
        : Array.isArray(data.partners)
        ? { items: data.partners }
        : { items: [] };
      
      // Normalize jobs structure - handle both { items: [] } and [] formats
      const jobs = data.jobs?.items 
        ? data.jobs 
        : Array.isArray(data.jobs)
        ? { items: data.jobs }
        : { items: [] };
      
      set({
        ...data,
        services,
        projects,
        partners,
        jobs,
      });
    } catch (err) {
      console.error("Fetch failed:", err);
      toast({
        title: "Error",
        description: "Failed to fetch content",
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },
  
  updateHero: async (hero) => {
    set({ loading: true });
    try {
      await http.put("/content/hero", hero);
      set({ hero });
      toast({ title: "Hero Updated Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error updating hero", 
        description: err.response?.data?.message || "Failed to update hero",
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  updateAbout: async (about) => {
    set({ loading: true });
    try {
      // Use subtitle_en/subtitle_ar if available, otherwise fallback to description_en/description_ar
      // But send only description_en/description_ar to API (API doesn't accept subtitle fields)
      const descriptionEn = about?.subtitle_en || about?.description_en || "";
      const descriptionAr = about?.subtitle_ar || about?.description_ar || "";
      
      const payload = {
        title_en: about?.title_en ?? "",
        title_ar: about?.title_ar ?? "",
        description_en: descriptionEn,
        description_ar: descriptionAr,
        values: Array.isArray(about?.values)
          ? about.values.map((value) => {
              // Support both flat structure (title_en) and nested structure (title.en)
              const titleEn = value.title_en ?? (typeof value.title === 'object' ? value.title?.en : '') ?? "";
              const titleAr = value.title_ar ?? (typeof value.title === 'object' ? value.title?.ar : '') ?? "";
              const descEn = value.description_en ?? (typeof value.description === 'object' ? value.description?.en : '') ?? "";
              const descAr = value.description_ar ?? (typeof value.description === 'object' ? value.description?.ar : '') ?? "";
              
              return {
                title_en: titleEn,
                title_ar: titleAr,
                description_en: descEn,
                description_ar: descAr,
                icon: value.icon ?? "",
              };
            })
          : [],
      };

      await http.put("/content/about", payload);
      // Preserve subtitle fields in local state even though API doesn't accept them
      set({ about: { ...(about || {}), ...payload, subtitle_en: descriptionEn, subtitle_ar: descriptionAr } });
      toast({ title: "About Updated Successfully" });
    } catch (err) {
      console.error("Error updating about:", err.response?.data || err);
      toast({
        title: "Error updating about",
        description: err.response?.data?.message || "Failed to update about",
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },
  
  updateServices: async (services) => {
    // Services is now an object with item1, item2, item3, item4
    // Services are updated individually via PUT /content/services/:itemId
    // This function just updates local state
    set({ services: services || {} });
  },
  
  addService: async (service) => {
    set({ loading: true });
    const currentServices = get().services;
    const servicesData = Array.isArray(currentServices) 
      ? { items: currentServices } 
      : currentServices;
    
    // Create temporary ID for optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempService = { ...service, id: tempId, _id: tempId };
    
    // Optimistic update - add to local state immediately
    set({ 
      services: { 
        ...servicesData, 
        items: [...(servicesData.items || []), tempService] 
      } 
    });
    
    try {
      const res = await http.post("/content/services/items", service);
      // Replace temp service with real one from API
      set({ 
        services: { 
          ...servicesData, 
          items: (servicesData.items || []).map((s) => 
            (s.id === tempId || s._id === tempId) ? res.data : s
          )
        } 
      });
      toast({ title: "Service Added Successfully" });
    } catch (err: any) {
      console.error("Error adding service:", err);
      // Rollback - remove the temp service
      set({ 
        services: { 
          ...servicesData, 
          items: (servicesData.items || []).filter((s) => 
            s.id !== tempId && s._id !== tempId
          )
        } 
      });
      toast({ 
        title: "Error adding service", 
        description: err.response?.data?.message || "Failed to add service",
        variant: "destructive"
      });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteService: async (id) => {
    set({ loading: true });
    try {
      await http.delete(`/content/services/items/${id}`);
      const currentServices = get().services;
      const servicesData = Array.isArray(currentServices) 
        ? { items: currentServices } 
        : currentServices;
      
      set({ 
        services: { 
          ...servicesData, 
          items: (servicesData.items || []).filter((s) => s._id !== id && s.id !== id) 
        } 
      });
      toast({ title: "Service Deleted Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error deleting service", 
        description: err.response?.data?.message || "Failed to delete service",
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  reorderService: async (id, direction) => {
    const currentServices = get().services;
    const servicesData = Array.isArray(currentServices) 
      ? { items: currentServices } 
      : currentServices;
    
    const items = [...(servicesData.items || [])];
    const index = items.findIndex((s) => s._id === id || s.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return; // Already at top or bottom
    }
    
    set({ services: { ...servicesData, items } });
    
    // Update on server
    set({ loading: true });
    try {
      const payload = {
        title_en: servicesData.title_en ?? "",
        title_ar: servicesData.title_ar ?? "",
        subtitle_en: servicesData.subtitle_en ?? "",
        subtitle_ar: servicesData.subtitle_ar ?? "",
        items: items.map((item) => ({
          title_en: item.title_en ?? "",
          title_ar: item.title_ar ?? "",
          description_en: item.description_en ?? "",
          description_ar: item.description_ar ?? "",
          icon: item.icon ?? "",
          code: item.code ?? "",
        })),
      };
      
      await http.put("/content/services", payload);
      toast({ title: "Service Reordered Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error reordering service", 
        description: err.response?.data?.message || "Failed to reorder service",
        variant: "destructive" 
      });
      // Revert on error
      set({ services: servicesData });
    } finally {
      set({ loading: false });
    }
  },
  
  updateProjects: async (projects) => {
    set({ loading: true });
    try {
      const payload = {
        title_en: projects?.title_en ?? "",
        title_ar: projects?.title_ar ?? "",
        subtitle_en: projects?.subtitle_en ?? "",
        subtitle_ar: projects?.subtitle_ar ?? "",
        items: Array.isArray(projects?.items)
          ? projects.items.map((item) => {
              // Remove _id and other MongoDB fields, keep only allowed fields
              return {
                title_en: item.title_en ?? "",
                title_ar: item.title_ar ?? "",
                description_en: item.description_en ?? "",
                description_ar: item.description_ar ?? "",
                image: item.image ?? "",
                link: item.link ?? "",
              };
            })
          : [],
      };
      
      await http.put("/content/projects", payload);
      // Preserve _id from original items for local state
      const updatedProjects = {
        ...projects,
        title_en: payload.title_en,
        title_ar: payload.title_ar,
        subtitle_en: payload.subtitle_en,
        subtitle_ar: payload.subtitle_ar,
        items: projects.items?.map((item, index) => {
          const updatedItem = payload.items[index];
          if (!updatedItem) return item;
          return {
            ...item,
            ...updatedItem,
            // Preserve _id and id if they exist
            _id: item._id,
            id: item.id,
          };
        }) || payload.items,
      };
      set({ projects: updatedProjects });
      toast({ title: "Projects Updated Successfully" });
    } catch (err: any) {
      console.error("Error updating projects:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update projects";
      toast({ 
        title: "Error updating projects", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  addProject: async (project) => {
    set({ loading: true });
    try {
      const res = await http.post("/content/projects/items", project);
      const currentProjects = get().projects;
      const projectsData = Array.isArray(currentProjects) 
        ? { items: currentProjects } 
        : currentProjects;
      
      set({ 
        projects: { 
          ...projectsData, 
          items: [...(projectsData.items || []), res.data] 
        } 
      });
      toast({ title: "Project Added Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error adding project", 
        description: err.response?.data?.message || "Failed to add project",
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  deleteProject: async (id) => {
    set({ loading: true });
    try {
      await http.delete(`/content/projects/items/${id}`);
      const currentProjects = get().projects;
      const projectsData = Array.isArray(currentProjects) 
        ? { items: currentProjects } 
        : currentProjects;
      
      set({ 
        projects: { 
          ...projectsData, 
          items: (projectsData.items || []).filter((p) => p._id !== id && p.id !== id) 
        } 
      });
      toast({ title: "Project Deleted Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error deleting project", 
        description: err.response?.data?.message || "Failed to delete project",
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  reorderProject: async (id, direction) => {
    const currentProjects = get().projects;
    const projectsData = Array.isArray(currentProjects) 
      ? { items: currentProjects } 
      : currentProjects;
    
    const items = [...(projectsData.items || [])];
    const index = items.findIndex((p) => p._id === id || p.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return; // Already at top or bottom
    }
    
    set({ projects: { ...projectsData, items } });
    
    // Update on server
    set({ loading: true });
    try {
      const payload = {
        title_en: projectsData.title_en ?? "",
        title_ar: projectsData.title_ar ?? "",
        subtitle_en: projectsData.subtitle_en ?? "",
        subtitle_ar: projectsData.subtitle_ar ?? "",
        items: items.map((item) => ({
          title_en: item.title_en ?? "",
          title_ar: item.title_ar ?? "",
          description_en: item.description_en ?? "",
          description_ar: item.description_ar ?? "",
          image: item.image ?? "",
          link: item.link ?? "",
        })),
      };
      
      await http.put("/content/projects", payload);
      toast({ title: "Project Reordered Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error reordering project", 
        description: err.response?.data?.message || "Failed to reorder project",
        variant: "destructive" 
      });
      // Revert on error
      set({ projects: projectsData });
    } finally {
      set({ loading: false });
    }
  },
  
  updatePartners: async (partners) => {
    set({ loading: true });
    try {
      // Update section headers only (title and subtitle)
      const headerPayload = {
        title_en: partners?.title_en ?? "",
        title_ar: partners?.title_ar ?? "",
        subtitle_en: partners?.subtitle_en ?? "",
        subtitle_ar: partners?.subtitle_ar ?? "",
      };
      
      await http.put("/content/partners", headerPayload);
      
      // Update each partner item individually to avoid 413 errors with large base64 images
      if (Array.isArray(partners?.items) && partners.items.length > 0) {
        const updatePromises = partners.items.map(async (item) => {
          const itemId = item._id || item.id;
          
          // NEVER send base64 images - they cause 413 errors
          // Only send URL strings, skip base64 entirely
          const logoToSend = item.logo?.startsWith('data:') 
            ? '' // Don't send base64 images at all
            : (item.logo ?? '');
          
          // Validate required fields
          const nameEn = (item.name_en ?? "").trim();
          const nameAr = (item.name_ar ?? "").trim();
          
          if (!itemId) {
            // New item - use POST instead
            // API requires name_en to not be empty
            if (!nameEn) {
              throw new Error('Partner name (English) is required. Please fill in the Name (English) field.');
            }
            
            const itemPayload = {
              name_en: nameEn,
              name_ar: nameAr,
              logo: logoToSend,
              link: (item.link ?? "").trim(),
              isActive: item.isActive ?? true,
            };
            try {
              await http.post("/content/partners/items", itemPayload);
            } catch (itemErr: any) {
              console.error(`Error adding partner item:`, itemErr);
              const errorMsg = itemErr.response?.data?.message || itemErr.message || 'Failed to add partner';
              throw new Error(errorMsg);
            }
            return;
          }
          
          // For updates, name_en is also required
          if (!nameEn) {
            throw new Error('Partner name (English) is required. Please fill in the Name (English) field.');
          }
          
          const itemPayload = {
            name_en: nameEn,
            name_ar: nameAr,
            logo: logoToSend,
            link: (item.link ?? "").trim(),
            isActive: item.isActive ?? true,
          };
          
          try {
            await http.put(`/content/partners/items/${itemId}`, itemPayload);
          } catch (itemErr: any) {
            console.error(`Error updating partner item ${itemId}:`, itemErr);
            // If it's a 413 error, show helpful message
            if (itemErr.response?.status === 413) {
              throw new Error('Image is too large. Please use Logo URL instead of uploading a file.');
            }
            const errorMsg = itemErr.response?.data?.message || itemErr.message || 'Failed to update partner';
            throw new Error(errorMsg);
          }
        });
        
        await Promise.all(updatePromises);
      }
      
      // Update local state
      set({ partners });
      toast({ title: "Partners Updated Successfully" });
    } catch (err: any) {
      console.error("Error updating partners:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update partners";
      toast({ 
        title: "Error updating partners", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  addPartner: async (partner) => {
    set({ loading: true });
    try {
      // Validate required fields
      const nameEn = (partner.name_en ?? "").trim();
      if (!nameEn) {
        throw new Error('Partner name (English) is required');
      }
      
      const payload = {
        name_en: nameEn,
        name_ar: (partner.name_ar ?? "").trim(),
        logo: partner.logo?.startsWith('data:') ? '' : (partner.logo ?? ''), // Skip base64
        link: (partner.link ?? "").trim(),
        isActive: partner.isActive ?? true,
      };
      
      const res = await http.post("/content/partners/items", payload);
      const currentPartners = get().partners;
      const partnersData = Array.isArray(currentPartners) 
        ? { items: currentPartners } 
        : currentPartners;
      
      set({ 
        partners: { 
          ...partnersData, 
          items: [...(partnersData.items || []), res.data] 
        } 
      });
      toast({ title: "Partner Added Successfully" });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to add partner";
      toast({ 
        title: "Error adding partner", 
        description: errorMsg,
        variant: "destructive" 
      });
      throw err; // Re-throw so caller can handle it
    } finally {
      set({ loading: false });
    }
  },
  
  deletePartner: async (id) => {
    set({ loading: true });
    try {
      await http.delete(`/content/partners/items/${id}`);
      const currentPartners = get().partners;
      const partnersData = Array.isArray(currentPartners) 
        ? { items: currentPartners } 
        : currentPartners;
      
      set({ 
        partners: { 
          ...partnersData, 
          items: (partnersData.items || []).filter((p) => p._id !== id && p.id !== id) 
        } 
      });
      toast({ title: "Partner Deleted Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error deleting partner", 
        description: err.response?.data?.message || "Failed to delete partner",
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  reorderPartner: async (id, direction) => {
    const currentPartners = get().partners;
    const partnersData = Array.isArray(currentPartners) 
      ? { items: currentPartners } 
      : currentPartners;
    
    const items = [...(partnersData.items || [])];
    const index = items.findIndex((p) => p._id === id || p.id === id);
    
    if (index === -1) return;
    
    if (direction === 'up' && index > 0) {
      [items[index], items[index - 1]] = [items[index - 1], items[index]];
    } else if (direction === 'down' && index < items.length - 1) {
      [items[index], items[index + 1]] = [items[index + 1], items[index]];
    } else {
      return; // Already at top or bottom
    }
    
    set({ partners: { ...partnersData, items } });
    
    // Update on server - reordering is handled by updating items individually
    // The order is maintained by the array position, so we just need to refresh
    set({ loading: true });
    try {
      // Reordering doesn't require sending all items - just refresh from server
      await get().fetchContent();
      toast({ title: "Partner Reordered Successfully" });
    } catch (err) {
      console.error(err);
      toast({ 
        title: "Error reordering partner", 
        description: err.response?.data?.message || "Failed to reorder partner",
        variant: "destructive" 
      });
      // Revert on error
      set({ partners: partnersData });
    } finally {
      set({ loading: false });
    }
  },
  
  updateJobs: async (jobs) => {
    set({ loading: true });
    try {
      // Build payload with headers and items (like services)
      const payload = {
        title_en: jobs?.title_en ?? "",
        title_ar: jobs?.title_ar ?? "",
        subtitle_en: jobs?.subtitle_en ?? "",
        subtitle_ar: jobs?.subtitle_ar ?? "",
        items: Array.isArray(jobs?.items)
          ? jobs.items
              .filter((item) => {
                // Only include items with title_en (required field)
                const titleEn = (item.title_en ?? "").trim();
                return titleEn !== "";
              })
              .map((item) => {
                // API requires title_ar and description_en to not be empty
                const titleEn = (item.title_en ?? "").trim();
                const titleAr = (item.title_ar ?? "").trim();
                const descEn = (item.description_en ?? "").trim();
                const descAr = (item.description_ar ?? "").trim();
                
                return {
                  title_en: titleEn,
                  title_ar: titleAr || titleEn, // Use title_en as fallback if title_ar is empty
                  description_en: descEn || titleEn, // Use title_en as fallback if description_en is empty
                  description_ar: descAr || titleAr || titleEn, // Use title_ar or title_en as fallback
                  link: (item.link ?? "").trim(),
                  isActive: item.isActive ?? true,
                };
              })
          : [],
      };
      
      // Try PUT /content/jobs with all items (like services)
      await http.put("/content/jobs", payload);
      
      // Preserve _id from original items for local state
      const updatedJobs = {
        ...jobs,
        title_en: payload.title_en,
        title_ar: payload.title_ar,
        subtitle_en: payload.subtitle_en,
        subtitle_ar: payload.subtitle_ar,
        items: jobs.items?.map((item, index) => {
          const updatedItem = payload.items[index];
          if (!updatedItem) return item;
          return {
            ...item,
            ...updatedItem,
            // Preserve _id and id if they exist
            _id: item._id,
            id: item.id,
          };
        }) || payload.items,
      };
      
      set({ jobs: updatedJobs });
      toast({ title: "Jobs Updated Successfully" });
    } catch (err: any) {
      console.error("Error updating jobs:", err.response?.data || err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update jobs";
      toast({ 
        title: "Error updating jobs", 
        description: errorMessage,
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
  
  addJob: async (job) => {
    set({ loading: true });
    try {
      // Validate required fields
      const titleEn = (job.title_en ?? "").trim();
      if (!titleEn) {
        throw new Error('Job title (English) is required');
      }
      
      const payload = {
        title_en: titleEn,
        title_ar: (job.title_ar ?? "").trim(),
        description_en: (job.description_en ?? "").trim(),
        description_ar: (job.description_ar ?? "").trim(),
        link: (job.link ?? "").trim(),
        isActive: job.isActive ?? true,
      };
      
      // Try POST /content/jobs/items first (like services/projects/partners)
      let res;
      try {
        res = await http.post("/content/jobs/items", payload);
      } catch (itemsErr: any) {
        // If that fails with 404, try POST /content/jobs
        if (itemsErr.response?.status === 404) {
          res = await http.post("/content/jobs", payload);
        } else {
          throw itemsErr;
        }
      }
      const currentJobs = get().jobs;
      const jobsData = Array.isArray(currentJobs) 
        ? { items: currentJobs } 
        : currentJobs;
      
      set({ 
        jobs: { 
          ...jobsData, 
          items: [...(jobsData.items || []), res.data] 
        } 
      });
      toast({ title: "Job Added Successfully" });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to add job";
      toast({ 
        title: "Error adding job", 
        description: errorMsg,
        variant: "destructive" 
      });
      throw err; // Re-throw so caller can handle it
    } finally {
      set({ loading: false });
    }
  },
  
  deleteJob: async (id) => {
    set({ loading: true });
    try {
      // Don't try to delete if id is a fallback key (like "job-4")
      if (id.startsWith('job-')) {
        // Just remove from local state for new items
        const currentJobs = get().jobs;
        const jobsData = Array.isArray(currentJobs) 
          ? { items: currentJobs } 
          : currentJobs;
        
        set({ 
          jobs: { 
            ...jobsData, 
            items: (jobsData.items || []).filter((j) => j._id !== id && j.id !== id) 
          } 
        });
        toast({ title: "Job Removed Successfully" });
        set({ loading: false });
        return;
      }
      
      // Try DELETE /content/jobs/items/{id} first (like projects/partners)
      try {
        await http.delete(`/content/jobs/items/${id}`);
      } catch (pathErr: any) {
        // If that fails with 404, try DELETE /content/jobs with id in body
        if (pathErr.response?.status === 404) {
          try {
            await http.delete(`/content/jobs`, { data: { _id: id } });
          } catch (bodyErr: any) {
            // If that also fails, try DELETE /content/jobs/items with id in body
            if (bodyErr.response?.status === 404) {
              await http.delete(`/content/jobs/items`, { data: { _id: id } });
            } else {
              throw bodyErr;
            }
          }
        } else {
          throw pathErr;
        }
      }
      
      const currentJobs = get().jobs;
      const jobsData = Array.isArray(currentJobs) 
        ? { items: currentJobs } 
        : currentJobs;
      
      set({ 
        jobs: { 
          ...jobsData, 
          items: (jobsData.items || []).filter((j) => j._id !== id && j.id !== id) 
        } 
      });
      toast({ title: "Job Deleted Successfully" });
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || "Failed to delete job";
      toast({ 
        title: "Error deleting job", 
        description: errorMsg,
        variant: "destructive" 
      });
    } finally {
      set({ loading: false });
    }
  },
}));