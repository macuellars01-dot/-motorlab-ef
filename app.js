/* MotorLab EF v6 — catálogo editable, ampliable y portable */
const BASE_KEY='motorlab_base_v1';
const OVERRIDES_KEY='motorlab_overrides_v1';
const CUSTOM_KEY='motorlab_custom_v1';
const DELETED_KEY='motorlab_deleted_v1';
const FAV_KEY='motorlab_favorites_v1';
const SESS_KEY='motorlab_sessions_v2';

let baseGames=[], games=[], sources=[];
let session=[], savedSessions=[];
let overrides=loadJSON(OVERRIDES_KEY,{}), customGames=loadJSON(CUSTOM_KEY,[]), deletedIds=new Set(loadJSON(DELETED_KEY,[])), favorites=new Set(loadJSON(FAV_KEY,[]));
let editingId=null;

const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const normalize=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function loadJSON(k,fallback){try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}}
function saveJSON(k,v){localStorage.setItem(k,JSON.stringify(v))}
function slug(){return 'manual-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function today(){return new Date().toISOString().slice(0,10)}

async function init(){
  try{
    const r=await fetch('data/games.json?catalog=v6',{cache:'no-store'});
    if(!r.ok) throw Error('games.json');
    baseGames=await r.json();
    const sr=await fetch('data/sources.json?catalog=v6',{cache:'no-store'});
    sources=sr.ok?await sr.json():[];
    games=buildCatalog();
    savedSessions=loadJSON(SESS_KEY,[]);
    $('#totalGames').textContent=games.length;
    $('#baseCount').textContent=baseGames.length;
    $('#customCount').textContent=customGames.length;
    $('#modifiedCount').textContent=Object.keys(overrides).length;
    $('#sessionCount').textContent=session.length;
    $('#sessionDate').value=today();
    buildFilters(); bindUI(); renderGames(); renderSaved(); renderSources(); renderStats();
  }catch(e){
    console.error(e);
    $('#resultSummary').textContent='No se pudo cargar el catálogo';
    $('#empty').classList.remove('hidden');
  }
}
function buildCatalog(){
  const originals=baseGames.filter(g=>!deletedIds.has(g.id)).map(g=>({...g,...(overrides[g.id]||{}),_status:overrides[g.id]?'editado':'original',_base:true}));
  const customs=customGames.filter(g=>!deletedIds.has(g.id)).map(g=>({...g,_status:'manual',_base:false}));
  return [...originals,...customs];
}
function materialTag(m){let x=normalize(m);if(x.includes('sin material')||x==='ninguno'||x.includes('ningun'))return'Sin material';if(x.includes('pelot'))return'Pelota';if(x.includes('aro'))return'Aros';if(x.includes('cono'))return'Conos';if(x.includes('cuerda'))return'Cuerdas';if(x.includes('tarjet'))return'Tarjetas';if(x.includes('pañuel')||x.includes('panuel'))return'Pañuelos';return m||'Otros'}
function inferIntensity(g){let x=normalize((g.description||'')+' '+(g.title||''));if(/velocidad|sprint|resistencia|carrera|perseguir|pillar|relevos|salidas/.test(x))return'Alta';if(/relaj|vuelta a la calma|estir/.test(x))return'Baja';return g.intensity||'Media'}
function statusLabel(g){return g._status==='manual'?'Añadido por ti':g._status==='editado'?'Editado':'Original'}
function statusClass(g){return g._status==='manual'?'manual':g._status==='editado'?'edited':'original'}

function buildFilters(){
  const configs=[['#ageFilters',['Infantil','Primaria','1º-2º ESO','12-13 años','6º Primaria']],['#materialFilters',['Sin material','Pelota','Aros','Conos','Cuerdas','Tarjetas','Pañuelos']],['#spaceFilters',['Pista / gimnasio','Exterior','Aula','Espacio reducido']],['#intensityFilters',['Baja','Media','Alta']]];
  for(const [sel,opts] of configs){const el=$(sel);el.innerHTML=opts.map(o=>`<label class="check"><input type="checkbox" value="${esc(o)}"> ${esc(o)}</label>`).join('')}
  $$('.filters input').forEach(x=>x.addEventListener('change',renderGames));
}
function selected(sel){return $$(sel+' input:checked').map(x=>x.value)}
function matches(g){
  const q=normalize($('#search').value); const text=normalize([g.title,g.description,g.material,g.age,g.source,g.objectives,g.variants,g.adaptations].join(' '));
  if(q&&!text.includes(q))return false;
  const ages=selected('#ageFilters'),mats=selected('#materialFilters'),spaces=selected('#spaceFilters'),ints=selected('#intensityFilters');
  if(ages.length&&!ages.some(v=>normalize(g.age).includes(normalize(v))))return false;
  if(mats.length&&!mats.includes(materialTag(g.material)))return false;
  if(spaces.length&&!spaces.includes(g.space))return false;
  if(ints.length&&!ints.includes(inferIntensity(g)))return false;
  const status=$('#statusFilter').value;
  if(status==='ocr'&&!g.needsReview)return false;
  if(status==='edited'&&g._status!=='editado')return false;
  if(status==='manual'&&g._status!=='manual')return false;
  if(status==='favorites'&&!favorites.has(g.id))return false;
  return true;
}
function renderGames(){
  let list=games.filter(matches); const sort=$('#sort').value;
  if(sort==='az')list.sort((a,b)=>String(a.title).localeCompare(String(b.title),'es'));
  if(sort==='za')list.sort((a,b)=>String(b.title).localeCompare(String(a.title),'es'));
  if(sort==='favorites')list.sort((a,b)=>(favorites.has(b.id)-favorites.has(a.id))||a.title.localeCompare(b.title,'es'));
  $('#resultSummary').textContent=`${list.length.toLocaleString('es-ES')} juego${list.length===1?'':'s'} encontrados`;
  const grid=$('#gameGrid');grid.innerHTML='';const tpl=$('#gameCardTemplate');
  list.forEach(g=>{
    const n=tpl.content.cloneNode(true),card=n.querySelector('.game-card');card.dataset.id=g.id;
    card.querySelector('.age').textContent=g.age||'Edad variable';
    card.querySelector('.ocr-badge').classList.toggle('hidden',!g.needsReview);
    card.querySelector('.status-badge').textContent=statusLabel(g);card.querySelector('.status-badge').className='tag status-badge '+statusClass(g);
    card.querySelector('h3').textContent=g.title||'Sin título';card.querySelector('.desc').textContent=g.description||'Sin descripción';
    card.querySelector('.material').textContent=materialTag(g.material);card.querySelector('.space').textContent=g.space||'—';card.querySelector('.intensity').textContent=inferIntensity(g);
    card.querySelector('.source').textContent=g.source?`${g.source} · pág. ${g.page||'—'}`:'Añadido manualmente';
    const fav=card.querySelector('.fav-btn');fav.textContent=favorites.has(g.id)?'★':'☆';fav.classList.toggle('on',favorites.has(g.id));
    fav.onclick=e=>{e.stopPropagation();toggleFavorite(g.id)};
    card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};
    card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};card.onclick=()=>openGame(g.id);
    card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);grid.appendChild(n);
  });
  $('#empty').classList.toggle('hidden',list.length>0);
}
function toggleFavorite(id){favorites.has(id)?favorites.delete(id):favorites.add(id);saveJSON(FAV_KEY,[...favorites]);renderGames();renderStats()}
function renderStats(){
  $('#baseCount').textContent=baseGames.length.toLocaleString('es-ES');$('#customCount').textContent=customGames.length.toLocaleString('es-ES');$('#modifiedCount').textContent=Object.keys(overrides).length.toLocaleString('es-ES');$('#deletedCount').textContent=deletedIds.size.toLocaleString('es-ES');
}
function openGame(id){
  const g=games.find(x=>x.id===id);if(!g)return;editingId=id;
  $('#dialogContent').innerHTML=`<div class="eyebrow">FICHA DE JUEGO</div><div class="detail-head"><div><h2>${esc(g.title||'Sin título')}</h2><div class="detail-meta"><span class="tag ${statusClass(g)}">${esc(statusLabel(g))}</span><span class="tag">${esc(g.age||'Edad variable')}</span><span class="chip">${esc(materialTag(g.material))}</span><span class="chip">${esc(g.space||'—')}</span><span class="chip">${esc(inferIntensity(g))}</span></div></div><button class="icon" onclick="gameDialog.close()">×</button></div>
  <div class="detail-section"><h4>Descripción</h4><p class="detail-desc">${esc(g.description||'—')}</p></div>
  ${g.objectives?`<div class="detail-section"><h4>Objetivos</h4><p>${esc(g.objectives)}</p></div>`:''}
  ${g.variants?`<div class="detail-section"><h4>Variantes</h4><p>${esc(g.variants)}</p></div>`:''}
  ${g.adaptations?`<div class="detail-section"><h4>Adaptaciones</h4><p>${esc(g.adaptations)}</p></div>`:''}
  <div class="source-box"><strong>${g._base?'Fuente original':'Origen'}</strong><br>${esc(g.source||'Creado manualmente')}${g.page?` · página ${esc(g.page)}`:''}${g._base&&g.needsReview?'<br><small>⚠️ Esta ficha procede de OCR y está marcada para revisión.</small>':''}</div>
  <div class="detail-actions"><button class="primary" onclick="editGame('${g.id}')">✏️ Editar ficha</button><button class="ghost" onclick="duplicateGame('${g.id}')">Duplicar</button><button class="ghost" onclick="toggleFavorite('${g.id}');openGame('${g.id}')">${favorites.has(g.id)?'★ Quitar favorito':'☆ Favorito'}</button><button class="ghost" onclick="addToSession('${g.id}');gameDialog.close()">＋ Añadir a sesión</button></div>`;
  gameDialog.showModal();
}
function blankGame(){return{id:slug(),title:'',age:'Primaria',material:'',description:'',objectives:'',variants:'',adaptations:'',participants:'',duration:'',space:'Pista / gimnasio',intensity:'Media',source:'Creado manualmente',page:'',notes:'',needsReview:false}}
function formFields(g){return `<div class="edit-grid">
<label>Nombre *<input id="fTitle" value="${esc(g.title)}" autofocus></label>
<label>Edad / curso<input id="fAge" value="${esc(g.age)}"></label>
<label>Material<input id="fMaterial" value="${esc(g.material)}"></label>
<label>Espacio<select id="fSpace">${['Pista / gimnasio','Exterior','Aula','Espacio reducido','Otro'].map(x=>`<option ${x===g.space?'selected':''}>${x}</option>`).join('')}</select></label>
<label>Intensidad<select id="fIntensity">${['Baja','Media','Alta'].map(x=>`<option ${x===g.intensity?'selected':''}>${x}</option>`).join('')}</select></label>
<label>Participantes<input id="fParticipants" value="${esc(g.participants)}"></label>
<label>Duración<input id="fDuration" value="${esc(g.duration)}"></label>
<label>Fuente<input id="fSource" value="${esc(g.source)}"></label>
<label>Página<input id="fPage" value="${esc(g.page)}"></label>
<label class="full">Descripción *<textarea id="fDescription">${esc(g.description)}</textarea></label>
<label class="full">Objetivos<textarea id="fObjectives">${esc(g.objectives)}</textarea></label>
<label class="full">Variantes<textarea id="fVariants">${esc(g.variants)}</textarea></label>
<label class="full">Adaptaciones / inclusión<textarea id="fAdaptations">${esc(g.adaptations)}</textarea></label>
<label class="full">Observaciones<textarea id="fNotes">${esc(g.notes)}</textarea></label>
</div>`}
function editGame(id){
  const g=games.find(x=>x.id===id);if(!g)return;editingId=id;
  const restore=g._base&&overrides[g.id]?'<button class="ghost" id="restoreBtn">↶ Restaurar original</button>':'';
  $('#editContent').innerHTML=`<div class="dialog-head"><div><div class="eyebrow">EDITOR DE FICHA</div><h2>${esc(g.title||'Nuevo juego')}</h2></div><button class="icon" onclick="editDialog.close()">×</button></div>${formFields(g)}<div class="editor-actions"><button class="ghost" onclick="editDialog.close()">Cancelar</button>${restore}<button class="danger" id="editDeleteBtn">Eliminar</button><button class="primary" onclick="saveGameEdit()">Guardar cambios</button></div>`;
  $('#editDeleteBtn').onclick=deleteCurrent;
  $('#restoreBtn')?.addEventListener('click',restoreCurrent);
  gameDialog.close();editDialog.showModal();
}
function collectForm(g){return{...g,title:$('#fTitle').value.trim(),age:$('#fAge').value.trim(),material:$('#fMaterial').value.trim(),space:$('#fSpace').value,intensity:$('#fIntensity').value,participants:$('#fParticipants').value.trim(),duration:$('#fDuration').value.trim(),source:$('#fSource').value.trim(),page:$('#fPage').value.trim(),description:$('#fDescription').value.trim(),objectives:$('#fObjectives').value.trim(),variants:$('#fVariants').value.trim(),adaptations:$('#fAdaptations').value.trim(),notes:$('#fNotes').value.trim()}}
function saveGameEdit(){
  const g=games.find(x=>x.id===editingId);if(!g)return;const next=collectForm(g);if(!next.title||!next.description){alert('El nombre y la descripción son obligatorios.');return}
  if(g._base){const patch={...next};delete patch._base;delete patch._status;overrides[g.id]=patch;saveJSON(OVERRIDES_KEY,overrides)}
  else{const idx=customGames.findIndex(x=>x.id===g.id);if(idx>=0){delete next._base;delete next._status;customGames[idx]=next;saveJSON(CUSTOM_KEY,customGames)}}
  games=buildCatalog();editDialog.close();renderGames();renderStats();openGame(g.id);
}
function newGame(){editingId=null;const g=blankGame();$('#editContent').innerHTML=`<div class="dialog-head"><div><div class="eyebrow">NUEVO JUEGO</div><h2>Añadir ficha al repositorio</h2></div><button class="icon" onclick="editDialog.close()">×</button></div>${formFields(g)}<div class="editor-actions"><button class="ghost" onclick="editDialog.close()">Cancelar</button><button class="primary" onclick="createGame()">＋ Crear juego</button></div>`;editDialog.showModal()}
function createGame(){const g=collectForm(blankGame());if(!g.title||!g.description){alert('El nombre y la descripción son obligatorios.');return}customGames.unshift(g);saveJSON(CUSTOM_KEY,customGames);games=buildCatalog();editDialog.close();renderGames();renderStats();$('#statusFilter').value='manual';renderGames();openGame(g.id)}
function duplicateGame(id){const g=games.find(x=>x.id===id);if(!g)return;const copy={...g,id:slug(),title:`${g.title} (copia)`,source:'Creado a partir de una ficha existente',page:'',needsReview:false};delete copy._base;delete copy._status;customGames.unshift(copy);saveJSON(CUSTOM_KEY,customGames);games=buildCatalog();gameDialog.close();renderGames();renderStats();editGame(copy.id)}
function deleteCurrent(){const g=games.find(x=>x.id===editingId);if(!g)return;if(!confirm(`¿Eliminar «${g.title}» del repositorio local?`))return;if(g._base){deletedIds.add(g.id);saveJSON(DELETED_KEY,[...deletedIds])}else{customGames=customGames.filter(x=>x.id!==g.id);saveJSON(CUSTOM_KEY,customGames)}favorites.delete(g.id);saveJSON(FAV_KEY,[...favorites]);games=buildCatalog();editDialog.close();gameDialog.close();renderGames();renderStats()}
function restoreCurrent(){const g=games.find(x=>x.id===editingId);if(!g||!g._base)return;if(!confirm('¿Restaurar la ficha original? Se perderán tus correcciones en esta ficha.'))return;delete overrides[g.id];saveJSON(OVERRIDES_KEY,overrides);games=buildCatalog();editDialog.close();renderGames();renderStats();openGame(g.id)}

