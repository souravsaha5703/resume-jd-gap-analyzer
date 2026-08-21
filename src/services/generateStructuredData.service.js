import { llm } from '../config/llm.config.js';
import { resumeSchema, jdSchema } from '../schemas/schema.js';
import { ChatPromptTemplate } from '@langchain/core/prompts';

export const generateStructuredDataFromResume = async (resumeText) => {
    const structuredLlm = llm.withStructuredOutput(resumeSchema, {
        name: 'extract-resume-data',
    });

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are an expert resume parser. Extract structured information from the resume text accurately. Do not invent information that isn't present."
        ],
        ["human", "Resume text \n \n {resume_text}"]
    ]);

    const chain = prompt.pipe(structuredLlm);

    const result = await chain.invoke({ resume_text: resumeText });
    return result;
}

export const generateStructuredDataFromJd = async (jd) => {
    const structuredLlm = llm.withStructuredOutput(jdSchema, {
        name: 'extract-jd-data',
    });

    const prompt = ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are an expert at parsing job descriptions. Distinguish clearly between must-have and nice-to-have requirements based on the language used (e.g., 'required' vs 'preferred')."
        ],
        ["human", "Resume text \n \n {jd_text}"]
    ]);

    const chain = prompt.pipe(structuredLlm);

    const result = await chain.invoke({ jd_text: jd });
    return result;
}