import React, { useState } from 'react';
import { 
  Search, 
  Laptop, 
  Smartphone, 
  Tv, 
  BatteryCharging, 
  Zap, 
  Refrigerator, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../lib/seedData';
import { EWasteCategory } from '../../types';

interface AcceptedEWasteProps {
  onSelectCategoryForPickup: (categoryId: string) => void;
}

export const AcceptedEWaste: React.FC<AcceptedEWasteProps> = ({ onSelectCategoryForPickup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStream, setSelectedStream] = useState<string>('all');

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Laptop,
    Smartphone,
    Tv,
    BatteryCharging,
    Zap,
    Refrigerator
  };

  const filteredCategories = INITIAL_CATEGORIES.filter((cat) => {
    const matchesSearch = 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.recoverableMaterials.some(m => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
      cat.hazardousComponents.some(h => h.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStream = selectedStream === 'all' || cat.id === selectedStream;

    return matchesSearch && matchesStream;
  });

  return (
    <section className="py-14 lg:py-20 bg-white border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">Catalog & Classification</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231C] mt-1">
              Accepted electronic waste streams
            </h2>
            <p className="mt-2 text-sm text-[#64748B] max-w-2xl">
              EcoTrack processes consumer, commercial, and enterprise electrical scrap under strict zero-landfill protocols. Check what we accept, hazardous components contained, and material yields.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search items, metals, codes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D] focus:border-[#15803D]"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-8 no-scrollbar text-xs">
          <button
            onClick={() => setSelectedStream('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
              selectedStream === 'all'
                ? 'bg-[#15803D] text-white shadow-xs'
                : 'bg-[#F8FAF8] text-[#64748B] hover:text-[#17231C] border border-[#E2E8E4]'
            }`}
          >
            All Streams ({INITIAL_CATEGORIES.length})
          </button>
          {INITIAL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedStream(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 ${
                selectedStream === cat.id
                  ? 'bg-[#15803D] text-white shadow-xs'
                  : 'bg-[#F8FAF8] text-[#64748B] hover:text-[#17231C] border border-[#E2E8E4]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category: EWasteCategory) => {
            const Icon = iconMap[category.iconName] || Laptop;
            return (
              <div 
                key={category.id}
                className="bg-white rounded-xl border border-[#E2E8E4] p-5 hover:border-[#15803D] hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#64748B] bg-[#F8FAF8] px-2 py-0.5 rounded border border-[#E2E8E4]">
                      {category.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#17231C]">
                    {category.name}
                  </h3>
                  <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
                    {category.description}
                  </p>

                  {/* Recoverable Materials */}
                  <div className="mt-4 pt-3 border-t border-[#E2E8E4]">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-[#15803D] uppercase tracking-wider mb-1.5">
                      <Sparkles className="w-3 h-3 text-[#10B981]" />
                      <span>Recoverable Resources</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-[#17231C]">
                      {category.recoverableMaterials.map((mat, i) => (
                        <span key={i} className="bg-slate-50 text-[#17231C] px-2 py-0.5 rounded text-[11px] border border-[#E2E8E4]">
                          {mat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hazardous Elements */}
                  <div className="mt-3">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 uppercase tracking-wider mb-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Hazardous Compounds (Safely Neutralized)</span>
                    </div>
                    <div className="flex flex-wrap gap-1 text-xs text-[#64748B]">
                      {category.hazardousComponents.map((haz, i) => (
                        <span key={i} className="text-[11px] text-[#64748B]">
                          • {haz}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer specs & CTA */}
                <div className="mt-5 pt-4 border-t border-[#E2E8E4] flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-[#64748B] block text-[10px] uppercase">Reward Value</span>
                    <span className="font-bold text-[#15803D] tabular-nums font-mono">
                      +{category.pointsPerKg} pts/kg
                    </span>
                  </div>
                  <button
                    onClick={() => onSelectCategoryForPickup(category.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors"
                  >
                    <span>Request Pickup</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Not-Accepted Notice */}
        <div className="mt-10 p-4 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Items not accepted in residential standard pickups:</span> Leaking radioactive industrial detectors, un-vented biomedical monitors containing biohazardous bodily fluids, and commercial explosive-actuated relays. These require specialized Class 9 Hazmat transport.
          </div>
        </div>

      </div>
    </section>
  );
};