function sessionMetaFromUI(){return{name:$('#sessionName').value.trim(),date:$('#sessionDate').value,group:$('#sessionGroup').value.trim(),students:$('#studentCount').value,duration:$('#sessionDuration').value,grouping:$('#sessionGrouping').value,objectives:$('#sessionObjectives').value.trim(),competencies:$('#sessionCompetencies').value.trim(),observations:$('#sessionObservations').value.trim()}}
function addToSession(id){if(!session.some(x=>x.id===id)){session.push({id,phase:'Sin asignar',minutes:'',grouping:$('#sessionGrouping')?.value||'Gran grupo',note:''})}renderSession();$('#sessionCount').textContent=session.length}
function removeFromSession(i){session.splice(i,1);renderSession();$('#sessionCount').textContent=session.length}
function phaseClass(p){return p==='Calentamiento'?'warm':p==='Vuelta a la calma'?'cool':p==='Sin asignar'?'unassigned':''}
function phaseOptions(c){return['Sin asignar','Calentamiento','Parte principal','Vuelta a la calma'].map(p=>`<option ${p===c?'selected':''}>${p}</option>`).join('')}
function renderSession(){const box=$('#sessionList');box.innerHTML='';if(!session.length){box.innerHTML='<div class="dropzone" id="dropzone">Arrastra aquí juegos para empezar</div>';bindDrop();updateTotals();return}
session.forEach((item,i)=>{const g=games.find(x=>x.id===item.id);if(!g)return;const el=document.createElement('div');el.className='session-item';el.draggable=true;el.innerHTML=`<div class="drag">☷</div><div><h4>${esc(i+1+'. '+g.title)}</h4><p>${esc(g.age)} · ${esc(materialTag(g.material))}</p><div class="session-total">${esc(item.note||'')}</div></div><div class="session-controls"><select class="phase">${phaseOptions(item.phase)}</select><input class="minutes" type="number" min="1" placeholder="min" value="${esc(item.minutes||'')}"><input class="note" placeholder="Variante / observación" value="${esc(item.note||'')}"></div><button class="remove">×</button>`;el.querySelector('.phase').onchange=e=>{item.phase=e.target.value;renderSession()};el.querySelector('.minutes').onchange=e=>{item.minutes=e.target.value;updateTotals()};el.querySelector('.note').oninput=e=>{item.note=e.target.value;el.querySelector('.session-total').textContent=e.target.value};el.querySelector('.remove').onclick=()=>removeFromSession(i);el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({id:item.id,from:i}));el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.from!==undefined){const moved=session.splice(d.from,1)[0];session.splice(i,0,moved);renderSession()}else addToSession(d.id)}catch{}};box.appendChild(el)});
const dz=document.createElement('div');dz.className='dropzone';dz.textContent='Suelta aquí para añadir otro juego';dz.id='dropzone';box.appendChild(dz);bindDrop();updateTotals()}
function updateTotals(){const mins=session.reduce((a,x)=>a+(Number(x.minutes)||0),0);const target=Number($('#sessionDuration')?.value||0);$('#sessionTotals').textContent=`${session.length} juegos · ${mins} min${target?` / objetivo ${target} min`:''}`}
function bindDrop(){const dz=$('#dropzone');if(!dz)return;dz.ondragover=e=>e.preventDefault();dz.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');try{const d=JSON.parse(raw);addToSession(d.id)}catch{if(raw)addToSession(raw)}}}
function autoPhase(){if(!session.length)return;const n=session.length;session.forEach((x,i)=>{x.phase=i===0?'Calentamiento':(i===n-1&&n>2?'Vuelta a la calma':'Parte principal');if(!x.minutes)x.minutes=i===0?'10':(i===n-1&&n>2?'5':'10')});renderSession()}
function renderSaved(){const el=$('#savedList');el.innerHTML=savedSessions.length?'':'<p class="muted">Aún no hay sesiones guardadas.</p>';savedSessions.forEach((s,i)=>{const d=document.createElement('div');d.className='saved-card';d.innerHTML=`<strong>${esc(s.name||'Sesión sin nombre')}</strong><small>${esc(s.date||'')} · ${esc(s.group||'Sin grupo')} · ${(s.games||[]).length} juegos</small><div class="saved-actions"><button class="load">Recuperar</button><button class="delete-saved">Eliminar</button></div>`;d.querySelector('.load').onclick=()=>{session=(s.games||[]).map(x=>typeof x==='string'?{id:x,phase:'Sin asignar',minutes:'',grouping:s.grouping||'Gran grupo',note:''}:x);$('#sessionName').value=s.name||'';$('#sessionDate').value=s.date||today();$('#sessionGroup').value=s.group||'';$('#studentCount').value=s.students||'';$('#sessionDuration').value=s.duration||'';$('#sessionGrouping').value=s.grouping||'Gran grupo';$('#sessionObjectives').value=s.objectives||'';$('#sessionCompetencies').value=s.competencies||'';$('#sessionObservations').value=s.observations||'';renderSession();$('#sessionCount').textContent=session.length;switchView('builder')};d.querySelector('.delete-saved').onclick=()=>{if(confirm('¿Eliminar esta sesión guardada?')){savedSessions.splice(i,1);saveJSON(SESS_KEY,savedSessions);renderSaved()}};el.appendChild(d)})}
function renderSources(){$('#sourcesList').innerHTML=sources.map(s=>`<div class="source-row"><strong>${esc(s.display)}</strong><small>${esc(s.name)} · ${s.pages} páginas · ${esc(s.type)}${s.loaded_games?` · ${s.loaded_games} registros`:''}</small></div>`).join('')}
function switchView(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#libraryView').classList.toggle('hidden',v!=='library');$('#builderView').classList.toggle('hidden',v!=='builder')}
function openManager(){renderStats();managerDialog.showModal()}
function exportCatalog(){const payload={format:'MotorLab EF backup v1',exportedAt:new Date().toISOString(),baseCount:baseGames.length,games:games.map(g=>{const x={...g};delete x._base;delete x._status;return x}),overrides,customGames,deletedIds:[...deletedIds],favorites:[...favorites],savedSessions};downloadText('motorlab-ef-backup.json',JSON.stringify(payload,null,2),'application/json')}
function exportChanges(){const payload={format:'MotorLab EF cambios v1',exportedAt:new Date().toISOString(),overrides,customGames,deletedIds:[...deletedIds],favorites:[...favorites]};downloadText('motorlab-ef-cambios.json',JSON.stringify(payload,null,2),'application/json')}
function downloadText(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importCatalogFile(file){try{const data=JSON.parse(await file.text());if(data.format==='MotorLab EF backup v1'){if(!Array.isArray(data.games)){throw Error('backup inválido')} if(!confirm('Esto reemplazará tu catálogo local por la copia importada. ¿Continuar?'))return;customGames=Array.isArray(data.customGames)?data.customGames:[];overrides=data.overrides||{};deletedIds=new Set(data.deletedIds||[]);favorites=new Set(data.favorites||[]);savedSessions=Array.isArray(data.savedSessions)?data.savedSessions:[];saveAllLocal();games=buildCatalog();renderAll();alert('Copia restaurada correctamente.')}else if(data.format==='MotorLab EF cambios v1'){customGames=Array.isArray(data.customGames)?data.customGames:customGames;overrides=data.overrides||{};deletedIds=new Set(data.deletedIds||[]);favorites=new Set(data.favorites||[]);saveAllLocal();games=buildCatalog();renderAll();alert('Cambios importados correctamente.')}else{throw Error('Formato no reconocido')}}catch(e){alert('No se pudo importar el archivo: '+e.message)}}
function saveAllLocal(){saveJSON(CUSTOM_KEY,customGames);saveJSON(OVERRIDES_KEY,overrides);saveJSON(DELETED_KEY,[...deletedIds]);saveJSON(FAV_KEY,[...favorites]);saveJSON(SESS_KEY,savedSessions)}
function renderAll(){renderGames();renderSaved();renderStats();$('#totalGames').textContent=games.length}
function clearLocalChanges(){if(!confirm('Se borrarán todas tus correcciones, juegos manuales, favoritos y eliminaciones locales. El catálogo original permanecerá intacto. ¿Continuar?'))return;overrides={};customGames=[];deletedIds=new Set();favorites=new Set();saveAllLocal();games=buildCatalog();renderAll();alert('Cambios locales eliminados.')}

$('#search').addEventListener('input',renderGames);$('#sort').addEventListener('change',renderGames);$('#statusFilter').addEventListener('change',renderGames);$('#filterToggle').onclick=()=>$('#filters').classList.toggle('open');
$('#clearFilters').onclick=()=>{$$('.filters input').forEach(x=>x.checked=false);$('#statusFilter').value='all';$('#search').value='';renderGames()};
$$('.tab').forEach(x=>x.onclick=()=>switchView(x.dataset.view));
$('#newSessionBtn').onclick=()=>{$('#newSessionBtn').blur();switchView('builder');session=[];$('#sessionName').value='';$('#sessionGroup').value='';$('#sessionDate').value=today();$('#studentCount').value='';$('#sessionDuration').value='';$('#sessionGrouping').value='Gran grupo';$('#sessionObjectives').value='';$('#sessionCompetencies').value='';$('#sessionObservations').value='';renderSession();$('#sessionCount').textContent=0};
$('#saveSession').onclick=()=>{const meta=sessionMetaFromUI();const s={...meta,games:[...session],savedAt:new Date().toISOString()};savedSessions.unshift(s);saveJSON(SESS_KEY,savedSessions);renderSaved();alert('Sesión guardada.')};
$('#printSession').onclick=()=>window.print();$('#autoPhaseBtn').onclick=autoPhase;$('#sessionDuration').oninput=updateTotals;$('#sourcesBtn').onclick=()=>sourcesDialog.showModal();$('#addGameBtn').onclick=newGame;$('#manageBtn').onclick=openManager;
$('#exportBackup').onclick=exportCatalog;$('#exportChanges').onclick=exportChanges;$('#clearLocal').onclick=clearLocalChanges;$('#importFile').onchange=e=>{if(e.target.files[0])importCatalogFile(e.target.files[0]);e.target.value=''};
$('#newGameFromManager').onclick=()=>{managerDialog.close();newGame()};

document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus()}});
window.editGame=editGame;window.saveGameEdit=saveGameEdit;window.createGame=createGame;window.duplicateGame=duplicateGame;window.toggleFavorite=toggleFavorite;window.addToSession=addToSession;window.openGame=openGame;
init();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js?v=6',{updateViaCache:'none'}).catch(()=>{});
