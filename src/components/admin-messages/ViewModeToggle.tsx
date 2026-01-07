import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ViewModeToggleProps {
  viewMode: 'all' | 'project';
  language: string;
  onViewModeChange: (mode: 'all' | 'project') => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  language,
  onViewModeChange,
}) => {
  return (
    <Card className="w-48 flex-shrink-0 flex flex-col overflow-hidden glass-card h-full">
      <CardHeader className="flex-shrink-0 pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold mb-2">
          {language === "en" ? "View Mode" : "وضع العرض"}
        </CardTitle>
        <div className="flex flex-col gap-1.5">
          <Button
            variant={viewMode === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('all')}
            className="h-7 text-xs justify-start"
          >
            {language === "en" ? "All Chats" : "جميع المحادثات"}
          </Button>
          <Button
            variant={viewMode === 'project' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('project')}
            className="h-7 text-xs justify-start"
          >
            {language === "en" ? "By Project" : "حسب المشروع"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

