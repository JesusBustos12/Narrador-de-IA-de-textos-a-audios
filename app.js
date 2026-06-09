import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import path from "path";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            "media-src": ["'self'", "blob:"],
            "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            "font-src": ["'self'", "https://fonts.gstatic.com", "data:"]
        }
    }
}));
app.use(compression());

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:3000"];
app.use(cors({ origin: allowedOrigins }));

// Configuración de carpeta estática basada en tu proyecto exitoso
app.use(express.static(path.join(process.cwd(), 'public'), {
    maxAge: process.env.NODE_ENV === "production" ? "7d" : 0,
    etag: true,
}));

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true, limit: "50kb" }));

// Ruta explícita para asegurar que cargue el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,  // 1 minuto
    max: 10,              // máx 10 peticiones por ventana
    message: { error: "Demasiadas solicitudes. Intenta de nuevo en un minuto." },
    standardHeaders: true,
    legacyHeaders: false,
});

const VALID_VOICES = ["nova", "shimmer", "echo", "onyx", "fable", "alloy", "ash", "coral"];
const MAX_TEXT_LENGTH = 4096;

app.post("/api/narrate", apiLimiter, async (req, res) => {
    const { speaker, text } = req.body;

    if (!text) return res.status(400).json({ textError: "No has escrito nada." });
    if (typeof text !== "string") return res.status(400).json({ error: "El texto debe ser una cadena válida." });
    if (text.trim().length === 0) return res.status(400).json({ error: "El texto no puede estar vacío." });
    if (text.length > MAX_TEXT_LENGTH) return res.status(400).json({ error: `El texto no puede superar los ${MAX_TEXT_LENGTH} caracteres.` });
    if (!VALID_VOICES.includes(speaker)) return res.status(400).json({ error: "Voz no válida." });

    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: speaker,
            max_tokens: 600,
            response_format: "mp3"
        });

        // Convertimos la respuesta directamente a un Buffer
        const buffer = Buffer.from(await response.arrayBuffer());

        // Enviamos el buffer directamente al cliente
        res.setHeader("Content-Type", "audio/mpeg");
        res.send(buffer);

    } catch (error) {
        console.error("Error con OpenAI:", error.message);
        
        if (error.status === 401) {
            return res.status(500).json({ error: "Error de configuración del servidor." });
        }
        if (error.status === 429) {
            return res.status(429).json({ error: "Límite de la API alcanzado. Intenta más tarde." });
        }
        if (error.status === 400) {
            return res.status(400).json({ error: "El texto proporcionado no es válido para la narración." });
        }
        
        return res.status(500).json({ error: "Error interno al generar el audio." });
    }
});

// Middleware global de errores
app.use((err, req, res, next) => {
    console.error("Error no controlado:", err.message);
    res.status(500).json({ error: "Ha ocurrido un error inesperado." });
});

export default app;
