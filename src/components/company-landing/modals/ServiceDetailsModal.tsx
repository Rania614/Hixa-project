import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";

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
  const [currentServiceSectionIndex, setCurrentServiceSectionIndex] = useState<number>(0);
  const [serviceCarouselApi, setServiceCarouselApi] = useState<CarouselApi | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-hidden bg-secondary/95 border-border p-0">
        {selectedServiceForDetails && (
          <div className="space-y-6 p-6">
            {/* Service Title and Description */}
            <div className="text-center space-y-4 pb-6 border-b border-border">
              <h2 className="text-3xl sm:text-4xl font-bold text-card-foreground">
                {getFieldValue(selectedServiceForDetails, "title", language) ||
                 selectedServiceForDetails?.name ||
                 "Service"}
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {getFieldValue(selectedServiceForDetails, "description", language) ||
                 selectedServiceForDetails?.details ||
                 selectedServiceForDetails?.description_en ||
                 selectedServiceForDetails?.description_ar ||
                 ""}
              </p>
            </div>

            {/* Four Specializations Slider - One per screen */}
            {selectedServiceDetails && selectedServiceDetails.length > 0 ? (
              <div className="relative">
                <Carousel
                  opts={{
                    align: "start",
                    loop: false,
                  }}
                  className="w-full"
                  setApi={(api: CarouselApi) => {
                    if (!api) return;
                    setServiceCarouselApi(api);
                    api.on("select", () => {
                      setCurrentServiceSectionIndex(api.selectedScrollSnap());
                    });
                    setCurrentServiceSectionIndex(api.selectedScrollSnap());
                  }}
                >
                  <CarouselContent className="-ml-0">
                    {selectedServiceDetails.slice(0, 4).map((section: any, index: number) => {
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
                        <CarouselItem key={index} className="pl-0 basis-full">
                          <div className="bg-card rounded-xl border-2 border-gold/50 p-6 flex flex-col h-full relative overflow-hidden min-h-[500px] sm:min-h-[600px]">
                            {/* Content wrapper */}
                            <div className="flex-1 flex flex-col pb-52 sm:pb-56">
                              {/* Section Title */}
                              {sectionTitle && (
                                <h3 className="text-xl sm:text-2xl font-bold text-gold mb-6 uppercase z-10 relative">
                                  {sectionTitle}
                                </h3>
                              )}

                              {/* Section Details List */}
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

                            {/* Order Now Button */}
                            <Button
                              className="absolute bottom-6 left-6 w-auto bg-gold hover:bg-gold-dark text-black font-semibold py-1.5 px-4 text-sm z-10"
                              onClick={(e) => {
                                e.stopPropagation();
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

                            {/* Image in bottom right */}
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
                                  <div className="absolute bottom-2 left-2 right-2">
                                    <p className="text-xs text-white/80 font-medium uppercase truncate">
                                      {sectionTitle || ''}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </CarouselItem>
                      );
                    })}
                  </CarouselContent>
                  <CarouselPrevious className={`${language === 'ar' ? 'right-4 left-auto' : 'left-4'} bg-gold/80 hover:bg-gold text-black border-0 h-10 w-10`} />
                  <CarouselNext className={`${language === 'ar' ? 'left-4 right-auto' : 'right-4'} bg-gold/80 hover:bg-gold text-black border-0 h-10 w-10`} />
                </Carousel>
                
                {/* Slider Indicators */}
                <div className="flex justify-center gap-2 mt-6">
                  {selectedServiceDetails.slice(0, 4).map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (serviceCarouselApi) {
                          serviceCarouselApi.scrollTo(index);
                        }
                      }}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        currentServiceSectionIndex === index
                          ? 'w-8 bg-gold'
                          : 'w-2 bg-gold/30 hover:bg-gold/50'
                      }`}
                      aria-label={language === 'en' ? `Go to section ${index + 1}` : `الانتقال إلى القسم ${index + 1}`}
                    />
                  ))}
                </div>
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

