import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface ChartExportOptions {
  filename?: string;
  title?: string;
  subtitle?: string;
  format?: 'png' | 'pdf';
  quality?: number;
  backgroundColor?: string;
}

export class ChartExporter {
  /**
   * Export a chart element as PNG or PDF
   * @param element - The DOM element to export
   * @param options - Export options
   */
  static async exportChart(
    element: HTMLElement,
    options: ChartExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'chart-export',
      title = 'Chart Export',
      subtitle = '',
      format = 'png',
      quality = 1,
      backgroundColor = '#ffffff'
    } = options;

    try {
      // Create canvas from the element
      const canvas = await html2canvas(element, {
        backgroundColor,
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight
      });

      if (format === 'png') {
        await this.exportAsPNG(canvas, filename);
      } else {
        await this.exportAsPDF(canvas, filename, title, subtitle);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw new Error('Failed to export chart');
    }
  }

  /**
   * Export canvas as PNG
   */
  private static async exportAsPNG(canvas: HTMLCanvasElement, filename: string): Promise<void> {
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = canvas.toDataURL('image/png', 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export canvas as PDF
   */
  private static async exportAsPDF(
    canvas: HTMLCanvasElement,
    filename: string,
    title: string,
    subtitle: string
  ): Promise<void> {
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Add title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, pdfWidth / 2, 20, { align: 'center' });
    
    // Add subtitle if provided
    if (subtitle) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(subtitle, pdfWidth / 2, 30, { align: 'center' });
    }
    
    // Calculate image dimensions to fit in PDF
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const maxWidth = pdfWidth - 40; // 20mm margin on each side
    const maxHeight = pdfHeight - 60; // 30mm margin top and bottom
    
    let finalWidth = imgWidth;
    let finalHeight = imgHeight;
    
    // Scale down if image is too large
    if (imgWidth > maxWidth || imgHeight > maxHeight) {
      const scaleX = maxWidth / imgWidth;
      const scaleY = maxHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      finalWidth = imgWidth * scale;
      finalHeight = imgHeight * scale;
    }
    
    // Center the image
    const x = (pdfWidth - finalWidth) / 2;
    const y = subtitle ? 45 : 35; // Start below title/subtitle
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    // Add timestamp
    const timestamp = new Date().toLocaleString();
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Exported on: ${timestamp}`, 20, pdfHeight - 10);
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
  }

  /**
   * Export multiple charts as a single PDF
   */
  static async exportMultipleCharts(
    elements: { element: HTMLElement; title: string; subtitle?: string }[],
    filename: string = 'charts-export'
  ): Promise<void> {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    for (let i = 0; i < elements.length; i++) {
      const { element, title, subtitle } = elements[i];
      
      console.log(`Exporting chart ${i + 1}: ${title}`);
      console.log('Element dimensions:', element.offsetWidth, 'x', element.offsetHeight);
      
      // Add new page if not the first page
      if (i > 0) {
        pdf.addPage();
      }
      
      // Create canvas from element with better settings
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
        width: element.offsetWidth,
        height: element.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.offsetWidth,
        windowHeight: element.offsetHeight,
        onclone: (clonedDoc) => {
          // Ensure the cloned element has proper dimensions
          const clonedElement = clonedDoc.querySelector(`[data-chart="${element.getAttribute('data-chart')}"]`) as HTMLElement;
          if (clonedElement) {
            clonedElement.style.width = '100%';
            clonedElement.style.height = '100%';
            clonedElement.style.display = 'block';
            clonedElement.style.overflow = 'visible';
            
            // Ensure SVG elements are visible and properly sized
            const svgElements = clonedElement.querySelectorAll('svg');
            svgElements.forEach(svg => {
              svg.style.overflow = 'visible';
              svg.style.maxWidth = 'none';
              svg.style.maxHeight = 'none';
            });
          }
        }
      });
      
      console.log('Canvas created with dimensions:', canvas.width, 'x', canvas.height);
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      
      // Calculate margins for better centering
      const topMargin = 25; // Space for title and subtitle
      const bottomMargin = 20; // Space for timestamp and page number
      const leftRightMargin = 30; // Equal margins on sides
      
      // Available space for the chart
      const availableWidth = pdfWidth - (leftRightMargin * 2);
      const availableHeight = pdfHeight - topMargin - bottomMargin;
      
      // Add title centered
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(title, pdfWidth / 2, topMargin - 10, { align: 'center' });
      
      // Add subtitle if provided, centered
      if (subtitle) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.text(subtitle, pdfWidth / 2, topMargin - 2, { align: 'center' });
      }
      
      // Calculate image dimensions to fit in available space while maintaining aspect ratio
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      // Scale down if image is too large for available space
      if (imgWidth > availableWidth || imgHeight > availableHeight) {
        const scaleX = availableWidth / imgWidth;
        const scaleY = availableHeight / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        finalWidth = imgWidth * scale;
        finalHeight = imgHeight * scale;
      }
      
      // Center the image both horizontally and vertically
      const x = (pdfWidth - finalWidth) / 2;
      const y = topMargin + (availableHeight - finalHeight) / 2;
      
      console.log('Adding image to PDF at:', x, y, 'with dimensions:', finalWidth, 'x', finalHeight);
      console.log('Available space:', availableWidth, 'x', availableHeight);
      
      // Add image to PDF
      pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
      
      // Add page number at bottom right
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Page ${i + 1} of ${elements.length}`, pdfWidth - leftRightMargin, pdfHeight - 10, { align: 'right' });
      
      // Add timestamp at bottom left
      const timestamp = new Date().toLocaleString();
      pdf.text(`Exported on: ${timestamp}`, leftRightMargin, pdfHeight - 10, { align: 'left' });
    }
    
    // Save PDF
    pdf.save(`${filename}.pdf`);
  }
} 