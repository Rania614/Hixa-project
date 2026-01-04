import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!open) {
      setServiceSections([]);
      setLoadingSections(false);
      setExpandedSections(new Set());
    }
  }, [open]);

  const toggleSection = (index: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!open || !selectedServiceForDetails) {
        setServiceSections([]);
        return;
      }

      const serviceId = selectedServiceForDetails._id || selectedServiceForDetails.id;
      
      if (!serviceId) {
        if (selectedServiceDetails && selectedServiceDetails.length > 0) {
          setServiceSections(selectedServiceDetails.slice(0, 4));
        } else {
          setServiceSections([]);
        }
        return;
      }

      if (selectedServiceDetails && selectedServiceDetails.length > 0) {
        setServiceSections(selectedServiceDetails.slice(0, 4));
        return;
      }

      setLoadingSections(true);
      try {
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
        }
        
        const sortedDetails = details
          .sort((a: any, b: any) => (a.sectionKey || '').localeCompare(b.sectionKey || ''))
          .slice(0, 4);
        
        setServiceSections(sortedDetails);
      } catch (error: any) {
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
    ? (getFieldValue(selectedServiceForDetails, "title", language) || selectedServiceForDetails?.name || "Service")
    : "";

  const serviceDescription = selectedServiceForDetails
    ? (getFieldValue(selectedServiceForDetails, "description", language) || selectedServiceForDetails?.details || "")
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Modal Container: خلفية داكنة مع حدود خفيفة */}
      <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] bg-primary-dark border-accent-gold/30 text-text-light rounded-2xl p-6 overflow-hidden flex flex-col">
        <DialogHeader className={`mb-4 flex-shrink-0 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
          <DialogTitle className={`text-2xl font-bold uppercase tracking-wider text-text-light ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {serviceTitle}
          </DialogTitle>
          {serviceDescription && (
            <DialogDescription className={`text-gray-300 text-base mt-3 leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              {serviceDescription}
            </DialogDescription>
          )}
        </DialogHeader>

        {selectedServiceForDetails && (
          <div className="space-y-6 overflow-y-auto flex-1 scrollbar-hide">
            {loadingSections ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
              </div>
            ) : serviceSections && serviceSections.length > 0 ? (
              <div className="flex flex-col gap-6">
                {serviceSections.map((section: any, index: number) => {
                  const sectionTitle = getFieldValue(section, "title", language) || section?.title_en || "";
                  const sectionDetails = getFieldValue(section, "details", language) || section?.details_en || "";
                  const sectionImage = section?.image || section?.imageUrl || "";
                  
                  // Parse details into array
                  const detailsArray = typeof sectionDetails === 'string' 
                    ? sectionDetails.split('\n').filter((line: string) => line.trim())
                    : Array.isArray(sectionDetails)
                    ? sectionDetails
                    : sectionDetails ? [String(sectionDetails)] : [];
                  
                  const isExpanded = expandedSections.has(index);
                  const hasMore = detailsArray.length > 3;
                  const visibleItems = isExpanded ? detailsArray : detailsArray.slice(0, 3);

                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-6 p-2 group transition-all"
                    >
                      {/* 1. Image Left - Rounded corners like the image */}
                      <div className="w-32 h-32 flex-shrink-0">
                        <img
                          src={sectionImage}
                          alt={sectionTitle}
                          className="w-full h-full object-cover rounded-3xl border border-gray-700 shadow-lg"
                        />
                      </div>

                      {/* 2. Text Center */}
                      <div className="flex-1 space-y-3">
                        {detailsArray.length > 0 && (
                          <div>
                            <div 
                              className="text-sm text-gray-300 leading-relaxed space-y-1 cursor-pointer"
                              onClick={() => hasMore && toggleSection(index)}
                            >
                              {visibleItems.map((item: string, itemIndex: number) => {
                                // Remove any existing numbers or bullets from the item text
                                const cleanItem = item.trim().replace(/^[\d•.\-\s]+/, '').trim();
                                return (
                                  <div key={itemIndex} className="flex gap-2">
                                    <span className="text-accent-gold flex-shrink-0 font-semibold">{itemIndex + 1}.</span>
                                    <span>{cleanItem || item.trim()}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {hasMore && (
                              <button
                                onClick={() => toggleSection(index)}
                                className="text-accent-gold hover:text-accent-dark text-xs mt-2 underline cursor-pointer"
                              >
                                {isExpanded 
                                  ? (language === 'en' ? 'Show Less' : 'عرض أقل')
                                  : (language === 'en' ? 'Show More' : 'عرض المزيد')
                                }
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 3. QR Code and Order Link Right */}
                      <div className="flex flex-col items-center gap-2 flex-shrink-0">
                        <div className="w-20 h-20 bg-white p-1 rounded-sm">
                           {/* هنا يمكن وضع الـ QR Code الفعلي أو صورة ثابتة له */}
                          <div className="w-full h-full border border-black flex items-center justify-center">
                              <span className="text-[8px] text-black font-bold">QR CODE</span>
                          </div>
                        </div>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onOrderClick(section);
                          }}
                          className="text-accent-gold hover:text-accent-dark font-bold text-xs uppercase underline cursor-pointer text-center"
                        >
                          {language === 'en' ? 'Order Now' : 'اطلب الآن'}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                {language === 'en' ? 'No services available' : 'لا توجد خدمات متاحة'}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};