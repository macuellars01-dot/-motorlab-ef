let games=[], sources=[], session=[], savedSessions=[], units=[];
let baseCatalogCount=0;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const KEYS={sessions:'motorlab_sessions',units:'motorlab_units',overrides:'motorlab_game_overrides',deleted:'motorlab_deleted_games',deletedSessions:'motorlab_deleted_sessions',deletedUnits:'motorlab_deleted_units',meta:'motorlab_game_meta',settings:'motorlab_sync_settings',sync:'motorlab_sync_meta'};
const DEFAULT_API='https://ugreen-tailscale.tailfc6c36.ts.net:8443/motorlab';
const CATALOG_VERSION='2026-10-04T15:45:00.000Z';
const RECOVERED_J6A12={
  1:['El Pelele','Sin material','Parejas','Conocer el esquema e imagen corporal.','Por parejas, un alumno tumbado recibe movimientos guiados en distintas partes del cuerpo; después se cambian los roles.'],
  2:['La Sombra','Sin material','Parejas','Conocer el esquema e imagen corporal.','Un alumno se mueve libremente y su compañero imita sus movimientos como si fuera su sombra; después se cambian los roles.'],
  103:['Pies en alto','Sin material','Gran grupo','Desplazamientos y carrera','El profesor indica posiciones que deben adoptar manteniendo siempre los pies elevados; quien no lo consigue puede ser capturado.'],
  104:['Las Picas','Picas','Gran grupo','Coordinación','En círculo, cada alumno suelta su pica a una señal y se desplaza para recoger la de su compañero siguiendo una rotación.'],
  105:['Pasar la corriente','Sin material','Pequeños grupos','Coordinación','En círculo y cogidos de las manos, un alumno inicia una ondulación con el brazo que los demás transmiten de forma coordinada.'],
  106:['Tocarse las rodillas','Sin material','Gran grupo','Desplazamientos y carrera','Cada alumno intenta tocar las rodillas de otros compañeros evitando que le toquen las suyas.'],
  135:['Las Muñecas','Sin material','Parejas','Equilibrio','Por parejas, uno representa una muñeca que se mueve y va deteniéndose progresivamente cuando se acaba la cuerda imaginaria.'],
  136:['Combate Pirata','Bancos/vallas','Parejas','Equilibrio','Dos alumnos sobre un banco sueco intentan empujarse con una mano sin caer.'],
  137:['Los Saquitos','Otros','Pequeños grupos','Equilibrio','Por relevos, cada alumno transporta un saquito sobre la cabeza hasta una meta y se lo entrega al siguiente.'],
  138:['La Culebra','Cuerdas/combas','Gran grupo','Equilibrio','Dos grandes cuerdas forman recorridos curvos que los alumnos deben pisar manteniendo el equilibrio.'],
  155:['Lanzamientos de bolos','Balones/pelotas','Pequeños grupos','Lanzamiento','Se lanzan balones rodando hacia botellas colocadas a distancia y se puntúa según las botellas derribadas.'],
  156:['Las Cuatro Porterías','Balones/pelotas','Gran grupo','Coordinación','Varios equipos juegan alrededor de cuatro porterías, defendiendo dos e intentando marcar en las otras dos.'],
  157:['De bote en bote','Balones/pelotas','Pequeños grupos','Conducción y manejo','Los jugadores trasladan el balón botándolo hasta la fila contraria y cambian de grupo al completar el recorrido.'],
  158:['Tulipán botando','Balones/pelotas','Pequeños grupos','Lanzamiento','Cinco jugadores con balón intentan tocar a los demás; quien es tocado queda en posición de tulipán hasta ser liberado.'],
  239:['El Enano Saltarín','Sin material','Gran grupo','Saltos','Un perseguidor intenta alcanzar a los demás desplazándose todos mediante saltos o pasos en cuclillas.'],
  240:['Los Saltadores y los Osos','Sin material','Gran grupo','Saltos','Unos alumnos forman los osos y otros intentan saltar sobre ellos evitando al guardián.'],
  241:['Perros y Gatos','Sin material','Gran grupo','Giros','Dos equipos se colocan enfrentados y, según se nombre perro o gato, uno persigue al otro hasta una línea.'],
  242:['Date la vuelta','Sin material','Gran grupo','Giros','Desde cuadrupedia, los alumnos practican el giro levantando simultáneamente mano y pie del mismo lado.'],
  279:['Provocar la palmada','Balones/pelotas','Pequeños grupos','Lanzamiento','Un jugador situado en el centro lanza el balón a los compañeros, que deben dar una palmada antes de recibirlo.'],
  280:['Tiro al bote','Balones/pelotas','Pequeños grupos','Lanzamiento','Los jugadores lanzan balones intentando sacar una botella situada dentro de un círculo.'],
  281:['El Sobre','Balones/pelotas','Gran grupo','Lanzamiento','Desde el centro del círculo se lanza el balón hacia arriba nombrando a un compañero, que debe correr para recibirlo antes de que caiga.'],
  282:['El Mareo','Balones/pelotas','Gran grupo','Oposición y persecución','Dos grupos se enfrentan: uno mantiene la posesión del balón mientras el otro intenta interceptarlo.'],
  299:['¿Quién te dio el pelotazo?','Balones/pelotas','Gran grupo','Lanzamiento','Los jugadores se pasan la pelota ocultándola de un compañero situado en el centro, que debe descubrir quién le lanzó.'],
  300:['De campo a campo','Balones/pelotas','Pequeños grupos','Lanzamiento','Cuatro grupos ocupan tres zonas y los extremos se pasan la pelota evitando que los jugadores centrales la intercepten.'],
  301:['Los Veleros','Globos','Pequeños grupos','Conducción y manejo','Cada grupo transporta un globo por distintas zonas usando sucesivamente soplidos, pie, manos y cabeza.'],
  302:['Perritos falderos','Globos','Pequeños grupos','Conducción y manejo','Los alumnos, a cuatro patas, transportan pequeños globos con la boca hasta sus compañeros.'],
  303:['Tomadura de pelo','Picas','Gran grupo','Conducción y manejo','En círculo se pasan una pica por detrás de la espalda mientras el jugador central intenta descubrir quién la tiene.'],
  304:['Balón cangrejo','Balones/pelotas','Pequeños grupos','Conducción y manejo','Los equipos sentados en fila se pasan un balón por encima de la cabeza hasta hacerlo llegar al final.'],
  305:['Llenar y vaciar','Balones/pelotas','Gran grupo','Conducción y manejo','Dos grupos trasladan balones de una caja a otra, pasándolos de uno en uno por todos los jugadores.'],
  306:['Balón sprint','Balones/pelotas','Individual','Conducción y manejo','Cada jugador conduce un balón hasta una prenda situada al otro extremo, se la pone y regresa conduciendo el balón con el pie.'],
  337:['Seguir a la madre','Bancos/vallas','Gran grupo','Coordinación','Un alumno realiza un recorrido variado por los aparatos y el resto imita sus movimientos y gestos.'],
  338:['Efecto mueble','Sin material','Parejas','Ritmo y expresión','Por parejas, uno representa un mueble y el otro imita cómo se utiliza.'],
  339:['Los Animales','Sin material','Individual','Ritmo y expresión','Los alumnos se desplazan imitando los animales que propone el profesor, incluyendo sus movimientos y sonidos.'],
  340:['Expresividad','Sin material','Parejas','Ritmo y expresión','Un alumno expresa corporalmente una sensación o estado de ánimo y su compañero debe reaccionar representando lo contrario.'],
  361:['El Flautista de Hamelín','Sin material','Pequeños grupos','Ritmo y expresión','Los grupos representan mediante mímica el cuento del flautista y sus personajes.'],
  362:['El Castillo Encantado','Sin material','Pequeños grupos','Ritmo y expresión','Los grupos representan mediante mímica personajes y acciones propias de un castillo encantado.'],
  363:['Yo vi','Sin material','Pequeños grupos','Ritmo y expresión','Un alumno representa mediante mímica algo que vio de camino al colegio y los demás intentan adivinarlo.'],
  364:['La Familia','Sin material','Pequeños grupos','Ritmo y expresión','Cada alumno representa a un miembro de una familia y el grupo dramatiza una situación familiar.'],
  385:['Los Astronautas','Sin material','Pequeños grupos','Ritmo y expresión','Grupos de alumnos representan un viaje a un planeta desconocido asumiendo papeles como astronautas, robots o alienígenas.'],
  386:['El Orador','Sin material','Parejas','Ritmo y expresión','En parejas, uno habla mientras el otro, situado detrás, mueve los brazos como si fueran los del orador.'],
  387:['Cuéntame un chiste','Sin material','Pequeños grupos','Ritmo y expresión','Cada grupo cuenta un chiste al resto y después lo representa mediante expresión corporal.'],
  388:['¿Quién dice la frase?','Sin material','Parejas','Ritmo y expresión','Un alumno inventa una frase y la representa mediante mímica para que su compañero la adivine.'],
  389:['El Charlatán','Otros','Pequeños grupos','Ritmo y expresión','Cada grupo representa una escena en la que un alumno vende un objeto explicando su utilidad y fabricación.'],
  390:['Semana Santa','Material variado','Gran grupo','Ritmo y expresión','El grupo representa una procesión de Semana Santa incorporando sus distintos personajes y elementos.']
};
function applyRecoveredJ6a12(){
  const pages=new Set(Object.keys(RECOVERED_J6A12).map(Number));
  games=games.filter(g=>!(g?.source==='juegos 6a12anos.pdf'&&String(g?.title||'').startsWith('OCR')&&pages.has(Number(g?.page))));
  const existing=new Set(games.map(g=>g.id));
  Object.entries(RECOVERED_J6A12).forEach(([num,meta])=>{
    const id=`j6a12-recovered-${String(num).padStart(3,'0')}`;
    if(existing.has(id))return;
    games.push(normalizeCatalogRecord({
      id,title:meta[0],age:'6-12 años',material:meta[1],description:meta[4],
      source:'juegos 6a12anos.pdf',page:({
        1:3,2:3,103:29,104:29,105:29,106:29,135:37,136:37,137:37,138:37,
        155:42,156:42,157:42,158:42,239:64,240:64,241:64,242:64,
        279:74,280:74,281:74,282:74,299:79,300:79,301:79,302:79,303:80,304:80,305:80,306:80,
        337:90,338:90,339:90,340:90,361:96,362:96,363:96,364:96,
        385:102,386:102,387:102,388:102,389:103,390:103
      })[num],
      space:'Pista / gimnasio',intensity:'Media',
      groupings:[meta[2]],objectives:[meta[3]],classificationSource:'recuperación directa de la ficha original del PDF',
      needsReview:true,confidence:'title-and-summary-recovered',kind:'game'
    }));
    existing.add(id);
  });
}function applyRecoveredJ6a12(){
  const pages=new Set(Object.keys(RECOVERED_J6A12).map(Number));
  games=games.filter(g=>!(g?.source==='juegos 6a12anos.pdf'&&String(g?.title||'').startsWith('OCR')&&pages.has(Number(g?.page))));
  const existing=new Set(games.map(g=>g.id));
  Object.entries(RECOVERED_J6A12).forEach(([page,items])=>items.forEach(([num,title])=>{
    const id=`j6a12-recovered-${String(num).padStart(3,'0')}`;
    if(existing.has(id))return;
    games.push(normalizeCatalogRecord({
      id,title,age:'6-12 años',material:'No especificado',
      description:'Título recuperado directamente de la ficha original del PDF; descripción pendiente de segmentación individual.',
      source:'juegos 6a12anos.pdf',page:Number(page),space:'Pista / gimnasio',intensity:'Media',
      groupings:[],objectives:[],classificationSource:'recuperación directa del título de la ficha PDF',
      needsReview:true,confidence:'title-recovered',kind:'game'
    }));
    existing.add(id);
  }));
}
let syncState='idle', syncTimer=null;

