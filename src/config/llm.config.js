import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export const llm = new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    temperature: 0.2,
    apiKey: process.env.GEMINI_API_KEY
});