import { GoogleGenAI } from "@google/genai";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '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';
const SITE_URL = window.location.origin;
const SITE_NAME = 'SahidAnime';

const OPENROUTER_MODEL = "google/gemini-2.0-flash-lite-preview-02-05";
const GEMINI_MODEL = "gemini-3-flash-preview";

// Native Gemini Client
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export const chatWithAI = async (messages: ChatMessage[]) => {
  // Try OpenRouter First
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-OpenRouter-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": OPENROUTER_MODEL,
        "messages": messages
      })
    });

    const data = await response.json();
    
    if (data.error) {
      const errorMessage = data.error.message || 'AI Error';
      throw new Error(`OpenRouter Error: ${errorMessage}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter");
    }

    return data.choices[0].message.content;
  } catch (openRouterError: any) {
    console.warn("OpenRouter failed, falling back to native Gemini:", openRouterError.message);
    
    // Fallback to Native Gemini
    try {
      const systemInstruction = messages.find(m => m.role === 'system')?.content as string || '';
      const chatMessages = messages.filter(m => m.role !== 'system');
      
      const lastMessage = chatMessages[chatMessages.length - 1];
      const history = chatMessages.slice(0, -1).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content as string }]
      }));

      const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          ...history.map(h => ({ role: h.role, parts: h.parts })),
          { role: 'user', parts: [{ text: lastMessage.content as string }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      return response.text || "I'm sorry, I couldn't generate a response.";
    } catch (geminiError: any) {
      console.error("Both OpenRouter and Gemini failed:", geminiError);
      throw new Error(`AI Error: ${openRouterError.message}. Fallback also failed: ${geminiError.message}`);
    }
  }
};

export const analyzePaymentScreenshot = async (base64Image: string, planDetails: string) => {
  const prompt = `
    You are an automated payment verification agent for SahidAnime.
    Your task is to analyze the provided payment screenshot and determine if it is a valid, real payment for the following plan:
    ${planDetails}

    CRITICAL VERIFICATION STEPS:
    1. **Amount Match**: The amount in the screenshot MUST EXACTLY MATCH the plan price.
    2. **Recipient Match**: The recipient MUST be "Sahid Anime 4 You" or UPI ID: "btthhindidubmasala@okicici".
    3. **Transaction Status**: Must be "Success", "Completed", or "Successful".
    4. **Date Check**: The transaction date must be recent (today or yesterday).
    5. **Authenticity**: Check for signs of editing, fake fonts, or reused screenshots.

    If ALL criteria are met, respond ONLY with "APPROVED".
    If ANY criteria fail, respond with "REJECTED: [Reason in Hindi/English]".
    Example reasons: "Wrong amount", "Incorrect recipient", "Old transaction", "Fake screenshot".
    
    Be extremely strict. If you are unsure, REJECT.
  `;

  // Try OpenRouter First
  try {
    const messages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: prompt
          },
          {
            type: "image_url",
            image_url: {
              url: base64Image
            }
          }
        ]
      }
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-OpenRouter-Title": SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": OPENROUTER_MODEL,
        "messages": messages
      })
    });

    const data = await response.json();
    
    if (data.error) {
      const errorMessage = data.error.message || 'AI Error';
      throw new Error(`OpenRouter Error: ${errorMessage}`);
    }

    if (!data.choices || data.choices.length === 0) {
      throw new Error("No response from OpenRouter");
    }

    return data.choices[0].message.content;
  } catch (openRouterError: any) {
    console.warn("OpenRouter Analysis failed, falling back to native Gemini:", openRouterError.message);
    
    // Fallback to Native Gemini
    try {
      const base64Data = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

      const response = await genAI.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: "image/png"
                }
              }
            ]
          }
        ],
        config: {
          temperature: 0,
        }
      });

      return response.text || "REJECTED: Could not analyze image.";
    } catch (geminiError: any) {
      console.error("Both OpenRouter and Gemini Analysis failed:", geminiError);
      throw new Error(`AI Analysis Error: ${openRouterError.message}. Fallback also failed: ${geminiError.message}`);
    }
  }
};
