import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: string | null;
  language: "en" | "ar";
}

export const ImageModal: React.FC<ImageModalProps> = ({
  open,
  onOpenChange,
  selectedImage,
  language,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={language === 'en' ? 'Full size image' : 'صورة بحجم كامل'}
              className="max-w-full max-h-[95vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <button
            onClick={() => onOpenChange(false)}
            className={`absolute top-4 text-white hover:text-gold transition-colors duration-200 bg-black/50 rounded-full p-2 hover:bg-black/70 ${language === 'ar' ? 'left-4' : 'right-4'}`}
            aria-label={language === 'en' ? 'Close' : 'إغلاق'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

