/* ════════ UTILITIES ════════ */
const lerp = (a,b,t) => a+(b-a)*t;
function easeOut(t){return 1-Math.pow(1-t,3)}
function easeInOut(t){return t<.5?2*t*t:1-(Math.pow(-2*t+2,2)/2)}

/* ════════ LENIS SMOOTH SCROLL ════════ */
let lenis;
try{
  lenis = new Lenis({
    duration:1.2,easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)),
    smooth:true,smoothTouch:false,
  });
  function raf(time){lenis.raf(time);requestAnimationFrame(raf)}
  requestAnimationFrame(raf);
}catch(e){console.warn('Lenis not loaded, using native scroll')}

/* ════════ CURSOR GLOW ════════ */
const cg = document.getElementById('cursor-glow');
document.addEventListener('mousemove',e=>{
  cg.style.left=e.clientX+'px';
  cg.style.top=e.clientY+'px';
});

/* ════════ NAV ════════ */
const mainNav=document.getElementById('mainNav');
window.addEventListener('scroll',()=>mainNav.classList.toggle('scrolled',window.scrollY>60));
document.getElementById('hamburger').addEventListener('click',()=>
  document.getElementById('mobileMenu').classList.toggle('open'));
document.querySelectorAll('#mobileMenu a').forEach(a=>
  a.addEventListener('click',()=>document.getElementById('mobileMenu').classList.remove('open')));

/* ════════ MARQUEE ════════ */
const marqItems=['FSC-Certified Wood','6 Shape Families','Montessori Aligned','EN71 Certified','STEM-Focused','Award-Winning Design','Non-Toxic Paints','28 Countries','140K Families','Carbon Neutral 2023','Lifetime Guarantee','Safety First'];
const track=document.getElementById('marqueeTrack');
[...marqItems,...marqItems].forEach(txt=>{
  const el=document.createElement('div');
  el.className='marquee-item';
  el.innerHTML=`<span class="marquee-dot"></span>${txt}`;
  track.appendChild(el);
});

/* ════════ REVEAL OBSERVER ════════ */
const revealEls=document.querySelectorAll('.reveal,.reveal-l,.reveal-r');
const revObs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')});
},{threshold:.12,rootMargin:'0px 0px -60px 0px'});
revealEls.forEach(el=>revObs.observe(el));

/* ════════════════════════════════════
   HERO CANVAS — floating toy shapes particles (light mode)
════════════════════════════════════ */
(function(){
  const canvas=document.getElementById('hero-canvas');
  if(!canvas)return;
  let W=window.innerWidth,H=window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,W/H,.1,200);
  camera.position.z=22;

  const palette=[0xFF5A2C,0xFFD025,0x00C49A,0x8B6FE8,0xF53FA5,0x2BB8FF];
  const geos=[
    new THREE.BoxGeometry(.5,.5,.5),
    new THREE.OctahedronGeometry(.42),
    new THREE.TetrahedronGeometry(.46),
    new THREE.CylinderGeometry(0,.4,.75,5),
    new THREE.TorusGeometry(.36,.1,8,24),
    new THREE.CylinderGeometry(.38,.38,.2,6),
    new THREE.SphereGeometry(.3,12,12),
  ];
  const particles=[];
  for(let i=0;i<55;i++){
    const m=new THREE.Mesh(
      geos[i%geos.length],
      new THREE.MeshPhongMaterial({
        color:palette[i%6],
        opacity:.18+Math.random()*.22,
        transparent:true,
        shininess:80,
      })
    );
    m.position.set((Math.random()-.5)*48,(Math.random()-.5)*28,(Math.random()-.5)*12-6);
    m.userData={
      rx:(Math.random()-.5)*.022,
      ry:(Math.random()-.5)*.018,
      oy:m.position.y,
      fs:.4+Math.random()*.6,
      fo:Math.random()*Math.PI*2,
    };
    scene.add(m);
    particles.push(m);
  }
  scene.add(new THREE.AmbientLight(0xffffff,.5));
  const l1=new THREE.PointLight(0xFF5A2C,4,50);l1.position.set(0,8,10);scene.add(l1);
  const l2=new THREE.PointLight(0x8B6FE8,3,40);l2.position.set(-14,-6,6);scene.add(l2);
  const l3=new THREE.PointLight(0xFFD025,2.5,35);l3.position.set(14,6,4);scene.add(l3);

  let t=0;
  (function tick(){
    requestAnimationFrame(tick);t+=.012;
    particles.forEach(p=>{
      const u=p.userData;
      p.rotation.x+=u.rx;p.rotation.y+=u.ry;
      p.position.y=u.oy+Math.sin(t*u.fs+u.fo)*.7;
    });
    l1.position.x=Math.cos(t*.6)*10;l1.position.y=Math.sin(t*.4)*7;
    l2.position.x=Math.cos(t*.5+2)*12;
    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',()=>{
    W=window.innerWidth;H=window.innerHeight;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  });
})();

