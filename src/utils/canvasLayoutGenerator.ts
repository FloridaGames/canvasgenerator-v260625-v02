
import { LayoutOptionsData } from '@/components/course/LayoutOptions';

export const generateCanvasHTML = (content: string, layoutOptions: LayoutOptionsData): string => {
  if (!content) return '';

  const { contentWidth, contentAlignment, columns, columnWidths, textAlign } = layoutOptions;
  
  // Calculate flex basis for columns
  const getFlexBasis = (colWidth: number) => {
    const percentage = (colWidth / 12) * 100;
    return `calc(${percentage}% - 24px)`;
  };

  const containerStyle = `
    max-width: ${contentWidth};
    margin: 0 ${contentAlignment === 'center' ? 'auto' : contentAlignment === 'right' ? '0 0 0 auto' : '0 auto 0 0'};
    padding: 20px;
  `;

  if (columns === 1) {
    return `
      <div style="${containerStyle}">
        <div style="text-align: ${textAlign};">
          ${content}
        </div>
      </div>
    `;
  }

  const columnContent = content.split('</p>').filter(p => p.trim());
  const contentPerColumn = Math.ceil(columnContent.length / columns);
  
  const columnsHTML = columnWidths.map((width, index) => {
    const startIndex = index * contentPerColumn;
    const endIndex = startIndex + contentPerColumn;
    const columnContentSlice = columnContent.slice(startIndex, endIndex).join('</p>') + (columnContent.slice(startIndex, endIndex).length > 0 ? '</p>' : '');
    
    return `
      <div class="col-xs-12 col-md-${width}" style="flex: 1 1 ${getFlexBasis(width)}; background: #f5f5f5; padding: 20px; border: 1px solid #ccc; border-radius: 10px; min-height: 420px; text-align: ${textAlign}; margin: 12px;">
        ${columnContentSlice || '<p>Column content will appear here...</p>'}
      </div>
    `;
  }).join('');

  return `
    <div style="${containerStyle}">
      <div class="grid-row" style="display: flex; flex-wrap: wrap; justify-content: center;">
        ${columnsHTML}
      </div>
    </div>
  `;
};
