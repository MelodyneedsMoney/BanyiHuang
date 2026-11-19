const wall = document.querySelector('#wall');
const toggle = document.querySelector('#audio-toggle');
const label = document.querySelector('#audio-label');
const music = new Audio(encodeURI(assets.music[0]));
music.loop = true;
music.volume = .38;
let enabled = false;
let lastSound = -1;
let effect;
let toastTimer;
const captions = ['oh hi!','a whole mood','hehe ♡','banyi.exe','main character','just because','caught in 4k','♡ this one','no thoughts','icon behavior','very serious','tiny moment','certified silly','hello, world','a good day','yes, this happened','love u mean it','somewhere, smiling','forever a favorite'];
const positions = [[6,35,17,-9],[30,5,15,7],[52,65,20,-5],[78,15,16,11],[3,390,16,6],[26,335,19,-12],[53,445,16,8],[76,365,20,-7],[9,720,20,-5],[35,710,15,12],[58,765,18,-9],[79,730,16,5],[3,1095,16,-11],[24,1030,19,6],[49,1110,18,-6],[73,1060,21,10],[13,1400,17,9],[39,1380,19,-8],[68,1410,17,5]];
const cards = assets.img.map((src,i)=>{
 const card=document.createElement('button'); card.className='photo';card.setAttribute('aria-label',`Photo of Banyi, ${i+1}. Play a silly sound.`);card.dataset.caption=captions[i%captions.length];
 const img=document.createElement('img'); img.src=encodeURI(src);img.alt=`A moment with Banyi`;img.decoding='async'; if(i>7)img.loading='lazy';card.append(img);wall.append(card);
 card.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')playSound()});
 card.addEventListener('focus',()=>{if(card.matches(':focus-visible'))playSound()});
 card.addEventListener('click',()=>{unlock();if(matchMedia('(hover: none)').matches){cards.forEach(c=>c.classList.remove('tapped'));card.classList.add('tapped');setTimeout(()=>card.classList.remove('tapped'),1800);}playSound();});
 return card;
});
function layout(){const mobile=innerWidth<=700;cards.forEach((card,i)=>{const [x,y,w,r]=positions[i%positions.length];card.style.setProperty('--x',mobile?`${i%2===0?7+(i%3)*2:54-(i%3)}%`:`${x}%`);card.style.setProperty('--y',mobile?`${25+Math.floor(i/2)*225+(i%2?70:0)}px`:`${y}px`);card.style.setProperty('--w',mobile?`${32+(i*7%9)}%`:`${w}%`);card.style.setProperty('--r',`${r}deg`)});}
layout();addEventListener('resize',layout);
function announce(text){const el=document.querySelector('#sound-message');el.textContent=text;clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.textContent='',3500);}
function setUI(){toggle.setAttribute('aria-pressed',String(enabled));label.textContent=enabled?'sound is on':'sound on?';toggle.setAttribute('aria-label',enabled?'Mute music and photo sounds':'Turn on music and photo sounds');}
async function unlock(){if(enabled)return;enabled=true;setUI();try{await music.play();}catch{enabled=false;setUI();announce('Tap the sound button to start the music ♡');}}
function playSound(){if(!enabled)return;if(effect){effect.pause();effect.currentTime=0;}let index=Math.floor(Math.random()*assets.sound.length);if(index===lastSound)index=(index+1)%assets.sound.length;lastSound=index;effect=new Audio(encodeURI(assets.sound[index]));effect.volume=.8;effect.play().catch(()=>{});}
toggle.addEventListener('click',event=>{event.stopPropagation();if(enabled){enabled=false;music.pause();effect?.pause();setUI();}else unlock();});
// Browsers require a gesture before audible playback. Start on the first interaction.
document.addEventListener('pointerdown',event=>{if(!event.target.closest('#audio-toggle'))unlock();},{once:true});
document.addEventListener('keydown',()=>unlock(),{once:true});
music.play().then(()=>{enabled=true;setUI();}).catch(()=>{});
