import { useState, useRef } from "react";
import { Search, Camera, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface UnifiedSearchBarProps {
  onSearch: (query: string, type: 'text' | 'barcode' | 'photo', imageFile?: File) => void;
}

export const UnifiedSearchBar = ({ onSearch }: UnifiedSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTextSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, 'text');
    }
  };

  const startBarcodeScanning = async () => {
    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to demo barcode for now
      onSearch("8901030803987", 'barcode');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const captureBarcode = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        
        // For demo purposes, simulate barcode detection
        // In a real implementation, you'd use a barcode scanning library here
        onSearch("8901030803987", 'barcode');
        stopScanning();
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // For demo purposes, simulate OCR processing
      // In a real implementation, you'd use OCR service here
      onSearch("Britannia Good Day", 'photo', file);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Input
                placeholder="Search by product name, scan barcode, or upload image..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                className="pr-20 h-12 text-lg"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={startBarcodeScanning}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  title="Scan barcode"
                >
                  <Camera className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={triggerImageUpload}
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  title="Upload image"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button 
              onClick={handleTextSearch}
              className="h-12 px-6 bg-gradient-health hover:opacity-90"
            >
              <Search className="h-5 w-5 mr-2" />
              Search
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Camera Modal for Barcode Scanning */}
      {isScanning && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Scan Barcode</h3>
              <Button variant="ghost" size="sm" onClick={stopScanning}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                className="w-full rounded-lg"
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 border-2 border-primary/50 rounded-lg pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 border-2 border-primary rounded-lg"></div>
              </div>
            </div>
            <Button
              onClick={captureBarcode}
              className="w-full mt-4 bg-gradient-health hover:opacity-90"
            >
              Capture Barcode
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};