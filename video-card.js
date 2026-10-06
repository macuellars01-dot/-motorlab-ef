/* MotorLab v16.4-v93 · reproducción directa desde miniaturas */
(function(){
  function youtubeId(url){
    try{
      const u=new URL(url);
      if(u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0];
      if(u.hostname.includes('youtube.com')) return u.searchParams.get('v')||u.pathname.split('/').filter(Boolean).pop();
    }catch(_){}
    return null;
  }

  function startCardVideo(thumb){
    if(!thumb || thumb.dataset.playing==='1') return;
    const url=thumb.dataset.videoUrl;
    if(!url) return;

    thumb.dataset.playing='1';
    thumb.classList.add('is-playing');
    thumb.innerHTML='';

    const yt=youtubeId(url);
    if(yt){
      const frame=document.createElement('iframe');
      frame.src='https://www.youtube.com/embed/'+encodeURIComponent(yt)+'?autoplay=1&rel=0';
      frame.title='Vídeo del juego';
      frame.allow='autoplay; encrypted-media; picture-in-picture';
      frame.allowFullscreen=true;
      frame.style.width='100%';
      frame.style.height='100%';
      frame.style.minHeight='180px';
      frame.style.border='0';
      frame.style.display='block';
      thumb.appendChild(frame);
      return;
    }

    const video=document.createElement('video');
    video.src=url;
    video.controls=true;
    video.autoplay=true;
    video.playsInline=true;
    video.preload='auto';
    video.style.width='100%';
    video.style.height='100%';
    video.style.minHeight='180px';
    video.style.display='block';
    video.style.objectFit='cover';
    thumb.appendChild(video);

    const playAttempt=video.play();
    if(playAttempt&&typeof playAttempt.catch==='function') playAttempt.catch(()=>{});
  }

  document.addEventListener('click',function(e){
    const thumb=e.target.closest?.('.video-thumb');
    if(!thumb) return;

    /*
      Capture phase: evita que el click llegue a card.onclick y abra
      "Ver ficha". Si ya estamos reproduciendo, dejamos funcionar
      normalmente los controles nativos del vídeo.
    */
    e.stopPropagation();
    if(thumb.dataset.playing==='1') return;

    startCardVideo(thumb);
  },true);
})();