import { PDFParse } from 'pdf-parse';
import { readFile, unlink } from 'node:fs/promises';

export const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No PDF file uploaded' });
        }
        const bufferData = await readFile(req.file.path);
        const uint8ArrayData = new Uint8Array(bufferData.buffer, bufferData.byteOffset, bufferData.byteLength);

        const parser = new PDFParse(uint8ArrayData);
        const result = await parser.getText();

        await unlink(req.file.path);

        res.status(200).json({ content: result });
    } catch (error) {
        if (req.file?.path) await unlink(req.file.path).catch(() => { });
        console.error(error);
        res.status(500).json({ error: 'Failed to parse PDF' });
    }
}