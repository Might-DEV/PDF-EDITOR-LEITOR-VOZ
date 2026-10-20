(function(){
var $=function(i){return document.getElementById(i)},$$=function(s){return document.querySelectorAll(s)};
var LANG=window.PR_LANG||"pt";
var pdfjs=window.pdfjsLib;
if(pdfjs) pdfjs.GlobalWorkerOptions.workerSrc="vendor/pdf.worker.min.js";
var synth=window.speechSynthesis;
var bytes=null,orig=null,anns={},imgs={},nid=1,undos=[],tool="",sel=null,userCol=false,drag=null,PW=0,PH=0,S=1;
var doc=null,file=null,blobUrl="",cur=1,total=0,zoom=1,rid=0,rtask=null,pd=null,playing=false,session=0,voices=[];
function ls(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
var hist=ls("pr:hist",[]),favs=ls("pr:favs",[]),rate=ls("pr:rate",1),vname=ls("pr:voice","");
function fmt(b){return b<1048576?Math.max(1,Math.round(b/1024))+" KB":(b/1048576).toFixed(1)+" MB"}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
var tt;function toast(m){var t=$("toast");t.textContent=PRT(m);t.classList.add("on");clearTimeout(tt);tt=setTimeout(function(){t.classList.remove("on")},2600)}

/* tema */
function setTheme(t){document.documentElement.setAttribute("data-theme",t);ss("pr:theme",t)}
setTheme(ls("pr:theme","dark"));
$("theme").onclick=function(){setTheme(document.documentElement.getAttribute("data-theme")==="dark"?"light":"dark")};

/* vozes */
function loadVoices(){voices=synth?synth.getVoices():[]}
if(synth){loadVoices();synth.onvoiceschanged=loadVoices}
function pickVoice(){
  var v=voices.filter(function(x){return x.name===vname})[0];
  return v||voices.filter(function(x){return /^pt/i.test(x.lang)})[0]||null;
}

/* telas */
function show(v){
  $("home").style.display=v==="home"?"block":"none";
  $("list").style.display=v==="home"?"none":"block";
  $$("[data-view]").forEach(function(a){a.classList.toggle("on",a.dataset.view===v)});
  if(v!=="home") renderList(v);
}
function renderList(v){
  var h="";
  if(v==="history"||v==="favs"){
    var arr=v==="history"?hist:favs;
    h="<h2>"+(v==="history"?"Meu Histórico":"Favoritos")+"</h2>";
    if(!arr.length) h+='<p class="mut">'+(v==="history"?"Nenhum arquivo aberto ainda.":"Nenhum favorito ainda. Abra um PDF e toque na estrela.")+"</p>";
    arr.forEach(function(a,i){h+='<div class="it"><svg class="i" style="width:28px;height:28px"><use href="#i-file"/></svg><div><b>'+esc(a.name)+"</b><small>"+fmt(a.size)+" · "+a.pages+" páginas · "+new Date(a.date).toLocaleDateString("pt-BR")+'</small></div><button class="ib" data-rm="'+v+":"+i+'" aria-label="Remover"><svg class="i"><use href="#i-x"/></svg></button></div>'});
    h+='<p class="note">Salvo apenas neste navegador. Sincronizar entre aparelhos: indisponível no momento.</p>';
  }else if(v==="settings"){
    var opts=voices.slice().sort(function(a,b){return(/^pt/i.test(b.lang)?1:0)-(/^pt/i.test(a.lang)?1:0)}).map(function(x){return'<option value="'+esc(x.name)+'"'+(x.name===vname?" selected":"")+">"+esc(x.name)+" ("+x.lang+")</option>"}).join("");
    h='<h2>Configurações</h2><div class="row"><label>Idioma</label><select id="lgs"><option value="pt"'+(LANG==="pt"?" selected":"")+'>Português</option><option value="en"'+(LANG==="en"?" selected":"")+'>English</option></select></div><div class="row"><label>Voz</label><select id="vsel">'+opts+'</select></div><div class="row"><label>Idioma OCR</label><select id="olg"><option value="por"'+(ls("pr:ocrlang","por")==="por"?" selected":"")+'>Português</option><option value="eng"'+(ls("pr:ocrlang","por")==="eng"?" selected":"")+'>Inglês</option><option value="por+eng"'+(ls("pr:ocrlang","por")==="por+eng"?" selected":"")+'>Português + Inglês</option></select></div><div class="row"><label>Velocidade</label><input type="range" id="rt" min="0.6" max="2" step="0.1" value="'+rate+'" style="accent-color:#2f6bff"><span id="rtv">'+Number(rate).toFixed(1)+'x</span></div><p class="mut">Voz e velocidade valem para o botão "Ouvir em voz alta". O tema se troca no botão sol/lua do topo.</p><h2 style="font-size:22px;margin:32px 0 16px">Conta e sincronização</h2><div class="row"><label>Login</label><button class="btn sm" disabled>Entrar</button><span class="badge">Indisponível no momento</span></div><div class="row"><label>Sincronizar</label><button class="btn sm" disabled>Ativar</button><span class="badge">Indisponível no momento</span></div>';
  }else{
    h='<h2>Sobre</h2><p class="mut" style="max-width:560px">PDF Reader abre, edita e organiza seus PDFs direto no navegador, sem enviar nada para servidor. Tem miniaturas, zoom, busca, edição, OCR, leitura em voz alta, favoritos e histórico.</p><p class="mut" style="max-width:560px">Atalhos: setas trocam de página, + e - dão zoom, Ctrl+F busca, Ctrl+Z desfaz e Ctrl+S salva.</p>';
  }
  $("list").innerHTML=h;
}
document.addEventListener("click",function(e){
  var a=e.target.closest("[data-view]");
  if(a){e.preventDefault();show(a.dataset.view);return}
  var r=e.target.closest("[data-rm]");
  if(r){var p=r.dataset.rm.split(":");(p[0]==="history"?hist:favs).splice(+p[1],1);ss(p[0]==="history"?"pr:hist":"pr:favs",p[0]==="history"?hist:favs);renderList(p[0]);favUI()}
});
document.addEventListener("change",function(e){if(e.target.id==="vsel"){vname=e.target.value;ss("pr:voice",vname)}});
document.addEventListener("input",function(e){if(e.target.id==="rt"){rate=parseFloat(e.target.value);$("rtv").textContent=rate.toFixed(1)+"x";ss("pr:rate",rate)}});

/* abrir arquivo */
function need(){if(ocrBusy){toast("Aguarde o OCR terminar ou cancele.");return true}if(!doc){toast("Abra um PDF primeiro.");return true}return false}
async function openFile(f){
  if(!f) return;
  if(ocrBusy) return toast("Aguarde o OCR terminar ou cancele.");
  if(f.type!=="application/pdf"&&!/\.pdf$/i.test(f.name)) return toast("Escolha um arquivo PDF.");
  if(f.size>50*1048576) return toast("O arquivo passa de 50MB.");
  if(!pdfjs) return toast("Não foi possível carregar o leitor. Verifique a internet.");
  stopSpeech();toast("Abrindo…");
  try{
    var buf=await f.arrayBuffer();
    bytes=new Uint8Array(buf);orig=bytes;anns={};imgs={};undos=[];forceTool("");
    doc=await pdfjs.getDocument({data:bytes.slice()}).promise;
    resetSearch();indexText();
    file=f;if(blobUrl) URL.revokeObjectURL(blobUrl);blobUrl=URL.createObjectURL(f);
    total=doc.numPages;cur=1;zoom=1;var sp=ls(posKey(),null);if(sp&&sp.p>1&&sp.p<=total){cur=sp.p;zoom=sp.z||1;setTimeout(function(){toast("Continuando da página "+cur+".")},700)}
    document.body.classList.add("has");
    $("fn").textContent=$("in1").textContent=f.name;
    $("fs").textContent=$("in2").textContent=fmt(f.size);
    $("tot").textContent="/ "+total;$("in3").textContent=total;$("zl").textContent=Math.round(zoom*100)+"%";
    hist=hist.filter(function(h){return!(h.name===f.name&&h.size===f.size)});
    hist.unshift({name:f.name,size:f.size,pages:total,date:Date.now()});hist=hist.slice(0,30);ss("pr:hist",hist);
    show("home");favUI();buildThumbs();await renderPage();
    $("viewer").scrollIntoView({behavior:"smooth",block:"start"});
  }catch(err){toast("Não consegui abrir esse PDF.")}
}
$("pick").onclick=function(){$("file").click()};
$("file").onchange=function(e){openFile(e.target.files[0]);e.target.value=""};
var dz=$("dz");
["dragenter","dragover"].forEach(function(t){dz.addEventListener(t,function(e){e.preventDefault();dz.classList.add("over")})});
["dragleave","drop"].forEach(function(t){dz.addEventListener(t,function(e){e.preventDefault();dz.classList.remove("over")})});
dz.addEventListener("drop",function(e){openFile(e.dataTransfer.files[0])});
["dragover","drop"].forEach(function(t){window.addEventListener(t,function(e){e.preventDefault()})});

/* miniaturas */
async function buildThumbs(){
  var box=$("th"),my=doc;box.innerHTML="";
  for(var n=1;n<=total;n++){var d=document.createElement("div");d.className="t"+(n===cur?" on":"");d.dataset.n=n;d.draggable=true;d.title="Arraste para reordenar";d.innerHTML="<canvas></canvas><span>"+n+"</span>";box.appendChild(d)}
  for(var k=1;k<=total&&my===doc;k++){
    var pg=await doc.getPage(k),w=pg.getViewport({scale:1}),vp=pg.getViewport({scale:140/w.width}),cv=box.children[k-1]&&box.children[k-1].firstChild;
    if(!cv) break;cv.width=vp.width;cv.height=vp.height;
    await pg.render({canvasContext:cv.getContext("2d"),viewport:vp}).promise;
  }
}
$("th").addEventListener("click",function(e){var t=e.target.closest(".t");if(t&&doc) go(+t.dataset.n)});

/* página */
async function renderPage(){
  if(!doc) return;
  var my=++rid,pg=await doc.getPage(cur);
  var avail=Math.max(260,$("pa").clientWidth-44),b=pg.getViewport({scale:1}),sc=avail/b.width*zoom,vp=pg.getViewport({scale:sc}),dpr=window.devicePixelRatio||1;
  var cv=$("cv");cv.classList.toggle("inv",!!ls("pr:inv",false));cv.width=vp.width*dpr;cv.height=vp.height*dpr;cv.style.width=vp.width+"px";cv.style.height=vp.height+"px";
  $("pw").style.width=vp.width+"px";$("pw").style.height=vp.height+"px";
  PW=b.width;PH=b.height;S=sc;$("ta").style.display="none";drawOv();
  if(rtask){try{rtask.cancel()}catch(e){}}
  rtask=pg.render({canvasContext:cv.getContext("2d"),viewport:vp,transform:dpr!==1?[dpr,0,0,dpr,0,0]:null});
  try{await rtask.promise}catch(e){return}
  if(my!==rid) return;
  var tl=$("tl"),divs=[];tl.innerHTML="";tl.style.setProperty("--scale-factor",sc);
  var tc=await pg.getTextContent();
  try{await pdfjs.renderTextLayer({textContent:tc,container:tl,viewport:vp,textDivs:divs}).promise}catch(e){}
  pd=ptOf(tc);pd.divs=divs;hlI=-1;applySearch();savePos();
  $("pn").value=cur;
  $$("#th .t").forEach(function(x){var on=+x.dataset.n===cur;x.classList.toggle("on",on);if(on){var th=$("th");th.scrollTop=x.offsetTop-th.clientHeight/3}});
}
function go(n){
  if(need()) return;
  n=Math.max(1,Math.min(total,n));if(n===cur) return;
  stopSpeech();sel=null;cur=n;$("pa").scrollTop=0;renderPage();
}
$("prev").onclick=function(){go(cur-1)};$("next").onclick=function(){go(cur+1)};
$("pn").onchange=function(){var n=parseInt(this.value,10);if(!doc){this.value=1;return need()}if(isNaN(n)) this.value=cur;else go(n)};
function setZoom(z){if(need()) return;zoom=Math.max(.5,Math.min(3,z));$("zl").textContent=Math.round(zoom*100)+"%";stopSpeech();renderPage()}
$("zo").onclick=function(){setZoom(zoom-.25)};$("zi").onclick=function(){setZoom(zoom+.25)};

/* ferramentas */
function download(b,name,type){var u=URL.createObjectURL(new Blob([b],{type:type||"application/pdf"})),a=document.createElement("a");a.href=u;a.download=name;a.click();setTimeout(function(){URL.revokeObjectURL(u)},8000)}
function hasAnns(){return Object.keys(anns).some(function(k){return anns[k].length})}
function outName(){return(bytes!==orig||hasAnns())?file.name.replace(/\.pdf$/i,"")+"-editado.pdf":file.name}
function hasRed(){return Object.keys(anns).some(function(k){return anns[k].some(function(a){return a.t==="red"})})}
async function dl(){if(need()) return;var red=hasRed();toast("Gerando PDF…");try{download(await bake(),outName());if(red) toast("Pronto. As páginas com tarja viraram imagem: o conteúdo coberto foi removido.")}catch(e){toast("Erro ao gerar o PDF.")}}
async function pr(){
  if(need()) return;
  try{
    var u=URL.createObjectURL(new Blob([await bake()],{type:"application/pdf"})),f=document.createElement("iframe");
    f.style.cssText="position:fixed;width:0;height:0;border:0";f.src=u;
    f.onload=function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(e){window.open(u)}setTimeout(function(){f.remove()},60000)};
    document.body.appendChild(f);
  }catch(e){toast("Erro ao preparar a impressão.")}
}
function isFav(){return file&&favs.some(function(f){return f.name===file.name&&f.size===file.size})}
function favUI(){var on=!!isFav();$("b3").classList.toggle("fv",on);$("t3t").textContent=on?"Remover dos Favoritos":"Adicionar aos Favoritos"}
function fav(){
  if(need()) return;
  if(isFav()) favs=favs.filter(function(f){return!(f.name===file.name&&f.size===file.size)});
  else{favs.unshift({name:file.name,size:file.size,pages:total,date:Date.now()});toast("Adicionado aos favoritos.")}
  ss("pr:favs",favs);favUI();
}
async function share(){
  if(need()) return;
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})) await navigator.share({files:[file],title:file.name});
    else toast("Seu navegador não permite compartilhar arquivos. Use Baixar PDF.");
  }catch(e){}
}
function full(){var v=$("viewer");if(document.fullscreenElement) document.exitFullscreen();else if(v.requestFullscreen) v.requestFullscreen()}
$("b1").onclick=$("t1").onclick=dl;$("b2").onclick=$("t2").onclick=pr;$("b3").onclick=$("t3").onclick=fav;$("t4").onclick=share;$("b4").onclick=full;

