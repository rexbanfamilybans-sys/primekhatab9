const OPENROUTER_API_KEY = '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';
const SITE_URL = window.location.origin;
const SITE_NAME = 'SahidAnime';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
}

export const chatWithAI = async (messages: ChatMessage[]) => {
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
        "model": "google/gemini-2.5-flash-lite",
        "messages": messages
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'AI Error');
    }
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    throw error;
  }
};

export const analyzePaymentScreenshot = async (base64Image: string, planDetails: string) => {
  try {
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
        "model": "google/gemini-2.5-flash-lite",
        "messages": messages
      })
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.error.message || 'AI Error');
    }
    return data.choices[0].message.content;
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    throw error;
  }
};
