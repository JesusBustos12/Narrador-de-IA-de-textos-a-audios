import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import path from "path";
import mysql from "mysql2/promise";

dotenv.config();

const pool = mysql.createPool({
    uri: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: true
    }
});
const MAX_NARRATIONS = 5;

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
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

// Endpoint para consultar el estado del límite
app.get("/api/limit-status", async (req, res) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    try {
        const [rows] = await pool.query(`
            SELECT IF(TIMESTAMPDIFF(HOUR, updated_at, CURRENT_TIMESTAMP) >= 24, 0, generation_count) as active_count 
            FROM user_generations 
            WHERE ip_address = ?
        `, [ip]);
        let count = 0;
        if (rows.length > 0) {
            count = rows[0].active_count;
        }
        res.json({ remaining: Math.max(0, MAX_NARRATIONS - count), max: MAX_NARRATIONS });
    } catch (error) {
        console.error("Database error:", error);
        res.status(500).json({ error: "Error interno del servidor al consultar límites" });
    }
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

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    try {
        // Verificar limite en la base de datos (con reseteo de 24h)
        const [rows] = await pool.query(`
            SELECT IF(TIMESTAMPDIFF(HOUR, updated_at, CURRENT_TIMESTAMP) >= 24, 0, generation_count) as active_count 
            FROM user_generations 
            WHERE ip_address = ?
        `, [ip]);
        let currentCount = 0;
        if (rows.length > 0) {
            currentCount = rows[0].active_count;
        }

        if (currentCount >= MAX_NARRATIONS) {
            return res.status(403).json({ error: "Has alcanzado el límite máximo de 5 narraciones por dispositivo." });
        }
    } catch (dbError) {
        console.error("Error al consultar TiDB:", dbError);
        return res.status(500).json({ error: "Error interno del servidor al verificar límites." });
    }

    try {
        const response = await openai.audio.speech.create({
            model: "tts-1",
            input: text,
            voice: speaker,
            response_format: "mp3"
        });

        // Convertimos la respuesta directamente a un Buffer
        const buffer = Buffer.from(await response.arrayBuffer());

        try {
            // Incrementar contador en TiDB (reseteando a 1 si han pasado 24h)
            await pool.query(`
                INSERT INTO user_generations (ip_address, generation_count, updated_at) 
                VALUES (?, 1, CURRENT_TIMESTAMP) 
                ON DUPLICATE KEY UPDATE 
                    generation_count = IF(TIMESTAMPDIFF(HOUR, updated_at, CURRENT_TIMESTAMP) >= 24, 1, generation_count + 1),
                    updated_at = CURRENT_TIMESTAMP
            `, [ip]);
        } catch (dbError) {
            console.error("Error al actualizar limite en TiDB:", dbError);
        }

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