/* ════════════════════════════════════
   TOY 1 — Shape Sorter 3D (draggable)
════════════════════════════════════ */
(function(){
  const canvas=document.getElementById('toy1-canvas');
  if(!canvas)return;
  const wrap=canvas.parentElement;
  let W=wrap.clientWidth,H=wrap.clientHeight||W;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(48,W/H,.1,100);
  camera.position.set(0,2,10);

  scene.add(new THREE.AmbientLight(0xffffff,.6));
  const key=new THREE.PointLight(0xffffff,5,40);key.position.set(5,8,8);key.castShadow=true;scene.add(key);
  const fill=new THREE.PointLight(0xFF5A2C,2.5,30);fill.position.set(-5,-3,5);scene.add(fill);
  const rim=new THREE.PointLight(0xFFD025,2,25);rim.position.set(3,6,-4);scene.add(rim);

  const group=new THREE.Group();
  scene.add(group);

  // Base board
  const board=new THREE.Mesh(
    new THREE.BoxGeometry(4.8,.28,2.2),
    new THREE.MeshPhongMaterial({color:0xE8C97A,shininess:60,specular:new THREE.Color(.2,.15,.05)})
  );
  board.position.y=-1.7;board.castShadow=true;board.receiveShadow=true;
  group.add(board);
  const boardEdge=new THREE.Mesh(
    new THREE.BoxGeometry(4.9,.08,2.3),
    new THREE.MeshPhongMaterial({color:0xD4A855,shininess:80})
  );
  boardEdge.position.y=-1.57;group.add(boardEdge);

  // 5 columns: hex, circle, triangle, square, diamond
  const cols=[
    {x:-2.2,color:0xFF5A2C,seg:6},
    {x:-1.1,color:0xFFD025,seg:32},
    {x:0,color:0x00C49A,seg:3},
    {x:1.1,color:0x2BB8FF,seg:4},
    {x:2.2,color:0x8B6FE8,seg:4,rot:Math.PI/4},
  ];

  cols.forEach(col=>{
    // Peg
    const peg=new THREE.Mesh(
      new THREE.CylinderGeometry(.1,.1,2.2,12),
      new THREE.MeshPhongMaterial({color:0xE8D5A0,shininess:90})
    );
    peg.position.set(col.x,-.1,0);peg.castShadow=true;
    group.add(peg);

    // Base disc
    const disc=new THREE.Mesh(
      new THREE.CylinderGeometry(.65,.65,.15,col.seg),
      new THREE.MeshPhongMaterial({color:col.color,shininess:80,specular:new THREE.Color(.2,.2,.2)})
    );
    disc.position.set(col.x,-1.58,0);disc.castShadow=true;
    if(col.rot)disc.rotation.y=col.rot;
    group.add(disc);

    // 3 stacking shapes
    for(let layer=0;layer<3;layer++){
      const r=.58-layer*.09;
      let geo;
      if(col.seg===3)geo=new THREE.CylinderGeometry(0,r,.32,3);
      else if(col.seg===4){
        if(col.rot)geo=new THREE.BoxGeometry(r*1.5,.27,r*1.5);
        else geo=new THREE.BoxGeometry(r*1.6,.27,r*1.6);
      }
      else geo=new THREE.CylinderGeometry(r,r,.27,col.seg);
      const shade=new THREE.Color(col.color);
      shade.offsetHSL(0,0,layer*.06-.05);
      const p=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:shade,shininess:100,specular:new THREE.Color(.25,.25,.25)}));
      p.position.set(col.x,-1.24+layer*.42,0);
      if(col.rot)p.rotation.y=col.rot;
      p.castShadow=true;
      group.add(p);
    }
  });

  // Drag
  let isDrag=false,lastX=0,lastY=0,rotX=.3,rotY=.4,velX=0,velY=0;
  canvas.addEventListener('mousedown',e=>{isDrag=true;lastX=e.clientX;lastY=e.clientY;velX=velY=0});
  window.addEventListener('mouseup',()=>{isDrag=false});
  window.addEventListener('mousemove',e=>{
    if(!isDrag)return;
    velY=(e.clientX-lastX)*.008;velX=(e.clientY-lastY)*.008;
    rotY+=velY;rotX+=velX;rotX=Math.max(-.6,Math.min(.8,rotX));
    lastX=e.clientX;lastY=e.clientY;
  });
  canvas.addEventListener('touchstart',e=>{isDrag=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY},{passive:true});
  window.addEventListener('touchend',()=>{isDrag=false});
  window.addEventListener('touchmove',e=>{
    if(!isDrag)return;
    velY=(e.touches[0].clientX-lastX)*.009;velX=(e.touches[0].clientY-lastY)*.009;
    rotY+=velY;rotX+=velX;rotX=Math.max(-.6,Math.min(.8,rotX));
    lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
  },{passive:true});

  let t=0;
  (function tick(){
    requestAnimationFrame(tick);t+=.014;
    if(!isDrag){velX*=.92;velY*=.92;rotX+=velX;rotY+=velY;rotX=Math.max(-.6,Math.min(.8,rotX))}
    if(!isDrag&&Math.abs(velX)<.001&&Math.abs(velY)<.001)rotY+=.006;
    group.rotation.x=rotX;group.rotation.y=rotY;
    group.position.y=Math.sin(t*.5)*.15;
    key.intensity=4.5+Math.sin(t*.7)*.5;
    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',()=>{
    W=wrap.clientWidth;H=wrap.clientHeight||W;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  });
})();

