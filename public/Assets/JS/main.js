import AudioPlayer from './AudioController.js';

const messagesContent = document.querySelector(".messages__content");
const categoryOptions = document.querySelector(".category__options"); 
const inputText = document.getElementById("inputText");
const sendButton = document.getElementById("sendButton");
const charCount = document.getElementById("charCount");

const MAX_CHARS = 4096;

inputText.addEventListener("input", () => {
    const len = inputText.value.length;
    if(charCount) {
        charCount.textContent = `${len} / ${MAX_CHARS}`;
        charCount.style.color = len > MAX_CHARS ? "#f87171" : "var(--text-muted)";
    }
});

async function sendNarrate(){

    const text = inputText.value.trim();
    const speaker = categoryOptions.value;

    if(!text) return false;

    // Desactivar inputs durante la generación
    sendButton.disabled = true;
    inputText.disabled = true;
    sendButton.textContent = "Generando...";

    const messageUser = document.createElement("div");
    messageUser.className = "messages__content--user";
    messageUser.textContent = text;

    messagesContent.appendChild(messageUser);
    messagesContent.scrollTop = messagesContent.scrollHeight;

    const messageBot = document.createElement("div");
    messageBot.className = "messages__content--bot";
    messageBot.innerHTML = `Bot: <div class="loader"></div>`;

    messagesContent.appendChild(messageBot);
    messagesContent.scrollTop = messagesContent.scrollHeight;
 
    try{

        const response = await fetch("/api/narrate", {
            method: "POST",
            headers: {"Content-type": "application/json"},
            body: JSON.stringify({
                text: text,
                speaker: speaker
            })
        });

        if(response.ok){

            const audioBlob = await response.blob();
            const arrayBuffer = await audioBlob.arrayBuffer();

            // Web Audio API — compatibilidad cruzada
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                throw new Error("Tu navegador no soporta Web Audio API.");
            }
            const audioContext = new AudioContextClass();

            // Soportar Promise o Callback para decodeAudioData
            const audioBuffer = await new Promise((resolve, reject) => {
                const decodeResult = audioContext.decodeAudioData(
                    arrayBuffer,
                    (buffer) => resolve(buffer),
                    (err) => reject(new Error("Error al decodificar el audio: " + err))
                );
                // Si el navegador soporta Promises natively
                if (decodeResult) decodeResult.catch(reject);
            });

            messageBot.className = "messages__content--bot";
            messagesContent.scrollTop = messagesContent.scrollHeight;

            // Instanciar la clase AudioPlayer
            new AudioPlayer(messageBot, audioBuffer, audioBlob, audioContext);

        } else {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.error || `Error del servidor HTTP ${response.status}`;
            messageBot.innerHTML = `<span style="color: #f87171;">⚠️ ${errorMsg}</span>`;
        }

    }catch(exception){
        console.error("Error de red o procesamiento:", exception);
        messageBot.innerHTML = `<span style="color: #f87171;">⚠️ Error interno: ${exception.message || "Falla de red"}</span>`;
    } finally {
        // Reactivar
        sendButton.disabled = false;
        inputText.disabled = false;
        sendButton.textContent = "Narrar";
        inputText.value = "";
        if(charCount) charCount.textContent = `0 / ${MAX_CHARS}`;
        inputText.focus();
    }
}

sendButton.addEventListener("click", sendNarrate);
inputText.addEventListener("keydown", (event) => {
    if(event.key === "Enter" && !event.shiftKey){
        event.preventDefault();
        sendNarrate();
    }
});