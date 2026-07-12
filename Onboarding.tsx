import React, { useState } from 'react';
import { Sparkles, IndianRupee, Compass, Heart } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  darkMode: boolean;
}

const SLIDES = [
  {
    icon: Sparkles,
    color: 'text-brand-blue-500 bg-brand-blue-500/10',
    title: 'AI Trip Planning',
    desc: 'Generate complete day-wise itineraries, local restaurants, weather forecasts, and route plans in seconds.'
  },
  {
    icon: IndianRupee,
    color: 'text-brand-green-500 bg-brand-green-500/10',
    title: 'Budget Management',
    desc: 'Track vacation spending across categories, split daily expenses with group friends, and view settlement equations.'
  },
  {
    icon: Compass,
    color: 'text-amber-500 bg-amber-500/10',
    title: 'Smart Suggestions',
    desc: 'Discover verified hidden cafes, popular beaches, historical temples, active local scam shields, and hospital helplines.'
  },
  {
    icon: Heart,
    color: 'text-rose-500 bg-rose-500/10',
    title: 'Travel Memories',
    desc: 'Log visited cities, upload photos, manage checklists, and generate simulated AI stories of your yatra.'
  }
];

export default function Onboarding({ onComplete, darkMode }: OnboardingProps) {
  const [slideIndex, setSlideIndex] = useState<number>(0);
  const CurrentSlide = SLIDES[slideIndex];
  const SlideIcon = CurrentSlide.icon;

  const handleNext = () => {
    if (slideIndex < SLIDES.length - 1) {
      setSlideIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-300 ${darkMode ? 'bg-[#0B1215]' : 'bg-slate-50'}`}>
      
      <div className={`p-6 sm:p-8 rounded-[28px] border max-w-sm w-full text-center text-left transition-colors duration-300 ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        
        <div className="flex justify-end">
          <button
            onClick={onComplete}
            className="text-xs text-slate-500 hover:text-brand-blue-500 font-bold"
          >
            Skip
          </button>
        </div>

        <div className="py-8 space-y-6">
          {/* Animated Slide Icon */}
          <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center mx-auto border border-current ${CurrentSlide.color}`}>
            <SlideIcon className="w-8 h-8 animate-float" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight">{CurrentSlide.title}</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {CurrentSlide.desc}
            </p>
          </div>
        </div>

        {/* Progress indicators dots */}
        <div className="flex justify-center space-x-1.5 mb-6">
          {SLIDES.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIndex ? 'w-5 bg-brand-blue-500' : 'w-1.5 bg-slate-700/50'}`}
            />
          ))}
        </div>

        <button
          onClick={handleNext}
          className="w-full py-3 bg-brand-blue-600 hover:bg-brand-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all"
        >
          {slideIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
        </button>

      </div>

    </div>
  );
}
