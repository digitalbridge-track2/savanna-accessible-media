(function(f,z){typeof exports=="object"&&typeof module<"u"?z(exports):typeof define=="function"&&define.amd?define(["exports"],z):(f=typeof globalThis<"u"?globalThis:f||self,z(f.AbugidaMediaKit={}))})(this,function(f){"use strict";var ye=Object.defineProperty;var xe=(f,z,L)=>z in f?ye(f,z,{enumerable:!0,configurable:!0,writable:!0,value:L}):f[z]=L;var h=(f,z,L)=>xe(f,typeof z!="symbol"?z+"":z,L);const z="abugida_media_preferences",L={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1,transcriptVisible:!0,transcriptWidth:280,transcriptHeight:420,eslWidth:260,eslHeight:200};function ee(){try{const b=localStorage.getItem(z);if(!b)return{...L};const s=JSON.parse(b);return{...L,...s}}catch{return{...L}}}function A(b){try{const e={...ee(),...b};return localStorage.setItem(z,JSON.stringify(e)),e}catch{return{...L,...b}}}function ie(){try{localStorage.removeItem(z)}catch{}return{...L}}function se(b){const s=[],e=b.split(/\r?\n/);let i=0;for(;i<e.length&&!e[i].includes("-->");)i++;for(;i<e.length;){const t=e[i].trim();if(t.includes("-->")){const a=t.split("-->").map(o=>o.trim().split(" ")[0]);if(a.length>=2){const o=ae(a[0]),c=ae(a[1]);i++;const m=[];for(;i<e.length&&e[i].trim()!=="";)m.push(e[i].trim()),i++;m.length>0&&s.push({start:o,end:c,text:m.join(`
`)})}}i++}return s}function ae(b){const s=b.split(":");let e=0,i=0,t=0;return s.length===3?(e=parseFloat(s[0]),i=parseFloat(s[1]),t=parseFloat(s[2].replace(",","."))):s.length===2&&(i=parseFloat(s[0]),t=parseFloat(s[1].replace(",","."))),e*3600+i*60+t}function ne(b,s){let e="18px";s==="small"&&(e="14px"),s==="large"&&(e="24px"),s==="xlarge"&&(e="32px");let i="#FFFFFF",t="rgba(0, 0, 0, 0.85)",a="none";return b==="yellow-black"?(i="#FFEB3B",t="#000000",a="2px solid #FFEB3B"):b==="white-black"?(i="#FFFFFF",t="#000000",a="2px solid #FFFFFF"):b==="black-yellow"&&(i="#000000",t="#FFEB3B",a="2px solid #000000"),`
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
  `}class re{constructor(s,e){h(this,"mainVideo");h(this,"signVideo",null);h(this,"driftThreshold");h(this,"isSyncing",!1);h(this,"onSignStatusChange");h(this,"mainListeners",{});h(this,"signListeners",{});this.mainVideo=s,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(s){if(this.cleanupSignListeners(),this.signVideo=s,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(s){this.onSignStatusChange&&this.onSignStatusChange(s)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(s,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[s,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(s,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(s){const e=!this.mainVideo.paused,i=this.mainVideo.currentTime,t=this.mainVideo.playbackRate;return this.mainVideo.src=s,this.mainVideo.load(),new Promise(a=>{const o=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",o),this.mainVideo.currentTime=i,this.mainVideo.playbackRate=t,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=i}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}a()};this.mainVideo.addEventListener("loadedmetadata",o)})}cleanupSignListeners(){if(this.signVideo)for(const[s,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(s,e);this.signListeners={}}destroy(){for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(s,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class oe{constructor(s,e){h(this,"segments",[]);h(this,"container");h(this,"onSeekAndPlay");h(this,"onFollowChange");h(this,"currentActiveId",null);h(this,"searchQuery","");h(this,"isFollowing",!0);h(this,"userPausedFollowing",!1);h(this,"locale","en");h(this,"listElement",null);h(this,"followBtn",null);h(this,"statusElement",null);this.container=s,this.onSeekAndPlay=e.onSeekAndPlay,this.onFollowChange=e.onFollowChange,this.locale=e.locale||"en"}setLocale(s){this.locale!==s&&(this.locale=s,this.render())}setSegments(s){this.segments=s.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,i)=>e.start-i.start),this.render()}setSearchQuery(s){this.searchQuery=s.toLowerCase().trim(),this.render()}getActiveSegment(s){return this.segments.length&&this.segments.find(e=>s>=e.start&&s<e.end)||null}updateActiveTime(s){const e=this.getActiveSegment(s),i=e?e.id:null;i!==this.currentActiveId&&(this.currentActiveId=i,this.highlightSegment(i),this.isFollowing&&i!==null&&this.scrollToActiveCue(i))}highlightSegment(s){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),s!==null){const i=this.container.querySelector(`[data-segment-id="${s}"]`);i&&i.classList.add("active")}}scrollToActiveCue(s){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${s}"]`);if(!e)return;this.listElement.scrollTop;const i=this.listElement.clientHeight,t=e.offsetTop,a=e.clientHeight,o=t-i/2+a/2;this.listElement.scrollTo({top:Math.max(0,o),behavior:"smooth"})}setFollowing(s){this.setFollowingState(s,!0)}setFollowingState(s,e=!1){var i;if(this.isFollowing=s,e&&(this.userPausedFollowing=!s),(i=this.onFollowChange)==null||i.call(this,s),this.followBtn){this.followBtn.setAttribute("aria-pressed",s?"true":"false");const t=this.locale==="am";s?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}s&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(s){const e=Math.floor(s/60),i=Math.floor(s%60);return`${e.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}render(){var i;const s=this.locale==="am",e=this.searchQuery?this.segments.filter(t=>t.text.toLowerCase().includes(this.searchQuery)||t.speaker&&t.speaker.toLowerCase().includes(this.searchQuery)||t.visualDescription&&t.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
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
            ${e.map(t=>{const a=this.formatTime(t.start),o=t.id===this.currentActiveId,c=s?`ከ ${a} ጀምሮ አጫውት`:`Play from ${a}`;return`
                <li class="transcript-item ${o?"active":""}" data-segment-id="${t.id}">
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
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(i=this.followBtn)==null||i.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const t=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",t,{passive:!0}),this.listElement.addEventListener("touchmove",t,{passive:!0}),this.listElement.addEventListener("keydown",a=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(a.key)&&t()})}this.container.querySelectorAll(".btn-seek-time").forEach(t=>{t.addEventListener("click",a=>{const o=parseFloat(a.currentTarget.dataset.time||"0");this.onSeekAndPlay(o),a.currentTarget.focus()})})}escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}const F={play:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',restart:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',rewind:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',forward:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',cc:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',esl:'<svg viewBox="0 0 30 20" width="26" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="27" height="17" rx="3.5"/><text x="15" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="10" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>',ad:'<svg viewBox="0 0 24 20" width="24" height="20" fill="currentColor" aria-hidden="true"><path d="M2.5 3h6.5c3.6 0 6.5 2.9 6.5 7s-2.9 7-6.5 7H2.5V3zm3.5 11h3c2 0 3.5-1.6 3.5-4s-1.5-4-3.5-4H6v8z"/><path d="M17.5 7.2c1 1.6 1 4 0 5.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/><path d="M20.2 5.2c2 2.8 2 6.8 0 9.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/></svg>',transcript:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',faster:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/></svg>',slower:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/></svg>',prefs:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',fullscreenEnter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',fullscreenExit:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',volumeUnmuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',volumeMuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'};class te extends HTMLElement{constructor(){super();h(this,"shadow");h(this,"manifest",null);h(this,"activeLocale","en");h(this,"prefs");h(this,"mainVideo");h(this,"signVideo",null);h(this,"syncController");h(this,"pendingSeekTime",null);h(this,"currentCues",[]);h(this,"captionOverlay");h(this,"transcriptViewer");h(this,"isPreferencesOpen",!1);this.shadow=this.attachShadow({mode:"open"}),this.prefs=ee()}static get observedAttributes(){return["manifest-src","locale","lang","src","captions","sign","describe","api"]}connectedCallback(){this.activeLocale=this.getAttribute("lang")||this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e?this.loadManifest(e):this.getAttribute("src")&&this.initFromAttributes()}disconnectedCallback(){this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,i,t){i!==t&&(e==="locale"||e==="lang"?(this.activeLocale=t||"en",this.updateLocaleStrings()):e==="manifest-src"?this.loadManifest(t):(e==="src"||e==="captions"||e==="sign"||e==="describe")&&(this.getAttribute("manifest-src")||this.initFromAttributes()))}initFromAttributes(){const e=this.getAttribute("src");if(!e)return;const i=this.getAttribute("lang")||this.getAttribute("locale")||"en";this.activeLocale=i;const t=this.getAttribute("captions")||"",a=this.getAttribute("sign"),o=this.getAttribute("describe"),c=t.split(",").map(m=>m.trim()).filter(Boolean).map(m=>{const k=m.includes(".am.")||m.endsWith("am.vtt")||m.includes("am");return{id:k?"cap-am":"cap-en",language:k?"am":"en",label:k?"አማርኛ":"English",src:m}});this.manifest={id:"lesson-player",version:"1.0.0",title:{en:"Lesson Video",am:"የትምህርት ቪዲዮ"},sources:[{id:"main-video",kind:"main",src:e,mimeType:"video/mp4"},...a?[{id:"sign-video",kind:"sign",src:a,mimeType:"video/mp4"}]:[]],captionTracks:c,audioDescription:o?{src:o}:void 0},this.render(),this.initTracksAndTranscript()}async loadManifest(e){try{const i=await fetch(e);if(!i.ok)throw new Error(`HTTP error ${i.status}`);const t=await i.json();let a;try{a=new URL(e,window.location.href)}catch{a=new URL(window.location.href)}const o=c=>{if(!c)return c;try{return new URL(c,a).href}catch{return c}};this.manifest={...t,poster:t.poster?{...t.poster,src:o(t.poster.src)}:void 0,sources:(t.sources||[]).map(c=>({...c,src:o(c.src)})),captionTracks:(t.captionTracks||[]).map(c=>({...c,src:o(c.src)})),transcript:t.transcript?{...t.transcript,src:o(t.transcript.src)}:t.transcript},this.render(),await this.initTracksAndTranscript()}catch(i){this.renderError(i instanceof Error?i.message:"Failed to load manifest")}}async initTracksAndTranscript(){var e;if(this.manifest&&(await this.loadCaptionTrack(this.prefs.captionLanguage),(e=this.manifest.transcript)!=null&&e.src))try{const i=await fetch(this.manifest.transcript.src);if(i.ok){const a=((await i.json()).segments||[]).map(o=>({id:o.id,start:o.start_ms!==void 0?o.start_ms/1e3:o.start||0,end:o.end_ms!==void 0?o.end_ms/1e3:o.end||0,speaker:o.speaker,text:o.text||o.draft_text||"",visualDescription:o.visual_description||o.visualDescription}));this.transcriptViewer.setSegments(a)}}catch(i){console.warn("Could not load external transcript file, using fallback cues",i)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const i=this.manifest.captionTracks.find(t=>t.language===e);if(!i){this.currentCues=[],this.updateCaptionDisplay();return}try{const t=await fetch(i.src);if(t.ok){const a=await t.text();this.currentCues=se(a)}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,i=this.currentCues.find(t=>e>=t.start&&e<=t.end);i?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=ne(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=i.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const i=()=>{this.mainVideo.removeEventListener("loadedmetadata",i),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",i);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(i=>{console.warn("Playback interrupted or prevented on seek:",i)})}renderError(e){this.shadow.innerHTML=`
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
    `}render(){var p,n,w,B;const e=this.activeLocale==="am",i=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",t=(p=this.manifest)==null?void 0:p.sources.find(C=>C.kind==="main"),a=(n=this.manifest)==null?void 0:n.sources.find(C=>C.kind==="sign"),o=this.prefs.transcriptWidth||L.transcriptWidth||280,c=this.prefs.transcriptHeight||L.transcriptHeight||420,m=this.prefs.eslWidth||L.eslWidth||260,k=this.prefs.eslHeight||L.eslHeight||200;this.shadow.innerHTML=`
      <style>
        :host {
          display: block;
          max-width: 100%;
          font-family: var(--font-body, system-ui, -apple-system, sans-serif);
          color: var(--color-ink, #14201B);
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        /* 3-Panel Flexible Stage (Transcript | Main Video | Sign Language) */
        .player-stage {
          display: flex;
          flex-direction: row;
          flex-wrap: nowrap;
          align-items: flex-start;
          justify-content: center;
          gap: 0.85rem;
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
          display: block;
          visibility: hidden;
          border: none !important;
          background: transparent !important;
          box-shadow: none !important;
          outline: none !important;
          box-sizing: border-box;
          flex-shrink: 0;
          pointer-events: none;
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

        /* Center Main Player Panel - Horizontal Rectangular Cinema Proportion */
        .main-player-panel {
          flex: 1 1 500px;
          min-width: 320px;
          max-width: 580px;
          width: 100%;
          background: #111417;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35);
          position: relative;
          outline: none;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
        }
        .main-player-panel:focus-visible {
          outline: 3px solid var(--color-focus, #005FCC);
          outline-offset: 3px;
        }
        .main-player-panel:fullscreen,
        .main-player-panel:-webkit-full-screen {
          width: 100vw !important;
          height: 100vh !important;
          max-width: 100vw !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          background: #000 !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 999999 !important;
        }
        .video-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          background: #050505;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .main-player-panel:fullscreen .video-viewport,
        .main-player-panel:-webkit-full-screen .video-viewport {
          flex: 1 1 auto !important;
          height: auto !important;
          max-height: calc(100vh - 84px) !important;
          width: 100% !important;
        }
        video.main-video {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
          cursor: pointer;
        }

        /* Big Play Button Overlay */
        .big-play-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 76px;
          height: 56px;
          background: rgba(0, 0, 0, 0.78);
          border: 2.5px solid #84CC16;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 12;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.65);
          padding: 0;
          outline: none;
        }
        .big-play-btn:hover {
          transform: translate(-50%, -50%) scale(1.08);
          background: rgba(0, 0, 0, 0.92);
          border-color: #A3E635;
          box-shadow: 0 6px 26px rgba(132, 204, 22, 0.4);
        }
        .big-play-btn:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 3px;
        }
        .big-play-btn.is-hidden {
          display: none !important;
        }
        .big-play-svg {
          width: 30px;
          height: 30px;
          margin-left: 3px;
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

        /* Controls Toolbar (Able Player Inspired Modern Clean Layout) */
        .controls-toolbar {
          display: flex;
          flex-direction: column;
          background: #1F2428;
          color: #FFF;
          border-top: 1px solid #30363D;
          user-select: none;
          flex-shrink: 0;
        }
        .main-player-panel:fullscreen .controls-toolbar,
        .main-player-panel:-webkit-full-screen .controls-toolbar {
          flex-shrink: 0 !important;
          width: 100% !important;
        }
        .scrubber-container {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 6px 12px 2px 12px;
          box-sizing: border-box;
        }
        input[type="range"].scrubber {
          flex: 1;
          width: 100%;
          height: 6px;
          accent-color: #FFFFFF;
          cursor: pointer;
          background: #4B5563;
          border-radius: 3px;
          outline: none;
          margin: 0;
          padding: 0;
          min-height: 20px;
          transition: height 0.1s ease;
        }
        input[type="range"].scrubber:hover {
          height: 8px;
        }
        input[type="range"].scrubber:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 3px 8px;
          gap: 2px;
          flex-wrap: nowrap;
          overflow-x: auto;
        }
        .controls-cluster {
          display: flex;
          align-items: center;
          gap: 2px;
        }
        .btn-ctrl {
          background: transparent;
          color: #F8F9FA;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 0;
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: background 0.12s ease, color 0.12s ease, border-color 0.12s ease;
          flex-shrink: 0;
          position: relative;
        }
        .btn-ctrl:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #FFF;
        }
        .btn-ctrl:focus-visible {
          outline: 2px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-ctrl[aria-pressed="true"] {
          background: rgba(14, 165, 233, 0.25);
          color: #38BDF8;
          border-bottom: 2px solid var(--color-accent, #F2C14E);
        }
        .ctrl-divider {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.22);
          margin: 0 4px;
          flex-shrink: 0;
        }
        .status-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #111417;
          color: #E2E8F0;
          font-size: 0.76rem;
          font-family: monospace, system-ui, sans-serif;
          padding: 3px 12px 5px 12px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .status-item {
          white-space: nowrap;
        }
        .status-time {
          font-variant-numeric: tabular-nums;
          font-weight: 500;
          color: #F8FAFC;
        }
        .status-speed {
          color: #CBD5E1;
        }
        .status-state {
          font-style: italic;
          color: #94A3B8;
        }

        /* LEFT: Resizable Transcript Window */
        .transcript-window {
          flex: 0 0 280px;
          min-width: 200px;
          max-width: 550px;
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
        .transcript-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .transcript-scroll-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .transcript-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 980px;
        }
        .transcript-scroll-area::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.32);
        }

        /* RIGHT: Resizable Sign Language Window (Outside of video frame) */
        .esl-window {
          flex: 0 0 260px;
          min-width: 180px;
          max-width: 500px;
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
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .dialog-panel {
          background: #FFFFFF;
          color: #1D1D1F;
          padding: 1.75rem 2rem;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .dialog-panel h3 {
          margin-top: 0;
          color: #1D1D1F;
          font-size: 21px;
          letter-spacing: -0.005em;
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

        /* Dialog Action Buttons (Accessible, Un-squished) */
        .btn-dialog-action {
          padding: 0.6rem 1.25rem;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: 6px;
          min-height: 42px;
          border: 1px solid transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          transition: background 0.15s ease, transform 0.1s ease;
          width: auto;
          min-width: 130px;
        }
        .btn-dialog-action:focus-visible {
          outline: 3px solid var(--color-accent, #F2C14E);
          outline-offset: 2px;
        }
        .btn-dialog-reset {
          background: #475569;
          color: #FFFFFF;
        }
        .btn-dialog-reset:hover {
          background: #334155;
        }
        .btn-dialog-save {
          background: var(--color-brand, #0B5D4E);
          color: #FFFFFF;
        }
        .btn-dialog-save:hover {
          background: #084338;
        }

        /* Responsive Reflow on Narrow Screens */
        @media (max-width: 880px) {
          .player-stage {
            flex-wrap: wrap;
            flex-direction: column;
            align-items: center;
          }
          .main-player-panel, .transcript-window, .esl-window {
            max-width: 100%;
            width: 100% !important;
            flex: 1 1 auto !important;
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
            style="width: ${o}px; height: ${c}px; flex: 0 0 ${o}px; display: ${this.prefs.transcriptVisible!==!1?"flex":"none"};"
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
                poster="${((B=(w=this.manifest)==null?void 0:w.poster)==null?void 0:B.src)||""}"
                src="${t?t.src:""}">
              </video>

              <!-- Big Play Button Overlay -->
              <button 
                type="button" 
                class="big-play-btn" 
                id="big-play-btn" 
                aria-label="${e?"ቪዲዮውን አጫውት (Space / K)":"Play video (Space / K)"}"
                title="${e?"ቪዲዮውን አጫውት":"Play video"}">
                <svg viewBox="0 0 48 48" class="big-play-svg" aria-hidden="true">
                  <polygon points="18,12 36,24 18,36" fill="#FFFFFF"/>
                </svg>
              </button>

              <!-- Captions Overlay -->
              <div class="captions-container" aria-hidden="true">
                <div class="captions-text" id="caption-overlay" style="display: none;"></div>
              </div>
            </div>

            <!-- Controls Toolbar (Able Player Inspired Modern Clean Layout) -->
            <div class="controls-toolbar" role="toolbar" aria-label="${e?"የቪዲዮ መቆጣጠሪያዎች":"Video player controls"}">
              <!-- Scrubber -->
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
              </div>

              <!-- Controls Row -->
              <div class="controls-row">
                <!-- Left: Playback & Navigation -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-play" aria-label="${e?"አጫውት (Space / K)":"Play (Space / K)"}" title="${e?"አጫውት (Space / K)":"Play (Space / K)"}">
                    <span id="play-icon" aria-hidden="true">${F.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}" title="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}">
                    <span aria-hidden="true">${F.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}" title="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${F.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}" title="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${F.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage!=="off"?"true":"false"}" aria-label="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}" title="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}">
                    <span aria-hidden="true">${F.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible?"true":"false"}" aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}" title="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${F.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled?"true":"false"}" aria-label="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}" title="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}">
                    <span aria-hidden="true">${F.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible!==!1?"true":"false"}" aria-label="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}" title="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}">
                    <span aria-hidden="true">${F.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}" title="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}">
                    <span aria-hidden="true">${F.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}" title="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}">
                    <span aria-hidden="true">${F.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}" title="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
                    <span aria-hidden="true">${F.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}" title="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${F.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}" title="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${F.volumeUnmuted}</span>
                  </button>
                </div>
              </div>

              <!-- Status Strip -->
              <div class="status-strip" aria-hidden="true">
                <span class="status-item status-time" id="time-display">00:00 / 00:00</span>
                <span class="status-item status-speed" id="speed-display">Speed: 1x</span>
                <span class="status-item status-state" id="state-display">Paused</span>
              </div>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${m}px; height: ${k}px; flex: 0 0 ${m}px; display: ${this.prefs.eslVisible&&a?"flex":"none"};"
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
              <button type="button" class="btn-dialog-action btn-dialog-reset" id="btn-reset-layout">
                ↺ ${e?"አቀማመጥን ዳግም አስጀምር":"Reset Layout"}
              </button>
              <button type="button" class="btn-dialog-action btn-dialog-save" id="btn-close-prefs">
                ${e?"ተግብር እና ዝጋ":"Save & Close"}
              </button>
            </div>
          </div>
        </div>
      </section>
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupWindowInteractions()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new re(this.mainVideo,{driftThreshold:.25,onSignStatusChange:t=>{const a=this.shadow.getElementById("sign-status-indicator");a&&(t==="loading"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):t==="error"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",a.style.background="#FEF2F2",a.style.color="#991B1B"):(a.style.display="inline-block",a.textContent="EthSL",a.style.background="rgba(255,255,255,0.2)",a.style.color="#FFF"))}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target"),i=this.shadow.getElementById("cb-auto-scroll");this.transcriptViewer=new oe(e,{locale:this.activeLocale,onSeekAndPlay:t=>{this.seekAndPlay(t)},onFollowChange:t=>{i&&(i.checked=t)}})}setupWindowInteractions(){const e=this.shadow.getElementById("player-stage");if(!e)return;const i=(t,a,o,c,m,k,p)=>{const n=this.shadow.getElementById(t),w=this.shadow.getElementById(a),B=this.shadow.getElementById(o),C=this.shadow.getElementById(c),P=this.shadow.getElementById(m),J=k?this.shadow.getElementById(k):null;if(!n||!w||!B)return;let g=null,N=!1,j="corner",Q=0,X=0,U=0,q=0,R=null;const H=l=>{if(!N)return;const d=l.clientX-Q,x=l.clientY-X;R!==null&&cancelAnimationFrame(R),R=requestAnimationFrame(()=>{let v=U,V=q;j==="corner"||j==="right"?v=Math.min(p.maxWidth,Math.max(p.minWidth,U+d)):j==="left"&&(v=Math.min(p.maxWidth,Math.max(p.minWidth,U-d))),(j==="corner"||j==="bottom")&&(V=Math.min(p.maxHeight,Math.max(p.minHeight,q+x))),n.style.width=`${v}px`,n.style.height=`${V}px`,n.style.flex=`0 0 ${v}px`,g&&(g.style.width=`${v}px`,g.style.height=`${V}px`,g.style.flex=`0 0 ${v}px`)})},S=()=>{N&&(N=!1,n.classList.remove("is-resizing"),window.removeEventListener("pointermove",H),window.removeEventListener("pointerup",S),window.removeEventListener("pointercancel",S),R!==null&&(cancelAnimationFrame(R),R=null),p.onSaveSize(n.offsetWidth,n.offsetHeight))},T=(l,d)=>{N=!0,j=l,Q=d.clientX,X=d.clientY,U=n.offsetWidth,q=n.offsetHeight,n.classList.add("is-resizing"),window.addEventListener("pointermove",H),window.addEventListener("pointerup",S),window.addEventListener("pointercancel",S),d.preventDefault(),d.stopPropagation()};B.addEventListener("pointerdown",l=>T("corner",l)),C==null||C.addEventListener("pointerdown",l=>T("bottom",l)),P==null||P.addEventListener("pointerdown",l=>T("right",l)),J==null||J.addEventListener("pointerdown",l=>T("left",l)),B.addEventListener("keydown",l=>{let d=n.offsetWidth,x=n.offsetHeight,v=!1;l.key==="ArrowRight"?(d=Math.min(p.maxWidth,d+20),v=!0):l.key==="ArrowLeft"?(d=Math.max(p.minWidth,d-20),v=!0):l.key==="ArrowDown"?(x=Math.min(p.maxHeight,x+20),v=!0):l.key==="ArrowUp"&&(x=Math.max(p.minHeight,x-20),v=!0),v&&(l.preventDefault(),n.style.width=`${d}px`,n.style.height=`${x}px`,n.style.flex=`0 0 ${d}px`,g&&(g.style.width=`${d}px`,g.style.height=`${x}px`,g.style.flex=`0 0 ${d}px`),p.onSaveSize(d,x))});let y=!1,D=0,E=0,K=0,_=0,I=null;n.addEventListener("pointerdown",()=>{if(n.classList.contains("floating")){n.style.zIndex="100";const l=t==="transcript-window"?"esl-window":"transcript-window",d=this.shadow.getElementById(l);d&&d.classList.contains("floating")&&(d.style.zIndex="90")}});const M=l=>{const d=l.clientX-D,x=l.clientY-E;!y&&Math.hypot(d,x)>4&&(y=!0,!g&&n.parentNode&&(g=document.createElement("div"),g.className="window-placeholder",g.style.width=`${n.offsetWidth}px`,g.style.height=`${n.offsetHeight}px`,g.style.flex=n.style.flex||`0 0 ${n.offsetWidth}px`,n.parentNode.insertBefore(g,n)),n.classList.add("floating"),n.style.position="absolute",n.style.zIndex="100"),y&&(I!==null&&cancelAnimationFrame(I),I=requestAnimationFrame(()=>{const v=K+d,V=_+x;n.style.left=`${v}px`,n.style.top=`${V}px`,n.style.right="auto",n.style.bottom="auto"}))},W=()=>{y&&(y=!1),window.removeEventListener("pointermove",M),window.removeEventListener("pointerup",W),window.removeEventListener("pointercancel",W),I!==null&&(cancelAnimationFrame(I),I=null)};w.addEventListener("pointerdown",l=>{if(l.target.tagName==="INPUT"||l.target.tagName==="SELECT")return;D=l.clientX,E=l.clientY;const d=e.getBoundingClientRect(),x=n.getBoundingClientRect();K=n.style.left?parseFloat(n.style.left):x.left-d.left,_=n.style.top?parseFloat(n.style.top):x.top-d.top,y=!1,n.style.zIndex="100";const v=t==="transcript-window"?"esl-window":"transcript-window",V=this.shadow.getElementById(v);V&&V.classList.contains("floating")&&(V.style.zIndex="90"),window.addEventListener("pointermove",M),window.addEventListener("pointerup",W),window.addEventListener("pointercancel",W)}),w.addEventListener("keydown",l=>{let d=!1;const x=20;if(!n.classList.contains("floating")){!g&&n.parentNode&&(g=document.createElement("div"),g.className="window-placeholder",g.style.width=`${n.offsetWidth}px`,g.style.height=`${n.offsetHeight}px`,g.style.flex=n.style.flex||`0 0 ${n.offsetWidth}px`,n.parentNode.insertBefore(g,n));const G=e.getBoundingClientRect(),Z=n.getBoundingClientRect();n.classList.add("floating"),n.style.position="absolute",n.style.zIndex="100",n.style.left=`${Z.left-G.left}px`,n.style.top=`${Z.top-G.top}px`}let v=parseFloat(n.style.left)||0,V=parseFloat(n.style.top)||0;l.key==="ArrowRight"?(v+=x,d=!0):l.key==="ArrowLeft"?(v-=x,d=!0):l.key==="ArrowDown"?(V+=x,d=!0):l.key==="ArrowUp"&&(V-=x,d=!0),d&&(l.preventDefault(),n.style.left=`${v}px`,n.style.top=`${V}px`)});const Y=()=>{n.classList.remove("floating"),n.style.position="",n.style.left="",n.style.top="",n.style.right="",n.style.bottom="",n.style.zIndex="",g&&(g.remove(),g=null)};w.addEventListener("dblclick",Y),n.__reDock=Y};i("transcript-window","transcript-drag-handle","transcript-resize-handle","transcript-resize-edge-bottom","transcript-resize-edge-right",null,{minWidth:220,maxWidth:750,minHeight:200,maxHeight:900,onSaveSize:(t,a)=>{this.prefs.transcriptWidth=t,this.prefs.transcriptHeight=a,A({transcriptWidth:t,transcriptHeight:a})}}),i("esl-window","esl-drag-handle","esl-resize-handle","esl-resize-edge-bottom","esl-resize-edge-right","esl-resize-edge-left",{minWidth:200,maxWidth:700,minHeight:160,maxHeight:700,onSaveSize:(t,a)=>{this.prefs.eslWidth=t,this.prefs.eslHeight=a,A({eslWidth:t,eslHeight:a})}})}attachEventListeners(){var G,Z,ue,ge,me;const e=this.shadow.getElementById("btn-play"),i=this.shadow.getElementById("play-icon"),t=this.shadow.getElementById("big-play-btn"),a=this.shadow.getElementById("btn-restart"),o=this.shadow.getElementById("btn-speed-faster"),c=this.shadow.getElementById("btn-speed-slower"),m=this.shadow.getElementById("speed-display"),k=this.shadow.getElementById("state-display"),p=this.shadow.getElementById("btn-fullscreen"),n=this.shadow.getElementById("fullscreen-icon"),w=this.shadow.getElementById("btn-mute"),B=this.shadow.getElementById("mute-icon"),C=this.shadow.getElementById("player-container"),P=this.shadow.getElementById("seek-scrubber"),J=this.shadow.getElementById("time-display"),g=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",g),t&&t.addEventListener("click",g),this.mainVideo.addEventListener("click",g),this.mainVideo.addEventListener("play",()=>{i&&(i.innerHTML=F.pause),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),t==null||t.classList.add("is-hidden"),k&&(k.textContent=this.activeLocale==="am"?"እየተጫወተ ነው":"Playing")}),this.mainVideo.addEventListener("pause",()=>{i&&(i.innerHTML=F.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),k&&(k.textContent=this.mainVideo.ended?this.activeLocale==="am"?"ተጠናቋል":"End of track":this.activeLocale==="am"?"ቆሟል":"Paused")}),this.mainVideo.addEventListener("ended",()=>{i&&(i.innerHTML=F.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),k&&(k.textContent=this.activeLocale==="am"?"ተጠናቋል":"End of track"),this.dispatchEvent(new CustomEvent("db-player:complete",{bubbles:!0,composed:!0,detail:{}}))}),a==null||a.addEventListener("click",()=>{this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0)});const N=[.5,.75,1,1.25,1.5,2],j=()=>{const r=this.mainVideo.playbackRate;m&&(m.textContent=`Speed: ${r}x`)};o==null||o.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,u=N.filter(O=>O>r+.01),$=u.length>0?u[0]:2;this.mainVideo.playbackRate=$,j()}),c==null||c.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,u=N.filter(O=>O<r-.01),$=u.length>0?u[u.length-1]:.5;this.mainVideo.playbackRate=$,j()});const Q=()=>!!(document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement),X=async()=>{try{Q()?document.exitFullscreen?await document.exitFullscreen():document.webkitExitFullscreen&&await document.webkitExitFullscreen():C!=null&&C.requestFullscreen?await C.requestFullscreen():C!=null&&C.webkitRequestFullscreen&&await C.webkitRequestFullscreen()}catch(r){console.warn("Fullscreen toggle failed:",r)}};p==null||p.addEventListener("click",X);const U=()=>{const r=Q();p==null||p.setAttribute("aria-pressed",r?"true":"false"),p==null||p.setAttribute("aria-label",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),p==null||p.setAttribute("title",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),n&&(n.innerHTML=r?F.fullscreenExit:F.fullscreenEnter)};document.addEventListener("fullscreenchange",U),document.addEventListener("webkitfullscreenchange",U);const q=()=>{this.mainVideo.muted=!this.mainVideo.muted};w==null||w.addEventListener("click",q);const R=()=>{const r=this.mainVideo.muted;w==null||w.setAttribute("aria-pressed",r?"true":"false"),w==null||w.setAttribute("aria-label",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),w==null||w.setAttribute("title",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),B&&(B.innerHTML=r?F.volumeMuted:F.volumeUnmuted)};this.mainVideo.addEventListener("volumechange",R),this.mainVideo.addEventListener("timeupdate",()=>{const r=this.mainVideo.currentTime,u=this.mainVideo.duration||1;P&&!P.matches(":active")&&(P.value=(r/u*100).toFixed(1)),J&&(J.textContent=`${this.formatTime(r)} / ${this.formatTime(u)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(r),this.dispatchEvent(new CustomEvent("db-player:progress",{bubbles:!0,composed:!0,detail:{seconds:Math.floor(r),percent:Math.round(r/u*100)}}))}),P.addEventListener("input",()=>{const r=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(P.value)/100*r}),(G=this.shadow.getElementById("btn-rewind"))==null||G.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(Z=this.shadow.getElementById("btn-forward"))==null||Z.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const H=this.shadow.getElementById("btn-ad");H==null||H.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,A({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),H.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const r=this.prefs.audioDescriptionEnabled?"described":"main",u=this.manifest.sources.find($=>$.kind===r)||this.manifest.sources.find($=>$.kind==="main");u&&await this.syncController.switchSource(u.src)});const S=this.shadow.getElementById("btn-cc");S==null||S.addEventListener("click",async()=>{const r=["en","am","off"],u=(r.indexOf(this.prefs.captionLanguage)+1)%r.length;this.prefs.captionLanguage=r[u],A({captionLanguage:this.prefs.captionLanguage});const $=this.prefs.captionLanguage==="off";S.setAttribute("aria-pressed",$?"false":"true"),S.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),S.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),await this.loadCaptionTrack(this.prefs.captionLanguage)});const T=this.shadow.getElementById("btn-esl"),y=this.shadow.getElementById("esl-window");T==null||T.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,A({eslVisible:this.prefs.eslVisible}),T.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),y&&(y.style.display=this.prefs.eslVisible?"flex":"none")});const D=this.shadow.getElementById("btn-transcript-toggle"),E=this.shadow.getElementById("transcript-window");D==null||D.addEventListener("click",()=>{const u=!((E==null?void 0:E.style.display)!=="none");this.prefs.transcriptVisible=u,A({transcriptVisible:u}),D.setAttribute("aria-pressed",u?"true":"false"),E&&(E.style.display=u?"flex":"none")});const K=this.shadow.getElementById("cb-auto-scroll");K==null||K.addEventListener("change",()=>{this.transcriptViewer.setFollowing(K.checked)});const _=this.shadow.getElementById("select-transcript-lang");_==null||_.addEventListener("change",()=>{const r=_.value;this.setAttribute("locale",r)});const I=()=>{this.isPreferencesOpen=!0;const r=this.shadow.getElementById("select-cc-lang"),u=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme");r&&(r.value=this.prefs.captionLanguage),u&&(u.value=this.prefs.captionSize),$&&($.value=this.prefs.captionTheme),l&&(l.style.display="flex"),r==null||r.focus()},M=this.shadow.getElementById("btn-prefs"),W=this.shadow.getElementById("btn-transcript-prefs"),Y=this.shadow.getElementById("btn-esl-prefs"),l=this.shadow.getElementById("prefs-dialog"),d=this.shadow.getElementById("btn-close-prefs"),x=this.shadow.getElementById("btn-reset-layout");M==null||M.addEventListener("click",I),W==null||W.addEventListener("click",I),Y==null||Y.addEventListener("click",I),d==null||d.addEventListener("click",async()=>{const r=this.shadow.getElementById("select-cc-lang"),u=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme");if(r&&r.value!==this.prefs.captionLanguage){if(this.prefs.captionLanguage=r.value,A({captionLanguage:this.prefs.captionLanguage}),S){const O=this.prefs.captionLanguage==="off";S.setAttribute("aria-pressed",O?"false":"true")}await this.loadCaptionTrack(this.prefs.captionLanguage)}u&&u.value!==this.prefs.captionSize&&(this.prefs.captionSize=u.value,A({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()),$&&$.value!==this.prefs.captionTheme&&(this.prefs.captionTheme=$.value,A({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()),this.isPreferencesOpen=!1,l&&(l.style.display="none"),M==null||M.focus()}),x==null||x.addEventListener("click",()=>{var O,fe;ie(),this.prefs=ee();const r=this.shadow.getElementById("select-cc-lang"),u=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme");r&&(r.value=this.prefs.captionLanguage),u&&(u.value=this.prefs.captionSize),$&&($.value=this.prefs.captionTheme),this.updateCaptionDisplay(),this.loadCaptionTrack(this.prefs.captionLanguage),E&&((O=E.__reDock)==null||O.call(E),E.classList.remove("floating"),E.style.position="",E.style.left="",E.style.top="",E.style.right="",E.style.bottom="",E.style.zIndex="",E.style.width=`${L.transcriptWidth}px`,E.style.height=`${L.transcriptHeight}px`,E.style.flex=`0 0 ${L.transcriptWidth}px`,E.style.display="flex"),y&&((fe=y.__reDock)==null||fe.call(y),y.classList.remove("floating"),y.style.position="",y.style.left="",y.style.top="",y.style.right="",y.style.bottom="",y.style.zIndex="",y.style.width=`${L.eslWidth}px`,y.style.height=`${L.eslHeight}px`,y.style.flex=`0 0 ${L.eslWidth}px`,y.style.display="flex"),T&&T.setAttribute("aria-pressed","true"),D&&D.setAttribute("aria-pressed","true")}),(ue=this.shadow.getElementById("select-cc-lang"))==null||ue.addEventListener("change",async r=>{if(this.prefs.captionLanguage=r.target.value,A({captionLanguage:this.prefs.captionLanguage}),S){const u=this.prefs.captionLanguage==="off";S.setAttribute("aria-pressed",u?"false":"true"),S.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),S.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`)}await this.loadCaptionTrack(this.prefs.captionLanguage)}),(ge=this.shadow.getElementById("select-cc-size"))==null||ge.addEventListener("change",r=>{this.prefs.captionSize=r.target.value,A({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(me=this.shadow.getElementById("select-cc-theme"))==null||me.addEventListener("change",r=>{this.prefs.captionTheme=r.target.value,A({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()});const v=this.shadow.getElementById("transcript-search");v==null||v.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(v.value)});const V=this.shadow.getElementById("player-container");V==null||V.addEventListener("keydown",r=>{if(this.isPreferencesOpen){r.key==="Escape"&&(this.isPreferencesOpen=!1,l&&(l.style.display="none"),M==null||M.focus());return}if(!(r.target.tagName==="INPUT"||r.target.tagName==="SELECT"))switch(r.key){case" ":case"k":case"K":r.preventDefault(),g();break;case"j":case"J":case"ArrowLeft":r.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":r.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":r.preventDefault(),q();break;case"f":case"F":r.preventDefault(),X();break;case"0":case"Home":r.preventDefault(),this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0);break;case">":case".":r.preventDefault(),o==null||o.click();break;case"<":case",":r.preventDefault(),c==null||c.click();break;case"c":case"C":r.preventDefault(),S==null||S.click();break;case"s":case"S":r.preventDefault(),T==null||T.click();break;case"d":case"D":r.preventDefault(),H==null||H.click();break;case"t":case"T":r.preventDefault(),D==null||D.click();break}})}updateLocaleStrings(){this.render(),this.initTracksAndTranscript()}formatTime(e){const i=Math.floor(e/60),t=Math.floor(e%60);return`${i.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}}customElements.get("a11y-media-player")||customElements.define("a11y-media-player",te),customElements.get("db-player")||customElements.define("db-player",te);const le=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function ce(b){const s=typeof b=="string"?new Date(b):b,e=s.getUTCFullYear(),i=s.getUTCMonth()+1,t=s.getUTCDate(),a=Math.floor((14-i)/12),o=e+4800-a,c=i+12*a-3,m=t+Math.floor((153*c+2)/5)+365*o+Math.floor(o/4)-Math.floor(o/100)+Math.floor(o/400)-32045,k=(m-1723856)%1461,p=k%365+365*Math.floor(k/1460),n=4*Math.floor((m-1723856)/1461)+Math.floor(k/365)-Math.floor(k/1460),w=Math.floor(p/30)+1,B=p%30+1,C=le[Math.min(w-1,12)];return{year:n,month:w,day:B,monthNameAmharic:C}}function de(b){const s=ce(b),e=`${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;return{iso:b,ethiopic:e,display:`${b} (${e})`}}class he extends HTMLElement{constructor(){super();h(this,"shadow");h(this,"job",null);h(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,i,t){if(i!==t){if(e==="locale")this.activeLocale=t||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(t),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",i=this.job.title[this.activeLocale]||this.job.title.en,t=this.job.location[this.activeLocale]||this.job.location.en,a=this.job.description[this.activeLocale]||this.job.description.en,o=this.job.applicationDeadline?de(this.job.applicationDeadline):null,c={"@context":"https://schema.org/","@type":"JobPosting",title:i,description:a,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:t,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
            ${o?` &bull; <span class="badge calendar" aria-label="Deadline: ${o.display}">📅 ${e?"የማመልከቻ ማብቂያ፦":"Deadline:"} ${o.display}</span>`:""}
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
            ${this.job.accommodations.map(m=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${m.label[this.activeLocale]||m.label.en}</span>
                <small style="opacity: 0.85;">(${m.source})</small>
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),i=this.shadow.getElementById("share-feedback");!e||!i||e.addEventListener("click",async()=>{const t=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:t}),i.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(t),i.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{i.textContent=t}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",he);const be="abugida-media",we=1;class pe{constructor(){h(this,"db",null);h(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((s,e)=>{const i=indexedDB.open(be,we);i.onupgradeneeded=t=>{const a=t.target.result;a.objectStoreNames.contains("preferences")||a.createObjectStore("preferences"),a.objectStoreNames.contains("progress")||a.createObjectStore("progress",{keyPath:"lessonId"}),a.objectStoreNames.contains("packages")||a.createObjectStore("packages",{keyPath:"packageKey"})},i.onsuccess=t=>{this.db=t.target.result,s()},i.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),s()}})}async saveProgress(s){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${s.lessonId}`,JSON.stringify(s))}catch{}return}return new Promise(e=>{const i=this.db.transaction("progress","readwrite");i.objectStore("progress").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getProgress(s){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${s}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const a=this.db.transaction("progress","readonly").objectStore("progress").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)})}async downloadPackage(s,e,i,t,a){await this.init();const o=`${s}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const c=await caches.open(this.cacheName);let m=0;const k=t.length;for(const p of t){const n=await fetch(p);if(!n.ok)throw new Error(`Failed to fetch asset: ${p} (${n.status})`);await c.put(p,n.clone()),m++;const w=Math.round(m/k*100);a(w,m,k)}return await this.savePackageRecord({packageKey:o,lessonId:s,packageId:e,packageName:i,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(c){throw await this.savePackageRecord({packageKey:o,lessonId:s,packageId:e,packageName:i,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:c instanceof Error?c.message:"Download failed"}),c}}async isPackageReady(s,e){await this.init();const i=`${s}:${e}`,t=await this.getPackageRecord(i);return(t==null?void 0:t.status)==="ready"}async savePackageRecord(s){if(this.db)return new Promise(e=>{const i=this.db.transaction("packages","readwrite");i.objectStore("packages").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getPackageRecord(s){return this.db?new Promise(e=>{const a=this.db.transaction("packages","readonly").objectStore("packages").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)}):null}}const ve=new pe;f.A11yJobCard=he,f.A11yMediaPlayer=te,f.DEFAULT_PREFERENCES=L,f.ETHIOPIC_MONTHS=le,f.MediaSyncController=re,f.OfflineStorageManager=pe,f.TranscriptViewer=oe,f.formatDualDate=de,f.getThemeStyles=ne,f.loadPreferences=ee,f.offlineStorage=ve,f.parseVTT=se,f.resetPreferences=ie,f.savePreferences=A,f.toEthiopianDate=ce,Object.defineProperty(f,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
