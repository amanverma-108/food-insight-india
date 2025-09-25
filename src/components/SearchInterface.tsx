import { useState } from "react";
import { Search, Camera, Upload, Scan } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface SearchInterfaceProps {
  onSearch: (query: string, type: 'text' | 'barcode' | 'photo') => void;
}

export const SearchInterface = ({ onSearch }: SearchInterfaceProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleTextSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery, 'text');
    }
  };

  const handleBarcodeSearch = () => {
    // Demo: simulate barcode scan
    onSearch("8901030803987", 'barcode'); // Sample Oreo barcode
  };

  const handlePhotoUpload = () => {
    // Demo: simulate photo upload
    onSearch("Britannia Good Day", 'photo');
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-health bg-clip-text text-transparent mb-4">
          Food Health Analyzer
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover what's really in your food and how it affects your body
        </p>
      </div>

      {/* Search Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Text Search */}
        <Card className="hover:shadow-health transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Search by Name</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Enter product name to find nutritional information
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Oreo, Maggi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTextSearch()}
                className="flex-1"
              />
              <Button onClick={handleTextSearch} size="icon" className="bg-gradient-health hover:opacity-90">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Barcode Scan */}
        <Card className="hover:shadow-health transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
              <Scan className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scan Barcode</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Use your camera to scan product barcode
            </p>
            <Button 
              onClick={handleBarcodeSearch}
              className="w-full bg-gradient-health hover:opacity-90"
            >
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          </CardContent>
        </Card>

        {/* Photo Upload */}
        <Card className="hover:shadow-health transition-all duration-300 cursor-pointer border-2 hover:border-primary">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-gradient-health rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Upload Photo</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a photo of product label for analysis
            </p>
            <Button 
              onClick={handlePhotoUpload}
              className="w-full bg-gradient-health hover:opacity-90"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choose Photo
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Search Suggestions */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-3">Popular searches:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {['Oreo', 'Maggi', 'Parle-G', 'Britannia Marie', 'Lays Chips'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="outline"
              size="sm"
              onClick={() => onSearch(suggestion, 'text')}
              className="hover:border-primary hover:text-primary"
            >
              {suggestion}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};