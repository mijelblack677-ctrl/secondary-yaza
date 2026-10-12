import{i as u}from"./icons.CKmvOrZ4.js";import"./hoisted.Q5t9qzAc.js";document.addEventListener("DOMContentLoaded",async()=>{const r=document.getElementById("library-grid"),b=document.getElementById("loading"),l=document.getElementById("empty-state"),i=document.getElementById("category-filter"),g=document.getElementById("type-filter"),$=document.getElementById("subscribe-msg");let y=!1;async function h(){b.style.display="flex",r.style.display="none",l.style.display="none",$.style.display="none";try{const e=new URLSearchParams({category:i.value,type:g.value}),t=await(await fetch(`/api/content/library?${e}`,{credentials:"same-origin"})).json();t.success?(y=!!t.isAuthenticated,E(t.items,t.categories,t.isSubscribed)):v("Failed to load library")}catch(e){console.error("Error:",e),v("Connection error")}finally{b.style.display="none"}}function E(e,n,t){if(i.innerHTML='<option value="all">All Categories</option>',n.forEach(o=>{const a=document.createElement("option");a.value=o.id,a.textContent=o.name,i.appendChild(a)}),e.length===0){l.style.display="block",r.style.display="none";return}r.style.display="grid",l.style.display="none",r.innerHTML=e.map(o=>x(o,t)).join("")}function x(e,n){const t=e.isOwned||!1,o=e.isPremium||!1,a=parseFloat(e.price||0),f=t?"owned":o?"premium":"available",p=t?`${u("check")} Owned`:o?`MWK ${a.toLocaleString()}`:"Free",s=o&&!t&&n;return`
          <div class="book-card" data-id="${e.id}">
            <div class="book-cover">
              ${e.thumbnailUrl?`<img src="${e.thumbnailUrl}" alt="${d(e.title)}" class="book-cover-img" loading="lazy" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';"><span class="book-cover-icon" style="display:none;">${m(e.contentType)}</span>`:`<span class="book-cover-icon">${m(e.contentType)}</span>`}
              <div class="book-cover-overlay">
                <span class="btn">${t?"Read Now":s?"Purchase":n?"Read Now":"View"}</span>
              </div>
            </div>
            <div class="book-info">
              <h3>${d(e.title)}</h3>
              <p class="author">by ${d(e.author||"Unknown Author")}</p>
              <p class="description">${d(e.description||"No description available")}</p>
              <div class="book-meta">
                <span class="book-price ${o?"":"free"}">
                  ${o?`MWK ${a.toLocaleString()}`:"FREE"}
                </span>
                <span class="book-status ${f}">${p}</span>
              </div>
              <div style="margin-top: 0.9rem; display: flex; gap: 0.5rem;">
                ${s?'<button class="btn purchase-btn" style="flex: 1;">Purchase</button>':`<a href="${n||t?`/read/${e.id}`:"/login?redirect=/library"}" class="btn btn-outline" style="flex: 1;">${t||n?"Read Now":"View"}</a>`}
                ${t&&e.fileUrl&&y&&n?`<a href="/api/content/read/${e.id}?download=1" class="btn btn-outline" style="flex: 0 0 auto;" download title="Download for offline reading">${u("download")}</a>`:""}
              </div>
            </div>
          </div>
        `}function m(e){return u({book:"bookOpen",video:"video",audio:"music",guide:"file"}[e]||"file")}function d(e){const n=document.createElement("div");return n.textContent=e,n.innerHTML}function v(e){r.style.display="none",l.style.display="block",l.querySelector("h3").textContent="Error loading library",l.querySelector("p").textContent=e}i.addEventListener("change",h),g.addEventListener("change",h),r.addEventListener("click",async e=>{const n=e.target.closest(".purchase-btn");if(!n)return;const t=n.closest(".book-card"),o=t.dataset.id,a=t.querySelector(".book-price")?.textContent||"0",f=parseInt(a.replace(/[^0-9]/g,""))||0;if(!y){alert("Please log in to purchase books"),window.location.href="/login";return}n.textContent="Processing…",n.disabled=!0;try{const s=await(await fetch("/api/content/purchase",{method:"POST",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({contentId:o,price:f})})).json();if(s.requiresPayment&&s.checkoutUrl){window.location.href=s.checkoutUrl;return}if(s.success){const k=t.querySelector(".book-status");k.innerHTML=`${u("check")} Owned`,k.className="book-status owned";const w=t.querySelector(".purchase-btn");if(w){const c=document.createElement("a");c.href=`/read/${o}`,c.className="btn btn-outline",c.style.flex="1",c.textContent="Read Now",w.replaceWith(c)}alert("Book purchased successfully!")}else alert(s.message||"Purchase failed")}catch(p){console.error("Purchase error:",p),alert("Purchase failed. Please try again.")}finally{n.disabled||(n.textContent="Purchase")}}),h()});
