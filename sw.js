const CACHE='apexrun-v3';
const ASSETS=['./','./index.html','./program.js','./app.js','./manifest.json','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));
});
self.addEventListener('message',e=>{
  if(e.data?.type!=='apex-notif') return;
  self.registration.showNotification('APEX RUN · '+e.data.title,{
    body:e.data.body, vibrate:e.data.vibrate,
    tag:'apex-seg', silent:false, icon:'./icon-192.png'
  });
});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request).then(resp=>{
      const cp=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});
      return resp;
    }).catch(()=>caches.match('./index.html')))
  );
});
