import { useState } from "react";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Ingredient {
  name: string;
  function: string;
  healthEffect: string;
  rating: 'beneficial' | 'neutral' | 'harmful';
  affectedOrgans: string[];
}

interface BodyVisualizationProps {
  ingredients: Ingredient[];
}

interface OrganData {
  name: string;
  ingredients: Array<{
    name: string;
    effect: string;
    rating: 'beneficial' | 'neutral' | 'harmful';
  }>;
}

const getOrganColor = (organ: OrganData, organKey: string) => {
  if (organKey === 'lungs') return '#818cf8';
  if (organ.ingredients.length === 0) return '#94a3b8';
  const hasHarmful = organ.ingredients.some(i => i.rating === 'harmful');
  if (hasHarmful) return '#f87171';
  const hasNeutral = organ.ingredients.some(i => i.rating === 'neutral');
  if (hasNeutral) return '#fbbf24';
  return '#34d399';
};

export const BodyVisualization = ({ ingredients }: BodyVisualizationProps) => {
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  const organData: Record<string, OrganData> = {
    brain: { name: "Brain", ingredients: [] },
    heart: { name: "Heart", ingredients: [] },
    lungs: { name: "Lungs", ingredients: [] },
    liver: { name: "Liver", ingredients: [] },
    stomach: { name: "Stomach", ingredients: [] },
    pancreas: { name: "Pancreas", ingredients: [] },
    kidneys: { name: "Kidneys", ingredients: [] },
    intestines: { name: "Intestines", ingredients: [] },
  };

  ingredients.forEach(ingredient => {
    ingredient.affectedOrgans.forEach(organName => {
      const organKey = organName.toLowerCase();
      if (organData[organKey]) {
        organData[organKey].ingredients.push({
          name: ingredient.name,
          effect: ingredient.healthEffect,
          rating: ingredient.rating,
        });
      }
    });
  });

  const onOrganSelect = (key: string) => {
    setSelectedOrgan(selectedOrgan === key ? null : key);
  };

  const sel = (key: string) => selectedOrgan === key;
  const sw = (key: string) => sel(key) ? 2.2 : undefined;

  const c = (key: string) => getOrganColor(organData[key], key);

  return (
    <div
      className="flex flex-col lg:flex-row gap-3 rounded-[14px] p-4 min-h-[480px]"
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
    >
      {/* Left panel — body map */}
      <div
        className="flex-1 p-4 rounded-xl flex flex-col"
        style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}
      >
        {/* Panel title */}
        <div className="flex items-center gap-1.5 mb-3">
          <Info className="h-3.5 w-3.5" style={{ color: '#1d9e75' }} />
          <span
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#475569',
              letterSpacing: '0.03em',
              textTransform: 'uppercase' as const,
            }}
          >
            Body scan
          </span>
        </div>

        {/* SVG */}
        <div className="flex justify-center">
          <svg width="200" viewBox="0 0 200 300" overflow="visible">
            <defs>
              <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-sm" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.2" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              <filter id="glow-organ" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <rect width="200" height="300" fill="#ffffff" rx="8"/>

            {/* BODY FILLS */}
            <ellipse cx="100" cy="36" rx="28" ry="32" fill="#f1f5f9"/>
            <rect x="89" y="65" width="22" height="16" rx="4" fill="#f1f5f9"/>
            <path d="M55 82 Q40 92 38 118 L36 230 Q36 244 52 246 L148 246 Q164 244 164 230 L162 118 Q160 92 145 82 Q124 76 100 76 Q76 76 55 82Z" fill="#f1f5f9"/>
            <path d="M52 246 Q36 254 38 272 Q40 286 56 288 L144 288 Q160 286 162 272 Q164 254 148 246Z" fill="#f1f5f9"/>
            <path d="M40 106 Q24 118 20 158 Q18 182 24 200 Q28 210 34 214 L44 210 Q38 194 40 168 Q42 138 54 112Z" fill="#f1f5f9"/>
            <path d="M24 200 Q16 224 16 254 Q16 268 24 278 L36 276 Q28 264 30 252 Q30 228 38 210Z" fill="#f1f5f9"/>
            <path d="M16 278 Q12 285 12 296 Q12 308 18 314 Q24 318 32 316 Q40 314 42 306 L44 284 Q38 272 32 274Z" fill="#f1f5f9"/>
            <path d="M160 106 Q176 118 180 158 Q182 182 176 200 Q172 210 166 214 L156 210 Q162 194 160 168 Q158 138 146 112Z" fill="#f1f5f9"/>
            <path d="M176 200 Q184 224 184 254 Q184 268 176 278 L164 276 Q172 264 170 252 Q170 228 162 210Z" fill="#f1f5f9"/>
            <path d="M184 278 Q188 285 188 296 Q188 308 182 314 Q176 318 168 316 Q160 314 158 306 L156 284 Q162 272 168 274Z" fill="#f1f5f9"/>

            {/* GLOWING GREY OUTLINES */}
            <ellipse cx="100" cy="36" rx="28" ry="32" fill="none" stroke="#94a3b8" strokeWidth="1.4" filter="url(#glow)" opacity="0.85"/>
            <ellipse cx="100" cy="36" rx="28" ry="32" fill="none" stroke="#cbd5e1" strokeWidth="0.5" opacity="0.5"/>
            <path d="M72 30 Q67 34 67 40 Q67 46 72 48" fill="none" stroke="#94a3b8" strokeWidth="1.1" filter="url(#glow)" opacity="0.7"/>
            <path d="M128 30 Q133 34 133 40 Q133 46 128 48" fill="none" stroke="#94a3b8" strokeWidth="1.1" filter="url(#glow)" opacity="0.7"/>
            <path d="M89 65 L89 81 M111 65 L111 81" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow)" opacity="0.65"/>
            <path d="M68 88 Q84 82 100 84 Q116 82 132 88" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow)" opacity="0.55"/>
            <path d="M55 82 Q40 92 38 118 L36 230 Q36 244 52 246 L148 246 Q164 244 164 230 L162 118 Q160 92 145 82 Q124 76 100 76 Q76 76 55 82Z" fill="none" stroke="#94a3b8" strokeWidth="1.5" filter="url(#glow)" opacity="0.85"/>
            <path d="M55 82 Q40 92 38 118 L36 230 Q36 244 52 246 L148 246 Q164 244 164 230 L162 118 Q160 92 145 82 Q124 76 100 76 Q76 76 55 82Z" fill="none" stroke="#e2e8f0" strokeWidth="0.4" opacity="0.6"/>
            <path d="M62 118 Q100 112 138 118" fill="none" stroke="#cbd5e1" strokeWidth="0.7" opacity="0.5"/>
            <path d="M60 130 Q100 124 140 130" fill="none" stroke="#cbd5e1" strokeWidth="0.65" opacity="0.45"/>
            <path d="M58 142 Q100 136 142 142" fill="none" stroke="#cbd5e1" strokeWidth="0.6" opacity="0.4"/>
            <path d="M58 154 Q100 148 142 154" fill="none" stroke="#cbd5e1" strokeWidth="0.55" opacity="0.35"/>
            <line x1="100" y1="90" x2="100" y2="170" stroke="#cbd5e1" strokeWidth="0.7" opacity="0.5"/>
            <path d="M52 246 Q36 254 38 272 Q40 286 56 288 L144 288 Q160 286 162 272 Q164 254 148 246Z" fill="none" stroke="#94a3b8" strokeWidth="1.2" filter="url(#glow)" opacity="0.8"/>
            <path d="M40 106 Q24 118 20 158 Q18 182 24 200 Q28 210 34 214 L44 210" fill="none" stroke="#94a3b8" strokeWidth="1.2" filter="url(#glow)" opacity="0.8"/>
            <path d="M24 200 Q16 224 16 254 Q16 268 24 278 L36 276" fill="none" stroke="#94a3b8" strokeWidth="1.1" filter="url(#glow)" opacity="0.75"/>
            <path d="M16 278 Q12 285 12 296 Q12 308 18 314 Q24 318 32 316 Q40 314 42 306 L44 284" fill="none" stroke="#94a3b8" strokeWidth="1" filter="url(#glow)" opacity="0.75"/>
            <path d="M18 314 Q16 324 16 334 Q16 340 20 342 Q24 342 26 336 Q28 328 28 316" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M26 316 Q25 328 25 340 Q25 347 29 348 Q33 348 35 342 Q37 334 36 318" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M35 317 Q35 329 35 340 Q35 346 39 347 Q43 347 44 340 Q45 331 44 318" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M43 312 Q45 322 45 330 Q45 336 48 337 Q51 337 52 330 Q53 322 51 312" fill="none" stroke="#94a3b8" strokeWidth="0.85" filter="url(#glow-sm)" opacity="0.65"/>
            <path d="M12 294 Q6 290 4 298 Q2 308 8 314 Q12 316 16 308" fill="none" stroke="#94a3b8" strokeWidth="0.85" filter="url(#glow-sm)" opacity="0.65"/>
            <path d="M160 106 Q176 118 180 158 Q182 182 176 200 Q172 210 166 214 L156 210" fill="none" stroke="#94a3b8" strokeWidth="1.2" filter="url(#glow)" opacity="0.8"/>
            <path d="M176 200 Q184 224 184 254 Q184 268 176 278 L164 276" fill="none" stroke="#94a3b8" strokeWidth="1.1" filter="url(#glow)" opacity="0.75"/>
            <path d="M184 278 Q188 285 188 296 Q188 308 182 314 Q176 318 168 316 Q160 314 158 306 L156 284" fill="none" stroke="#94a3b8" strokeWidth="1" filter="url(#glow)" opacity="0.75"/>
            <path d="M182 314 Q184 324 184 334 Q184 340 180 342 Q176 342 174 336 Q172 328 172 316" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M174 316 Q175 328 175 340 Q175 347 171 348 Q167 348 165 342 Q163 334 164 318" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M165 317 Q165 329 165 340 Q165 346 161 347 Q157 347 156 340 Q155 331 156 318" fill="none" stroke="#94a3b8" strokeWidth="0.9" filter="url(#glow-sm)" opacity="0.7"/>
            <path d="M157 312 Q155 322 155 330 Q155 336 152 337 Q149 337 148 330 Q147 322 149 312" fill="none" stroke="#94a3b8" strokeWidth="0.85" filter="url(#glow-sm)" opacity="0.65"/>
            <path d="M188 294 Q194 290 196 298 Q198 308 192 314 Q188 316 184 308" fill="none" stroke="#94a3b8" strokeWidth="0.85" filter="url(#glow-sm)" opacity="0.65"/>

            {/* ORGANS */}

            {/* BRAIN */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('brain')}>
              <ellipse fill={c('brain')} fillOpacity="0.15" stroke={c('brain')} strokeWidth={sw('brain') || 1.3} filter="url(#glow-organ)" cx="100" cy="30" rx="18" ry="15"/>
              <path d="M89 25 Q95 19 100 23 Q105 19 111 25" fill="none" stroke={c('brain')} strokeWidth="0.8" opacity="0.6"/>
              <path d="M86 31 Q92 26 97 29 Q100 31 103 29 Q108 26 114 31" fill="none" stroke={c('brain')} strokeWidth="0.8" opacity="0.55"/>
              <path d="M88 37 Q95 33 100 36 Q105 33 112 37" fill="none" stroke={c('brain')} strokeWidth="0.7" opacity="0.45"/>
              <text x="100" y="52" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Brain</text>
            </g>

            {/* HEART */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('heart')}>
              <path fill={c('heart')} fillOpacity="0.18" stroke={c('heart')} strokeWidth={sw('heart') || 1.3} filter="url(#glow-organ)"
                d="M92 112 C87 105 78 105 78 114 C78 121 84 128 92 135 C100 128 106 121 106 114 C106 105 97 105 92 112Z"/>
              <text x="76" y="143" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Heart</text>
            </g>

            {/* LUNGS */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('lungs')}>
              <path fill={c('lungs')} fillOpacity="0.18" stroke={c('lungs')} strokeWidth={sw('lungs') || 1.2} filter="url(#glow-organ)"
                d="M62 96 Q50 104 48 122 Q46 142 52 158 Q58 170 70 168 Q80 166 80 150 L80 106 Q72 90 62 96Z"/>
              <path d="M54 124 Q62 120 70 124" fill="none" stroke={c('lungs')} strokeWidth="0.7" opacity="0.55"/>
              <path d="M52 136 Q62 132 72 136" fill="none" stroke={c('lungs')} strokeWidth="0.65" opacity="0.48"/>
              <path d="M52 148 Q62 144 72 148" fill="none" stroke={c('lungs')} strokeWidth="0.6" opacity="0.4"/>
              <path fill={c('lungs')} fillOpacity="0.18" stroke={c('lungs')} strokeWidth={sw('lungs') || 1.2} filter="url(#glow-organ)"
                d="M138 96 Q150 104 152 122 Q154 142 148 158 Q142 170 130 168 Q120 166 120 150 L120 106 Q128 90 138 96Z"/>
              <path d="M146 124 Q138 120 130 124" fill="none" stroke={c('lungs')} strokeWidth="0.7" opacity="0.55"/>
              <path d="M148 136 Q138 132 128 136" fill="none" stroke={c('lungs')} strokeWidth="0.65" opacity="0.48"/>
              <path d="M148 148 Q138 144 128 148" fill="none" stroke={c('lungs')} strokeWidth="0.6" opacity="0.4"/>
              <text x="54" y="176" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Lungs</text>
            </g>

            {/* LIVER */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('liver')}>
              <path fill={c('liver')} fillOpacity="0.16" stroke={c('liver')} strokeWidth={sw('liver') || 1.3} filter="url(#glow-organ)"
                d="M110 138 Q130 132 140 144 Q146 156 138 167 Q128 174 112 172 Q98 170 96 158 Q94 146 110 138Z"/>
              <text x="147" y="170" textAnchor="start" fontSize="8.5" fill="#94a3b8">Liver</text>
            </g>

            {/* STOMACH */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('stomach')}>
              <path fill={c('stomach')} fillOpacity="0.16" stroke={c('stomach')} strokeWidth={sw('stomach') || 1.3} filter="url(#glow-organ)"
                d="M78 158 C70 152 64 160 66 172 C68 184 78 192 88 188 C98 184 102 172 96 162 C90 153 84 164 78 158Z"/>
              <text x="60" y="196" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Stomach</text>
            </g>

            {/* PANCREAS */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('pancreas')}>
              <ellipse fill={c('pancreas')} fillOpacity="0.16" stroke={c('pancreas')} strokeWidth={sw('pancreas') || 1.2} filter="url(#glow-organ)"
                cx="108" cy="182" rx="21" ry="6.5" transform="rotate(-7 108 182)"/>
              <text x="108" y="197" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Pancreas</text>
            </g>

            {/* KIDNEYS */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('kidneys')}>
              <path fill={c('kidneys')} fillOpacity="0.16" stroke={c('kidneys')} strokeWidth={sw('kidneys') || 1.2} filter="url(#glow-organ)"
                d="M76 192 C68 186 62 192 63 202 C64 214 72 220 80 218 C88 216 90 208 88 200 C86 192 82 198 76 192Z"/>
              <path fill={c('kidneys')} fillOpacity="0.16" stroke={c('kidneys')} strokeWidth={sw('kidneys') || 1.2} filter="url(#glow-organ)"
                d="M134 192 C142 186 148 192 147 202 C146 214 138 220 130 218 C122 216 120 208 122 200 C124 192 128 198 134 192Z"/>
              <text x="60" y="224" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Kidneys</text>
            </g>

            {/* INTESTINES */}
            <g style={{ cursor: 'pointer' }} onClick={() => onOrganSelect('intestines')}>
              <rect fill={c('intestines')} fillOpacity="0.15" stroke={c('intestines')} strokeWidth={sw('intestines') || 1.2} filter="url(#glow-organ)"
                x="64" y="206" width="84" height="26" rx="11"/>
              <path d="M72 213 Q80 209 88 213 Q96 217 104 213 Q112 209 120 213 Q128 217 136 213 Q141 209 144 212" fill="none" stroke={c('intestines')} strokeWidth="0.8" opacity="0.6"/>
              <path d="M72 221 Q80 217 88 221 Q96 225 104 221 Q112 217 120 221 Q128 225 136 221 Q141 217 144 220" fill="none" stroke={c('intestines')} strokeWidth="0.8" opacity="0.6"/>
              <text x="106" y="243" textAnchor="middle" fontSize="8.5" fill="#94a3b8">Intestines</text>
            </g>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center items-center gap-3.5 mt-2.5" style={{ fontSize: '10px', color: '#94a3b8' }}>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#34d399' }} />
            <span>Beneficial</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#fbbf24' }} />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: '#f87171' }} />
            <span>Harmful</span>
          </div>
        </div>
      </div>

      {/* Right panel — info (unchanged logic) */}
      <div className="flex-1 p-4 rounded-xl" style={{ background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <h3 className="text-lg font-semibold mb-4">
          {selectedOrgan ? organData[selectedOrgan]?.name : 'Select an Organ'}
        </h3>
        {selectedOrgan && organData[selectedOrgan] ? (
          <div className="space-y-4">
            {organData[selectedOrgan].ingredients.length > 0 ? (
              organData[selectedOrgan].ingredients.map((ingredient, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{ingredient.name}</h4>
                    <Badge
                      className={
                        ingredient.rating === 'beneficial' ? 'bg-[hsl(145,80%,42%)] text-white' :
                        ingredient.rating === 'harmful' ? 'bg-[hsl(0,84%,60%)] text-white' :
                        'bg-[hsl(45,95%,60%)] text-foreground'
                      }
                    >
                      {ingredient.rating}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{ingredient.effect}</p>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No ingredients affect this organ.</p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground">
            Click on an organ in the body diagram to see how ingredients affect it.
          </p>
        )}
      </div>
    </div>
  );
};
