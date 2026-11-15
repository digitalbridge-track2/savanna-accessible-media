(function(k,M){typeof exports=="object"&&typeof module<"u"?M(exports):typeof define=="function"&&define.amd?define(["exports"],M):(k=typeof globalThis<"u"?globalThis:k||self,M(k.AbugidaMediaKit={}))})(this,function(k){"use strict";var gt=Object.defineProperty;var ft=(k,M,T)=>M in k?gt(k,M,{enumerable:!0,configurable:!0,writable:!0,value:T}):k[M]=T;var h=(k,M,T)=>ft(k,typeof M!="symbol"?M+"":M,T);const M="abugida_media_preferences",T={captionLanguage:"en",captionSize:"medium",captionTheme:"default",videoQuality:"auto",audioDescriptionEnabled:!1,eslVisible:!0,eslPosition:"bottom-right",eslSize:"medium",playbackRate:1,transcriptVisible:!0,transcriptWidth:260,transcriptHeight:400,eslWidth:240,eslHeight:180};function ke(){try{const g=localStorage.getItem(M);if(!g)return{...T};const s=JSON.parse(g);return{...T,...s}}catch{return{...T}}}function $(g){try{const e={...ke(),...g};return localStorage.setItem(M,JSON.stringify(e)),e}catch{return{...T,...g}}}function je(){try{localStorage.removeItem(M)}catch{}return{...T}}function Ae(g){const s=[],e=g.split(/\r?\n/);let i=0;for(;i<e.length&&!e[i].includes("-->");)i++;for(;i<e.length;){const t=e[i].trim();if(t.includes("-->")){const a=t.split("-->").map(n=>n.trim().split(" ")[0]);if(a.length>=2){const n=qe(a[0]),l=qe(a[1]);i++;const p=[];for(;i<e.length&&e[i].trim()!=="";)p.push(e[i].trim()),i++;p.length>0&&s.push({start:n,end:l,text:p.join(`
`)})}}i++}return s}function qe(g){const s=g.split(":");let e=0,i=0,t=0;return s.length===3?(e=parseFloat(s[0]),i=parseFloat(s[1]),t=parseFloat(s[2].replace(",","."))):s.length===2&&(i=parseFloat(s[0]),t=parseFloat(s[1].replace(",","."))),e*3600+i*60+t}function Oe(g,s){let e="18px";s==="small"&&(e="14px"),s==="large"&&(e="24px"),s==="xlarge"&&(e="32px");let i="#FFFFFF",t="rgba(0, 0, 0, 0.85)",a="none";return g==="yellow-black"?(i="#FFEB3B",t="#000000",a="2px solid #FFEB3B"):g==="white-black"?(i="#FFFFFF",t="#000000",a="2px solid #FFFFFF"):g==="black-yellow"?(i="#000000",t="#FFEB3B",a="2px solid #000000"):g==="amber-gold"&&(i="#FFD700",t="#000000",a="2px solid #FFD700"),`
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
  `}class Qe{constructor(s,e){h(this,"mainVideo");h(this,"signVideo",null);h(this,"driftThreshold");h(this,"isSyncing",!1);h(this,"onSignStatusChange");h(this,"mainListeners",{});h(this,"signListeners",{});this.mainVideo=s,this.driftThreshold=(e==null?void 0:e.driftThreshold)??.25,this.onSignStatusChange=e==null?void 0:e.onSignStatusChange,this.setupMainListeners()}setSignVideo(s){if(this.cleanupSignListeners(),this.signVideo=s,this.signVideo){if(this.signVideo.muted=!0,this.signVideo.playsInline=!0,this.signVideo.playbackRate=this.mainVideo.playbackRate,!isNaN(this.mainVideo.currentTime)&&this.mainVideo.currentTime>0)try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}this.setupSignListeners(),this.notifyStatus(this.signVideo.readyState>=2?"ready":"loading")}else this.notifyStatus("none")}notifyStatus(s){this.onSignStatusChange&&this.onSignStatusChange(s)}setupMainListeners(){this.mainListeners.play=()=>{this.signVideo&&this.signVideo.paused&&!this.mainVideo.paused&&this.signVideo.play().catch(()=>{})},this.mainListeners.pause=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.mainListeners.seeking=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime)},this.mainListeners.seeked=()=>{this.signVideo&&!isNaN(this.mainVideo.currentTime)&&(this.signVideo.currentTime=this.mainVideo.currentTime,this.mainVideo.paused&&!this.signVideo.paused&&this.signVideo.pause())},this.mainListeners.ratechange=()=>{this.signVideo&&(this.signVideo.playbackRate=this.mainVideo.playbackRate)},this.mainListeners.timeupdate=()=>{this.checkDrift()},this.mainListeners.ended=()=>{this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()};for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.addEventListener(s,e)}setupSignListeners(){if(this.signVideo){this.signListeners.waiting=()=>{this.notifyStatus("loading")},this.signListeners.canplay=()=>{this.notifyStatus("ready"),!this.mainVideo.paused&&this.signVideo&&this.signVideo.paused&&this.signVideo.play().catch(()=>{})},this.signListeners.playing=()=>{this.notifyStatus("ready"),this.mainVideo.paused&&this.signVideo&&!this.signVideo.paused&&this.signVideo.pause()},this.signListeners.error=()=>{console.warn("Secondary EthSL sign language video stream encountered an error."),this.notifyStatus("error")};for(const[s,e]of Object.entries(this.signListeners))this.signVideo.addEventListener(s,e)}}checkDrift(){if(!this.signVideo||this.isSyncing||this.signVideo.readyState<2)return;if(Math.abs(this.mainVideo.currentTime-this.signVideo.currentTime)>this.driftThreshold){this.isSyncing=!0;try{this.signVideo.currentTime=this.mainVideo.currentTime}catch{}setTimeout(()=>{this.isSyncing=!1},50)}}async switchSource(s){const e=!this.mainVideo.paused,i=this.mainVideo.currentTime,t=this.mainVideo.playbackRate;return this.mainVideo.src=s,this.mainVideo.load(),new Promise(a=>{const n=async()=>{if(this.mainVideo.removeEventListener("loadedmetadata",n),this.mainVideo.currentTime=i,this.mainVideo.playbackRate=t,e)try{await this.mainVideo.play()}catch{}if(this.signVideo){try{this.signVideo.currentTime=i}catch{}e?this.signVideo.play().catch(()=>{}):this.signVideo.pause()}a()};this.mainVideo.addEventListener("loadedmetadata",n)})}cleanupSignListeners(){if(this.signVideo)for(const[s,e]of Object.entries(this.signListeners))this.signVideo.removeEventListener(s,e);this.signListeners={}}destroy(){for(const[s,e]of Object.entries(this.mainListeners))this.mainVideo.removeEventListener(s,e);this.mainListeners={},this.cleanupSignListeners(),this.signVideo=null}}class Ne{constructor(s,e){h(this,"segments",[]);h(this,"container");h(this,"onSeekAndPlay");h(this,"onFollowChange");h(this,"currentActiveId",null);h(this,"searchQuery","");h(this,"isFollowing",!0);h(this,"userPausedFollowing",!1);h(this,"locale","en");h(this,"listElement",null);h(this,"followBtn",null);h(this,"statusElement",null);this.container=s,this.onSeekAndPlay=e.onSeekAndPlay,this.onFollowChange=e.onFollowChange,this.locale=e.locale||"en"}setLocale(s){this.locale!==s&&(this.locale=s,this.render())}setSegments(s){this.segments=s.map(e=>({...e,start:Number(e.start)||0,end:Number(e.end)||0})).sort((e,i)=>e.start-i.start),this.render()}getSegments(){return[...this.segments]}setSearchQuery(s){this.searchQuery=s.toLowerCase().trim(),this.render()}getActiveSegment(s){return this.segments.length&&this.segments.find(e=>s>=e.start&&s<e.end)||null}updateActiveTime(s){const e=this.getActiveSegment(s),i=e?e.id:null;i!==this.currentActiveId&&(this.currentActiveId=i,this.highlightSegment(i),this.isFollowing&&i!==null&&this.scrollToActiveCue(i))}highlightSegment(s){if(!this.container)return;const e=this.container.querySelector(".transcript-item.active");if(e&&e.classList.remove("active"),s!==null){const i=this.container.querySelector(`[data-segment-id="${s}"]`);i&&i.classList.add("active")}}scrollToActiveCue(s){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-segment-id="${s}"]`);if(!e)return;this.listElement.scrollTop;const i=this.listElement.clientHeight,t=e.offsetTop,a=e.clientHeight,n=t-i/2+a/2;this.listElement.scrollTo({top:Math.max(0,n),behavior:"smooth"})}setFollowing(s){this.setFollowingState(s,!0)}setFollowingState(s,e=!1){var i;if(this.isFollowing=s,e&&(this.userPausedFollowing=!s),(i=this.onFollowChange)==null||i.call(this,s),this.followBtn){this.followBtn.setAttribute("aria-pressed",s?"true":"false");const t=this.locale==="am";s?(this.followBtn.textContent=t?"✓ በተከታታይ አንብብ":"✓ Follow Playback",this.followBtn.setAttribute("aria-label",t?"የጽሑፍ ግልባጭ ተከታትሎ ማንበብ በርቷል":"Follow playback active (Click to pause auto-scroll)")):(this.followBtn.textContent=t?"↻ ተከታትሎ ማንበብ ቀጥል":"↻ Resume Following",this.followBtn.setAttribute("aria-label",t?"ተከታትሎ ማንበብ ቆሟል፤ እንደገና ለማስጀመር ይጫኑ":"Following paused (Click to resume auto-scroll)"))}s&&this.currentActiveId!==null&&this.scrollToActiveCue(this.currentActiveId)}formatTime(s){const e=Math.floor(s/60),i=Math.floor(s%60);return`${e.toString().padStart(2,"0")}:${i.toString().padStart(2,"0")}`}render(){var i;const s=this.locale==="am",e=this.searchQuery?this.segments.filter(t=>t.text.toLowerCase().includes(this.searchQuery)||t.speaker&&t.speaker.toLowerCase().includes(this.searchQuery)||t.visualDescription&&t.visualDescription.toLowerCase().includes(this.searchQuery)):this.segments;if(this.container.innerHTML=`
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
            ${e.map(t=>{const a=this.formatTime(t.start),n=t.id===this.currentActiveId,l=s?`ከ ${a} ጀምሮ አጫውት`:`Play from ${a}`;return`
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
                    ${t.visualDescription?`<div class="visual-desc" aria-label="${s?"ምስላዊ ማብራሪያ":"Visual Description"}: ${this.escapeHtml(t.visualDescription)}">
                            <em>[${s?"ምስላዊ":"Visual"}: ${this.escapeHtml(t.visualDescription)}]</em>
                           </div>`:""}
                  </div>
                </li>
              `}).join("")}
          </ul>
        `}
    `,this.listElement=this.container.querySelector("#transcript-list-box"),this.followBtn=this.container.querySelector("#btn-toggle-follow"),(i=this.followBtn)==null||i.addEventListener("click",()=>{this.setFollowingState(!this.isFollowing,!0)}),this.listElement){const t=()=>{this.isFollowing&&this.setFollowingState(!1,!0)};this.listElement.addEventListener("wheel",t,{passive:!0}),this.listElement.addEventListener("touchmove",t,{passive:!0}),this.listElement.addEventListener("keydown",a=>{["ArrowUp","ArrowDown","PageUp","PageDown","Home","End"].includes(a.key)&&t()})}this.container.querySelectorAll(".btn-seek-time").forEach(t=>{t.addEventListener("click",a=>{const n=parseFloat(a.currentTarget.dataset.time||"0");this.onSeekAndPlay(n),a.currentTarget.focus()})})}escapeHtml(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}}class Ue{constructor(s,e){h(this,"container");h(this,"messages",[]);h(this,"locale","en");h(this,"onSeekAndPlay");h(this,"currentTime",0);h(this,"searchQuery","");h(this,"isAutoScroll",!0);h(this,"isQuestionsOnly",!1);h(this,"listElement",null);h(this,"currentActiveId",null);this.container=s,this.locale=e.locale||"en",this.onSeekAndPlay=e.onSeekAndPlay}setLocale(s){this.locale!==s&&(this.locale=s,this.render())}setMessages(s){this.messages=[...s].sort((e,i)=>e.timestamp-i.timestamp),this.render()}setSearchQuery(s){this.searchQuery=s.toLowerCase().trim(),this.render()}setQuestionsOnly(s){this.isQuestionsOnly!==s&&(this.isQuestionsOnly=s,this.render())}setAutoScroll(s){this.isAutoScroll=s}updateTime(s){this.currentTime=s;const e=this.messages.filter(a=>a.timestamp<=s),i=e.length>0?e[e.length-1]:null,t=i?i.id:null;t!==this.currentActiveId&&(this.currentActiveId=t,this.updateActiveStyles(),this.isAutoScroll&&t&&this.scrollToMessage(t))}updateActiveStyles(){if(!this.container)return;this.container.querySelectorAll(".chat-replay-item").forEach(e=>{const i=e.getAttribute("data-chat-id");Number(e.getAttribute("data-timestamp")||"0")<=this.currentTime?(e.classList.add("is-delivered"),e.classList.remove("is-future")):(e.classList.remove("is-delivered"),e.classList.add("is-future")),i===this.currentActiveId?e.classList.add("is-active-latest"):e.classList.remove("is-active-latest")})}scrollToMessage(s){if(!this.listElement)return;const e=this.listElement.querySelector(`[data-chat-id="${s}"]`);e&&e.scrollIntoView({behavior:"smooth",block:"nearest"})}render(){const s=this.locale==="am";if(!this.messages.length){this.container.innerHTML=`
        <div class="chat-empty-state" role="status" style="padding: 1.5rem; text-align: center; color: #64748B; font-size: 0.88rem;">
          ${s?"የቀጥታ ውይይት መልዕክቶች አልተገኙም።":"No live chat messages recorded for this session."}
        </div>
      `;return}const e=this.messages.filter(t=>{const a=t.message.en.includes("?")||t.message.am.includes("?")||t.message.am.includes("፧");if(this.isQuestionsOnly&&!a)return!1;if(!this.searchQuery)return!0;const n=(s?t.message.am:t.message.en).toLowerCase(),l=t.sender.toLowerCase();return n.includes(this.searchQuery)||l.includes(this.searchQuery)});this.container.innerHTML=`
      <ol class="chat-replay-list" role="list" aria-label="${s?"የቀጥታ ትምህርት ውይይት መልዕክቶች":"Recorded live session chat messages"}" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.65rem;">
        ${e.map(t=>{const a=t.timestamp<=this.currentTime,n=t.id===this.currentActiveId,l=t.role==="instructor",p=t.role==="ta",d=t.message.en.includes("?")||t.message.am.includes("?")||t.message.am.includes("፧"),u=l?s?"አስተማሪ":"Instructor":p?s?"ረዳት":"TA":s?"ተማሪ":"Student",o=l?"rgba(0, 113, 227, 0.12)":p?"rgba(16, 185, 129, 0.14)":"var(--color-surface, #F1F5F9)",E=l?"var(--color-brand, #0071E3)":p?"#059669":"var(--color-muted-ink, #475569)",I=n?"var(--color-brand, #0071E3)":l?"#0071E3":p?"#10B981":"var(--color-border, #CBD5E1)",x=s?t.message.am:t.message.en,H=s?`ወደ ${t.timeDisplay} ይዝለሉ እና የ ${t.sender} ጥያቄ ያዳምጡ`:`Jump to ${t.timeDisplay} to hear discussion with ${t.sender}`;return`
              <li 
                class="chat-replay-item ${a?"is-delivered":"is-future"} ${n?"is-active-latest":""}"
                data-chat-id="${t.id}"
                data-timestamp="${t.timestamp}"
                tabindex="0"
                role="button"
                aria-label="${H}"
                title="${H}"
                style="
                  display: flex;
                  flex-direction: column;
                  padding: 0.65rem 0.85rem;
                  border-radius: 6px;
                  background: ${n?"var(--color-brand-subtle, #EFF6FF)":"var(--color-surface-elevated, #FFFFFF)"};
                  border: 1px solid var(--color-border-subtle, #E2E8F0);
                  border-left: 3.5px solid ${I};
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
                      background: ${o};
                      color: ${E};
                    ">${u}</span>
                    ${d?`<span style="font-size: 0.68rem; font-weight: 600; background: rgba(217, 119, 6, 0.15); color: #B45309; padding: 1px 5px; border-radius: 4px;">❓ ${s?"ጥያቄ":"Question"}</span>`:""}
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
                  ${x}
                </div>
              </li>
            `}).join("")}
      </ol>
    `,this.listElement=this.container.querySelector(".chat-replay-list"),this.container.querySelectorAll(".chat-replay-item").forEach(t=>{const a=Number(t.getAttribute("data-timestamp")||"0"),n=()=>{this.onSeekAndPlay(a)};t.addEventListener("click",n),t.addEventListener("keydown",l=>{const p=l;(p.key==="Enter"||p.key===" ")&&(p.preventDefault(),n())})})}}const Ce={a:"⠁",b:"⠃",c:"⠉",d:"⠙",e:"⠑",f:"⠋",g:"⠛",h:"⠓",i:"⠊",j:"⠚",k:"⠅",l:"⠇",m:"⠍",n:"⠝",o:"⠕",p:"⠏",q:"⠟",r:"⠗",s:"⠎",t:"⠞",u:"⠥",v:"⠧",w:"⠺",x:"⠭",y:"⠽",z:"⠵"," ":" ",".":"⠲",",":"⠂",";":"⠆",":":"⠒","!":"⠖","?":"⠦","-":"⠤","(":"⠶",")":"⠶",'"':"⠦","'":"⠄","/":"⠌"},Ve={ሀ:"⠓⠁",ሁ:"⠓⠥",ሂ:"⠓⠊",ሃ:"⠓⠜",ሄ:"⠓⠑",ህ:"⠓",ሆ:"⠓⠕",ለ:"⠇⠁",ሉ:"⠇⠥",ሊ:"⠇⠊",ላ:"⠇⠜",ሌ:"⠇⠑",ል:"⠇",ሎ:"⠇⠕",መ:"⠍⠁",ሙ:"⠍⠥",ሚ:"⠍⠊",ማ:"⠍⠜",ሜ:"⠍⠑",ም:"⠍",ሞ:"⠍⠕",ረ:"⠗⠁",ሩ:"⠗⠥",ሪ:"⠗⠊",ራ:"⠗⠜",ሬ:"⠗⠑",ር:"⠗",ሮ:"⠗⠕",ሰ:"⠎⠁",ሱ:"⠎⠥",ሲ:"⠎⠊",ሳ:"⠎⠜",ሴ:"⠎⠑",ስ:"⠎",ሶ:"⠎⠕",በ:"⠃⠁",ቡ:"⠃⠥",ቢ:"⠃⠊",ባ:"⠃⠜",ቤ:"⠃⠑",ብ:"⠃",ቦ:"⠃⠕",ተ:"⠞⠁",ቱ:"⠞⠥",ቲ:"⠞⠊",ታ:"⠞⠜",ቴ:"⠞⠑",ት:"⠞",ቶ:"⠞⠕",አ:"⠁",ኡ:"⠥",ኢ:"⠊",ኣ:"⠜",ኤ:"⠑",እ:"⠢",ኦ:"⠕",የ:"⠽⠁",ዩ:"⠽⠥",ዪ:"⠽⠊",ያ:"⠽⠜",ዬ:"⠽⠑",ይ:"⠽",ዮ:"⠽⠕",ደ:"⠙⠁",ዱ:"⠙⠥",ዲ:"⠙⠊",ዳ:"⠙⠜",ዴ:"⠙⠑",ድ:"⠙",ዶ:"⠙⠕",ጀ:"⠚⠁",ጁ:"⠚⠥",ጂ:"⠚⠊",ጃ:"⠚⠜",ጄ:"⠚⠑",ጅ:"⠚",ጆ:"⠚⠕",ገ:"⠛⠁",ጉ:"⠛⠥",ጊ:"⠛⠊",ጋ:"⠛⠜",ጌ:"⠛⠑",ግ:"⠛",ጎ:"⠛⠕",ፈ:"⠋⠁",ፉ:"⠋⠥",ፊ:"⠋⠊",ፋ:"⠋⠜",ፌ:"⠋⠑",ፍ:"⠋",ፎ:"⠋⠕","፡":" ","።":"⠲","፣":"⠂","፤":"⠆","፥":"⠒","፦":"⠒⠤","፧":"⠦"};function ot(g){let s="";for(let e=0;e<g.length;e++){const i=g[e];if(Ve[i]){s+=Ve[i];continue}const t=i.toLowerCase();i>="A"&&i<="Z"?s+="⠠"+(Ce[t]||t):i>="0"&&i<="9"?((e===0||!/[0-9]/.test(g[e-1]))&&(s+="⠼"),s+={1:"⠁",2:"⠃",3:"⠉",4:"⠙",5:"⠑",6:"⠋",7:"⠛",8:"⠓",9:"⠊",0:"⠚"}[i]||i):s+=Ce[t]||i}return s}function We(g){let s="";for(let e=0;e<g.length;e++){const i=g[e];i>="A"&&i<="Z"?s+=","+i:i>="0"&&i<="9"?((e===0||!/[0-9]/.test(g[e-1]))&&(s+="#"),s+=String.fromCharCode(i.charCodeAt(0)+16)):i==="."?s+="4":i===","?s+="1":i===";"?s+="2":i===":"?s+="3":i==="!"?s+="6":i==="?"?s+="8":s+=i}return s}function Te(g,s=40){const e=g.split(/\s+/),i=[];let t="";for(const a of e)if(a)if((t+(t?" ":"")+a).length<=s)t+=(t?" ":"")+a;else if(t&&i.push(t),a.length>s){let n=a;for(;n.length>s;)i.push(n.slice(0,s)),n=n.slice(s);t=n}else t=a;return t&&i.push(t),i}function _e(g){const s=g.language==="am",e=[],i=25,t=40,a="=".repeat(t);e.push(a),e.push(...Te(g.title.toUpperCase(),t)),e.push("STANDARD: BANA 40X25 GRADE-1 EMBOSSER"),e.push(`LANGUAGE: ${s?"AMHARIC":"ENGLISH"}`),e.push(`DATE: ${g.date||"2026-11-14 (HIDAR 5, 2019 E.C.)"}`),e.push(a),e.push("");for(let d=0;d<g.segments.length;d++){const u=g.segments[d],o=d+1,E=Math.floor(u.start/60).toString().padStart(2,"0"),I=Math.floor(u.start%60).toString().padStart(2,"0"),x=Math.floor(u.end/60).toString().padStart(2,"0"),H=Math.floor(u.end%60).toString().padStart(2,"0"),K=u.speaker||(s?"አስተማሪ":"Instructor");e.push(`[#${o} ${E}:${I}-${x}:${H} ${K}]`);const w=We(u.text);e.push(...Te(w,t)),e.push("")}const n=[];let l=[],p=1;for(let d=0;d<e.length;d++)if(l.push(e[d]),l.length===i-1||d===e.length-1){const o=`P.${p}`.padStart(t," ");l.push(o),n.push(l.join(`\r
`)),l=[],p++}return n.join(`\r
\f\r
`)}const A={play:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',pause:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',restart:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',rewind:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',forward:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',cc:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1a1 1 0 01-1 1h-3a1 1 0 01-1-1v-4a1 1 0 011-1h3a1 1 0 011 1v1z"/></svg>',esl:'<svg viewBox="0 0 32 20" width="28" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="1.5" y="1.5" width="29" height="17" rx="3.5" fill="rgba(255,255,255,0.06)"/><text x="16" y="14" text-anchor="middle" fill="currentColor" stroke="none" font-size="11" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" letter-spacing="0.5">ESL</text></svg>',ad:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M3 3.5h6.2c4.2 0 7.3 3 7.3 7.5s-3.1 7.5-7.3 7.5H3V3.5zm3.6 3.4v8.2h2.4c2.2 0 3.7-1.7 3.7-4.1s-1.5-4.1-3.7-4.1H6.6z"/><path d="M17.5 8.5c1 1.5 1 3.5 0 5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M20.5 6c2 2.7 2 7.3 0 10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>',transcript:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>',faster:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M12.5 12.9a1.5 1.5 0 0 0 1-1.4c0-.8-.7-1.5-1.5-1.5s-1.5.7-1.5 1.5a1.5 1.5 0 0 0 .5 1.1l3.2 3.2 1.1-1.1-2.8-1.8z"/><path d="M18 12v6M15 15h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',slower:'<svg viewBox="0 0 24 24" width="22" height="20" fill="currentColor" aria-hidden="true"><path d="M12 4a9 9 0 0 0-9 9c0 2.4 1 4.5 2.6 6.1l1.4-1.4A7 7 0 0 1 5 13a7 7 0 0 1 12.6-4.2l1.5-1.5A9 9 0 0 0 12 4z"/><path d="M11 11.5a1.5 1.5 0 0 0-1 1.4c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5a1.5 1.5 0 0 0-.5-1.1l-3.2-3.2-1.1 1.1 2.8 1.8z"/><rect x="15" y="14" width="6" height="2.2" rx="1"/></svg>',prefs:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',fullscreenEnter:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>',fullscreenExit:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>',volumeUnmuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',volumeMuted:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',shortcuts:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/></svg>',quality:'<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-4V9h4c.55 0 1 .45 1 1v4zm-1.5-3.5h-2v3h2v-3z"/></svg>'};class ze extends HTMLElement{constructor(){super();h(this,"shadow");h(this,"manifest",null);h(this,"activeLocale","en");h(this,"prefs");h(this,"mainVideo");h(this,"signVideo",null);h(this,"syncController");h(this,"pendingSeekTime",null);h(this,"currentCues",[]);h(this,"captionOverlay");h(this,"transcriptViewer");h(this,"liveChatViewer");h(this,"liveChatMessages",[]);h(this,"activeLeftTab","transcript");h(this,"isPreferencesOpen",!1);h(this,"isQualityMenuOpen",!1);h(this,"currentQuality","auto");h(this,"qualityToastTimer",null);h(this,"onCaptionsUpdated",()=>{this.initTracksAndTranscript()});this.shadow=this.attachShadow({mode:"open"}),this.prefs=ke(),this.currentQuality=this.prefs.videoQuality||"auto"}static get observedAttributes(){return["manifest-src","locale","lang","src","captions","sign","describe","api"]}connectedCallback(){this.activeLocale=this.getAttribute("lang")||this.getAttribute("locale")||"en";const e=this.getAttribute("manifest-src");e?this.loadManifest(e):this.getAttribute("src")&&this.initFromAttributes(),window.addEventListener("db-player:captions-updated",this.onCaptionsUpdated)}disconnectedCallback(){window.removeEventListener("db-player:captions-updated",this.onCaptionsUpdated),this.syncController&&this.syncController.destroy()}attributeChangedCallback(e,i,t){i!==t&&(e==="locale"||e==="lang"?(this.activeLocale=t||"en",this.updateLocaleStrings()):e==="manifest-src"?this.loadManifest(t):(e==="src"||e==="captions"||e==="sign"||e==="describe")&&(this.getAttribute("manifest-src")||this.initFromAttributes()))}initFromAttributes(){const e=this.getAttribute("src");if(!e)return;const i=this.getAttribute("lang")||this.getAttribute("locale")||"en";this.activeLocale=i;const t=this.getAttribute("captions")||"",a=this.getAttribute("sign"),n=this.getAttribute("describe"),l=t.split(",").map(p=>p.trim()).filter(Boolean).map(p=>{const d=p.includes(".am.")||p.endsWith("am.vtt")||p.includes("am");return{id:d?"cap-am":"cap-en",language:d?"am":"en",label:d?"አማርኛ":"English",src:p}});this.manifest={id:"lesson-player",version:"1.0.0",title:{en:"Lesson Video",am:"የትምህርት ቪዲዮ"},sources:[{id:"main-video",kind:"main",src:e,mimeType:"video/mp4"},...a?[{id:"sign-video",kind:"sign",src:a,mimeType:"video/mp4"}]:[]],captionTracks:l,audioDescription:n?{src:n}:void 0},this.render(),this.initTracksAndTranscript()}async loadManifest(e){var i,t;try{const a=await fetch(e);if(!a.ok)throw new Error(`HTTP error ${a.status}`);const n=await a.json();let l;try{l=new URL(e,window.location.href)}catch{l=new URL(window.location.href)}const p=d=>{if(!d)return d;try{return new URL(d,l).href}catch{return d}};if(this.manifest={...n,poster:n.poster?{...n.poster,src:p(n.poster.src)}:void 0,sources:(n.sources||[]).map(d=>({...d,src:p(d.src)})),captionTracks:(n.captionTracks||[]).map(d=>({...d,src:p(d.src)})),transcript:n.transcript?{...n.transcript,src:p(n.transcript.src)}:n.transcript,liveSession:n.liveSession?{...n.liveSession,chatSrc:n.liveSession.chatSrc?p(n.liveSession.chatSrc):void 0}:void 0},(t=(i=this.manifest)==null?void 0:i.liveSession)!=null&&t.chatSrc)try{const d=await fetch(this.manifest.liveSession.chatSrc);d.ok&&(this.liveChatMessages=await d.json(),this.liveChatViewer&&this.liveChatViewer.setMessages(this.liveChatMessages))}catch(d){console.warn("Could not load live chat messages:",d)}this.render(),await this.initTracksAndTranscript()}catch(a){this.renderError(a instanceof Error?a.message:"Failed to load manifest")}}async initTracksAndTranscript(){var i;if(!this.manifest)return;await this.loadCaptionTrack(this.prefs.captionLanguage);const e=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-transcript:${this.activeLocale}`):null;if(e)try{const a=(JSON.parse(e).segments||[]).map(n=>({id:n.id,start:n.start_ms!==void 0?n.start_ms/1e3:n.start||0,end:n.end_ms!==void 0?n.end_ms/1e3:n.end||0,speaker:n.speaker,text:n.text||n.reviewedText||n.draft_text||n.draftText||"",visualDescription:n.visual_description||n.visualDescription}));this.transcriptViewer.setSegments(a);return}catch(t){console.warn("Could not parse custom transcript, falling back to manifest src",t)}if((i=this.manifest.transcript)!=null&&i.src)try{const t=await fetch(this.manifest.transcript.src);if(t.ok){const n=((await t.json()).segments||[]).map(l=>({id:l.id,start:l.start_ms!==void 0?l.start_ms/1e3:l.start||0,end:l.end_ms!==void 0?l.end_ms/1e3:l.end||0,speaker:l.speaker,text:l.text||l.draft_text||"",visualDescription:l.visual_description||l.visualDescription}));this.transcriptViewer.setSegments(n)}}catch(t){console.warn("Could not load external transcript file, using fallback cues",t)}}async loadCaptionTrack(e){if(!this.manifest||e==="off"){this.currentCues=[],this.updateCaptionDisplay();return}const i=this.manifest.captionTracks.find(t=>t.language===e);if(!i){this.currentCues=[],this.updateCaptionDisplay();return}try{const t=typeof localStorage<"u"?localStorage.getItem(`db-player:custom-vtt:${e}`):null;if(t)this.currentCues=Ae(t);else{const a=await fetch(i.src);if(a.ok){const n=await a.text();this.currentCues=Ae(n)}}}catch{this.currentCues=[]}this.updateCaptionDisplay()}updateCaptionDisplay(){if(!this.captionOverlay||!this.mainVideo)return;if(this.prefs.captionLanguage==="off"||this.currentCues.length===0){this.captionOverlay.style.display="none";return}const e=this.mainVideo.currentTime,i=this.currentCues.find(t=>e>=t.start&&e<=t.end);i?(this.captionOverlay.style.display="block",this.captionOverlay.style.cssText=Oe(this.prefs.captionTheme,this.prefs.captionSize),this.captionOverlay.textContent=i.text):this.captionOverlay.style.display="none"}seekAndPlay(e){if(isNaN(this.mainVideo.duration)||this.mainVideo.readyState<1){this.pendingSeekTime=e;const i=()=>{this.mainVideo.removeEventListener("loadedmetadata",i),this.mainVideo.currentTime=e,this.mainVideo.play().catch(()=>{}),this.pendingSeekTime=null};this.mainVideo.addEventListener("loadedmetadata",i);return}this.mainVideo.currentTime=e,this.mainVideo.play().catch(i=>{console.warn("Playback interrupted or prevented on seek:",i)})}renderError(e){this.shadow.innerHTML=`
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
    `}resolveMainSource(e=this.currentQuality){if(!this.manifest||!this.manifest.sources)return"";const i=this.manifest.sources.filter(a=>a.kind==="main");if(!i.length)return"";if(e==="auto"){const a=navigator.connection;if(a!=null&&a.saveData||(a==null?void 0:a.effectiveType)==="slow-2g"||(a==null?void 0:a.effectiveType)==="2g"){const l=i.find(p=>p.quality==="240p");if(l)return l.src}else if((a==null?void 0:a.effectiveType)==="3g"){const l=i.find(p=>p.quality==="360p");if(l)return l.src}const n=i.find(l=>l.quality==="720p");return n?n.src:i[0].src}const t=i.find(a=>a.quality===e);return t?t.src:i[0].src}async applyQuality(e){this.currentQuality=e,this.prefs.videoQuality=e,$({videoQuality:e});const i=this.shadow.getElementById("quality-badge-text");i&&(i.textContent=e==="auto"?"Auto":e),this.shadow.querySelectorAll(".quality-menu-item").forEach(d=>{const o=d.getAttribute("data-quality")===e;d.classList.toggle("selected",o),d.setAttribute("aria-checked",o?"true":"false");const E=d.querySelector(".quality-check");E&&(E.textContent=o?"✓":"")});const a=this.shadow.getElementById("select-video-quality");a&&a.value!==e&&(a.value=e);const n=this.shadow.getElementById("quality-toast"),l=this.shadow.getElementById("quality-toast-text");if(n&&l){const d=this.activeLocale==="am",u=e==="auto"?d?"ጥራት፡ Auto (ተለዋዋጭ)":"Quality: Auto (Adaptive)":`${d?"ጥራት፡ ":"Quality: "}${e}`;l.textContent=`⚡ ${u}`,n.style.display="flex",n.style.opacity="1",this.qualityToastTimer&&clearTimeout(this.qualityToastTimer),this.qualityToastTimer=window.setTimeout(()=>{n.style.opacity="0",setTimeout(()=>{n.style.opacity==="0"&&(n.style.display="none")},300)},2e3)}const p=this.resolveMainSource(e);if(p&&this.mainVideo&&!this.prefs.audioDescriptionEnabled)if(this.syncController)await this.syncController.switchSource(p);else{const d=!this.mainVideo.paused,u=this.mainVideo.currentTime,o=this.mainVideo.playbackRate;if(this.mainVideo.src=p,this.mainVideo.currentTime=u,this.mainVideo.playbackRate=o,d)try{await this.mainVideo.play()}catch{}}}render(){var u,o,E;const e=this.activeLocale==="am",i=this.manifest?this.manifest.title[this.activeLocale]:"Media Player",t=this.resolveMainSource(this.currentQuality),a=(u=this.manifest)==null?void 0:u.sources.find(I=>I.kind==="sign"),n=this.prefs.transcriptWidth||T.transcriptWidth||260,l=this.prefs.transcriptHeight||T.transcriptHeight||400,p=this.prefs.eslWidth||T.eslWidth||240,d=this.prefs.eslHeight||T.eslHeight||180;this.shadow.innerHTML=`
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

        /* Video Quality Popover Menu & Button */
        .quality-popover {
          position: absolute;
          bottom: 58px;
          right: 68px;
          min-width: 170px;
          background: rgba(24, 24, 27, 0.96);
          color: #F8FAFC;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          z-index: 125;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          padding: 6px 0;
          box-sizing: border-box;
          transform-origin: bottom right;
          animation: appleFlyoutIn 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .quality-menu-header {
          padding: 6px 14px 6px 14px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94A3B8;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 4px;
          user-select: none;
        }

        .quality-menu-list {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .quality-menu-item {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 8px 14px;
          background: transparent;
          border: none;
          color: #F1F5F9;
          font-size: 0.88rem;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          gap: 8px;
          transition: background 0.12s ease, color 0.12s ease;
          box-sizing: border-box;
        }

        .quality-menu-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
        }

        .quality-menu-item:focus-visible {
          background: rgba(255, 255, 255, 0.15);
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: -2px;
        }

        .quality-menu-item.selected {
          font-weight: 700;
          color: #FFFFFF;
        }

        .quality-check {
          width: 18px;
          color: #FFFFFF;
          font-size: 0.95rem;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          flex-shrink: 0;
          margin-right: 6px;
        }

        .quality-name {
          flex: 1 1 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 6px;
        }

        .quality-tag {
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.14);
          color: #CBD5E1;
          letter-spacing: 0.02em;
        }

        .btn-ctrl.btn-ctrl-quality {
          width: auto !important;
          min-width: 52px;
          height: 30px;
          padding: 0 6px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          border-radius: 4px;
        }
        .quality-badge-text {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.16);
          color: #FFFFFF;
          line-height: 1;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255, 255, 255, 0.18);
        }
        .btn-ctrl-quality.is-active {
          color: var(--color-brand, #38BDF8);
          background: rgba(255, 255, 255, 0.22);
        }

        /* Quality Toast Pill (Subtle on-screen indicator) */
        .quality-toast {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(56, 189, 248, 0.4);
          border-radius: 999px;
          padding: 6px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 30;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
          pointer-events: none;
          color: #F8FAFC;
          font-size: 0.82rem;
          font-weight: 600;
          animation: toastIn 0.2s ease-out;
          transition: opacity 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, -6px); }
          to { opacity: 1; transform: translate(-50%, 0); }
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
          overflow: visible;
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
          border-radius: 8px 8px 0 0;
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
          border-radius: 0 0 8px 8px;
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

        /* Accessibility Preferences Popover Flyout (Flows smoothly from settings icon, zero dark scrim) */
        .prefs-popover {
          position: absolute;
          bottom: 64px;
          right: 12px;
          width: 360px;
          max-width: calc(100% - 24px);
          max-height: min(520px, calc(100vh - 100px));
          background: var(--color-surface-elevated, #FFFFFF);
          color: var(--color-ink, #1D1D1F);
          border-radius: 14px;
          border: 1px solid var(--color-border, rgba(0, 0, 0, 0.12));
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.24), 0 2px 10px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(24px) saturate(180%);
          -webkit-backdrop-filter: blur(24px) saturate(180%);
          z-index: 120;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
          transform-origin: bottom right;
          animation: appleFlyoutIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes appleFlyoutIn {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .popover-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.95rem;
          border-bottom: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.08));
          background: rgba(0, 0, 0, 0.02);
          flex-shrink: 0;
        }
        .popover-title {
          font-size: 0.92rem;
          font-weight: 600;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 0.45rem;
          margin: 0;
          letter-spacing: -0.01em;
        }
        .popover-title svg {
          width: 16px;
          height: 16px;
          color: var(--color-brand, #0071E3);
        }
        .btn-popover-close {
          background: transparent;
          border: none;
          color: var(--color-muted-ink, #64748B);
          width: 28px;
          height: 28px;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
          transition: background 0.15s ease, color 0.15s ease;
          padding: 0;
        }
        .btn-popover-close:hover {
          background: rgba(0, 0, 0, 0.08);
          color: var(--color-ink, #0F172A);
        }
        .btn-popover-close:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        .popover-body {
          padding: 0.75rem 0.95rem;
          overflow-y: auto;
          flex: 1 1 auto;
          scrollbar-width: thin;
          scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
        }
        .popover-body .form-row {
          margin-bottom: 0.65rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .popover-body .form-row:last-child {
          margin-bottom: 0;
        }
        .popover-body label {
          font-weight: 600;
          font-size: 0.8rem;
          color: inherit;
        }
        .popover-body select {
          padding: 0.35rem 0.6rem;
          border-radius: 8px;
          border: 1px solid var(--color-border, #D2D2D7);
          background: var(--color-surface, #FFFFFF);
          color: var(--color-ink, #1D1D1F);
          font-size: 0.85rem;
          min-height: 36px;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .popover-body select:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }

        .popover-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.55rem 0.95rem;
          border-top: 1px solid var(--color-border-subtle, rgba(0, 0, 0, 0.08));
          background: rgba(0, 0, 0, 0.02);
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .btn-popover-action {
          padding: 0.45rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: 6px;
          min-height: 36px;
          border: 1px solid transparent;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          transition: all 0.15s ease;
        }
        .btn-popover-action:focus-visible {
          outline: 2px solid var(--color-focus, #0071E3);
          outline-offset: 1px;
        }
        .btn-popover-reset {
          background: transparent;
          color: var(--color-muted-ink, #64748B);
          border-color: var(--color-border, #CBD5E1);
        }
        .btn-popover-reset:hover {
          background: rgba(0, 0, 0, 0.05);
          color: var(--color-ink, #1E293B);
        }
        .btn-popover-save {
          background: var(--color-brand, #0071E3);
          color: #FFFFFF;
        }
        .btn-popover-save:hover {
          filter: brightness(1.1);
        }

        #btn-prefs {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), color 0.15s ease, background 0.15s ease;
        }
        #btn-prefs.is-active {
          transform: rotate(45deg);
          color: var(--color-brand, #0071E3);
          background: rgba(255, 255, 255, 0.25);
        }

        @media (max-width: 600px) {
          .prefs-popover {
            right: 8px;
            left: 8px;
            width: auto;
            max-width: none;
            bottom: 56px;
          }
          .quality-popover {
            right: 16px;
            bottom: 56px;
          }
        }

        /* Keyboard Shortcuts Modal Dialog (Soft accessible scrim) */
        .dialog-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
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

      <section class="player-component" aria-label="${i}">
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
          <div class="main-player-panel" id="player-container" tabindex="0" aria-label="${i} (Press ? for keyboard shortcuts)">
            <div class="video-viewport">
              <video 
                id="main-video" 
                class="main-video" 
                playsinline 
                preload="metadata"
                poster="${((E=(o=this.manifest)==null?void 0:o.poster)==null?void 0:E.src)||""}"
                src="${t}">
              </video>

              <!-- Video Quality Toast Indicator -->
              <div class="quality-toast" id="quality-toast" style="display: none;" role="status" aria-live="polite">
                <span id="quality-toast-text">⚡ Quality: Auto</span>
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
                    <span id="play-icon" aria-hidden="true">${A.play}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-restart" aria-label="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}" title="${e?"እንደገና ጀምር (0 / Home)":"Restart (0 / Home)"}">
                    <span aria-hidden="true">${A.restart}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-rewind" aria-label="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}" title="${e?"ወደኋላ 5 ሰከንድ (J / ←)":"Rewind 5 seconds (J / ←)"}">
                    <span aria-hidden="true">${A.rewind}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-forward" aria-label="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}" title="${e?"ወደፊት 5 ሰከንድ (L / →)":"Forward 5 seconds (L / →)"}">
                    <span aria-hidden="true">${A.forward}</span>
                  </button>
                </div>

                <!-- Center: Accessibility & Speed -->
                <div class="controls-cluster">
                  <button class="btn-ctrl" id="btn-cc" aria-pressed="${this.prefs.captionLanguage!=="off"?"true":"false"}" aria-label="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}" title="${e?"የትርጉም ጽሑፍ (C)":"Captions (C)"}">
                    <span aria-hidden="true">${A.cc}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-esl" aria-pressed="${this.prefs.eslVisible?"true":"false"}" aria-label="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}" title="${e?"የኢትዮጵያ የምልክት ቋንቋ (ESL) (S)":"Ethiopian Sign Language (ESL) (S)"}">
                    <span aria-hidden="true">${A.esl}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-ad" aria-pressed="${this.prefs.audioDescriptionEnabled?"true":"false"}" aria-label="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}" title="${e?"የድምጽ ማብራሪያ (D)":"Audio Description (D)"}">
                    <span aria-hidden="true">${A.ad}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-transcript-toggle" aria-pressed="${this.prefs.transcriptVisible!==!1?"true":"false"}" aria-label="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}" title="${e?"የጽሑፍ ግልባጭ ማሳያ (T)":"Toggle Transcript (T)"}">
                    <span aria-hidden="true">${A.transcript}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>

                  <button class="btn-ctrl" id="btn-speed-faster" aria-label="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}" title="${e?"ፍጥነት ጨምር (>)":"Increase speed (>)"}">
                    <span aria-hidden="true">${A.faster}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-speed-slower" aria-label="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}" title="${e?"ፍጥነት ቀንስ (<)":"Decrease speed (<)"}">
                    <span aria-hidden="true">${A.slower}</span>
                  </button>

                  <span class="ctrl-divider" aria-hidden="true"></span>
                </div>

                <!-- Right: Settings, Fullscreen, Volume -->
                <div class="controls-cluster">
                  <button class="btn-ctrl btn-ctrl-quality" id="btn-quality" aria-expanded="false" aria-haspopup="menu" aria-label="${e?"የቪዲዮ ጥራት":"Video Quality"}" title="${e?"የቪዲዮ ጥራት መቆጣጠሪያ (Auto / 720p / 360p / 240p)":"Video Quality (Auto / 720p / 360p / 240p)"}">
                    <span aria-hidden="true">${A.quality}</span>
                    <span class="quality-badge-text" id="quality-badge-text">${this.currentQuality==="auto"?"Auto":this.currentQuality}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-shortcuts" aria-expanded="false" aria-label="${e?"የኪቦርድ አቋራጮች (?)":"Keyboard Shortcuts (?)"}" title="${e?"የኪቦርድ አቋራጮች (?)":"Keyboard Shortcuts (?)"}">
                    <span aria-hidden="true">${A.shortcuts}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-prefs" aria-expanded="false" aria-label="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}" title="${e?"የተደራሽነት ምርጫዎች":"Accessibility Preferences"}">
                    <span aria-hidden="true">${A.prefs}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-fullscreen" aria-pressed="false" aria-label="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}" title="${e?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"}">
                    <span id="fullscreen-icon" aria-hidden="true">${A.fullscreenEnter}</span>
                  </button>

                  <button class="btn-ctrl" id="btn-mute" aria-pressed="false" aria-label="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}" title="${e?"ድምጽ አጥፋ (M)":"Mute (M)"}">
                    <span id="mute-icon" aria-hidden="true">${A.volumeUnmuted}</span>
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

            <!-- Video Quality Popover Menu (Aligned with standard media players) -->
            <div 
              class="quality-popover" 
              id="quality-menu" 
              style="display: none;" 
              role="menu" 
              aria-label="${e?"የቪዲዮ ጥራት":"Video Quality"}">
              <div class="quality-menu-header">${e?"የቪዲዮ ጥራት":"QUALITY"}</div>
              <div class="quality-menu-list">
                <button type="button" class="quality-menu-item ${this.currentQuality==="auto"?"selected":""}" data-quality="auto" role="menuitemradio" aria-checked="${this.currentQuality==="auto"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality==="auto"?"✓":""}</span>
                  <span class="quality-name">Auto</span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality==="720p"?"selected":""}" data-quality="720p" role="menuitemradio" aria-checked="${this.currentQuality==="720p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality==="720p"?"✓":""}</span>
                  <span class="quality-name">720p <span class="quality-tag">HD</span></span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality==="360p"?"selected":""}" data-quality="360p" role="menuitemradio" aria-checked="${this.currentQuality==="360p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality==="360p"?"✓":""}</span>
                  <span class="quality-name">360p <span class="quality-tag">SD</span></span>
                </button>
                <button type="button" class="quality-menu-item ${this.currentQuality==="240p"?"selected":""}" data-quality="240p" role="menuitemradio" aria-checked="${this.currentQuality==="240p"}">
                  <span class="quality-check" aria-hidden="true">${this.currentQuality==="240p"?"✓":""}</span>
                  <span class="quality-name">240p <span class="quality-tag">${e?"ዝቅተኛ":"Low Data"}</span></span>
                </button>
              </div>
            </div>

            <!-- Accessibility & Layout Settings Popover (Flows smoothly from settings icon, zero dark scrim) -->
            <div 
              class="prefs-popover" 
              id="prefs-dialog" 
              style="display: none;" 
              role="dialog" 
              aria-modal="true" 
              aria-labelledby="prefs-title">
              <div class="popover-header">
                <div class="popover-title" id="prefs-title">
                  <span aria-hidden="true">${A.prefs}</span>
                  <span>${e?"የተደራሽነት እና አቀማመጥ ምርጫዎች":"Accessibility & Layout Settings"}</span>
                </div>
                <button type="button" class="btn-popover-close" id="btn-dismiss-prefs" aria-label="${e?"ምርጫዎችን ዝጋ":"Close settings"}" title="${e?"ዝጋ":"Close"}">✕</button>
              </div>

              <div class="popover-body">
                <div class="form-row">
                  <label for="select-video-quality">${e?"የቪዲዮ ጥራት:":"Video Quality:"}</label>
                  <select id="select-video-quality">
                    <option value="auto" ${this.currentQuality==="auto"?"selected":""}>Auto (Adaptive)</option>
                    <option value="720p" ${this.currentQuality==="720p"?"selected":""}>720p (HD)</option>
                    <option value="360p" ${this.currentQuality==="360p"?"selected":""}>360p (SD - Standard)</option>
                    <option value="240p" ${this.currentQuality==="240p"?"selected":""}>240p (${e?"ዝቅተኛ ዳታ":"Low Data / 3G"})</option>
                  </select>
                </div>

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
              </div>

              <div class="popover-footer">
                <button type="button" class="btn-popover-action btn-popover-reset" id="btn-reset-layout">
                  ↺ ${e?"ዳግም አስጀምር":"Reset Layout"}
                </button>
                <button type="button" class="btn-popover-action btn-popover-save" id="btn-close-prefs">
                  ${e?"ተግብር እና ዝጋ":"Done"}
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT: Movable & Resizable Sign Language Window (Outside of video frame) -->
          <div 
            class="window-panel esl-window" 
            id="esl-window" 
            style="width: ${p}px; height: ${d}px; flex: 0 0 ${p}px; display: ${this.prefs.eslVisible&&a?"flex":"none"};"
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
    `,this.bindDOMElements(),this.attachEventListeners(),this.setupWindowInteractions()}bindDOMElements(){this.mainVideo=this.shadow.getElementById("main-video"),this.signVideo=this.shadow.getElementById("sign-video"),this.captionOverlay=this.shadow.getElementById("caption-overlay"),this.syncController=new Qe(this.mainVideo,{driftThreshold:.25,onSignStatusChange:a=>{const n=this.shadow.getElementById("sign-status-indicator");n&&(a==="loading"?(n.style.display="inline-block",n.textContent=this.activeLocale==="am"?"በመጫን ላይ...":"Loading..."):a==="error"?(n.style.display="inline-block",n.textContent=this.activeLocale==="am"?"ምልክት ቋንቋ አልተገኘም":"Sign Unavailable",n.style.background="#FEF2F2",n.style.color="#991B1B"):(n.style.display="inline-block",n.textContent="EthSL",n.style.background="rgba(255,255,255,0.2)",n.style.color="#FFF"))}}),this.signVideo&&this.syncController.setSignVideo(this.signVideo);const e=this.shadow.getElementById("transcript-target"),i=this.shadow.getElementById("live-chat-target"),t=this.shadow.getElementById("cb-auto-scroll");this.transcriptViewer=new Ne(e,{locale:this.activeLocale,onSeekAndPlay:a=>{this.seekAndPlay(a)},onFollowChange:a=>{t&&(t.checked=a)}}),i&&(this.liveChatViewer=new Ue(i,{locale:this.activeLocale,onSeekAndPlay:a=>{this.seekAndPlay(a)}}),this.liveChatMessages.length&&this.liveChatViewer.setMessages(this.liveChatMessages))}setupWindowInteractions(){const e=this.shadow.getElementById("player-stage");if(!e)return;const i=(t,a,n,l,p,d,u)=>{const o=this.shadow.getElementById(t),E=this.shadow.getElementById(a),I=this.shadow.getElementById(n),x=this.shadow.getElementById(l),H=this.shadow.getElementById(p),K=d?this.shadow.getElementById(d):null;if(!o||!E||!I)return;let w=null,te=!1,_="corner",le=0,ce=0,O=0,de=0,J=null;const B=b=>{if(!te)return;const v=b.clientX-le,f=b.clientY-ce;J!==null&&cancelAnimationFrame(J),J=requestAnimationFrame(()=>{let L=O,C=de;_==="corner"||_==="right"?L=Math.min(u.maxWidth,Math.max(u.minWidth,O+v)):_==="left"&&(L=Math.min(u.maxWidth,Math.max(u.minWidth,O-v))),(_==="corner"||_==="bottom")&&(C=Math.min(u.maxHeight,Math.max(u.minHeight,de+f))),o.style.width=`${L}px`,o.style.height=`${C}px`,o.style.flex=`0 0 ${L}px`,w&&(w.style.width=`${L}px`,w.style.height=`${C}px`,w.style.flex=`0 0 ${L}px`)})},V=()=>{te&&(te=!1,o.classList.remove("is-resizing"),window.removeEventListener("pointermove",B),window.removeEventListener("pointerup",V),window.removeEventListener("pointercancel",V),J!==null&&(cancelAnimationFrame(J),J=null),u.onSaveSize(o.offsetWidth,o.offsetHeight))},z=(b,v)=>{te=!0,_=b,le=v.clientX,ce=v.clientY,O=o.offsetWidth,de=o.offsetHeight,o.classList.add("is-resizing"),window.addEventListener("pointermove",B),window.addEventListener("pointerup",V),window.addEventListener("pointercancel",V),v.preventDefault(),v.stopPropagation()};I.addEventListener("pointerdown",b=>z("corner",b)),x==null||x.addEventListener("pointerdown",b=>z("bottom",b)),H==null||H.addEventListener("pointerdown",b=>z("right",b)),K==null||K.addEventListener("pointerdown",b=>z("left",b)),I.addEventListener("keydown",b=>{let v=o.offsetWidth,f=o.offsetHeight,L=!1;b.key==="ArrowRight"?(v=Math.min(u.maxWidth,v+20),L=!0):b.key==="ArrowLeft"?(v=Math.max(u.minWidth,v-20),L=!0):b.key==="ArrowDown"?(f=Math.min(u.maxHeight,f+20),L=!0):b.key==="ArrowUp"&&(f=Math.max(u.minHeight,f-20),L=!0),L&&(b.preventDefault(),o.style.width=`${v}px`,o.style.height=`${f}px`,o.style.flex=`0 0 ${v}px`,w&&(w.style.width=`${v}px`,w.style.height=`${f}px`,w.style.flex=`0 0 ${v}px`),u.onSaveSize(v,f))});let m=!1,D=0,F=0,ie=0,se=0,S=null;o.addEventListener("pointerdown",()=>{if(o.classList.contains("floating")){o.style.zIndex="100";const b=t==="transcript-window"?"esl-window":"transcript-window",v=this.shadow.getElementById(b);v&&v.classList.contains("floating")&&(v.style.zIndex="90")}});const Y=b=>{const v=b.clientX-D,f=b.clientY-F;!m&&Math.hypot(v,f)>4&&(m=!0,!w&&o.parentNode&&(w=document.createElement("div"),w.className="window-placeholder",w.style.width=`${o.offsetWidth}px`,w.style.height=`${o.offsetHeight}px`,w.style.flex=o.style.flex||`0 0 ${o.offsetWidth}px`,o.parentNode.insertBefore(w,o)),o.classList.add("floating"),o.style.position="absolute",o.style.zIndex="100"),m&&(S!==null&&cancelAnimationFrame(S),S=requestAnimationFrame(()=>{const L=ie+v,C=se+f;o.style.left=`${L}px`,o.style.top=`${C}px`,o.style.right="auto",o.style.bottom="auto"}))},Q=()=>{m&&(m=!1),window.removeEventListener("pointermove",Y),window.removeEventListener("pointerup",Q),window.removeEventListener("pointercancel",Q),S!==null&&(cancelAnimationFrame(S),S=null)};E.addEventListener("pointerdown",b=>{if(b.target.tagName==="INPUT"||b.target.tagName==="SELECT")return;D=b.clientX,F=b.clientY;const v=e.getBoundingClientRect(),f=o.getBoundingClientRect();ie=o.style.left?parseFloat(o.style.left):f.left-v.left,se=o.style.top?parseFloat(o.style.top):f.top-v.top,m=!1,o.style.zIndex="100";const L=t==="transcript-window"?"esl-window":"transcript-window",C=this.shadow.getElementById(L);C&&C.classList.contains("floating")&&(C.style.zIndex="90"),window.addEventListener("pointermove",Y),window.addEventListener("pointerup",Q),window.addEventListener("pointercancel",Q)}),E.addEventListener("keydown",b=>{let v=!1;const f=20;if(!o.classList.contains("floating")){!w&&o.parentNode&&(w=document.createElement("div"),w.className="window-placeholder",w.style.width=`${o.offsetWidth}px`,w.style.height=`${o.offsetHeight}px`,w.style.flex=o.style.flex||`0 0 ${o.offsetWidth}px`,o.parentNode.insertBefore(w,o));const ae=e.getBoundingClientRect(),pe=o.getBoundingClientRect();o.classList.add("floating"),o.style.position="absolute",o.style.zIndex="100",o.style.left=`${pe.left-ae.left}px`,o.style.top=`${pe.top-ae.top}px`}let L=parseFloat(o.style.left)||0,C=parseFloat(o.style.top)||0;b.key==="ArrowRight"?(L+=f,v=!0):b.key==="ArrowLeft"?(L-=f,v=!0):b.key==="ArrowDown"?(C+=f,v=!0):b.key==="ArrowUp"&&(C-=f,v=!0),v&&(b.preventDefault(),o.style.left=`${L}px`,o.style.top=`${C}px`)});const N=()=>{o.classList.remove("floating"),o.style.position="",o.style.left="",o.style.top="",o.style.right="",o.style.bottom="",o.style.zIndex="",w&&(w.remove(),w=null)};E.addEventListener("dblclick",N);const me=b=>{if(b==="split"){N();return}o.classList.contains("floating")||(!w&&o.parentNode&&(w=document.createElement("div"),w.className="window-placeholder",w.style.width=`${o.offsetWidth}px`,w.style.height=`${o.offsetHeight}px`,w.style.flex=o.style.flex||`0 0 ${o.offsetWidth}px`,o.parentNode.insertBefore(w,o)),o.classList.add("floating"),o.style.position="absolute",o.style.zIndex="100");const v=e.getBoundingClientRect(),f=o.offsetWidth||280,L=o.offsetHeight||210,C=16,ae=Math.max(0,v.width-f-C),pe=Math.max(0,v.height-L-C);b==="tr"?(o.style.left=`${ae}px`,o.style.top=`${C}px`):b==="br"&&(o.style.left=`${ae}px`,o.style.top=`${pe}px`)};o.__reDock=N,o.__dockPreset=me};i("transcript-window","transcript-drag-handle","transcript-resize-handle","transcript-resize-edge-bottom","transcript-resize-edge-right",null,{minWidth:220,maxWidth:750,minHeight:200,maxHeight:900,onSaveSize:(t,a)=>{this.prefs.transcriptWidth=t,this.prefs.transcriptHeight=a,$({transcriptWidth:t,transcriptHeight:a})}}),i("esl-window","esl-drag-handle","esl-resize-handle","esl-resize-edge-bottom","esl-resize-edge-right","esl-resize-edge-left",{minWidth:200,maxWidth:700,minHeight:160,maxHeight:700,onSaveSize:(t,a)=>{this.prefs.eslWidth=t,this.prefs.eslHeight=a,$({eslWidth:t,eslHeight:a})}})}attachEventListeners(){var Ze,et,tt,it,st,at,rt,nt;const e=this.shadow.getElementById("btn-play"),i=this.shadow.getElementById("play-icon"),t=this.shadow.getElementById("big-play-btn"),a=this.shadow.getElementById("btn-restart"),n=this.shadow.getElementById("btn-speed-faster"),l=this.shadow.getElementById("btn-speed-slower"),p=this.shadow.getElementById("speed-display"),d=this.shadow.getElementById("state-display"),u=this.shadow.getElementById("btn-fullscreen"),o=this.shadow.getElementById("fullscreen-icon"),E=this.shadow.getElementById("btn-mute"),I=this.shadow.getElementById("mute-icon"),x=this.shadow.getElementById("player-container"),H=this.shadow.getElementById("seek-scrubber"),K=this.shadow.getElementById("time-display"),w=()=>{this.mainVideo.paused?this.mainVideo.play():this.mainVideo.pause()};e&&e.addEventListener("click",w),t&&t.addEventListener("click",w),this.mainVideo.addEventListener("click",w),this.mainVideo.addEventListener("play",()=>{i&&(i.innerHTML=A.pause),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አቁም (Space / K)":"Pause (Space / K)"),t==null||t.classList.add("is-hidden"),d&&(d.textContent=this.activeLocale==="am"?"እየተጫወተ ነው":"Playing")}),this.mainVideo.addEventListener("pause",()=>{i&&(i.innerHTML=A.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),d&&(d.textContent=this.mainVideo.ended?this.activeLocale==="am"?"ተጠናቋል":"End of track":this.activeLocale==="am"?"ቆሟል":"Paused")}),this.mainVideo.addEventListener("ended",()=>{i&&(i.innerHTML=A.play),e==null||e.setAttribute("aria-label",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),e==null||e.setAttribute("title",this.activeLocale==="am"?"አጫውት (Space / K)":"Play (Space / K)"),t==null||t.classList.remove("is-hidden"),d&&(d.textContent=this.activeLocale==="am"?"ተጠናቋል":"End of track"),this.dispatchEvent(new CustomEvent("db-player:complete",{bubbles:!0,composed:!0,detail:{}}))}),a==null||a.addEventListener("click",()=>{this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0)});const te=[.5,.75,1,1.25,1.5,2],_=()=>{const r=this.mainVideo.playbackRate;p&&(p.textContent=`Speed: ${r}x`)};n==null||n.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,c=te.filter(R=>R>r+.01),y=c.length>0?c[0]:2;this.mainVideo.playbackRate=y,_()}),l==null||l.addEventListener("click",()=>{const r=this.mainVideo.playbackRate,c=te.filter(R=>R<r-.01),y=c.length>0?c[c.length-1]:.5;this.mainVideo.playbackRate=y,_()});const le=()=>!!(document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement||x!=null&&x.classList.contains("is-fullscreen")||this.hasAttribute("data-fullscreen")),ce=async()=>{try{le()?((document.fullscreenElement||document.webkitFullscreenElement||this.shadow.fullscreenElement)&&(document.exitFullscreen?await document.exitFullscreen():document.webkitExitFullscreen&&await document.webkitExitFullscreen()),x==null||x.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen"),O()):x!=null&&x.requestFullscreen?await x.requestFullscreen():x!=null&&x.webkitRequestFullscreen?await x.webkitRequestFullscreen():(x==null||x.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true"),O())}catch(r){console.warn("Fullscreen native request fell back to CSS:",r),(x==null?void 0:x.classList.contains("is-fullscreen"))?(x==null||x.classList.remove("is-fullscreen"),this.removeAttribute("data-fullscreen")):(x==null||x.classList.add("is-fullscreen"),this.setAttribute("data-fullscreen","true")),O()}};u==null||u.addEventListener("click",ce);const O=()=>{const r=le();u==null||u.setAttribute("aria-pressed",r?"true":"false"),u==null||u.setAttribute("aria-label",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),u==null||u.setAttribute("title",r?this.activeLocale==="am"?"ከሙሉ ማያ ገጽ ውጣ (F)":"Exit Fullscreen (F)":this.activeLocale==="am"?"ሙሉ ማያ ገጽ (F)":"Fullscreen (F)"),o&&(o.innerHTML=r?A.fullscreenExit:A.fullscreenEnter)};document.addEventListener("fullscreenchange",O),document.addEventListener("webkitfullscreenchange",O);const de=()=>{this.mainVideo.muted=!this.mainVideo.muted};E==null||E.addEventListener("click",de);const J=()=>{const r=this.mainVideo.muted;E==null||E.setAttribute("aria-pressed",r?"true":"false"),E==null||E.setAttribute("aria-label",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),E==null||E.setAttribute("title",r?this.activeLocale==="am"?"ድምጽ አብራ (M)":"Unmute (M)":this.activeLocale==="am"?"ድምጽ አጥፋ (M)":"Mute (M)"),I&&(I.innerHTML=r?A.volumeMuted:A.volumeUnmuted)};this.mainVideo.addEventListener("volumechange",J),this.mainVideo.addEventListener("timeupdate",()=>{const r=this.mainVideo.currentTime,c=this.mainVideo.duration||1;H&&!H.matches(":active")&&(H.value=(r/c*100).toFixed(1)),K&&(K.textContent=`${this.formatTime(r)} / ${this.formatTime(c)}`),this.updateCaptionDisplay(),this.transcriptViewer.updateActiveTime(r),this.liveChatViewer&&this.liveChatViewer.updateTime(r),this.dispatchEvent(new CustomEvent("db-player:progress",{bubbles:!0,composed:!0,detail:{seconds:Math.floor(r),percent:Math.round(r/c*100)}}))}),H.addEventListener("input",()=>{const r=this.mainVideo.duration||1;this.mainVideo.currentTime=parseFloat(H.value)/100*r}),(Ze=this.shadow.getElementById("btn-rewind"))==null||Ze.addEventListener("click",()=>{this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5)}),(et=this.shadow.getElementById("btn-forward"))==null||et.addEventListener("click",()=>{this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5)});const B=this.shadow.getElementById("btn-ad");B==null||B.addEventListener("click",async()=>{if(!this.manifest)return;this.prefs.audioDescriptionEnabled=!this.prefs.audioDescriptionEnabled,$({audioDescriptionEnabled:this.prefs.audioDescriptionEnabled}),B.setAttribute("aria-pressed",this.prefs.audioDescriptionEnabled?"true":"false");const r=this.prefs.audioDescriptionEnabled?"described":"main",c=this.manifest.sources.find(y=>y.kind===r)||this.manifest.sources.find(y=>y.kind==="main");c&&await this.syncController.switchSource(c.src)});const V=this.shadow.getElementById("btn-cc");V==null||V.addEventListener("click",async()=>{const r=["en","am","off"],c=(r.indexOf(this.prefs.captionLanguage)+1)%r.length;this.prefs.captionLanguage=r[c],$({captionLanguage:this.prefs.captionLanguage});const y=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",y?"false":"true"),V.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),V.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),await this.loadCaptionTrack(this.prefs.captionLanguage)});const z=this.shadow.getElementById("btn-esl"),m=this.shadow.getElementById("esl-window");z==null||z.addEventListener("click",()=>{this.prefs.eslVisible=!this.prefs.eslVisible,$({eslVisible:this.prefs.eslVisible}),z.setAttribute("aria-pressed",this.prefs.eslVisible?"true":"false"),m&&(m.style.display=this.prefs.eslVisible?"flex":"none")});const D=this.shadow.getElementById("btn-transcript-toggle"),F=this.shadow.getElementById("transcript-window");D==null||D.addEventListener("click",()=>{const c=!((F==null?void 0:F.style.display)!=="none");this.prefs.transcriptVisible=c,$({transcriptVisible:c}),D.setAttribute("aria-pressed",c?"true":"false"),F&&(F.style.display=c?"flex":"none")});const ie=this.shadow.getElementById("cb-auto-scroll");ie==null||ie.addEventListener("change",()=>{this.transcriptViewer.setFollowing(ie.checked)});const se=this.shadow.getElementById("select-transcript-lang");se==null||se.addEventListener("change",()=>{const r=se.value;this.setAttribute("locale",r)});const S=this.shadow.getElementById("btn-prefs"),Y=this.shadow.getElementById("btn-transcript-prefs"),Q=this.shadow.getElementById("btn-esl-prefs"),N=this.shadow.getElementById("prefs-dialog"),me=this.shadow.getElementById("btn-close-prefs"),b=this.shadow.getElementById("btn-dismiss-prefs"),v=this.shadow.getElementById("btn-reset-layout"),f=this.shadow.getElementById("btn-quality"),L=this.shadow.getElementById("quality-menu"),C=()=>{this.isQualityMenuOpen&&(this.isQualityMenuOpen=!1,L&&(L.style.display="none"),f==null||f.classList.remove("is-active"),f==null||f.setAttribute("aria-expanded","false"))},ae=()=>{he(),this.isQualityMenuOpen=!0,L&&(L.style.display="flex"),f==null||f.classList.add("is-active"),f==null||f.setAttribute("aria-expanded","true");const r=this.shadow.querySelector(`.quality-menu-item[data-quality="${this.currentQuality}"]`)||this.shadow.querySelector(".quality-menu-item");r==null||r.focus()},pe=()=>{this.isQualityMenuOpen?C():ae()};f==null||f.addEventListener("click",r=>{r.stopPropagation(),pe()}),this.shadow.querySelectorAll(".quality-menu-item").forEach(r=>{r.addEventListener("click",async()=>{const c=r.getAttribute("data-quality");c&&(await this.applyQuality(c),C(),f==null||f.focus())})});const P=this.shadow.getElementById("select-cc-lang"),U=this.shadow.getElementById("select-cc-size"),W=this.shadow.getElementById("select-cc-theme"),re=this.shadow.getElementById("select-video-quality"),G=this.shadow.getElementById("toggle-esl-visibility"),X=this.shadow.getElementById("toggle-transcript-visibility"),Z=this.shadow.getElementById("toggle-ad-enabled"),he=()=>{this.isPreferencesOpen&&(this.isPreferencesOpen=!1,N&&(N.style.display="none"),S==null||S.classList.remove("is-active"),S==null||S.setAttribute("aria-expanded","false"),S==null||S.focus())},Be=()=>{C(),this.isPreferencesOpen=!0,re&&(re.value=this.currentQuality),P&&(P.value=this.prefs.captionLanguage),U&&(U.value=this.prefs.captionSize),W&&(W.value=this.prefs.captionTheme),G&&(G.value=this.prefs.eslVisible?"show":"hide"),X&&(X.value=this.prefs.transcriptVisible!==!1?"show":"hide"),Z&&(Z.value=this.prefs.audioDescriptionEnabled?"on":"off"),N&&(N.style.display="flex"),S==null||S.classList.add("is-active"),S==null||S.setAttribute("aria-expanded","true"),P==null||P.focus()},pt=()=>{this.isPreferencesOpen?he():Be()};S==null||S.addEventListener("click",pt),Y==null||Y.addEventListener("click",Be),Q==null||Q.addEventListener("click",Be),b==null||b.addEventListener("click",he),P==null||P.addEventListener("change",async()=>{if(P.value!==this.prefs.captionLanguage){if(this.prefs.captionLanguage=P.value,$({captionLanguage:this.prefs.captionLanguage}),V){const r=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",r?"false":"true")}await this.loadCaptionTrack(this.prefs.captionLanguage)}}),U==null||U.addEventListener("change",()=>{U.value!==this.prefs.captionSize&&(this.prefs.captionSize=U.value,$({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay())}),W==null||W.addEventListener("change",()=>{W.value!==this.prefs.captionTheme&&(this.prefs.captionTheme=W.value,$({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay())}),G==null||G.addEventListener("change",()=>{var y;const r=!!(this.signVideo||(y=this.manifest)!=null&&y.sources.some(R=>R.kind==="sign")),c=G.value==="show";this.prefs.eslVisible=c,$({eslVisible:c}),z&&z.setAttribute("aria-pressed",c?"true":"false"),m&&(m.style.display=c&&r?"flex":"none")}),X==null||X.addEventListener("change",()=>{const r=X.value==="show";this.prefs.transcriptVisible=r,$({transcriptVisible:r}),D&&D.setAttribute("aria-pressed",r?"true":"false"),F&&(F.style.display=r?"flex":"none")}),Z==null||Z.addEventListener("change",()=>{const r=Z.value==="on";this.prefs.audioDescriptionEnabled=r,$({audioDescriptionEnabled:r}),B&&B.setAttribute("aria-pressed",r?"true":"false")}),me==null||me.addEventListener("click",async()=>{var c;if(P&&P.value!==this.prefs.captionLanguage){if(this.prefs.captionLanguage=P.value,$({captionLanguage:this.prefs.captionLanguage}),V){const y=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",y?"false":"true")}await this.loadCaptionTrack(this.prefs.captionLanguage)}U&&U.value!==this.prefs.captionSize&&(this.prefs.captionSize=U.value,$({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()),W&&W.value!==this.prefs.captionTheme&&(this.prefs.captionTheme=W.value,$({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay());const r=!!(this.signVideo||(c=this.manifest)!=null&&c.sources.some(y=>y.kind==="sign"));if(G){const y=G.value==="show";this.prefs.eslVisible=y,$({eslVisible:y}),z&&z.setAttribute("aria-pressed",y?"true":"false"),m&&(m.style.display=y&&r?"flex":"none")}if(X){const y=X.value==="show";this.prefs.transcriptVisible=y,$({transcriptVisible:y}),D&&D.setAttribute("aria-pressed",y?"true":"false"),F&&(F.style.display=y?"flex":"none")}if(Z){const y=Z.value==="on";this.prefs.audioDescriptionEnabled=y,$({audioDescriptionEnabled:y}),B&&B.setAttribute("aria-pressed",y?"true":"false")}he()});const ht=r=>{const c=r.composedPath();this.isPreferencesOpen&&(N&&c.includes(N)||S&&c.includes(S)||Y&&c.includes(Y)||Q&&c.includes(Q)||he()),this.isQualityMenuOpen&&(L&&c.includes(L)||f&&c.includes(f)||C())};window.addEventListener("pointerdown",ht),re==null||re.addEventListener("change",async()=>{re.value!==this.currentQuality&&await this.applyQuality(re.value)}),v==null||v.addEventListener("click",()=>{var xe,fe,Se;je(),this.prefs=ke();const r=this.shadow.getElementById("select-cc-lang"),c=this.shadow.getElementById("select-cc-size"),y=this.shadow.getElementById("select-cc-theme"),R=this.shadow.getElementById("select-video-quality"),oe=this.shadow.getElementById("toggle-esl-visibility"),ee=this.shadow.getElementById("toggle-transcript-visibility"),we=this.shadow.getElementById("toggle-ad-enabled");R&&(R.value="auto"),this.applyQuality("auto"),r&&(r.value=this.prefs.captionLanguage),c&&(c.value=this.prefs.captionSize),y&&(y.value=this.prefs.captionTheme),oe&&(oe.value="show"),ee&&(ee.value="show"),we&&(we.value="off"),this.updateCaptionDisplay(),this.loadCaptionTrack(this.prefs.captionLanguage),F&&((xe=F.__reDock)==null||xe.call(F),F.classList.remove("floating"),F.style.position="",F.style.left="",F.style.top="",F.style.right="",F.style.bottom="",F.style.zIndex="",F.style.width=`${T.transcriptWidth}px`,F.style.height=`${T.transcriptHeight}px`,F.style.flex=`0 0 ${T.transcriptWidth}px`,F.style.display="flex"),m&&((fe=m.__reDock)==null||fe.call(m),m.classList.remove("floating"),m.style.position="",m.style.left="",m.style.top="",m.style.right="",m.style.bottom="",m.style.zIndex="",m.style.width=`${T.eslWidth}px`,m.style.height=`${T.eslHeight}px`,m.style.flex=`0 0 ${T.eslWidth}px`,m.style.display=this.signVideo||(Se=this.manifest)!=null&&Se.sources.some(ut=>ut.kind==="sign")?"flex":"none"),z&&z.setAttribute("aria-pressed","true"),D&&D.setAttribute("aria-pressed","true"),B&&B.setAttribute("aria-pressed","false")}),(tt=this.shadow.getElementById("select-cc-lang"))==null||tt.addEventListener("change",async r=>{if(this.prefs.captionLanguage=r.target.value,$({captionLanguage:this.prefs.captionLanguage}),V){const c=this.prefs.captionLanguage==="off";V.setAttribute("aria-pressed",c?"false":"true"),V.setAttribute("title",`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`),V.setAttribute("aria-label",this.activeLocale==="am"?`የትርጉም ጽሑፍ: ${this.prefs.captionLanguage.toUpperCase()} (C)`:`Captions: ${this.prefs.captionLanguage.toUpperCase()} (C)`)}await this.loadCaptionTrack(this.prefs.captionLanguage)}),(it=this.shadow.getElementById("select-cc-size"))==null||it.addEventListener("change",r=>{this.prefs.captionSize=r.target.value,$({captionSize:this.prefs.captionSize}),this.updateCaptionDisplay()}),(st=this.shadow.getElementById("select-cc-theme"))==null||st.addEventListener("change",r=>{this.prefs.captionTheme=r.target.value,$({captionTheme:this.prefs.captionTheme}),this.updateCaptionDisplay()}),(at=this.shadow.getElementById("toggle-esl-visibility"))==null||at.addEventListener("change",r=>{var R;const c=r.target.value==="show",y=!!(this.signVideo||(R=this.manifest)!=null&&R.sources.some(oe=>oe.kind==="sign"));this.prefs.eslVisible=c,$({eslVisible:c}),z&&z.setAttribute("aria-pressed",c?"true":"false"),m&&(m.style.display=c&&y?"flex":"none")}),(rt=this.shadow.getElementById("toggle-transcript-visibility"))==null||rt.addEventListener("change",r=>{const c=r.target.value==="show";this.prefs.transcriptVisible=c,$({transcriptVisible:c}),D&&D.setAttribute("aria-pressed",c?"true":"false"),F&&(F.style.display=c?"flex":"none")}),(nt=this.shadow.getElementById("toggle-ad-enabled"))==null||nt.addEventListener("change",r=>{const c=r.target.value==="on";this.prefs.audioDescriptionEnabled=c,$({audioDescriptionEnabled:c}),B&&B.setAttribute("aria-pressed",c?"true":"false")});const Ee=this.shadow.getElementById("transcript-search");Ee==null||Ee.addEventListener("input",()=>{this.transcriptViewer.setSearchQuery(Ee.value)});const Fe=this.shadow.getElementById("live-chat-search");Fe==null||Fe.addEventListener("input",()=>{this.liveChatViewer&&this.liveChatViewer.setSearchQuery(Fe.value)});const j=this.shadow.getElementById("tab-btn-transcript"),q=this.shadow.getElementById("tab-btn-chat"),Le=this.shadow.getElementById("transcript-view-panel"),$e=this.shadow.getElementById("live-chat-view-panel");j==null||j.addEventListener("click",()=>{this.activeLeftTab="transcript",j.classList.add("active"),j.setAttribute("aria-selected","true"),q==null||q.classList.remove("active"),q==null||q.setAttribute("aria-selected","false"),Le&&(Le.style.display="flex"),$e&&($e.style.display="none")}),q==null||q.addEventListener("click",()=>{this.activeLeftTab="chat",q.classList.add("active"),q.setAttribute("aria-selected","true"),j==null||j.classList.remove("active"),j==null||j.setAttribute("aria-selected","false"),Le&&(Le.style.display="none"),$e&&($e.style.display="flex"),this.liveChatViewer&&this.liveChatViewer.updateTime(this.mainVideo.currentTime)});const De=this.shadow.getElementById("btn-dock-tr"),Me=this.shadow.getElementById("btn-dock-br"),Ie=this.shadow.getElementById("btn-dock-split");De==null||De.addEventListener("click",()=>{var r;return(r=m==null?void 0:m.__dockPreset)==null?void 0:r.call(m,"tr")}),Me==null||Me.addEventListener("click",()=>{var r;return(r=m==null?void 0:m.__dockPreset)==null?void 0:r.call(m,"br")}),Ie==null||Ie.addEventListener("click",()=>{var r;return(r=m==null?void 0:m.__dockPreset)==null?void 0:r.call(m,"split")});const He=this.shadow.getElementById("btn-export-brf");He==null||He.addEventListener("click",()=>{var we,xe;const r=((we=this.transcriptViewer)==null?void 0:we.getSegments())||[],c=((xe=this.manifest)==null?void 0:xe.title)&&(this.manifest.title[this.activeLocale]||this.manifest.title.en)||"Lesson Transcript",y=_e({title:c,language:this.activeLocale,segments:r.length>0?r:this.currentCues.map((fe,Se)=>({id:Se,start:fe.start,end:fe.end,text:fe.text,speaker:this.activeLocale==="am"?"አስተማሪ":"Instructor"})),date:"2026-11-14"}),R=new Blob([y],{type:"text/plain;charset=us-ascii"}),oe=URL.createObjectURL(R),ee=document.createElement("a");ee.href=oe,ee.download=`lesson-transcript.${this.activeLocale}.brf`,document.body.appendChild(ee),ee.click(),document.body.removeChild(ee),URL.revokeObjectURL(oe)});let be=!1;const ve=this.shadow.getElementById("btn-chat-questions-filter");ve==null||ve.addEventListener("click",()=>{be=!be,ve.setAttribute("aria-pressed",be?"true":"false"),ve.classList.toggle("active",be),this.liveChatViewer&&this.liveChatViewer.setQuestionsOnly(be)});const ne=this.shadow.getElementById("dialog-shortcuts"),ue=this.shadow.getElementById("btn-shortcuts"),ge=this.shadow.getElementById("btn-close-shortcuts"),Pe=this.shadow.getElementById("btn-ok-shortcuts"),ye=r=>{const c=r!==void 0?r:(ne==null?void 0:ne.style.display)==="none";ne&&(ne.style.display=c?"flex":"none"),c?ge==null||ge.focus():ue==null||ue.focus()};ue==null||ue.addEventListener("click",()=>ye(!0)),ge==null||ge.addEventListener("click",()=>ye(!1)),Pe==null||Pe.addEventListener("click",()=>ye(!1)),this.shadow.querySelectorAll(".btn-preset-pill").forEach(r=>{r.addEventListener("click",()=>{const c=r.getAttribute("data-preset");if(c){this.prefs.captionTheme=c;const y=this.shadow.getElementById("select-cc-theme");y&&(y.value=c),$({captionTheme:c}),this.updateCaptionDisplay()}})});const Re=this.shadow.getElementById("player-container");Re==null||Re.addEventListener("keydown",r=>{if(this.isQualityMenuOpen){r.key==="Escape"&&(C(),f==null||f.focus());return}if(this.isPreferencesOpen){r.key==="Escape"&&he();return}if(ne&&ne.style.display==="flex"){r.key==="Escape"&&ye(!1);return}if(!(r.target.tagName==="INPUT"||r.target.tagName==="SELECT"))switch(r.key){case" ":case"k":case"K":r.preventDefault(),w();break;case"j":case"J":case"ArrowLeft":r.preventDefault(),this.mainVideo.currentTime=Math.max(0,this.mainVideo.currentTime-5);break;case"l":case"L":case"ArrowRight":r.preventDefault(),this.mainVideo.currentTime=Math.min(this.mainVideo.duration||1e3,this.mainVideo.currentTime+5);break;case"m":case"M":r.preventDefault(),de();break;case"f":case"F":r.preventDefault(),ce();break;case"0":case"Home":r.preventDefault(),this.mainVideo.currentTime=0,this.mainVideo.play(),this.transcriptViewer.updateActiveTime(0);break;case">":case".":r.preventDefault(),n==null||n.click();break;case"<":case",":r.preventDefault(),l==null||l.click();break;case"c":case"C":r.preventDefault(),V==null||V.click();break;case"s":case"S":r.preventDefault(),z==null||z.click();break;case"d":case"D":r.preventDefault(),B==null||B.click();break;case"t":case"T":r.preventDefault(),D==null||D.click();break;case"?":case"/":r.preventDefault(),ye();break;case"Escape":le()&&(r.preventDefault(),ce());break}})}updateLocaleStrings(){this.render(),this.initTracksAndTranscript(),this.liveChatViewer&&(this.liveChatViewer.setLocale(this.activeLocale),this.liveChatViewer.setMessages(this.liveChatMessages))}formatTime(e){const i=Math.floor(e/60),t=Math.floor(e%60);return`${i.toString().padStart(2,"0")}:${t.toString().padStart(2,"0")}`}}if(customElements.get("a11y-media-player")||customElements.define("a11y-media-player",ze),!customElements.get("db-player")){class g extends ze{}customElements.define("db-player",g)}const Ke=["መስከረም","ጥቅምት","ህዳር","ታኅሣሥ","ጥር","የካቲት","መጋቢት","ሚያዝያ","ግንቦት","ሰኔ","ሐምሌ","ነሐሴ","ጳጉሜ"];function Je(g){const s=typeof g=="string"?new Date(g):g,e=s.getUTCFullYear(),i=s.getUTCMonth()+1,t=s.getUTCDate(),a=Math.floor((14-i)/12),n=e+4800-a,l=i+12*a-3,p=t+Math.floor((153*l+2)/5)+365*n+Math.floor(n/4)-Math.floor(n/100)+Math.floor(n/400)-32045,d=(p-1723856)%1461,u=d%365+365*Math.floor(d/1460),o=4*Math.floor((p-1723856)/1461)+Math.floor(d/365)-Math.floor(d/1460),E=Math.floor(u/30)+1,I=u%30+1,x=Ke[Math.min(E-1,12)];return{year:o,month:E,day:I,monthNameAmharic:x}}function Ye(g){const s=Je(g),e=`${s.monthNameAmharic} ${s.day}፣ ${s.year} ዓ.ም`;return{iso:g,ethiopic:e,display:`${g} (${e})`}}class Ge extends HTMLElement{constructor(){super();h(this,"shadow");h(this,"job",null);h(this,"activeLocale","en");this.shadow=this.attachShadow({mode:"open"})}static get observedAttributes(){return["job-data","locale"]}connectedCallback(){this.activeLocale=this.getAttribute("locale")||"en";const e=this.getAttribute("job-data");if(e)try{this.job=JSON.parse(e)}catch{}this.render()}setJob(e){this.job=e,this.render()}attributeChangedCallback(e,i,t){if(i!==t){if(e==="locale")this.activeLocale=t||"en",this.render();else if(e==="job-data")try{this.job=JSON.parse(t),this.render()}catch{}}}render(){if(!this.job){this.shadow.innerHTML='<div class="job-placeholder">No job data supplied</div>';return}const e=this.activeLocale==="am",i=this.job.title[this.activeLocale]||this.job.title.en,t=this.job.location[this.activeLocale]||this.job.location.en,a=this.job.description[this.activeLocale]||this.job.description.en,n=this.job.applicationDeadline?Ye(this.job.applicationDeadline):null,l={"@context":"https://schema.org/","@type":"JobPosting",title:i,description:a,hiringOrganization:{"@type":"Organization",name:this.job.employer},jobLocation:{"@type":"Place",address:{"@type":"PostalAddress",addressLocality:t,addressCountry:"ET"}},validThrough:this.job.applicationDeadline||"2026-12-31"};this.shadow.innerHTML=`
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
          <h4 id="job-title-${this.job.id}">${i}</h4>
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
            ${this.job.accommodations.map(p=>`
              <li class="badge accommodation">
                <span aria-hidden="true">✓</span>
                <span>${p.label[this.activeLocale]||p.label.en}</span>
                <small style="opacity: 0.85;">(${p.source})</small>
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
    `,this.attachShareHandler()}attachShareHandler(){const e=this.shadow.getElementById("btn-share-cert"),i=this.shadow.getElementById("share-feedback");!e||!i||e.addEventListener("click",async()=>{const t=`${window.location.origin}/verify.html?certId=CERT-DB-2026-0042`;if(navigator.share)try{await navigator.share({title:"Demonstrated Certificate — Savanna Platform",text:"Verified Certificate for Digital Workplace Skills: Foundations",url:t}),i.textContent=this.activeLocale==="am"?"ተጋርቷል!":"Link shared!";return}catch{}try{await navigator.clipboard.writeText(t),i.textContent=this.activeLocale==="am"?"የምስክር ወረቀት አገናኝ ተገልብጧል!":"Certificate link copied to clipboard!"}catch{i.textContent=t}})}}customElements.get("a11y-job-card")||customElements.define("a11y-job-card",Ge);const lt="abugida-media",ct=1;class Xe{constructor(){h(this,"db",null);h(this,"cacheName","abugida-offline-v1")}async init(){if(!this.db)return new Promise((s,e)=>{const i=indexedDB.open(lt,ct);i.onupgradeneeded=t=>{const a=t.target.result;a.objectStoreNames.contains("preferences")||a.createObjectStore("preferences"),a.objectStoreNames.contains("progress")||a.createObjectStore("progress",{keyPath:"lessonId"}),a.objectStoreNames.contains("packages")||a.createObjectStore("packages",{keyPath:"packageKey"})},i.onsuccess=t=>{this.db=t.target.result,s()},i.onerror=()=>{console.warn("IndexedDB unavailable, falling back to memory/localStorage"),s()}})}async saveProgress(s){if(await this.init(),!this.db){try{localStorage.setItem(`progress_${s.lessonId}`,JSON.stringify(s))}catch{}return}return new Promise(e=>{const i=this.db.transaction("progress","readwrite");i.objectStore("progress").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getProgress(s){if(await this.init(),!this.db)try{const e=localStorage.getItem(`progress_${s}`);return e?JSON.parse(e):null}catch{return null}return new Promise(e=>{const a=this.db.transaction("progress","readonly").objectStore("progress").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)})}async downloadPackage(s,e,i,t,a){await this.init();const n=`${s}:${e}`;if(!("caches"in window))throw new Error("Cache Storage API is not supported in this browser.");try{const l=await caches.open(this.cacheName);let p=0;const d=t.length;for(const u of t){const o=await fetch(u);if(!o.ok)throw new Error(`Failed to fetch asset: ${u} (${o.status})`);await l.put(u,o.clone()),p++;const E=Math.round(p/d*100);a(E,p,d)}return await this.savePackageRecord({packageKey:n,lessonId:s,packageId:e,packageName:i,status:"ready",totalBytes:32e5,downloadedBytes:32e5,timestamp:Date.now()}),!0}catch(l){throw await this.savePackageRecord({packageKey:n,lessonId:s,packageId:e,packageName:i,status:"error",totalBytes:32e5,downloadedBytes:0,timestamp:Date.now(),error:l instanceof Error?l.message:"Download failed"}),l}}async isPackageReady(s,e){await this.init();const i=`${s}:${e}`,t=await this.getPackageRecord(i);return(t==null?void 0:t.status)==="ready"}async savePackageRecord(s){if(this.db)return new Promise(e=>{const i=this.db.transaction("packages","readwrite");i.objectStore("packages").put(s),i.oncomplete=()=>e(),i.onerror=()=>e()})}async getPackageRecord(s){return this.db?new Promise(e=>{const a=this.db.transaction("packages","readonly").objectStore("packages").get(s);a.onsuccess=()=>e(a.result||null),a.onerror=()=>e(null)}):null}}const dt=new Xe;k.A11yJobCard=Ge,k.A11yMediaPlayer=ze,k.DEFAULT_PREFERENCES=T,k.ETHIOPIC_BRAILLE_MAP=Ve,k.ETHIOPIC_MONTHS=Ke,k.LiveChatViewer=Ue,k.MediaSyncController=Qe,k.OfflineStorageManager=Xe,k.TranscriptViewer=Ne,k.UNICODE_BRAILLE_MAP=Ce,k.formatDualDate=Ye,k.generateBRFDocument=_e,k.getThemeStyles=Oe,k.loadPreferences=ke,k.offlineStorage=dt,k.parseVTT=Ae,k.resetPreferences=je,k.savePreferences=$,k.toAsciiBraille=We,k.toEthiopianDate=Je,k.toUnicodeBraille=ot,k.wrapBrailleLines=Te,Object.defineProperty(k,Symbol.toStringTag,{value:"Module"})});
//# sourceMappingURL=a11y-media-kit.umd.js.map