/* ════════════════════════════════════
   TOY 2 — Abacus/Color Slide 3D (draggable)
════════════════════════════════════ */
(function(){
  const canvas=document.getElementById('toy2-canvas');
  if(!canvas)return;
  const wrap=canvas.parentElement;
  let W=wrap.clientWidth,H=wrap.clientHeight||W;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(48,W/H,.1,100);
  camera.position.set(0,1.5,11);

  scene.add(new THREE.AmbientLight(0xffffff,.55));
  const key=new THREE.PointLight(0xffffff,5.5,45);key.position.set(5,8,8);key.castShadow=true;scene.add(key);
  const fill=new THREE.PointLight(0x8B6FE8,3,30);fill.position.set(-6,-3,5);scene.add(fill);
  const rim=new THREE.PointLight(0xF53FA5,2,22);rim.position.set(4,6,-4);scene.add(rim);

  const group=new THREE.Group();
  scene.add(group);

  // Frame
  const frameMat=new THREE.MeshPhongMaterial({color:0xFFD025,shininess:80,specular:new THREE.Color(.25,.2,0)});
  const fTop=new THREE.Mesh(new THREE.BoxGeometry(4,.22,0.32),frameMat);fTop.position.y=2;fTop.castShadow=true;group.add(fTop);
  const fBot=new THREE.Mesh(new THREE.BoxGeometry(4,.22,0.32),frameMat);fBot.position.y=-2;fBot.castShadow=true;group.add(fBot);
  const fL=new THREE.Mesh(new THREE.BoxGeometry(.22,4.22,0.32),frameMat);fL.position.x=-2;fL.castShadow=true;group.add(fL);
  const fR=new THREE.Mesh(new THREE.BoxGeometry(.22,4.22,0.32),frameMat);fR.position.x=2;fR.castShadow=true;group.add(fR);

  // 4 rails with 3 beads each
  const railColors=[[0xFF5A2C,0xFF8A65],[0x8B6FE8,0xB39DDB],[0x2BB8FF,0x81D4FA],[0x00C49A,0x80CBC4]];
  const beadAnims=[];
  for(let c=0;c<4;c++){
    const rx=(c-1.5)*1.1;
    // Rail
    const rail=new THREE.Mesh(
      new THREE.CylinderGeometry(.055,.055,3.6,10),
      new THREE.MeshPhongMaterial({color:0xD4A855,shininess:60})
    );
    rail.position.set(rx,0,0);group.add(rail);

    for(let b=0;b<3;b++){
      const bead=new THREE.Mesh(
        new THREE.CylinderGeometry(.42,.42,.32,28),
        new THREE.MeshPhongMaterial({color:railColors[c][b%2],shininess:110,specular:new THREE.Color(.3,.3,.3)})
      );
      const baseY=-1.3+b*.9;
      bead.position.set(rx,baseY,0);bead.castShadow=true;group.add(bead);
      beadAnims.push({mesh:bead,baseY,phase:c*.8+b*.6,speed:.6+Math.random()*.35,amp:.3+Math.random()*.2});
    }
  }

  // Drag
  let isDrag=false,lastX=0,lastY=0,rotX=.2,rotY=.3,velX=0,velY=0;
  canvas.addEventListener('mousedown',e=>{isDrag=true;lastX=e.clientX;lastY=e.clientY;velX=velY=0});
  window.addEventListener('mouseup',()=>{isDrag=false});
  window.addEventListener('mousemove',e=>{
    if(!isDrag)return;
    velY=(e.clientX-lastX)*.008;velX=(e.clientY-lastY)*.008;
    rotY+=velY;rotX+=velX;rotX=Math.max(-.55,Math.min(.7,rotX));
    lastX=e.clientX;lastY=e.clientY;
  });
  canvas.addEventListener('touchstart',e=>{isDrag=true;lastX=e.touches[0].clientX;lastY=e.touches[0].clientY},{passive:true});
  window.addEventListener('touchend',()=>{isDrag=false});
  window.addEventListener('touchmove',e=>{
    if(!isDrag)return;
    velY=(e.touches[0].clientX-lastX)*.009;velX=(e.touches[0].clientY-lastY)*.009;
    rotY+=velY;rotX+=velX;rotX=Math.max(-.55,Math.min(.7,rotX));
    lastX=e.touches[0].clientX;lastY=e.touches[0].clientY;
  },{passive:true});

  let t=0;
  (function tick(){
    requestAnimationFrame(tick);t+=.014;
    if(!isDrag){velX*=.92;velY*=.92;rotX+=velX;rotY+=velY;rotX=Math.max(-.55,Math.min(.7,rotX))}
    if(!isDrag&&Math.abs(velX)<.001&&Math.abs(velY)<.001)rotY+=.007;
    group.rotation.x=rotX;group.rotation.y=rotY;
    group.position.y=Math.sin(t*.5)*.12;
    beadAnims.forEach(b=>{
      b.mesh.position.y=b.baseY+Math.sin(t*b.speed+b.phase)*b.amp;
    });
    key.intensity=5+Math.sin(t*.7)*.6;
    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',()=>{
    W=wrap.clientWidth;H=wrap.clientHeight||W;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  });
})();

