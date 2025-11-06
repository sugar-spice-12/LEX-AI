import { GoogleGenAI, Type } from "@google/genai";
import { CaseSummary } from '../types';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

export type SummaryType = 'Concise' | 'Detailed' | 'Executive' | 'Journal Digest';

const summarySchema = {
  type: Type.OBJECT,
  properties: {
    caseName: { type: Type.STRING, description: "The full name of the case, e.g., 'Kesavananda Bharati vs. State of Kerala'." },
    citation: { type: Type.STRING, description: "The complete legal citation, e.g., 'AIR 1973 SC 1461'." },
    jurisdiction: { type: Type.STRING, description: "The court or jurisdiction, e.g., 'Supreme Court of India'." },
    parties: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary parties, identified as (Petitioner) and (Respondent)." },
    factsOfCase: { type: Type.STRING, description: "A neutral summary of the essential facts and background of the case." },
    legalIssues: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The main legal questions or issues the court had to decide." },
    judgmentAndReasoning: { type: Type.STRING, description: "A comprehensive summary of the court's final decision and the detailed legal reasoning behind it." },
    conclusion: { type: Type.STRING, description: "The final, concise outcome of the case." },
    caseCategory: { type: Type.STRING, enum: ['Civil', 'Criminal', 'Constitutional', 'Corporate', 'Other'], description: "The primary category of law this case falls under." },
    judgmentRatio: { type: Type.STRING, description: "The ratio of the judgment, e.g., 'Unanimous', '7-6 Majority'." },
    legalMaxims: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Any specific legal maxims (e.g., 'audi alteram partem') used in the judgment." },
    groundsForAppeal: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Potential legal grounds or errors that could be used for an appeal." },
    biasIndicators: { type: Type.STRING, description: "An objective analysis of any potential indicators of judicial bias or tone, e.g., 'Neutral tone, reliance on established precedent'." },
    bailProbabilityAnalysis: { type: Type.STRING, description: "For criminal cases, a brief analysis of factors influencing bail probability based on the judgment. Omit if not a criminal case." },
    precedentAnalysis: { type: Type.STRING, description: "How this judgment interacts with prior precedents, e.g., 'Overrules X vs Y, distinguishes from A vs B'." },
    outcomeClassification: { type: Type.STRING, enum: ['Favorable to Petitioner', 'Favorable to Respondent', 'Mixed', 'Neutral'], description: "The classification of the outcome relative to the parties." },
    legalWeight: { type: Type.STRING, enum: ['High', 'Medium', 'Low'], description: "The authoritative weight of this judgment (e.g., Supreme Court is High)." },
    aiConfidenceScore: { type: Type.NUMBER, description: "A confidence score from 0.0 to 1.0 on the accuracy of the generated summary." },
    timelineOfEvents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, event: { type: Type.STRING } } }, description: "A chronological list of key legal events in the case." },
    causeOfAction: { type: Type.STRING, description: "The primary cause of action that initiated the legal proceedings." },
    arguments: { type: Type.OBJECT, properties: { petitioner: { type: Type.ARRAY, items: { type: Type.STRING } }, respondent: { type: Type.ARRAY, items: { type: Type.STRING } } }, description: "Bulleted lists of the main arguments for both petitioner and respondent." },
    suggestedRelevantSections: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Other legal acts or sections that are relevant but were not explicitly cited." },
    nextLegalSteps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "AI-generated recommendations for the next logical legal steps for the involved parties." },
    witnesses: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { name: { type: Type.STRING }, summary: { type: Type.STRING } } }, description: "Key witnesses and a brief summary of their testimony, if mentioned." },
    citedPrecedents: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { citation: { type: Type.STRING }, summary: { type: Type.STRING } } }, description: "A list of important precedents cited, each with a one-sentence summary." },
    ratioDecidendi: { type: Type.STRING, description: "The core legal principle or rule of law that was the basis for the court's decision." },
    obiterDicta: { type: Type.STRING, description: "Any non-essential judicial statements, opinions, or passing comments made by the court." },
    tableOfContents: { type: Type.ARRAY, items: { type: Type.STRING }, description: "An auto-generated table of contents for the key sections of this summary." },
    sentimentAnalysis: { type: Type.OBJECT, properties: { overallTone: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral'] }, score: { type: Type.NUMBER } }, description: "Analysis of the judgment's tone, with a score from -1 (negative) to 1 (positive)." },
    caseFAQs: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, answer: { type: Type.STRING } } }, description: "Automatically generated Frequently Asked Questions about the case." },
  },
  required: ["caseName", "citation", "jurisdiction", "parties", "factsOfCase", "legalIssues", "judgmentAndReasoning", "conclusion", "caseCategory", "judgmentRatio", "legalMaxims", "groundsForAppeal", "biasIndicators", "precedentAnalysis", "outcomeClassification", "legalWeight", "aiConfidenceScore", "timelineOfEvents", "causeOfAction", "arguments", "suggestedRelevantSections", "nextLegalSteps", "citedPrecedents", "ratioDecidendi", "obiterDicta", "sentimentAnalysis", "caseFAQs"]
};


export const generateSummary = async (documentText: string, summaryType: SummaryType): Promise<CaseSummary> => {
    
    const promptDetails = {
        'Concise': 'a brief, high-level summary suitable for a quick overview.',
        'Detailed': 'a comprehensive, in-depth summary covering all aspects of the case.',
        'Executive': 'a summary focused on the business implications and key outcomes for stakeholders.',
        'Journal Digest': 'a condensed digest summary suitable for publication in a law journal, focusing on the core legal reasoning and outcome.'
    }

    const systemInstruction = `You are an expert legal assistant AI. Your task is to extract key information from the provided text and structure it into a JSON format. You must return ONLY a valid JSON object that strictly adheres to the schema provided. Do not include markdown, comments, or any text outside the JSON object. Fill every field of the schema with accurate and detailed information extracted from the text.`;
    const prompt = `Based on the following legal document text, please provide a structured, ${promptDetails[summaryType]}\n\n---\n\n${documentText}`;

    let responseText = '';
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: summarySchema,
            }
        });

        responseText = response.text;
        const summaryData = JSON.parse(responseText);
        return summaryData as CaseSummary;

    } catch (error) {
        console.error("Error generating summary with Gemini:", error);
        if (responseText) {
            console.error("AI Response that caused the error:\n---\n", responseText, "\n---");
        }
        throw new Error("Failed to generate AI summary. The model may have been unable to process the document text.");
    }
};

export const generateChatResponse = async (primaryContext: string, question: string, retrievedContext?: string): Promise<string> => {
    const systemInstruction = "You are a helpful legal AI assistant. Your role is to answer questions based on the provided context. First, use the 'Primary Document Context'. If it's insufficient, use the 'Additional Retrieved Context' from other documents to provide a more comprehensive answer. If the answer cannot be found in any of the provided text, state that clearly. Be concise and direct.";
    
    let prompt = `PRIMARY DOCUMENT CONTEXT:\n---\n${primaryContext}\n---\n\n`;

    if (retrievedContext && retrievedContext.trim() !== '') {
        prompt += `ADDITIONAL RETRIEVED CONTEXT FROM OTHER CASES:\n---\n${retrievedContext}\n---\n\n`;
    }

    prompt += `Based on all the context provided, please answer the following question.\nQUESTION: ${question}`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
            }
        });
        
        return response.text.trim();
    } catch (error) {
        console.error("Error generating chat response with Gemini:", error);
        throw new Error("Failed to get a response from the AI assistant.");
    }
};