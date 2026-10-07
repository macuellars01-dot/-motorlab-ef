(()=>{
  const NAS_HOST=new URL(NAS_BASE_URL).hostname;
  const nativeFetch=window.fetch.bind(window);
  const posterPromises=new Map();

  function isNasVideoUrl(url){
    try{return new URL(url,location.href).hostname===NAS_HOST}catch(_){return false}
  }

  function nasVideoFilename(url){
    if(!isNasVideoUrl(url))return'';
    try{
      const u=new URL(url,location.href);
      const filename=decodeURIComponent(u.pathname.split('/').pop()||'').trim();
      return /\.mp4$/i.test(filename)?filename:'';
    }catch(_){return''}
  }

  function nasPosterUrl(videoUrl){
    const filename=nasVideoFilename(videoUrl);
    if(!filename)return'';
    const stem=filename.replace(/\.[^.]+$/,'');
    return buildNasUrl('image',`${stem}-poster.jpg`);
  }

  async function ensureNasVideoPoster(videoUrl){
    const filename=nasVideoFilename(videoUrl);
    if(!filename)throw new Error('La URL no corresponde a un vídeo MP4 del NAS');
    const existing=posterPromises.get(filename);
    if(existing)return existing;

    const promise=(async()=>{
      const settings=getSettings();
      const base=String(settings.url||DEFAULT_API).replace(/\\/+$/,'');
      if(!settings.token)throw new Error('Falta el token de sincronización');
      const endpoint=base+'/thumbnail?file='+encodeURIComponent(filename);
      const r=await nativeFetch(endpoint,{headers:{'X-MotorLab-Token':settings.token},cache:'no-store'});
      if(!r.ok)throw new Error('Thumbnail HTTP '+r.status);
      return nasPosterUrl(videoUrl);
    })();

    posterPromises.set(filename,promise);
    try{return await promise}catch(e){posterPromises.delete(filename);throw e}
  }

  async function patchNasVideoThumb(thumb){
    if(!thumb)return;
    const url=thumb.dataset.videoUrl||'';
    if(!isNasVideoUrl(url))return;
    const poster=nasPosterUrl(url);
    if(!poster)return;
    thumb.dataset.posterUrl=poster;

    let img=thumb.querySelector('img');
    if(!img){
      img=document.createElement('img');
      img.alt='Miniatura del vídeo';
      img.loading='lazy';
      img.decoding='async';
      thumb.insertBefore(img,thumb.querySelector('.video-play'));
    }

    try{
      const generated=await ensureNasVideoPoster(url);
      img.src=generated||poster;
      thumb.querySelector('.video-thumb-loading')?.remove();
    }catch(err){
      console.warn('[LUDOMUNDO] No se pudo obtener el póster NAS:',err);
      img.src=poster;
      thumb.querySelector('.video-thumb-loading')?.remove();
    }
  }

  function patchRenderedVideoThumbs(){
    document.querySelectorAll('.video-thumb[data-video-url]').forEach(thumb=>{
      patchNasVideoThumb(thumb);
    });
  }

  const originalRenderGames=window.renderGames;
  if(typeof originalRenderGames==='function'){
    window.renderGames=function(){
      originalRenderGames();
      patchRenderedVideoThumbs();
    };
  }

  const originalOpenGameEditor=window.openGameEditor;
  if(typeof originalOpenGameEditor==='function'){
    window.openGameEditor=function(...args){
      const result=originalOpenGameEditor(...args);
      const form=document.querySelector('#gameForm');
      if(form){
        const videoInput=form.querySelector('[name="videoUrl"]');
        const preview=form.querySelector('#editorVideoPreview');
        if(videoInput&&preview){
          const patchEditorPreview=()=>{
            const thumb=preview.querySelector('.video-thumb[data-video-url]');
            if(thumb)patchNasVideoThumb(thumb);
          };
          videoInput.addEventListener('input',()=>setTimeout(patchEditorPreview,0));
          patchEditorPreview();
        }

        if(typeof form.onsubmit==='function'&&!form.dataset.nasPosterBound){
          const originalSubmit=form.onsubmit;
          form.dataset.nasPosterBound='1';
          form.onsubmit=async function(e){
            const url=this.querySelector('[name="videoUrl"]')?.value.trim()||'';
            if(isNasVideoUrl(url)){
              try{
                await ensureNasVideoPoster(url);
              }catch(err){
                // La miniatura es automática pero no debe impedir guardar la ficha.
                console.warn('[LUDOMUNDO] Guardado sin póster NAS:',err);
              }
            }
            return originalSubmit.call(this,e);
          };
        }
      }
      return result;
    };
  }

  const observer=new MutationObserver(()=>patchRenderedVideoThumbs());
  observer.observe(document.body,{childList:true,subtree:true});
  patchRenderedVideoThumbs();
  console.info('[LUDOMUNDO] v94.10 · póster automático NAS activo');
})();