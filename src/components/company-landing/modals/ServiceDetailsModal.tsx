import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { http } from "@/services/http";
import { Maximize2, ShoppingCart, Loader2, X, Info, QrCode, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});

  const isRtl = language === "ar";

  const toggleExpand = (index: number) => {
    setExpandedSections(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const formatListContent = (content: string) => {
    if (!content) return [];
    return content.split(/\d+\.|\n|•/).map(item => item.trim()).filter(item => item.length > 0);
  };

  useEffect(() => {
    if (!open) {
      setServiceSections([]);
      setLoadingSections(false);
      setSelectedImage(null);
      setExpandedSections({});
    }
  }, [open]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!open || !selectedServiceForDetails) return;
      const serviceId = selectedServiceForDetails._id || selectedServiceForDetails.id;
      
      if (selectedServiceDetails?.length > 0) {
        setServiceSections(selectedServiceDetails.slice(0, 4));
        return;
      }

      setLoadingSections(true);
      try {
        const response = await http.get(`/content/services/items/${serviceId}/details`);
        const details = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setServiceSections(details.slice(0, 4));
      } catch (error) {
        setServiceSections([]);
      } finally {
        setLoadingSections(false);
      }
    };
    fetchServiceDetails();
  }, [open, selectedServiceForDetails, selectedServiceDetails]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        dir={isRtl ? "rtl" : "ltr"}
        className="max-w-6xl w-[95vw] max-h-[90vh] bg-[#0A0A0A] border border-white/10 text-white rounded-[2rem] p-0 overflow-hidden flex flex-col shadow-2xl transition-all duration-500 outline-none"
      >
        {/* Header - تم ضبط المحاذاة والوصف هنا */}
        <div className="relative p-10 bg-gradient-to-b from-white/5 to-transparent border-b border-white/5 shrink-0">
          <DialogHeader className={isRtl ? "text-right" : "text-left"}>
            <div className={`flex items-center gap-4 mb-4 ${isRtl ? "flex-row" : "flex-row"}`}>
              <div className="h-10 w-2 bg-[#D4AF37] rounded-sm shadow-[0_0_15px_rgba(212,175,55,0.5)]" />
              <DialogTitle className="text-4xl font-black tracking-tight text-white leading-tight">
                {selectedServiceForDetails && getFieldValue(selectedServiceForDetails, "title", language)}
              </DialogTitle>
            </div>
            {/* ضبط محاذاة الوصف لتبدأ من اليمين في العربية */}
            <DialogDescription className={`text-gray-300 text-lg leading-relaxed max-w-5xl opacity-90 ${isRtl ? "text-right" : "text-left"}`}>
              {selectedServiceForDetails && getFieldValue(selectedServiceForDetails, "description", language)}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          {loadingSections ? (
            <div className="h-64 flex flex-col items-center justify-center">
              <Loader2 className="h-12 w-12 text-[#D4AF37] animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {serviceSections.map((section, index) => {
                const listItems = formatListContent(getFieldValue(section, "details", language) || "");
                const isExpanded = expandedSections[index];
                const visibleItems = isExpanded ? listItems : listItems.slice(0, 3);
                const hasMore = listItems.length > 3;

                // جلب الصور من لوحة التحكم (CMS) - يدعم أكثر من مسمى للحقول
                const sectionImage = section?.image || section?.imageUrl || section?.thumbnail;
                const qrImage = section?.qrCodeImage || section?.qrCode || section?.qr;

                return (
                  <div key={index} className="group bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden hover:border-[#D4AF37]/30 transition-all duration-700 shadow-xl flex flex-col h-full">
                    {/* Image Area - CMS Linked */}
                    <div className="relative h-64 overflow-hidden shrink-0">
                      {sectionImage ? (
                        <>
                          <img src={sectionImage} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="Service Section" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="secondary" size="icon" onClick={() => setSelectedImage(sectionImage)} className="rounded-full scale-125">
                              <Maximize2 size={16} />
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-600 italic">No Preview Image</div>
                      )}
                    </div>

                    {/* Content Area */}
                    <div className="p-8 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-6">
                        <h4 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-tight max-w-[80%]">
                          {getFieldValue(section, "title", language)}
                        </h4>
                        <span className="text-white/10 font-black text-5xl italic select-none">0{index + 1}</span>
                      </div>

                      <div className={`space-y-4 mb-6 flex-1 text-gray-400 ${isRtl ? "text-right" : "text-left"}`}>
                        {visibleItems.map((item, i) => (
                          <div key={i} className="flex gap-3 text-sm leading-relaxed animate-in fade-in duration-500 items-start">
                            {isRtl ? <ChevronLeft size={18} className="text-[#D4AF37] shrink-0 mt-1" /> : <ChevronRight size={18} className="text-[#D4AF37] shrink-0 mt-1" />}
                            <span className="w-full">{item}</span>
                          </div>
                        ))}
                      </div>

                      {hasMore && (
                        <button 
                          onClick={() => toggleExpand(index)}
                          className="text-[#D4AF37] hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-all w-fit border-b border-[#D4AF37]/30 hover:border-white pb-1"
                        >
                          {isExpanded ? (isRtl ? "عرض أقل" : "Show Less") : (isRtl ? "إقرأ المزيد" : "Read More")}
                        </button>
                      )}

                      {/* Footer: QR (CMS Linked) & Order Button */}
                      <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                        <div className="flex flex-col items-center gap-2">
                          <div className="bg-white p-2 rounded-xl w-24 h-24 shadow-2xl flex items-center justify-center transition-transform hover:scale-105">
                            {qrImage ? (
                              <img src={qrImage} className="w-full h-full object-contain" alt="QR" />
                            ) : (
                              <div className="text-black flex flex-col items-center">
                                <QrCode size={35} />
                                <span className="text-[8px] font-bold">NO QR</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest">{isRtl ? "امسح الآن" : "Scan Now"}</span>
                        </div>

                        <Button 
                          onClick={() => {
                            // Pass the full service object, not just the section
                            // Include serviceId/itemId if available
                            const serviceToSend = {
                              ...selectedServiceForDetails,
                              itemId: selectedServiceForDetails?.itemId || selectedServiceForDetails?.serviceId,
                              serviceId: selectedServiceForDetails?.itemId || selectedServiceForDetails?.serviceId || selectedServiceForDetails?._id || selectedServiceForDetails?.id,
                            };
                            onOrderClick(serviceToSend);
                          }}
                          className="bg-[#D4AF37] hover:bg-white text-black font-black rounded-full px-12 h-14 transition-all shadow-lg active:scale-95 text-lg"
                        >
                          {isRtl ? "اطلب الآن" : "Order"}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>

      {/* Full Screen Image Previewer */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] bg-black/95 border-none p-0 flex items-center justify-center backdrop-blur-3xl z-[200]">
          <button 
            onClick={() => setSelectedImage(null)} 
            className={`absolute top-8 ${isRtl ? "left-8" : "right-8"} z-[210] p-3 bg-white/10 rounded-full text-white hover:bg-gold transition-all`}
          >
            <X size={28} />
          </button>
          <img src={selectedImage!} className="max-w-full max-h-[90vh] object-contain rounded-2xl animate-in zoom-in-95 duration-500" alt="Full view" />
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};