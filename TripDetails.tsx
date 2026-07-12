import React from 'react';
import { Calendar, MapPin, IndianRupee, BadgeAlert, Activity } from 'lucide-react';
import { Trip } from '../models/types';
import PackingChecklist from './PackingChecklist';

interface TripDetailsProps {
  activeTrip: Trip;
  onTogglePacking: (index: number) => void;
  darkMode: boolean;
  imageUrl: string;
}

export default function TripDetails({
  activeTrip,
  onTogglePacking,
  darkMode,
  imageUrl
}: TripDetailsProps) {
  return (
    <div className="space-y-6">
      
      {/* Cover Card */}
      <div className="relative rounded-[28px] overflow-hidden h-40 flex items-end p-5 shadow-sm">
        <img src={imageUrl} alt="destination" className="absolute inset-0 w-full h-full object-cover brightness-[0.55]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent"></div>
        <div className="relative z-10 text-left">
          <h2 className="text-xl font-black text-white">{activeTrip.source} to {activeTrip.destination}</h2>
          <p className="text-xs font-bold text-brand-green-400 mt-0.5">✨ {activeTrip.theme || 'Curated Yatra Escape'}</p>
        </div>
      </div>

      {/* HUD parameters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px] text-left">
        <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Budget Cap</p>
          <p className="font-extrabold text-brand-green-600 dark:text-brand-green-400 mt-0.5">₹{activeTrip.budget.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Transit Vibe</p>
          <p className="font-extrabold text-brand-blue-600 dark:text-brand-blue-400 mt-0.5">{activeTrip.transport}</p>
        </div>
        <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Safety Score</p>
          <p className="font-extrabold text-brand-blue-600 dark:text-brand-blue-400 mt-0.5">{activeTrip.safetyRating || 8}/10</p>
        </div>
        <div className={`p-3 rounded-2xl border ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-[9px] text-slate-500 font-bold uppercase">Weather</p>
          <p className="font-extrabold text-amber-500 mt-0.5">{activeTrip.weather?.temp || 26}°C · {activeTrip.weather?.text || 'Sunny'}</p>
        </div>
      </div>

      {/* Itinerary Schedule */}
      <div className={`p-5 rounded-[28px] border space-y-4 text-left ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
        <h3 className="text-xs font-black uppercase text-brand-blue-600 tracking-wider font-mono flex items-center space-x-1.5">
          <Calendar className="w-4 h-4 text-brand-blue-600" />
          <span>Day-Wise Chronological Itinerary</span>
        </h3>

        <div className="space-y-6 border-l border-slate-800/80 dark:border-slate-800 pl-4 ml-2.5">
          {activeTrip.itinerary?.map((dayPlan, di) => (
            <div key={di} className="relative space-y-3">
              <div className="absolute -left-[22px] top-1.5 w-3 h-3 rounded-full bg-brand-green-500 border border-slate-900 shadow"></div>
              
              <h4 className="font-bold text-xs text-slate-300 dark:text-slate-200">Day {dayPlan.day}: {dayPlan.theme}</h4>
              
              <div className="space-y-2">
                {dayPlan.activities.map((act, ai) => (
                  <div key={ai} className={`p-3 rounded-xl border flex items-start space-x-3 text-xs ${darkMode ? 'bg-[#0B1215] border-slate-850' : 'bg-slate-50/70 border-slate-200'}`}>
                    <span className="px-2 py-0.5 rounded bg-brand-blue-600/10 text-brand-blue-600 font-bold font-mono text-[9px] shrink-0 mt-0.5">
                      {act.time}
                    </span>
                    <div className="space-y-1 text-left">
                      <p className="font-bold text-slate-200 leading-tight">{act.title}</p>
                      <p className="text-slate-500 text-[10px] leading-relaxed">{act.description}</p>
                      <div className="flex items-center space-x-2 text-[9px] text-slate-500 pt-0.5">
                        <span className="flex items-center space-x-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{act.location}</span>
                        </span>
                        <span>·</span>
                        <span className="font-bold text-brand-green-500">₹{act.cost}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Breakdown */}
      {activeTrip.budgetBreakdown && (
        <div className={`p-5 rounded-[28px] border space-y-4 text-left ${darkMode ? 'bg-[#0F191D] border-slate-850' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-xs font-black uppercase text-brand-blue-600 tracking-wider font-mono flex items-center space-x-1.5">
            <IndianRupee className="w-4 h-4 text-brand-blue-600" />
            <span>Optimized Budget Breakdown (₹)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              {[
                { label: 'Hotel Stays', val: activeTrip.budgetBreakdown.stay, color: 'bg-brand-blue-500' },
                { label: 'Transit & Cab', val: activeTrip.budgetBreakdown.transport, color: 'bg-brand-green-500' },
                { label: 'Food & Culinary', val: activeTrip.budgetBreakdown.food, color: 'bg-amber-500' },
                { label: 'Leisure Excursions', val: activeTrip.budgetBreakdown.activities, color: 'bg-rose-500' }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500 font-semibold">{item.label}</span>
                    <span className="font-bold">₹{item.val.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${(item.val / activeTrip.budget) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-[10px] leading-relaxed flex flex-col justify-between">
              <p className="text-slate-400">
                <strong className="text-brand-green-500 font-bold block mb-1">💡 Co-Pilot Optimization Tip:</strong>
                To save up to 20% on hotel bookings, look for local homestays or heritage properties directly on regional state platforms.
              </p>
              <button
                type="button"
                onClick={() => alert("Redirecting to local partner booking platforms with pre-applied coupon code 'YATRA20'...")}
                className="w-full mt-3 py-2 bg-brand-green-600 text-white font-bold rounded-lg text-[10px] text-center shadow shadow-brand-green-500/10 transition-all hover:bg-brand-green-700"
              >
                Browse Curated Rooms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Packing Checklist */}
      <PackingChecklist activeTrip={activeTrip} onTogglePacking={onTogglePacking} darkMode={darkMode} />

      {/* Warnings & Emergencies */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="p-4 rounded-[22px] bg-rose-500/5 border border-rose-500/10 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-rose-500">
            <BadgeAlert className="w-4 h-4 shrink-0" />
            <span className="font-extrabold uppercase text-[10px] tracking-wide font-mono">Active Scam Shield Warnings</span>
          </div>
          <ul className="list-disc pl-4 space-y-1 text-slate-400 text-[10px] leading-relaxed">
            {activeTrip.scamAlerts?.map((alertStr, idx) => (
              <li key={idx}>{alertStr}</li>
            )) || <li>Respect local guidelines and book official guides inside archaeological sites.</li>}
          </ul>
        </div>

        <div className="p-4 rounded-[22px] bg-brand-blue-500/5 border border-brand-blue-500/10 text-xs space-y-2">
          <div className="flex items-center space-x-1.5 text-brand-blue-600 dark:text-brand-blue-400">
            <Activity className="w-4 h-4 shrink-0" />
            <span className="font-extrabold uppercase text-[10px] tracking-wide font-mono">Emergency Medical Assistance</span>
          </div>
          {activeTrip.hospitals?.map((hosp, idx) => (
            <div key={idx} className="space-y-0.5 text-[10px]">
              <p className="font-bold text-slate-300">{hosp.name}</p>
              <p className="text-slate-500">Distance: {hosp.distance} · Call: <span className="text-brand-blue-500 font-bold">{hosp.phone}</span></p>
            </div>
          )) || <p className="text-slate-500 text-[10px]">No medical lists linked to region.</p>}
        </div>
      </div>

    </div>
  );
}
