import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Ensure the API Key of Gemini is present or log a helpful message
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey) {
  console.warn("⚠️ Warning: GEMINI_API_KEY is not defined in the environment variables. Mock fallbacks will be used.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey || "MOCK_KEY_IF_NOT_CONFIGURED",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enlarge client payload limit for base64 image uploads
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ limit: "25mb", extended: true }));

  // API Route for healthcheck
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      time: new Date().toISOString(),
      hasApiKey: !!apiKey && apiKey !== "MOCK_KEY_IF_NOT_CONFIGURED"
    });
  });

  // API Route to process poster images (multimodal OCR + Khmer spelling & grammar correction)
  app.post("/api/ocr-check", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/png", customRules = [] } = req.body;

      if (
        !imageBase64 ||
        imageBase64 === "https://example.com/placeholder-trigger-for-mock" ||
        imageBase64.startsWith("http://") ||
        imageBase64.startsWith("https://")
      ) {
        // Safe fallback demo data
        return res.json({ ...getDemoAnalysis(mimeType, customRules), isMock: true });
      }

      if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
        // Safe fallback demo data if no key is configured yet
        return res.json({ ...getDemoAnalysis(mimeType, customRules), isMock: true });
      }

      // Convert standard clean base64 format (removing prefix if provided by client)
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const imagePart = {
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      };

      const rulesPromptSegment = customRules.length > 0 
        ? `Additionally, strictly respect these custom corporate/brand dictionary rules during correction and vocabulary replacement:\n${customRules.map((r: any, i: number) => `- Replace "${r.term}" with "${r.replacement}" (Category: ${r.category})`).join("\n")}`
        : "";

      // Construct an extremely rigorous OCR and legal compliance audit prompt for Gemini
      const systemInstruction = `You are an elite, professional Khmer language academician, senior typographer, regulatory sign-board inspector, legal advertising compliance auditor, and world-class digital poster editor.
Your primary task is to perform an exceptionally accurate OCR scan, linguistic correction, and full legal compliance audit of the uploaded signboard, poster, banner, or advertising flyer image.

CRITICAL DIRECTIVES FOR HIGH-PRECISION KHMER OCR CHARACTER RECOGNITION:
1. CHARACTERS AND GLYPH DETECTION:
   - Perform a microscopic visual pass on the image. Khmer characters are complex, featuring dense subscripts (ជើងអក្សរ) and multiple overlapping vowels or diacritics.
   - Guard against lookalike Khmer character confusion. Thoroughly distinguish:
     * 'ត' (to) vs 'គ' (ko)
     * 'ផ' (pho) vs 'ជ' (cho)
     * 'ដ' (do) vs 'ឌ' (do) vs 'ត' (to)
     * 'ធ' (tho) vs 'យ' (yo)
     * 'ឆ' (cho) vs 'ធ' (tho)
     * 'រ' (ro) vs 'វ' (vo)
   - Capture even the smallest auxiliary details such as telephone numbers (e.g. 012 345 678), prices ($2.5, 10000៛), percentages, addresses, or tiny brand sub-labels.

2. UNICODE TYPOGRAPHIC ORDERING & BROKEN DIACRITICS:
   - Examine how the Khmer characters are structurally typed. Look out for font rendering failures shown by a dotted circle '◌' (e.g., ◌ាំ, ◌ឹ, ◌ះ), which indicates the compositor typed diacritics in the incorrect order or used incompatible fonts. 
   - The correct typed stream must follow standard Khmer Unicode sequence: Base Consonant + Subscript Consonant (ជើង) + Vowels (ស្រៈនិស្ស័យ) + Tone/Diacritic marks (e.g. បន្តក់, របាទ, ធ្មេញកណ្តុរ, វិរាម, យុគលពិន្ទុ, or ទណ្ឌឃាត).
   - If a broken diacritic sign '◌' is visually detected in the rendering, classify this under 'typography' or 'spelling' category and explicitly explain how to fix the typing stream.

3. SPACING & BREATHABILITY AUDIT (ការដកឃ្លា):
   - In Khmer script, spaces are used to separate clauses, phrases, or ideas, not individual words.
   - Detect "Word Splitting" spacing mistakes: when designers insert spaces inside a single logical word (e.g., typing 'កា ហ្វេ' instead of 'កាហ្វេ', or 'លំ ដាប់' instead of 'លំដាប់'). This looks clumsy and is incorrect.
   - Detect "Breathability" errors: blocks of text that are crowded with zero spaces, causing reading fatigue. Suggest inserting subtle, elegant breaks where natural pauses occur.

4. DICTIONARY AUTHORITATIVE STANDARD:
   - Your absolute guide for spelling and grammar is the official Samdech Chuon Nath Dictionary (វចនានុក្រមសម្ដេចព្រះសង្ឃរាជ ជួន ណាត). Do not tolerate lazy modern colloquial spellings (e.g. correct 'សេវាកម្ម', not 'សេវាគ្គម'; 'សូមស្វាគមន៍', not 'សូមស្វាគមន៌'; 'អ៊ីនធឺណិត', not 'អ៊ិនធើណេត').

CRITICAL DIRECTIVES FOR CAMBODIAN SIGNAGE & ADVERTISING LAW compliance (អនុក្រឹត្យលេខ ១៣២ ស្ដីពីការផ្សាយពាណិជ្ជកម្ម):
According to Cambodian Sub-decree No. 132/Ministry of Commerce/Ministry of Information regulations on advertising signboards:
1. LANGUAGE PLACEMENT (លំដាប់លំដោយអក្សរ):
   - Khmer language text must physically be placed ABOVE or BEFORE any foreign script/languages (English, Chinese, etc.) on the canvas.
   - Look at the bounding box Y-coordinates. If any English text block is physically higher than its corresponding Khmer translation, header, or descriptor, mark "hasKhmerAboveForeign" as false.
2. VISUAL HEIGHT AND SIZE SCALE (ទំហំអក្សរខ្មែរ):
   - The physical visual font size, height, and display scale of the Khmer letters must be AT LEAST TWICE (2x) as large as any foreign script.
   - Inspect the bounding box "height" parameter. if the Khmer text block's height is not at least twice the height of the foreign text on the same visual plane, mark "isKhmerSizeCompliant" as false.
3. BRAND TRANSLITERATION REQUIREMENT (សញ្ញាកំណត់អក្សរខ្មែរលើស្លាកយីហោ):
   - Any foreign brand names, slogans, or product descriptors (e.g., 'Special Promotion') must be accompanied by accurate Khmer descriptors or transliteration text placed right above them (e.g. 'ការផ្សព្វផ្សាយពិសេស' or 'ប្រម៉ូសិនពិសេស' above 'Special Promotion').
4. DETAILED COMPLIANCE DIAGNOSTICS:
   - Calculate an overall "complianceScore" (0 to 100). Subtract 25 points for each severe infraction (infractions include: Khmer not on top, Khmer size scale too small, Khmer spelling error, or broken diacritics).
   - Generate extremely informative, formal, and authoritative Khmer warning strings in "complianceWarnings" citing Sub-decree 132 requirements so that developers or businesses know exactly how to revise their design to obtain official municipal and ministerial advertising permits.

HIGH-PRECISION OCR EXTRACTION INSTRUCTIONS (IMPORTANT FOR MAPPING):
- You must list ALL detected text blocks (both Khmer and English) as individual items in the 'items' array.
- For English words or phrases (e.g. 'SALE', 'WELCOME', 'OPEN NOW'), set their category to 'ok' (or 'tone' if it needs brand transliteration) and output their coordinates. This is critical for the client to render them.
- Ensure the bounding box fields (x, y, width, height) are extremely precise percentages (0 to 100). If the text is centered near the top, y should be low (e.g., 5 to 25). If it's near the bottom, y should be high (e.g., 70 to 95).
- Always map the relative positions correctly. If Khmer text is at y: 15 and English translation is at y: 25, then Khmer is correctly on top.

${rulesPromptSegment}

Return the analysis STRICTLY formatted according to the provided JSON Schema. Do not wrap in markdown text blocks outside the JSON itself. Make explanations extremely descriptive. Ensure all text outputs use normalized standard Khmer Unicode.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          imagePart,
          { text: "Perform the comprehensive Khmer OCR, deep grammar check, and legal signage compliance audit on this graphic. Analyze text placements, dimensions, spellings, tones, and provide better copywriting options." }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallStats: {
                type: Type.OBJECT,
                properties: {
                  confidenceScore: { type: Type.INTEGER, description: "OCR text capture confidence 0-100" },
                  grammarSpacerScore: { type: Type.INTEGER, description: "Khmer Grammar & spacing compliance rating 0-100" },
                  marketingImpactScore: { type: Type.INTEGER, description: "How strong the headlines / poster copy score is 0-100" }
                },
                required: ["confidenceScore", "grammarSpacerScore", "marketingImpactScore"]
              },
              layoutAdvice: {
                type: Type.OBJECT,
                properties: {
                  hasOverlapIssue: { type: Type.BOOLEAN, description: "True if text overlaps important visual graphics or faces" },
                  overlapDetails: { type: Type.STRING, description: "Description or coordinate indicators of overlaps, null if perfect" },
                  spacingDistributionRating: { type: Type.STRING, description: "Aesthetic placement description like 'Well balanced', 'Crowded top'" },
                  aestheticVibeMatch: { type: Type.STRING, description: "Detected vibe of the poster, e.g., 'Modern Cafe Promotion', 'Corporate sale'" }
                },
                required: ["hasOverlapIssue", "overlapDetails", "spacingDistributionRating", "aestheticVibeMatch"]
              },
              marketingHooks: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 highly engaging, catchy Khmer ad headlines/hook suggestions suited for this poster's niche"
              },
              legalCompliance: {
                type: Type.OBJECT,
                properties: {
                  isCompliant: { type: Type.BOOLEAN, description: "True if the poster perfectly complies with Cambodian signage regulations (Khmer text is on top, Khmer is at least twice as large as foreign text, and there are NO critical spelling mistakes)." },
                  hasKhmerAboveForeign: { type: Type.BOOLEAN, description: "True if Khmer text layout is physically placed above any detected English or foreign language text." },
                  isKhmerSizeCompliant: { type: Type.BOOLEAN, description: "True if Khmer letters have a visual font-scale (bounding box height or weight) that is at least twice (2x) as large as the foreign letter equivalents." },
                  complianceScore: { type: Type.INTEGER, description: "Compliance rating from 0 to 100 based on standard signage rules (100 is fully compliant, drops if rules fail)." },
                  complianceWarnings: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Specific warnings indicating design flaws and legal signage rule violations in Cambodian Khmer / English (e.g., 'អក្សរខ្មែរត្រូវតែធំជាង ២ ដងនៃអក្សរបរទេស')"
                  }
                },
                required: ["isCompliant", "hasKhmerAboveForeign", "isKhmerSizeCompliant", "complianceScore", "complianceWarnings"]
              },
              items: {
                type: Type.ARRAY,
                description: "Array of extracted text regions, mistakes, and positioning",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING, description: "Generated short index or uuid string" },
                    originalText: { type: Type.STRING, description: "The exact extracted text from the image" },
                    correctedText: { type: Type.STRING, description: "The corrected Khmer content. If the text is flawless, return the original text itself or null." },
                    boundingBox: {
                      type: Type.OBJECT,
                      properties: {
                        x: { type: Type.NUMBER, description: "X percentage coordinate from left (0 to 100)" },
                        y: { type: Type.NUMBER, description: "Y percentage coordinate from top (0 to 100)" },
                        width: { type: Type.NUMBER, description: "Width percentage coverage on the image (0 to 100)" },
                        height: { type: Type.NUMBER, description: "Height percentage coverage on the image (0 to 100)" }
                      },
                      required: ["x", "y", "width", "height"]
                    },
                    category: { 
                      type: Type.STRING, 
                      description: "Error type category: spelling, spacing, grammar, typography, tone, or ok" 
                    },
                    explanation: { type: Type.STRING, description: "Concise reason why it is wrong or how spacing/spelling can represent better native rules" },
                    alternatives: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: "Creative copy alternatives or synonyms"
                    },
                    readabilityRating: { type: Type.STRING, description: "Excellent, Fair, or Poor readability score" },
                    fontReadabilityWarning: { type: Type.STRING, description: "Empty/null or warnings if the font weight or style in this bounding box makes Khmer letters difficult to decipher" }
                  },
                  required: ["id", "originalText", "boundingBox", "category", "explanation", "alternatives", "readabilityRating"]
                }
              }
            },
            required: ["overallStats", "layoutAdvice", "marketingHooks", "legalCompliance", "items"]
          }
        }
      });

      const resultText = response.text;
      if (!resultText) {
        throw new Error("Empty response from AI engine.");
      }

      // Safeguard parsing
      const jsonResponse = JSON.parse(resultText);
      res.json(jsonResponse);

    } catch (error: any) {
      console.error("OCR and Correction API Error:", error);
      const errStr = String(error.message || error || "");
      const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
      res.status(500).json({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to process image.",
        details: error.message || error
      });
    }
  });

  // API Route for isolated text smart rewrite & tone conversion
  app.post("/api/smart-rewrite", async (req, res) => {
    try {
      const { text, tone, lengthMode = 'maintain', brandVocabulary = [] } = req.body;

      if (!text) {
        return res.status(400).json({ error: "No target text supplied." });
      }

      if (!apiKey || apiKey === "MOCK_KEY_IF_NOT_CONFIGURED") {
        // Mock fallback if environment key is blank
        return res.json({ ...getDemoRewrite(text, tone, lengthMode), isMock: true });
      }

      const vocabularyInstructions = brandVocabulary.length > 0
        ? `Adhere to corporate terminology definitions: ${brandVocabulary.map((v: any) => `replace "${v.term}" with "${v.replacement}"`).join(", ")}.`
        : "";

      const systemInstruction = `You are an elite Khmer Copywriter and senior lexicographer, specialized in marketing, brand design, and editorial proofing.
