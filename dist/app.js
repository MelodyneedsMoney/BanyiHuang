const wall = document.querySelector('#wall');
const entrance = document.querySelector('#entrance');
const gallery = document.querySelector('#gallery');
const music = new Audio(encodeURI(assets.music[0]));
music.loop = true;
music.volume = .38;
let entered = false;
let lastSound = -1;
let effect;
const rotations = [-4,3,-2,5,3,-5,4,-3,-2,5,-4,2,-5,3,-3,4,4,-3,2];
const cards = assets.img.map((src,i)=>{
 const card=document.createElement('button');
 card.className='photo';
 card.setAttribute('aria-label',`Photo of Banyi, ${i+1}. Play a silly sound.`);
 const img=document.createElement('img');
 img.src=encodeURI(src);img.alt='A moment with Banyi';img.decoding='async';
 img.addEventListener('load',sizeWall);
 card.append(img);wall.append(card);
 card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')playSound();});
 card.addEventListener('focus',()=>{if(card.matches(':focus-visible'))playSound();});
 card.addEventListener('click',()=>{
  if(music.paused)music.play().catch(()=>{});
  if(matchMedia('(hover: none)').matches){
   cards.forEach(c=>c.classList.remove('tapped'));
   card.classList.add('tapped');setTimeout(()=>card.classList.remove('tapped'),1800);
  }
  playSound();
 });
 return card;
});
function sizeWall(){
 const bottom=Math.max(...cards.map(card=>card.offsetTop+card.offsetHeight+card.offsetWidth*.12));
 wall.style.height=`${bottom+30}px`;
 wall.dispatchEvent(new Event('wall-layout'));
}
function layout(){
 const mobile=innerWidth<=700;
 const width=wall.clientWidth;
 const columns=mobile?2:4;
 cards.forEach((card,i)=>{
  const col=i%columns;const row=Math.floor(i/columns);
  const x=mobile?(col===0?4:51)+[0,1,-1][row%3]:[3,28,52,76][col]+[0,1,-1][row%3];
  const w=mobile?47+(i*7%5):25+(i*7%4);
  const y=row*width*(mobile?.63:.31)+[0,35,12,50][col]+(row%2?18:0);
  card.style.setProperty('--x',`${x}%`);
  card.style.setProperty('--y',`${y}px`);
  card.style.setProperty('--w',`${w}%`);
  card.style.setProperty('--r',`${rotations[i%rotations.length]}deg`);
  card.style.setProperty('--z',String(1+i%5));
 });
 sizeWall();
}
addEventListener('resize',layout);
layout();
function playSound(){
 if(!entered)return;
 if(effect){effect.pause();effect.currentTime=0;}
 let index=Math.floor(Math.random()*assets.sound.length);
 if(index===lastSound)index=(index+1)%assets.sound.length;
 lastSound=index;effect=new Audio(encodeURI(assets.sound[index]));effect.volume=.8;
 effect.play().catch(()=>{});
}
document.querySelector('#enter').addEventListener('click',()=>{
 entered=true;
 // This click supplies the browser gesture needed for audible music playback.
 music.play().catch(()=>{});
 entrance.hidden=true;gallery.hidden=false;gallery.inert=false;
 document.body.classList.add('entered');
 layout();
 gallery.tabIndex=-1;gallery.focus({preventScroll:true});
});

