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

            // Usar Web Audio API para evitar CSP blob: restrictions
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            let source = null;
            let isPlaying = false;
            let startTime = 0;
            let pauseOffset = 0;
            const duration = audioBuffer.duration;

            messageBot.className = "messages__content--bot";
            messageBot.innerHTML = `
                <div style="display:flex;align-items:center;gap:1.2rem;width:100%;min-width:250px;padding:0.5rem 0;">
                    <button class="audio-play-btn" aria-label="Reproducir audio" style="
                        background:var(--accent-color);color:white;border:none;border-radius:50%;
                        width:42px;height:42px;min-width:42px;cursor:pointer;font-size:1.6rem;display:flex;
                        align-items:center;justify-content:center;flex-shrink:0;
                        transition:background 0.2s,transform 0.15s;
                    ">▶</button>
                    <div style="flex:1;min-width:80px;">
                        <div style="height:8px;background:rgba(255,255,255,0.2);border-radius:4px;overflow:hidden;">
                            <div class="audio-progress" style="width:0%;height:100%;background:var(--accent-color);border-radius:4px;transition:width 0.15s linear;"></div>
                        </div>
                    </div>
                    <span class="audio-time" style="font-size:1.3rem;color:var(--text-muted);white-space:nowrap;font-variant-numeric:tabular-nums;">
                        0:00 / ${Math.floor(duration/60)}:${String(Math.floor(duration%60)).padStart(2,'0')}
                    </span>
                </div>
            `;

            messagesContent.scrollTop = messagesContent.scrollHeight;

            const playBtn = messageBot.querySelector(".audio-play-btn");
            const progressBar = messageBot.querySelector(".audio-progress");
            const timeDisplay = messageBot.querySelector(".audio-time");
            let progressInterval = null;

            function formatTime(sec) {
                const m = Math.floor(sec / 60);
                const s = String(Math.floor(sec % 60)).padStart(2, '0');
                return `${m}:${s}`;
            }
            const totalTime = formatTime(duration);

            function updateProgress() {
                const elapsed = audioContext.currentTime - startTime + pauseOffset;
                const pct = Math.min((elapsed / duration) * 100, 100);
                progressBar.style.width = pct + "%";
                timeDisplay.textContent = `${formatTime(Math.min(elapsed, duration))} / ${totalTime}`;
                if (elapsed >= duration) stopPlayback();
            }

            function stopPlayback() {
                isPlaying = false;
                playBtn.textContent = "▶";
                if (progressInterval) clearInterval(progressInterval);
                if (source) { try { source.stop(); } catch(e){} source = null; }
                pauseOffset = 0;
                progressBar.style.width = "0%";
                timeDisplay.textContent = `0:00 / ${totalTime}`;
            }

            playBtn.addEventListener("click", () => {
                if (isPlaying) {
                    isPlaying = false;
                    playBtn.textContent = "▶";
                    pauseOffset += audioContext.currentTime - startTime;
                    if (progressInterval) clearInterval(progressInterval);
                    if (source) { try { source.stop(); } catch(e){} source = null; }
                } else {
                    if (pauseOffset >= duration) pauseOffset = 0;
                    source = audioContext.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(audioContext.destination);
                    source.start(0, pauseOffset);
                    startTime = audioContext.currentTime;
                    isPlaying = true;
                    playBtn.textContent = "⏸";
                    source.onended = () => {
                        if (isPlaying) stopPlayback();
                    };
                    progressInterval = setInterval(updateProgress, 200);
                }
            });

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