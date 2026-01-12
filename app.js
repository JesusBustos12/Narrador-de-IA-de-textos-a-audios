import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();

const app = express();

// Configuración de carpeta estática basada en tu proyecto exitoso
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ruta explícita para asegurar que cargue el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

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
        console.error("Error con OpenAI:", error);
        res.status(500).json({ error: "Error al generar el audio." });
    }
});

export default app;
