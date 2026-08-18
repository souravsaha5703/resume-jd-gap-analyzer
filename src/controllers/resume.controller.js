import { v4 as uuid } from 'uuid';
import { pool as db } from '../db/db.js';
import { PDFParse } from 'pdf-parse';
import { readFile, unlink } from 'node:fs/promises';
import { generateStructuredDataFromResume } from '../services/generateStructuredData.service.js';

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        const original_filename = req.file.originalname;
        const bufferData = await readFile(req.file.path);
        const uint8ArrayData = new Uint8Array(bufferData.buffer, bufferData.byteOffset, bufferData.byteLength);

        const parser = new PDFParse(uint8ArrayData);
        const parsedResult = await parser.getText();
        const rawText = typeof parsedResult === 'string'
            ? parsedResult
            : (parsedResult.text || parsedResult.pages?.map(p => p.text).join('\n') || '');
        console.log("Data parsed");

        await unlink(req.file.path);

        const structuredData = await generateStructuredDataFromResume(rawText);
        console.log("structured data completed");


        await db.query(`
            CREATE TABLE IF NOT EXISTS resumes(
                id VARCHAR(36) PRIMARY KEY,
                user_id VARCHAR(36) NOT NULL,
                original_filename VARCHAR(100) NOT NULL,
                raw_text TEXT,
                structured_data JSON,
                version_number INT DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        const resumeId = uuid();
        const userId = req.user.id;
        const insertSql = 'INSERT INTO resumes (id,user_id,original_filename,raw_text,structured_data) VALUES (?,?,?,?,?)';
        await db.execute(insertSql, [resumeId, userId, original_filename, rawText, JSON.stringify(structuredData)]);

        res.status(200).json({ message: "Data parsed and successfully added to Database" });
    } catch (error) {
        if (req.file?.path) await unlink(req.file.path).catch(() => { });
        console.error(error);
        res.status(500).json({ error: 'Failed to process and save resume' });
    }
}