/* voz */
function setSpk(){$("t5t").textContent=playing?"Pausar leitura":"Ouvir em voz alta"}
function stopSpeech(){session++;if(synth) synth.cancel();playing=false;setSpk();clearHl()}
var hlI=-1,curOff=0;
function clearHl(){
  if(hlI>=0&&pd&&pd.divs&&pd.divs[hlI]){var d=pd.divs[hlI];if(d._w){d.textContent=pd.strs[hlI];d._w=0;d._m=0;if(hits.length) applySearch()}}
  hlI=-1;
}
function chunkEnd(t,p){
  var e=Math.min(p+220,t.length);
  if(e<t.length){var s=t.slice(p,e),m=Math.max(s.lastIndexOf(". "),s.lastIndexOf("? "),s.lastIndexOf("! ")),sp=s.lastIndexOf(" ");e=p+(m>60?m+1:(sp>0?sp:s.length))}
  return e;
}
function hl(d,off){
  curOff=off;
  var lo=0,hi=d.starts.length-1;
  while(lo<hi){var m=(lo+hi+1)>>1;if(d.starts[m]<=off) lo=m;else hi=m-1}
  var el=d.divs[lo];if(!el) return;
  if(lo!==hlI) clearHl();
  var str=d.strs[lo],loc=Math.max(0,Math.min(str.length-1,off-d.starts[lo])),a=loc,b=loc;
  while(a>0&&!/\s/.test(str.charAt(a-1))) a--;
  while(b<str.length&&!/\s/.test(str.charAt(b))) b++;
  el.innerHTML=esc(str.slice(0,a))+'<mark class="sw">'+esc(str.slice(a,b))+"</mark>"+esc(str.slice(b));el._w=1;hlI=lo;
  var r=el.getBoundingClientRect(),pr=$("pa").getBoundingClientRect();
  if(r.top<pr.top+30||r.bottom>pr.bottom-30) $("pa").scrollTop+=r.top-pr.top-pr.height/3;
}
function speak(from){
  if(!synth) return toast("Seu navegador não suporta leitura em voz alta.");
  synth.cancel();var my=++session,d=pd;
  if(!d||!d.text.trim()){playing=false;setSpk();return toast("Esta página não tem texto para ler (PDF escaneado?).")}
  playing=true;setSpk();var pos=from;
  (function next(){
    if(my!==session) return;
    while(pos<d.text.length&&/\s/.test(d.text.charAt(pos))) pos++;
    if(pos>=d.text.length){
      if(cur<total){cur++;renderPage().then(function(){if(my===session) speak(0)})}else stopSpeech();
      return;
    }
    var base=pos,e=chunkEnd(d.text,pos),u=new SpeechSynthesisUtterance(d.text.slice(base,e)),v=pickVoice();
    pos=e;if(v){u.voice=v;u.lang=v.lang}else u.lang="pt-BR";u.rate=rate;
    u.onstart=function(){if(my===session) hl(d,base)};
    u.onboundary=function(ev){if(my===session&&ev.name!=="sentence") hl(d,base+ev.charIndex)};
    u.onend=function(){if(my===session) next()};
    u.onerror=function(ev){if(my===session&&!/canceled|interrupted/.test(ev.error||"")) next()};
    synth.speak(u);
  })();
}
$("t5").onclick=function(){if(need()) return;if(playing) stopSpeech();else speak(0)};

