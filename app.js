let games=[], sources=[], session=[], savedSessions=[];
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

async function init(){
  games=await (await fetch('data/games.json')).json();
  sources=await (await fetch('data/sources.json')).json();
  savedSessions=JSON.parse(localStorage.getItem('motorlab_sessions')||'[]');
  $('#totalGames').textContent=games.length;
  $('#sessionCount').textContent=session.length;
  buildFilters(); renderGames(); renderSaved(); renderSources();
  $('#sessionDate').value=new Date().toISOString().slice(0,10);
}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
function materialTag(m){let x=normalize(m); if(x.includes('sin material')||x==='ninguno'||x.includes('ningun'))return'Sin material'; if(x.includes('pelot'))return'Pelota'; if(x.includes('aro'))return'Aros'; if(x.includes('cono'))return'Conos'; if(x.includes('cuerda'))return'Cuerdas'; if(x.includes('tarjet'))return'Tarjetas'; if(x.includes('pañuel')||x.includes('panuel'))return'Pañuelos'; return m||'Otros'}
function inferIntensity(g){let x=normalize(g.description+' '+g.title); if(/velocidad|sprint|resistencia|carrera|perseguir|pillar|relevos|salidas/.test(x))return'Alta'; if(/relaj|vuelta a la calma|estir/.test(x))return'Baja'; return g.intensity||'Media'}
function buildFilters(){
  const configs=[
    ['#ageFilters',['Infantil','Primaria','1º-2º ESO','12-13 años','6º Primaria'],g=>g.age],
    ['#materialFilters',['Sin material','Pelota','Aros','Conos','Cuerdas','Tarjetas','Pañuelos'],g=>materialTag(g.material)],
    ['#spaceFilters',['Pista / gimnasio','Exterior','Aula','Espacio reducido'],g=>g.space],
    ['#intensityFilters',['Baja','Media','Alta'],g=>inferIntensity(g)]
  ];
  for(const [sel,opts,fn] of configs){const el=$(sel);el.innerHTML=opts.map(o=>`<label class="check"><input type="checkbox" value="${esc(o)}"> ${esc(o)}</label>`).join(''); el.dataset.filter=sel}
  $$('.filters input').forEach(x=>x.addEventListener('change',renderGames));
  $('#ocrOnly')?.addEventListener('change',renderGames);
}
function selected(sel){return $$(sel+' input:checked').map(x=>x.value)}
function matches(g){
  const q=normalize($('#search').value), text=normalize([g.title,g.description,g.material,g.age,g.source].join(' '));
  if(q&&!text.includes(q))return false;
  const ages=selected('#ageFilters'), mats=selected('#materialFilters'), spaces=selected('#spaceFilters'), ints=selected('#intensityFilters');
  return (!ages.length||ages.some(v=>normalize(g.age).includes(normalize(v)))) &&
    (!mats.length||mats.includes(materialTag(g.material))) &&
    (!spaces.length||spaces.includes(g.space)) &&
    (!ints.length||ints.includes(inferIntensity(g)));
}
function renderGames(){
  let list=games.filter(matches);
  const sort=$('#sort').value;
  if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));
  if(sort==='za')list.sort((a,b)=>b.title.localeCompare(a.title,'es'));
  $('#resultSummary').textContent=`${list.length} juego${list.length===1?'':'s'} encontrados`;
  const grid=$('#gameGrid'); grid.innerHTML='';
  const tpl=$('#gameCardTemplate');
  list.forEach(g=>{
    const n=tpl.content.cloneNode(true), card=n.querySelector('.game-card');
    card.dataset.id=g.id; card.querySelector('.age').textContent=g.age||'Edad variable';
    card.querySelector('.ocr-badge').classList.toggle('hidden',!g.needsReview);
    card.querySelector('h3').textContent=g.title; card.querySelector('.desc').textContent=g.description;
    card.querySelector('.material').textContent=materialTag(g.material); card.querySelector('.space').textContent=g.space;
    card.querySelector('.intensity').textContent=inferIntensity(g);
    card.querySelector('.source').textContent=`${g.source} · pág. ${g.page||'—'}`;
    card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};
    card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};
    card.onclick=()=>openGame(g.id);
    card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);
    grid.appendChild(n);
  });
  $('#empty').classList.toggle('hidden',list.length>0);
}
function openGame(id){
  const g=games.find(x=>x.id===id); if(!g)return;
  $('#dialogContent').innerHTML=`<div class="eyebrow">FICHA DE JUEGO</div><h2>${esc(g.title)}</h2>
  <div class="detail-meta"><span class="tag">${esc(g.age)}</span><span class="chip">${esc(materialTag(g.material))}</span><span class="chip">${esc(g.space)}</span><span class="chip">${esc(inferIntensity(g))}</span></div>
  <p class="detail-desc">${esc(g.description)}</p><div class="source-box"><strong>Fuente</strong><br>${esc(g.source)} · página ${esc(g.page||'—')}<br><small>Material original: ${esc(g.material)}</small></div>
  <div style="display:flex;gap:10px;margin-top:18px"><button class="primary" onclick="addToSession('${g.id}');gameDialog.close()">Añadir a sesión</button><button class="ghost" onclick="gameDialog.close()">Cerrar</button></div>`;
  gameDialog.showModal();
}
function sessionMetaFromUI(){
  return {
    name:$('#sessionName').value.trim(), date:$('#sessionDate').value, group:$('#sessionGroup').value.trim(),
    students:$('#studentCount').value, duration:$('#sessionDuration').value,
    grouping:$('#sessionGrouping').value, objectives:$('#sessionObjectives').value.trim(),
    competencies:$('#sessionCompetencies').value.trim(), observations:$('#sessionObservations').value.trim()
  };
}
function addToSession(id){
  if(!session.some(x=>x.id===id)){
    session.push({id,phase:'Sin asignar',minutes:'',grouping:$('#sessionGrouping')?.value||'Gran grupo',note:''});
  }
  renderSession(); $('#sessionCount').textContent=session.length;
}
function removeFromSession(i){session.splice(i,1);renderSession();$('#sessionCount').textContent=session.length}
function updateItem(i,key,value){if(session[i]){session[i][key]=value;renderSession(false)}}
function phaseClass(p){return p==='Calentamiento'?'warm':p==='Vuelta a la calma'?'cool':p==='Sin asignar'?'unassigned':''}
function phaseOptions(current){return ['Sin asignar','Calentamiento','Parte principal','Vuelta a la calma'].map(p=>`<option ${p===current?'selected':''}>${p}</option>`).join('')}
function renderSession(scrollTop=true){
  const box=$('#sessionList'); box.innerHTML='';
  if(!session.length){box.innerHTML='<div class="dropzone" id="dropzone">Arrastra aquí juegos para empezar</div>'; bindDrop(); updateTotals(); return}
  session.forEach((item,i)=>{
    const g=games.find(x=>x.id===item.id); if(!g)return;
    const el=document.createElement('div');el.className='session-item';el.draggable=true;
    el.innerHTML=`<div class="drag">☷</div>
      <div><h4>${esc(i+1+'. '+g.title)}</h4><p>${esc(g.age)} · ${esc(materialTag(g.material))}</p>
      <div class="session-total">${esc(item.note||'')}</div></div>
      <div class="session-controls">
        <select class="phase">${phaseOptions(item.phase)}</select>
        <input class="minutes" type="number" min="1" placeholder="min" value="${esc(item.minutes||'')}">
        <input class="note" placeholder="Variante / observación" value="${esc(item.note||'')}">
      </div>
      <button class="remove">×</button>`;
    el.querySelector('.phase').onchange=e=>{item.phase=e.target.value;renderSession(false)};
    el.querySelector('.minutes').onchange=e=>{item.minutes=e.target.value;updateTotals()};
    el.querySelector('.note').oninput=e=>{item.note=e.target.value;el.querySelector('.session-total').textContent=e.target.value};
    el.querySelector('.remove').onclick=()=>removeFromSession(i);
    el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({id:item.id,from:i}));
    el.ondragover=e=>e.preventDefault();
    el.ondrop=e=>{
      e.preventDefault();
      try{
        const d=JSON.parse(e.dataTransfer.getData('text/plain')); 
        if(d.from!==undefined){const moved=session.splice(d.from,1)[0];session.splice(i,0,moved);renderSession(false)}
        else addToSession(d.id||e.dataTransfer.getData('text/plain'));
      }catch(_){}
    };
    box.appendChild(el);
  });
  const dz=document.createElement('div');dz.className='dropzone';dz.textContent='Suelta aquí para añadir otro juego';dz.id='dropzone';box.appendChild(dz);bindDrop();updateTotals();
}
function updateTotals(){
  const mins=session.reduce((a,x)=>a+(Number(x.minutes)||0),0);
  const target=Number($('#sessionDuration')?.value||0);
  $('#sessionTotals').textContent=`${session.length} juegos · ${mins} min${target?` / objetivo ${target} min`:''}`;
}
function bindDrop(){
  const dz=$('#dropzone'); if(!dz)return;
  dz.ondragover=e=>e.preventDefault();
  dz.ondrop=e=>{
    e.preventDefault();
    const raw=e.dataTransfer.getData('text/plain');
    try{const d=JSON.parse(raw);addToSession(d.id)}catch(_){if(raw)addToSession(raw)}
  };
}
function autoPhase(){
  if(!session.length)return;
  const n=session.length;
  session.forEach((x,i)=>{
    x.phase=i===0?'Calentamiento':(i===n-1&&n>2?'Vuelta a la calma':'Parte principal');
    if(!x.minutes)x.minutes=i===0?'10':(i===n-1&&n>2?'5':'10');
  });
  renderSession();
}
function renderSaved(){
  const el=$('#savedList'); el.innerHTML=savedSessions.length?'':'<p class="muted">Aún no hay sesiones guardadas.</p>';
  savedSessions.forEach((s,i)=>{
    const d=document.createElement('div');d.className='saved-card';
    d.innerHTML=`<strong>${esc(s.name||'Sesión sin nombre')}</strong><small>${esc(s.date||'')} · ${esc(s.group||'Sin grupo')} · ${(s.games||[]).length} juegos</small><button>Recuperar</button>`;
    d.querySelector('button').onclick=()=>{
      session=(s.games||[]).map(x=>typeof x==='string'?{id:x,phase:'Sin asignar',minutes:'',grouping:s.grouping||'Gran grupo',note:''}:x);
      $('#sessionName').value=s.name||'';$('#sessionDate').value=s.date||'';$('#sessionGroup').value=s.group||'';
      $('#studentCount').value=s.students||'';$('#sessionDuration').value=s.duration||'';$('#sessionGrouping').value=s.grouping||'Gran grupo';
      $('#sessionObjectives').value=s.objectives||'';$('#sessionCompetencies').value=s.competencies||'';$('#sessionObservations').value=s.observations||'';
      renderSession();switchView('builder')
    };
    el.appendChild(d)
  })
}
function renderSources(){
  $('#sourcesList').innerHTML=sources.map(s=>`<div class="source-row"><strong>${esc(s.display)}</strong><small>${esc(s.name)} · ${s.pages} páginas · ${s.type}${s.loaded_games?` · ${s.loaded_games} juegos extraídos`:''}</small></div>`).join('')
}
function switchView(v){$$('.tab').forEach(x=>x.classList.toggle('active',x.dataset.view===v));$('#libraryView').classList.toggle('hidden',v!=='library');$('#builderView').classList.toggle('hidden',v!=='builder')}
$('#search').addEventListener('input',renderGames);$('#sort').addEventListener('change',renderGames);
$('#filterToggle').onclick=()=>$('#filters').classList.toggle('open');
$('#clearFilters').onclick=()=>{$$('.filters input').forEach(x=>x.checked=false);$('#ocrOnly').checked=false;$('#search').value='';renderGames()};
$$('.tab').forEach(x=>x.onclick=()=>switchView(x.dataset.view));
$('#newSessionBtn').onclick=()=>{
  switchView('builder');session=[];$('#sessionName').value='';$('#sessionGroup').value='';$('#sessionDate').value=new Date().toISOString().slice(0,10);
  $('#studentCount').value='';$('#sessionDuration').value='';$('#sessionGrouping').value='Gran grupo';$('#sessionObjectives').value='';$('#sessionCompetencies').value='';$('#sessionObservations').value='';
  renderSession();$('#sessionCount').textContent=0
};
$('#saveSession').onclick=()=>{
  const meta=sessionMetaFromUI(); const s={...meta,games:[...session]};
  savedSessions.unshift(s);localStorage.setItem('motorlab_sessions',JSON.stringify(savedSessions));renderSaved();alert('Sesión guardada.')
};
$('#printSession').onclick=()=>window.print();
$('#autoPhaseBtn').onclick=autoPhase;
$('#sessionDuration').oninput=updateTotals;

$('#sourcesBtn').onclick=()=>sourcesDialog.showModal();
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();$('#search').focus()}});
init();

if('serviceWorker' in navigator){navigator.serviceWorker.register('sw.js').catch(()=>{});}
