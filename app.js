import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
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

        // Convertimos la respuesta directamente a un Buffer
        const buffer = Buffer.from(await response.arrayBuffer());

        // Enviamos el buffer directamente al cliente
        res.setHeader("Content-Type", "audio/mp3");
        res.send(buffer);

    } catch (error) {
        console.error("Error con OpenAI:", error);
        res.status(500).json({ error: "Error al generar el audio." });
    }
});

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Servidor corriendo en http://localhost:${port}`);
    });
}

export default app; 