/* ===== edição ===== */
var DEF={text:"#111827",pen:"#e11d48",hl:"#ffd400",rect:"#111827"},SZ={text:[12,18,28],pen:[2,4,8]};
function col(){return $("ecol").value}
function szi(){return +$("esz").value}
function find(id){var L=anns[cur]||[];for(var i=0;i<L.length;i++) if(L[i].id===id) return L[i]}
function add(a){a.id=nid++;(anns[cur]=anns[cur]||[]).push(a);return a}
function removeAnn(id){anns[cur]=(anns[cur]||[]).filter(function(a){return a.id!==id})}
function snap(){undos.push({a:JSON.stringify(anns),b:bytes,p:cur});if(undos.length>40) undos.shift()}
function forceTool(t){
  tool=t;$$("#et [data-tool]").forEach(function(b){b.classList.toggle("on",b.dataset.tool===t)});
  $("pw").classList.toggle("edit",!!t);$("ov").style.cursor=t==="text"?"text":t==="move"?"default":"crosshair";
  if(!userCol&&DEF[t]) $("ecol").value=DEF[t];
  if(t!=="move") sel=null;drawOv();
}
function setTool(t){if(need()) return;forceTool(tool===t?"":t)}
function svgOf(a){
  var id=' data-id="'+a.id+'"',c=a.c;
  if(a.t==="text"){
    var L=a.txt.split("\n"),mx=Math.max.apply(null,L.map(function(l){return l.length}))||1;
    return"<g"+id+'><rect x="'+a.x+'" y="'+a.y+'" width="'+mx*a.s*.56+'" height="'+L.length*a.s*1.2+'" fill="transparent"/><text font-size="'+a.s+'" fill="'+c+'">'+L.map(function(l,i){return'<tspan x="'+a.x+'" y="'+(a.y+a.s*.9+i*a.s*1.2)+'">'+esc(l)+"</tspan>"}).join("")+"</text></g>";
  }
  if(a.t==="pen"){
    var p=a.pts.map(function(q){return q[0].toFixed(1)+","+q[1].toFixed(1)}).join(" ");
    return"<g"+id+'><polyline points="'+p+'" fill="none" stroke="transparent" stroke-width="'+Math.max(a.w,12)+'" stroke-linecap="round"/><polyline points="'+p+'" fill="none" stroke="'+c+'" stroke-width="'+a.w+'" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  var b=id+' x="'+a.x+'" y="'+a.y+'" width="'+a.w+'" height="'+a.h+'"';
  if(a.t==="red") return"<rect"+b+' fill="#000" fill-opacity=".92" stroke="#e11d48" stroke-width="'+1.5/S+'" stroke-dasharray="'+4/S+'"/>';
  if(a.t==="hl") return"<rect"+b+' fill="'+c+'" fill-opacity=".4" style="mix-blend-mode:multiply"/>';
  if(a.t==="rect") return"<rect"+b+' fill="'+c+'"/>';
  return"<image"+b+' href="'+imgs[a.src]+'" preserveAspectRatio="none"/>';
}
function drawOv(){
  if(!PW) return;
  var ov=$("ov"),h="";ov.setAttribute("viewBox","0 0 "+PW+" "+PH);
  (anns[cur]||[]).forEach(function(a){h+=svgOf(a)});ov.innerHTML=h;
  if(sel){
    var g=ov.querySelector('[data-id="'+sel+'"]'),a=find(sel);
    if(g&&a){
      var b=g.getBBox(),k=1/S;
      var x='<rect x="'+b.x+'" y="'+b.y+'" width="'+b.width+'" height="'+b.height+'" fill="none" stroke="#2f6bff" stroke-width="'+1.5*k+'" stroke-dasharray="'+5*k+'" pointer-events="none"/>';
      if(/hl|rect|red|img/.test(a.t)) x+='<circle data-h="1" cx="'+(b.x+b.width)+'" cy="'+(b.y+b.height)+'" r="'+7*k+'" fill="#2f6bff" stroke="#fff" stroke-width="'+k+'"/>';
      ov.insertAdjacentHTML("beforeend",x);
    }
  }
}
function pt(e){var r=$("ov").getBoundingClientRect();return{x:(e.clientX-r.left)/S,y:(e.clientY-r.top)/S}}
function shift(a,dx,dy){if(a.pts) a.pts.forEach(function(q){q[0]+=dx;q[1]+=dy});else{a.x+=dx;a.y+=dy}}
function editText(a,x,y){
  var ta=$("ta"),s=a?a.s:SZ.text[szi()],c=a?a.c:col(),px=a?a.x:x,py=a?a.y:y;
  ta.style.cssText="display:block;left:"+px*S+"px;top:"+py*S+"px;font-size:"+s*S+"px;color:"+c;
  ta.value=a?a.txt:"";ta.rows=1;
  setTimeout(function(){ta.focus()},0);
  ta.onblur=function(){
    ta.onblur=null;var v=ta.value;ta.style.display="none";
    if(a){if(v.trim()===""){snap();removeAnn(a.id)}else if(v!==a.txt){snap();a.txt=v}}
    else if(v.trim()!==""){snap();add({t:"text",txt:v,x:px,y:py,s:s,c:c})}
    drawOv();
  };
  ta.onkeydown=function(e){if(e.key==="Escape"){ta.value=a?a.txt:"";ta.blur()}};
}
var ov=$("ov");
$("av").onclick=function(){toast("Login e sincronização: indisponível no momento.")};
ov.addEventListener("pointerdown",function(e){
  if(!tool) return;
  var p=pt(e),t=e.target.closest("[data-id]"),h=e.target.closest("[data-h]");
  if(tool==="erase"){if(t){snap();removeAnn(+t.dataset.id);drawOv()}return}
  if(tool==="text"){if(!t) editText(null,p.x,p.y);return}
  if(tool==="move"){
    if(h&&sel){snap();drag={m:"rs",a:find(sel)}}
    else if(t){sel=+t.dataset.id;snap();drag={m:"mv",a:find(sel),lx:p.x,ly:p.y}}
    else sel=null;
    drawOv();if(drag) ov.setPointerCapture(e.pointerId);return;
  }
  snap();
  var a=tool==="pen"?add({t:"pen",c:col(),w:SZ.pen[szi()],pts:[[p.x,p.y],[p.x+.01,p.y]]}):add({t:tool,c:tool==="red"?"#000000":col(),x:p.x,y:p.y,w:0,h:0});
  drag={m:"new",a:a,ox:p.x,oy:p.y};ov.setPointerCapture(e.pointerId);drawOv();
});
ov.addEventListener("pointermove",function(e){
  if(!drag) return;
  var p=pt(e),a=drag.a;
  if(drag.m==="mv"){shift(a,p.x-drag.lx,p.y-drag.ly);drag.lx=p.x;drag.ly=p.y}
  else if(drag.m==="rs"){a.w=Math.max(20,p.x-a.x);a.h=a.t==="img"?a.w*a.ar:Math.max(10,p.y-a.y)}
  else if(a.t==="pen") a.pts.push([p.x,p.y]);
  else{a.x=Math.min(drag.ox,p.x);a.y=Math.min(drag.oy,p.y);a.w=Math.abs(p.x-drag.ox);a.h=Math.abs(p.y-drag.oy)}
  drawOv();
});
function endDrag(){
  if(!drag) return;var a=drag.a;
  if(drag.m==="new"&&a.t!=="pen"&&a.w<4&&a.h<4) removeAnn(a.id);
  drag=null;drawOv();
}
ov.addEventListener("pointerup",endDrag);ov.addEventListener("pointercancel",endDrag);
ov.addEventListener("dblclick",function(e){
  if(tool!=="move") return;var t=e.target.closest("[data-id]"),a=t&&find(+t.dataset.id);
  if(a&&a.t==="text") editText(a);
});
$("et").addEventListener("click",function(e){var b=e.target.closest("[data-tool]");if(b) setTool(b.dataset.tool)});
$("ecol").addEventListener("input",function(){userCol=true;var a=sel&&find(sel);if(a&&a.c){a.c=col();drawOv()}});
$("esz").addEventListener("change",function(){
  var a=sel&&find(sel);if(!a) return;
  if(a.t==="text") a.s=SZ.text[szi()];else if(a.t==="pen") a.w=SZ.pen[szi()];else return;
  drawOv();
});
document.addEventListener("keydown",function(e){
  if(e.key!=="Delete"||!sel||/TEXTAREA|INPUT|SELECT/.test((document.activeElement||{}).tagName||"")) return;
  snap();removeAnn(sel);sel=null;drawOv();
});
$("eimg").onclick=function(){if(need()) return;$("imgf").click()};
function addImg(src,frac){
  var im=new Image();
  im.onload=function(){
    snap();var k="i"+(nid++);imgs[k]=src;var w=PW*(frac||.3),ar=im.naturalHeight/im.naturalWidth;
    sel=add({t:"img",src:k,x:PW*.35,y:PH*.35,w:w,h:w*ar,ar:ar}).id;forceTool("move");
  };
  im.src=src;
}
$("imgf").onchange=function(e){
  var f=e.target.files[0];e.target.value="";if(!f) return;
  var r=new FileReader();r.onload=function(){addImg(r.result,.3)};r.readAsDataURL(f);
};

/* salvar: aplica as marcações no PDF com pdf-lib */
function rgbOf(h){var n=parseInt(h.slice(1),16);return PDFLib.rgb((n>>16&255)/255,(n>>8&255)/255,(n&255)/255)}
function imgPng(src,R){
  return new Promise(function(res){
    var im=new Image();
    im.onload=function(){
      var w=im.naturalWidth,h=im.naturalHeight,c=document.createElement("canvas"),x=c.getContext("2d");
      if(R%180){c.width=h;c.height=w}else{c.width=w;c.height=h}
      if(R===90) x.setTransform(0,-1,1,0,0,w);else if(R===180) x.setTransform(-1,0,0,-1,w,h);else if(R===270) x.setTransform(0,1,-1,0,h,0);
      x.drawImage(im,0,0);
      var b=atob(c.toDataURL("image/png").split(",")[1]),u=new Uint8Array(b.length);
      for(var i=0;i<b.length;i++) u[i]=b.charCodeAt(i);
      res(u);
    };
    im.src=src;
  });
}
async function drawAnns(pdf,pg,font,L){
  var P=PDFLib,R=((pg.getRotation().angle%360)+360)%360,mb=pg.getCropBox(),W=mb.width,H=mb.height;
  function tp(x,y){return R===90?[mb.x+y,mb.y+x]:R===180?[mb.x+W-x,mb.y+y]:R===270?[mb.x+W-y,mb.y+H-x]:[mb.x+x,mb.y+H-y]}
  function box(a){var p=tp(a.x,a.y),q=tp(a.x+a.w,a.y+a.h);return{x:Math.min(p[0],q[0]),y:Math.min(p[1],q[1]),width:Math.abs(p[0]-q[0]),height:Math.abs(p[1]-q[1])}}
  for(var i=0;i<L.length;i++){
    var a=L[i],c=a.c?rgbOf(a.c):null;
    if(a.t==="text"){
      a.txt.split("\n").forEach(function(l,j){
        var p=tp(a.x,a.y+a.s*.9+j*a.s*1.2);
        pg.drawText(l.replace(/[^\x20-\x7E\xA0-\xFF]/g,"?"),{x:p[0],y:p[1],size:a.s,font:font,color:c,opacity:a.op==null?1:a.op,rotate:P.degrees(R+(a.rot||0))});
      });
    }else if(a.t==="pen"){
      for(var j=1;j<a.pts.length;j++){
        var p=tp(a.pts[j-1][0],a.pts[j-1][1]),q=tp(a.pts[j][0],a.pts[j][1]);
        pg.drawLine({start:{x:p[0],y:p[1]},end:{x:q[0],y:q[1]},thickness:a.w,color:c,lineCap:P.LineCapStyle.Round});
      }
    }else if(a.t==="hl") pg.drawRectangle(Object.assign(box(a),{color:c,opacity:.4,blendMode:P.BlendMode.Multiply}));
    else if(a.t==="rect") pg.drawRectangle(Object.assign(box(a),{color:c}));
    else if(a.t==="ocr"){
      var tx=a.txt.replace(/[^\x20-\x7E\xA0-\xFF]/g,"?"),wd=font.widthOfTextAtSize(tx,1)||1,sz=Math.max(1,Math.min(a.w/wd,a.h*1.4)),op=tp(a.x,a.y+a.h*.8);
      pg.drawText(tx,{x:op[0],y:op[1],size:sz,font:font,opacity:0,rotate:P.degrees(R)});
    }
    else if(a.t==="img"){var im=await pdf.embedPng(await imgPng(imgs[a.src],R));pg.drawImage(im,box(a))}
  }
}
async function redactPage(pdf,i,R){
  var p=await doc.getPage(i+1),b=p.getViewport({scale:1}),k=Math.min(3,4000/Math.max(b.width,b.height)),vp=p.getViewport({scale:k}),c=document.createElement("canvas");
  c.width=Math.round(vp.width);c.height=Math.round(vp.height);
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  await p.render({canvasContext:x,viewport:vp}).promise;
  x.fillStyle="#000";R.forEach(function(a){x.fillRect(a.x*k,a.y*k,a.w*k,a.h*k)});
  var bin=atob(c.toDataURL("image/jpeg",.92).split(",")[1]),u=new Uint8Array(bin.length);
  for(var n=0;n<bin.length;n++) u[n]=bin.charCodeAt(n);
  var im=await pdf.embedJpg(u),np=pdf.insertPage(i,[b.width,b.height]);
  np.drawImage(im,{x:0,y:0,width:b.width,height:b.height});pdf.removePage(i+1);
  return np;
}
async function bake(){
  if(!hasAnns()) return bytes;
  var pdf=await PDFLib.PDFDocument.load(bytes,{ignoreEncryption:true}),font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
  for(var k in anns){
    var L=anns[k];if(!L.length) continue;
    var pg=pdf.getPage(+k-1),R=L.filter(function(a){return a.t==="red"});
    if(R.length){pg=await redactPage(pdf,+k-1,R);L=L.filter(function(a){return a.t!=="red"})}
    await drawAnns(pdf,pg,font,L);
  }
  return await pdf.save();
}
async function loadBytes(){
  doc=await pdfjs.getDocument({data:bytes.slice()}).promise;total=doc.numPages;resetSearch();indexText();
  $("tot").textContent="/ "+total;$("in3").textContent=total;buildThumbs();
}
async function pageOp(kind){
  if(need()) return;
  if(kind==="del"){
    if(total<2) return toast("O PDF precisa ter ao menos uma página.");
    if(!confirm("Excluir a página "+cur+"?")) return;
  }
  stopSpeech();toast("Aplicando…");snap();
  try{
    var pdf=await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true}),pg=pdf.getPage(cur-1);
    if(kind==="rot") pg.setRotation(PDFLib.degrees((pg.getRotation().angle+90)%360));else pdf.removePage(cur-1);
    bytes=await pdf.save();anns={};sel=null;
    await loadBytes();if(cur>total) cur=total;await renderPage();
  }catch(e){undos.pop();toast("Não consegui aplicar a alteração.")}
}
async function undo(){
  if(need()) return;
  var u=undos.pop();if(!u) return toast("Nada para desfazer.");
  anns=JSON.parse(u.a);sel=null;
  if(u.b!==bytes){bytes=u.b;await loadBytes();cur=Math.max(1,Math.min(u.p,total))}
  renderPage();
}
$("eun").onclick=undo;$("erot").onclick=function(){pageOp("rot")};$("edel").onclick=function(){pageOp("del")};$("esv").onclick=dl;

