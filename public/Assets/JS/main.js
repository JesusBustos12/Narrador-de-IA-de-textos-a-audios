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

            const gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);

            let source = null;
            let isPlaying = false;
            let startTime = 0;
            let pauseOffset = 0;
            let currentSpeed = 1;
            const duration = audioBuffer.duration;

            // Estilos reutilizables
            const btnStyle = `
                background:none;border:none;color:var(--text-muted);cursor:pointer;
                font-size:1.5rem;padding:0.4rem;border-radius:0.4rem;display:flex;
                align-items:center;justify-content:center;transition:color 0.2s,background 0.2s;
            `;
            const smallBtnStyle = `
                background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);
                color:var(--text-muted);cursor:pointer;font-size:1.1rem;padding:0.3rem 0.7rem;
                border-radius:0.5rem;transition:all 0.2s;font-family:inherit;
            `;

            messageBot.className = "messages__content--bot";
            messageBot.innerHTML = `
                <div class="custom-player" style="width:100%;min-width:260px;">
                    <!-- Fila 1: Controles principales + progreso -->
                    <div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.8rem;">
                        <button class="ap-rw" aria-label="Retroceder 10 segundos" style="${btnStyle}" title="−10s">⏪</button>
                        <button class="ap-play" aria-label="Reproducir" style="
                            background:var(--accent-color);color:white;border:none;border-radius:50%;
                            width:40px;height:40px;min-width:40px;cursor:pointer;font-size:1.5rem;
                            display:flex;align-items:center;justify-content:center;flex-shrink:0;
                            transition:background 0.2s,transform 0.15s;
                        ">▶</button>
                        <button class="ap-fw" aria-label="Adelantar 10 segundos" style="${btnStyle}" title="+10s">⏩</button>
                        <div class="ap-bar-wrap" style="flex:1;min-width:60px;height:8px;background:rgba(255,255,255,0.15);border-radius:4px;cursor:pointer;position:relative;" title="Clic para saltar">
                            <div class="ap-bar" style="width:0%;height:100%;background:var(--accent-color);border-radius:4px;transition:width 0.15s linear;pointer-events:none;"></div>
                        </div>
                        <span class="ap-time" style="font-size:1.2rem;color:var(--text-muted);white-space:nowrap;font-variant-numeric:tabular-nums;min-width:7ch;text-align:right;">
                            0:00 / ${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}
                        </span>
                    </div>
                    <!-- Fila 2: Volumen + Velocidad + Descarga -->
                    <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                        <div style="display:flex;align-items:center;gap:0.5rem;" title="Volumen">
                            <span style="font-size:1.3rem;color:var(--text-muted);">🔊</span>
                            <input class="ap-vol" type="range" min="0" max="100" value="80" style="
                                width:70px;accent-color:var(--accent-color);cursor:pointer;
                            " aria-label="Volumen">
                        </div>
                        <div style="display:flex;align-items:center;gap:0.4rem;" title="Velocidad de reproducción">
                            <span style="font-size:1.1rem;color:var(--text-muted);">⚡</span>
                            <button class="ap-spd" data-speed="0.5" style="${smallBtnStyle}">0.5×</button>
                            <button class="ap-spd ap-spd-active" data-speed="1" style="${smallBtnStyle}background:var(--accent-color);color:white;border-color:var(--accent-color);">1×</button>
                            <button class="ap-spd" data-speed="1.5" style="${smallBtnStyle}">1.5×</button>
                            <button class="ap-spd" data-speed="2" style="${smallBtnStyle}">2×</button>
                        </div>
                        <button class="ap-dl" aria-label="Descargar audio" style="${smallBtnStyle}" title="Descargar audio">⬇ Descargar</button>
                    </div>
                </div>
            `;

            messagesContent.scrollTop = messagesContent.scrollHeight;

            // Referencias a elementos
            const playBtn = messageBot.querySelector(".ap-play");
            const rwBtn = messageBot.querySelector(".ap-rw");
            const fwBtn = messageBot.querySelector(".ap-fw");
            const barWrap = messageBot.querySelector(".ap-bar-wrap");
            const bar = messageBot.querySelector(".ap-bar");
            const timeEl = messageBot.querySelector(".ap-time");
            const volSlider = messageBot.querySelector(".ap-vol");
            const spdBtns = messageBot.querySelectorAll(".ap-spd");
            const dlBtn = messageBot.querySelector(".ap-dl");
            let progressInterval = null;

            // Volumen inicial
            gainNode.gain.value = 0.8;

            function fmt(sec) {
                const m = Math.floor(sec / 60);
                const s = String(Math.floor(sec % 60)).padStart(2, '0');
                return `${m}:${s}`;
            }
            const totalStr = fmt(duration);

            function getElapsed() {
                if (!isPlaying) return Math.min(pauseOffset, duration);
                return Math.min((audioContext.currentTime - startTime) * currentSpeed + pauseOffset, duration);
            }

            function updateUI() {
                const el = getElapsed();
                bar.style.width = (el / duration * 100) + "%";
                timeEl.textContent = `${fmt(el)} / ${totalStr}`;
                if (el >= duration) stopAll();
            }

            function stopSource() {
                if (source) { try { source.stop(); } catch(e){} source = null; }
                if (progressInterval) { clearInterval(progressInterval); progressInterval = null; }
            }

            function stopAll() {
                stopSource();
                isPlaying = false;
                pauseOffset = 0;
                playBtn.textContent = "▶";
                bar.style.width = "0%";
                timeEl.textContent = `0:00 / ${totalStr}`;
            }

            function startFrom(offset) {
                stopSource();
                pauseOffset = Math.max(0, Math.min(offset, duration));
                if (pauseOffset >= duration) { stopAll(); return; }
                source = audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.playbackRate.value = currentSpeed;
                source.connect(gainNode);
                source.start(0, pauseOffset);
                startTime = audioContext.currentTime;
                isPlaying = true;
                playBtn.textContent = "⏸";
                source.onended = () => { if (isPlaying) stopAll(); };
                progressInterval = setInterval(updateUI, 150);
            }

            // ▶ / ⏸ Play / Pause
            playBtn.addEventListener("click", () => {
                if (isPlaying) {
                    pauseOffset = getElapsed();
                    stopSource();
                    isPlaying = false;
                    playBtn.textContent = "▶";
                } else {
                    if (pauseOffset >= duration) pauseOffset = 0;
                    startFrom(pauseOffset);
                }
            });

            // ⏪ Retroceder 10s
            rwBtn.addEventListener("click", () => {
                const pos = getElapsed();
                if (isPlaying) startFrom(pos - 10);
                else { pauseOffset = Math.max(0, pos - 10); updateUI(); }
            });

            // ⏩ Adelantar 10s
            fwBtn.addEventListener("click", () => {
                const pos = getElapsed();
                if (isPlaying) startFrom(pos + 10);
                else { pauseOffset = Math.min(duration, pos + 10); updateUI(); }
            });

            // Barra de progreso — clic para saltar
            barWrap.addEventListener("click", (e) => {
                const rect = barWrap.getBoundingClientRect();
                const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
                const newPos = pct * duration;
                if (isPlaying) startFrom(newPos);
                else { pauseOffset = newPos; updateUI(); }
            });

            // 🔊 Volumen
            volSlider.addEventListener("input", () => {
                gainNode.gain.value = volSlider.value / 100;
            });

            // ⚡ Velocidad
            spdBtns.forEach(btn => {
                btn.addEventListener("click", () => {
                    const spd = parseFloat(btn.dataset.speed);
                    const pos = getElapsed();
                    currentSpeed = spd;
                    // Estilo activo
                    spdBtns.forEach(b => {
                        b.style.background = "rgba(255,255,255,0.08)";
                        b.style.color = "var(--text-muted)";
                        b.style.borderColor = "rgba(255,255,255,0.12)";
                    });
                    btn.style.background = "var(--accent-color)";
                    btn.style.color = "white";
                    btn.style.borderColor = "var(--accent-color)";
                    if (isPlaying) startFrom(pos);
                });
            });

            // ⬇ Descarga
            dlBtn.addEventListener("click", () => {
                const a = document.createElement("a");
                const downloadUrl = URL.createObjectURL(audioBlob);
                a.href = downloadUrl;
                a.download = "narrador-ia-audio.mp3";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
            });

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