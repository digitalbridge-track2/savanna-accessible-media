(function(y,M){typeof exports=="object"&&typeof module<"u"?M(exports):typeof define=="function"&&define.amd?define(["exports"],M):(y=typeof globalThis<"u"?globalThis:y||self,M(y.AbugidaMediaKit={}))})(this,function(y){"use strict";var Be=Object.defineProperty;var Me=(y,M,F)=>M in y?Be(y,M,{enumerable:!0,configurable:!0,writable:!0,value:F}):y[M]=F;var c=(y,M,F)=>Me(y,typeof M!="symbol"?M+"":M,F);const M="abugida_media_preferences",F={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1,transcriptVisible:!0,transcriptWidth:260,transcriptHeight:400,eslWidth:240,eslHeight:180};function ae(){try{const v=localStorage.getItem(M);if(!v)return{...F};const i=JSON.parse(v);return{...F,...i}}catch{return{...F}}}function T(v){try{const e={...ae(),...v};return localStorage.setItem(M,JSON.stringify(e)),e}catch{return{...F,...v}}}function he(){try{localStorage.removeItem(M)}catch{}return{...F}}function le(v){const i=[],e=v.split(/\r?\n/);let s=0;for(;s<e.length&&!e[s].includes("-->");)s++;for(;s<e.length;){const t=e[s].trim();if(t.includes("-->")){const n=t.split("-->").map(a=>a.trim().split(" ")[0]);if(n.length>=2){const a=pe(n[0]),l=pe(n[1]);s++;const h=[];for(;s<e.length&&e[s].trim()!=="";)h.push(e[s].trim()),s++;h.length>0&&i.push({start:a,end:l,text:h.join(`
`)})}}s++}return i}function pe(v){const i=v.split(":");let e=0,s=0,t=0;return i.length===3?(e=parseFloat(i[0]),s=parseFloat(i[1]),t=parseFloat(i[2].replace(",","."))):i.length===2&&(s=parseFloat(i[0]),t=parseFloat(i[1].replace(",","."))),e*3600+s*60+t}function ue(v,i){let e="18px";i==="small"&&(e="14px"),i==="large"&&(e="24px"),i==="xlarge"&&(e="32px");let s="#FFFFFF",t="rgba(0, 0, 0, 0.85)",n="none";return v==="yellow-black"?(s="#FFEB3B",t="#000000",n="2px solid #FFEB3B"):v==="white-black"?(s="#FFFFFF",t="#000000",n="2px solid #FFFFFF"):v==="black-yellow"&&(s="#000000",t="#FFEB3B",n="2px solid #000000"),`
    font-size: ${e};
    color: ${s};
    background: ${t};
    border: ${n};
    line-height: 1.4;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    max-width: 90%;
    margin: 0 auto;
    text-align: center;
    box-shadow: 0 2px 8px rgba(0,0,0,0.5);
    white-space: pre-line;
  `}class ge{constructor(i,e){c(this,"mainVideo");c(this,"signVideo",null);c(this,"driftThreshold");c(this,"isSyncing",!1);c(this,"onSignStatusChange");c(this,"mainListeners",{});c(this,"signListeners",{});this.mainVideo=i,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(i){if(this.cleanupSignListeners(),this.signVideo=i,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(i){this.onSignStatusChange&&this.onSignStatusChange(i)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[i,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(i,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[i,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(i,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(i){const e=!this.mainVideo.paused,s=this.mainVideo.currentTime,t=this.mainVideo.playbackRate;return this.mainVideo.src=i,this.mainVideo.load(),new Promise(n=>{const a=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",a),this.mainVideo.currentTime=s,this.mainVideo.playbackRate=t,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=s}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}n()};this.mainVideo.addEventListener("loadedmetadata",a)})}cleanupSignListeners(){if(this.signVideo)for(const[i,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(i,e);this.signListeners={}}destroy(){for(const[i,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(i,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class me{constructor(i,e){c(this,"segments",[]);c(this,"container");c(this,"onSeekAndPlay");c(this,"onFollowChange");c(this,"currentActiveId",null);c(this,"searchQuery","");c(this,"isFollowing",!0);c(this,"userPausedFollowing",!1);c(this,"locale","en");c(this,"listElement",null);c(this,"followBtn",null);c(this,"statusElement",null);this.container=i,this.onSeekAndPlay=e.onSeekAndPlay,this.onFollowChange=e.onFollowChange,this.locale=e.locale||"en"}setLocale(i){this.locale!==i&&(this.locale=i,this.render())}setSegments(i){this.segments=i.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,s)=>e.start-s.start),this.render()}setSearchQuery(i){this.searchQuery=i.toLowerCase().trim(),this.render()}getActiveSegment(i){return this.segments.length&&this.segments.find(e=>i>=e.start&&i<e.end)||null}updateActiveTime(i){const e=this.getActiveSegment(i),s=e?e.id:null;s!==this.currentActiveId&&(this.currentActiveId=s,this.highlightSegment(s),this.isFollowing&&s!==null&&this.scrollToActiveCue(s))}highlightSegment(i){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),i!==null){const s=this.container.querySelector(`[data-segment-id="${i}"]`);s&&s.classList.add("active")}}scrollToActiveCue(i){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${i}"]`);if(!e)return;this.listElement.scrollTop;const s=this.listElement.clientHeight,t=e.offsetTop,n=e.clientHeight,a=t-s/2+n/2;this.listElement.scrollTo({top:Math.max(0,a),behavior:"smooth"})}setFollowing(i){this.setFollowingState(i,!0)}setFollowingState(i,e=!1){var s;if(this.isFollowing=i,e&&(this.userPausedFollowing=!i),(s=this.onFollowChange)==null||s.call(this,i),this.followBtn){this.followBtn.setAttribute("aria-pressed",i?"true":"false");const t=this.locale==="am";i?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}i&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(i){const e=Math.floor(i/60),s=Math.floor(i%60);return`${e.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`}render(){var s;const i=this.locale==="am",e=this.searchQuery?this.segments.filter(t=>t.text.toLowerCase().includes(this.searchQuery)||t.speaker&&t.speaker.toLowerCase().includes(this.searchQuery)||t.visualDescription&&t.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
      <div class="transcript-controls-row">
        <button 
          type="button" 
          id="btn-toggle-follow" 
          class="btn-follow ${this.isFollowing?"active":""}" 
          aria-pressed="${this.isFollowing?"true":"false"}"
          aria-label="${this.isFollowing?i?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)":i?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"}">
          ${this.isFollowing?i?"✓ በተከታታይ አንብብ":"✓ Follow Playback":i?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following"}
        </button>
      </div>

      ${e.length===0?`<p class="empty-msg" role="status">
              ${i?"ምንም የሚዛመድ የጽሑፍ ግልባጭ አልተገኘም።":"No transcript segments match your search."}
            </p>`:`
          <ul class="transcript-list" role="list" id="transcript-list-box" tabindex="0" aria-label="${i?"የጽሑፍ ግልባጭ ዝርዝር":"Transcript cues"}">
            ${e.map(t=>{const n=this.formatTime(t.start),a=t.id===this.currentActiveId,l=i?`ከ ${n} ጀምሮ አጫውት`:`Play from ${n}`;return`
                <li class="transcript-item ${a?"active":""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${l}">
                    ${n}
                  </button>
                  <div class="segment-content">
                    ${t.speaker?`<strong class="speaker-label">${this.escapeHtml(t.speaker)}:</strong>`:""}
                    <span class="segment-text">${this.escapeHtml(t.text)}</span>
                    ${t.visualDescription?`<div class="visual-desc" aria-label="${i?"ምስላዊ ማብራሪያ":"Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${i?"ምስላዊ":"Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
                           </div>`:""}
                  </div>
                </li>
              `}).join("")}
          </ul>
        `}
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(s=this.followBtn)==null||s.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const t=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",t,{passive:!0}),this.listElement.addEventListener("touchmove",t,{passive:!0}),this.listElement.addEventListener("keydown",n=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(n.key)&&t()})}this.container.querySelectorAll(".btn-seek-time").forEach(t=>{t.addEventListener("click",n=>{const a=parseFloat(n.currentTarget.dataset.time||"0");this.onSeekAndPlay(a),n.currentTarget.focus()})})}escapeHtml(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class fe{constructor(i,e){c(this,"container");c(this,"messages",[]);c(this,"locale","en");c(this,"onSeekAndPlay");c(this,"currentTime",0);c(this,"searchQuery","");c(this,"isAutoScroll",!0);c(this,"listElement",null);c(this,"currentActiveId",null);this.container=i,this.locale=e.locale||"en",this.onSeekAndPlay=e.onSeekAndPlay}setLocale(i){this.locale!==i&&(this.locale=i,this.render())}setMessages(i){this.messages=[...i].sort((e,s)=>e.timestamp-s.timestamp),this.render()}setSearchQuery(i){this.searchQuery=i.toLowerCase().trim(),this.render()}setAutoScroll(i){this.isAutoScroll=i}updateTime(i){this.currentTime=i;const e=this.messages.filter(n=>n.timestamp<=i),s=e.length>0?e[e.length-1]:null,t=s?s.id:null;t!==this.currentActiveId&&(this.currentActiveId=t,this.updateActiveStyles(),this.isAutoScroll&&t&&this.scrollToMessage(t))}updateActiveStyles(){if(!this.container)return;this.container.querySelectorAll(".chat-replay-item").forEach(e=>{const s=e.getAttribute("data-chat-id");Number(e.getAttribute("data-timestamp")||"0")<=this.currentTime?(e.classList.add("is-delivered"),e.classList.remove("is-future")):(e.classList.remove("is-delivered"),e.classList.add("is-future")),s===this.currentActiveId?e.classList.add("is-active-latest"):e.classList.remove("is-active-latest")})}scrollToMessage(i){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-chat-id="${i}"]`);e&&e.scrollIntoView({behavior:"smooth",block:"nearest"})}render(){const i=this.locale==="am";if(!this.messages.length){this.container.innerHTML=`
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${i?"የቀጥታ ውይይት መልዕክቶች አልተገኙም።":"No live chat messages recorded for this session."}
        </div>
      `;return}const e=this.messages.filter(t=>{if(!this.searchQuery)return!0;const n=(i?t.message.am:t.message.en).toLowerCase(),a=t.sender.toLowerCase();return n.includes(this.searchQuery)||a.includes(this.searchQuery)});this.container.innerHTML=`
      <ol class="chat-replay-list" role="list" aria-label="${i?"የቀጥታ ትምህርት ውይይት መልዕክቶች":"Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map(t=>{const n=t.timestamp<=this.currentTime,a=t.id===this.currentActiveId,l=t.role==="instructor",h=l?i?"አስተማሪ":"Instructor":i?"ተማሪ":"Student",p=i?t.message.am:t.message.en,g=i?`ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ`:`Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;return`
              <li 
                class="chat-replay-item ${n?"is-delivered":"is-future"} ${a?"is-active-latest":""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${g}"
                title="${g}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${a?"#EFF6FF":l?"#F8FAFC":"#FFFFFF"};
                  border: 1px solid ${a?"#93C5FD":"#E2E8F0"};
                  border-left: 3.5px solid ${a?"#0071E3":l?"#10B981":"#94A3B8"};
                  cursor: pointer;
                  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
                  opacity: ${n?"1":"0.55"};
                ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; gap: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <span style="font-weight: 600; font-size: 0.82rem; color: #0F172A;">${t.sender}</span>
                    <span style="
                      font-size: 0.68rem;
                      font-weight: 700;
                      text-transform: uppercase;
                      padding: 1px 5px;
                      border-radius: 4px;
                      background: ${l?"#D1FAE5":"#E2E8F0"};
                      color: ${l?"#065F46":"#475569"};
                    ">${h}</span>
                  </div>
                  <span 
                    class="btn-chat-timestamp" 
                    style="
                      font-family: monospace;
                      font-size: 0.75rem;
                      font-weight: 600;
                      color: #0071E3;
                      background: #F0F6FF;
                      padding: 2px 6px;
                      border-radius: 4px;
                      border: 1px solid #BFDBFE;
                    ">
                    ▶ ${t.timeDisplay}
                  </span>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.45; color: #334155;">
                  ${p}
                </div>
              </li>
            `}).join("")}
      </ol>
    `,this.listElement=this.container.querySelector(".chat-replay-list"),this.container.querySelectorAll(".chat-replay-item").forEach(t=>{const n=Number(t.getAttribute("data-timestamp")||"0"),a=()=>{this.onSeekAndPlay(n)};t.addEventListener("click",a),t.addEventListener("keydown",l=>{const h=l;(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),a())})})}}const $={play:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',restart:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',rewind:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',forward:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',cc:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',esl:'<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>',ad:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3.5h6.2c4.2 0 7.3 3 7.3 7.5s-3.1 7.5-7.3 7.5H3V3.5zm3.6 3.4v8.2h2.4c2.2 0 3.7-1.7 3.7-4.1s-1.5-4.1-3.7-4.1H6.6z"/><path d="M17.5 8.5c1 1.5 1 3.5 0 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20.5 6c2 2.7 2 7.3 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',transcript:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',faster:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M12.5 12.9a1.5 1.5 0 0 0 1-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5a1.5 1.5 0 0 0 .5 1.1l3.2 3.2 1.1-1.1-2.8-1.8z"/><path d="M18 12v6M15 15h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',slower:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M11 11.5a1.5 1.5 0 0 0-1 1.4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5a1.5 1.5 0 0 0-.5-1.1l-3.2-3.2-1.1 1.1 2.8 1.8z"/><rect x="15" y="14" width="6" height="2.2" rx="1"/></svg>',prefs:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',fullscreenEnter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',fullscreenExit:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',volumeUnmuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',volumeMuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'};class ce extends HTMLElement{constructor(){super();c(this,"shadow");c(this,"manifest",null);c(this,"activeLocale","en");c(this,"prefs");c(this,"mainVideo");c(this,"signVideo",null);c(this,"syncController");c(this,"pendingSeekTime",null);c(this,"currentCues",[]);c(this,"captionOverlay");c(this,"transcriptViewer");c(this,"liveChatViewer");c(this,"liveChatMessages",[]);c(this,"activeLeftTab","transcript");c(this,"isPreferencesOpen",!1);c(this,"onCaptionsUpdated",()=>{this.initTracksAndTranscript()});this.shadow=this.attachShadow({mode:"open"}),this.prefs=ae()}static get observedAttributes(){return["manifest-src","locale","lang","src","captions","sign","describe","api"]}connectedCallback(){this.activeLocale=this.getAttribute("lang")||this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e?this.loadManifest(e):this.getAttribute("src")&&this.initFromAttributes(),window.addEventListener("db-player:captions-updated",this.onCaptionsUpdated)}disconnectedCallback(){window.removeEventListener("db-player:captions-updated",this.onCaptionsUpdated),this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,s,t){s!==t&&(e==="locale"||e==="lang"?(this.activeLocale=t||"en",this.updateLocaleStrings()):e==="manifest-src"?this.loadManifest(t):(e==="src"||e==="captions"||e==="sign"||e==="describe")&&(this.getAttribute("manifest-src")||this.initFromAttributes()))}initFromAttributes(){const e=this.getAttribute("src");if(!e)return;const s=this.getAttribute("lang")||this.getAttribute("locale")||"en";this.activeLocale=s;const t=this.getAttribute("captions")||"",n=this.getAttribute("sign"),a=this.getAttribute("describe"),l=t.split(",").map(h=>h.trim()).filter(Boolean).map(h=>{const p=h.includes(".am.")||h.endsWith("am.vtt")||h.includes("am");return{id:p?"cap-am":"cap-en",language:p?"am":"en",label:p?"አማርኛ":"English",src:h}});this.manifest={id:"lesson-player",version:"1.0.0",title:{en:"Lesson Video",am:"የትምህርት ቪዲዮ"},sources:[{id:"main-video",kind:"main",src:e,mimeType:"video/mp4"},...n?[{id:"sign-video",kind:"sign",src:n,mimeType:"video/mp4"}]:[]],captionTracks:l,audioDescription:a?{src:a}:void 0},this.render(),this.initTracksAndTranscript()}async loadManifest(e){var s,t;try{const n=await fetch(e);if(!n.ok)throw new Error(`HTTP error ${n.status}`);const a=await n.json();let l;try{l=new URL(e,window.location.href)}catch{l=new URL(window.location.href)}const h=p=>{if(!p)return p;try{return new URL(p,l).href}catch{return p}};if(this.manifest={...a,poster:a.poster?{...a.poster,src:h(a.poster.src)}:void 0,sources:(a.sources||[]).map(p=>({...p,src:h(p.src)})),captionTracks:(a.captionTracks||[]).map(p=>({...p,src:h(p.src)})),transcript:a.transcript?{...a.transcript,src:h(a.transcript.src)}:a.transcript,liveSession:a.liveSession?{...a.liveSession,chatSrc:a.liveSession.chatSrc?h(a.liveSession.chatSrc):void 0}:void 0},(t=(s=this.manifest)==null?void 0:s.liveSession)!=null&&t.chatSrc)try{const p=await fetch(this.manifest.liveSession.chatSrc);p.ok&&(this.liveChatMessages=await p.json(),this.liveChatViewer&&this.liveChatViewer.setMessages(this.liveChatMessages))}catch(p){console.warn("Could not load live chat messages:",p)}this.render(),await this.initTracksAndTranscript()}catch(n){this.renderError(n instanceof Error?n.message:"Failed to load manifest")}}async initTracksAndTranscript(){var s;if(!this.manifest)return;await this.loadCaptionTrack(this.prefs.captionLanguage);const e=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-transcript:${this.activeLocale}`):null;if(e)try{const n=(JSON.parse(e).segments||[]).map(a=>({id:a.id,start:a.start_ms!==void 0?a.start_ms/1e3:a.start||0,end:a.end_ms!==void 0?a.end_ms/1e3:a.end||0,speaker:a.speaker,text:a.text||a.reviewedText||a.draft_text||a.draftText||"",visualDescription:a.visual_description||a.visualDescription}));this.transcriptViewer.setSegments(n);return}catch(t){console.warn("Could not parse custom transcript, falling back to manifest src",t)}if((s=this.manifest.transcript)!=null&&s.src)try{const t=await fetch(this.manifest.transcript.src);if(t.ok){const a=((await t.json()).segments||[]).map(l=>({id:l.id,start:l.start_ms!==void 0?l.start_ms/1e3:l.start||0,end:l.end_ms!==void 0?l.end_ms/1e3:l.end||0,speaker:l.speaker,text:l.text||l.draft_text||"",visualDescription:l.visual_description||l.visualDescription}));this.transcriptViewer.setSegments(a)}}catch(t){console.warn("Could not load external transcript file, using fallback cues",t)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const s=this.manifest.captionTracks.find(t=>t.language===e);if(!s){this.currentCues=[],this.updateCaptionDisplay();return}try{const t=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-vtt:${e}`):null;if(t)this.currentCues=le(t);else{const n=await fetch(s.src);if(n.ok){const a=await n.text();this.currentCues=le(a)}}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,s=this.currentCues.find(t=>e>=t.start&&e<=t.end);s?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=ue(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=s.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const s=()=>{this.mainVideo.removeEventListener("loadedmetadata",s),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",s);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(s=>{console.warn("Playback interrupted or prevented on seek:",s)})}renderError(e){this.shadow.innerHTML=`
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
    `}render(){var g,o,k,R;const e=this.activeLocale==="am",s=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",t=(g=this.manifest)==null?void 0:g.sources.find(f=>f.kind==="main"),n=(o=this.manifest)==null?void 0:o.sources.find(f=>f.kind==="sign"),a=this.prefs.transcriptWidth||F.transcriptWidth||260,l=this.prefs.transcriptHeight||F.transcriptHeight||400,h=this.prefs.eslWidth||F.eslWidth||240,p=this.prefs.eslHeight||F.eslHeight||180;this.shadow.innerHTML=`
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
        @media (max-width: 1120px) {
          .player-stage {
            flex-wrap: wrap;
          }
          .main-player-panel {
            min-width: 100% !important;
            max-width: 100% !important;
            order: 1;
          }
          #transcript-view-panel {
            order: 2;
            flex: 1 1 320px;
            max-width: 100%;
          }
          #sign-view-panel {
            order: 3;
            flex: 1 1 260px;
            max-width: 100%;
          }
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

        /* Center Main Player Panel - Balanced Horizontal Cinema Proportion */
        .main-player-panel {
          flex: 3 1 760px;
          min-width: 480px;
          max-width: 980px;
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
        :host(:fullscreen) #player-container,
        :host(:-webkit-full-screen) #player-container,
        #player-container:fullscreen,
        #player-container:-webkit-full-screen,
        .main-player-panel:fullscreen,
        .main-player-panel:-webkit-full-screen,
        .main-player-panel.is-fullscreen,
        :host([data-fullscreen="true"]) #player-container {
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
        #player-container:fullscreen .video-viewport,
        #player-container:-webkit-full-screen .video-viewport,
        .main-player-panel:fullscreen .video-viewport,
        .main-player-panel:-webkit-full-screen .video-viewport,
        .main-player-panel.is-fullscreen .video-viewport,
        :host([data-fullscreen="true"]) .video-viewport {
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
          padding: 4px 6px;
          gap: 2px;
          flex-wrap: nowrap;
          overflow-x: visible;
        }
        .controls-cluster {
          display: flex;
          align-items: center;
          gap: 1px;
        }
        .btn-ctrl {
          background: transparent;
          color: #F8F9FA;
          border: 1px solid transparent;
          border-radius: 4px;
          padding: 0;
          width: 30px;
          height: 30px;
          min-width: 30px;
          min-height: 30px;
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
        #btn-esl {
          width: 34px;
          min-width: 34px;
        }
        .ctrl-divider {
          display: inline-block;
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.22);
          margin: 0 2px;
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
        .left-panel-tabs {
          display: flex;
          background: #F1F5F9;
          border-radius: 6px;
          padding: 3px;
          gap: 3px;
          margin-bottom: 0.75rem;
          user-select: none;
          flex-shrink: 0;
        }
        .tab-btn {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.35rem 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          background: transparent;
          color: #475569;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .tab-btn:hover {
          color: #0F172A;
        }
        .tab-btn.active {
          background: #FFFFFF;
          color: #0F172A;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08);
        }
        .tab-btn:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }
        .tab-badge {
          background: #E2E8F0;
          color: #0F172A;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 6px;
          border-radius: 980px;
        }
        .tab-btn.active .tab-badge {
          background: #DBEAFE;
          color: #1D4ED8;
        }
        .chat-replay-item:hover {
          background: #F8FAFC !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        .chat-replay-item:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3) !important;
          outline-offset: 2px;
        }
        .live-chat-scroll-area {
          flex: 1;
          min-height: 0;
          min-width: 0;
          overflow-y: auto;
        }
        .live-chat-scroll-area::-webkit-scrollbar {
          width: 6px;
        }
        .live-chat-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.18);
          border-radius: 980px;
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
        @media (max-width: 980px) {
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

      <section class="player-component" aria-label="${s}">
        <div class="player-stage" id="player-stage">

          <!-- LEFT: Movable & Resizable Transcript Window (Outside of video frame) -->
          <div 
            class="window-panel transcript-window" 
            id="transcript-window"
            style="width: ${a}px; height: ${l}px; flex: 0 0 ${a}px; display: ${this.prefs.transcriptVisible!==!1?"flex":"none"};"
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

            <!-- Transcript & Live Chat Replay Body Content -->
            <div class="transcript-body" id="transcript-body">
              <!-- Left Panel Segmented View Tabs (Transcript | Live Chat Replay) -->
              <div class="left-panel-tabs" role="tablist" aria-label="${e?"የትምህርት ይዘት እይታ":"Session Content View"}">
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab==="transcript"?"active":""}" 
                  id="tab-btn-transcript" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab==="transcript"}"
                  aria-controls="transcript-view-panel">
                  📄 ${e?"የጽሑፍ ግልባጭ":"Transcript"}
                </button>
                <button 
                  type="button" 
                  class="tab-btn ${this.activeLeftTab==="chat"?"active":""}" 
                  id="tab-btn-chat" 
                  role="tab" 
                  aria-selected="${this.activeLeftTab==="chat"}"
                  aria-controls="live-chat-view-panel">
                  💬 ${e?"የቀጥታ ውይይት ድጋሚ":"Live Chat Replay"} <span class="tab-badge" id="chat-count-badge">${this.liveChatMessages.length||10}</span>
                </button>
              </div>

              <!-- View 1: Lesson Transcript -->
              <div id="transcript-view-panel" style="display: ${this.activeLeftTab==="transcript"?"flex":"none"}; flex-direction: column; flex: 1; min-height: 0;">
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

              <!-- View 2: Recorded Live Session Chat Replay -->
              <div id="live-chat-view-panel" style="display: ${this.activeLeftTab==="chat"?"flex":"none"}; flex-direction: column; flex: 1; min-height: 0;">
                <div class="transcript-title-row">
                  <h3 class="transcript-title">${e?"የቀጥታ ውይይት ድጋሚ":"Live Chat Replay"}</h3>
                  <input 
                    type="search" 
                    id="live-chat-search" 
                    class="search-box" 
                    placeholder="${e?"በውይይት ውስጥ ይፈልጉ...":"Search chat questions..."}" 
                    aria-label="${e?"በቀጥታ ውይይት ውስጥ ይፈልጉ":"Search live chat"}">
                </div>
                <div id="live-chat-target" class="live-chat-scroll-area"></div>
              </div>
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
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${s} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${((R=(k=this.manifest)==null?void 0:k.poster)==null?void 0:R.src)||""}"
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
                    <span id="play-icon" aria-hidden="true">${$.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}" title="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}">
                    <span aria-hidden="true">${$.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}" title="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${$.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}" title="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${$.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage!=="off"?"true":"false"}" aria-label="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}" title="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}">
                    <span aria-hidden="true">${$.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible?"true":"false"}" aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}" title="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${$.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled?"true":"false"}" aria-label="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}" title="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}">
                    <span aria-hidden="true">${$.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible!==!1?"true":"false"}" aria-label="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}" title="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}">
                    <span aria-hidden="true">${$.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}" title="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}">
                    <span aria-hidden="true">${$.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}" title="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}">
                    <span aria-hidden="true">${$.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}" title="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
                    <span aria-hidden="true">${$.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}" title="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${$.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}" title="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${$.volumeUnmuted}</span>
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
            style="width: ${h}px; height: ${p}px; flex: 0 0 ${h}px; display: ${this.prefs.eslVisible&&n?"flex":"none"};"
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
                src="${n?n.src:""}">
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
            <h3 id="prefs-title">${e?"የተደራሽነት እና አቀማመጥ ምርጫዎች":"Accessibility & Layout Settings"}</h3>
            
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

            <!-- Ethiopian Sign Language (ESL) Toggle -->
            <div class="form-row">
              <label for="toggle-esl-visibility">${e?"የምልክት ቋንቋ (ESL) ማሳያ:":"Sign Language (ESL):"}</label>
              <select id="toggle-esl-visibility">
                <option value="show" ${this.prefs.eslVisible?"selected":""}>${e?"በጎን አሳይ (Visible)":"Show on side"}</option>
                <option value="hide" ${this.prefs.eslVisible?"":"selected"}>${e?"ደብቅ (Hidden)":"Hide"}</option>
              </select>
            </div>

            <!-- Interactive Transcript Toggle -->
            <div class="form-row">
              <label for="toggle-transcript-visibility">${e?"የትምህርቱ የጽሑፍ ግልባጭ:":"Interactive Transcript:"}</label>
              <select id="toggle-transcript-visibility">
                <option value="show" ${this.prefs.transcriptVisible!==!1?"selected":""}>${e?"በጎን አሳይ (Visible)":"Show on side"}</option>
                <option value="hide" ${this.prefs.transcriptVisible===!1?"selected":""}>${e?"ደብቅ (Hidden)":"Hide"}</option>
              </select>
            </div>

            <!-- Audio Description Toggle -->
            <div class="form-row">
              <label for="toggle-ad-enabled">${e?"የድምጽ ማብራሪያ (AD):":"Audio Description (AD):"}</label>
              <select id="toggle-ad-enabled">
                <option value="on" ${this.prefs.audioDescriptionEnabled?"selected":""}>${e?"አብራ (Enabled)":"Enabled"}</option>
                <option value="off" ${this.prefs.audioDescriptionEnabled?"":"selected"}>${e?"አጥፋ (Disabled)":"Disabled"}</option>
              </select>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
              <button type="button" class="btn-dialog-action btn-dialog-reset" id="btn-reset-layout">
                ↺ ${e?"አቀማመጥን ዳግም አስጀምር":"Reset Layout & Settings"}
              </button>
              <button type="button" class="btn-dialog-action btn-dialog-save" id="btn-close-prefs">
                ${e?"ተግብር እና ዝጋ":"Save & Close"}
              </button>
            </div>
          </div>
        </div>
      </section>
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupWindowInteractions()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new ge(this.mainVideo,{driftThreshold:.25,onSignStatusChange:n=>{const a=this.shadow.getElementById("sign-status-indicator");a&&(n==="loading"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):n==="error"?(a.style.display="inline-block",a.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",a.style.background="#FEF2F2",a.style.color="#991B1B"):(a.style.display="inline-block",a.textContent="EthSL",a.style.background="rgba(255,255,255,0.2)",a.style.color="#FFF"))}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target"),s=this.shadow.getElementById("live-chat-target"),t=this.shadow.getElementById("cb-auto-scroll");this.transcriptViewer=new me(e,{locale:this.activeLocale,onSeekAndPlay:n=>{this.seekAndPlay(n)},onFollowChange:n=>{t&&(t.checked=n)}}),s&&(this.liveChatViewer=new fe(s,{locale:this.activeLocale,onSeekAndPlay:n=>{this.seekAndPlay(n)}}),this.liveChatMessages.length&&this.liveChatViewer.setMessages(this.liveChatMessages))}setupWindowInteractions(){const e=this.shadow.getElementById("player-stage");if(!e)return;const s=(t,n,a,l,h,p,g)=>{const o=this.shadow.getElementById(t),k=this.shadow.getElementById(n),R=this.shadow.getElementById(a),f=this.shadow.getElementById(l),U=this.shadow.getElementById(h),G=p?this.shadow.getElementById(p):null;if(!o||!k||!R)return;let b=null,Q=!1,_="corner",Z=0,ee=0,W=0,te=0,q=null;const D=u=>{if(!Q)return;const m=u.clientX-Z,L=u.clientY-ee;q!==null&&cancelAnimationFrame(q),q=requestAnimationFrame(()=>{let E=W,z=te;_==="corner"||_==="right"?E=Math.min(g.maxWidth,Math.max(g.minWidth,W+m)):_==="left"&&(E=Math.min(g.maxWidth,Math.max(g.minWidth,W-m))),(_==="corner"||_==="bottom")&&(z=Math.min(g.maxHeight,Math.max(g.minHeight,te+L))),o.style.width=`${E}px`,o.style.height=`${z}px`,o.style.flex=`0 0 ${E}px`,b&&(b.style.width=`${E}px`,b.style.height=`${z}px`,b.style.flex=`0 0 ${E}px`)})},V=()=>{Q&&(Q=!1,o.classList.remove("is-resizing"),window.removeEventListener("pointermove",D),window.removeEventListener("pointerup",V),window.removeEventListener("pointercancel",V),q!==null&&(cancelAnimationFrame(q),q=null),g.onSaveSize(o.offsetWidth,o.offsetHeight))},A=(u,m)=>{Q=!0,_=u,Z=m.clientX,ee=m.clientY,W=o.offsetWidth,te=o.offsetHeight,o.classList.add("is-resizing"),window.addEventListener("pointermove",D),window.addEventListener("pointerup",V),window.addEventListener("pointercancel",V),m.preventDefault(),m.stopPropagation()};R.addEventListener("pointerdown",u=>A("corner",u)),f==null||f.addEventListener("pointerdown",u=>A("bottom",u)),U==null||U.addEventListener("pointerdown",u=>A("right",u)),G==null||G.addEventListener("pointerdown",u=>A("left",u)),R.addEventListener("keydown",u=>{let m=o.offsetWidth,L=o.offsetHeight,E=!1;u.key==="ArrowRight"?(m=Math.min(g.maxWidth,m+20),E=!0):u.key==="ArrowLeft"?(m=Math.max(g.minWidth,m-20),E=!0):u.key==="ArrowDown"?(L=Math.min(g.maxHeight,L+20),E=!0):u.key==="ArrowUp"&&(L=Math.max(g.minHeight,L-20),E=!0),E&&(u.preventDefault(),o.style.width=`${m}px`,o.style.height=`${L}px`,o.style.flex=`0 0 ${m}px`,b&&(b.style.width=`${m}px`,b.style.height=`${L}px`,b.style.flex=`0 0 ${m}px`),g.onSaveSize(m,L))});let w=!1,B=0,x=0,Y=0,X=0,N=null;o.addEventListener("pointerdown",()=>{if(o.classList.contains("floating")){o.style.zIndex="100";const u=t==="transcript-window"?"esl-window":"transcript-window",m=this.shadow.getElementById(u);m&&m.classList.contains("floating")&&(m.style.zIndex="90")}});const j=u=>{const m=u.clientX-B,L=u.clientY-x;!w&&Math.hypot(m,L)>4&&(w=!0,!b&&o.parentNode&&(b=document.createElement("div"),b.className="window-placeholder",b.style.width=`${o.offsetWidth}px`,b.style.height=`${o.offsetHeight}px`,b.style.flex=o.style.flex||`0 0 ${o.offsetWidth}px`,o.parentNode.insertBefore(b,o)),o.classList.add("floating"),o.style.position="absolute",o.style.zIndex="100"),w&&(N!==null&&cancelAnimationFrame(N),N=requestAnimationFrame(()=>{const E=Y+m,z=X+L;o.style.left=`${E}px`,o.style.top=`${z}px`,o.style.right="auto",o.style.bottom="auto"}))},K=()=>{w&&(w=!1),window.removeEventListener("pointermove",j),window.removeEventListener("pointerup",K),window.removeEventListener("pointercancel",K),N!==null&&(cancelAnimationFrame(N),N=null)};k.addEventListener("pointerdown",u=>{if(u.target.tagName==="INPUT"||u.target.tagName==="SELECT")return;B=u.clientX,x=u.clientY;const m=e.getBoundingClientRect(),L=o.getBoundingClientRect();Y=o.style.left?parseFloat(o.style.left):L.left-m.left,X=o.style.top?parseFloat(o.style.top):L.top-m.top,w=!1,o.style.zIndex="100";const E=t==="transcript-window"?"esl-window":"transcript-window",z=this.shadow.getElementById(E);z&&z.classList.contains("floating")&&(z.style.zIndex="90"),window.addEventListener("pointermove",j),window.addEventListener("pointerup",K),window.addEventListener("pointercancel",K)}),k.addEventListener("keydown",u=>{let m=!1;const L=20;if(!o.classList.contains("floating")){!b&&o.parentNode&&(b=document.createElement("div"),b.className="window-placeholder",b.style.width=`${o.offsetWidth}px`,b.style.height=`${o.offsetHeight}px`,b.style.flex=o.style.flex||`0 0 ${o.offsetWidth}px`,o.parentNode.insertBefore(b,o));const H=e.getBoundingClientRect(),P=o.getBoundingClientRect();o.classList.add("floating"),o.style.position="absolute",o.style.zIndex="100",o.style.left=`${P.left-H.left}px`,o.style.top=`${P.top-H.top}px`}let E=parseFloat(o.style.left)||0,z=parseFloat(o.style.top)||0;u.key==="ArrowRight"?(E+=L,m=!0):u.key==="ArrowLeft"?(E-=L,m=!0):u.key==="ArrowDown"?(z+=L,m=!0):u.key==="ArrowUp"&&(z-=L,m=!0),m&&(u.preventDefault(),o.style.left=`${E}px`,o.style.top=`${z}px`)});const ie=()=>{o.classList.remove("floating"),o.style.position="",o.style.left="",o.style.top="",o.style.right="",o.style.bottom="",o.style.zIndex="",b&&(b.remove(),b=null)};k.addEventListener("dblclick",ie),o.__reDock=ie};s("transcript-window","transcript-drag-handle","transcript-resize-handle","transcript-resize-edge-bottom","transcript-resize-edge-right",null,{minWidth:220,maxWidth:750,minHeight:200,maxHeight:900,onSaveSize:(t,n)=>{this.prefs.transcriptWidth=t,this.prefs.transcriptHeight=n,T({transcriptWidth:t,transcriptHeight:n})}}),s("esl-window","esl-drag-handle","esl-resize-handle","esl-resize-edge-bottom","esl-resize-edge-right","esl-resize-edge-left",{minWidth:200,maxWidth:700,minHeight:160,maxHeight:700,onSaveSize:(t,n)=>{this.prefs.eslWidth=t,this.prefs.eslHeight=n,T({eslWidth:t,eslHeight:n})}})}attachEventListeners(){var ke,Ee,Le,Fe,Se,$e,Ve,Ce;const e=this.shadow.getElementById("btn-play"),s=this.shadow.getElementById("play-icon"),t=this.shadow.getElementById("big-play-btn"),n=this.shadow.getElementById("btn-restart"),a=this.shadow.getElementById("btn-speed-faster"),l=this.shadow.getElementById("btn-speed-slower"),h=this.shadow.getElementById("speed-display"),p=this.shadow.getElementById("state-display"),g=this.shadow.getElementById("btn-fullscreen"),o=this.shadow.getElementById("fullscreen-icon"),k=this.shadow.getElementById("btn-mute"),R=this.shadow.getElementById("mute-icon"),f=this.shadow.getElementById("player-container"),U=this.shadow.getElementById("seek-scrubber"),G=this.shadow.getElementById("time-display"),b=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",b),t&&t.addEventListener("click",b),this.mainVideo.addEventListener("click",b),this.mainVideo.addEventListener("play",()=>{s&&(s.innerHTML=$.pause),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),t==null||t.classList.add("is-hidden"),p&&(p.textContent=this.activeLocale==="am"?"እየተጫወተ ነው":"Playing")}),this.mainVideo.addEventListener("pause",()=>{s&&(s.innerHTML=$.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),p&&(p.textContent=this.mainVideo.ended?this.activeLocale==="am"?"ተጠናቋል":"End of track":this.activeLocale==="am"?"ቆሟል":"Paused")}),this.mainVideo.addEventListener("ended",()=>{s&&(s.innerHTML=$.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),p&&(p.textContent=this.activeLocale==="am"?"ተጠናቋል":"End of track"),this.dispatchEvent(new CustomEvent("db-player:complete",{bubbles:!0,composed:!0,detail:{}}))}),n==null||n.addEventListener("click",()=>{this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0)});const Q=[.5,.75,1,1.25,1.5,2],_=()=>{const r=this.mainVideo.playbackRate;h&&(h.textContent=`Speed: ${r}x`)};a==null||a.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,d=Q.filter(I=>I>r+.01),S=d.length>0?d[0]:2;this.mainVideo.playbackRate=S,_()}),l==null||l.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,d=Q.filter(I=>I<r-.01),S=d.length>0?d[d.length-1]:.5;this.mainVideo.playbackRate=S,_()});const Z=()=>!!(document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement||f!=null&&f.classList.contains("is-fullscreen")||this.hasAttribute("data-fullscreen")),ee=async()=>{try{Z()?((document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement)&&(document.exitFullscreen?await document.exitFullscreen():document.webkitExitFullscreen&&await document.webkitExitFullscreen()),f==null||f.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen"),W()):f!=null&&f.requestFullscreen?await f.requestFullscreen():f!=null&&f.webkitRequestFullscreen?await f.webkitRequestFullscreen():(f==null||f.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true"),W())}catch(r){console.warn("Fullscreen native request fell back to CSS:",r),(f==null?void 0:f.classList.contains("is-fullscreen"))?(f==null||f.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen")):(f==null||f.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true")),W()}};g==null||g.addEventListener("click",ee);const W=()=>{const r=Z();g==null||g.setAttribute("aria-pressed",r?"true":"false"),g==null||g.setAttribute("aria-label",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),g==null||g.setAttribute("title",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),o&&(o.innerHTML=r?$.fullscreenExit:$.fullscreenEnter)};document.addEventListener("fullscreenchange",W),document.addEventListener("webkitfullscreenchange",W);const te=()=>{this.mainVideo.muted=!this.mainVideo.muted};k==null||k.addEventListener("click",te);const q=()=>{const r=this.mainVideo.muted;k==null||k.setAttribute("aria-pressed",r?"true":"false"),k==null||k.setAttribute("aria-label",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),k==null||k.setAttribute("title",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),R&&(R.innerHTML=r?$.volumeMuted:$.volumeUnmuted)};this.mainVideo.addEventListener("volumechange",q),this.mainVideo.addEventListener("timeupdate",()=>{const r=this.mainVideo.currentTime,d=this.mainVideo.duration||1;U&&!U.matches(":active")&&(U.value=(r/d*100).toFixed(1)),G&&(G.textContent=`${this.formatTime(r)} / ${this.formatTime(d)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(r),this.liveChatViewer&&this.liveChatViewer.updateTime(r),this.dispatchEvent(new CustomEvent("db-player:progress",{bubbles:!0,composed:!0,detail:{seconds:Math.floor(r),percent:Math.round(r/d*100)}}))}),U.addEventListener("input",()=>{const r=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(U.value)/100*r}),(ke=this.shadow.getElementById("btn-rewind"))==null||ke.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(Ee=this.shadow.getElementById("btn-forward"))==null||Ee.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const D=this.shadow.getElementById("btn-ad");D==null||D.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,T({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),D.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const r=this.prefs.audioDescriptionEnabled?"described":"main",d=this.manifest.sources.find(S=>S.kind===r)||this.manifest.sources.find(S=>S.kind==="main");d&&await this.syncController.switchSource(d.src)});const V=this.shadow.getElementById("btn-cc");V==null||V.addEventListener("click",async()=>{const r=["en","am","off"],d=(r.indexOf(this.prefs.captionLanguage)+1)%r.length;this.prefs.captionLanguage=r[d],T({captionLanguage:this.prefs.captionLanguage});const S=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",S?"false":"true"),V.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),V.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),await this.loadCaptionTrack(this.prefs.captionLanguage)});const A=this.shadow.getElementById("btn-esl"),w=this.shadow.getElementById("esl-window");A==null||A.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,T({eslVisible:this.prefs.eslVisible}),A.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),w&&(w.style.display=this.prefs.eslVisible?"flex":"none")});const B=this.shadow.getElementById("btn-transcript-toggle"),x=this.shadow.getElementById("transcript-window");B==null||B.addEventListener("click",()=>{const d=!((x==null?void 0:x.style.display)!=="none");this.prefs.transcriptVisible=d,T({transcriptVisible:d}),B.setAttribute("aria-pressed",d?"true":"false"),x&&(x.style.display=d?"flex":"none")});const Y=this.shadow.getElementById("cb-auto-scroll");Y==null||Y.addEventListener("change",()=>{this.transcriptViewer.setFollowing(Y.checked)});const X=this.shadow.getElementById("select-transcript-lang");X==null||X.addEventListener("change",()=>{const r=X.value;this.setAttribute("locale",r)});const N=()=>{this.isPreferencesOpen=!0;const r=this.shadow.getElementById("select-cc-lang"),d=this.shadow.getElementById("select-cc-size"),S=this.shadow.getElementById("select-cc-theme"),I=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),J=this.shadow.getElementById("toggle-ad-enabled");r&&(r.value=this.prefs.captionLanguage),d&&(d.value=this.prefs.captionSize),S&&(S.value=this.prefs.captionTheme),I&&(I.value=this.prefs.eslVisible?"show":"hide"),O&&(O.value=this.prefs.transcriptVisible!==!1?"show":"hide"),J&&(J.value=this.prefs.audioDescriptionEnabled?"on":"off"),u&&(u.style.display="flex"),r==null||r.focus()},j=this.shadow.getElementById("btn-prefs"),K=this.shadow.getElementById("btn-transcript-prefs"),ie=this.shadow.getElementById("btn-esl-prefs"),u=this.shadow.getElementById("prefs-dialog"),m=this.shadow.getElementById("btn-close-prefs"),L=this.shadow.getElementById("btn-reset-layout");j==null||j.addEventListener("click",N),K==null||K.addEventListener("click",N),ie==null||ie.addEventListener("click",N),m==null||m.addEventListener("click",async()=>{var se;const r=this.shadow.getElementById("select-cc-lang"),d=this.shadow.getElementById("select-cc-size"),S=this.shadow.getElementById("select-cc-theme"),I=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),J=this.shadow.getElementById("toggle-ad-enabled");if(r&&r.value!==this.prefs.captionLanguage){if(this.prefs.captionLanguage=r.value,T({captionLanguage:this.prefs.captionLanguage}),V){const C=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",C?"false":"true")}await this.loadCaptionTrack(this.prefs.captionLanguage)}d&&d.value!==this.prefs.captionSize&&(this.prefs.captionSize=d.value,T({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()),S&&S.value!==this.prefs.captionTheme&&(this.prefs.captionTheme=S.value,T({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay());const oe=!!(this.signVideo||(se=this.manifest)!=null&&se.sources.some(C=>C.kind==="sign"));if(I){const C=I.value==="show";this.prefs.eslVisible=C,T({eslVisible:C}),A&&A.setAttribute("aria-pressed",C?"true":"false"),w&&(w.style.display=C&&oe?"flex":"none")}if(O){const C=O.value==="show";this.prefs.transcriptVisible=C,T({transcriptVisible:C}),B&&B.setAttribute("aria-pressed",C?"true":"false"),x&&(x.style.display=C?"flex":"none")}if(J){const C=J.value==="on";this.prefs.audioDescriptionEnabled=C,T({audioDescriptionEnabled:C}),D&&D.setAttribute("aria-pressed",C?"true":"false")}this.isPreferencesOpen=!1,u&&(u.style.display="none"),j==null||j.focus()}),L==null||L.addEventListener("click",()=>{var oe,se,C;he(),this.prefs=ae();const r=this.shadow.getElementById("select-cc-lang"),d=this.shadow.getElementById("select-cc-size"),S=this.shadow.getElementById("select-cc-theme"),I=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),J=this.shadow.getElementById("toggle-ad-enabled");r&&(r.value=this.prefs.captionLanguage),d&&(d.value=this.prefs.captionSize),S&&(S.value=this.prefs.captionTheme),I&&(I.value="show"),O&&(O.value="show"),J&&(J.value="off"),this.updateCaptionDisplay(),this.loadCaptionTrack(this.prefs.captionLanguage),x&&((oe=x.__reDock)==null||oe.call(x),x.classList.remove("floating"),x.style.position="",x.style.left="",x.style.top="",x.style.right="",x.style.bottom="",x.style.zIndex="",x.style.width=`${F.transcriptWidth}px`,x.style.height=`${F.transcriptHeight}px`,x.style.flex=`0 0 ${F.transcriptWidth}px`,x.style.display="flex"),w&&((se=w.__reDock)==null||se.call(w),w.classList.remove("floating"),w.style.position="",w.style.left="",w.style.top="",w.style.right="",w.style.bottom="",w.style.zIndex="",w.style.width=`${F.eslWidth}px`,w.style.height=`${F.eslHeight}px`,w.style.flex=`0 0 ${F.eslWidth}px`,w.style.display=this.signVideo||(C=this.manifest)!=null&&C.sources.some(De=>De.kind==="sign")?"flex":"none"),A&&A.setAttribute("aria-pressed","true"),B&&B.setAttribute("aria-pressed","true"),D&&D.setAttribute("aria-pressed","false")}),(Le=this.shadow.getElementById("select-cc-lang"))==null||Le.addEventListener("change",async r=>{if(this.prefs.captionLanguage=r.target.value,T({captionLanguage:this.prefs.captionLanguage}),V){const d=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",d?"false":"true"),V.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),V.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`)}await this.loadCaptionTrack(this.prefs.captionLanguage)}),(Fe=this.shadow.getElementById("select-cc-size"))==null||Fe.addEventListener("change",r=>{this.prefs.captionSize=r.target.value,T({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(Se=this.shadow.getElementById("select-cc-theme"))==null||Se.addEventListener("change",r=>{this.prefs.captionTheme=r.target.value,T({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()}),($e=this.shadow.getElementById("toggle-esl-visibility"))==null||$e.addEventListener("change",r=>{var I;const d=r.target.value==="show",S=!!(this.signVideo||(I=this.manifest)!=null&&I.sources.some(O=>O.kind==="sign"));this.prefs.eslVisible=d,T({eslVisible:d}),A&&A.setAttribute("aria-pressed",d?"true":"false"),w&&(w.style.display=d&&S?"flex":"none")}),(Ve=this.shadow.getElementById("toggle-transcript-visibility"))==null||Ve.addEventListener("change",r=>{const d=r.target.value==="show";this.prefs.transcriptVisible=d,T({transcriptVisible:d}),B&&B.setAttribute("aria-pressed",d?"true":"false"),x&&(x.style.display=d?"flex":"none")}),(Ce=this.shadow.getElementById("toggle-ad-enabled"))==null||Ce.addEventListener("change",r=>{const d=r.target.value==="on";this.prefs.audioDescriptionEnabled=d,T({audioDescriptionEnabled:d}),D&&D.setAttribute("aria-pressed",d?"true":"false")});const E=this.shadow.getElementById("transcript-search");E==null||E.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(E.value)});const z=this.shadow.getElementById("live-chat-search");z==null||z.addEventListener("input",()=>{this.liveChatViewer&&this.liveChatViewer.setSearchQuery(z.value)});const H=this.shadow.getElementById("tab-btn-transcript"),P=this.shadow.getElementById("tab-btn-chat"),ne=this.shadow.getElementById("transcript-view-panel"),re=this.shadow.getElementById("live-chat-view-panel");H==null||H.addEventListener("click",()=>{this.activeLeftTab="transcript",H.classList.add("active"),H.setAttribute("aria-selected","true"),P==null||P.classList.remove("active"),P==null||P.setAttribute("aria-selected","false"),ne&&(ne.style.display="flex"),re&&(re.style.display="none")}),P==null||P.addEventListener("click",()=>{this.activeLeftTab="chat",P.classList.add("active"),P.setAttribute("aria-selected","true"),H==null||H.classList.remove("active"),H==null||H.setAttribute("aria-selected","false"),ne&&(ne.style.display="none"),re&&(re.style.display="flex"),this.liveChatViewer&&this.liveChatViewer.updateTime(this.mainVideo.currentTime)});const de=this.shadow.getElementById("player-container");de==null||de.addEventListener("keydown",r=>{if(this.isPreferencesOpen){r.key==="Escape"&&(this.isPreferencesOpen=!1,u&&(u.style.display="none"),j==null||j.focus());return}if(!(r.target.tagName==="INPUT"||r.target.tagName==="SELECT"))switch(r.key){case" ":case"k":case"K":r.preventDefault(),b();break;case"j":case"J":case"ArrowLeft":r.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":r.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":r.preventDefault(),te();break;case"f":case"F":r.preventDefault(),ee();break;case"0":case"Home":r.preventDefault(),this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0);break;case">":case".":r.preventDefault(),a==null||a.click();break;case"<":case",":r.preventDefault(),l==null||l.click();break;case"c":case"C":r.preventDefault(),V==null||V.click();break;case"s":case"S":r.preventDefault(),A==null||A.click();break;case"d":case"D":r.preventDefault(),D==null||D.click();break;case"t":case"T":r.preventDefault(),B==null||B.click();break;case"Escape":Z()&&(r.preventDefault(),ee());break}})}updateLocaleStrings(){this.render(),this.initTracksAndTranscript(),this.liveChatViewer&&(this.liveChatViewer.setLocale(this.activeLocale),this.liveChatViewer.setMessages(this.liveChatMessages))}formatTime(e){const s=Math.floor(e/60),t=Math.floor(e%60);return`${s.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}}if(customElements.get("a11y-media-player")||customElements.define("a11y-media-player",ce),!customElements.get("db-player")){class v extends ce{}customElements.define("db-player",v)}const be=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function ve(v){const i=typeof v=="string"?new Date(v):v,e=i.getUTCFullYear(),s=i.getUTCMonth()+1,t=i.getUTCDate(),n=Math.floor((14-s)/12),a=e+4800-n,l=s+12*n-3,h=t+Math.floor((153*l+2)/5)+365*a+Math.floor(a/4)-Math.floor(a/100)+Math.floor(a/400)-32045,p=(h-1723856)%1461,g=p%365+365*Math.floor(p/1460),o=4*Math.floor((h-1723856)/1461)+Math.floor(p/365)-Math.floor(p/1460),k=Math.floor(g/30)+1,R=g%30+1,f=be[Math.min(k-1,12)];return{year:o,month:k,day:R,monthNameAmharic:f}}function we(v){const i=ve(v),e=`${i.monthNameAmharic} ${i.day}፣ ${i.year} ዓ.ም`;return{iso:v,ethiopic:e,display:`${v} (${e})`}}class ye extends HTMLElement{constructor(){super();c(this,"shadow");c(this,"job",null);c(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,s,t){if(s!==t){if(e==="locale")this.activeLocale=t||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(t),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",s=this.job.title[this.activeLocale]||this.job.title.en,t=this.job.location[this.activeLocale]||this.job.location.en,n=this.job.description[this.activeLocale]||this.job.description.en,a=this.job.applicationDeadline?we(this.job.applicationDeadline):null,l={"@context":"https://schema.org/","@type":"JobPosting",title:s,description:n,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:t,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
          <h4 id="job-title-${this.job.id}">${s}</h4>
          <div class="meta-line">
            <span><strong>${this.job.employer}</strong></span> &bull;
            <span>${t}</span> &bull;
            <span>${this.job.workMode.toUpperCase()}</span>
            ${a?` &bull; <span class="badge calendar" aria-label="Deadline: ${a.display}">📅 ${e?"የማመልከቻ ማብቂያ፦":"Deadline:"} ${a.display}</span>`:""}
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

        <p>${n}</p>

        <!-- Transparent Accommodations -->
        <div>
          <strong id="acc-heading-${this.job.id}">${e?"የተረጋገጡ ማመቻቸቶች (Accommodations Offered):":"Employer-Provided Accommodations:"}</strong>
          <ul class="tags-list" aria-labelledby="acc-heading-${this.job.id}">
            ${this.job.accommodations.map(h=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${h.label[this.activeLocale]||h.label.en}</span>
                <small style="opacity: 0.85;">(${h.source})</small>
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),s=this.shadow.getElementById("share-feedback");!e||!s||e.addEventListener("click",async()=>{const t=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:t}),s.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(t),s.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{s.textContent=t}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",ye);const Te="abugida-media",Ae=1;class xe{constructor(){c(this,"db",null);c(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((i,e)=>{const s=indexedDB.open(Te,Ae);s.onupgradeneeded=t=>{const n=t.target.result;n.objectStoreNames.contains("preferences")||n.createObjectStore("preferences"),n.objectStoreNames.contains("progress")||n.createObjectStore("progress",{keyPath:"lessonId"}),n.objectStoreNames.contains("packages")||n.createObjectStore("packages",{keyPath:"packageKey"})},s.onsuccess=t=>{this.db=t.target.result,i()},s.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),i()}})}async saveProgress(i){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${i.lessonId}`,JSON.stringify(i))}catch{}return}return new Promise(e=>{const s=this.db.transaction("progress","readwrite");s.objectStore("progress").put(i),s.oncomplete=()=>e(),s.onerror=()=>e()})}async getProgress(i){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${i}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const n=this.db.transaction("progress","readonly").objectStore("progress").get(i);n.onsuccess=()=>e(n.result||null),n.onerror=()=>e(null)})}async downloadPackage(i,e,s,t,n){await this.init();const a=`${i}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const l=await caches.open(this.cacheName);let h=0;const p=t.length;for(const g of t){const o=await fetch(g);if(!o.ok)throw new Error(`Failed to fetch asset: ${g} (${o.status})`);await l.put(g,o.clone()),h++;const k=Math.round(h/p*100);n(k,h,p)}return await this.savePackageRecord({packageKey:a,lessonId:i,packageId:e,packageName:s,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(l){throw await this.savePackageRecord({packageKey:a,lessonId:i,packageId:e,packageName:s,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:l instanceof Error?l.message:"Download failed"}),l}}async isPackageReady(i,e){await this.init();const s=`${i}:${e}`,t=await this.getPackageRecord(s);return(t==null?void 0:t.status)==="ready"}async savePackageRecord(i){if(this.db)return new Promise(e=>{const s=this.db.transaction("packages","readwrite");s.objectStore("packages").put(i),s.oncomplete=()=>e(),s.onerror=()=>e()})}async getPackageRecord(i){return this.db?new Promise(e=>{const n=this.db.transaction("packages","readonly").objectStore("packages").get(i);n.onsuccess=()=>e(n.result||null),n.onerror=()=>e(null)}):null}}const ze=new xe;y.A11yJobCard=ye,y.A11yMediaPlayer=ce,y.DEFAULT_PREFERENCES=F,y.ETHIOPIC_MONTHS=be,y.LiveChatViewer=fe,y.MediaSyncController=ge,y.OfflineStorageManager=xe,y.TranscriptViewer=me,y.formatDualDate=we,y.getThemeStyles=ue,y.loadPreferences=ae,y.offlineStorage=ze,y.parseVTT=le,y.resetPreferences=he,y.savePreferences=T,y.toEthiopianDate=ve,Object.defineProperty(y,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
