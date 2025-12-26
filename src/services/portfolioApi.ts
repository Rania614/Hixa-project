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
    console.log("Fetching portfolio works for user ID:", userId);
    const response = await http.get(`/portfolio/user/${userId}`);
    console.log("API Response:", response.data);
    
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
    
    console.log("Processed works:", works);
    return works;
  } catch (error: any) {
    console.error("Error fetching portfolio works by user ID:", error);
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
    console.log("API Response:", response.data);
    
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
    
    console.log("Processed works:", works);
    return works;
  } catch (error: any) {
    console.error("Error fetching portfolio works:", error);
    toast.error(error.response?.data?.message || "Failed to fetch portfolio works");
    throw error;
  }
};

// GET portfolio work by ID
export const getPortfolioWorkById = async (id: string | number): Promise<PortfolioWork> => {
  try {
    console.log("Fetching portfolio work by ID:", id);
    const response = await http.get(`/portfolio/${id}`);
    console.log("Get portfolio work response:", response);
    console.log("Get portfolio work response.data:", response.data);
    
    // Handle different response formats
    const work = response.data?.data || response.data?.work || response.data;
    console.log("Processed work:", work);
    
    return work;
  } catch (error: any) {
    console.error("Error fetching portfolio work:", error);
    console.error("Error response:", error.response);
    toast.error(error.response?.data?.message || "Failed to fetch portfolio work");
    throw error;
  }
};

// POST add new portfolio work
export const addPortfolioWork = async (workData: FormData | PortfolioWork): Promise<PortfolioWork> => {
  try {
    console.log("Adding portfolio work, data type:", workData instanceof FormData ? "FormData" : "JSON");
    console.log("Adding portfolio work, data:", workData);
    
    const response = await http.post("/portfolio", workData);
    console.log("Add portfolio work response:", response);
    console.log("Add portfolio work response.data:", response.data);
    console.log("Full response.data keys:", Object.keys(response.data || {}));
    
    // Log image information if available - check all possible locations
    console.log("Checking for image in response.data:", response.data);
    console.log("response.data.image:", response.data?.image);
    console.log("response.data.data:", response.data?.data);
    console.log("response.data.data?.image:", response.data?.data?.image);
    console.log("response.data.work:", response.data?.work);
    console.log("response.data.work?.image:", response.data?.work?.image);
    
    // Check all possible image field names - API uses 'mainImage' which is an object with 'url'
    const work = response.data?.data || response.data?.work || response.data;
    console.log("Extracted work object:", work);
    console.log("Work object keys:", Object.keys(work || {}));
    console.log("work.mainImage:", work?.mainImage);
    console.log("work.mainImage type:", typeof work?.mainImage);
    console.log("work.mainImage?.url:", work?.mainImage?.url);
    console.log("work.gallery:", work?.gallery);
    
    toast.success("Work added successfully");
    
    console.log("Returning work:", work);
    if (work?.mainImage) {
      if (typeof work.mainImage === 'object' && work.mainImage.url) {
        console.log("Final work image path (from mainImage.url):", work.mainImage.url);
      } else if (typeof work.mainImage === 'string') {
        console.log("Final work image path (mainImage is string):", work.mainImage);
      }
    } else if (work?.image || work?.imageUrl || work?.photo) {
      console.log("Final work image path:", work.image || work.imageUrl || work.photo);
    } else {
      console.warn("⚠️ No image found in work object! Available keys:", Object.keys(work || {}));
    }
    return work;
  } catch (error: any) {
    console.error("Error adding portfolio work:", error);
    console.error("Error response:", error.response);
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
    console.error("Error updating portfolio work:", error);
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
    console.error("Error deleting portfolio work:", error);
    toast.error(error.response?.data?.message || "Failed to delete portfolio work");
    throw error;
  }
};