function read(k,f){try{return JSON.parse(localStorage.getItem(k))??f}catch(_){return f}}
function write(k,v){localStorage.setItem(k,JSON.stringify(v))}
function now(){return new Date().toISOString()}
function uid(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`}
function getSettings(){return {...{url:DEFAULT_API,token:''},...read(KEYS.settings,{})}}
function setSyncState(state,msg){syncState=state;const el=$('#syncStatus');if(!el)return;const map={idle:['🟢','Sincronizado'],pending:['🟠','Cambios pendientes'],syncing:['🔄','Sincronizando…'],error:['🔴','Error']};const [icon,label]=map[state]||map.idle;el.textContent=`${icon} ${msg||label}`;el.className=`sync-status ${state}`}
function scheduleSync(){clearTimeout(syncTimer);const s=getSettings();if(!s.token)return;syncTimer=setTimeout(()=>syncNow({silent:true}),1200)}
function markPending(){if(syncState!=='syncing')setSyncState('pending');scheduleSync()}

async function init(){
  try{
    const gameResponse=await fetch('data/games.json',{cache:'no-store'});
    if(!gameResponse.ok)throw new Error(`games.json ${gameResponse.status}`);
    games=await gameResponse.json();
    if(!Array.isArray(games))throw new Error('games.json no es un array');
    games=games.map(normalizeCatalogRecord);
    applyRecoveredJ6a12();
    baseCatalogCount=games.length;
    sanitizeLocalGameState();

    // sources.json is optional: if it fails, the game catalog still loads.
    try{
      const sourceResponse=await fetch('data/sources.json',{cache:'no-store'});
      sources=sourceResponse.ok?await sourceResponse.json():[];
      if(!Array.isArray(sources))sources=[];
    }catch(sourceError){
      console.warn('No se pudo cargar sources.json:',sourceError);
      sources=[];
    }

    savedSessions=read(KEYS.sessions,[]); units=read(KEYS.units,[]);
    applyGameLocalState();
    $('#totalGames').textContent=games.length;
    $('#sessionCount').textContent=session.length;
    buildFilters(); renderGames(); renderSaved(); renderUnits(); renderSources(); renderSession();
    $('#sessionDate').value=new Date().toISOString().slice(0,10);
    loadSyncSettingsUI(); setSyncState(read(KEYS.sync,{status:'idle'}).status||'idle');
    updateTotals();

    // Catalog is rendered before synchronization starts.
    if(getSettings().token) syncNow({silent:true}); else setSyncState('pending');
    window.addEventListener('online',()=>syncNow({silent:true}));
    document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&getSettings().token)syncNow({silent:true})});
    setInterval(()=>{if(document.visibilityState==='visible'&&getSettings().token&&syncState!=='syncing')syncNow({silent:true})},60000);
  }catch(e){
    console.error(e);
    $('#resultSummary').textContent='Error al cargar el catálogo';
    $('#empty')?.classList.remove('hidden');
    setSyncState('error');
  }
}
function gameContentDiffers(a,b){
  const fields=['title','description','age','material','space','intensity','source','page','needsReview','manual'];
  return fields.some(k=>JSON.stringify(a?.[k])!==JSON.stringify(b?.[k]));
}
function sanitizeLocalGameState(){
  const baseIds=new Set(games.map(g=>g.id));
  const rawOverrides=read(KEYS.overrides,{});
  const cleanOverrides={};
  Object.values(rawOverrides).forEach(g=>{
    if(!g?.id)return;
    if(g.manual||baseIds.has(g.id))cleanOverrides[g.id]=g;
  });
  if(JSON.stringify(Object.keys(cleanOverrides).sort())!==JSON.stringify(Object.keys(rawOverrides).sort()))write(KEYS.overrides,cleanOverrides);
  const deleted=read(KEYS.deleted,[]);
  const validDeleted=Array.isArray(deleted)?deleted.filter(id=>baseIds.has(id)):[];
  if(JSON.stringify(validDeleted)!==JSON.stringify(deleted))write(KEYS.deleted,validDeleted);
}
function cleanGameOverrides(){
  const raw=read(KEYS.overrides,{});
  const clean={};
  const baseById=new Map(games.map(g=>[g.id,g]));
  Object.values(raw).forEach(g=>{
    if(!g?.id)return;
    const base=baseById.get(g.id);
    if(g.manual || (base && gameContentDiffers(g,base)))clean[g.id]=g;
  });
  if(Object.keys(clean).length!==Object.keys(raw).length)write(KEYS.overrides,clean);
  return clean;
}
function applyGameLocalState(){
  const overrides=cleanGameOverrides(), deleted=new Set(read(KEYS.deleted,[]));
  games=games.filter(g=>!deleted.has(g.id)).map(g=>({...g,...(overrides[g.id]||{}),updatedAt:(overrides[g.id]?.updatedAt||g.updatedAt||CATALOG_VERSION)}));
  Object.values(overrides).forEach(g=>{if(g.manual&&!games.some(x=>x.id===g.id)&&!deleted.has(g.id))games.push(g)});
}
function persistGame(g){const o=read(KEYS.overrides,{});o[g.id]={...g,updatedAt:g.updatedAt||now()};write(KEYS.overrides,o);markPending()}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
const MOTOR_AGES=['Infantil','Infantil y Primaria','1º-2º Primaria','3º-4º Primaria','3º-6º Primaria','5º-6º Primaria','Primaria','Primaria y Secundaria','Secundaria','1º-6º Primaria','1º-4º Primaria','No especificada'];
const MOTOR_MATERIALS=['Sin material','Balones/pelotas','Aros','Conos','Cuerdas/combas','Picas','Pañuelos/petos','Colchonetas','Raquetas','Tizas','Globos','Tarjetas','Bancos/vallas','Música','Material variado','Otros','No especificado'];
const MOTOR_SPACES=['Aula','Pista/gimnasio','Pista/exterior','Patio/exterior','Espacio delimitado','Espacio amplio','Otros','No especificado'];
const MOTOR_INTENSITIES=['Baja','Media','Alta','No especificada'];
const MOTOR_GROUPINGS=['Individual','Parejas','Pequeños grupos','Gran grupo','No especificado'];
const MOTOR_OBJECTIVES=['Lanzamiento','Saltos','Giros','Desplazamientos y carrera','Equilibrio','Coordinación','Conducción y manejo','Percepción y atención','Ritmo y expresión','Cooperación','Oposición y persecución','Predeporte','Relajación y vuelta a la calma','No especificado'];
const MOTOR_CONTENT_STATES=['Verificado','Requiere revisión','OCR pendiente'];
function normalizeCatalogRecord(g){
  const out={...g};
  const recoveredTitle=recoveredReviewTitle(out);
  if(recoveredTitle)out.title=recoveredTitle;
  out.ageCategories=ageCategories(out);
  out.materialCategories=materialCategories(out);
  out.spaceCategories=spaceCategories(out);
  out.intensityCategory=intensityCategory(out);
  out.groupingCategories=groupingValues(out);
  out.objectiveCategories=objectiveValues(out);
  out.contentState=contentState(out);
  out.classificationConfidence=out.contentState==='Verificado'?'alta':out.contentState==='Requiere revisión'?'media':'baja';
  return out;
}
function ageCategories(g){
  if(Array.isArray(g?.ageCategories)&&g.ageCategories.length)return g.ageCategories;
  const x=normalize(g?.age);
  if(!x)return['No especificada'];
  const out=[]; const add=v=>{if(v&&!out.includes(v))out.push(v)};
  if(/12\s*[-a]\s*13/.test(x))add('5º-6º Primaria');
  if(/6\s*[-a]\s*12/.test(x))add('1º-6º Primaria');
  if(/8\s*[-a]\s*12/.test(x))add('3º-6º Primaria');
  if(/6\s*[-a]\s*10/.test(x))add('1º-4º Primaria');
  if(/6\s*[-a]\s*8/.test(x))add('1º-2º Primaria');
  if(/4\s*[-a]\s*10/.test(x))add('Infantil y Primaria');
  if(/a partir de 5º|5º.*primaria/.test(x))add('5º-6º Primaria');
  if(/a partir de 3º|3º.*primaria/.test(x))add('3º-4º Primaria');
  if(/primaria.*secundaria|secundaria.*primaria|eso/.test(x))add('Primaria y Secundaria');
  if(/infantil.*primaria|primaria.*infantil/.test(x))add('Infantil y Primaria');
  if(x==='primaria')add('Primaria');
  if(x.includes('infantil')&&!x.includes('primaria'))add('Infantil');
  if(x==='secundaria')add('Secundaria');
  return out.length?out:['No especificada'];
}
function materialCategories(g){if(Array.isArray(g?.materialCategories)&&g.materialCategories.length)return g.materialCategories;const raw=normalize(typeof g==='string'?g:g?.material);if(!raw||raw==='no especificado')return['No especificado'];if(/ningun|sin material|ninguno/.test(raw))return['Sin material'];const out=[];const add=(re,label)=>{if(re.test(raw)&&!out.includes(label))out.push(label)};add(/pelot|balon|bola\b|baloncesto|futbol/,'Balones/pelotas');add(/aro/,'Aros');add(/cono/,'Conos');add(/cuerda|comba/,'Cuerdas/combas');add(/pica|per[té]iga/,'Picas');add(/pañuel|panuel|peto|chaleco|paliacat/,'Pañuelos/petos');add(/colchoneta/,'Colchonetas');add(/raqueta|pala(s)?\b/,'Raquetas');add(/tiza|yeso|gises?\b/,'Tizas');add(/globo/,'Globos');add(/tarjet|cartulina|cartas?|baraja/,'Tarjetas');add(/banco|valla/,'Bancos/vallas');add(/musica|musical|cd|cassette|cinta musical/,'Música');add(/variado|diverso|varios materiales|material diverso|todo tipo de material/,'Material variado');return out.length?out:['Otros']}
function materialTag(g){return materialCategories(g)[0]||'No especificado'}
function spaceCategories(g){
  if(Array.isArray(g?.spaceCategories)&&g.spaceCategories.length)return g.spaceCategories;
  const x=normalize(typeof g==='string'?g:g?.space);
  if(!x||x==='no especificado')return['No especificado'];
  const out=[]; const add=v=>{if(!out.includes(v))out.push(v)};
  if(x.includes('aula')||x.includes('salon')||x.includes('sala'))add('Aula');
  if(x.includes('pista')||x.includes('gimnasio')||x.includes('cancha')||x.includes('campo')){
    add(x.includes('exterior')||x.includes('aire libre')?'Pista/exterior':'Pista/gimnasio');
  }
  if(x.includes('patio'))add('Patio/exterior');
  if(x.includes('exterior')&&!out.includes('Pista/exterior')&&!out.includes('Patio/exterior'))add('Pista/exterior');
  if(x.includes('delimit')||x.includes('cuadrante'))add('Espacio delimitado');
  if(x.includes('amplio')||x.includes('libre')||x.includes('metros')||x.includes('cuadrad'))add('Espacio amplio');
  return out.length?out:['Otros'];
}
function spaceTag(g){return spaceCategories(g)[0]||'No especificado'}
function intensityCategory(g){if(g?.intensityCategory)return g.intensityCategory;const x=normalize(g?.intensity);if(x==='baja')return'Baja';if(x==='alta')return'Alta';if(x==='media'&&g?.intensitySource==='manual')return'Media';return'No especificada'}
function inferIntensity(g){return intensityCategory(g)}
function isGenericOcrRecord(g){return /^ocr\s*(?:—|-|:|pagina|página|$)/i.test(String(g?.title||'').trim())}
function recoveredReviewTitle(g){
  const src=String(g?.source||''),t=String(g?.title||'').trim();
  const d=String(g?.description||'');
  const generic=isGenericOcrRecord(g);

  const clean=x=>{
    x=String(x||'').trim()
      .replace(/^[-–—:.\s]+|[\s.\-–—|]+$/g,'')
      .replace(/\s+/g,' ');
    if(x.length<4||x.length>70||/[<>[\]|{}@#%]/.test(x)||/\d/.test(x))return'';
    if(/^(juego|actividad|parte principal|parte inicial|c[oó]digo|relevos|ocr)$/i.test(x))return'';
    if(/^(larma y elgato|la leña)$/i.test(x))return'';
    return x;
  };

  // Los registros OCR genéricos no deben convertirse en verificados solo
  // porque el propio título diga "OCR — ...". Primero intentamos recuperar
  // un nombre explícito desde el texto de la página.
  if(src==='juegos 6a12anos.pdf' && generic){
    // Este libro imprime varios juegos por página. Recuperamos únicamente
    // el primer nombre que aparece detrás de un marcador "Juego n.º ...".
    const re=/\b(?:juego|juegon|suego)\s*n?[^A-Za-z0-9]{0,8}\d{1,3}\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ0-9 ,./()'’\-]{2,65})(?=\s+(?:Lugar|Objetivo|Material|Organización|Bloque|Habilidades|Etapa|Gráfico|Juego|Juegon|suego)|[.;]|$)/gi;
    let m;
    while((m=re.exec(d))){
      const x=clean(m[1]);
      if(x && /[A-ZÁÉÍÓÚÜÑ]{3}/.test(x))return x;
    }
    return'';
  }

  // Si el título importado no es genérico, solo lo recuperamos en fuentes
  // donde el pipeline ya extrae nombres de juegos de forma fiable.
  if(!generic && src.startsWith('215 Juegos')){
    let x=clean(t);
    if(x)return x;
    const m=d.match(/—\s*\d+\s+([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s,-]{3,60})(?:\s{2,}|Establecer|Se coloca|Libres)/i);
    if(m){x=clean(m[1]);if(x)return x}
    return'';
  }

  if(!generic && src.startsWith('1001 ejercicios')){
    let x=t.replace(/\s*[|]?[ ]*\d+\s*$/,'').trim();
    if(/^Tirar las banderas invencibles/.test(x))x='Tirar las banderas invencibles';
    if(x==='Los 5 agujeros')return x;
    return clean(x);
  }

  // En el resto de fuentes, no promovemos una ficha OCR genérica a
  // verificada a partir de fragmentos entre comillas: suelen ser trozos
  // de instrucciones y generan falsos nombres. Quedan en revisión manual.
  if(generic)return'';

  return'';
}
function contentState(g){
  // A recovered high-confidence title takes precedence over the imported review flag.
  // Some normalized catalog records already contain contentState="Requiere revisión";
  // keeping that value first would make the recovery logic invisible in the UI.
  if(g?.needsReview&&recoveredReviewTitle(g))return'Verificado';
  if(g?.contentState&&MOTOR_CONTENT_STATES.includes(g.contentState))return g.contentState;
  if(isGenericOcrRecord(g))return'OCR pendiente';
  if(g?.needsReview)return'Requiere revisión';
  return'Verificado'
}
function uniqSorted(values){return [...new Set(values.filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'es',{sensitivity:'base'}))}
function sourceLabel(g){return g.source||'Fuente no especificada'}
function groupingValues(g){return Array.isArray(g?.groupingCategories)&&g.groupingCategories.length?g.groupingCategories:(Array.isArray(g?.groupings)&&g.groupings.length?g.groupings:['No especificado'])}
function objectiveValues(g){return Array.isArray(g?.objectiveCategories)&&g.objectiveCategories.length?g.objectiveCategories:(Array.isArray(g?.objectives)&&g.objectives.length?g.objectives:['No especificado'])}
function buildFilters(){const sources=uniqSorted([...games.map(sourceLabel),'Creación propia']);const configs=[['ageFilters',MOTOR_AGES],['materialFilters',MOTOR_MATERIALS],['spaceFilters',MOTOR_SPACES],['intensityFilters',MOTOR_INTENSITIES],['sourceFilters',sources],['groupingFilters',MOTOR_GROUPINGS],['objectiveFilters',MOTOR_OBJECTIVES],['contentStateFilters',MOTOR_CONTENT_STATES]];for(const [id,opts] of configs){const h=opts.map(o=>`<label class="check"><input type="checkbox" value="${esc(o)}"> ${esc(o)}</label>`).join('');const a=$('#'+id),b=$('#'+id+'Dialog');if(a)a.innerHTML=h;if(b)b.innerHTML=h}$$('input[type="checkbox"]').forEach(x=>x.addEventListener('change',syncFilterControls));console.info('[MotorLab] Filtros v15.0:',configs.map(([id,opts])=>[id,opts.length]))}
function syncFilterControls(e){
  const el=e?.target;
  if(el?.id==='ocrOnly'||el?.id==='ocrOnlyDialog'){const other=el.id==='ocrOnly'?$('#ocrOnlyDialog'):$('#ocrOnly');if(other)other.checked=el.checked}
  const id=el?.closest('[id]')?.id;
  if(!id)return;
  const map={ageFilters:'ageFiltersDialog',materialFilters:'materialFiltersDialog',spaceFilters:'spaceFiltersDialog',intensityFilters:'intensityFiltersDialog',sourceFilters:'sourceFiltersDialog',groupingFilters:'groupingFiltersDialog',objectiveFilters:'objectiveFiltersDialog',contentStateFilters:'contentStateFiltersDialog'};
  const pair=map[id]||Object.keys(map).find(k=>map[k]===id);
  if(!pair)return;
  const a=id.startsWith('age')||id.endsWith('Filters')?$('#'+id):null;
  const base=id.endsWith('Dialog')?pair:id; const otherId=id.endsWith('Dialog')?pair:id+'Dialog';
  const other=$('#'+otherId); if(other)other.querySelectorAll('input').forEach(x=>x.checked=el.value===x.value?el.checked:x.checked);
  renderGames();
}
function clearAllFilters(){
  $$('#filters input[type="checkbox"], #filterDialog input[type="checkbox"]').forEach(x=>x.checked=false);
  $('#search').value=''; renderGames();
}

function selected(sel){return $$(sel+' input:checked').map(x=>x.value)}
function matches(g){const q=normalize($('#search').value);const text=normalize([g.title,g.description,g.material,g.age,g.source,...groupingValues(g),...objectiveValues(g)].join(' '));if(q&&!text.includes(q))return false;const ages=selected('#ageFilters'),mats=selected('#materialFilters'),spaces=selected('#spaceFilters'),ints=selected('#intensityFilters'),srcs=selected('#sourceFilters'),groups=selected('#groupingFilters'),objs=selected('#objectiveFilters'),states=selected('#contentStateFilters');const state=contentState(g),reviewOnly=$('#ocrOnly')?.checked;if(reviewOnly){if(!g.needsReview)return false}else if(!states.length&&state==='OCR pendiente')return false;if(states.length&&!states.includes(state))return false;return(!ages.length||ages.some(v=>ageCategories(g).includes(v)))&&(!mats.length||mats.some(v=>materialCategories(g).includes(v)))&&(!spaces.length||spaces.some(v=>spaceCategories(g).includes(v)))&&(!ints.length||ints.includes(intensityCategory(g)))&&(!srcs.length||srcs.includes(sourceLabel(g)))&&(!groups.length||groups.some(v=>groupingValues(g).includes(v)))&&(!objs.length||objs.some(v=>objectiveValues(g).includes(v)))}
function renderGames(){let list=games.filter(matches);const sort=$('#sort').value;if(sort==='az')list.sort((a,b)=>a.title.localeCompare(b.title,'es'));if(sort==='za')list.sort((a,b)=>b.title.localeCompare(a.title,'es'));const verified=games.filter(g=>contentState(g)==='Verificado').length;const review=games.filter(g=>contentState(g)==='Requiere revisión').length;const pending=games.filter(g=>contentState(g)==='OCR pendiente').length;const manualGames=games.filter(g=>g.manual);const extra=games.length-baseCatalogCount;const extraLabel=extra>0?` · ${extra} añadido${extra===1?'':'s'} manual${extra===1?'':'es'}: ${manualGames.map(g=>String(g.title||g.id)).join(' · ')}`:'';$('#resultSummary').textContent=`${list.length} juego${list.length===1?'':'s'} encontrados · ${verified} verificados · ${review} en revisión · ${pending} OCR pendientes${extraLabel}`;const grid=$('#gameGrid');grid.innerHTML='';const tpl=$('#gameCardTemplate');list.forEach(g=>{const n=tpl.content.cloneNode(true),card=n.querySelector('.game-card');card.dataset.id=g.id;card.querySelector('.age').textContent=ageCategories(g)[0]||'Edad variable';card.querySelector('.ocr-badge').classList.toggle('hidden',contentState(g)==='Verificado');card.querySelector('.ocr-badge').textContent=contentState(g)==='OCR pendiente'?'OCR · pendiente':'Revisar ficha';card.querySelector('.custom-badge').classList.toggle('hidden',!g.manual);card.querySelector('h3').textContent=g.title;card.querySelector('.desc').textContent=g.description;card.querySelector('.material').textContent=materialCategories(g).slice(0,2).join(' · ');card.querySelector('.space').textContent=spaceTag(g);card.querySelector('.intensity').textContent=intensityCategory(g);card.querySelector('.source').textContent=`${sourceLabel(g)} · pág. ${g.page||'—'}`;card.querySelector('.chips').insertAdjacentHTML('beforeend',groupingValues(g).slice(0,1).map(v=>`<span class="chip grouping-chip">${esc(v)}</span>`).join(''));card.querySelector('.chips').insertAdjacentHTML('beforeend',objectiveValues(g).slice(0,2).map(v=>`<span class="chip objective-chip">${esc(v)}</span>`).join(''));card.querySelector('.add-btn').onclick=e=>{e.stopPropagation();addToSession(g.id)};card.querySelector('.details').onclick=e=>{e.stopPropagation();openGame(g.id)};card.onclick=()=>openGame(g.id);card.ondragstart=e=>e.dataTransfer.setData('text/plain',g.id);grid.appendChild(n)});$('#empty').classList.toggle('hidden',list.length>0);$('#totalGames').textContent=games.filter(g=>contentState(g)!=='OCR pendiente').length}
function openGame(id){const g=games.find(x=>x.id===id);if(!g)return;$('#dialogContent').innerHTML=`<div class="eyebrow">FICHA DE JUEGO</div><h2>${esc(g.title)}</h2><div class="detail-meta"><span class="tag">${esc(g.age||'Edad variable')}</span><span class="chip">${esc(materialTag(g))}</span><span class="chip">${esc(g.space||'')}</span><span class="chip">${esc(inferIntensity(g))}</span>${groupingValues(g).map(v=>`<span class="chip">👥 ${esc(v)}</span>`).join('')}${objectiveValues(g).map(v=>`<span class="chip">🎯 ${esc(v)}</span>`).join('')}</div><p class="detail-desc">${esc(g.description||'')}</p><div class="source-box"><strong>Fuente</strong><br>${esc(g.source||'MotorLab')} · página ${esc(g.page||'—')}<br><small>Material original: ${esc(g.material||'')}</small></div><div class="dialog-actions"><button class="primary" id="editGameBtn">✏️ Editar ficha</button><button class="primary secondary" id="addGameSessionBtn">＋ Añadir a sesión</button><button class="ghost" onclick="gameDialog.close()">Cerrar</button></div>`;$('#editGameBtn').onclick=()=>{gameDialog.close();openGameEditor(g.id)};$('#addGameSessionBtn').onclick=()=>{addToSession(g.id);gameDialog.close()};gameDialog.showModal()}
function openGameEditor(id=null){const g=id?games.find(x=>x.id===id):{id:uid('manual'),title:'',description:'',age:'Primaria',material:'Sin material',space:'Pista / gimnasio',intensity:'Media',source:'Creación propia',page:'—',manual:true,needsReview:false,updatedAt:now()};if(!g)return;$('#editGameDialogContent').innerHTML=`<div class="dialog-head"><div><div class="eyebrow">${id?'EDITAR FICHA':'NUEVO JUEGO'}</div><h2>${id?'Editar juego':'Añadir juego al repositorio'}</h2></div><button class="icon" onclick="editGameDialog.close()">×</button></div><form id="gameForm" class="form-grid"><label>Nombre*<input name="title" required value="${esc(g.title)}"></label><label>Edad<input name="age" value="${esc(g.age)}"></label><label>Material<input name="material" value="${esc(g.material)}"></label><label>Espacio<input name="space" value="${esc(g.space)}"></label><label>Intensidad<select name="intensity"><option ${g.intensity==='Baja'?'selected':''}>Baja</option><option ${g.intensity==='Media'?'selected':''}>Media</option><option ${g.intensity==='Alta'?'selected':''}>Alta</option></select></label><label>Fuente<input name="source" value="${esc(g.source)}"></label><label>Página<input name="page" value="${esc(g.page||'—')}"></label><label class="full">Descripción / reglas<textarea name="description" rows="7" required>${esc(g.description)}</textarea></label><div class="form-actions full"><button type="button" class="ghost" onclick="editGameDialog.close()">Cancelar</button><button class="primary">Guardar ficha</button></div></form>`;$('#gameForm').onsubmit=e=>{e.preventDefault();const f=new FormData(e.target);const updated={...g,title:f.get('title').trim(),age:f.get('age').trim(),material:f.get('material').trim(),space:f.get('space').trim(),intensity:f.get('intensity'),source:(g.manual||!id)?'Creación propia':(f.get('source').trim()||'Fuente no especificada'),page:f.get('page').trim()||'—',description:f.get('description').trim(),updatedAt:now(),manual:g.manual||!id};games=games.map(x=>x.id===updated.id?updated:x);if(!id)games.push(updated);persistGame(updated);renderGames();editGameDialog.close();openGame(updated.id)};editGameDialog.showModal()}
function sessionMetaFromUI(){return{name:$('#sessionName').value.trim(),date:$('#sessionDate').value,group:$('#sessionGroup').value.trim(),students:$('#studentCount')?.value||'',duration:$('#sessionDuration')?.value||'',grouping:$('#sessionGrouping')?.value||'Gran grupo',unitId:$('#sessionUnit')?.value||'',objectives:$('#sessionObjectives')?.value.trim()||'',competencies:$('#sessionCompetencies')?.value.trim()||'',observations:$('#sessionObservations')?.value.trim()||''}}
function addToSession(id){if(!session.some(x=>x.id===id)){session.push({id,phase:'Sin asignar',minutes:'',grouping:$('#sessionGrouping')?.value||'Gran grupo',note:''});markPending()}renderSession();$('#sessionCount').textContent=session.length}
function removeFromSession(i){session.splice(i,1);renderSession();$('#sessionCount').textContent=session.length;markPending()}
function phaseOptions(current){return ['Sin asignar','Calentamiento','Parte principal','Vuelta a la calma'].map(p=>`<option ${p===current?'selected':''}>${p}</option>`).join('')}
function renderSession(){const box=$('#sessionList');box.innerHTML='';if(!session.length){box.innerHTML='<div class="dropzone" id="dropzone">Arrastra aquí juegos para empezar</div>';bindDrop();updateTotals();return}session.forEach((item,i)=>{const g=games.find(x=>x.id===item.id);if(!g)return;const el=document.createElement('div');el.className='session-item';el.draggable=true;el.innerHTML=`<div class="drag">☷</div><div class="session-game-info"><h4>${esc(i+1+'. '+g.title)}</h4><p>${esc(g.age||'')} · ${esc(materialTag(g))}</p><div class="session-description">${esc(g.description||'Descripción no disponible.')}</div><div class="session-total">${esc(item.note||'')}</div></div><div class="session-controls"><select class="phase">${phaseOptions(item.phase)}</select><input class="minutes" type="number" min="1" placeholder="min" value="${esc(item.minutes||'')}"><input class="note" placeholder="Variante / observación" value="${esc(item.note||'')}"></div><button class="remove">×</button>`;el.querySelector('.phase').onchange=e=>{item.phase=e.target.value;markPending()};el.querySelector('.minutes').onchange=e=>{item.minutes=e.target.value;updateTotals();markPending()};el.querySelector('.note').oninput=e=>{item.note=e.target.value;el.querySelector('.session-total').textContent=e.target.value;markPending()};el.querySelector('.remove').onclick=()=>removeFromSession(i);el.ondragstart=e=>e.dataTransfer.setData('text/plain',JSON.stringify({id:item.id,from:i}));el.ondragover=e=>e.preventDefault();el.ondrop=e=>{e.preventDefault();try{const d=JSON.parse(e.dataTransfer.getData('text/plain'));if(d.from!==undefined){const moved=session.splice(d.from,1)[0];session.splice(i,0,moved);renderSession();markPending()}else addToSession(d.id||e.dataTransfer.getData('text/plain'))}catch(_){}};box.appendChild(el)});const dz=document.createElement('div');dz.className='dropzone';dz.textContent='Suelta aquí para añadir otro juego';dz.id='dropzone';box.appendChild(dz);bindDrop();updateTotals()}
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
