# Narrador con OpenAI TTS - Portafolio Full-Stack

## Descripción
Aplicación web full-stack de alto rendimiento que implementa un sistema inteligente de síntesis de voz utilizando la API TTS (Text-to-Speech) de OpenAI. El sistema cuenta con una arquitectura robusta que gestiona la conversión de texto a audio en tiempo real, incluyendo controles de cuotas estrictos basados en direcciones IP conectados a una base de datos en la nube (TiDB) para prevenir vulnerabilidades de elusión (bypass) en el cliente. La interfaz es moderna, responsiva, cuenta con SEO optimizado y decodificación de audio nativa.

## Objetivo
Desarrollar una solución escalable, segura y optimizada que:
- Demuestre la integración asíncrona de APIs de inteligencia artificial (OpenAI TTS).
- Implemente un control antifraude de límite de peticiones (rate limiting) del lado del servidor, validado y persistido en la nube.
- Maneje procesamiento de buffers y flujos de audio binario (MP3) directamente con Web Audio API.
- Garantice una experiencia de usuario inmersiva con retroalimentación instantánea, mensajes guiados del sistema, loaders, animaciones fluidas y accesibilidad ARIA.
- Asegure los endpoints mediante cabeceras de seguridad, sanitización y un manejo seguro de variables de entorno.

## Características
- **Control de Cuotas en la Nube:** Sistema de límites diarios (5 peticiones) validado por IP en TiDB (MySQL), con restablecimiento automático e invisible cada 24 horas. Totalmente inmune a manipulaciones del localStorage o caché del navegador.
- **Narración en Tiempo Real:** Conversión de texto a audio usando modelos TTS de OpenAI, con 8 voces predefinidas personalizables.
- **Experiencia de Usuario Integrada:** Mensajes de bienvenida automáticos del bot, loaders de estado y deshabilitación inteligente de controles durante la red de solicitudes.
- **Seguridad y Rendimiento:** Implementación de Helmet, CORS, Rate Limit, caché estático de recursos y compresión (Brotli/Gzip) en Express.
- **SEO Técnico Optimizado:** Implementación completa de metadatos Open Graph, Twitter Cards (summary_large_image), Schema.org (JSON-LD WebApplication) y HTML semántico.
- **Interfaz y Accesibilidad:** Tema oscuro estilo neón responsivo, validación de caracteres dinámicos, soporte de atajos (Shift+Enter) y etiquetas ARIA para lectores de pantalla.

## Tecnologías utilizadas
- **Backend:** Node.js, Express.js.
- **Base de Datos:** TiDB Serverless (MySQL) para la persistencia segura de estados y control de accesos por red.
- **Inteligencia Artificial:** OpenAI TTS API (Modelo tts-1).
- **Frontend:** JavaScript Modular (ES6+), HTML5 Semántico, CSS3 puro (variables CSS, Flexbox/Grid, animaciones).
- **Seguridad & Core:** mysql2, dotenv, helmet, cors, express-rate-limit, compression.

## Estructura del proyecto
narrador-openai/
├── app.js                # Lógica del servidor, middleware, conexión TiDB, OpenAI y seguridad
├── package.json          # Dependencias y scripts de ejecución
├── package-lock.json     # Bloqueo estricto de dependencias
├── vercel.json           # Configuración de despliegue
├── public/
│   ├── index.html        # Estructura principal, preloads y metadatos SEO avanzados
│   ├── Assets/
│   │   ├── CSS/styles.css # Sistema de diseño (tokens, neón, loader, responsive)
│   │   ├── JS/            # Lógica cliente, Web Audio API, controladores y UX
│   │   └── Imgs/Audio.png # Assets visuales
├── .env.example          # Plantilla segura de variables
├── .gitignore            # Exclusión de módulos, secretos y configuraciones locales
└── README.md             # Esta documentación

## Habilidades demostradas
- Arquitectura de software, diseño de APIs RESTful e integración de servicios Cloud (TiDB, OpenAI).
- Desarrollo de backend seguro, transacciones SQL y protección de endpoints contra vectores de abuso.
- Procesamiento avanzado en el cliente: Fetch API, manejo de Blobs, Buffers y la API nativa Web Audio.
- Optimización técnica profunda de SEO y accesibilidad sin depender de frameworks.
- Implementación de buenas prácticas (CORS, gestión de IPs, variables de entorno, escalabilidad).

## Demo en vivo
Prueba el narrador funcional en tiempo real:
https://narrador-de-ia-de-textos-a-audios.vercel.app/

## Notas para empleadores
Este repositorio expone un producto de software robusto, evidenciando la capacidad de:
- Diseñar, desarrollar y desplegar aplicaciones Full-Stack integrales listas para producción.
- Identificar y mitigar vulnerabilidades de lógica de negocio (como el bypass de cuotas en cliente) implementando soluciones validadas en el backend con bases de datos.
- Producir código limpio, modular, asíncrono y de alto rendimiento utilizando tecnologías core de la web.
- Optimizar la visibilidad del producto en motores de búsqueda y priorizar de forma nativa la experiencia del usuario (UX).

## Contáctame en:
- GitHub: github.com/JesusBustos12
- LinkedIn: linkedin.com/in/jesus-bustos-arizmendi-325329283
- Correo: jesusbustosarizmendi0@gmail.com
