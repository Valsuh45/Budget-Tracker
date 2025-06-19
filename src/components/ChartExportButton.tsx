import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileImage, FileText, Loader2 } from "lucide-react";
import { ChartExporter, ChartExportOptions } from "@/lib/chartExport";
import { useToast } from "@/hooks/use-toast";

interface ChartExportButtonProps {
  chartRef: React.RefObject<HTMLElement>;
  title: string;
  subtitle?: string;
  filename?: string;
  className?: string;
}

export const ChartExportButton = ({ 
  chartRef, 
  title, 
  subtitle, 
  filename = 'chart-export',
  className = "" 
}: ChartExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: 'png' | 'pdf') => {
    if (!chartRef.current) {
      toast({
        title: "Export Failed",
        description: "Chart element not found",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const options: ChartExportOptions = {
        filename: `${filename}-${format}`,
        title,
        subtitle,
        format,
        backgroundColor: '#ffffff'
      };

      await ChartExporter.exportChart(chartRef.current, options);

      toast({
        title: "Export Successful",
        description: `Chart exported as ${format.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export chart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isExporting}
          className={className}
        >
          {isExporting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isExporting ? "Exporting..." : "Export"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('png')}>
          <FileImage className="mr-2 h-4 w-4" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="mr-2 h-4 w-4" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}; 