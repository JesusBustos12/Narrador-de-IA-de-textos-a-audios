import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configuración de archivos estáticos mejorada para Vercel
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ruta de la API
app.post("/api/narrate", async (req, res) => {
    const { speaker, text } = req.body;
    if (!text) return res.status(400).json({ textError: "No has escrito nada." });

    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: speaker,
            response_format: "mp3"
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        res.setHeader("Content-Type", "audio/mp3");
        res.send(buffer);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error al generar el audio." });
    }
});

// IMPORTANTE: Esto permite que si recargas la página en una ruta interna, no de un 404
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export default app;
