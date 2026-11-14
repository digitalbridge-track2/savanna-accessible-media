(function(u,k){typeof exports=="object"&&typeof module<"u"?k(exports):typeof define=="function"&&define.amd?define(["exports"],k):(u=typeof globalThis<"u"?globalThis:u||self,k(u.AbugidaMediaKit={}))})(this,function(u){"use strict";var ge=Object.defineProperty;var ue=(u,k,w)=>k in u?ge(u,k,{enumerable:!0,configurable:!0,writable:!0,value:w}):u[k]=w;var l=(u,k,w)=>ue(u,typeof k!="symbol"?k+"":k,w);const k="abugida_media_preferences",w={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1,transcriptVisible:!0,transcriptWidth:350,transcriptHeight:460,eslWidth:340,eslHeight:240};function U(){try{const m=localStorage.getItem(k);if(!m)return{...w};const s=JSON.parse(m);return{...w,...s}}catch{return{...w}}}function $(m){try{const e={...U(),...m};return localStorage.setItem(k,JSON.stringify(e)),e}catch{return{...w,...m}}}function J(){try{localStorage.removeItem(k)}catch{}return{...w}}function q(m){const s=[],e=m.split(/\r?\n/);let i=0;for(;i<e.length&&!e[i].includes("-->");)i++;for(;i<e.length;){const t=e[i].trim();if(t.includes("-->")){const a=t.split("-->").map(r=>r.trim().split(" ")[0]);if(a.length>=2){const r=Y(a[0]),c=Y(a[1]);i++;const g=[];for(;i<e.length&&e[i].trim()!=="";)g.push(e[i].trim()),i++;g.length>0&&s.push({start:r,end:c,text:g.join(`
`)})}}i++}return s}function Y(m){const s=m.split(":");let e=0,i=0,t=0;return s.length===3?(e=parseFloat(s[0]),i=parseFloat(s[1]),t=parseFloat(s[2].replace(",","."))):s.length===2&&(i=parseFloat(s[0]),t=parseFloat(s[1].replace(",","."))),e*3600+i*60+t}function K(m,s){let e="18px";s==="small"&&(e="14px"),s==="large"&&(e="24px"),s==="xlarge"&&(e="32px");let i="#FFFFFF",t="rgba(0, 0, 0, 0.85)",a="none";return m==="yellow-black"?(i="#FFEB3B",t="#000000",a="2px solid #FFEB3B"):m==="white-black"?(i="#FFFFFF",t="#000000",a="2px solid #FFFFFF"):m==="black-yellow"&&(i="#000000",t="#FFEB3B",a="2px solid #000000"),`
    font-size: ${e};
    color: ${i};
    background: ${t};
    border: ${a};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `}class Q{constructor(s,e){l(this,"mainVideo");l(this,"signVideo",null);l(this,"driftThreshold");l(this,"isSyncing",!1);l(this,"onSignStatusChange");l(this,"mainListeners",{});l(this,"signListeners",{});this.mainVideo=s,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(s){if(this.cleanupSignListeners(),this.signVideo=s,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(s){this.onSignStatusChange&&this.onSignStatusChange(s)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(s,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[s,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(s,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(s){const e=!this.mainVideo.paused,i=this.mainVideo.currentTime,t=this.mainVideo.playbackRate;return this.mainVideo.src=s,this.mainVideo.load(),new Promise(a=>{const r=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",r),this.mainVideo.currentTime=i,this.mainVideo.playbackRate=t,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=i}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}a()};this.mainVideo.addEventListener("loadedmetadata",r)})}cleanupSignListeners(){if(this.signVideo)for(const[s,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(s,e);this.signListeners={}}destroy(){for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(s,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class X{constructor(s,e){l(this,"segments",[]);l(this,"container");l(this,"onSeekAndPlay");l(this,"onFollowChange");l(this,"currentActiveId",null);l(this,"searchQuery","");l(this,"isFollowing",!0);l(this,"userPausedFollowing",!1);l(this,"locale","en");l(this,"listElement",null);l(this,"followBtn",null);l(this,"statusElement",null);this.container=s,this.onSeekAndPlay=e.onSeekAndPlay,this.onFollowChange=e.onFollowChange,this.locale=e.locale||"en"}setLocale(s){this.locale!==s&&(this.locale=s,this.render())}setSegments(s){this.segments=s.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,i)=>e.start-i.start),this.render()}setSearchQuery(s){this.searchQuery=s.toLowerCase().trim(),this.render()}getActiveSegment(s){return this.segments.length&&this.segments.find(e=>s>=e.start&&s<e.end)||null}updateActiveTime(s){const e=this.getActiveSegment(s),i=e?e.id:null;i!==this.currentActiveId&&(this.currentActiveId=i,this.highlightSegment(i),this.isFollowing&&i!==null&&this.scrollToActiveCue(i))}highlightSegment(s){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),s!==null){const i=this.container.querySelector(`[data-segment-id="${s}"]`);i&&i.classList.add("active")}}scrollToActiveCue(s){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${s}"]`);if(!e)return;this.listElement.scrollTop;const i=this.listElement.clientHeight,t=e.offsetTop,a=e.clientHeight,r=t-i/2+a/2;this.listElement.scrollTo({top:Math.max(0,r),behavior:"smooth"})}setFollowing(s){this.setFollowingState(s,!0)}setFollowingState(s,e=!1){var i;if(this.isFollowing=s,e&&(this.userPausedFollowing=!s),(i=this.onFollowChange)==null||i.call(this,s),this.followBtn){this.followBtn.setAttribute("aria-pressed",s?"true":"false");const t=this.locale==="am";s?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}s&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(s){const e=Math.floor(s/60),i=Math.floor(s%60);return`${e.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}render(){var i;const s=this.locale==="am",e=this.searchQuery?this.segments.filter(t=>t.text.toLowerCase().includes(this.searchQuery)||t.speaker&&t.speaker.toLowerCase().includes(this.searchQuery)||t.visualDescription&&t.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
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
            ${e.map(t=>{const a=this.formatTime(t.start),r=t.id===this.currentActiveId,c=s?`ከ ${a} ጀምሮ አጫውት`:`Play from ${a}`;return`
                <li class="transcript-item ${r?"active":""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${c}">
                    ${a}
                  </button>
                  <div class="segment-content">
                    ${t.speaker?`<strong class="speaker-label">${this.escapeHtml(t.speaker)}:</strong>`:""}
                    <span class="segment-text">${this.escapeHtml(t.text)}</span>
                    ${t.visualDescription?`<div class="visual-desc" aria-label="${s?"ምስላዊ ማብራሪያ":"Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${s?"ምስላዊ":"Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
                           </div>`:""}
                  </div>
                </li>
              `}).join("")}
          </ul>
        `}
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(i=this.followBtn)==null||i.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const t=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",t,{passive:!0}),this.listElement.addEventListener("touchmove",t,{passive:!0}),this.listElement.addEventListener("keydown",a=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(a.key)&&t()})}this.container.querySelectorAll(".btn-seek-time").forEach(t=>{t.addEventListener("click",a=>{const r=parseFloat(a.currentTarget.dataset.time||"0");this.onSeekAndPlay(r),a.currentTarget.focus()})})}escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class G extends HTMLElement{constructor(){super();l(this,"shadow");l(this,"manifest",null);l(this,"activeLocale","en");l(this,"prefs");l(this,"mainVideo");l(this,"signVideo",null);l(this,"syncController");l(this,"pendingSeekTime",null);l(this,"currentCues",[]);l(this,"captionOverlay");l(this,"transcriptViewer");l(this,"isPreferencesOpen",!1);this.shadow=this.attachShadow({mode:"open"}),this.prefs=U()}static get observedAttributes(){return["manifest-src","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e&&this.loadManifest(e)}disconnectedCallback(){this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,i,t){i!==t&&(e==="locale"?(this.activeLocale=t||"en",this.updateLocaleStrings()):e==="manifest-src"&&this.loadManifest(t))}async loadManifest(e){try{const i=await fetch(e);if(!i.ok)throw new Error(`HTTP error ${i.status}`);const t=await i.json();let a;try{a=new URL(e,window.location.href)}catch{a=new URL(window.location.href)}const r=c=>{if(!c)return c;try{return new URL(c,a).href}catch{return c}};this.manifest={...t,poster:t.poster?{...t.poster,src:r(t.poster.src)}:void 0,sources:(t.sources||[]).map(c=>({...c,src:r(c.src)})),captionTracks:(t.captionTracks||[]).map(c=>({...c,src:r(c.src)})),transcript:t.transcript?{...t.transcript,src:r(t.transcript.src)}:t.transcript},this.render(),await this.initTracksAndTranscript()}catch(i){this.renderError(i instanceof Error?i.message:"Failed to load manifest")}}async initTracksAndTranscript(){var e;if(this.manifest&&(await this.loadCaptionTrack(this.prefs.captionLanguage),(e=this.manifest.transcript)!=null&&e.src))try{const i=await fetch(this.manifest.transcript.src);if(i.ok){const a=((await i.json()).segments||[]).map(r=>({id:r.id,start:r.start_ms!==void 0?r.start_ms/1e3:r.start||0,end:r.end_ms!==void 0?r.end_ms/1e3:r.end||0,speaker:r.speaker,text:r.text||r.draft_text||"",visualDescription:r.visual_description||r.visualDescription}));this.transcriptViewer.setSegments(a)}}catch(i){console.warn("Could not load external transcript file, using fallback cues",i)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const i=this.manifest.captionTracks.find(t=>t.language===e);if(!i){this.currentCues=[],this.updateCaptionDisplay();return}try{const t=await fetch(i.src);if(t.ok){const a=await t.text();this.currentCues=q(a)}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,i=this.currentCues.find(t=>e>=t.start&&e<=t.end);i?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=K(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=i.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const i=()=>{this.mainVideo.removeEventListener("loadedmetadata",i),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",i);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(i=>{console.warn("Playback interrupted or prevented on seek:",i)})}renderError(e){this.shadow.innerHTML=`
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
    `}render(){var d,n,v,h;const e=this.activeLocale==="am",i=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",t=(d=this.manifest)==null?void 0:d.sources.find(S=>S.kind==="main"),a=(n=this.manifest)==null?void 0:n.sources.find(S=>S.kind==="sign"),r=this.prefs.transcriptWidth||w.transcriptWidth||350,c=this.prefs.transcriptHeight||w.transcriptHeight||480,g=this.prefs.eslWidth||w.eslWidth||340,y=this.prefs.eslHeight||w.eslHeight||250;this.shadow.innerHTML=`
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }

        /* 3-Panel Flexible Stage (Transcript | Main Video | Sign Language) */
        .player-stage {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: flex-start;
          justify-content: center;
          gap: 1.25rem;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        /* Window Panels */
        .window-panel {
          position: relative;
          background: #FFF;
          border: 1px solid #CBD5E1;
          border-radius: 6px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
          resize: both;
          transition: box-shadow 0.2s ease;
        }
        .window-panel.floating {
          box-shadow: 0 14px 34px rgba(0,0,0,0.28);
          border-color: #64748B;
        }
        .window-panel.is-resizing {
          user-select: none;
          transition: none !important;
        }
        .window-placeholder {
          border: 2px dashed #94A3B8;
          background: rgba(148, 163, 184, 0.08);
          border-radius: 6px;
          box-sizing: border-box;
          flex-shrink: 0;
          transition: none;
        }

        /* Window Header / Title Bar */
        .window-header {
          background: #2E343A;
          color: #F8F9FA;
          height: 38px;
          min-height: 38px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 0.5rem;
          gap: 0.5rem;
          user-select: none;
          border-bottom: 1px solid rgba(0,0,0,0.3);
          flex-shrink: 0;
        }
        .btn-window-opt {
          background: transparent;
          border: none;
          color: #F8F9FA;
          font-size: 1.1rem;
          cursor: pointer;
          padding: 0;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          line-height: 1;
        }
        .btn-window-opt:hover {
          background: rgba(255,255,255,0.18);
        }
        .btn-window-opt:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
        }
        .window-drag-handle {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: grab;
          height: 100%;
          padding: 0 0.5rem;
          color: #CBD5E1;
          font-size: 1.15rem;
          line-height: 1;
        }
        .window-drag-handle:active {
          cursor: grabbing;
        }
        .header-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .auto-scroll-label {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8rem;
          font-weight: 500;
          color: #F8F9FA;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }
        .header-select {
          background: #FFF;
          color: #1E293B;
          border: 1px solid #94A3B8;
          border-radius: 4px;
          font-size: 0.78rem;
          padding: 2px 6px;
          height: 26px;
          cursor: pointer;
        }

        /* Bottom-Right Corner Resize Grip (Both Width & Height) */
        .window-resize-handle {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 24px;
          height: 24px;
          cursor: nwse-resize;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          user-select: none;
          z-index: 20;
          background: rgba(241, 245, 249, 0.9);
          border-top-left-radius: 4px;
          transition: color 0.15s ease, background 0.15s ease;
        }
        .window-resize-handle:hover,
        .window-resize-handle:focus-visible {
          color: #0F172A;
          background: #E2E8F0;
        }
        .window-resize-handle:focus-visible {
          outline: 2px solid var(--color-focus, #005FCC);
          outline-offset: -2px;
        }

        /* Bottom Edge Resize Handle (Height Up / Down) */
        .window-resize-edge-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 24px;
          height: 8px;
          cursor: ns-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-bottom:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Right Edge Resize Handle (Width Left / Right) */
        .window-resize-edge-right {
          position: absolute;
          top: 38px;
          right: 0;
          bottom: 24px;
          width: 8px;
          cursor: ew-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-right:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Left Edge Resize Handle (for Sign Window) */
        .window-resize-edge-left {
          position: absolute;
          top: 38px;
          left: 0;
          bottom: 24px;
          width: 8px;
          cursor: ew-resize;
          z-index: 15;
          background: transparent;
        }
        .window-resize-edge-left:hover {
          background: rgba(14, 165, 233, 0.25);
        }

        /* Center Main Player Panel */
        .main-player-panel {
          flex: 1 1 440px;
          min-width: 320px;
          max-width: 780px;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 18px rgba(0,0,0,0.2);
          position: relative;
          outline: none;
          box-sizing: border-box;
        }
        .main-player-panel:focus-visible {
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

        /* Custom Captions Overlay */
        .captions-container {
          position: absolute;
          bottom: 20px;
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

        /* LEFT: Resizable Transcript Window */
        .transcript-window {
          flex: 0 0 auto;
          min-width: 220px;
          max-width: 750px;
          min-height: 200px;
          max-height: 900px;
        }
        .transcript-body {
          flex: 1;
          min-height: 0;
          min-width: 0;
          display: flex;
          flex-direction: column;
          padding: 0.85rem 1rem 1rem 1rem;
          overflow: hidden;
          background: #FFF;
        }
        .transcript-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          flex-shrink: 0;
        }
        .transcript-title {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #0F172A;
        }
        .search-box {
          padding: 0.45rem 0.75rem;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          font-size: 0.88rem;
          min-width: 180px;
          min-height: 38px;
          flex: 1;
        }
        .transcript-scroll-area {
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow-y: auto;
        }

        /* RIGHT: Resizable Sign Language Window (Outside of video frame) */
        .esl-window {
          flex: 0 0 auto;
          min-width: 200px;
          max-width: 700px;
          min-height: 160px;
          max-height: 700px;
          background: #111;
        }
        .esl-video-body {
          flex: 1;
          min-height: 0;
          min-width: 0;
          position: relative;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        video.sign-video {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          display: block;
        }
        .sign-status-pill {
          background: rgba(255,255,255,0.2);
          color: #FFF;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 7px;
          border-radius: 4px;
          border: 1px solid rgba(255,255,255,0.3);
          display: inline-block;
        }

        /* Transcript cues, active highlight & visual descriptions */
        .transcript-controls-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 0.5rem;
        }
        .btn-follow {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-radius: 4px;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: #1E293B;
          cursor: pointer;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-follow[aria-pressed="true"] {
          background: #DCFCE7;
          border-color: #86EFAC;
          color: #166534;
        }
        .transcript-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .transcript-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.5rem 0.65rem;
          border-radius: 4px;
          border: 1px solid transparent;
        }
        .transcript-item:hover {
          background: #F8FAFC;
        }
        .transcript-item.active {
          background: #F0FDF4;
          border-color: #86EFAC;
        }
        .btn-seek-time {
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          color: var(--color-brand, #0B5D4E);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.82rem;
          cursor: pointer;
          min-height: 36px;
          min-width: 50px;
        }
        .btn-seek-time:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
        }
        .visual-desc {
          background: #FFF0F2;
          border: 1px solid #F5C2CB;
          border-radius: 4px;
          color: #721C24;
          padding: 0.45rem 0.75rem;
          margin: 0.35rem 0;
          font-style: italic;
          font-size: 0.88rem;
          line-height: 1.4;
        }

        /* Preferences Dialog */
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
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

        /* Responsive Reflow on Small Mobile Screens */
        @media (max-width: 680px) {
          .player-stage {
            flex-direction: column;
            align-items: stretch;
          }
          .main-player-panel, .transcript-window, .esl-window {
            max-width: 100%;
          }
          .main-player-panel {
            order: 1;
          }
          .esl-window {
            order: 2;
          }
          .transcript-window {
            order: 3;
          }
        }
      </style>

      <section class="player-component" aria-label="${i}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${r}px; height: ${c}px; flex: 0 0 ${r}px; display: ${this.prefs.transcriptVisible!==!1?"flex":"none"};"
            aria-label="${e?"የትምህርቱ የጽሑፍ ግልባጭ መስኮት":"Lesson Transcript Window"}">
            
            <!-- Transcript Titlebar -->
            <div class="window-header" id="transcript-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-transcript-prefs" 
                aria-label="${e?"የመስኮት አማራጮች":"Window options"}" 
                title="${e?"የመስኮት አማራጮች":"Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="transcript-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${e?"የጽሑፍ ግልባጭ መስኮት መጎተቻ":"Transcript window drag handle"}"
                title="${e?"ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ":"Drag to move; double-click to re-dock"}">
                <span aria-hidden="true">═</span>
              </div>
              <div class="header-controls">
                <label class="auto-scroll-label" for="cb-auto-scroll">
                  <input type="checkbox" id="cb-auto-scroll" checked>
                  <span>${e?"ራስ-አንብብ":"Auto scroll"}</span>
                </label>
                <label for="select-transcript-lang" class="sr-only">${e?"ቋንቋ":"Language"}</label>
                <select id="select-transcript-lang" class="header-select" aria-label="${e?"የጽሑፍ ግልባጭ ቋንቋ":"Transcript Language"}">
                  <option value="en" ${this.activeLocale==="en"?"selected":""}>English</option>
                  <option value="am" ${this.activeLocale==="am"?"selected":""}>አማርኛ</option>
                </select>
              </div>
            </div>

            <!-- Transcript Body Content -->
            <div class="transcript-body" id="transcript-body">
              <div class="transcript-title-row">
                <h3 class="transcript-title">${e?"የትምህርቱ የጽሑፍ ግልባጭ":"Transcript"}</h3>
                <input 
                  type="search" 
                  id="transcript-search" 
                  class="search-box" 
                  placeholder="${e?"በጽሑፉ ውስጥ ይፈልጉ...":"Search transcript..."}" 
                  aria-label="${e?"በጽሑፉ ውስጥ ይፈልጉ":"Search transcript"}">
              </div>
              <div id="transcript-target" class="transcript-scroll-area"></div>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge) -->
            <div 
              class="window-resize-handle" 
              id="transcript-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${e?"የጽሑፍ ግልባጭ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)":"Resize transcript window (Use arrow keys or drag)"}" 
              title="${e?"መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ":"Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="transcript-resize-edge-bottom" aria-hidden="true" title="${e?"ቁመቱን ለመቀየር ይጎትቱ":"Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="transcript-resize-edge-right" aria-hidden="true" title="${e?"ስፋቱን ለመቀየር ይጎትቱ":"Drag to resize width"}"></div>
          </div>

          <!-- CENTER: Main Video Player & Controls -->
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${i} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${((h=(v=this.manifest)==null?void 0:v.poster)==null?void 0:h.src)||""}"
                src="${t?t.src:""}">
              </video>

              <!-- Captions Overlay -->
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

              <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible!==!1?"true":"false"}" aria-label="${e?"የጽሑፍ ግልባጭ ማሳያ":"Toggle Transcript"}">
                📄 ${e?"ግልባጭ":"Transcript"}
              </button>

              <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
                ⚙ ${e?"ምርጫዎች":"Settings"}
              </button>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${g}px; height: ${y}px; flex: 0 0 ${g}px; display: ${this.prefs.eslVisible&&a?"flex":"none"};"
            aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ መስኮት":"Ethiopian Sign Language Window"}">
            
            <!-- Sign Titlebar -->
            <div class="window-header" id="esl-header">
              <button 
                type="button" 
                class="btn-window-opt" 
                id="btn-esl-prefs" 
                aria-label="${e?"የመስኮት አማራጮች":"Window options"}" 
                title="${e?"የመስኮት አማራጮች":"Window options"}">
                ⚙
              </button>
              <div 
                class="window-drag-handle" 
                id="esl-drag-handle" 
                tabindex="0" 
                role="button" 
                aria-label="${e?"የምልክት ቋንቋ መስኮት መጎተቻ":"Sign language window drag handle"}"
                title="${e?"ለመጎተት ይጫኑ፤ ወደቦታው ለመመለስ ሁለት ጊዜ ይጫኑ":"Drag to move; double-click to re-dock"}">
                <span aria-hidden="true">═</span>
              </div>
              <div class="header-controls">
                <span class="sign-status-pill" id="sign-status-indicator" role="status">EthSL</span>
              </div>
            </div>

            <!-- Sign Video Body Content -->
            <div class="esl-video-body">
              <video 
                id="sign-video" 
                class="sign-video" 
                muted 
                playsinline 
                preload="metadata"
                src="${a?a.src:""}">
              </video>
            </div>

            <!-- Resizing Handles (Corner 2D, Bottom Edge, Right Edge, Left Edge) -->
            <div 
              class="window-resize-handle" 
              id="esl-resize-handle" 
              tabindex="0"
              role="separator" 
              aria-label="${e?"የምልክት ቋንቋ መስኮት ማስተካከያ (በቀስት ቁልፎች መጠን ይቀይሩ)":"Resize sign language window (Use arrow keys or drag)"}" 
              title="${e?"መጠኑን ለመቀየር ይጎትቱ ወይም የቀስት ቁልፎችን ይጠቀሙ":"Drag to resize (or use Arrow keys)"}">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 1L1 13M13 6L6 13M13 11L11 13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="window-resize-edge-bottom" id="esl-resize-edge-bottom" aria-hidden="true" title="${e?"ቁመቱን ለመቀየር ይጎትቱ":"Drag to resize height"}"></div>
            <div class="window-resize-edge-right" id="esl-resize-edge-right" aria-hidden="true" title="${e?"ስፋቱን ለመቀየር ይጎትቱ":"Drag to resize width"}"></div>
            <div class="window-resize-edge-left" id="esl-resize-edge-left" aria-hidden="true" title="${e?"ስፋቱን ለመቀየር ይጎትቱ":"Drag to resize width"}"></div>
          </div>

        </div>

        <!-- Preferences Modal Dialog -->
        <div class="dialog-backdrop" id="prefs-dialog" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="prefs-title">
          <div class="dialog-panel">
            <h3 id="prefs-title">${e?"የተደራሽነት ምርጫዎች":"Accessibility & Layout Settings"}</h3>
            
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
      </section>
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupWindowInteractions()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new Q(this.mainVideo,{driftThreshold:.25,onSignStatusChange:t=>{const a=this.shadow.getElementById("sign-status-indicator");a&&(t==="loading"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):t==="error"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",a.style.background="#FEF2F2",a.style.color="#991B1B"):(a.style.display="inline-block",a.textContent="EthSL",a.style.background="rgba(255,255,255,0.2)",a.style.color="#FFF"))}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target"),i=this.shadow.getElementById("cb-auto-scroll");this.transcriptViewer=new X(e,{locale:this.activeLocale,onSeekAndPlay:t=>{this.seekAndPlay(t)},onFollowChange:t=>{i&&(i.checked=t)}})}setupWindowInteractions(){const e=this.shadow.getElementById("player-stage");if(!e)return;const i=(t,a,r,c,g,y,d)=>{const n=this.shadow.getElementById(t),v=this.shadow.getElementById(a),h=this.shadow.getElementById(r),S=this.shadow.getElementById(c),B=this.shadow.getElementById(g),M=y?this.shadow.getElementById(y):null;if(!n||!v||!h)return;let p=null,z=!1,F="corner",T=0,I=0,D=0,A=0,C=null;const W=f=>{if(!z)return;const b=f.clientX-T,E=f.clientY-I;C!==null&&cancelAnimationFrame(C),C=requestAnimationFrame(()=>{let L=D,N=A;F==="corner"||F==="right"?L=Math.min(d.maxWidth,Math.max(d.minWidth,D+b)):F==="left"&&(L=Math.min(d.maxWidth,Math.max(d.minWidth,D-b))),(F==="corner"||F==="bottom")&&(N=Math.min(d.maxHeight,Math.max(d.minHeight,A+E))),n.style.width=`${L}px`,n.style.height=`${N}px`,n.style.flex=`0 0 ${L}px`,p&&(p.style.width=`${L}px`,p.style.height=`${N}px`,p.style.flex=`0 0 ${L}px`)})},j=()=>{z&&(z=!1,n.classList.remove("is-resizing"),window.removeEventListener("pointermove",W),window.removeEventListener("pointerup",j),window.removeEventListener("pointercancel",j),C!==null&&(cancelAnimationFrame(C),C=null),d.onSaveSize(n.offsetWidth,n.offsetHeight))},P=(f,b)=>{z=!0,F=f,T=b.clientX,I=b.clientY,D=n.offsetWidth,A=n.offsetHeight,n.classList.add("is-resizing"),window.addEventListener("pointermove",W),window.addEventListener("pointerup",j),window.addEventListener("pointercancel",j),b.preventDefault(),b.stopPropagation()};h.addEventListener("pointerdown",f=>P("corner",f)),S==null||S.addEventListener("pointerdown",f=>P("bottom",f)),B==null||B.addEventListener("pointerdown",f=>P("right",f)),M==null||M.addEventListener("pointerdown",f=>P("left",f)),h.addEventListener("keydown",f=>{let b=n.offsetWidth,E=n.offsetHeight,L=!1;f.key==="ArrowRight"?(b=Math.min(d.maxWidth,b+20),L=!0):f.key==="ArrowLeft"?(b=Math.max(d.minWidth,b-20),L=!0):f.key==="ArrowDown"?(E=Math.min(d.maxHeight,E+20),L=!0):f.key==="ArrowUp"&&(E=Math.max(d.minHeight,E-20),L=!0),L&&(f.preventDefault(),n.style.width=`${b}px`,n.style.height=`${E}px`,n.style.flex=`0 0 ${b}px`,p&&(p.style.width=`${b}px`,p.style.height=`${E}px`,p.style.flex=`0 0 ${b}px`),d.onSaveSize(b,E))});let V=!1,O=0,o=0,x=0,H=0,R=null;const ae=f=>{const b=f.clientX-O,E=f.clientY-o;!V&&Math.hypot(b,E)>5&&(V=!0,!p&&n.parentNode&&(p=document.createElement("div"),p.className="window-placeholder",p.style.width=`${n.offsetWidth}px`,p.style.height=`${n.offsetHeight}px`,p.style.flex=n.style.flex||`0 0 ${n.offsetWidth}px`,n.parentNode.insertBefore(p,n)),n.classList.add("floating"),n.style.position="absolute",n.style.zIndex="60"),V&&(R!==null&&cancelAnimationFrame(R),R=requestAnimationFrame(()=>{const L=e.getBoundingClientRect(),N=n.getBoundingClientRect(),de=Math.max(0,L.width-N.width),ce=Math.max(0,L.height-40),he=Math.min(de,Math.max(0,x+b)),pe=Math.min(ce,Math.max(0,H+E));n.style.left=`${he}px`,n.style.top=`${pe}px`,n.style.right="auto",n.style.bottom="auto"}))},_=()=>{V&&(V=!1),window.removeEventListener("pointermove",ae),window.removeEventListener("pointerup",_),window.removeEventListener("pointercancel",_),R!==null&&(cancelAnimationFrame(R),R=null)};v.addEventListener("pointerdown",f=>{if(f.target.tagName==="INPUT"||f.target.tagName==="SELECT")return;O=f.clientX,o=f.clientY;const b=e.getBoundingClientRect(),E=n.getBoundingClientRect();x=E.left-b.left,H=E.top-b.top,V=!1,window.addEventListener("pointermove",ae),window.addEventListener("pointerup",_),window.addEventListener("pointercancel",_)});const ne=()=>{n.classList.remove("floating"),n.style.position="",n.style.left="",n.style.top="",n.style.right="",n.style.bottom="",n.style.zIndex="",p&&(p.remove(),p=null)};v.addEventListener("dblclick",ne),n.__reDock=ne};i("transcript-window","transcript-drag-handle","transcript-resize-handle","transcript-resize-edge-bottom","transcript-resize-edge-right",null,{minWidth:220,maxWidth:750,minHeight:200,maxHeight:900,onSaveSize:(t,a)=>{this.prefs.transcriptWidth=t,this.prefs.transcriptHeight=a,$({transcriptWidth:t,transcriptHeight:a})}}),i("esl-window","esl-drag-handle","esl-resize-handle","esl-resize-edge-bottom","esl-resize-edge-right","esl-resize-edge-left",{minWidth:200,maxWidth:700,minHeight:160,maxHeight:700,onSaveSize:(t,a)=>{this.prefs.eslWidth=t,this.prefs.eslHeight=a,$({eslWidth:t,eslHeight:a})}})}attachEventListeners(){var W,j,P,V,O;const e=this.shadow.getElementById("btn-play"),i=this.shadow.getElementById("play-icon"),t=this.shadow.getElementById("play-text"),a=this.shadow.getElementById("seek-scrubber"),r=this.shadow.getElementById("time-display"),c=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",c),this.mainVideo.addEventListener("play",()=>{i&&t&&(i.textContent="⏸",t.textContent=this.activeLocale==="am"?"አቁም":"Pause"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space)":"Pause (Space)")}),this.mainVideo.addEventListener("pause",()=>{i&&t&&(i.textContent="▶",t.textContent=this.activeLocale==="am"?"አጫውት":"Play"),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space)":"Play (Space)")}),this.mainVideo.addEventListener("timeupdate",()=>{const o=this.mainVideo.currentTime,x=this.mainVideo.duration||1;a&&!a.matches(":active")&&(a.value=(o/x*100).toFixed(1)),r&&(r.textContent=`${this.formatTime(o)} / ${this.formatTime(x)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(o)}),a.addEventListener("input",()=>{const o=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(a.value)/100*o}),(W=this.shadow.getElementById("btn-rewind"))==null||W.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(j=this.shadow.getElementById("btn-forward"))==null||j.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const g=this.shadow.getElementById("btn-ad");g==null||g.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,$({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),g.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const o=this.prefs.audioDescriptionEnabled?"described":"main",x=this.manifest.sources.find(H=>H.kind===o)||this.manifest.sources.find(H=>H.kind==="main");x&&await this.syncController.switchSource(x.src)});const y=this.shadow.getElementById("btn-cc");y==null||y.addEventListener("click",async()=>{const o=["en","am","off"],x=(o.indexOf(this.prefs.captionLanguage)+1)%o.length;this.prefs.captionLanguage=o[x],$({captionLanguage:this.prefs.captionLanguage}),y.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`,await this.loadCaptionTrack(this.prefs.captionLanguage)});const d=this.shadow.getElementById("btn-esl"),n=this.shadow.getElementById("esl-window");d==null||d.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,$({eslVisible:this.prefs.eslVisible}),d.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),n&&(n.style.display=this.prefs.eslVisible?"flex":"none")});const v=this.shadow.getElementById("btn-transcript-toggle"),h=this.shadow.getElementById("transcript-window");v==null||v.addEventListener("click",()=>{const x=!((h==null?void 0:h.style.display)!=="none");this.prefs.transcriptVisible=x,$({transcriptVisible:x}),v.setAttribute("aria-pressed",x?"true":"false"),h&&(h.style.display=x?"flex":"none")});const S=this.shadow.getElementById("cb-auto-scroll");S==null||S.addEventListener("change",()=>{this.transcriptViewer.setFollowing(S.checked)});const B=this.shadow.getElementById("select-transcript-lang");B==null||B.addEventListener("change",()=>{const o=B.value;this.setAttribute("locale",o)});const M=()=>{var o;this.isPreferencesOpen=!0,T&&(T.style.display="flex"),(o=this.shadow.getElementById("select-cc-lang"))==null||o.focus()},p=this.shadow.getElementById("btn-prefs"),z=this.shadow.getElementById("btn-transcript-prefs"),F=this.shadow.getElementById("btn-esl-prefs"),T=this.shadow.getElementById("prefs-dialog"),I=this.shadow.getElementById("btn-close-prefs"),D=this.shadow.getElementById("btn-reset-layout");p==null||p.addEventListener("click",M),z==null||z.addEventListener("click",M),F==null||F.addEventListener("click",M),I==null||I.addEventListener("click",()=>{this.isPreferencesOpen=!1,T&&(T.style.display="none"),p==null||p.focus()}),D==null||D.addEventListener("click",()=>{var o,x;J(),this.prefs=U(),h&&((o=h.__reDock)==null||o.call(h),h.classList.remove("floating"),h.style.position="",h.style.left="",h.style.top="",h.style.right="",h.style.bottom="",h.style.zIndex="",h.style.width=`${w.transcriptWidth}px`,h.style.height=`${w.transcriptHeight}px`,h.style.flex=`0 0 ${w.transcriptWidth}px`,h.style.display="flex"),n&&((x=n.__reDock)==null||x.call(n),n.classList.remove("floating"),n.style.position="",n.style.left="",n.style.top="",n.style.right="",n.style.bottom="",n.style.zIndex="",n.style.width=`${w.eslWidth}px`,n.style.height=`${w.eslHeight}px`,n.style.flex=`0 0 ${w.eslWidth}px`,n.style.display="flex"),d&&d.setAttribute("aria-pressed","true"),v&&v.setAttribute("aria-pressed","true")}),(P=this.shadow.getElementById("select-cc-lang"))==null||P.addEventListener("change",async o=>{this.prefs.captionLanguage=o.target.value,$({captionLanguage:this.prefs.captionLanguage}),y&&(y.textContent=`CC (${this.prefs.captionLanguage.toUpperCase()})`),await this.loadCaptionTrack(this.prefs.captionLanguage)}),(V=this.shadow.getElementById("select-cc-size"))==null||V.addEventListener("change",o=>{this.prefs.captionSize=o.target.value,$({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(O=this.shadow.getElementById("select-cc-theme"))==null||O.addEventListener("change",o=>{this.prefs.captionTheme=o.target.value,$({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()});const A=this.shadow.getElementById("transcript-search");A==null||A.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(A.value)});const C=this.shadow.getElementById("player-container");C==null||C.addEventListener("keydown",o=>{if(this.isPreferencesOpen){o.key==="Escape"&&(this.isPreferencesOpen=!1,T&&(T.style.display="none"),p==null||p.focus());return}if(!(o.target.tagName==="INPUT"||o.target.tagName==="SELECT"))switch(o.key){case" ":case"k":case"K":o.preventDefault(),c();break;case"j":case"J":case"ArrowLeft":o.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":o.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":o.preventDefault(),this.mainVideo.muted=!this.mainVideo.muted;break;case"c":case"C":o.preventDefault(),y==null||y.click();break;case"s":case"S":o.preventDefault(),d==null||d.click();break;case"d":case"D":o.preventDefault(),g==null||g.click();break;case"t":case"T":o.preventDefault(),v==null||v.click();break}})}updateLocaleStrings(){this.render(),this.initTracksAndTranscript()}formatTime(e){const i=Math.floor(e/60),t=Math.floor(e%60);return`${i.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}}customElements.get("a11y-media-player")||customElements.define("a11y-media-player",G);const Z=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function ee(m){const s=typeof m=="string"?new Date(m):m,e=s.getUTCFullYear(),i=s.getUTCMonth()+1,t=s.getUTCDate(),a=Math.floor((14-i)/12),r=e+4800-a,c=i+12*a-3,g=t+Math.floor((153*c+2)/5)+365*r+Math.floor(r/4)-Math.floor(r/100)+Math.floor(r/400)-32045,y=(g-1723856)%1461,d=y%365+365*Math.floor(y/1460),n=4*Math.floor((g-1723856)/1461)+Math.floor(y/365)-Math.floor(y/1460),v=Math.floor(d/30)+1,h=d%30+1,S=Z[Math.min(v-1,12)];return{year:n,month:v,day:h,monthNameAmharic:S}}function te(m){const s=ee(m),e=`${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;return{iso:m,ethiopic:e,display:`${m} (${e})`}}class ie extends HTMLElement{constructor(){super();l(this,"shadow");l(this,"job",null);l(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,i,t){if(i!==t){if(e==="locale")this.activeLocale=t||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(t),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",i=this.job.title[this.activeLocale]||this.job.title.en,t=this.job.location[this.activeLocale]||this.job.location.en,a=this.job.description[this.activeLocale]||this.job.description.en,r=this.job.applicationDeadline?te(this.job.applicationDeadline):null,c={"@context":"https://schema.org/","@type":"JobPosting",title:i,description:a,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:t,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
        ${JSON.stringify(c)}
      <\/script>

      <article class="card" aria-labelledby="job-title-${this.job.id}">
        <header>
          <h4 id="job-title-${this.job.id}">${i}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${t}</span> &bull;
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

        <p>${a}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e?"የተረጋገጡ ማመቻቸቶች (Accommodations Offered):":"Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(g=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${g.label[this.activeLocale]||g.label.en}</span>
                <small style="opacity: 0.85;">(${g.source})</small>
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),i=this.shadow.getElementById("share-feedback");!e||!i||e.addEventListener("click",async()=>{const t=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:t}),i.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(t),i.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{i.textContent=t}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",ie);const re="abugida-media",oe=1;class se{constructor(){l(this,"db",null);l(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((s,e)=>{const i=indexedDB.open(re,oe);i.onupgradeneeded=t=>{const a=t.target.result;a.objectStoreNames.contains("preferences")||a.createObjectStore("preferences"),a.objectStoreNames.contains("progress")||a.createObjectStore("progress",{keyPath:"lessonId"}),a.objectStoreNames.contains("packages")||a.createObjectStore("packages",{keyPath:"packageKey"})},i.onsuccess=t=>{this.db=t.target.result,s()},i.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),s()}})}async saveProgress(s){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${s.lessonId}`,JSON.stringify(s))}catch{}return}return new Promise(e=>{const i=this.db.transaction("progress","readwrite");i.objectStore("progress").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getProgress(s){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${s}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const a=this.db.transaction("progress","readonly").objectStore("progress").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)})}async downloadPackage(s,e,i,t,a){await this.init();const r=`${s}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const c=await caches.open(this.cacheName);let g=0;const y=t.length;for(const d of t){const n=await fetch(d);if(!n.ok)throw new Error(`Failed to fetch asset: ${d} (${n.status})`);await c.put(d,n.clone()),g++;const v=Math.round(g/y*100);a(v,g,y)}return await this.savePackageRecord({packageKey:r,lessonId:s,packageId:e,packageName:i,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(c){throw await this.savePackageRecord({packageKey:r,lessonId:s,packageId:e,packageName:i,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:c instanceof Error?c.message:"Download failed"}),c}}async isPackageReady(s,e){await this.init();const i=`${s}:${e}`,t=await this.getPackageRecord(i);return(t==null?void 0:t.status)==="ready"}async savePackageRecord(s){if(this.db)return new Promise(e=>{const i=this.db.transaction("packages","readwrite");i.objectStore("packages").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getPackageRecord(s){return this.db?new Promise(e=>{const a=this.db.transaction("packages","readonly").objectStore("packages").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)}):null}}const le=new se;u.A11yJobCard=ie,u.A11yMediaPlayer=G,u.DEFAULT_PREFERENCES=w,u.ETHIOPIC_MONTHS=Z,u.MediaSyncController=Q,u.OfflineStorageManager=se,u.TranscriptViewer=X,u.formatDualDate=te,u.getThemeStyles=K,u.loadPreferences=U,u.offlineStorage=le,u.parseVTT=q,u.resetPreferences=J,u.savePreferences=$,u.toEthiopianDate=ee,Object.defineProperty(u,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