/* ===== busca no PDF ===== */
var ptx=[],hits=[],hi=-1,idxDone=false,qt;
function ptOf(tc){
  var starts=[],strs=[],t="";
  tc.items.forEach(function(i){if(i.str===undefined) return;starts.push(t.length);strs.push(i.str);t+=i.str+" "});
  return{text:t,starts:starts,strs:strs};
}
function norm(s){
  var o="";
  for(var i=0;i<s.length;i++){var c=s.charAt(i),n=c.normalize("NFD").charAt(0)||c;o+=(n.toLowerCase().charAt(0)||n)}
  return o;
}
async function indexText(){
  var my=doc;ptx=[];idxDone=false;
  for(var n=1;n<=my.numPages;n++){
    var tc=await (await my.getPage(n)).getTextContent();
    if(my!==doc) return;
    ptx[n]=ptOf(tc);
  }
  idxDone=true;if($("sq").value.trim()) runSearch(true);
}
function resetSearch(){hits=[];hi=-1;ptx=[];idxDone=false;updCount()}
function updCount(){
  var q=$("sq").value.trim();
  $("sc").textContent=!q?"0/0":(!idxDone&&!hits.length?"…":(hits.length?(hi+1)+"/"+hits.length:"0/0"));
}
function runSearch(keep){
  var q=norm($("sq").value.trim());hits=[];hi=-1;
  if(q&&ptx.length){
    for(var n=1;n<=total;n++){
      var d=ptx[n];if(!d) continue;
      var t=d.nt||(d.nt=norm(d.text)),p=0;
      while((p=t.indexOf(q,p))>-1){hits.push({p:n,s:p,e:p+q.length});p+=q.length}
    }
  }
  if(hits.length){
    hi=0;for(var k=0;k<hits.length;k++) if(hits[k].p>=cur){hi=k;break}
    gotoHit();
  }else{updCount();applySearch()}
}
async function gotoHit(){
  if(!hits.length) return;
  var h=hits[hi];updCount();
  if(h.p!==cur){stopSpeech();sel=null;cur=h.p;await renderPage()}else applySearch();
}
function stepHit(d){
  if(!hits.length) return;
  hi=(hi+d+hits.length)%hits.length;gotoHit();
}
function applySearch(){
  if(!pd||!pd.divs) return;
  pd.divs.forEach(function(d,i){if(d._m){d.textContent=pd.strs[i];d._m=0}});
  var per={};
  hits.forEach(function(h,k){
    if(h.p!==cur) return;
    for(var i=0;i<pd.starts.length;i++){
      var st=pd.starts[i],en=st+pd.strs[i].length;
      if(st>=h.e) break;if(en<=h.s) continue;
      (per[i]=per[i]||[]).push([Math.max(h.s,st)-st,Math.min(h.e,en)-st,k===hi]);
    }
  });
  Object.keys(per).forEach(function(i){
    var d=pd.divs[i],str=pd.strs[i],pos=0,out="";if(!d) return;
    per[i].forEach(function(r){out+=esc(str.slice(pos,r[0]))+'<mark class="'+(r[2]?"sc":"sm")+'">'+esc(str.slice(r[0],r[1]))+"</mark>";pos=r[1]});
    d.innerHTML=out+esc(str.slice(pos));d._m=1;
  });
  var m=$("tl").querySelector("mark.sc");
  if(m){
    var r=m.getBoundingClientRect(),pr=$("pa").getBoundingClientRect();
    if(r.top<pr.top+40||r.bottom>pr.bottom-40) $("pa").scrollTop+=r.top-pr.top-pr.height/3;
  }
}
function openSearch(){if(need()) return;$("srch").classList.add("on");$("sq").focus();$("sq").select()}
function closeSearch(){$("srch").classList.remove("on");hits=[];hi=-1;updCount();applySearch()}
$("b5").onclick=function(){$("srch").classList.contains("on")?closeSearch():openSearch()};
$("sx").onclick=closeSearch;$("sn").onclick=function(){stepHit(1)};$("sp").onclick=function(){stepHit(-1)};
$("sq").addEventListener("input",function(){clearTimeout(qt);qt=setTimeout(runSearch,200)});
$("sq").addEventListener("keydown",function(e){
  if(e.key==="Enter"){e.preventDefault();clearTimeout(qt);if(!hits.length) runSearch();else stepHit(e.shiftKey?-1:1)}
  else if(e.key==="Escape") closeSearch();
});
document.addEventListener("keydown",function(e){
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="f"&&doc&&$("home").style.display!=="none"){e.preventDefault();openSearch()}
});

