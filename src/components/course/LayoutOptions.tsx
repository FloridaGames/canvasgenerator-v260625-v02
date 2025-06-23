
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface LayoutOptionsData {
  contentWidth: '100%' | '800px' | '600px' | '400px';
  contentAlignment: 'left' | 'center' | 'right';
  columns: number;
  columnWidths: number[];
  textAlign: 'left' | 'center' | 'right';
}

interface LayoutOptionsProps {
  layoutOptions: LayoutOptionsData;
  setLayoutOptions: (options: LayoutOptionsData) => void;
}

export const LayoutOptions: React.FC<LayoutOptionsProps> = ({
  layoutOptions,
  setLayoutOptions
}) => {
  const updateColumnWidths = (columnIndex: number, width: number) => {
    const newWidths = [...layoutOptions.columnWidths];
    newWidths[columnIndex] = width;
    
    // Ensure total doesn't exceed 12
    const total = newWidths.reduce((sum, w) => sum + w, 0);
    if (total <= 12) {
      setLayoutOptions({ ...layoutOptions, columnWidths: newWidths });
    }
  };

  const setColumnsCount = (count: number) => {
    const defaultWidth = Math.floor(12 / count);
    const remainder = 12 % count;
    const newWidths = Array(count).fill(defaultWidth);
    
    // Distribute remainder
    for (let i = 0; i < remainder; i++) {
      newWidths[i]++;
    }
    
    setLayoutOptions({ 
      ...layoutOptions, 
      columns: count, 
      columnWidths: newWidths 
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Layout Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Content Width */}
        <div>
          <Label className="text-sm font-medium">Content Width</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {(['100%', '800px', '600px', '400px'] as const).map((width) => (
              <Button
                key={width}
                variant={layoutOptions.contentWidth === width ? "default" : "outline"}
                size="sm"
                onClick={() => setLayoutOptions({ ...layoutOptions, contentWidth: width })}
              >
                {width}
              </Button>
            ))}
          </div>
        </div>

        {/* Content Alignment */}
        <div>
          <Label className="text-sm font-medium">Content Alignment</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <Button
                key={align}
                variant={layoutOptions.contentAlignment === align ? "default" : "outline"}
                size="sm"
                onClick={() => setLayoutOptions({ ...layoutOptions, contentAlignment: align })}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Text Alignment */}
        <div>
          <Label className="text-sm font-medium">Text Alignment</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {(['left', 'center', 'right'] as const).map((align) => (
              <Button
                key={align}
                variant={layoutOptions.textAlign === align ? "default" : "outline"}
                size="sm"
                onClick={() => setLayoutOptions({ ...layoutOptions, textAlign: align })}
              >
                {align.charAt(0).toUpperCase() + align.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Number of Columns */}
        <div>
          <Label className="text-sm font-medium">Number of Columns</Label>
          <div className="grid grid-cols-4 gap-2 mt-2">
            {[1, 2, 3, 4].map((count) => (
              <Button
                key={count}
                variant={layoutOptions.columns === count ? "default" : "outline"}
                size="sm"
                onClick={() => setColumnsCount(count)}
              >
                {count}
              </Button>
            ))}
          </div>
        </div>

        {/* Column Width Configuration */}
        {layoutOptions.columns > 1 && (
          <div>
            <Label className="text-sm font-medium">Column Widths (12-Grid System)</Label>
            <div className="space-y-2 mt-2">
              {layoutOptions.columnWidths.map((width, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Label className="text-xs w-16">Col {index + 1}:</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={width}
                    onChange={(e) => updateColumnWidths(index, parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-500">/12</span>
                </div>
              ))}
              <div className="text-xs text-gray-500">
                Total: {layoutOptions.columnWidths.reduce((sum, w) => sum + w, 0)}/12
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
