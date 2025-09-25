import { UnifiedSearchBar } from "@/components/UnifiedSearchBar";
import { Button } from "@/components/ui/button";

interface SearchInterfaceProps {
  onSearch: (query: string, type: 'text' | 'barcode' | 'photo', imageFile?: File) => void;
}

export const SearchInterface = ({ onSearch }: SearchInterfaceProps) => {
  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-foreground mb-4">
          True<span className="brand-highlight">Inside</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Know What You're <span className="brand-highlight">Eating</span>
        </p>
      </div>

      {/* Unified Search Bar */}
      <div className="mb-12">
        <UnifiedSearchBar onSearch={onSearch} />
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