/* ===== organizar: reordenar, extrair/dividir e juntar ===== */
async function moveTo(from,to){
  if(need()||from===to||to<1||to>total) return;
  stopSpeech();toast("Reordenando…");snap();
  try{
    var pdf=await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true}),pg=pdf.getPage(from-1);
    pdf.removePage(from-1);pdf.insertPage(to-1,pg);
    bytes=await pdf.save();anns={};sel=null;
    await loadBytes();cur=to;await renderPage();
  }catch(e){undos.pop();toast("Não consegui reordenar as páginas.")}
}
var dfrom=0;
function clearDov(){$$("#th .dov").forEach(function(x){x.classList.remove("dov")})}
$("th").addEventListener("dragstart",function(e){
  var t=e.target.closest&&e.target.closest(".t");
  if(!t||!t.dataset.n||!doc){e.preventDefault();return}
  dfrom=+t.dataset.n;e.dataTransfer.effectAllowed="move";
  try{e.dataTransfer.setData("text/plain",String(dfrom))}catch(x){}
});
$("th").addEventListener("dragover",function(e){
  var t=e.target.closest&&e.target.closest(".t");
  if(!t||!dfrom||!t.dataset.n) return;
  e.preventDefault();clearDov();t.classList.add("dov");
});
$("th").addEventListener("drop",function(e){
  e.preventDefault();var t=e.target.closest&&e.target.closest(".t");clearDov();
  if(t&&dfrom&&t.dataset.n){var f=dfrom;dfrom=0;moveTo(f,+t.dataset.n)}
});
$("th").addEventListener("dragend",function(){dfrom=0;clearDov()});
$("emup").onclick=function(){moveTo(cur,cur-1)};
$("emdn").onclick=function(){moveTo(cur,cur+1)};

function parseRange(t,n){
  var out=[],seen={};
  t.split(",").forEach(function(p){
    p=p.trim();if(!p) return;
    var m=p.match(/^(\d+)(?:\s*-\s*(\d+))?$/);if(!m) throw 0;
    var a=+m[1],b=m[2]?+m[2]:a;if(a<1||b>n||a>b) throw 0;
    for(var i=a;i<=b;i++) if(!seen[i]){seen[i]=1;out.push(i-1)}
  });
  if(!out.length) throw 0;
  return out;
}
async function extractPages(){
  if(need()) return;
  var t=prompt("Quais páginas salvar em um novo PDF? Ex.: 1-3, 5, 8-10",String(cur));
  if(t===null) return;
  var idx;try{idx=parseRange(t,total)}catch(e){return toast("Intervalo inválido. Use algo como 1-3, 5.")}
  toast("Gerando PDF…");
  try{
    var src=await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true}),dst=await PDFLib.PDFDocument.create();
    (await dst.copyPages(src,idx)).forEach(function(p){dst.addPage(p)});
    download(await dst.save(),file.name.replace(/\.pdf$/i,"")+"-paginas.pdf");
    toast("Baixado um PDF com "+idx.length+" página(s).");
  }catch(e){toast("Não consegui extrair as páginas.")}
}
async function mergeFiles(fs){
  if(!window.PDFLib||!pdfjs) return toast("Não foi possível carregar as bibliotecas. Verifique a internet.");
  var big=fs.filter(function(f){return f.size>50*1048576});
  if(big.length) return toast("Cada PDF pode ter no máximo 50MB.");
  toast("Juntando…");
  try{
    var base=doc?await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true}):await PDFLib.PDFDocument.create();
    for(var i=0;i<fs.length;i++){
      var src=await PDFLib.PDFDocument.load(await fs[i].arrayBuffer(),{ignoreEncryption:true});
      (await base.copyPages(src,src.getPageIndices())).forEach(function(p){base.addPage(p)});
    }
    var out=await base.save();
    if(!doc){await openFile(new File([out],"PDFs-unidos.pdf",{type:"application/pdf"}));return}
    stopSpeech();snap();bytes=out;anns={};sel=null;
    await loadBytes();await renderPage();
    toast(fs.length+" PDF(s) adicionados ao final.");
  }catch(e){toast("Não consegui juntar. Algum PDF pode estar protegido ou corrompido.")}
}
$("eext").onclick=extractPages;
$("emrg").onclick=function(){$("mrgf").click()};
$("mrgf").onchange=function(e){var fs=Array.prototype.slice.call(e.target.files);e.target.value="";if(fs.length) mergeFiles(fs)};

