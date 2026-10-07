(()=>{
  const NAS_HOST=new URL(NAS_BASE_URL).hostname;
  const nativeFetch=window.fetch.bind(window);

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
    const settings=getSettings();
    const base=DEFAULT_API.replace(/\/+$/,'');
    if(!settings.token)throw new Error('Falta el token de sincronización');
    const headers={'X-MotorLab-Token':settings.token};
    const endpoint=base+'/thumbnail?file='+encodeURIComponent(filename);
    const r=await nativeFetch(endpoint,{headers,cache:'no-store'});
    if(!r.ok)throw new Error('Thumbnail HTTP '+r.status);
    return nasPosterUrl(videoUrl);
  }

  function patchRenderedVideoThumbs(){
    document.querySelectorAll('.video-thumb[data-video-url]').forEach(thumb=>{
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
      img.src=poster;
      thumb.querySelector('.video-thumb-loading')?.remove();
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
      if(form&&typeof form.onsubmit==='function'){
        const originalSubmit=form.onsubmit;
        form.onsubmit=async function(e){
          const videoInput=this.querySelector('[name="videoUrl"]');
          const url=videoInput?.value.trim()||'';
          if(isNasVideoUrl(url)){
            const saveBtn=this.querySelector('button.primary');
            if(saveBtn)saveBtn.disabled=true;
            try{
              await ensureNasVideoPoster(url);
            }catch(err){
              alert('No se ha podido generar automáticamente la miniatura del vídeo.\\n\\n'+String(err.message||err));
              if(saveBtn)saveBtn.disabled=false;
              return;
            }
          }
          return originalSubmit.call(this,e);
        };
      }
      return result;
    };
  }

  const observer=new MutationObserver(()=>patchRenderedVideoThumbs());
  observer.observe(document.body,{childList:true,subtree:true});
  patchRenderedVideoThumbs();
  console.info('[LUDOMUNDO] v94.9 · póster automático de vídeos NAS activo');
})();