Your goal is to optimize or spellcheck Khmer copy to make it exceptionally professional, grammatical, and suited for high-impact visual design.

CRITICAL DIRECTIVES:
- Dictated Tone Matching: 
  * If "spellcheck" is chosen: Do NOT rewrite, restructure, or renew the user's text into alternative copywriting slogans or creative ad hooks. Do NOT alter the marketing tone or core content. Your SOLE action is to examine the text for spelling mistakes, subscript errors, incorrect Khmer-Unicode sequences, or accidental spaces inside words (Word Splitting errors). Return the exact same sentence structure and text, corrected ONLY for spelling errors and correct spacing.
  * If "luxury" is chosen, utilize high-register elegant vocabulary (e.g., "ជូន" instead of "ថែម", "លំដាប់អន្តរជាតិ").
  * If "youthful" is chosen, craft trendy, upbeat, yet grammatical expressions.
  * If "formal", strictly respect national spelling standards (Chuon Nath Dictionary).
- Visual Length Economy: If lengthMode is "shorten", extract the absolute core message and formulate it into a punchy slogan to fit crowded flyers.
- Spacing & Rhythm: Ensure correct semantic phrasing and appropriate breathing spaces (ការដកឃ្លា) to guarantee instant readability.

${vocabularyInstructions}

