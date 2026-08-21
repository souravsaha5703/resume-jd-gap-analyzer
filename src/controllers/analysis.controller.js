import { v4 as uuid } from 'uuid';
import { pool as db } from '../db/db.js';
import { generateStructuredAnalysis } from '../services/generateStructuredData.service.js';

export const getAnalysis = async (req, res) => {
    const { resumeId, jdId } = req.body;

    if (!resumeId || !jdId) {
        res.status(400).json({ error: "resumeId and jobDescriptionId are required" });
    }

    try {
        const [existingResume] = await db.execute("SELECT * FROM resumes WHERE id = ?", [resumeId]);
        if (existingResume.length == 0 || existingResume[0].user_id !== req.user.id) {
            return res.status(404).json({ error: "Resume not found" });
        }

        const [existingJd] = await db.execute("SELECT * FROM job_descriptions WHERE id = ?", [jdId]);
        if (existingJd.length == 0 || existingJd[0].user_id !== req.user.id) {
            return res.status(404).json({ error: "Job description not found" });
        }

        const gapAnalysisResult = await generateStructuredAnalysis(existingResume[0].structured_data, existingJd[0].structured_data);

        await db.query(`
            CREATE TABLE IF NOT EXISTS analyses(
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                resume_id VARCHAR(36) NOT NULL,
                jd_id VARCHAR(36) NOT NULL,
                match_score INT,
                matched_skills JSON,
                missing_skills JSON,
                partial_matches JSON,
                suggestions JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE,
                FOREIGN KEY (jd_id) REFERENCES job_descriptions(id) ON DELETE CASCADE
            )
        `);
        const analysisId = uuid();
        const userId = req.user.id;
        const insertSql = 'INSERT INTO analyses (id,user_id,resume_id,jd_id,match_score,matched_skills,missing_skills,partial_matches,suggestions) VALUES (?,?,?,?,?,?,?,?,?)';
        await db.execute(insertSql, [analysisId, userId, resumeId, jdId, gapAnalysisResult.match_score, gapAnalysisResult.matched_skills, gapAnalysisResult.missing_skills, gapAnalysisResult.partial_matches, gapAnalysisResult.suggestions]);

        res.status(201).json({ status: 201, message: "Analysis generated", analysis: gapAnalysisResult });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to generate gap analysis" });
    }
}