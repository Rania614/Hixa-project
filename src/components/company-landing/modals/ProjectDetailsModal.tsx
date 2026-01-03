import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProject: any;
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  onImageClick: (imageUrl: string) => void;
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  open,
  onOpenChange,
  selectedProject,
  language,
  getFieldValue,
  onImageClick,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={`text-2xl font-bold ${language === 'ar' ? 'text-right' : 'text-left'}`}>
            {selectedProject ? (
              getFieldValue(selectedProject, "title", language) ||
              selectedProject?.name ||
              "Project"
            ) : ""}
          </DialogTitle>
        </DialogHeader>
        
        {selectedProject && (
          <div className="space-y-6 mt-4">
            {/* Project Image */}
            {selectedProject?.image || selectedProject?.imageUrl || selectedProject?.photo || selectedProject?.thumbnail ? (
              <div className="w-full cursor-pointer group" onClick={() => {
                const imageUrl = selectedProject.image || selectedProject.imageUrl || selectedProject.photo || selectedProject.thumbnail;
                onImageClick(imageUrl);
              }}>
                <div className="relative overflow-hidden rounded-lg border border-border">
                  <img
                    src={selectedProject.image || selectedProject.imageUrl || selectedProject.photo || selectedProject.thumbnail}
                    alt={getFieldValue(selectedProject, "title", language) || "Project"}
                    className="w-full h-64 sm:h-80 object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-medium bg-black/50 px-4 py-2 rounded-lg">
                      {language === 'en' ? 'Click to view full size' : 'اضغط لعرض الصورة كاملة'}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Project Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-card-foreground">
                {language === 'en' ? 'Description' : 'الوصف'}
              </h3>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {getFieldValue(selectedProject, "description", language) ||
                 selectedProject?.details ||
                 selectedProject?.description_en ||
                 selectedProject?.description_ar ||
                 (language === 'en' ? 'No description available' : 'لا يوجد وصف متاح')}
              </p>
            </div>

            {/* Project Link (if available) */}
            {selectedProject?.link || selectedProject?.url || selectedProject?.href ? (
              <div>
                <a
                  href={selectedProject.link || selectedProject.url || selectedProject.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-gold hover:text-gold-dark transition-colors"
                >
                  {language === 'en' ? 'Visit Project' : 'زيارة المشروع'}
                  <svg 
                    className={`w-4 h-4 ${language === 'en' ? 'ml-2' : 'mr-2'} ${language === 'ar' ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            ) : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

