import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { http } from "@/services/http";

interface ServiceDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedServiceForDetails: any;
  selectedServiceDetails: any[];
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  onOrderClick: (service: any) => void;
}

export const ServiceDetailsModal: React.FC<ServiceDetailsModalProps> = ({
  open,
  onOpenChange,
  selectedServiceForDetails,
  selectedServiceDetails,
  language,
  getFieldValue,
  onOrderClick,
}) => {
  const [serviceSections, setServiceSections] = useState<any[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Reset sections when modal closes
  useEffect(() => {
    if (!open) {
      setServiceSections([]);
      setLoadingSections(false);
    }
  }, [open]);

  // Fetch service details from API when modal opens
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!open || !selectedServiceForDetails) {
        setServiceSections([]);
        return;
      }

      const serviceId = selectedServiceForDetails._id || selectedServiceForDetails.id;
      console.log('🔍 ServiceDetailsModal: Service ID:', serviceId);
      console.log('🔍 ServiceDetailsModal: Selected service:', selectedServiceForDetails);
      
      if (!serviceId) {
        console.warn('⚠️ No service ID found for fetching details');
        // Use passed selectedServiceDetails if available
        if (selectedServiceDetails && selectedServiceDetails.length > 0) {
          console.log('📋 Using passed service details (no ID):', selectedServiceDetails);
          setServiceSections(selectedServiceDetails.slice(0, 4));
        } else {
          setServiceSections([]);
        }
        return;
      }

      // If we already have details passed, use them first
      if (selectedServiceDetails && selectedServiceDetails.length > 0) {
        console.log('📋 Using passed service details:', selectedServiceDetails);
        setServiceSections(selectedServiceDetails.slice(0, 4));
        return;
      }

      // Otherwise, fetch from API
      setLoadingSections(true);
      try {
        console.log(`🔄 Fetching details for service ${serviceId} from API...`);
        const response = await http.get(`/content/services/items/${serviceId}/details`);
        
        let details: any[] = [];
        if (Array.isArray(response.data)) {
          details = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          details = response.data.data;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          details = response.data.items;
        } else if (response.data?.details && Array.isArray(response.data.details)) {
          details = response.data.details;
        } else {
          const dataKeys = Object.keys(response.data || {});
          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              details = response.data[key];
              break;
            }
          }
        }
        
        // Sort by sectionKey and take first 4
        const sortedDetails = details
          .sort((a: any, b: any) => {
            const aKey = a.sectionKey || '';
            const bKey = b.sectionKey || '';
            return aKey.localeCompare(bKey);
          })
          .slice(0, 4);
        
        console.log(`✅ Fetched ${sortedDetails.length} sections for service ${serviceId}:`, sortedDetails);
        setServiceSections(sortedDetails);
      } catch (error: any) {
        console.error(`❌ Error fetching service details for ${serviceId}:`, error);
        // Use passed selectedServiceDetails as fallback
        if (selectedServiceDetails && selectedServiceDetails.length > 0) {
          setServiceSections(selectedServiceDetails.slice(0, 4));
        } else {
          setServiceSections([]);
        }
      } finally {
        setLoadingSections(false);
      }
    };

    fetchServiceDetails();
  }, [open, selectedServiceForDetails, selectedServiceDetails]);

  const serviceTitle = selectedServiceForDetails 
    ? (getFieldValue(selectedServiceForDetails, "title", language) ||
       selectedServiceForDetails?.name ||
       "Service")
    : "";

  const serviceDescription = selectedServiceForDetails
    ? (getFieldValue(selectedServiceForDetails, "description", language) ||
       selectedServiceForDetails?.details ||
       selectedServiceForDetails?.description_en ||
       selectedServiceForDetails?.description_ar ||
       "")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto bg-secondary/95 border-border">
        <DialogHeader className="sr-only">
          <DialogTitle>{serviceTitle}</DialogTitle>
          <DialogDescription>{serviceDescription}</DialogDescription>
        </DialogHeader>
        {selectedServiceForDetails && (
          <div className="space-y-6">
            {/* Service Title and Description */}
            <div className="text-center space-y-4 pb-6 border-b border-border">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
                {serviceTitle}
              </h2>
              {serviceDescription && (
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  {serviceDescription}
                </p>
              )}
            </div>

            {/* Four Specializations Grid - 2x2 */}
            {loadingSections ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
                <p className="text-muted-foreground mt-4">
                  {language === 'en' ? 'Loading sections...' : 'جاري تحميل الأقسام...'}
                </p>
              </div>
            ) : serviceSections && serviceSections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {serviceSections.map((section: any, index: number) => {
                  const sectionTitle = getFieldValue(section, "title", language) || 
                                      section?.title_en || 
                                      section?.title_ar || 
                                      "";
                  const sectionDetails = getFieldValue(section, "details", language) || 
                                      section?.details_en || 
                                      section?.details_ar || 
                                      "";
                  const sectionImage = section?.image || section?.imageUrl || "";
                  
                  // Parse details if it's a string with line breaks
                  const detailsList = sectionDetails 
                    ? (typeof sectionDetails === 'string' 
                        ? sectionDetails.split('\n').filter((line: string) => line.trim())
                        : [])
                    : [];

                  return (
                    <div 
                      key={index} 
                      className="bg-card rounded-xl border-2 border-gold/50 p-6 flex flex-col h-full relative overflow-hidden min-h-[400px]"
                    >
                      {/* Content wrapper - free space, avoids image and button area */}
                      <div className="flex-1 flex flex-col pb-52 sm:pb-56">
                        {/* Section Title - Orange/Gold at top */}
                        {sectionTitle && (
                          <h3 className="text-xl sm:text-2xl font-bold text-gold mb-6 uppercase z-10 relative">
                            {sectionTitle}
                          </h3>
                        )}

                        {/* Section Details List - White text, uppercase */}
                        {detailsList.length > 0 && (
                          <div className="mb-4 z-10 relative flex-1">
                            <ul className="space-y-2.5">
                              {detailsList.map((item: string, itemIndex: number) => (
                                <li 
                                  key={itemIndex} 
                                  className="text-sm sm:text-base text-white uppercase font-medium leading-relaxed"
                                >
                                  {item.trim()}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Order Now Button - Fixed position opposite to image */}
                      <Button
                        className="absolute bottom-6 left-6 w-auto bg-gold hover:bg-gold-dark text-black font-semibold py-1.5 px-4 text-sm z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Create a service object for this specialization
                          const specializationService = {
                            ...selectedServiceForDetails,
                            specializationTitle: sectionTitle,
                            specializationDetails: sectionDetails,
                          };
                          onOrderClick(specializationService);
                          onOpenChange(false);
                        }}
                      >
                        {language === 'en' ? 'Order Now' : 'اطلب الآن'}
                      </Button>

                      {/* Image in bottom right with blue overlay */}
                      {sectionImage && (
                        <div className="absolute bottom-6 right-6 w-56 h-44 sm:w-64 sm:h-52 z-10">
                          <div className="relative w-full h-full rounded-lg overflow-hidden border border-cyan/30">
                            <img
                              src={sectionImage}
                              alt={sectionTitle || `Section ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            <div className="absolute inset-0 bg-cyan/30"></div>
                            {/* Optional text overlay */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <p className="text-xs text-white/80 font-medium uppercase truncate">
                                {sectionTitle || ''}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {language === 'en' ? 'No specializations available' : 'لا توجد تخصصات متاحة'}
                </p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

