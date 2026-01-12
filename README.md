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
Narración en tiempo real: Convierte texto a audio MP3 usando voces predefinidas de OpenAI (Nova, Shimmer, Echo, etc.).
Interfaz de chat: Muestra mensajes del usuario y respuestas del bot con un reproductor de audio integrado.
Loader animado: Indicador visual durante la generación del audio.
Mensajes diferenciados: Usuario (gris oscuro) y bot (azul neón) con formato de burbuja y scroll automático.
Selección de voz: Dropdown con 8 opciones de voces para personalizar la narración.
Diseño moderno: Tema oscuro, sombras neón, transiciones suaves y responsivo para móviles/tablets.
Entrada por teclado: Enviar texto con Enter o botón.
Seguridad: API key protegida con dotenv y nunca expuesta en GitHub.
Despliegue listo: Configurado para Vercel, Render o Hostinger con vercel.json.

## Tecnologías utilizadas
Node.js + Express: Servidor backend, rutas API y manejo de solicitudes.
OpenAI TTS API: Generación de audio a partir de texto con voces personalizables.
JavaScript (vanilla): Manipulación del DOM, eventos, fetch asíncrono y creación de blobs de audio.
HTML5 + CSS3: Estructura semántica, Flexbox, animaciones con @keyframes y media queries responsivas.
dotenv: Gestión segura de variables de entorno.
Git & GitHub: Control de versiones y colaboración.
Vercel (opcional): Despliegue en producción con configuración personalizada.

## Estructura del proyecto
narrador-openai/
├── app.js                # Servidor Express + lógica OpenAI TTS
├── package.json          # Dependencias y scripts
├── package-lock.json     # Bloqueo de versiones de dependencias
├── vercel.json           # Configuración para despliegue en Vercel
├── public/
│   ├── index.html        # Estructura del narrador
│   ├── Assets/
│   │   ├── CSS/styles.css # Diseño neón, loader, burbujas responsivas
│   │   ├── JS/main.js     # Lógica del frontend (DOM, fetch, audio)
│   │   └── Imgs/Audio.png # Ícono y assets visuales
├── .env.example          # Plantilla de variables (sin claves)
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
https://narrador-openai.vercel.app
(Espera 10-20 segundos al primer uso — plan gratuito)

Pregunta:
"Cuenta una historia sobre un dragón valiente." (Selecciona voz: Fable)
"Lee este poema en voz femenina." (Selecciona voz: Nova)
"¿Puedes narrar las noticias de hoy?" (Selecciona voz: Onyx)

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
Número de celular: 762-119-2732
¡Gracias por revisar mi trabajo!