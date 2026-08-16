import dotenv from 'dotenv';
dotenv.config();
import app from "./src/app.js";
import { createConnection } from './src/db/db.js';

app.listen(3000, async () => {
    console.log("server is running");
    try {
        await createConnection();
    } catch (error) {
        console.error(error);
    }
});