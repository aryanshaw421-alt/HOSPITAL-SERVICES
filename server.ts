import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Lazy initialize Gemini API Client
let ai: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!ai) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

// AI Itinerary Generator Endpoint
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const {
      source,
      destination,
      budget,
      travelers,
      days,
      travelStyle,
      transport,
      foodPreference,
      hotelPreference,
    } = req.body;

    const prompt = `You are a world-class travel planner. Generate a highly customized, realistic, and premium travel itinerary.
Source City: ${source}
Destination: ${destination}
Budget: INR ${budget} (Indian Rupees, ₹)
Travelers: ${travelers}
Days: ${days}
Travel Style: ${travelStyle}
Preferred Transport: ${transport}
Food Preference: ${foodPreference}
Hotel Preference: ${hotelPreference}

CRITICAL ROUTE INSTRUCTIONS FOR LADAKH / LEH:
If the destination contains "Ladakh", "Leh", "Pangong", or "Nubra":
- For Day 1, you MUST suggest realistic, professional transit from the source city (e.g. New Delhi) to Leh:
  * If preferred transport is Flight / Air / Domestic Flight: Day 1 MUST describe taking an early morning direct flight from New Delhi Indira Gandhi International Airport (DEL) to Kushok Bakula Rimpochee Airport in Leh (IXL) (typical flight cost is between ₹6,000 and ₹12,000 per person). CRITICAL FACT: Because Leh is located at 11,500 feet (3,500m), Day 1 MUST be strictly dedicated to complete rest, hydration, and acclimatization to prevent Altitude Mountain Sickness (AMS). Sights on Day 1 should be completely limited to a relaxing short evening stroll at Leh Market or resting at the hotel. No strenuous trekking, climbing, or long drives.
  * If preferred transport is Train: You MUST explicitly state on Day 1 that there is NO railway network in Ladakh. The itinerary on Day 1 should instead involve taking a comfortable express/Rajdhani train from New Delhi to Jammu Tawi Railway Station (typical cost ₹1,500 to ₹3,500), followed by an overnight layover or private SUV/bus transit heading towards Srinagar or Kargil as a scenic, safe, gradual altitude ascent.
  * If preferred transport is Cab Rental / Bike Tour: Highlight that Leh is a very long-distance, adventurous mountainous road trip (~950 km to 1,000 km) from New Delhi via high Himalayan passes. Day 1 MUST involve road transit from New Delhi to Manali (typical drive/cab cost ₹8,000 to ₹14,000) or Srinagar, as reaching Leh in a single day by car or superbike is physically impossible, hazardous, and highly dangerous.

Please respond strictly with a valid JSON object matching the following structure. Do not include any markdown tags (like \`\`\`json) or conversational text. Output ONLY the JSON.

JSON Structure:
{
  "theme": "A high-level theme or catchphrase for the trip",
  "safetyRating": 8, (a number between 1 and 10 representing safety rating)
  "aqi": { "index": 45, "label": "Good" }, (realistic AQI info for destination)
  "weather": { "temp": 12, "text": "Crisp & Sunny", "icon": "sun" }, (realistic weather forecast text, temp in celsius, icon string)
  "scamAlerts": [
    "Alert 1 for this destination...",
    "Alert 2..."
  ],
  "hospitals": [
    { "name": "Name of top hospital in destination", "distance": "2.4 km", "phone": "+91-..." }
  ],
  "budgetBreakdown": {
    "flights": 35, (percentage of budget)
    "stay": 30, (percentage)
    "food": 15, (percentage)
    "activities": 10, (percentage)
    "transport": 7, (percentage)
    "misc": 3 (percentage)
  },
  "itinerary": [
    {
      "day": 1,
      "theme": "Day theme (e.g. Arrival in Leh & Acclimatization Rest)",
      "activities": [
        {
          "id": "act-1",
          "time": "09:00 AM",
          "title": "Arrive at destination & Hotel Check-in",
          "description": "Welcome to your premium stay! Settle in and unpack.",
          "location": "Hotel lounge/lobby",
          "cost": 0,
          "type": "hotel",
          "duration": "1h 30m"
        },
        {
          "id": "act-2",
          "time": "12:30 PM",
          "title": "Lunch at a highly rated local spot",
          "description": "Indulge in authentic local culinary delights matching preferences.",
          "location": "Central District",
          "cost": 250,
          "type": "restaurant",
          "duration": "1h"
        }
      ]
    }
  ]
}

Generate realistic names, pricing in Indian Rupees (INR, ₹) (keeping in mind the overall budget of INR ${budget}), times, and highly authentic activities. Costs for individual activities must be realistic numbers in Indian Rupees (₹). Expand this to fully cover all ${days} days requested, with exactly 3-4 varied activities per day. Ensure all day objects are sequentially ordered in the "itinerary" array. Keep JSON valid.`;

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    // Parse to ensure valid JSON before returning
    const parsed = JSON.parse(responseText.trim());

    // Construct a complete Trip model matching src/types.ts
    const tripId = 'trip_' + Math.random().toString(36).substr(2, 9);
    
    // Calculate values if budget breakdown percentages are supplied
    let dynamicBreakdown: any = null;
    if (parsed.budgetBreakdown) {
      const scale = budget / 100;
      dynamicBreakdown = {
        flights: Math.round((parsed.budgetBreakdown.flights || 30) * scale),
        stay: Math.round((parsed.budgetBreakdown.stay || 35) * scale),
        food: Math.round((parsed.budgetBreakdown.food || 15) * scale),
        activities: Math.round((parsed.budgetBreakdown.activities || 10) * scale),
        transport: Math.round((parsed.budgetBreakdown.transport || 7) * scale),
        misc: Math.round((parsed.budgetBreakdown.misc || 3) * scale),
      };
    }

    const trip = {
      id: tripId,
      source,
      destination,
      budget: Number(budget),
      travelers: Number(travelers),
      days: Number(days),
      travelStyle,
      transport,
      foodPreference,
      hotelPreference,
      createdAt: new Date().toISOString(),
      ...parsed,
      budgetBreakdown: dynamicBreakdown || parsed.budgetBreakdown
    };

    res.json({ success: true, trip });
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ error: error.message || 'Failed to generate itinerary' });
  }
});

// AI Chatbot Assistant Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const client = getGeminiClient();

    const systemInstruction = `You are "Hamari Yatra Assistant", a brilliant, world-class travel planning companion.
You are warm, expert, practical, and design-minded.
Help the user plan their dream vacation, solve flight queries, suggest packing tips, emergency advice, food spots, and hidden gems.
Keep your answers highly concise, beautifully formatted with markdown list items if relevant, and extremely friendly.
Always stay in character as Hamari Yatra Assistant.`;

    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction,
      },
    });

    // Populate historical messages
    if (history && history.length > 0) {
      // Direct pass of history is supported, let's just make a single call with prompt context
    }

    const contextPrompt = history && history.length > 0
      ? `Conversation History:\n${history.map((h: any) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')}\n\nUser's new query: ${message}`
      : message;

    const result = await chat.sendMessage({ message: contextPrompt });
    res.json({ reply: result.text });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Failed to chat with AI Assistant' });
  }
});

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
} else {
  // Setup Vite dev server middleware in development
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`TripPilot Server is active at http://localhost:${PORT}`);
});