/* ════════════════════════════════════
   SCROLL SHOWCASE — shape-sorter assembly (dark section)
   Video texture underneath + Three.js assembly on top
════════════════════════════════════ */
(function(){
  const section=document.getElementById('showcase');
  const canvas=document.getElementById('showcase-canvas');
  if(!canvas||!section)return;
  let W=window.innerWidth,H=window.innerHeight;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0x18182A,1);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(50,W/H,.1,100);
  camera.position.set(0,1,14);

  scene.add(new THREE.AmbientLight(0xffffff,.4));
  const keyLight=new THREE.PointLight(0xffffff,5.5,50);keyLight.position.set(6,10,10);keyLight.castShadow=true;scene.add(keyLight);
  const fillLight=new THREE.PointLight(0xFFD025,3,35);fillLight.position.set(-8,-4,6);scene.add(fillLight);
  const rimLight=new THREE.PointLight(0xFF5A2C,2.5,30);rimLight.position.set(4,8,-6);scene.add(rimLight);

  const group=new THREE.Group();scene.add(group);

  const board=new THREE.Mesh(
    new THREE.BoxGeometry(6,.32,2.6),
    new THREE.MeshPhongMaterial({color:0xE8C97A,shininess:70,specular:new THREE.Color(.2,.15,.05)})
  );
  board.userData={assembleY:-2,startY:14};
  board.position.y=14;board.castShadow=true;
  group.add(board);

  const boardTop=new THREE.Mesh(
    new THREE.BoxGeometry(6.1,.1,2.7),
    new THREE.MeshPhongMaterial({color:0xD4A855,shininess:90})
  );
  boardTop.userData={assembleY:-1.72,startY:14.3};
  boardTop.position.y=14.3;group.add(boardTop);

  const scCols=[
    {x:-2.5,color:0xFF5A2C,seg:6},
    {x:-1.25,color:0xFFD025,seg:32},
    {x:0,color:0x00C49A,seg:3},
    {x:1.25,color:0x2BB8FF,seg:4},
    {x:2.5,color:0x8B6FE8,seg:4,rot:Math.PI/4},
  ];

  const pieces=[];
  scCols.forEach((col,ci)=>{
    const peg=new THREE.Mesh(
      new THREE.CylinderGeometry(.1,.1,2.4,12),
      new THREE.MeshPhongMaterial({color:0xE8D5A0,shininess:90})
    );
    peg.position.set(col.x,-.5,0);
    peg.userData={assembleY:-.5,startY:9+ci*.5,delay:ci*.14};
    group.add(peg);pieces.push(peg);

    const disc=new THREE.Mesh(
      new THREE.CylinderGeometry(.68,.68,.16,col.seg),
      new THREE.MeshPhongMaterial({color:col.color,shininess:80,specular:new THREE.Color(.2,.2,.2)})
    );
    disc.position.set(col.x,-1.72,0);
    if(col.rot)disc.rotation.y=col.rot;
    disc.userData={assembleY:-1.72,startY:9+ci*.5,delay:ci*.14};
    group.add(disc);pieces.push(disc);

    for(let layer=0;layer<3;layer++){
      const r=.62-layer*.1;
      let geo;
      if(col.seg===3)geo=new THREE.CylinderGeometry(0,r,.3,3);
      else if(col.seg===4){
        if(col.rot)geo=new THREE.BoxGeometry(r*1.5,.28,r*1.5);
        else geo=new THREE.BoxGeometry(r*1.65,.28,r*1.65);
      }else geo=new THREE.CylinderGeometry(r,r,.28,col.seg);
      const shade=new THREE.Color(col.color);shade.offsetHSL(0,0,layer*.07-.06);
      const p=new THREE.Mesh(geo,new THREE.MeshPhongMaterial({color:shade,shininess:100,specular:new THREE.Color(.28,.28,.28)}));
      const fy=-1.3+layer*.43;
      p.position.set(col.x,fy+14,0);
      if(col.rot)p.rotation.y=col.rot;
      p.userData={assembleY:fy,startY:fy+14,delay:(ci*3+layer)*.07};
      group.add(p);pieces.push(p);
    }
  });

  board.position.y=board.userData.startY;
  boardTop.position.y=boardTop.userData.startY;

  const steps=[
    {eye:'The Foundation',title:'Precision-Milled Board',desc:'Each sorting board is CNC-milled from sustainably sourced hardwood to ±0.1mm tolerances.'},
    {eye:'The Pegs',title:'Colour-Coded Posts',desc:'Smooth steel pegs with rubber-tipped caps guide little fingers to the right slot every time.'},
    {eye:'The Shapes',title:'Six Geometry Families',desc:'Hexagon, circle, triangle, square, diamond and star — precision-turned and hand-painted in safe water-based colours.'},
    {eye:'Complete',title:'Ready for Play',desc:'The finished Sort Master: a symphony of colour, geometry, and tactile joy — ready for thousands of hours of discovery.'},
  ];
  const eyeEl=document.getElementById('sc-eye');
  const titleEl=document.getElementById('sc-title');
  const descEl=document.getElementById('sc-desc');
  const dots=document.querySelectorAll('.pdot');
  let lastStep=-1;

  let t=0;
  (function tick(){
    requestAnimationFrame(tick);t+=.013;
    const rect=section.getBoundingClientRect();
    const totalH=section.offsetHeight-window.innerHeight;
    const scrolled=Math.max(0,Math.min(1,-rect.top/totalH));

    const step=Math.min(3,Math.floor(scrolled*4));
    if(step!==lastStep&&steps[step]){
      lastStep=step;
      eyeEl.textContent=steps[step].eye;
      titleEl.textContent=steps[step].title;
      descEl.textContent=steps[step].desc;
      dots.forEach((d,i)=>d.classList.toggle('active',i===step));
    }

    const boardTarget=scrolled>.04?board.userData.assembleY:board.userData.startY;
    board.position.y=lerp(board.position.y,boardTarget,.065);
    boardTop.position.y=lerp(boardTop.position.y,boardTarget+.3,.065);

    pieces.forEach(p=>{
      const d=p.userData;
      const activation=d.delay||0;
      const lp=Math.max(0,Math.min(1,(scrolled-.12-activation)/.62));
      const ty=lerp(d.startY,d.assembleY,easeOut(lp));
      p.position.y=lerp(p.position.y,ty,.052);
      p.rotation.y+=.011;
    });

    group.rotation.x=Math.sin(t*.1)*.05+scrolled*-.08;
    group.rotation.y=Math.sin(t*.14)*.1;
    group.position.x=Math.sin(t*.08)*.15;

    keyLight.intensity=5+Math.sin(t*.6)*.6;
    fillLight.intensity=2.8+Math.cos(t*.4)*.4;

    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',()=>{
    W=window.innerWidth;H=window.innerHeight;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  });
})();