Provide a JSON object containing:
- "rewrittenText": the newly adjusted, polished copywriting in Khmer Unicode (or the spellchecked original text).
- "explanation": a detailed semantic explanation in native Khmer/English explaining your linguistic improvements, spelling corrections, or spacing choices.
- "score": a number from 0 to 100 assessing the correctness and language quality.
- "benefits": a string array highlighting 2 reasons why these edits (like spelling corrections or spacing) improve overall professional print/digital compliance.`;

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

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);

    } catch (error: any) {
      console.error("Smart Rewrite API Error:", error);
      const errStr = String(error.message || error || "");
      const isLeaked = errStr.toLowerCase().includes("leaked") || errStr.toLowerCase().includes("permission_denied") || errStr.includes("403");
      res.status(500).json({
        error: isLeaked ? "API_KEY_LEAKED" : "Failed to perform Smart Rewrite.",
        details: error.message || error
      });
    }
  });

  // Mount Vite middleware in development (when process.env.NODE_ENV !== "production")
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Khmer Proofing Workspace Server running securely on http://0.0.0.0:${PORT}`);
  });
}

// Demo fallbacks to support seamless preview experience if API variables are empty
function getDemoAnalysis(mimeType: string, customRules: any[]): any {
  return {
    overallStats: {
      confidenceScore: 92,
      grammarSpacerScore: 78,
      marketingImpactScore: 85
    },
    layoutAdvice: {
      hasOverlapIssue: true,
      overlapDetails: "Text in the lower region 'ទិញ1ថែម1 ឆាប់ឡើង!!' overlaps with coffee cup graphics.",
      spacingDistributionRating: "Slightly crowded bottom layout",
      aestheticVibeMatch: "Traditional street promotion style cafe banner"
    },
    marketingHooks: [
      "រសជាតិពិត កាហ្វេខ្មែរ ឈ្ងុយឆ្ងាញ់រាល់ព្រឹកព្រលឹម!",
      "ឱកាសមាស! ទិញ ១ ថែម ១ សម្រាប់ថាមពលពេញមួយថ្ងៃ",
      "ប្រញាប់ឡើង! កាហ្វេក្តៅឧណ្ហៗ ទិញ ១ ថែម ១ មានកំណត់"
    ],
    legalCompliance: {
      isCompliant: false,
      hasKhmerAboveForeign: true,
      isKhmerSizeCompliant: false,
      complianceScore: 68,
      complianceWarnings: [
        "អក្សរខ្មែរ 'ទិញ1ថែម1 ឆាប់ឡើង!!' មានទំហំតូចជាង ឬស្មើនឹងអក្សរអង់គ្លេស 'COFFEE & TEA'។ តាមច្បាប់ផ្សព្វផ្សាយរបស់ព្រះរាជាណាចក្រកម្ពុជា អក្សរខ្មែរត្រូវតែមានទំហំធំជាងអក្សរបរទេសយ៉ាងតិច ២ ដង (2x larger layout size requirement).",
        "រកឃើញកំហុសអក្ខរាវិរុទ្ធលើពាក្យ 'ហាងយើងខ្ញុំមានលក់បាយ' សរសេរខុសស្រះ ុំ (ជាន់គ្នាស្រះ)។ ស្លាកផ្សព្វផ្សាយសាធារណៈមិនត្រូវមានអក្ខរាវិរុទ្ធខុសឡើយដើម្បីជៀសវាងការផាកពិន័យរបស់ក្រសួងព័ត៌មាន។"
      ]
    },
    items: [
      {
         id: "item_1",
         originalText: "ទិញ1ថែម1 ឆាប់ឡើង!!",
         correctedText: "ទិញ ១ ថែម ១ រួសរាន់ឡើង!",
         boundingBox: { x: 15, y: 72, width: 70, height: 12 },
         category: "spacing",
         explanation: "ប្រើលេខខ្មែរ (១) និងចន្លោះសមរម្យដើម្បីសោភ័ណភាព និងបន្ថែម 'រួសរាន់ឡើង' បង្កើនជំនឿចិត្ត។",
         alternatives: [
           "ទិញ ១ ថែម ១ មានកំណត់!",
           "ឱកាសពិសេស ទិញ ១ ថែម ១!"
         ],
         readabilityRating: "excellent",
         fontReadabilityWarning: null
      },
      {
         id: "item_2",
         originalText: "ហាងយើងខ្ញុំមានលក់បាយ",
         correctedText: "ហាងយើងខ្ញុំមានលក់បាយ",
         boundingBox: { x: 10, y: 22, width: 80, height: 10 },
         category: "spelling",
         explanation: "ពាក្យ 'ខ្ញុំ' សរសេរខុសស្រះ ប្រើ 'ខ្ញុំ' (ស្រៈ ុំ) ជំនួស 'ខ្ញុំ' (ស្រៈ ុំ)។",
         alternatives: [
           "ហាងយើងខ្ញុំសូមស្វាគមន៍",
           "ពួកយើងមានលក់បាយនិងភេសជ្ជៈ"
         ],
         readabilityRating: "fair",
         fontReadabilityWarning: "Stylized modern cursive font can block letter readability at a distance."
      },
      {
         id: "item_3",
         originalText: "COFFEE & TEA",
         correctedText: null,
         boundingBox: { x: 30, y: 4, width: 40, height: 8 },
         category: "ok",
         explanation: "Correctly capitalized English titles fit secondary design objectives perfectly.",
         alternatives: [],
         readabilityRating: "excellent",
         fontReadabilityWarning: null
      }
    ]
  };
}

