import { useState, useRef } from "react";
import { Search, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  suggestions?: string[];
}

export const HeroSection = ({ onSearch }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      // Simulate barcode detection after 3s
      setTimeout(() => {
        setQuery("8901030803987");
        stopCamera();
      }, 3000);
    } catch {
      setScanning(false);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/40 via-background to-background" />

      <div className="relative z-10 flex flex-col items-center px-4 pt-16 pb-10 md:pt-24 md:pb-14">
        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground text-center">
          Food<span className="text-primary">Insight</span>
        </h1>

        <p className="mt-4 max-w-xl text-center text-lg md:text-xl text-muted-foreground">
          Know What You <span className="text-primary font-semibold">Consume</span>.
          Understand Every Ingredient.
        </p>

        {/* Search bar */}
        <div
          className={`mt-10 w-full max-w-2xl rounded-full border-2 bg-card shadow-elevated transition-all duration-300 ${
            isFocused ? "border-primary shadow-health scale-[1.02]" : "border-border"
          }`}
        >
          <div className="flex items-center gap-2 px-5 py-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Enter product name..."
              className="flex-1 bg-transparent text-base md:text-lg outline-none placeholder:text-muted-foreground text-foreground"
            />
            <button
              onClick={startCamera}
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-accent transition-colors"
              aria-label="Scan barcode"
            >
              <Camera className="h-5 w-5" />
            </button>
            <Button
              onClick={handleSearch}
              className="rounded-full bg-primary text-primary-foreground px-6 hover:bg-primary/90"
            >
              Analyze
            </Button>
          </div>
        </div>

        {/* Quick tags */}
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {["Oreo", "Maggi", "Parle-G", "Lays Chips"].map((s) => (
            <button
              key={s}
              onClick={() => onSearch(s)}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Camera overlay */}
      {scanning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-foreground/80">
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-card">
            <video ref={videoRef} className="w-full aspect-[4/3] object-cover" />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-36 border-2 border-primary rounded-lg animate-pulse" />
            </div>
            <button
              onClick={stopCamera}
              className="absolute top-3 right-3 p-2 rounded-full bg-card/80 text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <p className="text-center py-3 text-sm text-muted-foreground">
              Scanning for barcode…
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