/* ════════════════════════════════════
   CTA CANVAS — toy shape particle cloud
════════════════════════════════════ */
(function(){
  const canvas=document.getElementById('cta-canvas');
  if(!canvas)return;
  const wrap=canvas.parentElement;
  let W=wrap.clientWidth,H=wrap.clientHeight||500;
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true});
  renderer.setSize(W,H);renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.setClearColor(0,0);
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(60,W/H,.1,100);
  camera.position.z=14;

  const palette=[0xFF5A2C,0xFFD025,0x00C49A,0x8B6FE8,0xF53FA5,0x2BB8FF];
  const geos=[
    new THREE.BoxGeometry(.45,.45,.45),
    new THREE.OctahedronGeometry(.38),
    new THREE.TetrahedronGeometry(.42),
    new THREE.CylinderGeometry(0,.38,.7,4),
    new THREE.CylinderGeometry(.35,.35,.18,6),
    new THREE.TorusGeometry(.32,.1,8,20),
  ];
  for(let i=0;i<40;i++){
    const m=new THREE.Mesh(
      geos[i%geos.length],
      new THREE.MeshPhongMaterial({color:palette[i%6],opacity:.2+Math.random()*.3,transparent:true,shininess:90})
    );
    m.position.set((Math.random()-.5)*28,(Math.random()-.5)*18,(Math.random()-.5)*10-4);
    m.userData={ry:(Math.random()-.5)*.026,rx:(Math.random()-.5)*.018,oy:m.position.y,fs:.4+Math.random()*.5,fo:Math.random()*Math.PI*2};
    scene.add(m);
  }
  scene.add(new THREE.AmbientLight(0xffffff,.35));
  const p1=new THREE.PointLight(0xFF5A2C,3.5,36);p1.position.set(0,6,7);scene.add(p1);
  const p2=new THREE.PointLight(0x8B6FE8,2.8,28);p2.position.set(-10,-5,4);scene.add(p2);
  let ct=0;
  (function tick(){
    requestAnimationFrame(tick);ct+=.012;
    scene.children.forEach(m=>{
      if(m.userData.ry!==undefined){
        m.rotation.y+=m.userData.ry;m.rotation.x+=m.userData.rx;
        m.position.y=m.userData.oy+Math.sin(ct*m.userData.fs+m.userData.fo)*.6;
      }
    });
    p1.position.x=Math.cos(ct*.7)*8;p1.position.y=Math.sin(ct*.5)*6;
    renderer.render(scene,camera);
  })();
  window.addEventListener('resize',()=>{
    W=wrap.clientWidth;H=wrap.clientHeight||500;
    renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
  });
})();

