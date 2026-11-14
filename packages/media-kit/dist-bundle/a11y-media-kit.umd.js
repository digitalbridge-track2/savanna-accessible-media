(function(d,m){typeof exports=="object"&&typeof module<"u"?m(exports):typeof define=="function"&&define.amd?define(["exports"],m):(d=typeof globalThis<"u"?globalThis:d||self,m(d.AbugidaMediaKit={}))})(this,function(d){"use strict";var K=Object.defineProperty;var W=(d,m,b)=>m in d?K(d,m,{enumerable:!0,configurable:!0,writable:!0,value:b}):d[m]=b;var c=(d,m,b)=>W(d,typeof m!="symbol"?m+"":m,b);const m="abugida_media_preferences",b={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1};function E(){try{const n=localStorage.getItem(m);if(!n)return{...b};const i=JSON.parse(n);return{...b,...i}}catch{return{...b}}}function y(n){try{const e={...E(),...n};return localStorage.setItem(m,JSON.stringify(e)),e}catch{return{...b,...n}}}function L(n){const i=[],e=n.split(/\r?\n/);let t=0;for(;t<e.length&&!e[t].includes("-->");)t++;for(;t<e.length;){const a=e[t].trim();if(a.includes("-->")){const s=a.split("-->").map(r=>r.trim().split(" ")[0]);if(s.length>=2){const r=T(s[0]),p=T(s[1]);t++;const l=[];for(;t<e.length&&e[t].trim()!=="";)l.push(e[t].trim()),t++;l.length>0&&i.push({start:r,end:p,text:l.join(`
`)})}}t++}return i}function T(n){const i=n.split(":");let e=0,t=0,a=0;return i.length===3?(e=parseFloat(i[0]),t=parseFloat(i[1]),a=parseFloat(i[2].replace(",","."))):i.length===2&&(t=parseFloat(i[0]),a=parseFloat(i[1].replace(",","."))),e*3600+t*60+a}function C(n,i){let e="18px";i==="small"&&(e="14px"),i==="large"&&(e="24px"),i==="xlarge"&&(e="32px");let t="#FFFFFF",a="rgba(0, 0, 0, 0.85)",s="none";return n==="yellow-black"?(t="#FFEB3B",a="#000000",s="2px solid #FFEB3B"):n==="white-black"?(t="#FFFFFF",a="#000000",s="2px solid #FFFFFF"):n==="black-yellow"&&(t="#000000",a="#FFEB3B",s="2px solid #000000"),`
    font-size: ${e};
    color: ${t};
    background: ${a};
    border: ${s};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `}class V{constructor(i){c(this,"mainVideo");c(this,"signVideo",null);c(this,"driftThreshold",.25);c(this,"isSyncing",!1);this.mainVideo=i,this.setupMainListeners()}setSignVideo(i){this.signVideo=i,this.signVideo&&(this.signVideo.muted=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,this.signVideo.currentTime=this.mainVideo.currentTime,this.setupSignListeners())}setupMainListeners(){this.mainVideo.addEventListener("play",()=>{this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})}),this.mainVideo.addEventListener("pause",()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()}),this.mainVideo.addEventListener("seeking",()=>{this.signVideo&&(this.signVideo.currentTime=this.mainVideo.currentTime)}),this.mainVideo.addEventListener("ratechange",()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)}),this.mainVideo.addEventListener("timeupdate",()=>{this.checkDrift()})}setupSignListeners(){this.signVideo&&this.signVideo.addEventListener("waiting",()=>{})}checkDrift(){if(!this.signVideo||this.isSyncing)return;Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold&&(this.isSyncing=!0,this.signVideo.currentTime=this.mainVideo.currentTime,setTimeout(()=>{this.isSyncing=!1},50))}async switchSource(i){const e=!this.mainVideo.paused,t=this.mainVideo.currentTime,a=this.mainVideo.playbackRate;return this.mainVideo.src=i,this.mainVideo.load(),new Promise(s=>{const r=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",r),this.mainVideo.currentTime=t,this.mainVideo.playbackRate=a,e)try{await this.mainVideo.play()}catch{}s()};this.mainVideo.addEventListener("loadedmetadata",r)})}}class F{constructor(i,e){c(this,"segments",[]);c(this,"container");c(this,"onSeek");c(this,"currentActiveId",null);c(this,"searchQuery","");this.container=i,this.onSeek=e}setSegments(i){this.segments=i,this.render()}setSearchQuery(i){this.searchQuery=i.toLowerCase().trim(),this.render()}updateActiveTime(i){const e=this.segments.find(t=>i>=t.start&&i<=t.end);e&&e.id!==this.currentActiveId&&(this.currentActiveId=e.id,this.highlightSegment(e.id))}highlightSegment(i){const e=this.container.querySelector(".transcript-item.active");e&&e.classList.remove("active");const t=this.container.querySelector(`[data-segment-id="${i}"]`);t&&t.classList.add("active")}formatTime(i){const e=Math.floor(i/60),t=Math.floor(i%60);return`${e.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}render(){const i=this.searchQuery?this.segments.filter(e=>e.text.toLowerCase().includes(this.searchQuery)):this.segments;if(i.length===0){this.container.innerHTML='<p class="empty-msg">No transcript segments match your search.</p>';return}this.container.innerHTML=`
      <ul class="transcript-list" role="list">
        ${i.map(e=>{const t=this.formatTime(e.start);return`
            <li class="transcript-item ${e.id===this.currentActiveId?"active":""}" data-segment-id="${e.id}">
              <button 
                type="button" 
                class="btn-seek-time" 
                data-time="${e.start}" 
                aria-label="Play from ${t}">
                ${t}
              </button>
              <div class="segment-content">
                ${e.speaker?`<strong class="speaker-label">${e.speaker}:</strong>`:""}
                <span class="segment-text">${this.escapeHtml(e.text)}</span>
                ${e.visualDescription?`<div class="visual-desc" aria-label="Visual Description: ${this.escapeHtml(e.visualDescription)}">
                        <em>[Visual: ${this.escapeHtml(e.visualDescription)}]</em>
                       </div>`:""}
              </div>
            </li>
          `}).join("")}
      </ul>
    `,this.container.querySelectorAll(".btn-seek-time").forEach(e=>{e.addEventListener("click",t=>{const a=parseFloat(t.currentTarget.dataset.time||"0");this.onSeek(a)})})}escapeHtml(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class B extends HTMLElement{constructor(){super();c(this,"shadow");c(this,"manifest",null);c(this,"activeLocale","en");c(this,"prefs");c(this,"mainVideo");c(this,"signVideo",null);c(this,"syncController");c(this,"currentCues",[]);c(this,"captionOverlay");c(this,"transcriptViewer");c(this,"isPreferencesOpen",!1);this.shadow=this.attachShadow({mode:"open"}),this.prefs=E()}static get observedAttributes(){return["manifest-src","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e&&this.loadManifest(e)}attributeChangedCallback(e,t,a){t!==a&&(e==="locale"?(this.activeLocale=a||"en",this.updateLocaleStrings()):e==="manifest-src"&&this.loadManifest(a))}async loadManifest(e){try{const t=await fetch(e);if(!t.ok)throw new Error(`HTTP error ${t.status}`);this.manifest=await t.json(),this.render(),await this.initTracksAndTranscript()}catch(t){this.renderError(t instanceof Error?t.message:"Failed to load manifest")}}async initTracksAndTranscript(){var e;if(this.manifest&&(await this.loadCaptionTrack(this.prefs.captionLanguage),(e=this.manifest.transcript)!=null&&e.src))try{const t=await fetch(this.manifest.transcript.src);if(t.ok){const s=((await t.json()).segments||[]).map(r=>({id:r.id,start:r.start_ms?r.start_ms/1e3:r.start||0,end:r.end_ms?r.end_ms/1e3:r.end||0,speaker:r.speaker,text:r.text||r.draft_text||"",visualDescription:r.visual_description||r.visualDescription}));this.transcriptViewer.setSegments(s)}}catch(t){console.warn("Could not load external transcript file, using fallback cues",t)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const t=this.manifest.captionTracks.find(a=>a.language===e);if(!t){this.currentCues=[],this.updateCaptionDisplay();return}try{const a=await fetch(t.src);if(a.ok){const s=await a.text();this.currentCues=L(s)}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,t=this.currentCues.find(a=>e>=a.start&&e<=a.end);t?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=C(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=t.text):this.captionOverlay.style.display="none"}renderError(e){this.shadow.innerHTML=`
      <style>
        :host { display: block; font-family: system-ui, sans-serif; }
        .error-card {
          padding: 1.5rem;
          background: #ffebee;
          color: #b71c1c;
          border-left: 4px solid #d32f2f;
          border-radius: 4px;
        }
      </style>
      <div class="error-card" role="alert">
        <strong>Error:</strong> ${e}
      </div>
    `}render(){var r,p;const e=this.activeLocale==="am",t=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",a=(r=this.manifest)==null?void 0:r.sources.find(l=>l.kind==="main"),s=(p=this.manifest)==null?void 0:p.sources.find(l=>l.kind==="sign");this.shadow.innerHTML=`
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }
        .player-root {
          background: #000;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
          outline: none;
        }
        .player-root:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 3px;
        }
        .video-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16/9;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        video.main-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        /* Ethiopian Sign Language (ESL) Window */
        .esl-window {
          position: absolute;
          background: #111;
          border: 2px solid #FFF;
          border-radius: 6px;
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6);
          transition: width 0.2s ease, top 0.2s ease, left 0.2s ease, right 0.2s ease, bottom 0.2s ease;
        }
        .esl-window.pos-top-right { top: 16px; right: 16px; bottom: auto; left: auto; }
        .esl-window.pos-top-left { top: 16px; left: 16px; bottom: auto; right: auto; }
        .esl-window.pos-bottom-right { bottom: 65px; right: 16px; top: auto; left: auto; }
        .esl-window.pos-bottom-left { bottom: 65px; left: 16px; top: auto; right: auto; }

        .esl-window.size-small { width: 22%; }
        .esl-window.size-medium { width: 30%; }
        .esl-window.size-large { width: 38%; }

        video.sign-video {
          width: 100%;
          aspect-ratio: 16/9;
          display: block;
          object-fit: cover;
        }

        /* Captions overlay */
        .captions-container {
          position: absolute;
          bottom: 75px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          pointer-events: none;
          z-index: 15;
          padding: 0 1rem;
        }
        .captions-text {
          pointer-events: auto;
        }

        /* Controls Toolbar */
        .controls-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #14201B;
          color: #FFF;
          border-top: 1px solid #2A3B32;
        }
        .btn-ctrl {
          background: #2A3B32;
          color: #FFF;
          border: 1px solid #52615A;
          border-radius: 4px;
          padding: 0.5rem 0.8rem;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        .btn-ctrl:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-ctrl:hover {
          background: var(--color-brand, #0B5D4E);
        }
        .btn-ctrl[aria-pressed="true"] {
          background: var(--color-brand, #0B5D4E);
          border-color: var(--color-accent, #F2C14E);
        }
        .time-readout {
          font-size: 0.875rem;
          font-variant-numeric: tabular-nums;
          padding: 0 0.5rem;
          white-space: nowrap;
        }

        /* Progress Bar */
        .scrubber-container {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        input[type="range"].scrubber {
          flex: 1;
          height: 8px;
          accent-color: var(--color-accent, #F2C14E);
          cursor: pointer;
          min-height: 44px;
        }
        input[type="range"].scrubber:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }

        /* Preferences Modal Dialog */
        .dialog-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          padding: 1rem;
        }
        .dialog-panel {
          background: #FFF;
          color: #14201B;
          padding: 1.5rem;
          border-radius: 8px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        }
        .dialog-panel h3 {
          margin-top: 0;
          color: var(--color-brand, #0B5D4E);
        }
        .form-row {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .form-row label {
          font-weight: bold;
          font-size: 0.9rem;
        }
        select {
          padding: 0.5rem;
          border-radius: 4px;
          border: 1px solid #B7C2BB;
          font-size: 1rem;
          min-height: 44px;
        }

        /* Transcript area */
        .transcript-container {
          margin-top: 1.5rem;
          background: #FFF;
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 8px;
          padding: 1.25rem;
        }
        .transcript-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .search-box {
          padding: 0.5rem 0.75rem;
          border: 1px solid #B7C2BB;
          border-radius: 4px;
          font-size: 0.9rem;
          min-width: 240px;
          min-height: 44px;
        }
        .transcript-list {
          list-style: none;
          margin: 0;
          padding: 0;
          max-height: 380px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .transcript-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem;
          border-radius: 4px;
          border-left: 3px solid transparent;
        }
        .transcript-item.active {
          background: #E8F5E9;
          border-left-color: var(--color-brand, #0B5D4E);
        }
        .btn-seek-time {
          background: #F7F8F5;
          border: 1px solid #B7C2BB;
          color: var(--color-brand, #0B5D4E);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
          cursor: pointer;
          min-height: 44px;
          min-width: 50px;
        }
        .btn-seek-time:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
        }
        .visual-desc {
          font-size: 0.875rem;
          color: #2E7D32;
          background: #E8F5E9;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          margin-top: 0.25rem;
        }
      </style>

      <section class="player-component" aria-label="${t}">
        <div class="player-root" id="player-container" tabindex="0" aria-label="${t} (Press ? for keyboard shortcuts)">
          <div class="video-viewport">
            <video 
              id="main-video" 
              class="main-video" 
              playsinline 
              preload="metadata"
              src="${a?a.src:""}">
            </video>

            <!-- Movable & Resizable ESL Window -->
            <div 
              class="esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}" 
              id="esl-window" 
              style="display: ${this.prefs.eslVisible&&s?"block":"none"};"
              aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ መስኮት":"Ethiopian Sign Language Window"}">
              <video 
                id="sign-video" 
                class="sign-video" 
                muted 
                playsinline 
                preload="metadata"
                src="${s?s.src:""}">
              </video>
            </div>

            <!-- Custom Captions Overlay -->
            <div class="captions-container" aria-hidden="true">
              <div class="captions-text" id="caption-overlay" style="display: none;"></div>
            </div>
          </div>

          <!-- Controls Toolbar -->
          <div class="controls-toolbar" role="toolbar" aria-label="${e?"የቪዲዮ መቆጣጠሪያዎች":"Video player controls"}">
            <div class="scrubber-container">
              <label for="seek-scrubber" class="sr-only">${e?"የቪዲዮ መገኛ አሞሌ":"Seek video position"}</label>
              <input 
                type="range" 
                id="seek-scrubber" 
                class="scrubber" 
                min="0" 
                max="100" 
                value="0" 
                aria-label="${e?"የቪዲዮ መገኛ አሞሌ":"Video timeline position"}">
              <span class="time-readout" id="time-display">00:00 / 00:00</span>
            </div>

            <button class="btn-ctrl" id="btn-play" aria-label="${e?"አጫውት (Space / K)":"Play (Space / K)"}">
              <span id="play-icon" aria-hidden="true">▶</span>
              <span id="play-text">${e?"አጫውት":"Play"}</span>
            </button>

            <button class="btn-ctrl" id="btn-rewind" aria-label="${e?"ወደኋላ 5 ሰከንድ (J)":"Rewind 5 seconds (J)"}">
              ↺ 5s
            </button>

            <button class="btn-ctrl" id="btn-forward" aria-label="${e?"ወደፊት 5 ሰከንድ (L)":"Forward 5 seconds (L)"}">
              ↻ 5s
            </button>

            <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled?"true":"false"}" aria-label="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}">
              AD
            </button>

            <button class="btn-ctrl" id="btn-cc" aria-expanded="false" aria-label="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}">
              CC (${this.prefs.captionLanguage.toUpperCase()})
            </button>

            <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible?"true":"false"}" aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ (S)":"Ethiopian Sign Language (S)"}">
              EthSL
            </button>

            <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
              ⚙ ${e?"ምርጫዎች":"Settings"}
            </button>
          </div>

          <!-- Preferences Modal -->
          <div class="dialog-backdrop" id="prefs-dialog" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="prefs-title">
            <div class="dialog-panel">
              <h3 id="prefs-title">${e?"የተደራሽነት ምርጫዎች":"Accessibility & Caption Settings"}</h3>
              
              <div class="form-row">
                <label for="select-cc-lang">${e?"የትርጉም ጽሑፍ ቋንቋ:":"Caption Language:"}</label>
                <select id="select-cc-lang">
                  <option value="en" ${this.prefs.captionLanguage==="en"?"selected":""}>English (Reviewed)</option>
                  <option value="am" ${this.prefs.captionLanguage==="am"?"selected":""}>አማርኛ (የተገመገመ)</option>
                  <option value="off" ${this.prefs.captionLanguage==="off"?"selected":""}>Off</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-cc-size">${e?"የትርጉም ጽሑፍ መጠን:":"Caption Font Size:"}</label>
                <select id="select-cc-size">
                  <option value="small" ${this.prefs.captionSize==="small"?"selected":""}>Small (14px)</option>
                  <option value="medium" ${this.prefs.captionSize==="medium"?"selected":""}>Medium (18px - Standard)</option>
                  <option value="large" ${this.prefs.captionSize==="large"?"selected":""}>Large (24px)</option>
                  <option value="xlarge" ${this.prefs.captionSize==="xlarge"?"selected":""}>Extra Large (32px)</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-cc-theme">${e?"የንፅፅር ገጽታ:":"Contrast Theme:"}</label>
                <select id="select-cc-theme">
                  <option value="default" ${this.prefs.captionTheme==="default"?"selected":""}>White on Translucent Black</option>
                  <option value="yellow-black" ${this.prefs.captionTheme==="yellow-black"?"selected":""}>High Contrast (Yellow on Black)</option>
                  <option value="white-black" ${this.prefs.captionTheme==="white-black"?"selected":""}>High Contrast (White on Black)</option>
                  <option value="black-yellow" ${this.prefs.captionTheme==="black-yellow"?"selected":""}>High Contrast (Black on Yellow)</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-esl-pos">${e?"የምልክት ቋንቋ አቀማመጥ:":"Sign Language Position:"}</label>
                <select id="select-esl-pos">
                  <option value="bottom-right" ${this.prefs.eslPosition==="bottom-right"?"selected":""}>Bottom Right</option>
                  <option value="bottom-left" ${this.prefs.eslPosition==="bottom-left"?"selected":""}>Bottom Left</option>
                  <option value="top-right" ${this.prefs.eslPosition==="top-right"?"selected":""}>Top Right</option>
                  <option value="top-left" ${this.prefs.eslPosition==="top-left"?"selected":""}>Top Left</option>
                </select>
              </div>

              <div class="form-row">
                <label for="select-esl-size">${e?"የምልክት ቋንቋ መጠን:":"Sign Language Size:"}</label>
                <select id="select-esl-size">
                  <option value="small" ${this.prefs.eslSize==="small"?"selected":""}>Small (22%)</option>
                  <option value="medium" ${this.prefs.eslSize==="medium"?"selected":""}>Medium (30%)</option>
                  <option value="large" ${this.prefs.eslSize==="large"?"selected":""}>Large (38%)</option>
                </select>
              </div>

              <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem;">
                <button class="btn-ctrl" id="btn-close-prefs" style="background: var(--color-brand, #0B5D4E);">
                  ${e?"ተግብር እና ዝጋ":"Save & Close"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Synchronized Transcript Section -->
        <section class="transcript-container" aria-label="${e?"የተመሳሰለ የጽሑፍ ግልባጭ":"Synchronized Interactive Transcript"}">
          <div class="transcript-header">
            <h3 style="margin: 0; color: var(--color-brand, #0B5D4E);">
              ${e?"የትምህርቱ የጽሑፍ ግልባጭ":"Lesson Transcript"}
            </h3>
            <input 
              type="search" 
              id="transcript-search" 
              class="search-box" 
              placeholder="${e?"በጽሑፉ ውስጥ ይፈልጉ...":"Search transcript..."}" 
              aria-label="${e?"በጽሑፉ ውስጥ ይፈልጉ":"Search transcript"}">
          </div>
          <div id="transcript-target"></div>
        </section>
      </section>
    `,this.bindDOMElements(),this.attachEventListeners()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new V(this.mainVideo),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target");this.transcriptViewer=new F(e,t=>{this.mainVideo.currentTime=t})}attachEventListeners(){var A,I,O,N,R,H,J;const e=this.shadow.getElementById("btn-play"),t=this.shadow.getElementById("play-icon"),a=this.shadow.getElementById("play-text"),s=this.shadow.getElementById("seek-scrubber"),r=this.shadow.getElementById("time-display"),p=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",p),this.mainVideo.addEventListener("play",()=>{t&&a&&(t.textContent="⏸",a.textContent=this.activeLocale==="am"?"አቁም":"Pause"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space)":"Pause (Space)")}),this.mainVideo.addEventListener("pause",()=>{t&&a&&(t.textContent="▶",a.textContent=this.activeLocale==="am"?"አጫውት":"Play"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space)":"Play (Space)")}),this.mainVideo.addEventListener("timeupdate",()=>{const o=this.mainVideo.currentTime,w=this.mainVideo.duration||1;s&&!s.matches(":active")&&(s.value=(o/w*100).toFixed(1)),r&&(r.textContent=`${this.formatTime(o)} / ${this.formatTime(w)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(o)}),s.addEventListener("input",()=>{const o=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(s.value)/100*o}),(A=this.shadow.getElementById("btn-rewind"))==null||A.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(I=this.shadow.getElementById("btn-forward"))==null||I.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const l=this.shadow.getElementById("btn-ad");l==null||l.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,y({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),l.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const o=this.prefs.audioDescriptionEnabled?"described":"main",w=this.manifest.sources.find($=>$.kind===o)||this.manifest.sources.find($=>$.kind==="main");w&&await this.syncController.switchSource(w.src)});const h=this.shadow.getElementById("btn-cc");h==null||h.addEventListener("click",async()=>{const o=["en","am","off"],w=(o.indexOf(this.prefs.captionLanguage)+1)%o.length;this.prefs.captionLanguage=o[w],y({captionLanguage:this.prefs.captionLanguage}),h.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`,await this.loadCaptionTrack(this.prefs.captionLanguage)});const u=this.shadow.getElementById("btn-esl"),g=this.shadow.getElementById("esl-window");u==null||u.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,y({eslVisible:this.prefs.eslVisible}),u.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),g&&(g.style.display=this.prefs.eslVisible?"block":"none")});const f=this.shadow.getElementById("btn-prefs"),v=this.shadow.getElementById("prefs-dialog"),x=this.shadow.getElementById("btn-close-prefs");f==null||f.addEventListener("click",()=>{var o;this.isPreferencesOpen=!0,v&&(v.style.display="flex"),(o=this.shadow.getElementById("select-cc-lang"))==null||o.focus()}),x==null||x.addEventListener("click",()=>{this.isPreferencesOpen=!1,v&&(v.style.display="none"),f==null||f.focus()}),(O=this.shadow.getElementById("select-cc-lang"))==null||O.addEventListener("change",async o=>{this.prefs.captionLanguage=o.target.value,y({captionLanguage:this.prefs.captionLanguage}),h&&(h.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`),await this.loadCaptionTrack(this.prefs.captionLanguage)}),(N=this.shadow.getElementById("select-cc-size"))==null||N.addEventListener("change",o=>{this.prefs.captionSize=o.target.value,y({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(R=this.shadow.getElementById("select-cc-theme"))==null||R.addEventListener("change",o=>{this.prefs.captionTheme=o.target.value,y({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()}),(H=this.shadow.getElementById("select-esl-pos"))==null||H.addEventListener("change",o=>{this.prefs.eslPosition=o.target.value,y({eslPosition:this.prefs.eslPosition}),g&&(g.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)}),(J=this.shadow.getElementById("select-esl-size"))==null||J.addEventListener("change",o=>{this.prefs.eslSize=o.target.value,y({eslSize:this.prefs.eslSize}),g&&(g.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)});const k=this.shadow.getElementById("transcript-search");k==null||k.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(k.value)});const S=this.shadow.getElementById("player-container");S==null||S.addEventListener("keydown",o=>{if(this.isPreferencesOpen){o.key==="Escape"&&(this.isPreferencesOpen=!1,v&&(v.style.display="none"),f==null||f.focus());return}if(!(o.target.tagName==="INPUT"||o.target.tagName==="SELECT"))switch(o.key){case" ":case"k":case"K":o.preventDefault(),p();break;case"j":case"J":case"ArrowLeft":o.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":o.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":o.preventDefault(),this.mainVideo.muted=!this.mainVideo.muted;break;case"c":case"C":o.preventDefault(),h==null||h.click();break;case"s":case"S":o.preventDefault(),u==null||u.click();break;case"d":case"D":o.preventDefault(),l==null||l.click();break;case"+":case"=":o.preventDefault(),this.cycleESLSize(1);break;case"-":case"_":o.preventDefault(),this.cycleESLSize(-1);break}})}cycleESLSize(e){const t=["small","medium","large"];let a=t.indexOf(this.prefs.eslSize)+e;a<0&&(a=0),a>=t.length&&(a=t.length-1),this.prefs.eslSize=t[a],y({eslSize:this.prefs.eslSize});const s=this.shadow.getElementById("esl-window");s&&(s.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)}updateLocaleStrings(){this.render(),this.initTracksAndTranscript()}formatTime(e){const t=Math.floor(e/60),a=Math.floor(e%60);return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`}}customElements.get("a11y-media-player")||customElements.define("a11y-media-player",B);const D=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function j(n){const i=typeof n=="string"?new Date(n):n,e=i.getUTCFullYear(),t=i.getUTCMonth()+1,a=i.getUTCDate(),s=Math.floor((14-t)/12),r=e+4800-s,p=t+12*s-3,l=a+Math.floor((153*p+2)/5)+365*r+Math.floor(r/4)-Math.floor(r/100)+Math.floor(r/400)-32045,h=(l-1723856)%1461,u=h%365+365*Math.floor(h/1460),g=4*Math.floor((l-1723856)/1461)+Math.floor(h/365)-Math.floor(h/1460),f=Math.floor(u/30)+1,v=u%30+1,x=D[Math.min(f-1,12)];return{year:g,month:f,day:v,monthNameAmharic:x}}function P(n){const i=j(n),e=`${i.monthNameAmharic} ${i.day}፣ ${i.year} ዓ.ም`;return{iso:n,ethiopic:e,display:`${n} (${e})`}}class z extends HTMLElement{constructor(){super();c(this,"shadow");c(this,"job",null);c(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,t,a){if(t!==a){if(e==="locale")this.activeLocale=a||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(a),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",t=this.job.title[this.activeLocale]||this.job.title.en,a=this.job.location[this.activeLocale]||this.job.location.en,s=this.job.description[this.activeLocale]||this.job.description.en,r=this.job.applicationDeadline?P(this.job.applicationDeadline):null,p={"@context":"https://schema.org/","@type":"JobPosting",title:t,description:s,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:a,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }
        /* 200% Zoom and Narrow Reflow */
        article.card {
          background: var(--color-surface, #FFFFFF);
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-sizing: border-box;
          width: 100%;
          overflow-wrap: break-word;
          word-break: break-word;
        }
        header h4 {
          margin: 0 0 0.5rem 0;
          font-size: clamp(1.15rem, 2.5vw, 1.45rem);
          color: var(--color-brand, #0B5D4E);
          line-height: 1.3;
        }
        .meta-line {
          font-size: 0.95rem;
          color: var(--color-muted-ink, #52615A);
          margin-bottom: 1.25rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          align-items: center;
        }
        .audio-summary-block {
          background: #F7F8F5;
          border: 1px solid #B7C2BB;
          padding: 1rem;
          border-radius: 6px;
          margin: 1.25rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        audio {
          width: 100%;
          min-height: 48px;
        }
        .text-summary-box {
          font-size: 0.9rem;
          color: #333;
          background: #FFF;
          padding: 0.75rem;
          border-left: 3px solid var(--color-brand, #0B5D4E);
          border-radius: 4px;
        }
        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
          list-style: none;
          padding: 0;
          margin: 0.75rem 0 1.25rem 0;
        }
        .badge {
          background: #E8F5E9;
          color: #1B5E20;
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.875rem;
          border: 1px solid #A5D6A7;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .badge.accommodation {
          background: #E3F2FD;
          color: #0D47A1;
          border-color: #90CAF9;
        }
        .badge.calendar {
          background: #FFF3E0;
          color: #E65100;
          border-color: #FFE0B2;
        }
        .action-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 1.5rem;
        }
        .btn-apply {
          background: var(--color-brand, #0B5D4E);
          color: #FFF;
          text-decoration: none;
          padding: 0.7rem 1.4rem;
          border-radius: 4px;
          font-weight: bold;
          font-size: 1rem;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-apply:hover {
          background: var(--color-brand-hover, #08483D);
        }
        .btn-apply:focus-visible,
        .btn-secondary:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 2px;
        }
        .btn-secondary {
          background: #FFF;
          color: var(--color-brand, #0B5D4E);
          border: 1px solid var(--color-brand, #0B5D4E);
          padding: 0.7rem 1.2rem;
          border-radius: 4px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .share-feedback {
          font-size: 0.875rem;
          color: #1B5E20;
          font-weight: bold;
        }
      </style>

      <!-- schema.org/JobPosting JSON-LD -->
      <script type="application/ld+json">
        ${JSON.stringify(p)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${t}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${a}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${r?` &bull; <span class="badge calendar" aria-label="Deadline: ${r.display}">📅 ${e?"የማመልከቻ ማብቂያ፦":"Deadline:"} ${r.display}</span>`:""}
          </div>
        </header>

        <!-- Prerecorded Audio Summary with Accessible Controls -->
        <section class="audio-summary-block" aria-label="${e?"የሥራው አጭር የድምጽ ማጠቃለያ":"Prerecorded Audio Job Summary"}">
          <label for="audio-ctrl-${this.job.id}" style="font-weight: bold;">
            🎧 ${e?"የሥራው ማጠቃለያ በድምጽ ያዳምጡ (Audio Summary):":"Listen to Audio Job Summary:"}
          </label>
          <audio id="audio-ctrl-${this.job.id}" controls preload="none">
            <source src="${this.job.audioSummary.src}" type="${this.job.audioSummary.type}">
            ${e?"አሳሽዎ ድምጽ አያጫውትም":"Your browser does not support audio playback"}
          </audio>
          <div class="text-summary-box" aria-label="${e?"የድምጹ አቻ ጽሑፍ":"Equivalent text of audio summary"}">
            <strong>${e?"የድምጽ አቻ ጽሑፍ:":"Transcript of Summary:"}</strong>
            ${this.job.audioSummary.textEquivalent}
          </div>
        </section>

        <p>${s}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e?"የተረጋገጡ ማመቻቸቶች (Accommodations Offered):":"Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(l=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${l.label[this.activeLocale]||l.label.en}</span>
                <small style="opacity: 0.85;">(${l.source})</small>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- Action Row -->
        <footer class="action-row">
          <a href="${this.job.applicationUrl}" class="btn-apply" target="_blank" rel="noopener">
            ${e?"ለዚህ ሥራ ያመልክቱ":"Apply on Job Portal"}
          </a>

          <button type="button" class="btn-secondary" id="btn-share-cert">
            🔗 ${e?"የምስክር ወረቀት አገናኝ ያጋሩ":"Share Verified Certificate Link"}
          </button>

          <span class="share-feedback" id="share-feedback" aria-live="polite"></span>
        </footer>
      </article>
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),t=this.shadow.getElementById("share-feedback");!e||!t||e.addEventListener("click",async()=>{const a=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:a}),t.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(a),t.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{t.textContent=a}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",z);const _="abugida-media",U=1;class M{constructor(){c(this,"db",null);c(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((i,e)=>{const t=indexedDB.open(_,U);t.onupgradeneeded=a=>{const s=a.target.result;s.objectStoreNames.contains("preferences")||s.createObjectStore("preferences"),s.objectStoreNames.contains("progress")||s.createObjectStore("progress",{keyPath:"lessonId"}),s.objectStoreNames.contains("packages")||s.createObjectStore("packages",{keyPath:"packageKey"})},t.onsuccess=a=>{this.db=a.target.result,i()},t.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),i()}})}async saveProgress(i){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${i.lessonId}`,JSON.stringify(i))}catch{}return}return new Promise(e=>{const t=this.db.transaction("progress","readwrite");t.objectStore("progress").put(i),t.oncomplete=()=>e(),t.onerror=()=>e()})}async getProgress(i){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${i}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const s=this.db.transaction("progress","readonly").objectStore("progress").get(i);s.onsuccess=()=>e(s.result||null),s.onerror=()=>e(null)})}async downloadPackage(i,e,t,a,s){await this.init();const r=`${i}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const p=await caches.open(this.cacheName);let l=0;const h=a.length;for(const u of a){const g=await fetch(u);if(!g.ok)throw new Error(`Failed to fetch asset: ${u} (${g.status})`);await p.put(u,g.clone()),l++;const f=Math.round(l/h*100);s(f,l,h)}return await this.savePackageRecord({packageKey:r,lessonId:i,packageId:e,packageName:t,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(p){throw await this.savePackageRecord({packageKey:r,lessonId:i,packageId:e,packageName:t,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:p instanceof Error?p.message:"Download failed"}),p}}async isPackageReady(i,e){await this.init();const t=`${i}:${e}`,a=await this.getPackageRecord(t);return(a==null?void 0:a.status)==="ready"}async savePackageRecord(i){if(this.db)return new Promise(e=>{const t=this.db.transaction("packages","readwrite");t.objectStore("packages").put(i),t.oncomplete=()=>e(),t.onerror=()=>e()})}async getPackageRecord(i){return this.db?new Promise(e=>{const s=this.db.transaction("packages","readonly").objectStore("packages").get(i);s.onsuccess=()=>e(s.result||null),s.onerror=()=>e(null)}):null}}const q=new M;d.A11yJobCard=z,d.A11yMediaPlayer=B,d.DEFAULT_PREFERENCES=b,d.ETHIOPIC_MONTHS=D,d.MediaSyncController=V,d.OfflineStorageManager=M,d.TranscriptViewer=F,d.formatDualDate=P,d.getThemeStyles=C,d.loadPreferences=E,d.offlineStorage=q,d.parseVTT=L,d.savePreferences=y,d.toEthiopianDate=j,Object.defineProperty(d,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
