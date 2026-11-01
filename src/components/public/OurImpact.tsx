import React, { useState } from 'react';
import { 
  Leaf, 
  Trees, 
  Wind, 
  Sparkles, 
  ShieldCheck, 
  Award,
  ArrowRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { INITIAL_CATEGORIES } from '../../lib/seedData';

interface OurImpactProps {
  onSchedulePickup: () => void;
}

export const OurImpact: React.FC<OurImpactProps> = ({ onSchedulePickup }) => {
  const [calcCategory, setCalcCategory] = useState<string>('cat-it');
  const [calcWeight, setCalcWeight] = useState<number>(25);

  const selectedCat = INITIAL_CATEGORIES.find(c => c.id === calcCategory) || INITIAL_CATEGORIES[0];
  
  // Real-time calculations
  const co2AvoidedKg = (calcWeight * selectedCat.co2FactorPerKg).toFixed(1);
  const treesEquiv = (Number(co2AvoidedKg) / 21.7).toFixed(1); // average tree absorbs ~21.7kg CO2/year
  const pointsEarned = Math.round(calcWeight * selectedCat.pointsPerKg);
  const toxicResiduePreventedKg = (calcWeight * 0.04).toFixed(2);

  // Mock historical platform diversion trend data
  const trendData = [
    { month: 'Jun', weightKg: 320, co2SavedKg: 736 },
    { month: 'Jul', weightKg: 490, co2SavedKg: 1127 },
    { month: 'Aug', weightKg: 680, co2SavedKg: 1564 },
    { month: 'Sep', weightKg: 850, co2SavedKg: 1955 },
    { month: 'Oct', weightKg: 1041, co2SavedKg: 2395 }
  ];

  // Material recovery distribution data
  const recoveryData = [
    { name: 'Refined Copper', value: 31, color: '#15803D' },
    { name: 'Structural Aluminum', value: 24, color: '#10B981' },
    { name: 'High-Purity Polymers', value: 28, color: '#34D399' },
    { name: 'Optical Glass', value: 12, color: '#6EE7B7' },
    { name: 'Precious Metals (Au/Ag/Pd)', value: 5, color: '#F59E0B' }
  ];

  return (
    <section className="py-14 lg:py-20 bg-[#F8FAF8] border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">Environmental Quantities</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231C] mt-1">
            Measuring the tangible ecological return of every kilogram
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            Every discarded electronic device diverted from landfills prevents neurotoxic heavy metals from leaching into water tables while saving the massive carbon footprint of primary virgin mining.
          </p>
        </div>

        {/* Interactive Impact Calculator Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 lg:p-8 shadow-xs mb-14">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D] uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span>Interactive Environmental Calculator</span>
          </div>
          <h3 className="text-xl font-bold text-[#17231C]">
            Calculate your personal or enterprise diversion impact
          </h3>
          <p className="text-xs text-[#64748B] mt-1 mb-6">
            Adjust the scrap stream and estimated kilogram weight to compute greenhouse gas abatement and reward points.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Input Controls */}
            <div className="lg:col-span-6 space-y-5">
              <div>
                <label className="block text-xs font-medium text-[#17231C] mb-1.5">
                  Select E-Waste Stream
                </label>
                <select
                  value={calcCategory}
                  onChange={(e) => setCalcCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                >
                  {INITIAL_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({cat.code}) - {cat.pointsPerKg} pts/kg
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <label className="font-medium text-[#17231C]">Weight to Recycle</label>
                  <span className="font-bold text-[#15803D] tabular-nums font-mono text-sm">{calcWeight} kg</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="500"
                  step="1"
                  value={calcWeight}
                  onChange={(e) => setCalcWeight(Number(e.target.value))}
                  className="w-full accent-[#15803D] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#64748B] mt-1">
                  <span>2 kg (Few phones/tablets)</span>
                  <span>100 kg</span>
                  <span>500 kg (Bulk ITAD)</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 rounded-lg border border-emerald-100 text-xs text-emerald-900 flex items-center justify-between">
                <div>
                  <span className="font-semibold block">Ready to schedule this collection?</span>
                  <span className="text-[11px] text-emerald-800">Our partner will weigh and verify on-site.</span>
                </div>
                <button
                  onClick={onSchedulePickup}
                  className="px-3 py-1.5 bg-[#15803D] text-white rounded-md text-xs font-semibold hover:bg-[#166534] transition-colors whitespace-nowrap shrink-0"
                >
                  Schedule Pickup
                </button>
              </div>
            </div>

            {/* Calculated Results Badges */}
            <div className="lg:col-span-6 grid grid-cols-2 gap-3">
              <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                  <Wind className="w-4 h-4 text-emerald-600" />
                  <span>CO₂ Abated</span>
                </div>
                <div className="text-2xl font-extrabold text-[#17231C] tabular-nums font-mono">
                  {co2AvoidedKg} <span className="text-xs font-normal text-[#64748B] font-sans">kg</span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Avoided greenhouse emissions
                </span>
              </div>

              <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                  <Trees className="w-4 h-4 text-emerald-700" />
                  <span>Tree Equivalent</span>
                </div>
                <div className="text-2xl font-extrabold text-[#15803D] tabular-nums font-mono">
                  {treesEquiv} <span className="text-xs font-normal text-[#64748B] font-sans">tree-years</span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Equal annual carbon sequestration
                </span>
              </div>

              <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>Eco-Points Earned</span>
                </div>
                <div className="text-2xl font-extrabold text-amber-700 tabular-nums font-mono">
                  +{pointsEarned}
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Redeem for trees or gear vouchers
                </span>
              </div>

              <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
                <div className="flex items-center gap-1.5 text-xs text-[#64748B] mb-1">
                  <Leaf className="w-4 h-4 text-teal-600" />
                  <span>Toxins Neutralized</span>
                </div>
                <div className="text-2xl font-extrabold text-teal-800 tabular-nums font-mono">
                  {toxicResiduePreventedKg} <span className="text-xs font-normal text-[#64748B] font-sans">kg</span>
                </div>
                <span className="text-[11px] text-[#64748B] mt-1 block">
                  Lead & mercury safely contained
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Charts Grid: Monthly Diversion & Material Recovery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Trend Area Chart */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-bold text-[#17231C]">Platform Cumulative Diversion (kg)</h4>
                <p className="text-xs text-[#64748B]">Verified e-waste routed to certified recyclers</p>
              </div>
              <span className="text-xs font-mono font-semibold text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                +225% YoY
              </span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#15803D" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#15803D" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8E4', fontSize: '12px', borderRadius: '8px' }}
                    formatter={(value: any) => [`${value} kg`, 'Diverted Weight']}
                  />
                  <Area type="monotone" dataKey="weightKg" stroke="#15803D" strokeWidth={2} fillOpacity={1} fill="url(#colorWeight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Material Fraction Pie Chart */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-[#17231C]">Average Secondary Material Yields</h4>
              <p className="text-xs text-[#64748B]">Recovered fraction breakdown per 100 kg batch</p>
            </div>

            <div className="h-44 my-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recoveryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {recoveryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8E4', fontSize: '11px', borderRadius: '6px' }}
                    formatter={(val: any) => [`${val}%`, 'Fraction Yield']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {recoveryData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[#17231C]">{item.name}</span>
                  </div>
                  <span className="font-mono font-medium text-[#64748B] tabular-nums">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Environmental Standards Verification Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-[#17231C]">CPCB EPR Form 6 Standard</h5>
              <p className="text-[11px] text-[#64748B] mt-0.5">Complies with electronic waste management rules and authorized movement manifests.</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-[#17231C]">Zero Landfill Commitment</h5>
              <p className="text-[11px] text-[#64748B] mt-0.5">Hydrometallurgical extraction and mechanical polymer granulation with 0% open dumping.</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold text-[#17231C]">Audited Mass Balance</h5>
              <p className="text-[11px] text-[#64748B] mt-0.5">Calibrated scale cross-checks prevent weight spoofing and ensure clean audit verification.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
