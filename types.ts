export interface Activity {
  id: string;
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
  type: 'sightseeing' | 'restaurant' | 'transport' | 'hotel' | 'activity';
  duration: string;
}

export interface DayPlan {
  day: number;
  theme: string;
  activities: Activity[];
}

export interface BudgetBreakdown {
  flights: number;
  stay: number;
  food: number;
  activities: number;
  transport: number;
  misc: number;
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  budget: number;
  travelers: number;
  days: number;
  travelStyle: string;
  transport: string;
  foodPreference: string;
  hotelPreference: string;
  startDate?: string;
  itinerary?: DayPlan[];
  budgetBreakdown?: BudgetBreakdown;
  packingList?: { item: string; category: string; checked: boolean }[];
  safetyRating?: number;
  aqi?: { index: number; label: string };
  weather?: { temp: number; text: string; icon: string };
  scamAlerts?: string[];
  hospitals?: { name: string; distance: string; phone: string }[];
  createdAt: string;
  theme?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  category: 'Stay' | 'Transport' | 'Food' | 'Activities' | 'Shopping' | 'Misc';
  date: string;
  paidBy: string;
  splitWith: string[];
}

export interface Story {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  title: string;
  content: string;
  location: string;
  likes: number;
  liked?: boolean;
  comments: { id: string; user: string; text: string }[];
  image: string;
  date: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface TravelChallenge {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  progress: number;
  target: number;
  completed: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  mobile?: string;
  avatar: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  tripsCount: number;
  countriesCount: number;
  citiesCount: number;
  carbonSavedKg: number;
  badgeIds: string[];
  isLoggedIn?: boolean;
}
