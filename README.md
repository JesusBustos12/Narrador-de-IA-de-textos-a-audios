# Narrador con OpenAI TTS - Portafolio Full-Stack

## Descripción
Aplicación web full-stack que implementa un narrador inteligente de texto a audio utilizando la API de TTS (Text-to-Speech) de OpenAI. El sistema permite a los usuarios ingresar texto, seleccionar una voz y generar narraciones en audio en tiempo real, con una interfaz de chat moderna que muestra mensajes de usuario y reproduce el audio generado. Construido con Node.js, Express, JavaScript vanilla y CSS puro, sin frameworks. Ideal para demostrar habilidades full-stack en un primer empleo.

## Objetivo
Como estudiante universitario autodidacta, desarrollé este proyecto para:
Mostrar dominio de Node.js + Express en el backend.
Integrar APIs externas avanzadas (OpenAI TTS con generación de audio en MP3).
Implementar procesamiento asíncrono de audio con streaming directo al cliente.
Diseñar una interfaz interactiva y responsiva con animaciones CSS, loader y efectos modernos.
Aplicar buenas prácticas de seguridad (.env, .gitignore, variables de entorno).
Construir un portafolio profesional listo para despliegue en producción.

## Características
Narración en tiempo real: Convierte texto a audio MP3/MPEG usando voces predefinidas de OpenAI (Nova, Shimmer, Echo, etc.).
Interacción segura y validada: Limits de tasa (Rate Limiting), sanitización de inputs y prevención de desbordamientos.
Interfaz de chat y Accesibilidad: Atributos ARIA implementados, navegación por teclado y contador de caracteres.
Loader animado: Indicador visual y desactivación de botones durante la generación del audio.
Mensajes diferenciados: Usuario (gris oscuro) y bot (azul neón) con formato de burbuja y scroll automático.
Selección de voz: Dropdown con 8 opciones de voces para personalizar la narración.
Diseño moderno: Tema oscuro, sombras neón, transiciones suaves, fuente nativa Inter y responsive para móviles/tablets.
Entrada por teclado: Enviar texto con Enter o botón, soporte de nuevas líneas con Shift+Enter en el nuevo textarea.
Seguridad y Optimización: Cabeceras de seguridad con Helmet, CORS, caché estático de recursos y compresión (Brotli/Gzip).

## Tecnologías utilizadas
Node.js + Express: Servidor backend, rutas API y manejo de solicitudes.
OpenAI TTS API: Generación de audio a partir de texto con voces personalizables.
JavaScript (vanilla): Manipulación del DOM, eventos, fetch asíncrono y creación de blobs de audio con liberación de memoria.
HTML5 + CSS3: Estructura semántica, Flexbox, animaciones con @keyframes, meta tags SEO y media queries responsivas.
Seguridad & Performance: dotenv, helmet, cors, express-rate-limit y compression.
Git & GitHub: Control de versiones y colaboración.
Nodemon: Para entorno de desarrollo ágil.

## Estructura del proyecto
narrador-openai/
├── app.js                # Servidor Express, seguridad, rate-limits y lógica OpenAI TTS
├── package.json          # Dependencias y scripts (start, dev)
├── package-lock.json     # Bloqueo de versiones de dependencias
├── vercel.json           # Configuración para despliegue en Vercel
├── public/
│   ├── index.html        # Estructura semántica, preloads y metadatos SEO
│   ├── Assets/
│   │   ├── CSS/styles.css # Diseño neón, loader, accesibilidad y estados de interacción
│   │   ├── JS/main.js     # Lógica segura del frontend, gestión de blobs y feedback
│   │   └── Imgs/Audio.png # Ícono y assets visuales
├── .env.example          # Plantilla segura de variables
├── .gitignore            # Protege .env, node_modules
└── README.md             # Esta documentación
Habilidades demostradas
Este proyecto refleja competencias clave para un Junior Full-Stack:

Backend: Rutas API, async/await, manejo de buffers de audio, errores y respuestas binarias.
Frontend: DOM dinámico, eventos, creación de URLs de blobs, UX fluida con audio controls.
APIs externas: Integración con OpenAI TTS, conversión de respuestas a buffers MP3.
Arquitectura limpia: Separación de responsabilidades (backend/frontend).
Seguridad: Variables de entorno, .gitignore, no exposición de secretos.
Despliegue: Listo para hosting con Node.js (Vercel, Render).
Autonomía: Construido en horas limitadas sin seguir tutoriales.

## Demo en vivo
Prueba el narrador en tiempo real:
https://narrador-de-ia-de-textos-a-audios.vercel.app/
(Espera 10-20 segundos al primer uso — plan gratuito)

## Notas para empleadores
Este es uno de mis proyectos full-stack más recientes.
Lo construí rápidamente tras aprender los conceptos básicos de TTS, sin seguir guías paso a paso.
Demuestra que:
Puedo integrar APIs de multimedia en producción.
Domino backend y frontend sin frameworks.
Priorizo seguridad, rendimiento y experiencia de usuario.
Aprendo rápido y entrego resultados funcionales.
Estoy listo para contribuir en equipos reales como Junior Full-Stack Developer.

## Contáctame en:
GitHub: github.com/JesusBustos12
LinkedIn: linkedin.com/in/jesus-bustos-arizmendi-325329283
Correo: jesusbustosarizmendi0@gmail.com

¡Gracias por revisar mi trabajo!