/* ════════════════════════════════════
   GSAP SCROLL ANIMATIONS
════════════════════════════════════ */
if(typeof gsap!=='undefined'&&typeof ScrollTrigger!=='undefined'){
  gsap.registerPlugin(ScrollTrigger);

  // Hero content entrance
  gsap.from('.hero-eyebrow',{opacity:0,y:30,duration:1,ease:'power3.out',delay:.3});
  gsap.from('.hero-title .line1',{opacity:0,y:40,duration:1,ease:'power3.out',delay:.5});
  gsap.from('.hero-title .line2',{opacity:0,y:40,duration:1,ease:'power3.out',delay:.7});
  gsap.from('.hero-sub',{opacity:0,y:30,duration:1,ease:'power3.out',delay:.85});
  gsap.from('.hero-btns',{opacity:0,y:20,duration:1,ease:'power3.out',delay:1.0});
  gsap.from('.scroll-cue',{opacity:0,duration:1,delay:1.4});

  // Video panels — text slides in from sides
  gsap.utils.toArray('.vp-text').forEach((el,i)=>{
    gsap.from(el,{
      x:i%2===0?-60:60,opacity:0,duration:1.1,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 75%',toggleActions:'play none none none'}
    });
  });

  // Stats counter animation
  gsap.utils.toArray('.stat-n').forEach(el=>{
    const raw=el.textContent;
    const suffix=raw.replace(/[0-9.]/g,'');
    const num=parseFloat(raw);
    if(!isNaN(num)){
      ScrollTrigger.create({
        trigger:el,start:'top 80%',
        onEnter:()=>{
          gsap.fromTo({v:0},{v:num},{
            duration:1.8,ease:'power2.out',
            onUpdate:function(){el.textContent=Math.round(this.targets()[0].v).toLocaleString()+suffix}
          });
        }
      });
    }
  });

  // Feature cards stagger
  gsap.from('.feat-card',{
    y:50,opacity:0,stagger:.12,duration:.9,ease:'power2.out',
    scrollTrigger:{trigger:'.feat-grid',start:'top 75%'}
  });

  // CTA text
  gsap.from('.cta-title',{y:40,opacity:0,duration:1,ease:'power3.out',
    scrollTrigger:{trigger:'#cta',start:'top 70%'}});
  gsap.from('.cta-sub',{y:30,opacity:0,duration:1,delay:.2,ease:'power3.out',
    scrollTrigger:{trigger:'#cta',start:'top 70%'}});
  gsap.from('.cta-btns',{y:20,opacity:0,duration:1,delay:.35,ease:'power3.out',
    scrollTrigger:{trigger:'#cta',start:'top 70%'}});
}

