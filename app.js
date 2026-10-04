function matches(g){
  const q=normalize($('#search').value);
  const text=normalize([g.title,g.description,g.material,g.age,g.source,...groupingValues(g),...objectiveValues(g)].join(' '));
  if(q&&!text.includes(q))return false;
  const ages=selected('#ageFilters'),mats=selected('#materialFilters'),spaces=selected('#spaceFilters'),ints=selected('#intensityFilters'),srcs=selected('#sourceFilters'),groups=selected('#groupingFilters'),objs=selected('#objectiveFilters');
  return(!ages.length||ages.some(v=>normalize(g.age||'No especificada').includes(normalize(v))))
    &&(!mats.length||mats.includes(materialTag(g.material)))
    &&(!spaces.length||spaces.includes(g.space||'No especificado'))
    &&(!ints.length||ints.includes(inferIntensity(g)))
    &&(!srcs.length||srcs.includes(sourceLabel(g)))
    &&(!groups.length||groups.some(v=>groupingValues(g).includes(v)))
    &&(!objs.length||objs.some(v=>objectiveValues(g).includes(v)))
    &&(!$('#ocrOnly')?.checked||g.needsReview)
}
function renderGames(){let list=games.filter(matches);const sort=$('#sort').value;if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));if(sort==='za')list.sort((a,b)=>b.title.localeCompare(a.title,'es'));$('#resultSummary').textContent=`${list.length} juego${list.length===1?'':'s'} encontrados`;const grid=$('#gameGrid');grid.innerHTML='';const tpl=$('#gameCardTemplate');list.forEach(g=>{const n=tpl.content.cloneNode(true),card=n.querySelector('.game-card');card.dataset.id=g.id;card.querySelector('.age').textContent=g.age||'Edad variable';card.querySelector('.ocr-badge').classList.toggle('hidden',!g.needsReview);card.querySelector('.custom-badge').classList.toggle('hidden',!g.manual);card.querySelector('h3').textContent=g.title;card.querySelector('.desc').textContent=g.description;card.querySelector('.material').textContent=materialTag(g.material);card.querySelector('.space').textContent=g.space||'No especificado';card.querySelector('.intensity').textContent=inferIntensity(g);card.querySelector('.source').textContent=`${sourceLabel(g)} · pág. ${g.page||'—'}`;card.querySelector('.chips').insertAdjacentHTML('beforeend',groupingValues(g).slice(0,1).map(v=>`<span class="chip grouping-chip">${esc(v)}</span>`).join(''));card.querySelector('.chips').insertAdjacentHTML('beforeend',objectiveValues(g).slice(0,2).map(v=>`<span class="chip objective-chip">${esc(v)}</span>`).join(''));card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};card.onclick=()=>openGame(g.id);card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);grid.appendChild(n)});$('#empty').classList.toggle('hidden',list.length>0);$('#totalGames').textContent=games.length}
function openGame(id){const g=games.find(x=>x.id===id);if(!g)return;$('#dialogContent').innerHTML=`<div class="eyebrow">FICHA DE JUEGO</div><h2>${esc(g.title)}</h2><div class="detail-meta"><span class="tag">${esc(g.age||'Edad variable')}</span><span class="chip">${esc(materialTag(g.material))}</span><span class="chip">${esc(g.space||'')}</span><span class="chip">${esc(inferIntensity(g))}</span>${groupingValues(g).map(v=>`<span class="chip">👥 ${esc(v)}</span>`).join('')}${objectiveValues(g).map(v=>`<span class="chip">🎯 ${esc(v)}</span>`).join('')}</div><p class="detail-desc">${esc(g.description||'')}</p><div class="source-box"><strong>Fuente</strong><br>${esc(g.source||'MotorLab')} · página ${esc(g.page||'—')}<br><small>Material original: ${esc(g.material||'')}</small></div><div class="dialog-actions"><button class="primary" id="editGameBtn">✏️ Editar ficha</button><button class="primary secondary" id="addGameSessionBtn">＋ Añadir a sesión</button><button class="ghost" onclick="gameDialog.close()">Cerrar</button></div>`;$('#editGameBtn').onclick=()=>{gameDialog.close();openGameEditor(g.id)};$('#addGameSessionBtn').onclick=()=>{addToSession(g.id);gameDialog.close()};gameDialog.showModal()}
function openGameEditor(id=null){const g=id?games.find(x=>x.id===id):{id:uid('manual'),title:'',description:'',age:'Primaria',material:'Sin material',space:'Pista / gimnasio',intensity:'Media',source:'Creación propia',page:'—',manual:true,needsReview:false,updatedAt:now()};if(!g)return;$('#editGameDialogContent').innerHTML=`<div class="dialog-head"><div><div class="eyebrow">${id?'EDITAR FICHA':'NUEVO JUEGO'}</div><h2>${id?'Editar juego':'Añadir juego al repositorio'}</h2></div><button class="icon" onclick="editGameDialog.close()">×</button></div><form id="gameForm" class="form-grid"><label>Nombre*<input name="title" required value="${esc(g.title)}"></label><label>Edad<input name="age" value="${esc(g.age)}"></label><label>Material<input name="material" value="${esc(g.material)}"></label><label>Espacio<input name="space" value="${esc(g.space)}"></label><label>Intensidad<select name="intensity"><option ${g.intensity==='Baja'?'selected':''}>Baja</option><option ${g.intensity==='Media'?'selected':''}>Media</option><option ${g.intensity==='Alta'?'selected':''}>Alta</option></select></label><label>Fuente<input name="source" value="${esc(g.source)}"></label><label>Página<input name="page" value="${esc(g.page||'—')}"></label><label class="full">Descripción / reglas<textarea name="description" rows="7" required>${esc(g.description)}</textarea></label><div class="form-actions full"><button type="button" class="ghost" onclick="editGameDialog.close()">Cancelar</button><button class="primary">Guardar ficha</button></div></form>`;$('#gameForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const updated={...g,title:f.get('title').trim(),age:f.get('age').trim(),material:f.get('material').trim(),space:f.get('space').trim(),intensity:f.get('intensity'),source:(g.manual||!id)?'Creación propia':(f.get('source').trim()||'Fuente no especificada'),page:f.get('page').trim()||'—',description:f.get('description').trim(),updatedAt:now(),manual:g.manual||!id};games=games.map(x=>x.id===updated.id?updated:x);if(!id)games.push(updated);persistGame(updated);renderGames();editGameDialog.close();openGame(updated.id)};editGameDialog.showModal()}
function sessionMetaFromUI(){return{name:$('#sessionName').value.trim(),date:$('#sessionDate').value,group:$('#sessionGroup').value.trim(),students:$('#studentCount')?.value||'',duration:$('#sessionDuration')?.value||'',grouping:$('#sessionGrouping')?.value||'Gran grupo',unitId:$('#sessionUnit')?.value||'',objectives:$('#sessionObjectives')?.value.trim()||'',competencies:$('#sessionCompetencies')?.value.trim()||'',observations:$('#sessionObservations')?.value.trim()||''}}
function addToSession(id){if(!session.some(x=>x.id===id)){session.push({id,phase:'Sin asignar',minutes:'',grouping:$('#sessionGrouping')?.value||'Gran grupo',note:''});markPending()}renderSession();$('#sessionCount').textContent=session.length}
function removeFromSession(i){session.splice(i,1);renderSession();$('#sessionCount').textContent=session.length;markPending()}
function phaseOptions(current){return ['Sin asignar','Calentamiento','Parte principal','Vuelta a la calma'].map(p=>`<option ${p===current?'selected':''}>${p}</option>`).join('')}
function renderSession(){const box=$('#sessionList');box.innerHTML='';if(!session.length){box.innerHTML='<div class="dropzone" id="dropzone">Arrastra aquí juegos para empezar</div>';bindDrop();updateTotals();return}session.forEach((item,i)=>{const g=games.find(x=>x.id===item.id);if(!g)return;const el=document.createElement('div');el.className='session-item';el.draggable=true;el.innerHTML=`<div class="drag">☷</div><div class="session-game-info"><h4>${esc(i+1+'. '+g.title)}</h4><p>${esc(g.age||'')} · ${esc(materialTag(g.material))}</p><div class="session-description">${esc(g.description||'Descripción no disponible.')}</div><div class="session-total">${esc(item.note||'')}</div></div><div class="session-controls"><select class="phase">${phaseOptions(item.phase)}</select><input class="minutes" type="number" min="1" placeholder="min" value="${esc(item.minutes||'')}"><input class="note" placeholder="Variante / observación" value="${esc(item.note||'')}"></div><button class="remove">×</button>`;el.querySelector('.phase').onchange=e=>{item.phase=e.target.value;markPending()};el.querySelector('.minutes').onchange=e=>{item.minutes=e.target.value;updateTotals();markPending()};el.querySelector('.note').oninput=e=>{item.note=e.target.value;el.querySelector('.session-total').textContent=e.target.value;markPending()};el.querySelector('.remove').onclick=()=>removeFromSession(i);el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({id:item.id,from:i}));el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.from!==undefined){const moved=session.splice(d.from,1)[0];session.splice(i,0,moved);renderSession();markPending()}else addToSession(d.id||e.dataTransfer.getData('text/plain'))}catch(_){}};box.appendChild(el)});const dz=document.createElement('div');dz.className='dropzone';dz.textContent='Suelta aquí para añadir otro juego';dz.id='dropzone';box.appendChild(dz);bindDrop();updateTotals()}
function updateTotals(){const mins=session.reduce((a,x)=>a+(Number(x.minutes)||0),0),target=Number($('#sessionDuration')?.value||0);$('#sessionTotals').textContent=`${session.length} juegos · ${mins} min${target?` / objetivo ${target} min`:''}`}
function bindDrop(){const dz=$('#dropzone');if(!dz)return;dz.ondragover=e=>e.preventDefault();dz.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');try{const d=JSON.parse(raw);addToSession(d.id)}catch(_){if(raw)addToSession(raw)}}}
function autoPhase(){if(!session.length)return;const n=session.length;session.forEach((x,i)=>{x.phase=i===0?'Calentamiento':(i===n-1&&n>2?'Vuelta a la calma':'Parte principal');if(!x.minutes)x.minutes=i===0?'10':(i===n-1&&n>2?'5':'10')});renderSession();markPending()}
function clearCurrentSession(){
  if(!session.length)return;
  if(!confirm('¿Vaciar todos los juegos de la sesión actual?'))return;
  session=[];
  renderSession();
  $('#sessionCount').textContent=0;
  markPending();
}
function duplicateSession(i){
  const source=savedSessions[i];
  if(!source)return;
  const copy={...source,id:uid('session'),name:`${source.name||'Sesión'} (copia)`,games:(source.games||[]).map(x=>({...x})),updatedAt:now()};
  savedSessions.unshift(copy);
  write(KEYS.sessions,savedSessions);
  renderSaved();
  markPending();
  loadSession(0);
}
function startNewSessionFromUnit(unitId){
  switchView('builder');
  session=[];
  $('#editingSessionId').value='';
  $('#sessionName').value='';
  $('#sessionGroup').value='';
  $('#sessionDate').value=new Date().toISOString().slice(0,10);
  $('#sessionUnit').value=unitId||'';
  if($('#studentCount'))$('#studentCount').value='';
  if($('#sessionDuration'))$('#sessionDuration').value='';
  if($('#sessionGrouping'))$('#sessionGrouping').value='Gran grupo';
  if($('#sessionObjectives'))$('#sessionObjectives').value='';
  if($('#sessionCompetencies'))$('#sessionCompetencies').value='';
  if($('#sessionObservations'))$('#sessionObservations').value='';
  renderSession();
  $('#sessionCount').textContent=0;
}
function openLibraryForAdding(){switchView('library');window.scrollTo({top:0,behavior:'smooth'});}
function renderSaved(){const el=$('#savedList');el.innerHTML=savedSessions.length?'':'<p class="muted">Aún no hay sesiones guardadas.</p>';savedSessions.forEach((s,i)=>{const d=document.createElement('div');d.className='saved-card';const u=units.find(x=>x.id===s.unitId);d.innerHTML=`<strong>${esc(s.name||'Sesión sin nombre')}</strong><small>${esc(s.date||'')} · ${esc(s.group||'Sin grupo')}${u?` · 📚 ${esc(u.name)}`:''} · ${(s.games||[]).length} juegos</small><div class="card-actions"><button data-act="load">Abrir</button><button data-act="duplicate">Duplicar</button><button data-act="rename">Renombrar</button><button data-act="delete">Eliminar</button></div>`;d.querySelector('[data-act=load]').onclick=()=>loadSession(i);d.querySelector('[data-act=duplicate]').onclick=()=>duplicateSession(i);d.querySelector('[data-act=rename]').onclick=()=>renameSession(i);d.querySelector('[data-act=delete]').onclick=()=>deleteSession(i);el.appendChild(d)})}
function loadSession(i){const s=savedSessions[i];$('#editingSessionId').value=s.id||'';session=(s.games||[]).map(x=>typeof x==='string'?{id:x,phase:'Sin asignar',minutes:'',grouping:s.grouping||'Gran grupo',note:''}:x);fillSessionMeta(s);renderSession();$('#sessionCount').textContent=session.length;switchView('builder')}
function fillSessionMeta(s){$('#sessionName').value=s.name||'';$('#sessionDate').value=s.date||'';$('#sessionGroup').value=s.group||'';if($('#studentCount'))$('#studentCount').value=s.students||'';if($('#sessionDuration'))$('#sessionDuration').value=s.duration||'';if($('#sessionGrouping'))$('#sessionGrouping').value=s.grouping||'Gran grupo';if($('#sessionUnit'))$('#sessionUnit').value=s.unitId||'';if($('#sessionObjectives'))$('#sessionObjectives').value=s.objectives||'';if($('#sessionCompetencies'))$('#sessionCompetencies').value=s.competencies||'';if($('#sessionObservations'))$('#sessionObservations').value=s.observations||''}
function saveCurrentSession(){const meta=sessionMetaFromUI();if(!meta.name){alert('Pon un nombre a la sesión antes de guardarla.');return}const existingId=$('#editingSessionId').value||uid('session');const s={...meta,id:existingId,games:[...session],updatedAt:now()};const idx=savedSessions.findIndex(x=>x.id===existingId);if(idx>=0)savedSessions[idx]=s;else savedSessions.unshift(s);write(KEYS.sessions,savedSessions);$('#editingSessionId').value=existingId;renderSaved();markPending();alert('Sesión guardada.')}
function renameSession(i){const s=savedSessions[i],name=prompt('Nuevo nombre de la sesión:',s.name||'');if(name&&name.trim()){s.name=name.trim();s.updatedAt=now();write(KEYS.sessions,savedSessions);renderSaved();markPending()}}
function deleteSession(i){const s=savedSessions[i];if(!s||!confirm('¿Eliminar esta sesión del repositorio?'))return;savedSessions.splice(i,1);const deleted=read(KEYS.deletedSessions,{});deleted[s.id]={id:s.id,updatedAt:now()};write(KEYS.deletedSessions,deleted);write(KEYS.sessions,savedSessions);renderSaved();markPending()}
function renderUnits(){const list=$('#unitsList');if(!list)return;const countEl=$('#unitCount');if(countEl)countEl.textContent=units.length;list.innerHTML=units.length?'':'<p class="muted">Aún no hay unidades didácticas.</p>';units.forEach((u,i)=>{const count=savedSessions.filter(s=>s.unitId===u.id).length;const d=document.createElement('div');d.className='saved-card';d.innerHTML=`<strong>📚 ${esc(u.name)}</strong><small>${count} sesiones · ${esc(u.updatedAt?.slice(0,10)||'')}</small><div class="card-actions"><button data-a="rename">Renombrar</button><button data-a="open">Ver sesiones</button><button data-a="delete">Eliminar</button></div>`;d.querySelector('[data-a=rename]').onclick=()=>renameUnit(i);d.querySelector('[data-a=open]').onclick=()=>filterSessionsByUnit(u.id);d.querySelector('[data-a=delete]').onclick=()=>deleteUnit(i);list.appendChild(d)});renderUnitSelect()}
function renderUnitSelect(){const sel=$('#sessionUnit');if(!sel)return;const current=sel.value;sel.innerHTML='<option value="">Sin unidad didáctica</option>'+units.map(u=>`<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');sel.value=current}
function createUnit(){const name=prompt('Nombre de la unidad didáctica:');if(!name||!name.trim())return;const u={id:uid('unit'),name:name.trim(),updatedAt:now()};units.unshift(u);write(KEYS.units,units);renderUnits();$('#sessionUnit').value=u.id;markPending()}
function renameUnit(i){const u=units[i],name=prompt('Nuevo nombre de la unidad didáctica:',u.name);if(name&&name.trim()){u.name=name.trim();u.updatedAt=now();write(KEYS.units,units);renderUnits();renderSaved();markPending()}}
function deleteUnit(i){const u=units[i];if(!u||!confirm(`¿Eliminar la unidad "${u.name}"? Las sesiones no se borrarán.`))return;units.splice(i,1);const deleted=read(KEYS.deletedUnits,{});deleted[u.id]={id:u.id,updatedAt:now()};savedSessions=savedSessions.map(s=>s.unitId===u.id?{...s,unitId:'',updatedAt:now()}:s);write(KEYS.deletedUnits,deleted);write(KEYS.units,units);write(KEYS.sessions,savedSessions);renderUnits();renderSaved();markPending()}
function filterSessionsByUnit(unitId){switchView('builder');const cards=$$('#savedList .saved-card');cards.forEach((c,i)=>{const s=savedSessions[i];c.classList.toggle('dimmed',s?.unitId!==unitId)})}
function renderSources(){$('#sourcesList').innerHTML=sources.map(s=>`<div class="source-row"><strong>${esc(s.display)}</strong><small>${esc(s.name)} · ${s.pages} páginas · ${s.type}${s.loaded_games?` · ${s.loaded_games} juegos extraídos`:''}</small></div>`).join('')}
function switchView(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#libraryView').classList.toggle('hidden',v!=='library');$('#builderView').classList.toggle('hidden',v!=='builder');$('#unitsView')?.classList.toggle('hidden',v!=='units');if(v==='units')renderUnits()}
function loadSyncSettingsUI(){const s=getSettings();$('#apiUrl').value=s.url;$('#apiToken').value=s.token}
async function syncNow(opts={}){
  const s=getSettings();
  if(!s.url||!s.token){if(!opts.silent)openSyncDialog();return}
  setSyncState('syncing');write(KEYS.sync,{status:'syncing',at:now()});
  try{
    const base=s.url.replace(/\/$/,'');
    const getHeaders={'X-MotorLab-Token':s.token};
    const postHeaders={'X-MotorLab-Token':s.token,'Content-Type':'application/json'};
    const fetchRemote=async()=>{
      const r=await fetch(base+'/sync',{headers:getHeaders,cache:'no-store'});
      if(!r.ok)throw new Error(`GET /sync ${r.status}`);
      const payload=await r.json();
      const items=Array.isArray(payload.items)?payload.items:[];
      console.info('[MotorLab] /sync recibido:', items.length, 'registros;', items.filter(x=>x.type==='session'&&!x.deleted).length, 'sesiones');
      return items;
    };

    // Primera lectura: incorpora inmediatamente sesiones/unidades creadas en
    // otros dispositivos antes de decidir qué cambios locales enviar.
    const remote=await fetchRemote();
    mergeRemote(remote);

    const local=buildLocalRecords();
    const toUpload=local.filter(x=>{
      const rm=remote.find(rm=>rm.id===x.id&&rm.type===x.type);
      return !rm||new Date(rm.updatedAt)<new Date(x.updatedAt);
    });
    for(let i=0;i<toUpload.length;i+=50){
      const batch=toUpload.slice(i,i+50);
      const wr=await fetch(base+'/sync',{
        method:'POST',
        headers:postHeaders,
        body:JSON.stringify({items:batch})
      });
      if(!wr.ok)throw new Error(`POST /sync ${wr.status}`);
    }

    // Segunda lectura: garantiza que el dispositivo queda alineado con el
    // estado real del NAS después de los POST, incluso si otro dispositivo
    // ha creado una sesión justo antes de esta sincronización.
    const remoteAfter=await fetchRemote();
    mergeRemote(remoteAfter);

    setSyncState('idle');
    write(KEYS.sync,{status:'idle',at:now()});
    renderGames();renderSaved();renderUnits();
  }catch(e){
    console.error(e);
    setSyncState('error');
    write(KEYS.sync,{status:'error',at:now(),error:String(e)});
  }
}
function buildLocalRecords(){
  const overrides=cleanGameOverrides();
  const gameRecords=Object.values(overrides).map(g=>({id:g.id,type:'game',data:g,updatedAt:g.updatedAt||now(),deleted:false}));
  const sessionRecords=savedSessions.map(s=>({id:s.id,type:'session',data:s,updatedAt:s.updatedAt||now(),deleted:false}));
  const unitRecords=units.map(u=>({id:u.id,type:'unit',data:u,updatedAt:u.updatedAt||now(),deleted:false}));
  const deletedSessions=Object.values(read(KEYS.deletedSessions,{})).map(x=>({id:x.id,type:'session',data:null,updatedAt:x.updatedAt,deleted:true}));
  const deletedUnits=Object.values(read(KEYS.deletedUnits,{})).map(x=>({id:x.id,type:'unit',data:null,updatedAt:x.updatedAt,deleted:true}));
  return [...gameRecords,...sessionRecords,...unitRecords,...deletedSessions,...deletedUnits];
}
function mergeRemote(remote){
  let changed=false;
  const override=cleanGameOverrides();
  const remoteSessions=[],remoteUnits=[];
  remote.forEach(r=>{
    if(r.type==='game'){
      if(r.deleted)return;
      const base=games.find(g=>g.id===r.id);
      const localOverride=override[r.id];
      const remoteIsManual=Boolean(r.data?.manual);
      if(!base&&!remoteIsManual)return;
      if(base&&!remoteIsManual&&!localOverride)return;
      const localDate=localOverride?.updatedAt||'';
      if(!localDate||new Date(r.updatedAt)>new Date(localDate)){
        const g={...r.data,updatedAt:r.data?.updatedAt||r.updatedAt};
        const idx=games.findIndex(x=>x.id===g.id);
        if(idx>=0)games[idx]=g;else if(remoteIsManual)games.push(g);
        override[g.id]=g;
        changed=true;
      }
    }else if(r.type==='session')remoteSessions.push(r);
    else if(r.type==='unit')remoteUnits.push(r);
  });
  const deletedSessions=read(KEYS.deletedSessions,{});
  const deletedUnits=read(KEYS.deletedUnits,{});
  remoteSessions.forEach(r=>{
    const i=savedSessions.findIndex(x=>x.id===r.id);
    const tomb=deletedSessions[r.id];
    const remoteDate=new Date(r.updatedAt);
    const localDate=i>=0?new Date(savedSessions[i].updatedAt||0):new Date(0);
    const tombDate=tomb?new Date(tomb.updatedAt):new Date(0);
    if(tombDate>=remoteDate)return;
    if(i<0||remoteDate>localDate){
      if(r.deleted){if(i>=0)savedSessions.splice(i,1);deletedSessions[r.id]={id:r.id,updatedAt:r.updatedAt}}
      else {if(i>=0)savedSessions[i]=r.data;else savedSessions.push(r.data);delete deletedSessions[r.id]}
      changed=true;
    }
  });
  remoteUnits.forEach(r=>{
    const i=units.findIndex(x=>x.id===r.id);
    const tomb=deletedUnits[r.id];
    const remoteDate=new Date(r.updatedAt);
    const localDate=i>=0?new Date(units[i].updatedAt||0):new Date(0);
    const tombDate=tomb?new Date(tomb.updatedAt):new Date(0);
    if(tombDate>=remoteDate)return;
    if(i<0||remoteDate>localDate){
      if(r.deleted){if(i>=0)units.splice(i,1);deletedUnits[r.id]={id:r.id,updatedAt:r.updatedAt}}
      else {if(i>=0)units[i]=r.data;else units.push(r.data);delete deletedUnits[r.id]}
      changed=true;
    }
  });
  if(changed){
    write(KEYS.overrides,override);
    write(KEYS.sessions,savedSessions);
    write(KEYS.units,units);
    write(KEYS.deletedSessions,deletedSessions);
    write(KEYS.deletedUnits,deletedUnits);
  }
}
function openSyncDialog(){loadSyncSettingsUI();syncDialog.showModal()}
$('#search').addEventListener('input',renderGames);$('#sort').addEventListener('change',renderGames);$('#filterToggle').onclick=()=>{if($('#filterDialog')?.showModal)$('#filterDialog').showModal();else $('#filters').classList.toggle('open')};$('#clearFilters').onclick=clearAllFilters;$('#clearFiltersDialog').onclick=clearAllFilters;$('#applyFiltersDialog').onclick=()=>{renderGames();filterDialog.close()};$('#closeFilterDialog').onclick=()=>filterDialog.close();$$('.tab').forEach(x=>x.onclick=()=>switchView(x.dataset.view));
$('#newSessionBtn').onclick=()=>{switchView('builder');session=[];$('#editingSessionId').value='';$('#sessionName').value='';$('#sessionGroup').value='';$('#sessionDate').value=new Date().toISOString().slice(0,10);if($('#sessionUnit'))$('#sessionUnit').value='';if($('#studentCount'))$('#studentCount').value='';if($('#sessionDuration'))$('#sessionDuration').value='';if($('#sessionGrouping'))$('#sessionGrouping').value='Gran grupo';if($('#sessionObjectives'))$('#sessionObjectives').value='';if($('#sessionCompetencies'))$('#sessionCompetencies').value='';if($('#sessionObservations'))$('#sessionObservations').value='';renderSession();$('#sessionCount').textContent=0};
$('#saveSession').onclick=saveCurrentSession;$('#printSession').onclick=()=>window.print();$('#autoPhaseBtn').onclick=autoPhase;$('#clearSessionBtn')?.addEventListener('click',clearCurrentSession);$('#addGamesBtn')?.addEventListener('click',openLibraryForAdding);$('#newUnitFromSession')?.addEventListener('click',createUnit);$('#sessionDuration')?.addEventListener('input',updateTotals);$('#sourcesBtn').onclick=()=>sourcesDialog.showModal();$('#newGameBtn').onclick=()=>openGameEditor();$('#newUnitBtn').onclick=createUnit;$('#syncBtn').onclick=()=>syncNow();$('#syncSettingsBtn').onclick=openSyncDialog;
$('#syncForm').onsubmit=e=>{e.preventDefault();const url=$('#apiUrl').value.trim().replace(/\/$/,'');const token=$('#apiToken').value.trim();write(KEYS.settings,{url,token});syncDialog.close();syncNow()};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus()}});
init();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
function matches(g){
  const q=normalize($('#search').value);
  const text=normalize([g.title,g.description,g.material,g.age,g.source,...groupingValues(g),...objectiveValues(g)].join(' '));
  if(q&&!text.includes(q))return false;
  const ages=selected('#ageFilters'),mats=selected('#materialFilters'),spaces=selected('#spaceFilters'),ints=selected('#intensityFilters'),srcs=selected('#sourceFilters'),groups=selected('#groupingFilters'),objs=selected('#objectiveFilters'),states=selected('#contentStateFilters');
  const state=contentState(g),reviewOnly=$('#ocrOnly')?.checked;
  if(reviewOnly){if(!g.needsReview)return false}
  else if(!states.length&&state==='OCR pendiente')return false;
  if(states.length&&!states.includes(state))return false;
  return(!ages.length||ages.some(v=>ageCategories(g).includes(v)))
    &&(!mats.length||mats.some(v=>materialCategories(g).includes(v)))
    &&(!spaces.length||spaces.some(v=>spaceCategories(g).includes(v)))
    &&(!ints.length||ints.includes(intensityCategory(g)))
    &&(!srcs.length||srcs.includes(sourceLabel(g)))
    &&(!groups.length||groups.some(v=>groupingValues(g).includes(v)))
    &&(!objs.length||objs.some(v=>objectiveValues(g).includes(v)));
}
function renderGames(){
  let list=games.filter(matches);const sort=$('#sort').value;
  if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));if(sort==='za')list.sort((a,b)=>b.title.localeCompare(a.title,'es'));
  const pending=games.filter(g=>contentState(g)==='OCR pendiente').length;
  $('#resultSummary').textContent=`${list.length} juego${list.length===1?'':'s'} encontrados${pending?' · '+pending+' OCR pendientes':''}`;
  const grid=$('#gameGrid');grid.innerHTML='';const tpl=$('#gameCardTemplate');
  list.forEach(g=>{const n=tpl.content.cloneNode(true),card=n.querySelector('.game-card');card.dataset.id=g.id;
    card.querySelector('.age').textContent=ageCategories(g)[0]||'Edad variable';
    card.querySelector('.ocr-badge').classList.toggle('hidden',contentState(g)==='Verificado');
    card.querySelector('.ocr-badge').textContent=contentState(g)==='OCR pendiente'?'OCR · pendiente':'OCR · revisar';
    card.querySelector('.custom-badge').classList.toggle('hidden',!g.manual);card.querySelector('h3').textContent=g.title;card.querySelector('.desc').textContent=g.description;
    card.querySelector('.material').textContent=materialCategories(g).slice(0,2).join(' · ');card.querySelector('.space').textContent=spaceTag(g);card.querySelector('.intensity').textContent=intensityCategory(g);
    card.querySelector('.source').textContent=`${sourceLabel(g)} · pág. ${g.page||'—'}`;
    card.querySelector('.chips').insertAdjacentHTML('beforeend',groupingValues(g).slice(0,1).map(v=>`<span class="chip grouping-chip">${esc(v)}</span>`).join(''));
    card.querySelector('.chips').insertAdjacentHTML('beforeend',objectiveValues(g).slice(0,2).map(v=>`<span class="chip objective-chip">${esc(v)}</span>`).join(''));
    card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};card.onclick=()=>openGame(g.id);card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);grid.appendChild(n)
  });
  $('#empty').classList.toggle('hidden',list.length>0);$('#totalGames').textContent=games.filter(g=>contentState(g)!=='OCR pendiente').length
}
function renderGames(){let list=games.filter(matches);const sort=$('#sort').value;if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));if(sort==='za')list.sort((a,b)=>b.title.localeCompare(a.title,'es'));$('#resultSummary').textContent=`${list.length} juego${list.length===1?'':'s'} encontrados`;const grid=$('#gameGrid');grid.innerHTML='';const tpl=$('#gameCardTemplate');list.forEach(g=>{const n=tpl.content.cloneNode(true),card=n.querySelector('.game-card');card.dataset.id=g.id;card.querySelector('.age').textContent=g.age||'Edad variable';card.querySelector('.ocr-badge').classList.toggle('hidden',!g.needsReview);card.querySelector('.custom-badge').classList.toggle('hidden',!g.manual);card.querySelector('h3').textContent=g.title;card.querySelector('.desc').textContent=g.description;card.querySelector('.material').textContent=materialTag(g.material);card.querySelector('.space').textContent=g.space||'No especificado';card.querySelector('.intensity').textContent=inferIntensity(g);card.querySelector('.source').textContent=`${sourceLabel(g)} · pág. ${g.page||'—'}`;card.querySelector('.chips').insertAdjacentHTML('beforeend',groupingValues(g).slice(0,1).map(v=>`<span class="chip grouping-chip">${esc(v)}</span>`).join(''));card.querySelector('.chips').insertAdjacentHTML('beforeend',objectiveValues(g).slice(0,2).map(v=>`<span class="chip objective-chip">${esc(v)}</span>`).join(''));card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};card.onclick=()=>openGame(g.id);card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);grid.appendChild(n)});$('#empty').classList.toggle('hidden',list.length>0);$('#totalGames').textContent=games.length}
function openGame(id){const g=games.find(x=>x.id===id);if(!g)return;$('#dialogContent').innerHTML=`<div class="eyebrow">FICHA DE JUEGO</div><h2>${esc(g.title)}</h2><div class="detail-meta"><span class="tag">${esc(g.age||'Edad variable')}</span><span class="chip">${esc(materialTag(g.material))}</span><span class="chip">${esc(g.space||'')}</span><span class="chip">${esc(inferIntensity(g))}</span>${groupingValues(g).map(v=>`<span class="chip">👥 ${esc(v)}</span>`).join('')}${objectiveValues(g).map(v=>`<span class="chip">🎯 ${esc(v)}</span>`).join('')}</div><p class="detail-desc">${esc(g.description||'')}</p><div class="source-box"><strong>Fuente</strong><br>${esc(g.source||'MotorLab')} · página ${esc(g.page||'—')}<br><small>Material original: ${esc(g.material||'')}</small></div><div class="dialog-actions"><button class="primary" id="editGameBtn">✏️ Editar ficha</button><button class="primary secondary" id="addGameSessionBtn">＋ Añadir a sesión</button><button class="ghost" onclick="gameDialog.close()">Cerrar</button></div>`;$('#editGameBtn').onclick=()=>{gameDialog.close();openGameEditor(g.id)};$('#addGameSessionBtn').onclick=()=>{addToSession(g.id);gameDialog.close()};gameDialog.showModal()}
function openGameEditor(id=null){const g=id?games.find(x=>x.id===id):{id:uid('manual'),title:'',description:'',age:'Primaria',material:'Sin material',space:'Pista / gimnasio',intensity:'Media',source:'Creación propia',page:'—',manual:true,needsReview:false,updatedAt:now()};if(!g)return;$('#editGameDialogContent').innerHTML=`<div class="dialog-head"><div><div class="eyebrow">${id?'EDITAR FICHA':'NUEVO JUEGO'}</div><h2>${id?'Editar juego':'Añadir juego al repositorio'}</h2></div><button class="icon" onclick="editGameDialog.close()">×</button></div><form id="gameForm" class="form-grid"><label>Nombre*<input name="title" required value="${esc(g.title)}"></label><label>Edad<input name="age" value="${esc(g.age)}"></label><label>Material<input name="material" value="${esc(g.material)}"></label><label>Espacio<input name="space" value="${esc(g.space)}"></label><label>Intensidad<select name="intensity"><option ${g.intensity==='Baja'?'selected':''}>Baja</option><option ${g.intensity==='Media'?'selected':''}>Media</option><option ${g.intensity==='Alta'?'selected':''}>Alta</option></select></label><label>Fuente<input name="source" value="${esc(g.source)}"></label><label>Página<input name="page" value="${esc(g.page||'—')}"></label><label class="full">Descripción / reglas<textarea name="description" rows="7" required>${esc(g.description)}</textarea></label><div class="form-actions full"><button type="button" class="ghost" onclick="editGameDialog.close()">Cancelar</button><button class="primary">Guardar ficha</button></div></form>`;$('#gameForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const updated={...g,title:f.get('title').trim(),age:f.get('age').trim(),material:f.get('material').trim(),space:f.get('space').trim(),intensity:f.get('intensity'),source:(g.manual||!id)?'Creación propia':(f.get('source').trim()||'Fuente no especificada'),page:f.get('page').trim()||'—',description:f.get('description').trim(),updatedAt:now(),manual:g.manual||!id};games=games.map(x=>x.id===updated.id?updated:x);if(!id)games.push(updated);persistGame(updated);renderGames();editGameDialog.close();openGame(updated.id)};editGameDialog.showModal()}
function sessionMetaFromUI(){return{name:$('#sessionName').value.trim(),date:$('#sessionDate').value,group:$('#sessionGroup').value.trim(),students:$('#studentCount')?.value||'',duration:$('#sessionDuration')?.value||'',grouping:$('#sessionGrouping')?.value||'Gran grupo',unitId:$('#sessionUnit')?.value||'',objectives:$('#sessionObjectives')?.value.trim()||'',competencies:$('#sessionCompetencies')?.value.trim()||'',observations:$('#sessionObservations')?.value.trim()||''}}
function addToSession(id){if(!session.some(x=>x.id===id)){session.push({id,phase:'Sin asignar',minutes:'',grouping:$('#sessionGrouping')?.value||'Gran grupo',note:''});markPending()}renderSession();$('#sessionCount').textContent=session.length}
function removeFromSession(i){session.splice(i,1);renderSession();$('#sessionCount').textContent=session.length;markPending()}
function phaseOptions(current){return ['Sin asignar','Calentamiento','Parte principal','Vuelta a la calma'].map(p=>`<option ${p===current?'selected':''}>${p}</option>`).join('')}
function renderSession(){const box=$('#sessionList');box.innerHTML='';if(!session.length){box.innerHTML='<div class="dropzone" id="dropzone">Arrastra aquí juegos para empezar</div>';bindDrop();updateTotals();return}session.forEach((item,i)=>{const g=games.find(x=>x.id===item.id);if(!g)return;const el=document.createElement('div');el.className='session-item';el.draggable=true;el.innerHTML=`<div class="drag">☷</div><div class="session-game-info"><h4>${esc(i+1+'. '+g.title)}</h4><p>${esc(g.age||'')} · ${esc(materialTag(g.material))}</p><div class="session-description">${esc(g.description||'Descripción no disponible.')}</div><div class="session-total">${esc(item.note||'')}</div></div><div class="session-controls"><select class="phase">${phaseOptions(item.phase)}</select><input class="minutes" type="number" min="1" placeholder="min" value="${esc(item.minutes||'')}"><input class="note" placeholder="Variante / observación" value="${esc(item.note||'')}"></div><button class="remove">×</button>`;el.querySelector('.phase').onchange=e=>{item.phase=e.target.value;markPending()};el.querySelector('.minutes').onchange=e=>{item.minutes=e.target.value;updateTotals();markPending()};el.querySelector('.note').oninput=e=>{item.note=e.target.value;el.querySelector('.session-total').textContent=e.target.value;markPending()};el.querySelector('.remove').onclick=()=>removeFromSession(i);el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({id:item.id,from:i}));el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.from!==undefined){const moved=session.splice(d.from,1)[0];session.splice(i,0,moved);renderSession();markPending()}else addToSession(d.id||e.dataTransfer.getData('text/plain'))}catch(_){}};box.appendChild(el)});const dz=document.createElement('div');dz.className='dropzone';dz.textContent='Suelta aquí para añadir otro juego';dz.id='dropzone';box.appendChild(dz);bindDrop();updateTotals()}
function updateTotals(){const mins=session.reduce((a,x)=>a+(Number(x.minutes)||0),0),target=Number($('#sessionDuration')?.value||0);$('#sessionTotals').textContent=`${session.length} juegos · ${mins} min${target?` / objetivo ${target} min`:''}`}
function bindDrop(){const dz=$('#dropzone');if(!dz)return;dz.ondragover=e=>e.preventDefault();dz.ondrop=e=>{e.preventDefault();const raw=e.dataTransfer.getData('text/plain');try{const d=JSON.parse(raw);addToSession(d.id)}catch(_){if(raw)addToSession(raw)}}}
function autoPhase(){if(!session.length)return;const n=session.length;session.forEach((x,i)=>{x.phase=i===0?'Calentamiento':(i===n-1&&n>2?'Vuelta a la calma':'Parte principal');if(!x.minutes)x.minutes=i===0?'10':(i===n-1&&n>2?'5':'10')});renderSession();markPending()}
function clearCurrentSession(){
  if(!session.length)return;
  if(!confirm('¿Vaciar todos los juegos de la sesión actual?'))return;
  session=[];
  renderSession();
  $('#sessionCount').textContent=0;
  markPending();
}
function duplicateSession(i){
  const source=savedSessions[i];
  if(!source)return;
  const copy={...source,id:uid('session'),name:`${source.name||'Sesión'} (copia)`,games:(source.games||[]).map(x=>({...x})),updatedAt:now()};
  savedSessions.unshift(copy);
  write(KEYS.sessions,savedSessions);
  renderSaved();
  markPending();
  loadSession(0);
}
function startNewSessionFromUnit(unitId){
  switchView('builder');
  session=[];
  $('#editingSessionId').value='';
  $('#sessionName').value='';
  $('#sessionGroup').value='';
  $('#sessionDate').value=new Date().toISOString().slice(0,10);
  $('#sessionUnit').value=unitId||'';
  if($('#studentCount'))$('#studentCount').value='';
  if($('#sessionDuration'))$('#sessionDuration').value='';
  if($('#sessionGrouping'))$('#sessionGrouping').value='Gran grupo';
  if($('#sessionObjectives'))$('#sessionObjectives').value='';
  if($('#sessionCompetencies'))$('#sessionCompetencies').value='';
  if($('#sessionObservations'))$('#sessionObservations').value='';
  renderSession();
  $('#sessionCount').textContent=0;
}
function openLibraryForAdding(){switchView('library');window.scrollTo({top:0,behavior:'smooth'});}
function renderSaved(){const el=$('#savedList');el.innerHTML=savedSessions.length?'':'<p class="muted">Aún no hay sesiones guardadas.</p>';savedSessions.forEach((s,i)=>{const d=document.createElement('div');d.className='saved-card';const u=units.find(x=>x.id===s.unitId);d.innerHTML=`<strong>${esc(s.name||'Sesión sin nombre')}</strong><small>${esc(s.date||'')} · ${esc(s.group||'Sin grupo')}${u?` · 📚 ${esc(u.name)}`:''} · ${(s.games||[]).length} juegos</small><div class="card-actions"><button data-act="load">Abrir</button><button data-act="duplicate">Duplicar</button><button data-act="rename">Renombrar</button><button data-act="delete">Eliminar</button></div>`;d.querySelector('[data-act=load]').onclick=()=>loadSession(i);d.querySelector('[data-act=duplicate]').onclick=()=>duplicateSession(i);d.querySelector('[data-act=rename]').onclick=()=>renameSession(i);d.querySelector('[data-act=delete]').onclick=()=>deleteSession(i);el.appendChild(d)})}
function loadSession(i){const s=savedSessions[i];$('#editingSessionId').value=s.id||'';session=(s.games||[]).map(x=>typeof x==='string'?{id:x,phase:'Sin asignar',minutes:'',grouping:s.grouping||'Gran grupo',note:''}:x);fillSessionMeta(s);renderSession();$('#sessionCount').textContent=session.length;switchView('builder')}
function fillSessionMeta(s){$('#sessionName').value=s.name||'';$('#sessionDate').value=s.date||'';$('#sessionGroup').value=s.group||'';if($('#studentCount'))$('#studentCount').value=s.students||'';if($('#sessionDuration'))$('#sessionDuration').value=s.duration||'';if($('#sessionGrouping'))$('#sessionGrouping').value=s.grouping||'Gran grupo';if($('#sessionUnit'))$('#sessionUnit').value=s.unitId||'';if($('#sessionObjectives'))$('#sessionObjectives').value=s.objectives||'';if($('#sessionCompetencies'))$('#sessionCompetencies').value=s.competencies||'';if($('#sessionObservations'))$('#sessionObservations').value=s.observations||''}
function saveCurrentSession(){const meta=sessionMetaFromUI();if(!meta.name){alert('Pon un nombre a la sesión antes de guardarla.');return}const existingId=$('#editingSessionId').value||uid('session');const s={...meta,id:existingId,games:[...session],updatedAt:now()};const idx=savedSessions.findIndex(x=>x.id===existingId);if(idx>=0)savedSessions[idx]=s;else savedSessions.unshift(s);write(KEYS.sessions,savedSessions);$('#editingSessionId').value=existingId;renderSaved();markPending();alert('Sesión guardada.')}
function renameSession(i){const s=savedSessions[i],name=prompt('Nuevo nombre de la sesión:',s.name||'');if(name&&name.trim()){s.name=name.trim();s.updatedAt=now();write(KEYS.sessions,savedSessions);renderSaved();markPending()}}
function deleteSession(i){const s=savedSessions[i];if(!s||!confirm('¿Eliminar esta sesión del repositorio?'))return;savedSessions.splice(i,1);const deleted=read(KEYS.deletedSessions,{});deleted[s.id]={id:s.id,updatedAt:now()};write(KEYS.deletedSessions,deleted);write(KEYS.sessions,savedSessions);renderSaved();markPending()}
function renderUnits(){const list=$('#unitsList');if(!list)return;const countEl=$('#unitCount');if(countEl)countEl.textContent=units.length;list.innerHTML=units.length?'':'<p class="muted">Aún no hay unidades didácticas.</p>';units.forEach((u,i)=>{const count=savedSessions.filter(s=>s.unitId===u.id).length;const d=document.createElement('div');d.className='saved-card';d.innerHTML=`<strong>📚 ${esc(u.name)}</strong><small>${count} sesiones · ${esc(u.updatedAt?.slice(0,10)||'')}</small><div class="card-actions"><button data-a="rename">Renombrar</button><button data-a="open">Ver sesiones</button><button data-a="delete">Eliminar</button></div>`;d.querySelector('[data-a=rename]').onclick=()=>renameUnit(i);d.querySelector('[data-a=open]').onclick=()=>filterSessionsByUnit(u.id);d.querySelector('[data-a=delete]').onclick=()=>deleteUnit(i);list.appendChild(d)});renderUnitSelect()}
function renderUnitSelect(){const sel=$('#sessionUnit');if(!sel)return;const current=sel.value;sel.innerHTML='<option value="">Sin unidad didáctica</option>'+units.map(u=>`<option value="${esc(u.id)}">${esc(u.name)}</option>`).join('');sel.value=current}
function createUnit(){const name=prompt('Nombre de la unidad didáctica:');if(!name||!name.trim())return;const u={id:uid('unit'),name:name.trim(),updatedAt:now()};units.unshift(u);write(KEYS.units,units);renderUnits();$('#sessionUnit').value=u.id;markPending()}
function renameUnit(i){const u=units[i],name=prompt('Nuevo nombre de la unidad didáctica:',u.name);if(name&&name.trim()){u.name=name.trim();u.updatedAt=now();write(KEYS.units,units);renderUnits();renderSaved();markPending()}}
function deleteUnit(i){const u=units[i];if(!u||!confirm(`¿Eliminar la unidad "${u.name}"? Las sesiones no se borrarán.`))return;units.splice(i,1);const deleted=read(KEYS.deletedUnits,{});deleted[u.id]={id:u.id,updatedAt:now()};savedSessions=savedSessions.map(s=>s.unitId===u.id?{...s,unitId:'',updatedAt:now()}:s);write(KEYS.deletedUnits,deleted);write(KEYS.units,units);write(KEYS.sessions,savedSessions);renderUnits();renderSaved();markPending()}
function filterSessionsByUnit(unitId){switchView('builder');const cards=$$('#savedList .saved-card');cards.forEach((c,i)=>{const s=savedSessions[i];c.classList.toggle('dimmed',s?.unitId!==unitId)})}
function renderSources(){$('#sourcesList').innerHTML=sources.map(s=>`<div class="source-row"><strong>${esc(s.display)}</strong><small>${esc(s.name)} · ${s.pages} páginas · ${s.type}${s.loaded_games?` · ${s.loaded_games} juegos extraídos`:''}</small></div>`).join('')}
function switchView(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#libraryView').classList.toggle('hidden',v!=='library');$('#builderView').classList.toggle('hidden',v!=='builder');$('#unitsView')?.classList.toggle('hidden',v!=='units');if(v==='units')renderUnits()}
function loadSyncSettingsUI(){const s=getSettings();$('#apiUrl').value=s.url;$('#apiToken').value=s.token}
async function syncNow(opts={}){
  const s=getSettings();
  if(!s.url||!s.token){if(!opts.silent)openSyncDialog();return}
  setSyncState('syncing');write(KEYS.sync,{status:'syncing',at:now()});
  try{
    const base=s.url.replace(/\/$/,'');
    const getHeaders={'X-MotorLab-Token':s.token};
    const postHeaders={'X-MotorLab-Token':s.token,'Content-Type':'application/json'};
    const fetchRemote=async()=>{
      const r=await fetch(base+'/sync',{headers:getHeaders,cache:'no-store'});
      if(!r.ok)throw new Error(`GET /sync ${r.status}`);
      const payload=await r.json();
      const items=Array.isArray(payload.items)?payload.items:[];
      console.info('[MotorLab] /sync recibido:', items.length, 'registros;', items.filter(x=>x.type==='session'&&!x.deleted).length, 'sesiones');
      return items;
    };

    // Primera lectura: incorpora inmediatamente sesiones/unidades creadas en
    // otros dispositivos antes de decidir qué cambios locales enviar.
    const remote=await fetchRemote();
    mergeRemote(remote);

    const local=buildLocalRecords();
    const toUpload=local.filter(x=>{
      const rm=remote.find(rm=>rm.id===x.id&&rm.type===x.type);
      return !rm||new Date(rm.updatedAt)<new Date(x.updatedAt);
    });
    for(let i=0;i<toUpload.length;i+=50){
      const batch=toUpload.slice(i,i+50);
      const wr=await fetch(base+'/sync',{
        method:'POST',
        headers:postHeaders,
        body:JSON.stringify({items:batch})
      });
      if(!wr.ok)throw new Error(`POST /sync ${wr.status}`);
    }

    // Segunda lectura: garantiza que el dispositivo queda alineado con el
    // estado real del NAS después de los POST, incluso si otro dispositivo
    // ha creado una sesión justo antes de esta sincronización.
    const remoteAfter=await fetchRemote();
    mergeRemote(remoteAfter);

    setSyncState('idle');
    write(KEYS.sync,{status:'idle',at:now()});
    renderGames();renderSaved();renderUnits();
  }catch(e){
    console.error(e);
    setSyncState('error');
    write(KEYS.sync,{status:'error',at:now(),error:String(e)});
  }
}
function buildLocalRecords(){
  const overrides=cleanGameOverrides();
  const gameRecords=Object.values(overrides).map(g=>({id:g.id,type:'game',data:g,updatedAt:g.updatedAt||now(),deleted:false}));
  const sessionRecords=savedSessions.map(s=>({id:s.id,type:'session',data:s,updatedAt:s.updatedAt||now(),deleted:false}));
  const unitRecords=units.map(u=>({id:u.id,type:'unit',data:u,updatedAt:u.updatedAt||now(),deleted:false}));
  const deletedSessions=Object.values(read(KEYS.deletedSessions,{})).map(x=>({id:x.id,type:'session',data:null,updatedAt:x.updatedAt,deleted:true}));
  const deletedUnits=Object.values(read(KEYS.deletedUnits,{})).map(x=>({id:x.id,type:'unit',data:null,updatedAt:x.updatedAt,deleted:true}));
  return [...gameRecords,...sessionRecords,...unitRecords,...deletedSessions,...deletedUnits];
}
function mergeRemote(remote){
  let changed=false;
  const override=cleanGameOverrides();
  const remoteSessions=[],remoteUnits=[];
  remote.forEach(r=>{
    if(r.type==='game'){
      if(r.deleted)return;
      const base=games.find(g=>g.id===r.id);
      const localOverride=override[r.id];
      const remoteIsManual=Boolean(r.data?.manual);
      if(!base&&!remoteIsManual)return;
      if(base&&!remoteIsManual&&!localOverride)return;
      const localDate=localOverride?.updatedAt||'';
      if(!localDate||new Date(r.updatedAt)>new Date(localDate)){
        const g={...r.data,updatedAt:r.data?.updatedAt||r.updatedAt};
        const idx=games.findIndex(x=>x.id===g.id);
        if(idx>=0)games[idx]=g;else if(remoteIsManual)games.push(g);
        override[g.id]=g;
        changed=true;
      }
    }else if(r.type==='session')remoteSessions.push(r);
    else if(r.type==='unit')remoteUnits.push(r);
  });
  const deletedSessions=read(KEYS.deletedSessions,{});
  const deletedUnits=read(KEYS.deletedUnits,{});
  remoteSessions.forEach(r=>{
    const i=savedSessions.findIndex(x=>x.id===r.id);
    const tomb=deletedSessions[r.id];
    const remoteDate=new Date(r.updatedAt);
    const localDate=i>=0?new Date(savedSessions[i].updatedAt||0):new Date(0);
    const tombDate=tomb?new Date(tomb.updatedAt):new Date(0);
    if(tombDate>=remoteDate)return;
    if(i<0||remoteDate>localDate){
      if(r.deleted){if(i>=0)savedSessions.splice(i,1);deletedSessions[r.id]={id:r.id,updatedAt:r.updatedAt}}
      else {if(i>=0)savedSessions[i]=r.data;else savedSessions.push(r.data);delete deletedSessions[r.id]}
      changed=true;
    }
  });
  remoteUnits.forEach(r=>{
    const i=units.findIndex(x=>x.id===r.id);
    const tomb=deletedUnits[r.id];
    const remoteDate=new Date(r.updatedAt);
    const localDate=i>=0?new Date(units[i].updatedAt||0):new Date(0);
    const tombDate=tomb?new Date(tomb.updatedAt):new Date(0);
    if(tombDate>=remoteDate)return;
    if(i<0||remoteDate>localDate){
      if(r.deleted){if(i>=0)units.splice(i,1);deletedUnits[r.id]={id:r.id,updatedAt:r.updatedAt}}
      else {if(i>=0)units[i]=r.data;else units.push(r.data);delete deletedUnits[r.id]}
      changed=true;
    }
  });
  if(changed){
    write(KEYS.overrides,override);
    write(KEYS.sessions,savedSessions);
    write(KEYS.units,units);
    write(KEYS.deletedSessions,deletedSessions);
    write(KEYS.deletedUnits,deletedUnits);
  }
}
function openSyncDialog(){loadSyncSettingsUI();syncDialog.showModal()}
$('#search').addEventListener('input',renderGames);$('#sort').addEventListener('change',renderGames);$('#filterToggle').onclick=()=>{if($('#filterDialog')?.showModal)$('#filterDialog').showModal();else $('#filters').classList.toggle('open')};$('#clearFilters').onclick=clearAllFilters;$('#clearFiltersDialog').onclick=clearAllFilters;$('#applyFiltersDialog').onclick=()=>{renderGames();filterDialog.close()};$('#closeFilterDialog').onclick=()=>filterDialog.close();$$('.tab').forEach(x=>x.onclick=()=>switchView(x.dataset.view));
$('#newSessionBtn').onclick=()=>{switchView('builder');session=[];$('#editingSessionId').value='';$('#sessionName').value='';$('#sessionGroup').value='';$('#sessionDate').value=new Date().toISOString().slice(0,10);if($('#sessionUnit'))$('#sessionUnit').value='';if($('#studentCount'))$('#studentCount').value='';if($('#sessionDuration'))$('#sessionDuration').value='';if($('#sessionGrouping'))$('#sessionGrouping').value='Gran grupo';if($('#sessionObjectives'))$('#sessionObjectives').value='';if($('#sessionCompetencies'))$('#sessionCompetencies').value='';if($('#sessionObservations'))$('#sessionObservations').value='';renderSession();$('#sessionCount').textContent=0};
$('#saveSession').onclick=saveCurrentSession;$('#printSession').onclick=()=>window.print();$('#autoPhaseBtn').onclick=autoPhase;$('#clearSessionBtn')?.addEventListener('click',clearCurrentSession);$('#addGamesBtn')?.addEventListener('click',openLibraryForAdding);$('#newUnitFromSession')?.addEventListener('click',createUnit);$('#sessionDuration')?.addEventListener('input',updateTotals);$('#sourcesBtn').onclick=()=>sourcesDialog.showModal();$('#newGameBtn').onclick=()=>openGameEditor();$('#newUnitBtn').onclick=createUnit;$('#syncBtn').onclick=()=>syncNow();$('#syncSettingsBtn').onclick=openSyncDialog;
$('#syncForm').onsubmit=e=>{e.preventDefault();const url=$('#apiUrl').value.trim().replace(/\/$/,'');const token=$('#apiToken').value.trim();write(KEYS.settings,{url,token});syncDialog.close();syncNow()};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus()}});
init();if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
