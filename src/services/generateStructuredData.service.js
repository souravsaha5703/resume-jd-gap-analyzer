import { llm } from '../config/llm.config.js';
import { resumeSchema } from '../schemas/resumeSchema.js';
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