/* ════════ VIDEO AUTOPLAY RELIABILITY FIX ════════
   Some browsers (iOS Safari w/ Low Power Mode or Reduce Motion,
   some Android WebViews) silently block <video autoplay> even
   when muted+playsinline are set. Force-play via JS, retry on
   user interaction, and play/pause based on visibility so videos
   never get stuck on a frozen first frame. */
(function(){
  const vids = document.querySelectorAll('video');
  if(!vids.length) return;

  function tryPlay(v){
    v.muted = true;          // ensure the property (not just attribute) is set
    v.defaultMuted = true;
    v.playsInline = true;
    const p = v.play();
    if(p && p.catch){ p.catch(()=>{ /* will retry below */ }); }
  }

  vids.forEach(v=>{
    tryPlay(v);
    v.addEventListener('loadeddata', ()=>tryPlay(v));
    v.addEventListener('canplay', ()=>tryPlay(v));
  });

  // Retry on first user interaction (covers strict autoplay blocks)
  ['touchstart','click','scroll','keydown'].forEach(evt=>{
    window.addEventListener(evt, ()=>vids.forEach(tryPlay), {once:true, passive:true});
  });

  // Play only when in view, pause when scrolled away (saves battery,
  // and re-triggers play reliably when panel scrolls into frame)
  const vidObs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) tryPlay(entry.target);
      else entry.target.pause();
    });
  }, {threshold:.15});
  vids.forEach(v=>vidObs.observe(v));

  // If tab becomes visible again, resume
  document.addEventListener('visibilitychange', ()=>{
    if(!document.hidden) vids.forEach(tryPlay);
  });
})();
