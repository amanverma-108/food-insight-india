import { useState, useRef } from "react";
import { Search, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onSearch: (query: string) => void;
  onCameraIdentify?: (file: File) => void;
  suggestions?: string[];
}

export const HeroSection = ({ onSearch, onCameraIdentify, suggestions }: HeroSectionProps) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    if (query.trim()) onSearch(query.trim());
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onCameraIdentify) return;
    e.target.value = "";
    onCameraIdentify(file);
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

            {/* Hidden file input for camera */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={handleCameraClick}
              disabled={cameraLoading}
              className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-accent transition-colors disabled:opacity-50"
              aria-label="Take a photo to identify the product"
              title="Take a photo to identify the product"
            >
              {cameraLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Camera className="h-5 w-5" />
              )}
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
          {(suggestions || ["Oreo", "Maggi", "Parle-G", "Lays Chips"]).map((s) => (
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
    </section>
  );
};