/* ===== OCR: reconhece texto em páginas escaneadas e grava como texto invisível ===== */
var ocrBusy=false,ocrStop=false,ocrW=null,ocrRej=null;
function loadScript(u){return new Promise(function(res,rej){var s=document.createElement("script");s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
function ocrMsg(t){$("ocrt").textContent=PRT(t)}
function wordsOf(d){
  var o=[];
  (d.blocks||[]).forEach(function(b){(b.paragraphs||[]).forEach(function(p){(p.lines||[]).forEach(function(l){(l.words||[]).forEach(function(w){o.push(w)})})})});
  return o;
}
async function ocr(){
  if(need()) return;
  stopSpeech();
  try{if(!window.Tesseract) await loadScript("vendor/tesseract.min.js")}
  catch(e){return toast("Não foi possível carregar o OCR. Verifique a internet.")}
  toast("Procurando páginas sem texto…");
  var todo=[];
  for(var n=1;n<=total;n++){
    var tc=await(await doc.getPage(n)).getTextContent();
    if(!tc.items.some(function(i){return i.str&&i.str.trim()})) todo.push(n);
  }
  if(!todo.length) return toast("Todas as páginas já têm texto. Nada para reconhecer.");
  if(!confirm(todo.length+" página(s) sem texto serão reconhecidas.\nPode levar alguns minutos, e o idioma é baixado na primeira vez. Continuar?")) return;
  ocrBusy=true;ocrStop=false;$("ocrbar").classList.add("on");ocrMsg("Preparando o OCR…");
  var res={},lab="Preparando",w=null;
  try{
    if(hasAnns()){snap();bytes=await bake();anns={};sel=null;await loadBytes()}
    w=ocrW=await Tesseract.createWorker(ls("pr:ocrlang","por").split("+"),1,{workerPath:"vendor/tesseract-worker.min.js",corePath:"vendor/tesseract-core",langPath:"vendor/tessdata",logger:function(m){
      var p=m.progress!=null?" "+Math.round(m.progress*100)+"%":"";
      ocrMsg((/language|loading|initializ/.test(m.status||"")?"Preparando o idioma…":lab)+p);
    }});
    for(var i=0;i<todo.length&&!ocrStop;i++){
      var pn=todo[i];lab="Página "+(i+1)+" de "+todo.length;ocrMsg(lab);
      var pg=await doc.getPage(pn),b=pg.getViewport({scale:1}),k=Math.max(1.5,Math.min(3.5,2200/b.width)),vp=pg.getViewport({scale:k}),c=document.createElement("canvas");
      c.width=Math.round(vp.width);c.height=Math.round(vp.height);
      var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
      await pg.render({canvasContext:x,viewport:vp}).promise;
      var r;
      try{r=await Promise.race([w.recognize(c),new Promise(function(_,rej){ocrRej=rej})])}
      catch(e){if(ocrStop) break;throw e}
      c.width=c.height=0;
      res[pn]=wordsOf(r.data).filter(function(q){return q.text&&q.text.trim()&&q.bbox}).map(function(q){
        var bb=q.bbox;return{t:"ocr",txt:q.text.trim(),x:bb.x0/k,y:bb.y0/k,w:(bb.x1-bb.x0)/k,h:(bb.y1-bb.y0)/k};
      });
    }
  }catch(e){toast("O OCR falhou. Verifique a internet e tente de novo.")}
  try{if(w) await w.terminate()}catch(e){}
  ocrW=null;ocrRej=null;ocrBusy=false;$("ocrbar").classList.remove("on");
  var pages=Object.keys(res).filter(function(n){return res[n].length});
  if(!pages.length) return toast(ocrStop?"OCR cancelado.":"Não encontrei texto nas páginas.");
  toast("Aplicando o texto ao PDF…");
  try{
    var pdf=await PDFLib.PDFDocument.load(bytes,{ignoreEncryption:true}),font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica);
    for(var q=0;q<pages.length;q++) await drawAnns(pdf,pdf.getPage(+pages[q]-1),font,res[pages[q]]);
    snap();bytes=await pdf.save();
    await loadBytes();await renderPage();
    toast("Texto reconhecido em "+pages.length+" página(s). Agora dá para buscar, copiar e ouvir.");
  }catch(e){toast("Não consegui aplicar o texto ao PDF.")}
}
$("eocr").onclick=$("t6").onclick=ocr;
$("ocrx").onclick=function(){ocrStop=true;ocrMsg("Cancelando…");if(ocrRej) ocrRej(new Error("cancel"));try{if(ocrW) ocrW.terminate()}catch(e){}};
document.addEventListener("change",function(e){if(e.target.id==="olg") ss("pr:ocrlang",e.target.value)});

/* ===== extras: posição salva, atalhos, modais, assinatura, carimbos, páginas e exportações ===== */
function posKey(){return file?"pr:pos:"+file.name+":"+file.size:""}
function savePos(){if(file) ss(posKey(),{p:cur,z:zoom})}
function b64(u){var b=atob(u.split(",")[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++) a[i]=b.charCodeAt(i);return a}
function readURL(f){return new Promise(function(res,rej){var r=new FileReader();r.onload=function(){res(r.result)};r.onerror=rej;r.readAsDataURL(f)})}
function loadImg(u){return new Promise(function(res,rej){var i=new Image();i.onload=function(){res(i)};i.onerror=rej;i.src=u})}
function baseName(){return file?file.name.replace(/\.pdf$/i,""):"documento"}

/* aplica uma alteração no PDF inteiro (com desfazer) */
async function mutate(fn,ok){
  if(need()) return;
  stopSpeech();toast("Aplicando…");snap();
  try{
    var pdf=await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true});
    var keep=await fn(pdf);
    bytes=await pdf.save();anns={};sel=null;
    await loadBytes();if(keep&&keep.cur) cur=keep.cur;
    cur=Math.max(1,Math.min(cur,total));await renderPage();
    if(ok) toast(ok);
  }catch(e){undos.pop();toast("Não consegui aplicar a alteração.")}
}
function viewSize(pg){
  var cb=pg.getCropBox(),R=((pg.getRotation().angle%360)+360)%360;
  return{w:R%180?cb.height:cb.width,h:R%180?cb.width:cb.height};
}

/* modais e menu */
function openModal(h){$("mbox").innerHTML=h;$("mod").classList.add("on")}
function closeModal(){$("mod").classList.remove("on");$("mbox").innerHTML=""}
$("mod").addEventListener("click",function(e){if(e.target===$("mod")) closeModal()});
$("mbox").addEventListener("click",function(e){
  var b=e.target.closest("[data-m]");if(b&&b.dataset.m==="x"){closeModal();return}
  var t=e.target.closest("[data-p]");if(t&&+t.dataset.p){var n=+t.dataset.p;closeModal();go(n)}
});
$("emore").onclick=function(e){e.stopPropagation();$("pop").classList.toggle("on")};
document.addEventListener("click",function(e){if(!e.target.closest("#pop")&&!e.target.closest("#emore")) $("pop").classList.remove("on")});
$("pop").addEventListener("click",function(e){var b=e.target.closest("[data-act]");if(!b) return;$("pop").classList.remove("on");ACT[b.dataset.act]()});

/* assinatura desenhada (fica salva no navegador) */
function trimCanvas(c){
  var w=c.width,h=c.height,d=c.getContext("2d").getImageData(0,0,w,h).data,x0=w,y0=h,x1=-1,y1=-1;
  for(var y=0;y<h;y++) for(var x=0;x<w;x++) if(d[(y*w+x)*4+3]>10){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}
  if(x1<0) return null;
  var p=6,o=document.createElement("canvas");o.width=x1-x0+1+p*2;o.height=y1-y0+1+p*2;
  o.getContext("2d").drawImage(c,x0,y0,x1-x0+1,y1-y0+1,p,p,x1-x0+1,y1-y0+1);
  return o.toDataURL("image/png");
}
function sigDlg(){
  if(need()) return;
  openModal('<h3>Assinatura</h3><p class="mut" style="margin:0 0 10px;font-size:13px">Desenhe com o dedo ou o mouse. Ela fica salva neste navegador para você usar de novo.</p><canvas id="sgc" width="560" height="200" style="width:100%;background:#fff;border-radius:10px;touch-action:none;cursor:crosshair"></canvas><div class="mbtn"><button class="btn sm gh" data-m="x">Cancelar</button><button class="btn sm gh" id="sgx">Limpar</button><button class="btn sm" id="sgo">Inserir no PDF</button></div>');
  var c=$("sgc"),x=c.getContext("2d"),down=false,old=ls("pr:sig",null);
  x.lineWidth=4;x.lineCap="round";x.lineJoin="round";x.strokeStyle="#111";
  if(old){var im=new Image();im.onload=function(){var k=Math.min(c.width/im.width,c.height/im.height,1);x.drawImage(im,(c.width-im.width*k)/2,(c.height-im.height*k)/2,im.width*k,im.height*k)};im.src=old}
  function pos(e){var r=c.getBoundingClientRect();return[(e.clientX-r.left)*c.width/r.width,(e.clientY-r.top)*c.height/r.height]}
  c.onpointerdown=function(e){down=true;var p=pos(e);x.beginPath();x.moveTo(p[0],p[1]);x.lineTo(p[0]+.1,p[1]);x.stroke();c.setPointerCapture(e.pointerId)};
  c.onpointermove=function(e){if(!down) return;var p=pos(e);x.lineTo(p[0],p[1]);x.stroke()};
  c.onpointerup=c.onpointercancel=function(){down=false};
  $("sgx").onclick=function(){x.clearRect(0,0,c.width,c.height)};
  $("sgo").onclick=function(){var u=trimCanvas(c);if(!u) return toast("Desenhe a assinatura primeiro.");ss("pr:sig",u);closeModal();addImg(u,.25)};
}
$("esig").onclick=sigDlg;

/* carimbos */
var STAMP={"Data de hoje":"#2f6bff","APROVADO":"#16a34a","REPROVADO":"#dc2626","CÓPIA":"#2f6bff","CONFIDENCIAL":"#dc2626","URGENTE":"#dc2626","PAGO":"#16a34a"};
function stampImg(t,col){
  var k=document.createElement("canvas"),x=k.getContext("2d"),f="bold 64px Helvetica,Arial,sans-serif";
  x.font=f;var w=Math.ceil(x.measureText(t).width)+64,h=112;
  k.width=w;k.height=h;x.font=f;x.strokeStyle=x.fillStyle=col;x.lineWidth=8;x.globalAlpha=.9;
  x.strokeRect(6,6,w-12,h-12);x.textBaseline="middle";x.textAlign="center";x.fillText(t,w/2,h/2+4);
  return k.toDataURL("image/png");
}
$("estp").onchange=function(){
  var v=this.value;this.value="";if(!v||need()) return;
  addImg(stampImg(v==="Data de hoje"?new Date().toLocaleDateString("pt-BR"):v,STAMP[v]||"#2f6bff"),.28);
};

/* marca d'água, numeração, página em branco, cortar margens */
function watermark(){
  if(need()) return;
  var t=prompt("Texto da marca d'água:","CONFIDENCIAL");if(!t||!t.trim()) return;
  var tx=t.trim().replace(/[^\x20-\x7E\xA0-\xFF]/g,"?");
  mutate(async function(pdf){
    var font=await pdf.embedFont(PDFLib.StandardFonts.HelveticaBold),ps=pdf.getPages(),cs=Math.SQRT1_2;
    for(var i=0;i<ps.length;i++){
      var v=viewSize(ps[i]),s=Math.max(18,Math.min(110,.7*Math.hypot(v.w,v.h)/(font.widthOfTextAtSize(tx,1)||1))),tw=font.widthOfTextAtSize(tx,s);
      var bx=v.w/2-tw/2*cs+s*.35*cs,by=v.h/2+tw/2*cs+s*.35*cs;
      await drawAnns(pdf,ps[i],font,[{t:"text",txt:tx,x:bx,y:by-s*.9,s:s,c:"#808080",op:.22,rot:45}]);
    }
  },"Marca d'água aplicada em todas as páginas.");
}
function numberPages(){
  if(need()) return;
  var f=prompt("Formato da numeração ({n} = página, {t} = total):","Página {n} de {t}");if(!f||!f.trim()) return;
  mutate(async function(pdf){
    var font=await pdf.embedFont(PDFLib.StandardFonts.Helvetica),ps=pdf.getPages(),t=ps.length;
    for(var i=0;i<t;i++){
      var v=viewSize(ps[i]),tx=f.split("{n}").join(i+1).split("{t}").join(t).replace(/[^\x20-\x7E\xA0-\xFF]/g,"?"),tw=font.widthOfTextAtSize(tx,10);
      await drawAnns(pdf,ps[i],font,[{t:"text",txt:tx,x:(v.w-tw)/2,y:v.h-26,s:10,c:"#555555"}]);
    }
  },"Páginas numeradas.");
}
function blankPage(){
  mutate(function(pdf){var v=viewSize(pdf.getPage(cur-1));pdf.insertPage(cur,[v.w,v.h]);return{cur:cur+1}},"Página em branco inserida depois da atual.");
}
function cropMargins(){
  if(need()) return;
  var t=prompt("Quantos milímetros cortar de cada margem? (ex.: 10)","10");if(t===null) return;
  var mm=parseFloat(String(t).replace(",","."));if(!(mm>0)||mm>100) return toast("Valor inválido.");
  var all=confirm("Aplicar em todas as páginas?\nOK = todas · Cancelar = só a página atual"),m=mm*72/25.4;
  mutate(function(pdf){
    (all?pdf.getPages():[pdf.getPage(cur-1)]).forEach(function(pg){
      var b=pg.getCropBox();if(b.width>2*m+20&&b.height>2*m+20) pg.setCropBox(b.x+m,b.y+m,b.width-2*m,b.height-2*m);
    });
  },"Margens cortadas.");
}

/* formulários PDF */
async function formDlg(){
  if(need()) return;
  try{
    var P=PDFLib,pdf=await P.PDFDocument.load(await bake(),{ignoreEncryption:true}),fs=pdf.getForm().getFields(),h="",any=false;
    fs.forEach(function(f,i){
      var n=esc(f.getName());
      if(f instanceof P.PDFTextField){any=true;h+='<label class="fl">'+n+'<input data-f="'+i+'" data-k="t" value="'+esc(f.getText()||"")+'"></label>'}
      else if(f instanceof P.PDFCheckBox){any=true;h+='<label class="fl ck"><input type="checkbox" data-f="'+i+'" data-k="c"'+(f.isChecked()?" checked":"")+"> "+n+"</label>"}
      else if(f instanceof P.PDFDropdown||f instanceof P.PDFRadioGroup||f instanceof P.PDFOptionList){
        any=true;var sv=f.getSelected?f.getSelected():"";if(Array.isArray(sv)) sv=sv[0]||"";
        h+='<label class="fl">'+n+'<select data-f="'+i+'" data-k="s"><option value=""></option>'+f.getOptions().map(function(o){return"<option"+(o===sv?" selected":"")+">"+esc(o)+"</option>"}).join("")+"</select></label>";
      }
    });
    if(!any) return toast("Este PDF não tem campos que dê para preencher.");
    openModal("<h3>Preencher formulário</h3>"+h+'<label class="fl ck"><input type="checkbox" id="flt"> Achatar (travar os campos depois de preencher)</label><div class="mbtn"><button class="btn sm gh" data-m="x">Cancelar</button><button class="btn sm" id="fla">Aplicar</button></div>');
    $("fla").onclick=function(){
      var vals=[];$$("#mbox [data-f]").forEach(function(el){vals.push({i:+el.dataset.f,k:el.dataset.k,v:el.type==="checkbox"?el.checked:el.value})});
      var flat=$("flt").checked;closeModal();
      mutate(async function(p){
        var form=p.getForm(),all=form.getFields(),font=await p.embedFont(P.StandardFonts.Helvetica);
        vals.forEach(function(x){var f=all[x.i];if(x.k==="t") f.setText(x.v);else if(x.k==="c"){if(x.v) f.check();else f.uncheck()}else if(x.v) f.select(x.v)});
        form.updateFieldAppearances(font);if(flat) form.flatten();
      },"Formulário preenchido.");
    };
  }catch(e){toast("Não consegui ler os campos deste PDF.")}
}

/* índice (marcadores) */
async function tocDlg(){
  if(need()) return;
  var ol=await doc.getOutline();
  if(!ol||!ol.length) return toast("Este PDF não tem índice (marcadores).");
  var rows=[];
  async function walk(items,lv){
    for(var i=0;i<items.length;i++){
      var it=items[i],p=0;
      try{var d=it.dest;if(typeof d==="string") d=await doc.getDestination(d);if(Array.isArray(d)) p=(await doc.getPageIndex(d[0]))+1}catch(e){}
      rows.push({t:it.title,p:p,l:lv});
      if(it.items&&it.items.length) await walk(it.items,lv+1);
    }
  }
  await walk(ol,0);
  openModal("<h3>Índice</h3>"+rows.map(function(r){return'<button class="toc" data-p="'+r.p+'" style="padding-left:'+(12+r.l*18)+'px"><b style="font-weight:400">'+esc(r.t)+"</b>"+(r.p?"<span>"+r.p+"</span>":"")+"</button>"}).join("")+'<div class="mbtn"><button class="btn sm gh" data-m="x">Fechar</button></div>');
}

/* imagens para PDF */
$("i2p").onchange=async function(e){
  var fs=Array.prototype.slice.call(e.target.files);e.target.value="";if(!fs.length) return;
  if(ocrBusy) return toast("Aguarde o OCR terminar ou cancele.");
  toast("Convertendo imagens…");
  try{
    var base=doc?await PDFLib.PDFDocument.load(await bake(),{ignoreEncryption:true}):await PDFLib.PDFDocument.create();
    for(var i=0;i<fs.length;i++){
      var im=await loadImg(await readURL(fs[i])),m=Math.max(im.naturalWidth,im.naturalHeight),pt=m>842?842/m:1,px=Math.min(1,2400/m);
      var c=document.createElement("canvas"),x=c.getContext("2d");c.width=Math.round(im.naturalWidth*px);c.height=Math.round(im.naturalHeight*px);
      x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);x.drawImage(im,0,0,c.width,c.height);
      var jp=await base.embedJpg(b64(c.toDataURL("image/jpeg",.9))),w=im.naturalWidth*pt,h=im.naturalHeight*pt;
      base.addPage([w,h]).drawImage(jp,{x:0,y:0,width:w,height:h});
    }
    var out=await base.save();
    if(!doc){await openFile(new File([out],"Imagens.pdf",{type:"application/pdf"}));return}
    stopSpeech();snap();bytes=out;anns={};sel=null;await loadBytes();await renderPage();
    toast(fs.length+" imagem(ns) adicionada(s) como página(s) no final.");
  }catch(err){toast("Não consegui converter as imagens.")}
};

