import React, { useState, useEffect, useRef } from 'react';
import {
  Compass, IndianRupee, Sliders, Sun, Moon, Send, MessageSquare, X, Sparkles, User, RefreshCw,
  Home, MapPin, Eye, BookOpen, AlertCircle
} from 'lucide-react';
import { Trip, Expense, UserProfile } from './models/types';
import { generateItinerary, sendChatMessage } from './services/api';

// Subcomponents
import SplashScreen from './components/SplashScreen';
import Onboarding from './components/Onboarding';
import OtpGate from './authentication/OtpGate';
import HomeScreen from './home/HomeScreen';
import ExploreScreen from './explore/ExploreScreen';
import MapsScreen from './maps/MapsScreen';
import TravelJournal from './profile/TravelJournal';
import PlannerForm from './planner/PlannerForm';
import DestinationSuggestions from './planner/DestinationSuggestions';
import TripList from './trips/TripList';
import TripDetails from './trips/TripDetails';
import ExpenseForm from './budget/ExpenseForm';
import ExpenseList from './budget/ExpenseList';
import ProfileCard from './profile/ProfileCard';
import BookingsModal from './components/BookingsModal';
import EssentialsModal from './components/EssentialsModal';

export default function App() {
  const [splashActive, setSplashActive] = useState<boolean>(true);
  const [onboardingActive, setOnboardingActive] = useState<boolean>(true);

  // Tabs: 'home' | 'explore' | 'planner' | 'saved' | 'expenses' | 'account' | 'maps' | 'journal'
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'planner' | 'saved' | 'expenses' | 'account' | 'maps' | 'journal'>('home');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Modals
  const [bookingsOpen, setBookingsOpen] = useState<boolean>(false);
  const [essentialsOpen, setEssentialsOpen] = useState<boolean>(false);

  // Authentication State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('trippilot_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return {
            ...parsed,
            isLoggedIn: parsed.isLoggedIn !== undefined ? parsed.isLoggedIn : true
          };
        }
      } catch (e) {
        console.error("Error reading user data", e);
      }
    }
    return {
      name: 'Aryan Shaw',
      email: 'shawaryan331@gmail.com',
      mobile: '9876543210',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      level: 4,
      xp: 320,
      xpToNextLevel: 500,
      tripsCount: 2,
      countriesCount: 1,
      citiesCount: 6,
      carbonSavedKg: 85,
      badgeIds: ['badge_1', 'badge_2', 'badge_4'],
      isLoggedIn: true
    };
  });

  useEffect(() => {
    localStorage.setItem('trippilot_user', JSON.stringify(user));
  }, [user]);

  // Trips lists
  const [trips, setTrips] = useState<Trip[]>(() => {
    const saved = localStorage.getItem('trippilot_trips');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTripId, setActiveTripId] = useState<string | null>(() => {
    const saved = localStorage.getItem('trippilot_trips');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.length > 0 ? parsed[0].id : null;
    }
    return null;
  });

  useEffect(() => {
    localStorage.setItem('trippilot_trips', JSON.stringify(trips));
    if (trips.length > 0 && !activeTripId) {
      setActiveTripId(trips[0].id);
    }
  }, [trips, activeTripId]);

  // Expenses ledger
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('trippilot_expenses');
    return saved ? JSON.parse(saved) : [
      { id: 'exp_1', tripId: 'default', title: 'Heritage Haveli Stay', amount: 8500, category: 'Stay', date: '2026-07-01', paidBy: 'Aryan Shaw', splitWith: ['Priya', 'Kunal'] },
      { id: 'exp_2', tripId: 'default', title: 'Rajasthani Royal Thali', amount: 1800, category: 'Food', date: '2026-07-02', paidBy: 'Priya', splitWith: ['Aryan Shaw', 'Kunal'] },
      { id: 'exp_3', tripId: 'default', title: 'Amber Fort Guide & Entry', amount: 950, category: 'Activities', date: '2026-07-02', paidBy: 'Kunal', splitWith: ['Aryan Shaw', 'Priya'] }
    ];
  });

  useEffect(() => {
    localStorage.setItem('trippilot_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Otp safety gate state
  const [loginMethod, setLoginMethod] = useState<'email' | 'mobile'>('email');
  const [emailInput, setEmailInput] = useState<string>('');
  const [mobileInput, setMobileInput] = useState<string>('');
  const [loginNameInput, setLoginNameInput] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [enteredOtp, setEnteredOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string>('');
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [otpNotification, setOtpNotification] = useState<string | null>(null);

  // Timer for OTP countdown
  useEffect(() => {
    let timer: any;
    if (otpSent && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, resendCountdown]);

  const handleOtpChange = (value: string, index: number) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...enteredOtp];
    newOtp[index] = value;
    setEnteredOtp(newOtp);
    setOtpError('');

    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && enteredOtp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const triggerSendOtp = () => {
    if (loginMethod === 'email') {
      if (!emailInput || !emailInput.includes('@')) {
        setOtpError('Please enter a valid email address.');
        return;
      }
    } else {
      if (!mobileInput || mobileInput.length < 10) {
        setOtpError('Please enter a valid 10-digit mobile number.');
        return;
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setResendCountdown(30);
    setEnteredOtp(['', '', '', '', '', '']);
    setOtpError('');

    const msg = loginMethod === 'email'
      ? `📩 Verification email sent to ${emailInput}! Your simulated 6-digit OTP is: ${code}`
      : `📱 SMS verification code sent to +91 ${mobileInput}! Your simulated 6-digit OTP is: ${code}`;

    setOtpNotification(msg);
    setTimeout(() => setOtpNotification(null), 15000);
  };

  const verifyAndLogin = () => {
    const codeInput = enteredOtp.join('');
    if (codeInput.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (codeInput !== generatedOtp) {
      setOtpError('Invalid verification code. Please try again.');
      return;
    }

    const isDefaultUser = (loginMethod === 'email' && emailInput.toLowerCase() === 'shawaryan331@gmail.com') ||
                          (loginMethod === 'mobile' && mobileInput === '9876543210');

    if (isDefaultUser) {
      setUser({
        name: 'Aryan Shaw',
        email: 'shawaryan331@gmail.com',
        mobile: '9876543210',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        level: 4,
        xp: 320,
        xpToNextLevel: 500,
        tripsCount: trips.length || 2,
        countriesCount: 1,
        citiesCount: 6,
        carbonSavedKg: 85,
        badgeIds: ['badge_1', 'badge_2', 'badge_4'],
        isLoggedIn: true
      });
    } else {
      const rawName = loginNameInput.trim() || (loginMethod === 'email' ? emailInput.split('@')[0] : 'Yatri ' + mobileInput.slice(-4));
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
      setUser({
        name: formattedName,
        email: loginMethod === 'email' ? emailInput : `${formattedName.toLowerCase()}@yatra.com`,
        mobile: loginMethod === 'mobile' ? mobileInput : '',
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(formattedName)}`,
        level: 1,
        xp: 0,
        xpToNextLevel: 100,
        tripsCount: trips.length,
        countriesCount: 1,
        citiesCount: 1,
        carbonSavedKg: 0,
        badgeIds: [],
        isLoggedIn: true
      });
    }

    setOtpSent(false);
    setOtpNotification(null);
    setEnteredOtp(['', '', '', '', '', '']);
    setActiveTab('home');
  };

  // Google/Apple/Guest mock authentication handler
  const handleSocialLogin = (platform: 'google' | 'apple' | 'guest') => {
    const defaultProfile = {
      name: platform === 'guest' ? 'Guest Explorer' : `Yatri via ${platform.toUpperCase()}`,
      email: platform === 'guest' ? 'guest@yatra.com' : `${platform}@yatra.com`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${platform}`,
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      tripsCount: trips.length,
      countriesCount: 1,
      citiesCount: 1,
      carbonSavedKg: 0,
      badgeIds: [],
      isLoggedIn: true
    };
    setUser(defaultProfile);
    setActiveTab('home');
  };

  // AI Planner input form state
  const [plannerForm, setPlannerForm] = useState({
    source: 'Delhi',
    destination: 'Jaipur',
    budget: 15000,
    travelers: 2,
    days: 3,
    travelStyle: 'Cultural Heritage',
    transport: 'Train',
    foodPreference: 'Traditional & Street Eats',
    hotelPreference: 'Boutique Haveli'
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<number>(0);
  const [plannerError, setPlannerError] = useState<string | null>(null);

  // Floating AI Chat Assistant states
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string; time: string }[]>([
    { role: 'assistant', content: 'Namaste! 🙏 I am **Hamari Yatra Assistant**. Ask me anything about routes, weather conditions, packing lists, or local safety guidelines!', time: '09:00 AM' }
  ]);
  const [isChatSending, setIsChatSending] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatOpen && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatOpen]);

  // Expenses management state
  const [newExpTitle, setNewExpTitle] = useState('');
  const [newExpAmount, setNewExpAmount] = useState('');
  const [newExpCategory, setNewExpCategory] = useState<'Stay' | 'Transport' | 'Food' | 'Activities' | 'Shopping' | 'Misc'>('Food');
  const [newExpPaidBy, setNewExpPaidBy] = useState('Aryan Shaw');
  const [newExpSplit, setNewExpSplit] = useState('Priya, Kunal');

  // Interactive suggestions handler
  const handleSelectPopularDest = (destName: string) => {
    setPlannerForm(prev => ({
      ...prev,
      destination: destName.split(',')[0]
    }));
    setActiveTab('planner');
  };

  // Smart Search string parsing logic to autofill parameters
  const handleSmartSearchQuery = (query: string) => {
    const lower = query.toLowerCase();
    let dest = 'Jaipur';
    let budgetCap = 25000;
    
    if (lower.includes('goa')) dest = 'Goa';
    if (lower.includes('ladakh') || lower.includes('leh')) dest = 'Ladakh';
    if (lower.includes('varanasi')) dest = 'Varanasi';
    if (lower.includes('kerala')) dest = 'Kerala';
    if (lower.includes('agra')) dest = 'Agra';

    // Parse budget number out of query string
    const match = lower.match(/(\d+[\d,]*)/);
    if (match) {
      budgetCap = Number(match[0].replace(/,/g, ''));
    }

    setPlannerForm(prev => ({
      ...prev,
      destination: dest,
      budget: budgetCap
    }));
    
    // Open planner tab directly
    setActiveTab('planner');
  };

  // AI Generation
  const handleGenerateItinerary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setPlannerError(null);
    setGenerationStep(0);

    const steps = [
      'Consulting regional tourism guidelines...',
      'Mapping climate forecasts & local air quality...',
      'Comparing train schedules and flight fares...',
      'Sourcing top traditional dining spots...',
      'Polishing your custom itinerary...'
    ];

    const stepInterval = setInterval(() => {
      setGenerationStep(prev => {
        if (prev < steps.length - 1) return prev + 1;
        clearInterval(stepInterval);
        return prev;
      });
    }, 1500);

    try {
      const generatedTrip = await generateItinerary(plannerForm);
      clearInterval(stepInterval);
      setTrips(prev => [generatedTrip, ...prev]);
      setActiveTripId(generatedTrip.id);
      setActiveTab('saved');

      setUser(prev => {
        const newXp = prev.xp + 150;
        if (newXp >= prev.xpToNextLevel) {
          return {
            ...prev,
            xp: newXp - prev.xpToNextLevel,
            level: prev.level + 1,
            tripsCount: prev.tripsCount + 1
          };
        }
        return { ...prev, xp: newXp, tripsCount: prev.tripsCount + 1 };
      });
    } catch (err: any) {
      console.error(err);
      setPlannerError('Could not connect to the AI planner backend. Using simulated sample.');
      
      // Fallback sample trip generation
      setTimeout(() => {
        const fallbackTrip: Trip = {
          id: 'trip_fallback_' + Math.random().toString(36).substr(2, 9),
          source: plannerForm.source,
          destination: plannerForm.destination,
          budget: plannerForm.budget,
          travelers: plannerForm.travelers,
          days: plannerForm.days,
          travelStyle: plannerForm.travelStyle,
          transport: plannerForm.transport,
          foodPreference: plannerForm.foodPreference,
          hotelPreference: plannerForm.hotelPreference,
          createdAt: new Date().toISOString(),
          theme: `Dynamic Exploration of ${plannerForm.destination}`,
          safetyRating: 9,
          aqi: { index: 48, label: 'Good' },
          weather: { temp: 26, text: 'Clear Sky', icon: 'sun' },
          scamAlerts: ['Avoid auto drivers outside main stations offering cheaper stays; book verified rooms online.'],
          hospitals: [{ name: 'Civil Multi-Speciality Hospital', distance: '1.8 km', phone: '+91 99999 88888' }],
          budgetBreakdown: {
            flights: Math.round(plannerForm.budget * 0.25),
            stay: Math.round(plannerForm.budget * 0.35),
            food: Math.round(plannerForm.budget * 0.15),
            activities: Math.round(plannerForm.budget * 0.12),
            transport: Math.round(plannerForm.budget * 0.10),
            misc: Math.round(plannerForm.budget * 0.03)
          },
          itinerary: Array.from({ length: plannerForm.days }, (_, i) => ({
            day: i + 1,
            theme: i === 0 ? 'Arrival & Sightseeing Orientation' : 'Cultural Immersion & Local Food Walk',
            activities: [
              {
                id: `fallback-act-${i}-1`,
                time: '09:00 AM',
                title: 'Check-in to Boutique Hotel',
                description: 'Relax and unwind at your hotel lounge before setting off.',
                location: 'City Center Area',
                cost: 0,
                type: 'hotel',
                duration: '1h 30m'
              },
              {
                id: `fallback-act-${i}-2`,
                time: '01:00 PM',
                title: 'Lunch at Top Rated Culinary Spot',
                description: 'Indulge in authentic traditional food corresponding to your preferences.',
                location: 'Heritage District',
                cost: 350,
                type: 'restaurant',
                duration: '1h'
              },
              {
                id: `fallback-act-${i}-3`,
                time: '04:00 PM',
                title: 'Curated Guided Historical Tour',
                description: 'Explore ancient architectures, monuments, and listen to historical guide notes.',
                location: 'Old Town Square',
                cost: 150,
                type: 'sightseeing',
                duration: '2h 30m'
              }
            ]
          })),
          packingList: [
            { item: 'Comfortable Walking Shoes', category: 'Clothing', checked: false },
            { item: 'Refillable Water Bottle', category: 'Health', checked: true },
            { item: 'Local Maps Offline Copy', category: 'Utilities', checked: false }
          ]
        };
        setTrips(prev => [fallbackTrip, ...prev]);
        setActiveTripId(fallbackTrip.id);
        setActiveTab('saved');
        setIsGenerating(false);
      }, 1500);

    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendChatMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatInput('');
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    const updatedMessages = [...chatMessages, { role: 'user' as const, content: userMsg, time: timeStr }];
    setChatMessages(updatedMessages);
    setIsChatSending(true);

    try {
      const reply = await sendChatMessage(userMsg, updatedMessages);
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply, time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) }]);
    } catch (err) {
      console.error(err);
      setTimeout(() => {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: `Here is a custom recommendation: Always carry cash when exploring heritage bazaars, keep offline maps cached, and drink bottled water to maintain robust health.`,
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setIsChatSending(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle.trim() || !newExpAmount) return;

    const newExp: Expense = {
      id: 'exp_' + Math.random().toString(36).substr(2, 9),
      tripId: activeTripId || 'default',
      title: newExpTitle,
      amount: Number(newExpAmount),
      category: newExpCategory,
      date: new Date().toISOString().split('T')[0],
      paidBy: newExpPaidBy,
      splitWith: newExpSplit.split(',').map(s => s.trim()).filter(Boolean)
    };

    setExpenses(prev => [newExp, ...prev]);
    setNewExpTitle('');
    setNewExpAmount('');

    setUser(prev => ({ ...prev, xp: Math.min(prev.xpToNextLevel - 1, prev.xp + 25) }));
  };

  const activeTrip = trips.find(t => t.id === activeTripId) || (trips.length > 0 ? trips[0] : null);

  const categoryColors: Record<string, string> = {
    Stay: 'bg-brand-blue-500',
    Transport: 'bg-brand-green-500',
    Food: 'bg-amber-500',
    Activities: 'bg-rose-500',
    Shopping: 'bg-sky-400',
    Misc: 'bg-purple-500'
  };

  const vibeOptions = [
    { label: '🕌 Cultural Heritage', val: 'Cultural Heritage' },
    { label: '🎒 Backpacker Adventure', val: 'Backpacker Adventure' },
    { label: '🌴 Relaxing Nature', val: 'Relaxing Nature' },
    { label: '🐆 Wildlife Safari', val: 'Wildlife Safari' }
  ];

  const transitOptions = [
    { label: '🚂 Rajdhani/Shatabdi Train', val: 'Train', icon: Train },
    { label: '✈️ Domestic Flight', val: 'Domestic Flight', icon: Plane },
    { label: '🚗 Cab Rental / Drive', val: 'Cab Rental', icon: Navigation }
  ];

  const foodOptions = [
    { label: '🥗 100% Vegetarian', val: 'Vegetarian Gourmet' },
    { label: '🍛 Iconic Street Food', val: 'Traditional & Street Eats' },
    { label: '🥩 Multicuisine Dining', val: 'Multicuisine Feast' }
  ];

  const hotelOptions = [
    { label: '🏰 Heritage Havelis', val: 'Boutique Haveli' },
    { label: '🏨 Co-living Hostels', val: 'Backpacker Hostel' },
    { label: '⭐ Premium Resort', val: 'Luxury Resort' }
  ];

  const handleTogglePacking = (index: number) => {
    if (!activeTrip || !activeTrip.packingList) return;
    const updatedTrips = trips.map(t => {
      if (t.id === activeTrip.id && t.packingList) {
        const updatedList = [...t.packingList];
        updatedList[index] = { ...updatedList[index], checked: !updatedList[index].checked };
        return { ...t, packingList: updatedList };
      }
      return t;
    });
    setTrips(updatedTrips);
  };

  // Render Splash Screen
  if (splashActive) {
    return <SplashScreen onComplete={() => setSplashActive(false)} darkMode={darkMode} />;
  }

  // Render Onboarding Slides
  if (onboardingActive) {
    return <Onboarding onComplete={() => setOnboardingActive(false)} darkMode={darkMode} />;
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 pb-20 lg:pb-0 ${darkMode ? 'bg-[#0B1215] text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Sticky App Bar Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-all ${darkMode ? 'bg-[#0F191D]/90 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-blue-600 to-brand-green-500 flex items-center justify-center shadow-md shadow-brand-blue-500/10">
              <Compass className="w-5 h-5 text-white animate-float" />
            </div>
            <div className="text-left">
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-brand-blue-500 to-brand-green-500 bg-clip-text text-transparent">Hamari Yatra</span>
              <span className="block text-[8px] tracking-wider uppercase font-bold text-brand-green-500 font-mono">Premium AI Co-Pilot</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Quick access sub-features modal triggers */}
            {user.isLoggedIn && (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={() => setBookingsOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold border-slate-800/80 hover:bg-slate-800/30"
                >
                  Bookings
                </button>
                <button
                  onClick={() => setEssentialsOpen(true)}
                  className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold border-slate-800/80 hover:bg-slate-800/30"
                >
                  Essentials
                </button>
              </div>
            )}

            {/* Dark Mode toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border transition-all ${darkMode ? 'border-slate-800 hover:bg-slate-800 text-amber-400' : 'border-slate-200 hover:bg-slate-100 text-brand-blue-600'}`}
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user.isLoggedIn && (
              <div onClick={() => setActiveTab('account')} className="flex items-center space-x-2 border-l pl-3 border-slate-800/60 cursor-pointer hover:opacity-85 transition-all">
                <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-xl object-cover ring-2 ring-brand-green-500/40" />
                <div className="hidden md:block text-left">
                  <p className="text-[11px] font-bold leading-tight">{user.name}</p>
                  <p className="text-[9px] text-slate-500 font-semibold">{user.email || 'Registered User'}</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Grid content frame */}
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6">
        
        {/* Navigation Sidebar (Desktop view) */}
        <aside className="hidden lg:block lg:w-60 shrink-0">
          <nav className={`p-4 rounded-3xl border flex flex-col gap-1.5 transition-colors sticky top-20 ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
            <p className="text-[9px] font-black tracking-widest uppercase text-slate-500 px-3 mb-2 font-mono">Main Operations</p>
            
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'home' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <Home className="w-4 h-4" />
              <span>Home Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'explore' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('planner')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'planner' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Trip Planner</span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'saved' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <Eye className="w-4 h-4" />
              <span>My Trips ({trips.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'expenses' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <IndianRupee className="w-4 h-4" />
              <span>Budget Ledger</span>
            </button>

            {/* Maps HUD */}
            <button
              onClick={() => setActiveTab('maps')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'maps' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <MapPin className="w-4 h-4" />
              <span>Interactive Maps</span>
            </button>

            {/* Travel Journal */}
            <button
              onClick={() => setActiveTab('journal')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'journal' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Travel Diaries</span>
            </button>

            <button
              onClick={() => setActiveTab('account')}
              className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'account' ? 'bg-brand-blue-600 text-white shadow shadow-brand-blue-500/20' : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'}`}
            >
              <User className="w-4 h-4" />
              <span>My Account</span>
            </button>
          </nav>
        </aside>

        {/* Main work container */}
        <main className="flex-1 min-w-0">

          {!user.isLoggedIn ? (
            <OtpGate
              loginMethod={loginMethod}
              setLoginMethod={setLoginMethod}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              mobileInput={mobileInput}
              setMobileInput={setMobileInput}
              loginNameInput={loginNameInput}
              setLoginNameInput={setLoginNameInput}
              otpSent={otpSent}
              setOtpSent={setOtpSent}
              enteredOtp={enteredOtp}
              otpError={otpError}
              setOtpError={setOtpError}
              resendCountdown={resendCountdown}
              otpNotification={otpNotification}
              triggerSendOtp={triggerSendOtp}
              verifyAndLogin={verifyAndLogin}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              onSocialLogin={handleSocialLogin}
              darkMode={darkMode}
            />
          ) : (
            <>
              {/* Home Screen */}
              {activeTab === 'home' && (
                <HomeScreen
                  onSearchQuery={handleSmartSearchQuery}
                  onSelectDestination={handleSelectPopularDest}
                  onOpenBookings={() => setBookingsOpen(true)}
                  onOpenEssentials={() => setEssentialsOpen(true)}
                  darkMode={darkMode}
                />
              )}

              {/* Explore categories screen */}
              {activeTab === 'explore' && (
                <ExploreScreen
                  onSelectDestination={handleSelectPopularDest}
                  darkMode={darkMode}
                />
              )}

              {/* Interactive Vector route maps screen */}
              {activeTab === 'maps' && (
                <MapsScreen
                  darkMode={darkMode}
                  destinationName={activeTrip?.destination || 'Jaipur'}
                />
              )}

              {/* Travel journal note diaries screen */}
              {activeTab === 'journal' && (
                <TravelJournal
                  trips={trips}
                  activeTripId={activeTripId}
                  darkMode={darkMode}
                />
              )}

              {/* AI Planner tab */}
              {activeTab === 'planner' && (
                <div className="space-y-6">
                  <DestinationSuggestions
                    destinations={POPULAR_DESTINATIONS}
                    onSelect={handleSelectPopularDest}
                    darkMode={darkMode}
                  />

                  <PlannerForm
                    plannerForm={plannerForm}
                    setPlannerForm={setPlannerForm}
                    isGenerating={isGenerating}
                    plannerError={plannerError}
                    handleGenerateItinerary={handleGenerateItinerary}
                    darkMode={darkMode}
                    vibeOptions={vibeOptions}
                    transitOptions={transitOptions}
                    foodOptions={foodOptions}
                    hotelOptions={hotelOptions}
                  />
                </div>
              )}

              {/* Generation overlay loader */}
              {isGenerating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <div className={`p-6 rounded-[28px] border max-w-sm w-full text-center ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
                    <div className="w-14 h-14 rounded-full bg-brand-green-50/10 flex items-center justify-center mx-auto mb-4 border border-brand-green-500/20">
                      <RefreshCw className="w-6 h-6 text-brand-green-500 animate-spin" />
                    </div>
                    <h3 className="text-base font-extrabold tracking-tight">Hamari Yatra Generating</h3>
                    <p className="text-xs text-slate-500 mt-1">Our AI planning agents are writing a custom map & ledger...</p>
                    
                    <div className="mt-6 space-y-2 text-left">
                      <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div className="bg-brand-green-500 h-full transition-all duration-500" style={{ width: `${(generationStep + 1) * 20}%` }}></div>
                      </div>
                      <span className="text-[9px] text-slate-500 block text-center font-semibold">
                        Step {generationStep + 1} of 5: {['Preparing keys...', 'Evaluating climate...', 'Mapping routes...', 'Sourcing food...', 'Formatting Itinerary...'][generationStep]}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Trips tabs */}
              {activeTab === 'saved' && (
                <div className="space-y-6">
                  {trips.length === 0 ? (
                    <div className={`p-10 rounded-[28px] border text-center ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200'}`}>
                      <Compass className="w-12 h-12 text-slate-500 mx-auto mb-3 animate-float" />
                      <h3 className="font-bold text-sm">No Yatras Planned Yet</h3>
                      <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Create a customized, budget-split travel ledger automatically using the Yatra planner engine.</p>
                      <button
                        onClick={() => setActiveTab('planner')}
                        className="mt-4 px-4 py-2 bg-brand-blue-600 text-white font-bold text-xs rounded-xl shadow"
                      >
                        Plan Yatra Now
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <TripList
                        trips={trips}
                        activeTripId={activeTripId}
                        setActiveTripId={setActiveTripId}
                        onDeleteTrip={(id) => setTrips(prev => prev.filter(t => t.id !== id))}
                        darkMode={darkMode}
                      />

                      <div className="md:col-span-2">
                        {activeTrip ? (
                          <TripDetails
                            activeTrip={activeTrip}
                            onTogglePacking={handleTogglePacking}
                            darkMode={darkMode}
                            imageUrl={POPULAR_DESTINATIONS.find(d => d.name.includes(activeTrip.destination))?.image || 'https://images.unsplash.com/photo-1506125840744-167167210587?auto=format&fit=crop&w=800&q=80'}
                          />
                        ) : (
                          <div className="py-20 text-center">
                            <p className="text-slate-500 text-xs font-semibold">Select a scheduled trip to view details.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Expenses ledger split tabs */}
              {activeTab === 'expenses' && (
                <div className="space-y-6">
                  <div className={`p-6 rounded-[28px] border transition-colors ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                    <div className="mb-6 border-b border-slate-800/60 pb-4 text-left">
                      <h2 className="text-lg font-black flex items-center space-x-1.5">
                        <IndianRupee className="w-5 h-5 text-brand-green-500" />
                        <span>Daily Expense split ledger</span>
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">Split costs with your travel group seamlessly. View settlement recommendations instantly.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ExpenseForm
                        newExpTitle={newExpTitle}
                        setNewExpTitle={setNewExpTitle}
                        newExpAmount={newExpAmount}
                        setNewExpAmount={setNewExpAmount}
                        newExpCategory={newExpCategory}
                        setNewExpCategory={setNewExpCategory}
                        newExpPaidBy={newExpPaidBy}
                        setNewExpPaidBy={setNewExpPaidBy}
                        newExpSplit={newExpSplit}
                        setNewExpSplit={setNewExpSplit}
                        handleAddExpense={handleAddExpense}
                        darkMode={darkMode}
                      />

                      <div className="md:col-span-2">
                        <ExpenseList
                          expenses={expenses}
                          onDeleteExpense={(id) => setExpenses(prev => prev.filter(e => e.id !== id))}
                          categoryColors={categoryColors}
                          darkMode={darkMode}
                          onClearAll={() => setExpenses([])}
                        />

                        <div className={`p-4 rounded-2xl border text-left mt-4 ${darkMode ? 'bg-[#0B1215] border-slate-850' : 'bg-slate-50/50 border-slate-200'}`}>
                          <h4 className="font-bold text-xs text-brand-blue-600 font-mono uppercase tracking-wider mb-2">📊 Auto-Settlement Calculations</h4>
                          <p className="text-[11px] text-slate-400">
                            Total pooled spending across vacation: <strong className="text-brand-green-500">₹{expenses.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</strong>
                          </p>
                          <div className="text-[10px] text-slate-500 space-y-1 mt-3">
                            <p>· Kunal owes Aryan Shaw: <strong className="text-brand-blue-500">₹2,800</strong></p>
                            <p>· Priya owes Aryan Shaw: <strong className="text-brand-blue-500">₹1,120</strong></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account profile stats settings tabs */}
              {activeTab === 'account' && (
                <ProfileCard
                  user={user}
                  onLogout={() => {
                    setUser(prev => ({ ...prev, isLoggedIn: false }));
                    localStorage.setItem('trippilot_user', JSON.stringify({ ...user, isLoggedIn: false }));
                  }}
                  darkMode={darkMode}
                  onSaveProfile={(e) => { e.preventDefault(); alert('Saved in local session.'); }}
                  onChangeName={(name) => setUser(prev => ({ ...prev, name }))}
                  onChangeEmail={(email) => setUser(prev => ({ ...prev, email }))}
                />
              )}
            </>
          )}

        </main>
      </div>

      {/* Floating AI co-pilot chatbot panel */}
      {user.isLoggedIn && (
        <>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="fixed bottom-4 right-4 z-50 p-4 rounded-full bg-gradient-to-tr from-brand-blue-600 to-brand-green-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            title="Co-Pilot Assistant Chat"
          >
            {chatOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5 animate-bounce" />}
          </button>

          {chatOpen && (
            <div className={`fixed bottom-20 right-4 z-40 w-[340px] sm:w-[380px] h-[460px] rounded-[28px] border overflow-hidden transition-all flex flex-col md3-shadow-3 text-left ${darkMode ? 'bg-[#0F191D] border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="p-4 border-b border-slate-800/80 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-brand-blue-600 to-brand-green-500 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xs">Yatra Chat Co-Pilot</h3>
                    <span className="text-[8px] uppercase tracking-wider font-bold text-brand-green-200">Online Helpdesk</span>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white hover:opacity-80">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat message content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth no-scrollbar">
                {chatMessages.map((msg, idx) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-2xl text-[11px] leading-relaxed ${isUser ? 'bg-brand-blue-600 text-white rounded-tr-none' : (darkMode ? 'bg-[#0B1215] text-slate-300 rounded-tl-none border border-slate-850' : 'bg-slate-100 text-slate-700 rounded-tl-none')}`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className="block text-[8px] text-right mt-1 text-slate-500 font-semibold">{msg.time}</span>
                      </div>
                    </div>
                  );
                })}
                {isChatSending && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-slate-900/60 rounded-2xl rounded-tl-none border border-slate-850 flex space-x-1 items-center">
                      <span className="w-1.5 h-1.5 bg-brand-green-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-brand-green-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-brand-green-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat action quick advice buttons */}
              <div className="p-2 border-t border-slate-800/40 bg-slate-900/10 flex gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { text: '🍜 Local restaurants', prompt: 'Recommend top traditional restaurants in Jaipur' },
                  { text: '💎 Hidden gems', prompt: 'Show verified secret spots in Ladakh' },
                  { text: '⚠️ Avoid crowds', prompt: 'Tips to skip crowds at Taj Mahal' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setChatInput(item.prompt);
                    }}
                    className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold shrink-0 ${darkMode ? 'border-slate-800 bg-[#0B1215] text-slate-400 hover:text-slate-200' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
                  >
                    {item.text}
                  </button>
                ))}
              </div>

              <div className="p-3 border-t border-slate-800/80 dark:border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Ask co-pilot advice..."
                  className={`flex-1 px-3 py-2 text-xs rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-blue-500 ${darkMode ? 'bg-[#0B1215] border border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'}`}
                />
                <button
                  onClick={handleSendChatMessage}
                  disabled={isChatSending}
                  className="p-2 rounded-xl bg-brand-blue-600 text-white hover:bg-brand-blue-700 transition-all flex items-center justify-center shrink-0"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Responsive Bottom navigation bar fixed on mobile/tablet viewports */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-35 border-t transition-all bg-[#0F191D]/90 border-slate-800 backdrop-blur-md">
        <div className="flex h-16 items-center justify-around">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center gap-1 w-12 text-center ${activeTab === 'home' ? 'text-brand-blue-500' : 'text-slate-400'}`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[8px] font-bold">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center justify-center gap-1 w-12 text-center ${activeTab === 'explore' ? 'text-brand-blue-500' : 'text-slate-400'}`}
          >
            <Compass className="w-4.5 h-4.5" />
            <span className="text-[8px] font-bold">Explore</span>
          </button>

          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center justify-center gap-1 w-12 text-center ${activeTab === 'planner' ? 'text-brand-blue-500' : 'text-slate-400'}`}
          >
            <Sparkles className="w-4.5 h-4.5" />
            <span className="text-[8px] font-bold">Planner</span>
          </button>

          <button
            onClick={() => setActiveTab('saved')}
            className={`flex flex-col items-center justify-center gap-1 w-12 text-center ${activeTab === 'saved' ? 'text-brand-blue-500' : 'text-slate-400'}`}
          >
            <Eye className="w-4.5 h-4.5" />
            <span className="text-[8px] font-bold">Journeys</span>
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex flex-col items-center justify-center gap-1 w-12 text-center ${activeTab === 'expenses' ? 'text-brand-blue-500' : 'text-slate-400'}`}
          >
            <IndianRupee className="w-4.5 h-4.5" />
            <span className="text-[8px] font-bold">Ledger</span>
          </button>
        </div>
      </div>

      {/* Bookings & Essentials sub-modals portals */}
      <BookingsModal isOpen={bookingsOpen} onClose={() => setBookingsOpen(false)} darkMode={darkMode} />
      <EssentialsModal isOpen={essentialsOpen} onClose={() => setEssentialsOpen(false)} darkMode={darkMode} />

    </div>
  );
}
