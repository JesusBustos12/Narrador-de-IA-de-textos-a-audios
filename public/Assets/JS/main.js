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
            const audioURL = URL.createObjectURL(audioBlob);

            messageBot.className = "messages__content--bot";
            messageBot.innerHTML = `
                <audio controls>
                    <source src="${audioURL}" type="audio/mpeg">
                    Tu navegador no es compatible con la reproducción de audio.
                </audio>
            `;

            const audioEl = messageBot.querySelector("audio");
            audioEl.addEventListener("ended", () => URL.revokeObjectURL(audioURL));

            messagesContent.appendChild(messageBot);
            messagesContent.scrollTop = messagesContent.scrollHeight;

        } else {
            const errorData = await response.json().catch(() => null);
            const errorMsg = errorData?.error || "Error al generar el audio. Intenta de nuevo.";
            messageBot.innerHTML = `<span style="color: #f87171;">⚠️ ${errorMsg}</span>`;
        }

    }catch(exception){
        console.error("Error de red:", exception);
        messageBot.innerHTML = `<span style="color: #f87171;">⚠️ Error de conexión. Verifica tu internet.</span>`;
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