// A continuous ribbon with each letter placed on a curved path at its own depth.
const chainMessage = "Good morning, Good afternoon, Good night Banyi. Happy Birthday and Happy everyday. And don't turn left on red light. Best Wishes from Melody.";
const chainDescription = document.createElement('p');
chainDescription.className = 'chain-description';
chainDescription.textContent = chainMessage;
wall.append(chainDescription);
const chainLetters = Array.from(chainMessage, character => {
 const letter = document.createElement('span');
 letter.className = 'chain-letter';
 letter.textContent = character;
 letter.setAttribute('aria-hidden', 'true');
 wall.append(letter);
 return letter;
});
const measure = document.createElement('canvas').getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let ribbonSamples = [];
let ribbonLength = 0;
let letterOffsets = [];
let travel = 0;
let lastFrame = 0;
function rebuildRibbon(){
 const width = wall.clientWidth;
 const height = wall.offsetHeight;
 const rows = Math.ceil(cards.length / (innerWidth <= 700 ? 2 : 4));
 const step = height / rows;
 // Sample Bézier curves directly. SVG getPointAtLength repeatedly flattens
 // long curves and was blocking the main thread for every image load.
 const points = [{x:-width*.12,y:step*.3,distance:0}];
 function segment(cx1,cy1,cx2,cy2,x,y){
  const start=points[points.length-1];
  for(let n=1;n<=48;n++){
   const t=n/48,u=1-t;
   const px=u*u*u*start.x+3*u*u*t*cx1+3*u*t*t*cx2+t*t*t*x;
   const py=u*u*u*start.y+3*u*u*t*cy1+3*u*t*t*cy2+t*t*t*y;
   const previous=points[points.length-1];
   points.push({x:px,y:py,distance:previous.distance+Math.hypot(px-previous.x,py-previous.y)});
  }
 }
 for(let row=0;row<rows;row++){
  const right=row%2===0;
  const y=step*(row+.3);
  const nextY=Math.min(height-30,y+step);
  const endX=right?width*.94:width*.06;
  segment(right?width*.25:width*.75,y-step*.5,right?width*.7:width*.3,y+step*.65,endX,y+step*.22);
  if(row<rows-1)segment(right?width*1.12:-width*.12,y+step*.42,right?width*1.12:-width*.12,nextY-step*.18,endX,nextY);
 }
 ribbonLength=points[points.length-1].distance;
 const count=Math.ceil(ribbonLength/4);
 let cursor=1;
 ribbonSamples=Array.from({length:count+1},(_,i)=>{
  const distance=i/count*ribbonLength;
  while(cursor<points.length-1&&points[cursor].distance<distance)cursor++;
  const a=points[cursor-1],b=points[cursor];
  const t=(distance-a.distance)/(b.distance-a.distance||1);
  const depth=Math.sin(distance/ribbonLength*Math.PI*12+.8);
  let angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,angle,z:'60',scale:.87+(depth+1)*.115};
 });
 const fontSize = Math.min(48,Math.max(27,width*.032))*.8;
 measure.font = `500 ${fontSize}px Optima, Candara, sans-serif`;
 let offset=0;
 letterOffsets=chainLetters.map(letter=>{
  letter.style.fontSize=`${fontSize}px`;
  const value=offset;offset+=measure.measureText(letter.textContent).width+.5;
  return value;
 });
 renderRibbon();
}
function renderRibbon(){
 if(!ribbonSamples.length)return;
 chainLetters.forEach((letter,i)=>{
  const distance=(travel+letterOffsets[i])%ribbonLength;
  const point=ribbonSamples[Math.round(distance/ribbonLength*(ribbonSamples.length-1))];
  // Keep the ribbon above all photos, including enlarged photos on hover.
  if(letter.style.zIndex!==point.z)letter.style.zIndex=point.z;
  letter.style.transform=`translate(${point.x}px,${point.y}px) rotate(${point.angle}deg) scale(${point.scale}) translateY(-50%)`;
 });
}
function animateRibbon(now){
 const elapsed=lastFrame?Math.min((now-lastFrame)/1000,.05):0;
 lastFrame=now;
 if(entered&&!document.hidden&&!reducedMotion.matches){
  travel=(travel+elapsed*110)%ribbonLength;
  renderRibbon();
 }
 requestAnimationFrame(animateRibbon);
}
let rebuildPending=false;
wall.addEventListener('wall-layout',()=>{
 if(rebuildPending)return;
 rebuildPending=true;
 requestAnimationFrame(()=>{rebuildPending=false;rebuildRibbon();});
});
rebuildRibbon();
requestAnimationFrame(animateRibbon);