/* comprimir */
async function compress(){
  if(need()) return;
  var q=prompt("Qualidade da compressão: 1 = menor arquivo, 2 = equilibrada, 3 = melhor qualidade","2");if(q===null) return;
  var P=[[1,.5],[1.4,.65],[2,.8]][(parseInt(q,10)||2)-1];if(!P) return toast("Escolha 1, 2 ou 3.");
  if(!confirm("Comprimir deixa cada página como imagem: o texto deixa de ser selecionável (o OCR pode refazer). Será gerado um arquivo novo, e o que está aberto não muda. Continuar?")) return;
  try{
    if(hasAnns()){snap();bytes=await bake();anns={};sel=null;await loadBytes()}
    var out=await PDFLib.PDFDocument.create(),before=bytes.length;
    for(var n=1;n<=total;n++){
      toast("Comprimindo página "+n+" de "+total+"…");
      var pg=await doc.getPage(n),b=pg.getViewport({scale:1}),vp=pg.getViewport({scale:P[0]}),c=document.createElement("canvas");
      c.width=Math.round(vp.width);c.height=Math.round(vp.height);
      var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
      await pg.render({canvasContext:x,viewport:vp}).promise;
      var jp=await out.embedJpg(b64(c.toDataURL("image/jpeg",P[1])));
      out.addPage([b.width,b.height]).drawImage(jp,{x:0,y:0,width:b.width,height:b.height});
      c.width=c.height=0;
    }
    var res=await out.save();
    download(res,baseName()+"-comprimido.pdf");
    toast(res.length<before?"Original "+fmt(before)+" → comprimido "+fmt(res.length)+".":"O arquivo não ficou menor ("+fmt(res.length)+"). Tente a opção 1.");
  }catch(e){toast("Não consegui comprimir o PDF.")}
}

