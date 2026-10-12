import{i as o}from"./icons.CKmvOrZ4.js";document.addEventListener("DOMContentLoaded",async()=>{const s=document.getElementById("loading"),r=document.getElementById("content-table"),y=document.getElementById("content-body"),i=document.getElementById("empty-state"),m=document.getElementById("filter-type"),l=document.getElementById("cover-input");let p=null;async function c(){s.style.display="flex",r.style.display="none",i.style.display="none";try{const n=await(await fetch(`/api/admin/content?type=${m.value}`,{credentials:"same-origin"})).json();n.success?h(n.items,n.categories):a("Failed to load content")}catch(t){console.error("Error:",t),a("Connection error")}finally{s.style.display="none"}}function h(t,n){if(t.length===0){i.style.display="block",r.style.display="none";return}r.style.display="table",i.style.display="none";const d={};n.forEach(e=>d[e.id]=e.name),y.innerHTML=t.map(e=>`
          <tr>
            <td style="font-family: monospace; font-size: 0.8125rem; color: var(--ink-30);">${e.id.slice(0,8)}...</td>
            <td>
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                ${e.thumbnailUrl?`<img src="${g(e.thumbnailUrl)}" alt="" style="width: 36px; height: 48px; object-fit: cover; border-radius: 6px; border: 1px solid var(--line);">`:`<span class="admin-cover-empty" title="No cover photo">${o("image")}</span>`}
                <div>
                  <div style="font-weight: 500;">${g(e.title)}</div>
                  <div style="font-size: 0.75rem; color: var(--ink-30);">${d[e.categoryId]||"Uncategorized"}</div>
                </div>
              </div>
            </td>
            <td>
              <span class="admin-badge ${e.isPremium?"admin-badge-premium":""}">
                ${e.contentType.toUpperCase()}
                ${e.isPremium?` <span class="badge-star">${o("star")}</span>`:""}
              </span>
            </td>
            <td>${e.fileUrl?o("file"):o("alert")}</td>
            <td>
              <span class="admin-badge ${e.isPublished?"admin-badge-published":"admin-badge-draft"}">
                ${e.isPublished?"Published":"Draft"}
              </span>
            </td>
            <td>
              ${e.isPremium?`MWK ${parseFloat(e.price||0).toLocaleString()}`:"FREE"}
            </td>
            <td>
              <div style="display: flex; gap: 0.5rem;">
                <a href="/read/${e.id}" target="_blank" class="admin-link-action" title="Preview">
                  ${o("eye")}
                </a>
                <button class="admin-cover-btn admin-link-action" data-id="${e.id}" title="${e.thumbnailUrl?"Change cover photo":"Add cover photo"}">
                  ${o("image")}
                </button>
                ${e.contentType==="book"&&e.fileUrl?`
                  <button class="admin-delete-btn" data-id="${e.id}" title="Delete">
                    ${o("trash")}
                  </button>
                `:""}
              </div>
            </td>
          </tr>
        `).join(""),y.querySelectorAll(".admin-cover-btn").forEach(e=>{e.addEventListener("click",()=>{p=e.dataset.id,l.value="",l.click()})}),y.querySelectorAll(".admin-delete-btn").forEach(e=>{e.addEventListener("click",async b=>{const v=e.dataset.id;if(confirm("Are you sure you want to delete this content?"))try{const f=await(await fetch("/api/admin/content",{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({contentId:v})})).json();f.success?c():a(f.message||"Delete failed")}catch(u){console.error("Delete error:",u),a("Delete failed. Please try again.")}})})}function a(t){s.style.display="none",i.style.display="block",i.querySelector("div:last-child").textContent=t}l.addEventListener("change",async()=>{const t=l.files?.[0];if(!t||!p)return;if(t.size>5*1024*1024){a("Cover image must be 5 MB or smaller");return}const n=new FormData;n.append("contentId",p),n.append("thumbnail",t);try{const e=await(await fetch("/api/admin/upload",{method:"POST",credentials:"same-origin",body:n})).json();e.success?c():a(e.message||"Cover upload failed")}catch(d){console.error("Cover upload error:",d),a("Cover upload failed. Please try again.")}}),m.addEventListener("change",c),c()});function g(s){const r=document.createElement("div");return r.textContent=s,r.innerHTML}
