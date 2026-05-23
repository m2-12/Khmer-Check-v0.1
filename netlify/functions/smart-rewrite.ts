import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_IF_NOT_CONFIGURED",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export const handler = async (event: any) => {
  // Support simple health check or GET
  if (event.httpMethod === "GET") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ok", message: "Khmer Smart Rewrite Netlify Serverless Function ready" })
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { text, tone, lengthMode = 'maintain', brandVocabulary = [] } = body;

    if (!text) {
      return {
        statusCode: 400,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "No target text supplied." })
      };
    }

    if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getDemoRewrite(text, tone, lengthMode))
      };
    }

    const vocabularyInstructions = brandVocabulary.length > 0
      ? `Adhere to corporate terminology definitions: ${brandVocabulary.map((v: any) => `replace "${v.term}" with "${v.replacement}"`).join(", ")}.`
      : "";

    const systemInstruction = `You are an elite Khmer Copywriter, specialized in marketing, brand design, and editorial proofing.
Your goal is to optimize Khmer copy to make it exceptionally professional, punchy, grammatical, and suited for high-impact visual design.

CRITICAL COPYWRITING DIRECTIVES:
- Dictated Tone Matching: If "luxury" is chosen, utilize high-register elegant vocabulary (e.g., "ជូន" instead of "ថែម", "លំដាប់អន្តរជាតិ"). If "youthful" is chosen, craft trendy, upbeat, yet grammatical expressions. If "formal", strictly respect national spelling standards (Chuon Nath Dictionary).
- Visual Length Economy: If lengthMode is "shorten", extract the absolute core message and formulate it into a punchy slogan to fit crowded flyers.
- Spacing & Rhythm: Ensure correct semantic phrasing and appropriate breathing spaces (ការដកឃ្លា) to guarantee instant readability.

${vocabularyInstructions}

Provide a JSON object containing:
- "rewrittenText": the newly adjusted, polished copywriting in Khmer Unicode.
- "explanation": a detailed semantic explanation in native Khmer/English explaining your linguistic improvements and spacing choices.
- "score": a number from 0 to 100 assessing the marketing force.
- "benefits": a string array highlighting 2 reasons why this rewritten slogan hits target user emotions.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Input Text: "${text}"\nTarget Tone: "${tone}"\nLength Constraint: "${lengthMode}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rewrittenText: { type: Type.STRING },
            explanation: { type: Type.STRING },
            score: { type: Type.INTEGER },
            benefits: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["rewrittenText", "explanation", "score", "benefits"]
        }
      }
    });

    const resultText = response.text || "{}";

    return {
      statusCode: 200,
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      },
      body: resultText
    };

  } catch (error: any) {
    console.error("Smart Rewrite Function Error:", error);
    const errStr = String(error.message || error || "");
    const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to perform Smart Rewrite.",
        details: error.message || error
      })
    };
  }
};

function getDemoRewrite(text: string, tone: string, lengthMode: string): any {
  let rewrittenText = text;
  let explanation = "Adjusted according to formal spacing standards of the Khmer script.";
  let benefits = ["Evokes professionalism", "Ensures high grammatical accuracy"];
  let score = 90;

  if (text.includes("ទិញ")) {
    if (tone === "luxury") {
      rewrittenText = "សិល្បៈនៃការចម្អិនកាហ្វេដ៏វិសេសវិសាល ទិញ ១ ជូន ១";
      explanation = "Elevated lexical choices ('ជូន' instead of 'ថែម' & 'ដ៏វិសេសវិសាល') appropriate for the luxury market.";
      benefits = ["Attracts upper-market connoisseurs", "Builds strong reputation for craftsmanship"];
      score = 95;
    } else if (tone === "youthful") {
      rewrittenText = "ប្រូពិសេសម៉ងហាស! ទិញ ១ ថែម ១ ហ្វ្រីៗ!";
      explanation = "Uses casual colloquial particles ('ម៉ងហាស', 'ហ្វ្រីៗ') targeting Gen Z cafe lovers.";
      benefits = ["Creates instant street-level relatability", "Enormously shareable for feed posts"];
      score = 88;
    } else if (tone === "promotional") {
      rewrittenText = "ឱកាសពិសេស! ទិញ ១ ថែម ១ ចំនួនមានកំណត់!";
      explanation = "Emphasizes limited inventory and professional urgency markers.";
      benefits = ["Enhances click-through conversion rates", "Triggers psychological FOMO instantly"];
      score = 92;
    }
  }

  if (lengthMode === "shorten") {
    rewrittenText = rewrittenText.substring(0, 16) + "...";
  }

  return { rewrittenText, explanation, score, benefits };
}