function getDemoRewrite(text: string, tone: string, lengthMode: string): any {
  let rewrittenText = text;
  let explanation = "Adjusted according to formal spacing standards of the Khmer script.";
  let benefits = ["Evokes professionalism", "Ensures high grammatical accuracy"];
  let score = 90;

  if (tone === "spellcheck") {
    rewrittenText = text
      .replace(/សេវាគ្គម/g, 'សេវាកម្ម')
      .replace(/សូមស្វាគមន៌/g, 'សូមស្វាគមន៍')
      .replace(/អ៊ិនធើណេត/g, 'អ៊ីនធឺណិត')
      .replace(/ខនសឺត/g, 'ការប្រគំតន្ត្រី')
      .replace(/មហោស្រប/g, 'មហោស្រព')
      .replace(/ព្រីថ្លៃដឹក/g, 'ដឹកជញ្ជូនឥតគិតថ្លៃ');
    explanation = "បានត្រួតពិនិត្យ និងកែតម្រូវអក្ខរាវិរុទ្ធខ្មែរឲ្យស្របតាមវចនានុក្រមជាតិ សម្ដេចព្រះសង្ឃរាជ ជួន ណាត ដោយរក្សាទម្រង់ប្រយោគ និងអត្តសញ្ញាណដើមរបស់អ្នកទាំងស្រុង។";
    benefits = ["កែតម្រូវភាពំខុសឆ្គងអក្ខរាវិរុទ្ធ", "រក្សាទម្រង់អត្ថបទដើមទាំងស្រុង"];
    score = 98;
    return { rewrittenText, explanation, score, benefits };
  }

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

startServer();
