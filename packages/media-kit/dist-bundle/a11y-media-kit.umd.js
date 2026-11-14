(function(p,f){typeof exports=="object"&&typeof module<"u"?f(exports):typeof define=="function"&&define.amd?define(["exports"],f):(p=typeof globalThis<"u"?globalThis:p||self,f(p.AbugidaMediaKit={}))})(this,function(p){"use strict";var Y=Object.defineProperty;var Q=(p,f,y)=>f in p?Y(p,f,{enumerable:!0,configurable:!0,writable:!0,value:y}):p[f]=y;var r=(p,f,y)=>Q(p,typeof f!="symbol"?f+"":f,y);const f="abugida_media_preferences",y={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1};function L(){try{const h=localStorage.getItem(f);if(!h)return{...y};const s=JSON.parse(h);return{...y,...s}}catch{return{...y}}}function v(h){try{const e={...L(),...h};return localStorage.setItem(f,JSON.stringify(e)),e}catch{return{...y,...h}}}function V(){try{localStorage.removeItem(f)}catch{}return{...y}}function T(h){const s=[],e=h.split(/\r?\n/);let t=0;for(;t<e.length&&!e[t].includes("-->");)t++;for(;t<e.length;){const i=e[t].trim();if(i.includes("-->")){const a=i.split("-->").map(n=>n.trim().split(" ")[0]);if(a.length>=2){const n=B(a[0]),l=B(a[1]);t++;const d=[];for(;t<e.length&&e[t].trim()!=="";)d.push(e[t].trim()),t++;d.length>0&&s.push({start:n,end:l,text:d.join(`
`)})}}t++}return s}function B(h){const s=h.split(":");let e=0,t=0,i=0;return s.length===3?(e=parseFloat(s[0]),t=parseFloat(s[1]),i=parseFloat(s[2].replace(",","."))):s.length===2&&(t=parseFloat(s[0]),i=parseFloat(s[1].replace(",","."))),e*3600+t*60+i}function D(h,s){let e="18px";s==="small"&&(e="14px"),s==="large"&&(e="24px"),s==="xlarge"&&(e="32px");let t="#FFFFFF",i="rgba(0, 0, 0, 0.85)",a="none";return h==="yellow-black"?(t="#FFEB3B",i="#000000",a="2px solid #FFEB3B"):h==="white-black"?(t="#FFFFFF",i="#000000",a="2px solid #FFFFFF"):h==="black-yellow"&&(t="#000000",i="#FFEB3B",a="2px solid #000000"),`
    font-size: ${e};
    color: ${t};
    background: ${i};
    border: ${a};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `}class P{constructor(s,e){r(this,"mainVideo");r(this,"signVideo",null);r(this,"driftThreshold");r(this,"isSyncing",!1);r(this,"onSignStatusChange");r(this,"mainListeners",{});r(this,"signListeners",{});this.mainVideo=s,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(s){if(this.cleanupSignListeners(),this.signVideo=s,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(s){this.onSignStatusChange&&this.onSignStatusChange(s)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(s,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[s,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(s,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(s){const e=!this.mainVideo.paused,t=this.mainVideo.currentTime,i=this.mainVideo.playbackRate;return this.mainVideo.src=s,this.mainVideo.load(),new Promise(a=>{const n=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",n),this.mainVideo.currentTime=t,this.mainVideo.playbackRate=i,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=t}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}a()};this.mainVideo.addEventListener("loadedmetadata",n)})}cleanupSignListeners(){if(this.signVideo)for(const[s,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(s,e);this.signListeners={}}destroy(){for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(s,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class A{constructor(s,e){r(this,"segments",[]);r(this,"container");r(this,"onSeekAndPlay");r(this,"currentActiveId",null);r(this,"searchQuery","");r(this,"isFollowing",!0);r(this,"userPausedFollowing",!1);r(this,"locale","en");r(this,"listElement",null);r(this,"followBtn",null);r(this,"statusElement",null);this.container=s,this.onSeekAndPlay=e.onSeekAndPlay,this.locale=e.locale||"en"}setLocale(s){this.locale!==s&&(this.locale=s,this.render())}setSegments(s){this.segments=s.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,t)=>e.start-t.start),this.render()}setSearchQuery(s){this.searchQuery=s.toLowerCase().trim(),this.render()}getActiveSegment(s){return this.segments.length&&this.segments.find(e=>s>=e.start&&s<e.end)||null}updateActiveTime(s){const e=this.getActiveSegment(s),t=e?e.id:null;t!==this.currentActiveId&&(this.currentActiveId=t,this.highlightSegment(t),this.isFollowing&&t!==null&&this.scrollToActiveCue(t))}highlightSegment(s){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),s!==null){const t=this.container.querySelector(`[data-segment-id="${s}"]`);t&&t.classList.add("active")}}scrollToActiveCue(s){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${s}"]`);if(!e)return;this.listElement.scrollTop;const t=this.listElement.clientHeight,i=e.offsetTop,a=e.clientHeight,n=i-t/2+a/2;this.listElement.scrollTo({top:Math.max(0,n),behavior:"smooth"})}setFollowingState(s,e=!1){if(this.isFollowing=s,e&&(this.userPausedFollowing=!s),this.followBtn){this.followBtn.setAttribute("aria-pressed",s?"true":"false");const t=this.locale==="am";s?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}s&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(s){const e=Math.floor(s/60),t=Math.floor(s%60);return`${e.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}render(){var t;const s=this.locale==="am",e=this.searchQuery?this.segments.filter(i=>i.text.toLowerCase().includes(this.searchQuery)||i.speaker&&i.speaker.toLowerCase().includes(this.searchQuery)||i.visualDescription&&i.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing?"active":""}" 
          aria-pressed="${this.isFollowing?"true":"false"}"
          aria-label="${this.isFollowing?s?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)":s?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"}">
          ${this.isFollowing?s?"✓ በተከታታይ አንብብ":"✓ Follow Playback":s?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following"}
        </button>
      </div>

      ${e.length===0?`<p class="empty-msg" role="status">
              ${s?"ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።":"No transcript segments match your search."}
            </p>`:`
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${s?"የጽሑፍ ግልባጭ ዝርዝር":"Transcript cues"}">
            ${e.map(i=>{const a=this.formatTime(i.start),n=i.id===this.currentActiveId,l=s?`ከ ${a} ጀምሮ አጫውት`:`Play from ${a}`;return`
                <li class="transcript-item ${n?"active":""}" data-segment-id="${i.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${i.start}" 
                    aria-label="${l}">
                    ${a}
                  </button>
                  <div class="segment-content">
                    ${i.speaker?`<strong class="speaker-label">${this.escapeHtml(i.speaker)}:</strong>`:""}
                    <span class="segment-text">${this.escapeHtml(i.text)}</span>
                    ${i.visualDescription?`<div class="visual-desc" aria-label="${s?"ምስላዊ ማብራሪያ":"Visual Description"}: ${this.escapeHtml(i.visualDescription)}">
                            <em>[${s?"ምስላዊ":"Visual"}: ${this.escapeHtml(i.visualDescription)}]</em>
                           </div>`:""}
                  </div>
                </li>
              `}).join("")}
          </ul>
        `}
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(t=this.followBtn)==null||t.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const i=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",i,{passive:!0}),this.listElement.addEventListener("touchmove",i,{passive:!0}),this.listElement.addEventListener("keydown",a=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(a.key)&&i()})}this.container.querySelectorAll(".btn-seek-time").forEach(i=>{i.addEventListener("click",a=>{const n=parseFloat(a.currentTarget.dataset.time||"0");this.onSeekAndPlay(n),a.currentTarget.focus()})})}escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class j extends HTMLElement{constructor(){super();r(this,"shadow");r(this,"manifest",null);r(this,"activeLocale","en");r(this,"prefs");r(this,"mainVideo");r(this,"signVideo",null);r(this,"syncController");r(this,"pendingSeekTime",null);r(this,"currentCues",[]);r(this,"captionOverlay");r(this,"transcriptViewer");r(this,"isPreferencesOpen",!1);this.shadow=this.attachShadow({mode:"open"}),this.prefs=L()}static get observedAttributes(){return["manifest-src","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e&&this.loadManifest(e)}disconnectedCallback(){this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,t,i){t!==i&&(e==="locale"?(this.activeLocale=i||"en",this.updateLocaleStrings()):e==="manifest-src"&&this.loadManifest(i))}async loadManifest(e){try{const t=await fetch(e);if(!t.ok)throw new Error(`HTTP error ${t.status}`);const i=await t.json();let a;try{a=new URL(e,window.location.href)}catch{a=new URL(window.location.href)}const n=l=>{if(!l)return l;try{return new URL(l,a).href}catch{return l}};this.manifest={...i,poster:i.poster?{...i.poster,src:n(i.poster.src)}:void 0,sources:(i.sources||[]).map(l=>({...l,src:n(l.src)})),captionTracks:(i.captionTracks||[]).map(l=>({...l,src:n(l.src)})),transcript:i.transcript?{...i.transcript,src:n(i.transcript.src)}:i.transcript},this.render(),await this.initTracksAndTranscript()}catch(t){this.renderError(t instanceof Error?t.message:"Failed to load manifest")}}async initTracksAndTranscript(){var e;if(this.manifest&&(await this.loadCaptionTrack(this.prefs.captionLanguage),(e=this.manifest.transcript)!=null&&e.src))try{const t=await fetch(this.manifest.transcript.src);if(t.ok){const a=((await t.json()).segments||[]).map(n=>({id:n.id,start:n.start_ms!==void 0?n.start_ms/1e3:n.start||0,end:n.end_ms!==void 0?n.end_ms/1e3:n.end||0,speaker:n.speaker,text:n.text||n.draft_text||"",visualDescription:n.visual_description||n.visualDescription}));this.transcriptViewer.setSegments(a)}}catch(t){console.warn("Could not load external transcript file, using fallback cues",t)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const t=this.manifest.captionTracks.find(i=>i.language===e);if(!t){this.currentCues=[],this.updateCaptionDisplay();return}try{const i=await fetch(t.src);if(i.ok){const a=await i.text();this.currentCues=T(a)}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,t=this.currentCues.find(i=>e>=i.start&&e<=i.end);t?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=D(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=t.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const t=()=>{this.mainVideo.removeEventListener("loadedmetadata",t),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",t);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(t=>{console.warn("Playback interrupted or prevented on seek:",t)})}renderError(e){this.shadow.innerHTML=`
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
    `}render(){var n,l,d,u;const e=this.activeLocale==="am",t=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",i=(n=this.manifest)==null?void 0:n.sources.find(m=>m.kind==="main"),a=(l=this.manifest)==null?void 0:l.sources.find(m=>m.kind==="sign");this.shadow.innerHTML=`
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

        /* Ethiopian Sign Language (EthSL) Window */
        .esl-window {
          position: absolute;
          background: #111;
          border: 2px solid #FFF;
          border-radius: 6px;
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 4px 14px rgba(0,0,0,0.6);
          touch-action: none;
          transition: width 0.2s ease, top 0.2s ease, left 0.2s ease, right 0.2s ease, bottom 0.2s ease;
        }
        .esl-window.pos-top-right { top: 16px; right: 16px; bottom: auto; left: auto; }
        .esl-window.pos-top-left { top: 16px; left: 16px; bottom: auto; right: auto; }
        .esl-window.pos-bottom-right { bottom: 65px; right: 16px; top: auto; left: auto; }
        .esl-window.pos-bottom-left { bottom: 65px; left: 16px; top: auto; right: auto; }

        .esl-window.size-small { width: 22%; }
        .esl-window.size-medium { width: 30%; }
        .esl-window.size-large { width: 38%; }

        .esl-drag-bar {
          background: #1F2937;
          color: #F9FAFB;
          font-size: 0.75rem;
          padding: 3px 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
          border-bottom: 1px solid rgba(255,255,255,0.2);
        }
        .esl-drag-bar:focus-visible {
          outline: 2px solid var(--color-focus, #005FCC);
        }

        video.sign-video {
          width: 100%;
          aspect-ratio: 16/9;
          display: block;
          object-fit: cover;
        }

        /* Status Badge for Secondary Sign Stream */
        .sign-status-pill {
          display: none;
          position: absolute;
          top: 8px;
          left: 8px;
          background: rgba(0,0,0,0.75);
          color: #FFF;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: 4px;
          z-index: 25;
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
        .transcript-controls-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.75rem;
        }
        .btn-follow {
          background: #F1F5F9;
          border: 1px solid var(--color-border, #B7C2BB);
          border-radius: 4px;
          padding: 0.4rem 0.9rem;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--color-ink, #14201B);
          cursor: pointer;
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          transition: background 0.15s ease, border-color 0.15s ease;
        }
        .btn-follow:hover {
          background: #E2E8F0;
        }
        .btn-follow[aria-pressed="true"] {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #166534;
        }
        .btn-follow:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 2px;
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

        /* 200% Zoom & Narrow Screen Reflow */
        @media (max-width: 640px) {
          .esl-window {
            position: static !important;
            width: 100% !important;
            max-width: 320px;
            margin: 1rem auto 0 auto;
            border: 2px solid var(--color-border);
            box-shadow: none;
          }
          .esl-drag-bar {
            display: none !important;
          }
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
              poster="${((u=(d=this.manifest)==null?void 0:d.poster)==null?void 0:u.src)||""}"
              src="${i?i.src:""}">
            </video>

            <!-- Movable & Resizable EthSL Window -->
            <div 
              class="esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}" 
              id="esl-window" 
              style="display: ${this.prefs.eslVisible&&a?"block":"none"};"
              aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ መስኮት":"Ethiopian Sign Language Window"}">
              <div class="esl-drag-bar" id="esl-drag-handle" tabindex="0" role="button" aria-label="${e?"የምልክት ቋንቋ መስኮት መጎተቻ":"Sign language window drag handle"}">
                <span>EthSL</span>
                <span aria-hidden="true">✥</span>
              </div>
              <video 
                id="sign-video" 
                class="sign-video" 
                muted 
                playsinline 
                preload="metadata"
                src="${a?a.src:""}">
              </video>
              <div class="sign-status-pill" id="sign-status-indicator" role="status"></div>
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

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
                <button type="button" class="btn-ctrl" id="btn-reset-layout" style="background: #475569;">
                  ↺ ${e?"አቀማመጥን ዳግም አስጀምር":"Reset Layout"}
                </button>
                <button type="button" class="btn-ctrl" id="btn-close-prefs" style="background: var(--color-brand, #0B5D4E);">
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
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupESLDrag()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new P(this.mainVideo,{driftThreshold:.25,onSignStatusChange:t=>{const i=this.shadow.getElementById("sign-status-indicator");i&&(t==="loading"?(i.style.display="inline-block",i.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):t==="error"?(i.style.display="inline-block",i.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",i.style.background="#FEF2F2",i.style.color="#991B1B"):i.style.display="none")}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target");this.transcriptViewer=new A(e,{locale:this.activeLocale,onSeekAndPlay:t=>{this.seekAndPlay(t)}})}setupESLDrag(){const e=this.shadow.getElementById("esl-window"),t=this.shadow.getElementById("esl-drag-handle"),i=this.shadow.querySelector(".video-viewport");if(!e||!t||!i)return;let a=!1,n=0,l=0,d=0,u=0;t.addEventListener("pointerdown",c=>{a=!0,t.setPointerCapture(c.pointerId),n=c.clientX,l=c.clientY;const g=e.getBoundingClientRect(),b=i.getBoundingClientRect();d=g.left-b.left,u=g.top-b.top,e.style.left=`${d}px`,e.style.top=`${u}px`,e.style.right="auto",e.style.bottom="auto",c.preventDefault()}),t.addEventListener("pointermove",c=>{if(!a)return;const g=c.clientX-n,b=c.clientY-l,x=i.getBoundingClientRect(),S=e.getBoundingClientRect(),k=Math.max(0,x.width-S.width),E=Math.max(0,x.height-S.height),$=Math.min(Math.max(0,d+g),k),C=Math.min(Math.max(0,u+b),E);e.style.left=`${$}px`,e.style.top=`${C}px`});const m=c=>{if(a){a=!1;try{t.releasePointerCapture(c.pointerId)}catch{}}};t.addEventListener("pointerup",m),t.addEventListener("pointercancel",m)}attachEventListeners(){var $,C,R,H,U,J,_;const e=this.shadow.getElementById("btn-play"),t=this.shadow.getElementById("play-icon"),i=this.shadow.getElementById("play-text"),a=this.shadow.getElementById("seek-scrubber"),n=this.shadow.getElementById("time-display"),l=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",l),this.mainVideo.addEventListener("play",()=>{t&&i&&(t.textContent="⏸",i.textContent=this.activeLocale==="am"?"አቁም":"Pause"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space)":"Pause (Space)")}),this.mainVideo.addEventListener("pause",()=>{t&&i&&(t.textContent="▶",i.textContent=this.activeLocale==="am"?"አጫውት":"Play"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space)":"Play (Space)")}),this.mainVideo.addEventListener("timeupdate",()=>{const o=this.mainVideo.currentTime,w=this.mainVideo.duration||1;a&&!a.matches(":active")&&(a.value=(o/w*100).toFixed(1)),n&&(n.textContent=`${this.formatTime(o)} / ${this.formatTime(w)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(o)}),a.addEventListener("input",()=>{const o=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(a.value)/100*o}),($=this.shadow.getElementById("btn-rewind"))==null||$.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(C=this.shadow.getElementById("btn-forward"))==null||C.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const d=this.shadow.getElementById("btn-ad");d==null||d.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,v({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),d.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const o=this.prefs.audioDescriptionEnabled?"described":"main",w=this.manifest.sources.find(F=>F.kind===o)||this.manifest.sources.find(F=>F.kind==="main");w&&await this.syncController.switchSource(w.src)});const u=this.shadow.getElementById("btn-cc");u==null||u.addEventListener("click",async()=>{const o=["en","am","off"],w=(o.indexOf(this.prefs.captionLanguage)+1)%o.length;this.prefs.captionLanguage=o[w],v({captionLanguage:this.prefs.captionLanguage}),u.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`,await this.loadCaptionTrack(this.prefs.captionLanguage)});const m=this.shadow.getElementById("btn-esl"),c=this.shadow.getElementById("esl-window");m==null||m.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,v({eslVisible:this.prefs.eslVisible}),m.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),c&&(c.style.display=this.prefs.eslVisible?"block":"none")});const g=this.shadow.getElementById("btn-prefs"),b=this.shadow.getElementById("prefs-dialog"),x=this.shadow.getElementById("btn-close-prefs"),S=this.shadow.getElementById("btn-reset-layout");g==null||g.addEventListener("click",()=>{var o;this.isPreferencesOpen=!0,b&&(b.style.display="flex"),(o=this.shadow.getElementById("select-cc-lang"))==null||o.focus()}),x==null||x.addEventListener("click",()=>{this.isPreferencesOpen=!1,b&&(b.style.display="none"),g==null||g.focus()}),S==null||S.addEventListener("click",()=>{V(),this.prefs=L(),c&&(c.style.left="",c.style.top="",c.style.right="",c.style.bottom="",c.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`);const o=this.shadow.getElementById("select-esl-pos"),w=this.shadow.getElementById("select-esl-size");o&&(o.value=this.prefs.eslPosition),w&&(w.value=this.prefs.eslSize)}),(R=this.shadow.getElementById("select-cc-lang"))==null||R.addEventListener("change",async o=>{this.prefs.captionLanguage=o.target.value,v({captionLanguage:this.prefs.captionLanguage}),u&&(u.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`),await this.loadCaptionTrack(this.prefs.captionLanguage)}),(H=this.shadow.getElementById("select-cc-size"))==null||H.addEventListener("change",o=>{this.prefs.captionSize=o.target.value,v({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(U=this.shadow.getElementById("select-cc-theme"))==null||U.addEventListener("change",o=>{this.prefs.captionTheme=o.target.value,v({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()}),(J=this.shadow.getElementById("select-esl-pos"))==null||J.addEventListener("change",o=>{this.prefs.eslPosition=o.target.value,v({eslPosition:this.prefs.eslPosition}),c&&(c.style.left="",c.style.top="",c.style.right="",c.style.bottom="",c.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)}),(_=this.shadow.getElementById("select-esl-size"))==null||_.addEventListener("change",o=>{this.prefs.eslSize=o.target.value,v({eslSize:this.prefs.eslSize}),c&&(c.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)});const k=this.shadow.getElementById("transcript-search");k==null||k.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(k.value)});const E=this.shadow.getElementById("player-container");E==null||E.addEventListener("keydown",o=>{if(this.isPreferencesOpen){o.key==="Escape"&&(this.isPreferencesOpen=!1,b&&(b.style.display="none"),g==null||g.focus());return}if(!(o.target.tagName==="INPUT"||o.target.tagName==="SELECT"))switch(o.key){case" ":case"k":case"K":o.preventDefault(),l();break;case"j":case"J":case"ArrowLeft":o.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":o.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":o.preventDefault(),this.mainVideo.muted=!this.mainVideo.muted;break;case"c":case"C":o.preventDefault(),u==null||u.click();break;case"s":case"S":o.preventDefault(),m==null||m.click();break;case"d":case"D":o.preventDefault(),d==null||d.click();break;case"+":case"=":o.preventDefault(),this.cycleESLSize(1);break;case"-":case"_":o.preventDefault(),this.cycleESLSize(-1);break}})}cycleESLSize(e){const t=["small","medium","large"];let i=t.indexOf(this.prefs.eslSize)+e;i<0&&(i=0),i>=t.length&&(i=t.length-1),this.prefs.eslSize=t[i],v({eslSize:this.prefs.eslSize});const a=this.shadow.getElementById("esl-window");a&&(a.className=`esl-window pos-${this.prefs.eslPosition} size-${this.prefs.eslSize}`)}updateLocaleStrings(){this.render(),this.initTracksAndTranscript()}formatTime(e){const t=Math.floor(e/60),i=Math.floor(e%60);return`${t.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}}customElements.get("a11y-media-player")||customElements.define("a11y-media-player",j);const z=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function M(h){const s=typeof h=="string"?new Date(h):h,e=s.getUTCFullYear(),t=s.getUTCMonth()+1,i=s.getUTCDate(),a=Math.floor((14-t)/12),n=e+4800-a,l=t+12*a-3,d=i+Math.floor((153*l+2)/5)+365*n+Math.floor(n/4)-Math.floor(n/100)+Math.floor(n/400)-32045,u=(d-1723856)%1461,m=u%365+365*Math.floor(u/1460),c=4*Math.floor((d-1723856)/1461)+Math.floor(u/365)-Math.floor(u/1460),g=Math.floor(m/30)+1,b=m%30+1,x=z[Math.min(g-1,12)];return{year:c,month:g,day:b,monthNameAmharic:x}}function I(h){const s=M(h),e=`${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;return{iso:h,ethiopic:e,display:`${h} (${e})`}}class O extends HTMLElement{constructor(){super();r(this,"shadow");r(this,"job",null);r(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,t,i){if(t!==i){if(e==="locale")this.activeLocale=i||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(i),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",t=this.job.title[this.activeLocale]||this.job.title.en,i=this.job.location[this.activeLocale]||this.job.location.en,a=this.job.description[this.activeLocale]||this.job.description.en,n=this.job.applicationDeadline?I(this.job.applicationDeadline):null,l={"@context":"https://schema.org/","@type":"JobPosting",title:t,description:a,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:i,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
        ${JSON.stringify(l)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${t}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${i}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${n?` &bull; <span class="badge calendar" aria-label="Deadline: ${n.display}">📅 ${e?"የማመልከቻ ማብቂያ፦":"Deadline:"} ${n.display}</span>`:""}
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

        <p>${a}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e?"የተረጋገጡ ማመቻቸቶች (Accommodations Offered):":"Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(d=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${d.label[this.activeLocale]||d.label.en}</span>
                <small style="opacity: 0.85;">(${d.source})</small>
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),t=this.shadow.getElementById("share-feedback");!e||!t||e.addEventListener("click",async()=>{const i=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:i}),t.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(i),t.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{t.textContent=i}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",O);const q="abugida-media",K=1;class N{constructor(){r(this,"db",null);r(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((s,e)=>{const t=indexedDB.open(q,K);t.onupgradeneeded=i=>{const a=i.target.result;a.objectStoreNames.contains("preferences")||a.createObjectStore("preferences"),a.objectStoreNames.contains("progress")||a.createObjectStore("progress",{keyPath:"lessonId"}),a.objectStoreNames.contains("packages")||a.createObjectStore("packages",{keyPath:"packageKey"})},t.onsuccess=i=>{this.db=i.target.result,s()},t.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),s()}})}async saveProgress(s){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${s.lessonId}`,JSON.stringify(s))}catch{}return}return new Promise(e=>{const t=this.db.transaction("progress","readwrite");t.objectStore("progress").put(s),t.oncomplete=()=>e(),t.onerror=()=>e()})}async getProgress(s){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${s}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const a=this.db.transaction("progress","readonly").objectStore("progress").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)})}async downloadPackage(s,e,t,i,a){await this.init();const n=`${s}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const l=await caches.open(this.cacheName);let d=0;const u=i.length;for(const m of i){const c=await fetch(m);if(!c.ok)throw new Error(`Failed to fetch asset: ${m} (${c.status})`);await l.put(m,c.clone()),d++;const g=Math.round(d/u*100);a(g,d,u)}return await this.savePackageRecord({packageKey:n,lessonId:s,packageId:e,packageName:t,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(l){throw await this.savePackageRecord({packageKey:n,lessonId:s,packageId:e,packageName:t,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:l instanceof Error?l.message:"Download failed"}),l}}async isPackageReady(s,e){await this.init();const t=`${s}:${e}`,i=await this.getPackageRecord(t);return(i==null?void 0:i.status)==="ready"}async savePackageRecord(s){if(this.db)return new Promise(e=>{const t=this.db.transaction("packages","readwrite");t.objectStore("packages").put(s),t.oncomplete=()=>e(),t.onerror=()=>e()})}async getPackageRecord(s){return this.db?new Promise(e=>{const a=this.db.transaction("packages","readonly").objectStore("packages").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)}):null}}const W=new N;p.A11yJobCard=O,p.A11yMediaPlayer=j,p.DEFAULT_PREFERENCES=y,p.ETHIOPIC_MONTHS=z,p.MediaSyncController=P,p.OfflineStorageManager=N,p.TranscriptViewer=A,p.formatDualDate=I,p.getThemeStyles=D,p.loadPreferences=L,p.offlineStorage=W,p.parseVTT=T,p.resetPreferences=V,p.savePreferences=v,p.toEthiopianDate=M,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
