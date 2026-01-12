import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ruta de la API
app.post("/api/narrate", async (req, res) => {
    const { speaker, text } = req.body;
    if (!text) return res.status(400).json({ textError: "No hay texto." });

    try {
        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: speaker || "nova",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        
        res.setHeader("Content-Type", "audio/mpeg");
        res.send(buffer);
    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ error: "Error en la generación de audio." });
    }
});

// Captura cualquier otra ruta y sirve el index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
