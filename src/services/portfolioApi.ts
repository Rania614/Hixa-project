import { http } from "./http";
import { toast } from "@/components/ui/sonner";

export interface PortfolioWork {
  id?: string | number;
  title: string;
  description: string;
  category: string;
  date: string;
  image?: string | File | null;
  imagePreview?: string;
  location?: string;
  client?: string;
  status?: string;
  images?: string[];
  features?: string[];
}

// GET portfolio works by user ID
export const getPortfolioWorksByUserId = async (userId: string | number): Promise<PortfolioWork[]> => {
  try {
    
    const response = await http.get(`/portfolio/user/${userId}`);
    
    
    // Handle different response formats
    let works: PortfolioWork[] = [];
    
    if (Array.isArray(response.data)) {
      works = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      works = response.data.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      works = response.data.items;
    } else if (response.data?.works && Array.isArray(response.data.works)) {
      works = response.data.works;
    } else if (response.data && typeof response.data === 'object') {
      // If it's a single object, wrap it in an array
      works = [response.data as PortfolioWork];
    }
    
    
    return works;
  } catch (error: any) {
    
    toast.error(error.response?.data?.message || "Failed to fetch portfolio works");
    throw error;
  }
};

// GET all portfolio works (fallback - uses user-specific endpoint if userId provided)
export const getAllPortfolioWorks = async (userId?: string | number): Promise<PortfolioWork[]> => {
  // If userId is provided, use user-specific endpoint
  if (userId) {
    return getPortfolioWorksByUserId(userId);
  }
  
  try {
    const response = await http.get("/portfolio");
    
    
    // Handle different response formats
    let works: PortfolioWork[] = [];
    
    if (Array.isArray(response.data)) {
      works = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      works = response.data.data;
    } else if (response.data?.items && Array.isArray(response.data.items)) {
      works = response.data.items;
    } else if (response.data?.works && Array.isArray(response.data.works)) {
      works = response.data.works;
    } else if (response.data && typeof response.data === 'object') {
      // If it's a single object, wrap it in an array
      works = [response.data as PortfolioWork];
    }
    
    
    return works;
  } catch (error: any) {
    
    toast.error(error.response?.data?.message || "Failed to fetch portfolio works");
    throw error;
  }
};

// GET portfolio work by ID
export const getPortfolioWorkById = async (id: string | number): Promise<PortfolioWork> => {
  try {
    
    const response = await http.get(`/portfolio/${id}`);
    
    
    
    // Handle different response formats
    const work = response.data?.data || response.data?.work || response.data;
    
    
    return work;
  } catch (error: any) {
    
    
    toast.error(error.response?.data?.message || "Failed to fetch portfolio work");
    throw error;
  }
};

// POST add new portfolio work
export const addPortfolioWork = async (workData: FormData | PortfolioWork): Promise<PortfolioWork> => {
  try {
    
    
    
    const response = await http.post("/portfolio", workData);
    
    
    
    
    // Log image information if available - check all possible locations
    
    
    
    
    
    
    
    // Check all possible image field names - API uses 'mainImage' which is an object with 'url'
    const work = response.data?.data || response.data?.work || response.data;
    
    
    
    
    
    
    
    toast.success("Work added successfully");
    
    
    if (work?.mainImage) {
      if (typeof work.mainImage === 'object' && work.mainImage.url) {
        
      } else if (typeof work.mainImage === 'string') {
        
      }
    } else if (work?.image || work?.imageUrl || work?.photo) {
      
    } else {
      
    }
    return work;
  } catch (error: any) {
    
    
    toast.error(error.response?.data?.message || "Failed to add portfolio work");
    throw error;
  }
};

// PUT update portfolio work
export const updatePortfolioWork = async (
  id: string | number,
  workData: FormData | PortfolioWork
): Promise<PortfolioWork> => {
  try {
    const response = await http.put(`/portfolio/${id}`, workData);
    toast.success("Work updated successfully");
    return response.data;
  } catch (error: any) {
    
    toast.error(error.response?.data?.message || "Failed to update portfolio work");
    throw error;
  }
};

// DELETE portfolio work
export const deletePortfolioWork = async (id: string | number): Promise<void> => {
  try {
    await http.delete(`/portfolio/${id}`);
    toast.success("Work deleted successfully");
  } catch (error: any) {
    
    toast.error(error.response?.data?.message || "Failed to delete portfolio work");
    throw error;
  }
};

