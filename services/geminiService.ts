
import { GoogleGenAI, Type } from "@google/genai";
import { FactCheckResult, Question, Difficulty, LeaderboardEntry, LearnContent, HintResult, LiveFact } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

async function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (retries > 0 && (error.status === 429 || error.status === 503)) {
      await new Promise(r => setTimeout(r, 1000));
      return withRetry(fn, retries - 1);
    }
    throw error;
  }
}

export const generateQuizQuestions = async (difficulty: Difficulty): Promise<Question[]> => {
  return withRetry(async () => {
    const ai = getClient();
    
    const topics = [
      "Current Genna 2024/2025 celebrations in Ethiopia",
      "Traditional foods like Doro Wat and Genna fasting rules",
      "Lalibela Christmas services traditions",
      "Biblical prophecies of the Nativity",
      "The history of YeGenna Chewata game"
    ];
    const randomFocus = topics[Math.floor(Math.random() * topics.length)];

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 distinct multiple-choice questions about Ethiopian Christmas (Genna). 
      Current Focus: ${randomFocus}. 
      Difficulty: ${difficulty}. 
      
      CRITICAL: Use Google Search to ensure all historical and cultural facts are 100% accurate and up-to-date.
      Include at least 2 questions about specific Bible verses.
      
      Output JSON format.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.INTEGER },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["id", "text"]
                }
              },
              correctId: { type: Type.STRING },
              explanation: { type: Type.STRING },
              bibleVerse: { type: Type.STRING }
            },
            required: ["id", "question", "options", "correctId", "explanation"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    
    // Extract grounding sources for the questions
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title)
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return data.map((q: Question) => ({ ...q, sources }));
  });
};

export const getLiveGennaFacts = async (): Promise<LiveFact[]> => {
  return withRetry(async () => {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Find 3 interesting real-time or recent facts about Ethiopian Christmas (Genna) celebrations, traditions, or news using Google Search. Return a JSON array with 'fact' and 'source_title' and 'source_uri'.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              fact: { type: Type.STRING },
              source_title: { type: Type.STRING },
              source_uri: { type: Type.STRING }
            },
            required: ["fact", "source_title", "source_uri"]
          }
        }
      }
    });

    const data = JSON.parse(response.text || "[]");
    return data.map((item: any) => ({
      fact: item.fact,
      source: { title: item.source_title, uri: item.source_uri }
    }));
  });
};

export const generateLeaderboard = async (userScore: number, userName: string): Promise<LeaderboardEntry[]> => {
    return withRetry(async () => {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview", 
            contents: `Generate 8 realistic Ethiopian profiles for a leaderboard around score ${userScore}. Output JSON.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            score: { type: Type.INTEGER }
                        },
                        required: ["name", "score"]
                    }
                }
            }
        });

        const bots = JSON.parse(response.text || "[]");
        const allPlayers = [
            ...bots.map((b: any) => ({ ...b, avatar: `https://picsum.photos/seed/${b.name}/100`, isUser: false })),
            { name: userName || "You", score: userScore, avatar: "https://picsum.photos/seed/me/100", isUser: true }
        ];

        return allPlayers.sort((a, b) => b.score - a.score).map((p, index) => ({ ...p, rank: index + 1 }));
    });
};

export const generateLearnContent = async (): Promise<LearnContent[]> => {
    return withRetry(async () => {
        const ai = getClient();
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Generate 3 educational content cards about Genna traditions using Google Search for accuracy.`,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            details: { type: Type.STRING },
                            reference: { type: Type.STRING }
                        },
                        required: ["category", "title", "description", "details"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    });
};

export const getFactCheck = async (topic: string, question: string): Promise<Omit<FactCheckResult, 'isLoading'>> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Fact check the answer: "${topic}" for the question: "${question}". Use Google Search for verified details. Provide a concise verification summary.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({ title: web.title, uri: web.uri }));
    
    return { text: response.text || "Verification complete using real-time search.", sources };
  } catch (error) {
    return { text: "Search grounding unavailable for this check.", sources: [] };
  }
};

export const getQuickHint = async (question: string): Promise<Omit<HintResult, 'isLoading'>> => {
    try {
      const ai = getClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Provide a helpful cultural hint or context for: "${question}". DO NOT give the answer. Use Google Search to provide verified cultural details.`,
        config: { tools: [{ googleSearch: {} }] },
      });
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = chunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri)
        .map((web: any) => ({ title: web.title, uri: web.uri }));
        
      return { text: response.text || "Consulting historical archives...", sources };
    } catch (error) {
      return { text: "Hint context unavailable.", sources: [] };
    }
  };
