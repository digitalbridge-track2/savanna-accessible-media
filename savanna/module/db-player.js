(function(w,H){typeof exports=="object"&&typeof module<"u"?H(exports):typeof define=="function"&&define.amd?define(["exports"],H):(w=typeof globalThis<"u"?globalThis:w||self,H(w.AbugidaMediaKit={}))})(this,function(w){"use strict";var et=Object.defineProperty;var tt=(w,H,A)=>H in w?et(w,H,{enumerable:!0,configurable:!0,writable:!0,value:A}):w[H]=A;var p=(w,H,A)=>tt(w,typeof H!="symbol"?H+"":H,A);const H="abugida_media_preferences",A={captionLanguage:"en",captionSize:"medium",captionTheme:"default",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1,transcriptVisible:!0,transcriptWidth:260,transcriptHeight:400,eslWidth:240,eslHeight:180};function ge(){try{const u=localStorage.getItem(H);if(!u)return{...A};const i=JSON.parse(u);return{...A,...i}}catch{return{...A}}}function V(u){try{const e={...ge(),...u};return localStorage.setItem(H,JSON.stringify(e)),e}catch{return{...A,...u}}}function Ce(){try{localStorage.removeItem(H)}catch{}return{...A}}function me(u){const i=[],e=u.split(/\r?\n/);let s=0;for(;s<e.length&&!e[s].includes("-->");)s++;for(;s<e.length;){const t=e[s].trim();if(t.includes("-->")){const a=t.split("-->").map(n=>n.trim().split(" ")[0]);if(a.length>=2){const n=Ae(a[0]),l=Ae(a[1]);s++;const h=[];for(;s<e.length&&e[s].trim()!=="";)h.push(e[s].trim()),s++;h.length>0&&i.push({start:n,end:l,text:h.join(`
`)})}}s++}return i}function Ae(u){const i=u.split(":");let e=0,s=0,t=0;return i.length===3?(e=parseFloat(i[0]),s=parseFloat(i[1]),t=parseFloat(i[2].replace(",","."))):i.length===2&&(s=parseFloat(i[0]),t=parseFloat(i[1].replace(",","."))),e*3600+s*60+t}function Ve(u,i){let e="18px";i==="small"&&(e="14px"),i==="large"&&(e="24px"),i==="xlarge"&&(e="32px");let s="#FFFFFF",t="rgba(0, 0, 0, 0.85)",a="none";return u==="yellow-black"?(s="#FFEB3B",t="#000000",a="2px solid #FFEB3B"):u==="white-black"?(s="#FFFFFF",t="#000000",a="2px solid #FFFFFF"):u==="black-yellow"?(s="#000000",t="#FFEB3B",a="2px solid #000000"):u==="amber-gold"&&(s="#FFD700",t="#000000",a="2px solid #FFD700"),`
    font-size: ${e};
    color: ${s};
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
  `}class Te{constructor(i,e){p(this,"mainVideo");p(this,"signVideo",null);p(this,"driftThreshold");p(this,"isSyncing",!1);p(this,"onSignStatusChange");p(this,"mainListeners",{});p(this,"signListeners",{});this.mainVideo=i,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(i){if(this.cleanupSignListeners(),this.signVideo=i,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(i){this.onSignStatusChange&&this.onSignStatusChange(i)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[i,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(i,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[i,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(i,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(i){const e=!this.mainVideo.paused,s=this.mainVideo.currentTime,t=this.mainVideo.playbackRate;return this.mainVideo.src=i,this.mainVideo.load(),new Promise(a=>{const n=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",n),this.mainVideo.currentTime=s,this.mainVideo.playbackRate=t,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=s}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}a()};this.mainVideo.addEventListener("loadedmetadata",n)})}cleanupSignListeners(){if(this.signVideo)for(const[i,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(i,e);this.signListeners={}}destroy(){for(const[i,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(i,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class Be{constructor(i,e){p(this,"segments",[]);p(this,"container");p(this,"onSeekAndPlay");p(this,"onFollowChange");p(this,"currentActiveId",null);p(this,"searchQuery","");p(this,"isFollowing",!0);p(this,"userPausedFollowing",!1);p(this,"locale","en");p(this,"listElement",null);p(this,"followBtn",null);p(this,"statusElement",null);this.container=i,this.onSeekAndPlay=e.onSeekAndPlay,this.onFollowChange=e.onFollowChange,this.locale=e.locale||"en"}setLocale(i){this.locale!==i&&(this.locale=i,this.render())}setSegments(i){this.segments=i.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,s)=>e.start-s.start),this.render()}getSegments(){return[...this.segments]}setSearchQuery(i){this.searchQuery=i.toLowerCase().trim(),this.render()}getActiveSegment(i){return this.segments.length&&this.segments.find(e=>i>=e.start&&i<e.end)||null}updateActiveTime(i){const e=this.getActiveSegment(i),s=e?e.id:null;s!==this.currentActiveId&&(this.currentActiveId=s,this.highlightSegment(s),this.isFollowing&&s!==null&&this.scrollToActiveCue(s))}highlightSegment(i){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),i!==null){const s=this.container.querySelector(`[data-segment-id="${i}"]`);s&&s.classList.add("active")}}scrollToActiveCue(i){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${i}"]`);if(!e)return;this.listElement.scrollTop;const s=this.listElement.clientHeight,t=e.offsetTop,a=e.clientHeight,n=t-s/2+a/2;this.listElement.scrollTo({top:Math.max(0,n),behavior:"smooth"})}setFollowing(i){this.setFollowingState(i,!0)}setFollowingState(i,e=!1){var s;if(this.isFollowing=i,e&&(this.userPausedFollowing=!i),(s=this.onFollowChange)==null||s.call(this,i),this.followBtn){this.followBtn.setAttribute("aria-pressed",i?"true":"false");const t=this.locale==="am";i?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}i&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(i){const e=Math.floor(i/60),s=Math.floor(i%60);return`${e.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`}render(){var s;const i=this.locale==="am",e=this.searchQuery?this.segments.filter(t=>t.text.toLowerCase().includes(this.searchQuery)||t.speaker&&t.speaker.toLowerCase().includes(this.searchQuery)||t.visualDescription&&t.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
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
            ${e.map(t=>{const a=this.formatTime(t.start),n=t.id===this.currentActiveId,l=i?`ከ ${a} ጀምሮ አጫውት`:`Play from ${a}`;return`
                <li class="transcript-item ${n?"active":""}" data-segment-id="${t.id}">
                  <button 
                    type="button" 
                    class="btn-seek-time" 
                    data-time="${t.start}" 
                    aria-label="${l}">
                    ${a}
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
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(s=this.followBtn)==null||s.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const t=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",t,{passive:!0}),this.listElement.addEventListener("touchmove",t,{passive:!0}),this.listElement.addEventListener("keydown",a=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(a.key)&&t()})}this.container.querySelectorAll(".btn-seek-time").forEach(t=>{t.addEventListener("click",a=>{const n=parseFloat(a.currentTarget.dataset.time||"0");this.onSeekAndPlay(n),a.currentTarget.focus()})})}escapeHtml(i){return i.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class ze{constructor(i,e){p(this,"container");p(this,"messages",[]);p(this,"locale","en");p(this,"onSeekAndPlay");p(this,"currentTime",0);p(this,"searchQuery","");p(this,"isAutoScroll",!0);p(this,"isQuestionsOnly",!1);p(this,"listElement",null);p(this,"currentActiveId",null);this.container=i,this.locale=e.locale||"en",this.onSeekAndPlay=e.onSeekAndPlay}setLocale(i){this.locale!==i&&(this.locale=i,this.render())}setMessages(i){this.messages=[...i].sort((e,s)=>e.timestamp-s.timestamp),this.render()}setSearchQuery(i){this.searchQuery=i.toLowerCase().trim(),this.render()}setQuestionsOnly(i){this.isQuestionsOnly!==i&&(this.isQuestionsOnly=i,this.render())}setAutoScroll(i){this.isAutoScroll=i}updateTime(i){this.currentTime=i;const e=this.messages.filter(a=>a.timestamp<=i),s=e.length>0?e[e.length-1]:null,t=s?s.id:null;t!==this.currentActiveId&&(this.currentActiveId=t,this.updateActiveStyles(),this.isAutoScroll&&t&&this.scrollToMessage(t))}updateActiveStyles(){if(!this.container)return;this.container.querySelectorAll(".chat-replay-item").forEach(e=>{const s=e.getAttribute("data-chat-id");Number(e.getAttribute("data-timestamp")||"0")<=this.currentTime?(e.classList.add("is-delivered"),e.classList.remove("is-future")):(e.classList.remove("is-delivered"),e.classList.add("is-future")),s===this.currentActiveId?e.classList.add("is-active-latest"):e.classList.remove("is-active-latest")})}scrollToMessage(i){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-chat-id="${i}"]`);e&&e.scrollIntoView({behavior:"smooth",block:"nearest"})}render(){const i=this.locale==="am";if(!this.messages.length){this.container.innerHTML=`
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${i?"የቀጥታ ውይይት መልዕክቶች አልተገኙም።":"No live chat messages recorded for this session."}
        </div>
      `;return}const e=this.messages.filter(t=>{const a=t.message.en.includes("?")||t.message.am.includes("?")||t.message.am.includes("፧");if(this.isQuestionsOnly&&!a)return!1;if(!this.searchQuery)return!0;const n=(i?t.message.am:t.message.en).toLowerCase(),l=t.sender.toLowerCase();return n.includes(this.searchQuery)||l.includes(this.searchQuery)});this.container.innerHTML=`
      <ol class="chat-replay-list" role="list" aria-label="${i?"የቀጥታ ትምህርት ውይይት መልዕክቶች":"Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map(t=>{const a=t.timestamp<=this.currentTime,n=t.id===this.currentActiveId,l=t.role==="instructor",h=t.role==="ta",d=t.message.en.includes("?")||t.message.am.includes("?")||t.message.am.includes("፧"),g=l?i?"አስተማሪ":"Instructor":h?i?"ረዳት":"TA":i?"ተማሪ":"Student",r=l?"rgba(0, 113, 227, 0.12)":h?"rgba(16, 185, 129, 0.14)":"var(--color-surface, #F1F5F9)",x=l?"var(--color-brand, #0071E3)":h?"#059669":"var(--color-muted-ink, #475569)",P=n?"var(--color-brand, #0071E3)":l?"#0071E3":h?"#10B981":"var(--color-border, #CBD5E1)",b=i?t.message.am:t.message.en,R=i?`ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ`:`Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;return`
              <li 
                class="chat-replay-item ${a?"is-delivered":"is-future"} ${n?"is-active-latest":""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${R}"
                title="${R}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${n?"var(--color-brand-subtle, #EFF6FF)":"var(--color-surface-elevated, #FFFFFF)"};
                  border: 1px solid var(--color-border-subtle, #E2E8F0);
                  border-left: 3.5px solid ${P};
                  color: var(--color-ink, inherit);
                  cursor: pointer;
                  transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
                  opacity: ${a?"1":"0.55"};
                ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem; gap: 0.5rem;">
                  <div style="display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">
                    <span style="font-weight: 600; font-size: 0.82rem; color: var(--color-ink, #0F172A);">${t.sender}</span>
                    <span style="
                      font-size: 0.68rem;
                      font-weight: 700;
                      text-transform: uppercase;
                      padding: 1px 6px;
                      border-radius: 4px;
                      background: ${r};
                      color: ${x};
                    ">${g}</span>
                    ${d?`<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${i?"ጥያቄ":"Question"}</span>`:""}
                  </div>
                  <span 
                    class="btn-chat-timestamp" 
                    style="
                      font-family: monospace;
                      font-size: 0.75rem;
                      font-weight: 600;
                      color: var(--color-brand, #0071E3);
                      background: var(--color-surface, #F0F6FF);
                      padding: 2px 6px;
                      border-radius: 4px;
                      border: 1px solid var(--color-border, #BFDBFE);
                    ">
                    ▶ ${t.timeDisplay}
                  </span>
                </div>
                <div style="font-size: 0.85rem; line-height: 1.45; color: var(--color-ink, #334155);">
                  ${b}
                </div>
              </li>
            `}).join("")}
      </ol>
    `,this.listElement=this.container.querySelector(".chat-replay-list"),this.container.querySelectorAll(".chat-replay-item").forEach(t=>{const a=Number(t.getAttribute("data-timestamp")||"0"),n=()=>{this.onSeekAndPlay(a)};t.addEventListener("click",n),t.addEventListener("keydown",l=>{const h=l;(h.key==="Enter"||h.key===" ")&&(h.preventDefault(),n())})})}}const be={a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",i:"⠊",j:"⠚",k:"⠅",l:"⠇",m:"⠍",n:"⠝",o:"⠕",p:"⠏",q:"⠟",r:"⠗",s:"⠎",t:"⠞",u:"⠥",v:"⠧",w:"⠺",x:"⠭",y:"⠽",z:"⠵"," ":" ",".":"⠲",",":"⠂",";":"⠆",":":"⠒","!":"⠖","?":"⠦","-":"⠤","(":"⠶",")":"⠶",'"':"⠦","'":"⠄","/":"⠌"},ve={ሀ:"⠓⠁",ሁ:"⠓⠥",ሂ:"⠓⠊",ሃ:"⠓⠜",ሄ:"⠓⠑",ህ:"⠓",ሆ:"⠓⠕",ለ:"⠇⠁",ሉ:"⠇⠥",ሊ:"⠇⠊",ላ:"⠇⠜",ሌ:"⠇⠑",ል:"⠇",ሎ:"⠇⠕",መ:"⠍⠁",ሙ:"⠍⠥",ሚ:"⠍⠊",ማ:"⠍⠜",ሜ:"⠍⠑",ም:"⠍",ሞ:"⠍⠕",ረ:"⠗⠁",ሩ:"⠗⠥",ሪ:"⠗⠊",ራ:"⠗⠜",ሬ:"⠗⠑",ር:"⠗",ሮ:"⠗⠕",ሰ:"⠎⠁",ሱ:"⠎⠥",ሲ:"⠎⠊",ሳ:"⠎⠜",ሴ:"⠎⠑",ስ:"⠎",ሶ:"⠎⠕",በ:"⠃⠁",ቡ:"⠃⠥",ቢ:"⠃⠊",ባ:"⠃⠜",ቤ:"⠃⠑",ብ:"⠃",ቦ:"⠃⠕",ተ:"⠞⠁",ቱ:"⠞⠥",ቲ:"⠞⠊",ታ:"⠞⠜",ቴ:"⠞⠑",ት:"⠞",ቶ:"⠞⠕",አ:"⠁",ኡ:"⠥",ኢ:"⠊",ኣ:"⠜",ኤ:"⠑",እ:"⠢",ኦ:"⠕",የ:"⠽⠁",ዩ:"⠽⠥",ዪ:"⠽⠊",ያ:"⠽⠜",ዬ:"⠽⠑",ይ:"⠽",ዮ:"⠽⠕",ደ:"⠙⠁",ዱ:"⠙⠥",ዲ:"⠙⠊",ዳ:"⠙⠜",ዴ:"⠙⠑",ድ:"⠙",ዶ:"⠙⠕",ጀ:"⠚⠁",ጁ:"⠚⠥",ጂ:"⠚⠊",ጃ:"⠚⠜",ጄ:"⠚⠑",ጅ:"⠚",ጆ:"⠚⠕",ገ:"⠛⠁",ጉ:"⠛⠥",ጊ:"⠛⠊",ጋ:"⠛⠜",ጌ:"⠛⠑",ግ:"⠛",ጎ:"⠛⠕",ፈ:"⠋⠁",ፉ:"⠋⠥",ፊ:"⠋⠊",ፋ:"⠋⠜",ፌ:"⠋⠑",ፍ:"⠋",ፎ:"⠋⠕","፡":" ","።":"⠲","፣":"⠂","፤":"⠆","፥":"⠒","፦":"⠒⠤","፧":"⠦"};function Ge(u){let i="";for(let e=0;e<u.length;e++){const s=u[e];if(ve[s]){i+=ve[s];continue}const t=s.toLowerCase();s>="A"&&s<="Z"?i+="⠠"+(be[t]||t):s>="0"&&s<="9"?((e===0||!/[0-9]/.test(u[e-1]))&&(i+="⠼"),i+={1:"⠁",2:"⠃",3:"⠉",4:"⠙",5:"⠑",6:"⠋",7:"⠛",8:"⠓",9:"⠊",0:"⠚"}[s]||s):i+=be[t]||s}return i}function De(u){let i="";for(let e=0;e<u.length;e++){const s=u[e];s>="A"&&s<="Z"?i+=","+s:s>="0"&&s<="9"?((e===0||!/[0-9]/.test(u[e-1]))&&(i+="#"),i+=String.fromCharCode(s.charCodeAt(0)+16)):s==="."?i+="4":s===","?i+="1":s===";"?i+="2":s===":"?i+="3":s==="!"?i+="6":s==="?"?i+="8":i+=s}return i}function ye(u,i=40){const e=u.split(/\s+/),s=[];let t="";for(const a of e)if(a)if((t+(t?" ":"")+a).length<=i)t+=(t?" ":"")+a;else if(t&&s.push(t),a.length>i){let n=a;for(;n.length>i;)s.push(n.slice(0,i)),n=n.slice(i);t=n}else t=a;return t&&s.push(t),s}function Me(u){const i=u.language==="am",e=[],s=25,t=40,a="=".repeat(t);e.push(a),e.push(...ye(u.title.toUpperCase(),t)),e.push("STANDARD: BANA 40X25 GRADE-1 EMBOSSER"),e.push(`LANGUAGE: ${i?"AMHARIC":"ENGLISH"}`),e.push(`DATE: ${u.date||"2026-11-14 (HIDAR 5, 2019 E.C.)"}`),e.push(a),e.push("");for(let d=0;d<u.segments.length;d++){const g=u.segments[d],r=d+1,x=Math.floor(g.start/60).toString().padStart(2,"0"),P=Math.floor(g.start%60).toString().padStart(2,"0"),b=Math.floor(g.end/60).toString().padStart(2,"0"),R=Math.floor(g.end%60).toString().padStart(2,"0"),Q=g.speaker||(i?"አስተማሪ":"Instructor");e.push(`[#${r} ${x}:${P}-${b}:${R} ${Q}]`);const y=De(g.text);e.push(...ye(y,t)),e.push("")}const n=[];let l=[],h=1;for(let d=0;d<e.length;d++)if(l.push(e[d]),l.length===s-1||d===e.length-1){const r=`P.${h}`.padStart(t," ");l.push(r),n.push(l.join(`\r
`)),l=[],h++}return n.join(`\r
\f\r
`)}const C={play:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',restart:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',rewind:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',forward:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',cc:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',esl:'<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>',ad:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3.5h6.2c4.2 0 7.3 3 7.3 7.5s-3.1 7.5-7.3 7.5H3V3.5zm3.6 3.4v8.2h2.4c2.2 0 3.7-1.7 3.7-4.1s-1.5-4.1-3.7-4.1H6.6z"/><path d="M17.5 8.5c1 1.5 1 3.5 0 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20.5 6c2 2.7 2 7.3 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',transcript:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',faster:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M12.5 12.9a1.5 1.5 0 0 0 1-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5a1.5 1.5 0 0 0 .5 1.1l3.2 3.2 1.1-1.1-2.8-1.8z"/><path d="M18 12v6M15 15h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',slower:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M11 11.5a1.5 1.5 0 0 0-1 1.4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5a1.5 1.5 0 0 0-.5-1.1l-3.2-3.2-1.1 1.1 2.8 1.8z"/><rect x="15" y="14" width="6" height="2.2" rx="1"/></svg>',prefs:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',fullscreenEnter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',fullscreenExit:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',volumeUnmuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',volumeMuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',shortcuts:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>',lowData:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18h2v3H4v-3zm4-4h2v7H8v-7zm4-4h2v11h-2v-11zm4-4h2v15h-2V6zm4-4h2v19h-2V2z"/></svg>'};class we extends HTMLElement{constructor(){super();p(this,"shadow");p(this,"manifest",null);p(this,"activeLocale","en");p(this,"prefs");p(this,"mainVideo");p(this,"signVideo",null);p(this,"syncController");p(this,"pendingSeekTime",null);p(this,"currentCues",[]);p(this,"captionOverlay");p(this,"transcriptViewer");p(this,"liveChatViewer");p(this,"liveChatMessages",[]);p(this,"activeLeftTab","transcript");p(this,"isPreferencesOpen",!1);p(this,"onCaptionsUpdated",()=>{this.initTracksAndTranscript()});this.shadow=this.attachShadow({mode:"open"}),this.prefs=ge()}static get observedAttributes(){return["manifest-src","locale","lang","src","captions","sign","describe","api"]}connectedCallback(){this.activeLocale=this.getAttribute("lang")||this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e?this.loadManifest(e):this.getAttribute("src")&&this.initFromAttributes(),window.addEventListener("db-player:captions-updated",this.onCaptionsUpdated)}disconnectedCallback(){window.removeEventListener("db-player:captions-updated",this.onCaptionsUpdated),this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,s,t){s!==t&&(e==="locale"||e==="lang"?(this.activeLocale=t||"en",this.updateLocaleStrings()):e==="manifest-src"?this.loadManifest(t):(e==="src"||e==="captions"||e==="sign"||e==="describe")&&(this.getAttribute("manifest-src")||this.initFromAttributes()))}initFromAttributes(){const e=this.getAttribute("src");if(!e)return;const s=this.getAttribute("lang")||this.getAttribute("locale")||"en";this.activeLocale=s;const t=this.getAttribute("captions")||"",a=this.getAttribute("sign"),n=this.getAttribute("describe"),l=t.split(",").map(h=>h.trim()).filter(Boolean).map(h=>{const d=h.includes(".am.")||h.endsWith("am.vtt")||h.includes("am");return{id:d?"cap-am":"cap-en",language:d?"am":"en",label:d?"አማርኛ":"English",src:h}});this.manifest={id:"lesson-player",version:"1.0.0",title:{en:"Lesson Video",am:"የትምህርት ቪዲዮ"},sources:[{id:"main-video",kind:"main",src:e,mimeType:"video/mp4"},...a?[{id:"sign-video",kind:"sign",src:a,mimeType:"video/mp4"}]:[]],captionTracks:l,audioDescription:n?{src:n}:void 0},this.render(),this.initTracksAndTranscript()}async loadManifest(e){var s,t;try{const a=await fetch(e);if(!a.ok)throw new Error(`HTTP error ${a.status}`);const n=await a.json();let l;try{l=new URL(e,window.location.href)}catch{l=new URL(window.location.href)}const h=d=>{if(!d)return d;try{return new URL(d,l).href}catch{return d}};if(this.manifest={...n,poster:n.poster?{...n.poster,src:h(n.poster.src)}:void 0,sources:(n.sources||[]).map(d=>({...d,src:h(d.src)})),captionTracks:(n.captionTracks||[]).map(d=>({...d,src:h(d.src)})),transcript:n.transcript?{...n.transcript,src:h(n.transcript.src)}:n.transcript,liveSession:n.liveSession?{...n.liveSession,chatSrc:n.liveSession.chatSrc?h(n.liveSession.chatSrc):void 0}:void 0},(t=(s=this.manifest)==null?void 0:s.liveSession)!=null&&t.chatSrc)try{const d=await fetch(this.manifest.liveSession.chatSrc);d.ok&&(this.liveChatMessages=await d.json(),this.liveChatViewer&&this.liveChatViewer.setMessages(this.liveChatMessages))}catch(d){console.warn("Could not load live chat messages:",d)}this.render(),await this.initTracksAndTranscript()}catch(a){this.renderError(a instanceof Error?a.message:"Failed to load manifest")}}async initTracksAndTranscript(){var s;if(!this.manifest)return;await this.loadCaptionTrack(this.prefs.captionLanguage);const e=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-transcript:${this.activeLocale}`):null;if(e)try{const a=(JSON.parse(e).segments||[]).map(n=>({id:n.id,start:n.start_ms!==void 0?n.start_ms/1e3:n.start||0,end:n.end_ms!==void 0?n.end_ms/1e3:n.end||0,speaker:n.speaker,text:n.text||n.reviewedText||n.draft_text||n.draftText||"",visualDescription:n.visual_description||n.visualDescription}));this.transcriptViewer.setSegments(a);return}catch(t){console.warn("Could not parse custom transcript, falling back to manifest src",t)}if((s=this.manifest.transcript)!=null&&s.src)try{const t=await fetch(this.manifest.transcript.src);if(t.ok){const n=((await t.json()).segments||[]).map(l=>({id:l.id,start:l.start_ms!==void 0?l.start_ms/1e3:l.start||0,end:l.end_ms!==void 0?l.end_ms/1e3:l.end||0,speaker:l.speaker,text:l.text||l.draft_text||"",visualDescription:l.visual_description||l.visualDescription}));this.transcriptViewer.setSegments(n)}}catch(t){console.warn("Could not load external transcript file, using fallback cues",t)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const s=this.manifest.captionTracks.find(t=>t.language===e);if(!s){this.currentCues=[],this.updateCaptionDisplay();return}try{const t=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-vtt:${e}`):null;if(t)this.currentCues=me(t);else{const a=await fetch(s.src);if(a.ok){const n=await a.text();this.currentCues=me(n)}}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,s=this.currentCues.find(t=>e>=t.start&&e<=t.end);s?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=Ve(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=s.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const s=()=>{this.mainVideo.removeEventListener("loadedmetadata",s),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",s);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(s=>{console.warn("Playback interrupted or prevented on seek:",s)})}renderError(e){this.shadow.innerHTML=`
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
    `}render(){var g,r,x,P;const e=this.activeLocale==="am",s=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",t=(g=this.manifest)==null?void 0:g.sources.find(b=>b.kind==="main"),a=(r=this.manifest)==null?void 0:r.sources.find(b=>b.kind==="sign"),n=this.prefs.transcriptWidth||A.transcriptWidth||260,l=this.prefs.transcriptHeight||A.transcriptHeight||400,h=this.prefs.eslWidth||A.eslWidth||240,d=this.prefs.eslHeight||A.eslHeight||180;this.shadow.innerHTML=`
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
          background: var(--color-surface-elevated, #FFF);
          border: 1px solid var(--color-border, #CBD5E1);
          border-radius: 6px;
          color: var(--color-ink, inherit);
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
          gap: 0.65rem;
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
        .auto-scroll-label input[type="checkbox"] {
          accent-color: var(--color-brand, #0071E3);
          cursor: pointer;
        }
        .header-select {
          appearance: none;
          -webkit-appearance: none;
          -moz-appearance: none;
          background-color: rgba(255, 255, 255, 0.12);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%23CBD5E1' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 8px center;
          color: #F8F9FA;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          font-family: inherit;
          padding: 0 24px 0 10px;
          height: 28px;
          cursor: pointer;
          transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          outline: none;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }
        .header-select:hover {
          background-color: rgba(255, 255, 255, 0.2);
          border-color: rgba(255, 255, 255, 0.38);
        }
        .header-select:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
          border-color: transparent;
        }
        .header-select option {
          background: #23282E;
          color: #F8F9FA;
          padding: 6px 10px;
        }

        /* 1-Click Docking Presets for Floating Windows */
        .dock-presets-group {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          margin-right: 4px;
        }
        .btn-dock-preset {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          color: #E2E8F0;
          font-size: 11px;
          line-height: 1;
          width: 22px;
          height: 22px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
          padding: 0;
        }
        .btn-dock-preset:hover {
          background: rgba(255, 255, 255, 0.25);
          border-color: rgba(255, 255, 255, 0.45);
          transform: translateY(-1px);
        }
        .btn-dock-preset:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* Tool Pill Buttons (e.g. BRF Download, Questions Filter) */
        .btn-tool-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.15s ease;
          line-height: 1;
          white-space: nowrap;
        }
        .btn-tool-pill:hover {
          background: #E2E8F0;
          border-color: #94A3B8;
        }
        .btn-tool-pill.active {
          background: var(--color-brand, #0071E3);
          border-color: var(--color-brand, #0071E3);
          color: #FFFFFF;
        }
        .btn-tool-pill:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* 3G Audio-Only Real-Time Bandwidth Savings Banner */
        .audio-only-banner {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 12px;
          padding: 10px 18px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          z-index: 25;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          pointer-events: none;
          animation: fadeInBanner 0.25s ease-out;
        }
        @keyframes fadeInBanner {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .audio-only-badge {
          color: #38BDF8;
          font-size: 0.82rem;
          font-weight: 700;
          letter-spacing: 0.02em;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .audio-only-savings {
          color: #A3E635;
          font-size: 0.76rem;
          font-weight: 600;
        }

        /* 1-Click Caption Contrast Presets */
        .preset-pill-group {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 6px 0 10px 0;
        }
        .btn-preset-pill {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-preset-pill:hover {
          filter: brightness(1.2);
          transform: translateY(-1px);
        }
        .btn-preset-pill:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        /* Keyboard Shortcuts Dialog */
        .shortcuts-panel {
          max-width: 520px;
        }
        .shortcuts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px 14px;
          margin-top: 1rem;
        }
        @media (max-width: 600px) {
          .shortcuts-grid {
            grid-template-columns: 1fr;
          }
        }
        .shortcut-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.84rem;
          color: #334155;
        }
        .shortcut-item kbd {
          display: inline-block;
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-bottom-width: 2px;
          border-radius: 4px;
          padding: 2px 7px;
          font-family: -apple-system, BlinkMacSystemFont, "SF Mono", monospace;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0F172A;
          min-width: 20px;
          text-align: center;
        }
        .btn-close-modal {
          background: transparent;
          border: none;
          color: #64748B;
          font-size: 1.25rem;
          line-height: 1;
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
        }
        .btn-close-modal:hover {
          background: #F1F5F9;
          color: #0F172A;
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
          background: var(--color-surface-elevated, #FFF);
          color: var(--color-ink, #0F172A);
        }
        .left-panel-tabs {
          display: flex;
          background: var(--color-surface, #F1F5F9);
          border: 1px solid var(--color-border-subtle, transparent);
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
          color: var(--color-muted-ink, #475569);
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
        }
        .tab-btn:hover {
          color: var(--color-ink, #0F172A);
        }
        .tab-btn.active {
          background: var(--color-surface-elevated, #FFFFFF);
          color: var(--color-ink, #0F172A);
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
          color: var(--color-ink, #0F172A);
        }
        .search-box {
          padding: 0.45rem 0.75rem;
          background: var(--color-surface-elevated, #FFF);
          color: var(--color-ink, #0F172A);
          border: 1px solid var(--color-border, #CBD5E1);
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
          background: var(--color-surface, #F1F5F9);
          border: 1px solid var(--color-border, #CBD5E1);
          border-radius: 4px;
          padding: 0.35rem 0.75rem;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-ink, #1E293B);
          cursor: pointer;
          min-height: 34px;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }
        .btn-follow[aria-pressed="true"] {
          background: var(--color-brand-subtle, #DCFCE7);
          border-color: var(--color-brand, #86EFAC);
          color: var(--color-brand, #166534);
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
          color: var(--color-ink, inherit);
        }
        .transcript-item:hover {
          background: var(--color-surface, #F8FAFC);
        }
        .transcript-item.active {
          background: var(--color-brand-subtle, #F0FDF4);
          border-color: var(--color-brand, #86EFAC);
        }
        .btn-seek-time {
          background: var(--color-surface, #F8FAFC);
          border: 1px solid var(--color-border, #CBD5E1);
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
            style="width: ${n}px; height: ${l}px; flex: 0 0 ${n}px; display: ${this.prefs.transcriptVisible!==!1?"flex":"none"};"
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
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${e?"የትምህርቱ የጽሑፍ ግልባጭ":"Transcript"}</h3>
                    <button 
                      type="button" 
                      id="btn-export-brf" 
                      class="btn-tool-pill" 
                      aria-label="${e?"የብሬል ሰነድ (.brf) አውርድ":"Download Braille Ready Format (.brf)"}" 
                      title="${e?"የብሬል ሰነድ (.brf) አውርድ (BANA 40x25)":"Download Braille Ready Format (.brf) (BANA 40x25)"}">
                      ⠃⠗⠋ BRF
                    </button>
                  </div>
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
                <div class="transcript-title-row" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h3 class="transcript-title" style="margin: 0;">${e?"የቀጥታ ውይይት ድጋሚ":"Live Chat Replay"}</h3>
                    <button 
                      type="button" 
                      id="btn-chat-questions-filter" 
                      class="btn-tool-pill" 
                      aria-pressed="false" 
                      aria-label="${e?"ጥያቄዎችን ብቻ አሳይ":"Filter Questions Only"}" 
                      title="${e?"ጥያቄዎችን ብቻ አሳይ":"Filter Questions Only"}">
                      ❓ ${e?"ጥያቄዎች ብቻ":"Questions Only"}
                    </button>
                  </div>
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
                poster="${((P=(x=this.manifest)==null?void 0:x.poster)==null?void 0:P.src)||""}"
                src="${t?t.src:""}">
              </video>

              <!-- 3G Audio-Only Real-time Bandwidth Savings Banner -->
              <div class="audio-only-banner" id="audio-only-banner" style="display: none;" role="status" aria-live="polite">
                <div class="audio-only-badge">📶 ${e?"3G ዝቅተኛ ዳታ ሁነታ ነቅቷል (32kbps Opus)":"3G Low-Data Mode Active (32kbps Opus)"}</div>
                <div class="audio-only-savings">⚡ ${e?"99.2% ዳታ ተቆጥቧል (1.6 MB vs 205 MB)":"99.2% Bandwidth Saved (1.6 MB vs 205 MB)"}</div>
              </div>

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
                    <span id="play-icon" aria-hidden="true">${C.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}" title="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}">
                    <span aria-hidden="true">${C.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}" title="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${C.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}" title="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${C.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage!=="off"?"true":"false"}" aria-label="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}" title="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}">
                    <span aria-hidden="true">${C.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible?"true":"false"}" aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}" title="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${C.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled?"true":"false"}" aria-label="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}" title="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}">
                    <span aria-hidden="true">${C.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible!==!1?"true":"false"}" aria-label="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}" title="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}">
                    <span aria-hidden="true">${C.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}" title="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}">
                    <span aria-hidden="true">${C.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}" title="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}">
                    <span aria-hidden="true">${C.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-3g-audio" aria-pressed="false" aria-label="${e?"3G ዝቅተኛ ዳታ የድምጽ ሁነታ":"3G Low-Data Audio Mode"}" title="${e?"3G ዝቅተኛ ዳታ የድምጽ ሁነታ (99.2% ዳታ ይቆጥቡ)":"3G Low-Data Audio Mode (Save 99.2% bandwidth)"}">
                    <span aria-hidden="true">${C.lowData}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${e?"የኪቦርድ አቋራጮች (?)":"Keyboard Shortcuts (?)"}" title="${e?"የኪቦርድ አቋራጮች (?)":"Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${C.shortcuts}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}" title="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
                    <span aria-hidden="true">${C.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}" title="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${C.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}" title="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${C.volumeUnmuted}</span>
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
            style="width: ${h}px; height: ${d}px; flex: 0 0 ${h}px; display: ${this.prefs.eslVisible&&a?"flex":"none"};"
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
              <div class="header-controls" style="display: flex; align-items: center; gap: 4px;">
                <div class="dock-presets-group" role="group" aria-label="${e?"የምልክት ቋንቋ መስኮት መትከያ":"Sign window docking presets"}">
                  <button type="button" class="btn-dock-preset" id="btn-dock-tr" title="${e?"ወደ ቀኝ ከላይ ይቆልፉ":"Dock Top-Right"}" aria-label="${e?"ወደ ቀኝ ከላይ ይቆልፉ":"Dock Top-Right"}">⬈</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-br" title="${e?"ወደ ቀኝ ከታች ይቆልፉ":"Dock Bottom-Right"}" aria-label="${e?"ወደ ቀኝ ከታች ይቆልፉ":"Dock Bottom-Right"}">⬊</button>
                  <button type="button" class="btn-dock-preset" id="btn-dock-split" title="${e?"ጎን ለጎን እይታ":"Dock Side-by-Side"}" aria-label="${e?"ጎን ለጎን እይታ":"Dock Side-by-Side"}">◧</button>
                </div>
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
              <div class="preset-pill-group" role="group" aria-label="${e?"ፈጣን የንፅፅር ገጽታዎች":"Quick Caption Contrast Presets"}">
                <button type="button" class="btn-preset-pill" data-preset="yellow-black" style="background: #000; color: #FFFF00; border: 1px solid #FFFF00;">Yellow / Black</button>
                <button type="button" class="btn-preset-pill" data-preset="white-black" style="background: #000; color: #FFF; border: 1px solid #FFF;">White / Black</button>
                <button type="button" class="btn-preset-pill" data-preset="amber-gold" style="background: #111; color: #FFD700; border: 1px solid #FFD700;">OLED Amber</button>
                <button type="button" class="btn-preset-pill" data-preset="default" style="background: rgba(28,28,30,0.85); color: #FFF; border: 1px solid rgba(255,255,255,0.3);">Apple Classic</button>
              </div>
              <select id="select-cc-theme">
                <option value="default" ${this.prefs.captionTheme==="default"?"selected":""}>White on Translucent Black</option>
                <option value="yellow-black" ${this.prefs.captionTheme==="yellow-black"?"selected":""}>High Contrast (Yellow on Black)</option>
                <option value="white-black" ${this.prefs.captionTheme==="white-black"?"selected":""}>High Contrast (White on Black)</option>
                <option value="amber-gold" ${this.prefs.captionTheme==="amber-gold"?"selected":""}>OLED Amber Gold (Amber on Black)</option>
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

        <!-- Keyboard Shortcuts Modal Dialog -->
        <div class="dialog-backdrop" id="dialog-shortcuts" style="display: none;" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
          <div class="dialog-panel shortcuts-panel">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <h3 id="shortcuts-title" style="margin: 0; font-size: 1.15rem; font-weight: 600;">
                ⌨ ${e?"የኪቦርድ አቋራጭ ቁልፎች":"Keyboard Shortcuts Cheat-Sheet"}
              </h3>
              <button type="button" class="btn-close-modal" id="btn-close-shortcuts" aria-label="${e?"ዝጋ":"Close"}">✕</button>
            </div>
            <p style="margin: 0 0 1rem 0; font-size: 0.85rem; color: #64748B;">
              ${e?"ይህ ማጫወቻ ሙሉ በሙሉ በኪቦርድ ብቻ የሚሰራ ሲሆን ለስክሪን አንባቢ ተጠቃሚዎች ምቹ ነው":"Full accessible keyboard control optimized for screen reader users and power learners."}
            </p>
            <div class="shortcuts-grid">
              <div class="shortcut-item"><kbd>Space</kbd> / <kbd>K</kbd> <span>${e?"አጫውት / አቁም":"Play / Pause"}</span></div>
              <div class="shortcut-item"><kbd>J</kbd> <span>${e?"5 ሰከንድ ወደኋላ መልስ":"Seek back 5s"}</span></div>
              <div class="shortcut-item"><kbd>L</kbd> <span>${e?"5 ሰከንድ ወደፊት ውሰድ":"Seek forward 5s"}</span></div>
              <div class="shortcut-item"><kbd>M</kbd> <span>${e?"ድምጽ አጥፋ / አብራ":"Mute / Unmute"}</span></div>
              <div class="shortcut-item"><kbd>F</kbd> <span>${e?"ሙሉ ማያ ገጽ":"Toggle Fullscreen"}</span></div>
              <div class="shortcut-item"><kbd>C</kbd> <span>${e?"የትርጉም ጽሑፍ (CC)":"Toggle Captions"}</span></div>
              <div class="shortcut-item"><kbd>S</kbd> <span>${e?"የምልክት ቋንቋ (EthSL)":"Toggle Sign Language"}</span></div>
              <div class="shortcut-item"><kbd>T</kbd> <span>${e?"የጽሑፍ ግልባጭ ማሳያ":"Toggle Transcript"}</span></div>
              <div class="shortcut-item"><kbd>D</kbd> <span>${e?"የድምፅ ማብራሪያ (AD)":"Toggle Audio Description"}</span></div>
              <div class="shortcut-item"><kbd>&gt;</kbd> / <kbd>&lt;</kbd> <span>${e?"ፍጥነት ጨምር / ቀንስ":"Speed Faster / Slower"}</span></div>
              <div class="shortcut-item"><kbd>0</kbd> / <kbd>Home</kbd> <span>${e?"ከመጀመሪያ ጀምር":"Restart from beginning"}</span></div>
              <div class="shortcut-item"><kbd>?</kbd> <span>${e?"ይህን መመሪያ አሳይ":"Open this cheat-sheet"}</span></div>
              <div class="shortcut-item"><kbd>Esc</kbd> <span>${e?"መስኮት ዝጋ":"Close dialogs / Fullscreen"}</span></div>
            </div>
            <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
              <button type="button" class="btn-dialog-action btn-dialog-save" id="btn-ok-shortcuts">
                ${e?"ገባኝ":"Got it"}
              </button>
            </div>
          </div>
        </div>
      </section>
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupWindowInteractions()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new Te(this.mainVideo,{driftThreshold:.25,onSignStatusChange:a=>{const n=this.shadow.getElementById("sign-status-indicator");n&&(a==="loading"?(n.style.display="inline-block",n.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):a==="error"?(n.style.display="inline-block",n.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",n.style.background="#FEF2F2",n.style.color="#991B1B"):(n.style.display="inline-block",n.textContent="EthSL",n.style.background="rgba(255,255,255,0.2)",n.style.color="#FFF"))}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target"),s=this.shadow.getElementById("live-chat-target"),t=this.shadow.getElementById("cb-auto-scroll");this.transcriptViewer=new Be(e,{locale:this.activeLocale,onSeekAndPlay:a=>{this.seekAndPlay(a)},onFollowChange:a=>{t&&(t.checked=a)}}),s&&(this.liveChatViewer=new ze(s,{locale:this.activeLocale,onSeekAndPlay:a=>{this.seekAndPlay(a)}}),this.liveChatMessages.length&&this.liveChatViewer.setMessages(this.liveChatMessages))}setupWindowInteractions(){const e=this.shadow.getElementById("player-stage");if(!e)return;const s=(t,a,n,l,h,d,g)=>{const r=this.shadow.getElementById(t),x=this.shadow.getElementById(a),P=this.shadow.getElementById(n),b=this.shadow.getElementById(l),R=this.shadow.getElementById(h),Q=d?this.shadow.getElementById(d):null;if(!r||!x||!P)return;let y=null,X=!1,_="corner",ae=0,ne=0,U=0,re=0,q=null;const M=m=>{if(!X)return;const v=m.clientX-ae,L=m.clientY-ne;q!==null&&cancelAnimationFrame(q),q=requestAnimationFrame(()=>{let F=U,k=re;_==="corner"||_==="right"?F=Math.min(g.maxWidth,Math.max(g.minWidth,U+v)):_==="left"&&(F=Math.min(g.maxWidth,Math.max(g.minWidth,U-v))),(_==="corner"||_==="bottom")&&(k=Math.min(g.maxHeight,Math.max(g.minHeight,re+L))),r.style.width=`${F}px`,r.style.height=`${k}px`,r.style.flex=`0 0 ${F}px`,y&&(y.style.width=`${F}px`,y.style.height=`${k}px`,y.style.flex=`0 0 ${F}px`)})},T=()=>{X&&(X=!1,r.classList.remove("is-resizing"),window.removeEventListener("pointermove",M),window.removeEventListener("pointerup",T),window.removeEventListener("pointercancel",T),q!==null&&(cancelAnimationFrame(q),q=null),g.onSaveSize(r.offsetWidth,r.offsetHeight))},B=(m,v)=>{X=!0,_=m,ae=v.clientX,ne=v.clientY,U=r.offsetWidth,re=r.offsetHeight,r.classList.add("is-resizing"),window.addEventListener("pointermove",M),window.addEventListener("pointerup",T),window.addEventListener("pointercancel",T),v.preventDefault(),v.stopPropagation()};P.addEventListener("pointerdown",m=>B("corner",m)),b==null||b.addEventListener("pointerdown",m=>B("bottom",m)),R==null||R.addEventListener("pointerdown",m=>B("right",m)),Q==null||Q.addEventListener("pointerdown",m=>B("left",m)),P.addEventListener("keydown",m=>{let v=r.offsetWidth,L=r.offsetHeight,F=!1;m.key==="ArrowRight"?(v=Math.min(g.maxWidth,v+20),F=!0):m.key==="ArrowLeft"?(v=Math.max(g.minWidth,v-20),F=!0):m.key==="ArrowDown"?(L=Math.min(g.maxHeight,L+20),F=!0):m.key==="ArrowUp"&&(L=Math.max(g.minHeight,L-20),F=!0),F&&(m.preventDefault(),r.style.width=`${v}px`,r.style.height=`${L}px`,r.style.flex=`0 0 ${v}px`,y&&(y.style.width=`${v}px`,y.style.height=`${L}px`,y.style.flex=`0 0 ${v}px`),g.onSaveSize(v,L))});let f=!1,I=0,E=0,Z=0,ee=0,W=null;r.addEventListener("pointerdown",()=>{if(r.classList.contains("floating")){r.style.zIndex="100";const m=t==="transcript-window"?"esl-window":"transcript-window",v=this.shadow.getElementById(m);v&&v.classList.contains("floating")&&(v.style.zIndex="90")}});const N=m=>{const v=m.clientX-I,L=m.clientY-E;!f&&Math.hypot(v,L)>4&&(f=!0,!y&&r.parentNode&&(y=document.createElement("div"),y.className="window-placeholder",y.style.width=`${r.offsetWidth}px`,y.style.height=`${r.offsetHeight}px`,y.style.flex=r.style.flex||`0 0 ${r.offsetWidth}px`,r.parentNode.insertBefore(y,r)),r.classList.add("floating"),r.style.position="absolute",r.style.zIndex="100"),f&&(W!==null&&cancelAnimationFrame(W),W=requestAnimationFrame(()=>{const F=Z+v,k=ee+L;r.style.left=`${F}px`,r.style.top=`${k}px`,r.style.right="auto",r.style.bottom="auto"}))},J=()=>{f&&(f=!1),window.removeEventListener("pointermove",N),window.removeEventListener("pointerup",J),window.removeEventListener("pointercancel",J),W!==null&&(cancelAnimationFrame(W),W=null)};x.addEventListener("pointerdown",m=>{if(m.target.tagName==="INPUT"||m.target.tagName==="SELECT")return;I=m.clientX,E=m.clientY;const v=e.getBoundingClientRect(),L=r.getBoundingClientRect();Z=r.style.left?parseFloat(r.style.left):L.left-v.left,ee=r.style.top?parseFloat(r.style.top):L.top-v.top,f=!1,r.style.zIndex="100";const F=t==="transcript-window"?"esl-window":"transcript-window",k=this.shadow.getElementById(F);k&&k.classList.contains("floating")&&(k.style.zIndex="90"),window.addEventListener("pointermove",N),window.addEventListener("pointerup",J),window.addEventListener("pointercancel",J)}),x.addEventListener("keydown",m=>{let v=!1;const L=20;if(!r.classList.contains("floating")){!y&&r.parentNode&&(y=document.createElement("div"),y.className="window-placeholder",y.style.width=`${r.offsetWidth}px`,y.style.height=`${r.offsetHeight}px`,y.style.flex=r.style.flex||`0 0 ${r.offsetWidth}px`,r.parentNode.insertBefore(y,r));const z=e.getBoundingClientRect(),K=r.getBoundingClientRect();r.classList.add("floating"),r.style.position="absolute",r.style.zIndex="100",r.style.left=`${K.left-z.left}px`,r.style.top=`${K.top-z.top}px`}let F=parseFloat(r.style.left)||0,k=parseFloat(r.style.top)||0;m.key==="ArrowRight"?(F+=L,v=!0):m.key==="ArrowLeft"?(F-=L,v=!0):m.key==="ArrowDown"?(k+=L,v=!0):m.key==="ArrowUp"&&(k-=L,v=!0),v&&(m.preventDefault(),r.style.left=`${F}px`,r.style.top=`${k}px`)});const te=()=>{r.classList.remove("floating"),r.style.position="",r.style.left="",r.style.top="",r.style.right="",r.style.bottom="",r.style.zIndex="",y&&(y.remove(),y=null)};x.addEventListener("dblclick",te);const G=m=>{if(m==="split"){te();return}r.classList.contains("floating")||(!y&&r.parentNode&&(y=document.createElement("div"),y.className="window-placeholder",y.style.width=`${r.offsetWidth}px`,y.style.height=`${r.offsetHeight}px`,y.style.flex=r.style.flex||`0 0 ${r.offsetWidth}px`,r.parentNode.insertBefore(y,r)),r.classList.add("floating"),r.style.position="absolute",r.style.zIndex="100");const v=e.getBoundingClientRect(),L=r.offsetWidth||280,F=r.offsetHeight||210,k=16,z=Math.max(0,v.width-L-k),K=Math.max(0,v.height-F-k);m==="tr"?(r.style.left=`${z}px`,r.style.top=`${k}px`):m==="br"&&(r.style.left=`${z}px`,r.style.top=`${K}px`)};r.__reDock=te,r.__dockPreset=G};s("transcript-window","transcript-drag-handle","transcript-resize-handle","transcript-resize-edge-bottom","transcript-resize-edge-right",null,{minWidth:220,maxWidth:750,minHeight:200,maxHeight:900,onSaveSize:(t,a)=>{this.prefs.transcriptWidth=t,this.prefs.transcriptHeight=a,V({transcriptWidth:t,transcriptHeight:a})}}),s("esl-window","esl-drag-handle","esl-resize-handle","esl-resize-edge-bottom","esl-resize-edge-right","esl-resize-edge-left",{minWidth:200,maxWidth:700,minHeight:160,maxHeight:700,onSaveSize:(t,a)=>{this.prefs.eslWidth=t,this.prefs.eslHeight=a,V({eslWidth:t,eslHeight:a})}})}attachEventListeners(){var Ne,Ue,We,_e,Ke,Qe,qe,Je;const e=this.shadow.getElementById("btn-play"),s=this.shadow.getElementById("play-icon"),t=this.shadow.getElementById("big-play-btn"),a=this.shadow.getElementById("btn-restart"),n=this.shadow.getElementById("btn-speed-faster"),l=this.shadow.getElementById("btn-speed-slower"),h=this.shadow.getElementById("speed-display"),d=this.shadow.getElementById("state-display"),g=this.shadow.getElementById("btn-fullscreen"),r=this.shadow.getElementById("fullscreen-icon"),x=this.shadow.getElementById("btn-mute"),P=this.shadow.getElementById("mute-icon"),b=this.shadow.getElementById("player-container"),R=this.shadow.getElementById("seek-scrubber"),Q=this.shadow.getElementById("time-display"),y=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",y),t&&t.addEventListener("click",y),this.mainVideo.addEventListener("click",y),this.mainVideo.addEventListener("play",()=>{s&&(s.innerHTML=C.pause),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),t==null||t.classList.add("is-hidden"),d&&(d.textContent=this.activeLocale==="am"?"እየተጫወተ ነው":"Playing")}),this.mainVideo.addEventListener("pause",()=>{s&&(s.innerHTML=C.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),d&&(d.textContent=this.mainVideo.ended?this.activeLocale==="am"?"ተጠናቋል":"End of track":this.activeLocale==="am"?"ቆሟል":"Paused")}),this.mainVideo.addEventListener("ended",()=>{s&&(s.innerHTML=C.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),d&&(d.textContent=this.activeLocale==="am"?"ተጠናቋል":"End of track"),this.dispatchEvent(new CustomEvent("db-player:complete",{bubbles:!0,composed:!0,detail:{}}))}),a==null||a.addEventListener("click",()=>{this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0)});const X=[.5,.75,1,1.25,1.5,2],_=()=>{const o=this.mainVideo.playbackRate;h&&(h.textContent=`Speed: ${o}x`)};n==null||n.addEventListener("click",()=>{const o=this.mainVideo.playbackRate,c=X.filter(D=>D>o+.01),$=c.length>0?c[0]:2;this.mainVideo.playbackRate=$,_()}),l==null||l.addEventListener("click",()=>{const o=this.mainVideo.playbackRate,c=X.filter(D=>D<o-.01),$=c.length>0?c[c.length-1]:.5;this.mainVideo.playbackRate=$,_()});const ae=()=>!!(document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement||b!=null&&b.classList.contains("is-fullscreen")||this.hasAttribute("data-fullscreen")),ne=async()=>{try{ae()?((document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement)&&(document.exitFullscreen?await document.exitFullscreen():document.webkitExitFullscreen&&await document.webkitExitFullscreen()),b==null||b.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen"),U()):b!=null&&b.requestFullscreen?await b.requestFullscreen():b!=null&&b.webkitRequestFullscreen?await b.webkitRequestFullscreen():(b==null||b.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true"),U())}catch(o){console.warn("Fullscreen native request fell back to CSS:",o),(b==null?void 0:b.classList.contains("is-fullscreen"))?(b==null||b.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen")):(b==null||b.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true")),U()}};g==null||g.addEventListener("click",ne);const U=()=>{const o=ae();g==null||g.setAttribute("aria-pressed",o?"true":"false"),g==null||g.setAttribute("aria-label",o?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),g==null||g.setAttribute("title",o?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),r&&(r.innerHTML=o?C.fullscreenExit:C.fullscreenEnter)};document.addEventListener("fullscreenchange",U),document.addEventListener("webkitfullscreenchange",U);const re=()=>{this.mainVideo.muted=!this.mainVideo.muted};x==null||x.addEventListener("click",re);const q=()=>{const o=this.mainVideo.muted;x==null||x.setAttribute("aria-pressed",o?"true":"false"),x==null||x.setAttribute("aria-label",o?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),x==null||x.setAttribute("title",o?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),P&&(P.innerHTML=o?C.volumeMuted:C.volumeUnmuted)};this.mainVideo.addEventListener("volumechange",q),this.mainVideo.addEventListener("timeupdate",()=>{const o=this.mainVideo.currentTime,c=this.mainVideo.duration||1;R&&!R.matches(":active")&&(R.value=(o/c*100).toFixed(1)),Q&&(Q.textContent=`${this.formatTime(o)} / ${this.formatTime(c)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(o),this.liveChatViewer&&this.liveChatViewer.updateTime(o),this.dispatchEvent(new CustomEvent("db-player:progress",{bubbles:!0,composed:!0,detail:{seconds:Math.floor(o),percent:Math.round(o/c*100)}}))}),R.addEventListener("input",()=>{const o=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(R.value)/100*o}),(Ne=this.shadow.getElementById("btn-rewind"))==null||Ne.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(Ue=this.shadow.getElementById("btn-forward"))==null||Ue.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const M=this.shadow.getElementById("btn-ad");M==null||M.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,V({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),M.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const o=this.prefs.audioDescriptionEnabled?"described":"main",c=this.manifest.sources.find($=>$.kind===o)||this.manifest.sources.find($=>$.kind==="main");c&&await this.syncController.switchSource(c.src)});const T=this.shadow.getElementById("btn-cc");T==null||T.addEventListener("click",async()=>{const o=["en","am","off"],c=(o.indexOf(this.prefs.captionLanguage)+1)%o.length;this.prefs.captionLanguage=o[c],V({captionLanguage:this.prefs.captionLanguage});const $=this.prefs.captionLanguage==="off";T.setAttribute("aria-pressed",$?"false":"true"),T.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),T.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),await this.loadCaptionTrack(this.prefs.captionLanguage)});const B=this.shadow.getElementById("btn-esl"),f=this.shadow.getElementById("esl-window");B==null||B.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,V({eslVisible:this.prefs.eslVisible}),B.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),f&&(f.style.display=this.prefs.eslVisible?"flex":"none")});const I=this.shadow.getElementById("btn-transcript-toggle"),E=this.shadow.getElementById("transcript-window");I==null||I.addEventListener("click",()=>{const c=!((E==null?void 0:E.style.display)!=="none");this.prefs.transcriptVisible=c,V({transcriptVisible:c}),I.setAttribute("aria-pressed",c?"true":"false"),E&&(E.style.display=c?"flex":"none")});const Z=this.shadow.getElementById("cb-auto-scroll");Z==null||Z.addEventListener("change",()=>{this.transcriptViewer.setFollowing(Z.checked)});const ee=this.shadow.getElementById("select-transcript-lang");ee==null||ee.addEventListener("change",()=>{const o=ee.value;this.setAttribute("locale",o)});const W=()=>{this.isPreferencesOpen=!0;const o=this.shadow.getElementById("select-cc-lang"),c=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme"),D=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),j=this.shadow.getElementById("toggle-ad-enabled");o&&(o.value=this.prefs.captionLanguage),c&&(c.value=this.prefs.captionSize),$&&($.value=this.prefs.captionTheme),D&&(D.value=this.prefs.eslVisible?"show":"hide"),O&&(O.value=this.prefs.transcriptVisible!==!1?"show":"hide"),j&&(j.value=this.prefs.audioDescriptionEnabled?"on":"off"),G&&(G.style.display="flex"),o==null||o.focus()},N=this.shadow.getElementById("btn-prefs"),J=this.shadow.getElementById("btn-transcript-prefs"),te=this.shadow.getElementById("btn-esl-prefs"),G=this.shadow.getElementById("prefs-dialog"),m=this.shadow.getElementById("btn-close-prefs"),v=this.shadow.getElementById("btn-reset-layout");N==null||N.addEventListener("click",W),J==null||J.addEventListener("click",W),te==null||te.addEventListener("click",W),m==null||m.addEventListener("click",async()=>{var Y;const o=this.shadow.getElementById("select-cc-lang"),c=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme"),D=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),j=this.shadow.getElementById("toggle-ad-enabled");if(o&&o.value!==this.prefs.captionLanguage){if(this.prefs.captionLanguage=o.value,V({captionLanguage:this.prefs.captionLanguage}),T){const S=this.prefs.captionLanguage==="off";T.setAttribute("aria-pressed",S?"false":"true")}await this.loadCaptionTrack(this.prefs.captionLanguage)}c&&c.value!==this.prefs.captionSize&&(this.prefs.captionSize=c.value,V({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()),$&&$.value!==this.prefs.captionTheme&&(this.prefs.captionTheme=$.value,V({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay());const se=!!(this.signVideo||(Y=this.manifest)!=null&&Y.sources.some(S=>S.kind==="sign"));if(D){const S=D.value==="show";this.prefs.eslVisible=S,V({eslVisible:S}),B&&B.setAttribute("aria-pressed",S?"true":"false"),f&&(f.style.display=S&&se?"flex":"none")}if(O){const S=O.value==="show";this.prefs.transcriptVisible=S,V({transcriptVisible:S}),I&&I.setAttribute("aria-pressed",S?"true":"false"),E&&(E.style.display=S?"flex":"none")}if(j){const S=j.value==="on";this.prefs.audioDescriptionEnabled=S,V({audioDescriptionEnabled:S}),M&&M.setAttribute("aria-pressed",S?"true":"false")}this.isPreferencesOpen=!1,G&&(G.style.display="none"),N==null||N.focus()}),v==null||v.addEventListener("click",()=>{var se,Y,S;Ce(),this.prefs=ge();const o=this.shadow.getElementById("select-cc-lang"),c=this.shadow.getElementById("select-cc-size"),$=this.shadow.getElementById("select-cc-theme"),D=this.shadow.getElementById("toggle-esl-visibility"),O=this.shadow.getElementById("toggle-transcript-visibility"),j=this.shadow.getElementById("toggle-ad-enabled");o&&(o.value=this.prefs.captionLanguage),c&&(c.value=this.prefs.captionSize),$&&($.value=this.prefs.captionTheme),D&&(D.value="show"),O&&(O.value="show"),j&&(j.value="off"),this.updateCaptionDisplay(),this.loadCaptionTrack(this.prefs.captionLanguage),E&&((se=E.__reDock)==null||se.call(E),E.classList.remove("floating"),E.style.position="",E.style.left="",E.style.top="",E.style.right="",E.style.bottom="",E.style.zIndex="",E.style.width=`${A.transcriptWidth}px`,E.style.height=`${A.transcriptHeight}px`,E.style.flex=`0 0 ${A.transcriptWidth}px`,E.style.display="flex"),f&&((Y=f.__reDock)==null||Y.call(f),f.classList.remove("floating"),f.style.position="",f.style.left="",f.style.top="",f.style.right="",f.style.bottom="",f.style.zIndex="",f.style.width=`${A.eslWidth}px`,f.style.height=`${A.eslHeight}px`,f.style.flex=`0 0 ${A.eslWidth}px`,f.style.display=this.signVideo||(S=this.manifest)!=null&&S.sources.some(Se=>Se.kind==="sign")?"flex":"none"),B&&B.setAttribute("aria-pressed","true"),I&&I.setAttribute("aria-pressed","true"),M&&M.setAttribute("aria-pressed","false")}),(We=this.shadow.getElementById("select-cc-lang"))==null||We.addEventListener("change",async o=>{if(this.prefs.captionLanguage=o.target.value,V({captionLanguage:this.prefs.captionLanguage}),T){const c=this.prefs.captionLanguage==="off";T.setAttribute("aria-pressed",c?"false":"true"),T.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),T.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`)}await this.loadCaptionTrack(this.prefs.captionLanguage)}),(_e=this.shadow.getElementById("select-cc-size"))==null||_e.addEventListener("change",o=>{this.prefs.captionSize=o.target.value,V({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(Ke=this.shadow.getElementById("select-cc-theme"))==null||Ke.addEventListener("change",o=>{this.prefs.captionTheme=o.target.value,V({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()}),(Qe=this.shadow.getElementById("toggle-esl-visibility"))==null||Qe.addEventListener("change",o=>{var D;const c=o.target.value==="show",$=!!(this.signVideo||(D=this.manifest)!=null&&D.sources.some(O=>O.kind==="sign"));this.prefs.eslVisible=c,V({eslVisible:c}),B&&B.setAttribute("aria-pressed",c?"true":"false"),f&&(f.style.display=c&&$?"flex":"none")}),(qe=this.shadow.getElementById("toggle-transcript-visibility"))==null||qe.addEventListener("change",o=>{const c=o.target.value==="show";this.prefs.transcriptVisible=c,V({transcriptVisible:c}),I&&I.setAttribute("aria-pressed",c?"true":"false"),E&&(E.style.display=c?"flex":"none")}),(Je=this.shadow.getElementById("toggle-ad-enabled"))==null||Je.addEventListener("change",o=>{const c=o.target.value==="on";this.prefs.audioDescriptionEnabled=c,V({audioDescriptionEnabled:c}),M&&M.setAttribute("aria-pressed",c?"true":"false")});const L=this.shadow.getElementById("transcript-search");L==null||L.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(L.value)});const F=this.shadow.getElementById("live-chat-search");F==null||F.addEventListener("input",()=>{this.liveChatViewer&&this.liveChatViewer.setSearchQuery(F.value)});const k=this.shadow.getElementById("tab-btn-transcript"),z=this.shadow.getElementById("tab-btn-chat"),K=this.shadow.getElementById("transcript-view-panel"),fe=this.shadow.getElementById("live-chat-view-panel");k==null||k.addEventListener("click",()=>{this.activeLeftTab="transcript",k.classList.add("active"),k.setAttribute("aria-selected","true"),z==null||z.classList.remove("active"),z==null||z.setAttribute("aria-selected","false"),K&&(K.style.display="flex"),fe&&(fe.style.display="none")}),z==null||z.addEventListener("click",()=>{this.activeLeftTab="chat",z.classList.add("active"),z.setAttribute("aria-selected","true"),k==null||k.classList.remove("active"),k==null||k.setAttribute("aria-selected","false"),K&&(K.style.display="none"),fe&&(fe.style.display="flex"),this.liveChatViewer&&this.liveChatViewer.updateTime(this.mainVideo.currentTime)});const xe=this.shadow.getElementById("btn-dock-tr"),ke=this.shadow.getElementById("btn-dock-br"),Ee=this.shadow.getElementById("btn-dock-split");xe==null||xe.addEventListener("click",()=>{var o;return(o=f==null?void 0:f.__dockPreset)==null?void 0:o.call(f,"tr")}),ke==null||ke.addEventListener("click",()=>{var o;return(o=f==null?void 0:f.__dockPreset)==null?void 0:o.call(f,"br")}),Ee==null||Ee.addEventListener("click",()=>{var o;return(o=f==null?void 0:f.__dockPreset)==null?void 0:o.call(f,"split")});const Le=this.shadow.getElementById("btn-export-brf");Le==null||Le.addEventListener("click",()=>{var se,Y;const o=((se=this.transcriptViewer)==null?void 0:se.getSegments())||[],c=((Y=this.manifest)==null?void 0:Y.title)&&(this.manifest.title[this.activeLocale]||this.manifest.title.en)||"Lesson Transcript",$=Me({title:c,language:this.activeLocale,segments:o.length>0?o:this.currentCues.map((S,Se)=>({id:Se,start:S.start,end:S.end,text:S.text,speaker:this.activeLocale==="am"?"አስተማሪ":"Instructor"})),date:"2026-11-14"}),D=new Blob([$],{type:"text/plain;charset=us-ascii"}),O=URL.createObjectURL(D),j=document.createElement("a");j.href=O,j.download=`lesson-transcript.${this.activeLocale}.brf`,document.body.appendChild(j),j.click(),document.body.removeChild(j),URL.revokeObjectURL(O)});let de=!1;const pe=this.shadow.getElementById("btn-chat-questions-filter");pe==null||pe.addEventListener("click",()=>{de=!de,pe.setAttribute("aria-pressed",de?"true":"false"),pe.classList.toggle("active",de),this.liveChatViewer&&this.liveChatViewer.setQuestionsOnly(de)});let oe=!1;const he=this.shadow.getElementById("btn-3g-audio"),Oe=this.shadow.getElementById("audio-only-banner");he==null||he.addEventListener("click",()=>{oe=!oe,he.setAttribute("aria-pressed",oe?"true":"false"),he.classList.toggle("active",oe),Oe&&(Oe.style.display=oe?"flex":"none"),this.mainVideo&&(oe?this.mainVideo.style.filter="brightness(0.35) blur(6px)":this.mainVideo.style.filter="none")});const ie=this.shadow.getElementById("dialog-shortcuts"),le=this.shadow.getElementById("btn-shortcuts"),ce=this.shadow.getElementById("btn-close-shortcuts"),Fe=this.shadow.getElementById("btn-ok-shortcuts"),ue=o=>{const c=o!==void 0?o:(ie==null?void 0:ie.style.display)==="none";ie&&(ie.style.display=c?"flex":"none"),c?ce==null||ce.focus():le==null||le.focus()};le==null||le.addEventListener("click",()=>ue(!0)),ce==null||ce.addEventListener("click",()=>ue(!1)),Fe==null||Fe.addEventListener("click",()=>ue(!1)),this.shadow.querySelectorAll(".btn-preset-pill").forEach(o=>{o.addEventListener("click",()=>{const c=o.getAttribute("data-preset");if(c){this.prefs.captionTheme=c;const $=this.shadow.getElementById("select-cc-theme");$&&($.value=c),V({captionTheme:c}),this.updateCaptionDisplay()}})});const $e=this.shadow.getElementById("player-container");$e==null||$e.addEventListener("keydown",o=>{if(this.isPreferencesOpen){o.key==="Escape"&&(this.isPreferencesOpen=!1,G&&(G.style.display="none"),N==null||N.focus());return}if(ie&&ie.style.display==="flex"){o.key==="Escape"&&ue(!1);return}if(!(o.target.tagName==="INPUT"||o.target.tagName==="SELECT"))switch(o.key){case" ":case"k":case"K":o.preventDefault(),y();break;case"j":case"J":case"ArrowLeft":o.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":o.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":o.preventDefault(),re();break;case"f":case"F":o.preventDefault(),ne();break;case"0":case"Home":o.preventDefault(),this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0);break;case">":case".":o.preventDefault(),n==null||n.click();break;case"<":case",":o.preventDefault(),l==null||l.click();break;case"c":case"C":o.preventDefault(),T==null||T.click();break;case"s":case"S":o.preventDefault(),B==null||B.click();break;case"d":case"D":o.preventDefault(),M==null||M.click();break;case"t":case"T":o.preventDefault(),I==null||I.click();break;case"?":case"/":o.preventDefault(),ue();break;case"Escape":ae()&&(o.preventDefault(),ne());break}})}updateLocaleStrings(){this.render(),this.initTracksAndTranscript(),this.liveChatViewer&&(this.liveChatViewer.setLocale(this.activeLocale),this.liveChatViewer.setMessages(this.liveChatMessages))}formatTime(e){const s=Math.floor(e/60),t=Math.floor(e%60);return`${s.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}}if(customElements.get("a11y-media-player")||customElements.define("a11y-media-player",we),!customElements.get("db-player")){class u extends we{}customElements.define("db-player",u)}const Ie=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function He(u){const i=typeof u=="string"?new Date(u):u,e=i.getUTCFullYear(),s=i.getUTCMonth()+1,t=i.getUTCDate(),a=Math.floor((14-s)/12),n=e+4800-a,l=s+12*a-3,h=t+Math.floor((153*l+2)/5)+365*n+Math.floor(n/4)-Math.floor(n/100)+Math.floor(n/400)-32045,d=(h-1723856)%1461,g=d%365+365*Math.floor(d/1460),r=4*Math.floor((h-1723856)/1461)+Math.floor(d/365)-Math.floor(d/1460),x=Math.floor(g/30)+1,P=g%30+1,b=Ie[Math.min(x-1,12)];return{year:r,month:x,day:P,monthNameAmharic:b}}function Pe(u){const i=He(u),e=`${i.monthNameAmharic} ${i.day}፣ ${i.year} ዓ.ም`;return{iso:u,ethiopic:e,display:`${u} (${e})`}}class Re extends HTMLElement{constructor(){super();p(this,"shadow");p(this,"job",null);p(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,s,t){if(s!==t){if(e==="locale")this.activeLocale=t||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(t),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",s=this.job.title[this.activeLocale]||this.job.title.en,t=this.job.location[this.activeLocale]||this.job.location.en,a=this.job.description[this.activeLocale]||this.job.description.en,n=this.job.applicationDeadline?Pe(this.job.applicationDeadline):null,l={"@context":"https://schema.org/","@type":"JobPosting",title:s,description:a,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:t,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),s=this.shadow.getElementById("share-feedback");!e||!s||e.addEventListener("click",async()=>{const t=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:t}),s.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(t),s.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{s.textContent=t}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",Re);const Ye="abugida-media",Xe=1;class je{constructor(){p(this,"db",null);p(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((i,e)=>{const s=indexedDB.open(Ye,Xe);s.onupgradeneeded=t=>{const a=t.target.result;a.objectStoreNames.contains("preferences")||a.createObjectStore("preferences"),a.objectStoreNames.contains("progress")||a.createObjectStore("progress",{keyPath:"lessonId"}),a.objectStoreNames.contains("packages")||a.createObjectStore("packages",{keyPath:"packageKey"})},s.onsuccess=t=>{this.db=t.target.result,i()},s.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),i()}})}async saveProgress(i){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${i.lessonId}`,JSON.stringify(i))}catch{}return}return new Promise(e=>{const s=this.db.transaction("progress","readwrite");s.objectStore("progress").put(i),s.oncomplete=()=>e(),s.onerror=()=>e()})}async getProgress(i){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${i}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const a=this.db.transaction("progress","readonly").objectStore("progress").get(i);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)})}async downloadPackage(i,e,s,t,a){await this.init();const n=`${i}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const l=await caches.open(this.cacheName);let h=0;const d=t.length;for(const g of t){const r=await fetch(g);if(!r.ok)throw new Error(`Failed to fetch asset: ${g} (${r.status})`);await l.put(g,r.clone()),h++;const x=Math.round(h/d*100);a(x,h,d)}return await this.savePackageRecord({packageKey:n,lessonId:i,packageId:e,packageName:s,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(l){throw await this.savePackageRecord({packageKey:n,lessonId:i,packageId:e,packageName:s,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:l instanceof Error?l.message:"Download failed"}),l}}async isPackageReady(i,e){await this.init();const s=`${i}:${e}`,t=await this.getPackageRecord(s);return(t==null?void 0:t.status)==="ready"}async savePackageRecord(i){if(this.db)return new Promise(e=>{const s=this.db.transaction("packages","readwrite");s.objectStore("packages").put(i),s.oncomplete=()=>e(),s.onerror=()=>e()})}async getPackageRecord(i){return this.db?new Promise(e=>{const a=this.db.transaction("packages","readonly").objectStore("packages").get(i);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)}):null}}const Ze=new je;w.A11yJobCard=Re,w.A11yMediaPlayer=we,w.DEFAULT_PREFERENCES=A,w.ETHIOPIC_BRAILLE_MAP=ve,w.ETHIOPIC_MONTHS=Ie,w.LiveChatViewer=ze,w.MediaSyncController=Te,w.OfflineStorageManager=je,w.TranscriptViewer=Be,w.UNICODE_BRAILLE_MAP=be,w.formatDualDate=Pe,w.generateBRFDocument=Me,w.getThemeStyles=Ve,w.loadPreferences=ge,w.offlineStorage=Ze,w.parseVTT=me,w.resetPreferences=Ce,w.savePreferences=V,w.toAsciiBraille=De,w.toEthiopianDate=He,w.toUnicodeBraille=Ge,w.wrapBrailleLines=ye,Object.defineProperty(w,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
