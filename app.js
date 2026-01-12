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

// ESTO ES CLAVE: Definir la ruta de la carpeta pública de forma absoluta
const publicPath = path.join(process.cwd(), 'public');
app.use(express.static(publicPath));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Ruta de la API
app.post("/api/narrate", async (req, res) => {
    try {
        const { speaker, text } = req.body;
        if (!text) return res.status(400).json({ textError: "No hay texto." });

        const mp3 = await openai.audio.speech.create({
            model: "tts-1",
            voice: speaker || "nova",
            input: text,
        });

        const buffer = Buffer.from(await mp3.arrayBuffer());
        
        res.setHeader("Content-Type", "audio/mpeg");
        // Usamos send(buffer) para evitar problemas de escritura en disco
        return res.send(buffer);
        
    } catch (error) {
        console.error("OpenAI Error:", error);
        return res.status(500).json({ error: "Error en OpenAI: " + error.message });
    }
});

// Captura cualquier otra ruta para servir el index.html (SPA mode)
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// Esto es para que funcione localmente pero no interfiera con Vercel
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`http://localhost:${port}`));
}

export default app;
