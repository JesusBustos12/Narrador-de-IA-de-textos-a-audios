export default class AudioPlayer {
    constructor(container, audioBuffer, audioBlob, audioContext) {
        this.container = container;
        this.audioBuffer = audioBuffer;
        this.audioBlob = audioBlob;
        this.audioContext = audioContext;
        this.duration = audioBuffer.duration;
        
        this.gainNode = this.audioContext.createGain();
        this.gainNode.connect(this.audioContext.destination);
        this.gainNode.gain.value = 0.8; // Volumen inicial

        this.source = null;
        this.isPlaying = false;
        this.startTime = 0;
        this.pauseOffset = 0;
        this.currentSpeed = 1;
        this.progressInterval = null;

        this.render();
        this.bindEvents();
    }

    render() {
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

        this.container.innerHTML = `
            <div class="custom-player" style="width:100%;min-width:260px;">
                <!-- Controles principales -->
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
                        0:00 / ${this.formatTime(this.duration)}
                    </span>
                </div>
                <!-- Volumen, velocidad y descarga -->
                <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap;">
                    <div style="display:flex;align-items:center;gap:0.5rem;" title="Volumen">
                        <span style="font-size:1.3rem;color:var(--text-muted);">🔊</span>
                        <input class="ap-vol" type="range" min="0" max="100" value="80" style="width:70px;accent-color:var(--accent-color);cursor:pointer;" aria-label="Volumen">
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

        this.elements = {
            playBtn: this.container.querySelector(".ap-play"),
            rwBtn: this.container.querySelector(".ap-rw"),
            fwBtn: this.container.querySelector(".ap-fw"),
            barWrap: this.container.querySelector(".ap-bar-wrap"),
            bar: this.container.querySelector(".ap-bar"),
            timeEl: this.container.querySelector(".ap-time"),
            volSlider: this.container.querySelector(".ap-vol"),
            spdBtns: this.container.querySelectorAll(".ap-spd"),
            dlBtn: this.container.querySelector(".ap-dl")
        };
    }

    formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = String(Math.floor(sec % 60)).padStart(2, '0');
        return `${m}:${s}`;
    }

    getElapsed() {
        if (!this.isPlaying) return Math.min(this.pauseOffset, this.duration);
        return Math.min((this.audioContext.currentTime - this.startTime) * this.currentSpeed + this.pauseOffset, this.duration);
    }

    updateUI() {
        const el = this.getElapsed();
        this.elements.bar.style.width = (el / this.duration * 100) + "%";
        this.elements.timeEl.textContent = `${this.formatTime(el)} / ${this.formatTime(this.duration)}`;
        if (el >= this.duration) this.stopAll();
    }

    stopSource() {
        if (this.source) {
            try { this.source.stop(); } catch(e){}
            this.source = null;
        }
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    stopAll() {
        this.stopSource();
        this.isPlaying = false;
        this.pauseOffset = 0;
        this.elements.playBtn.textContent = "▶";
        this.elements.bar.style.width = "0%";
        this.elements.timeEl.textContent = `0:00 / ${this.formatTime(this.duration)}`;
    }

    startFrom(offset) {
        this.stopSource();
        this.pauseOffset = Math.max(0, Math.min(offset, this.duration));
        
        if (this.pauseOffset >= this.duration) { 
            this.stopAll(); 
            return; 
        }

        this.source = this.audioContext.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.playbackRate.value = this.currentSpeed;
        this.source.connect(this.gainNode);
        this.source.start(0, this.pauseOffset);
        
        this.startTime = this.audioContext.currentTime;
        this.isPlaying = true;
        this.elements.playBtn.textContent = "⏸";
        
        this.source.onended = () => { 
            if (this.isPlaying) this.stopAll(); 
        };
        
        this.progressInterval = setInterval(() => this.updateUI(), 150);
    }

    bindEvents() {
        const { playBtn, rwBtn, fwBtn, barWrap, volSlider, spdBtns, dlBtn } = this.elements;

        playBtn.addEventListener("click", () => {
            if (this.isPlaying) {
                this.pauseOffset = this.getElapsed();
                this.stopSource();
                this.isPlaying = false;
                playBtn.textContent = "▶";
            } else {
                if (this.pauseOffset >= this.duration) this.pauseOffset = 0;
                this.startFrom(this.pauseOffset);
            }
        });

        rwBtn.addEventListener("click", () => {
            const pos = this.getElapsed();
            if (this.isPlaying) this.startFrom(pos - 10);
            else { this.pauseOffset = Math.max(0, pos - 10); this.updateUI(); }
        });

        fwBtn.addEventListener("click", () => {
            const pos = this.getElapsed();
            if (this.isPlaying) this.startFrom(pos + 10);
            else { this.pauseOffset = Math.min(this.duration, pos + 10); this.updateUI(); }
        });

        barWrap.addEventListener("click", (e) => {
            const rect = barWrap.getBoundingClientRect();
            const pct = Math.max(0, Math.min((e.clientX - rect.left) / rect.width, 1));
            const newPos = pct * this.duration;
            if (this.isPlaying) this.startFrom(newPos);
            else { this.pauseOffset = newPos; this.updateUI(); }
        });

        volSlider.addEventListener("input", () => {
            this.gainNode.gain.value = volSlider.value / 100;
        });

        spdBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const spd = parseFloat(btn.dataset.speed);
                const pos = this.getElapsed();
                this.currentSpeed = spd;
                
                spdBtns.forEach(b => {
                    b.style.background = "rgba(255,255,255,0.08)";
                    b.style.color = "var(--text-muted)";
                    b.style.borderColor = "rgba(255,255,255,0.12)";
                });
                btn.style.background = "var(--accent-color)";
                btn.style.color = "white";
                btn.style.borderColor = "var(--accent-color)";
                
                if (this.isPlaying) this.startFrom(pos);
            });
        });

        dlBtn.addEventListener("click", () => {
            const a = document.createElement("a");
            const downloadUrl = URL.createObjectURL(this.audioBlob);
            a.href = downloadUrl;
            a.download = "narrador-ia-audio.mp3";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(downloadUrl), 5000);
        });
    }
}