/* exportações e modo escuro das páginas */
async function exportTxt(){
  if(need()) return;
  toast("Extraindo texto…");
  var out="";
  for(var n=1;n<=total;n++){
    var tc=await(await doc.getPage(n)).getTextContent(),t="";
    tc.items.forEach(function(i){if(i.str!==undefined) t+=i.str+(i.hasEOL?"\n":" ")});
    out+="--- Página "+n+" ---\n"+t.trim()+"\n\n";
  }
  if(!out.replace(/--- Página \d+ ---|\s/g,"")) return toast("Não há texto neste PDF. Tente o OCR primeiro.");
  download(out,baseName()+".txt","text/plain;charset=utf-8");toast("Texto exportado.");
}
async function exportPng(){
  if(need()) return;
  toast("Gerando imagem…");
  var pg=await doc.getPage(cur),vp=pg.getViewport({scale:2.5}),c=document.createElement("canvas");
  c.width=Math.round(vp.width);c.height=Math.round(vp.height);
  var x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,c.width,c.height);
  await pg.render({canvasContext:x,viewport:vp}).promise;
  c.toBlob(function(b){download(b,baseName()+"-pagina-"+cur+".png","image/png");toast("Imagem da página "+cur+" baixada (sem as edições ainda não salvas).")},"image/png");
}
function toggleDark(){var on=!ls("pr:inv",false);ss("pr:inv",on);$("cv").classList.toggle("inv",on);toast(on?"Páginas escuras ligadas.":"Páginas escuras desligadas.")}
var ACT={wm:watermark,num:numberPages,blank:blankPage,crop:cropMargins,form:formDlg,toc:tocDlg,i2p:function(){$("i2p").click()},zip:compress,txt:exportTxt,png:exportPng,dark:toggleDark};

/* leitura: pular frases */
function sentStarts(t){var a=[0],re=/[.!?]+\s+/g,m;while((m=re.exec(t))) a.push(m.index+m[0].length);return a}
function skipSent(dir){
  if(!playing||!pd) return;
  var a=sentStarts(pd.text),i=0;while(i+1<a.length&&a[i+1]<=curOff) i++;
  var t=dir>0?i+1:(curOff-a[i]>30?i:i-1);if(t<0) t=0;if(t>=a.length) return;
  speak(a[t]);
}
$("t7").onclick=function(){skipSent(-1)};$("t8").onclick=function(){skipSent(1)};

/* atalhos, idioma e modo offline */
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"){closeModal();$("pop").classList.remove("on");return}
  var tg=(e.target&&e.target.tagName)||"";
  if(/INPUT|TEXTAREA|SELECT/.test(tg)||!doc||ocrBusy||$("mod").classList.contains("on")) return;
  if(e.ctrlKey||e.metaKey){
    var k=e.key.toLowerCase();
    if(k==="z"){e.preventDefault();undo()}else if(k==="s"){e.preventDefault();dl()}
    return;
  }
  if($("home").style.display==="none") return;
  if(e.key==="ArrowRight"||e.key==="PageDown") go(cur+1);
  else if(e.key==="ArrowLeft"||e.key==="PageUp") go(cur-1);
  else if(e.key==="+"||e.key==="=") setZoom(zoom+.25);
  else if(e.key==="-") setZoom(zoom-.25);
  else if(e.key==="0") setZoom(1);
});
document.addEventListener("change",function(e){if(e.target.id==="lgs"){ss("pr:lang",e.target.value);location.reload()}});
if("serviceWorker" in navigator&&/^https?:$/.test(location.protocol)) navigator.serviceWorker.register("sw.js").catch(function(){});
window.addEventListener("resize",function(){clearTimeout(window._rz);window._rz=setTimeout(function(){if(doc&&!playing) renderPage()},250)});
window.addEventListener("beforeunload",function(){if(synth) synth.cancel()});
})();
