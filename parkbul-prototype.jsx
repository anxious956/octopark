import { useState, useEffect, useRef, useCallback } from "react";

// ─── Styles ───
const S = document.createElement("style");
S.id = "octolot-styles";
if (!document.querySelector("#octolot-styles")) {
  S.textContent = `
  @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes slideRight{from{opacity:0;transform:translateX(-16px)}to{opacity:1;transform:translateX(0)}}
  @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}
  @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(108,92,231,0.3)}50%{box-shadow:0 0 50px rgba(108,92,231,0.6)}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  @keyframes pinBounce{0%{transform:translate(-50%,-50%) scale(0)}60%{transform:translate(-50%,-50%) scale(1.15)}100%{transform:translate(-50%,-50%) scale(1)}}
  @keyframes ripple{0%{transform:scale(.8);opacity:.6}100%{transform:scale(2.5);opacity:0}}
  @keyframes heartBeat{0%{transform:scale(1)}15%{transform:scale(1.3)}30%{transform:scale(1)}45%{transform:scale(1.15)}60%{transform:scale(1)}}
  @keyframes slidePanel{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}
  @keyframes splashLogo{0%{transform:scale(0) rotate(-20deg);opacity:0}60%{transform:scale(1.1) rotate(5deg);opacity:1}100%{transform:scale(1) rotate(0deg);opacity:1}}
  @keyframes splashText{from{opacity:0;letter-spacing:12px}to{opacity:1;letter-spacing:2px}}
  @keyframes typing{from{width:0}to{width:100%}}
  @keyframes blink{50%{border-color:transparent}}
  @keyframes dotPulse{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
  @keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
  @keyframes tentacleWave{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
  .park-card{transition:all .25s cubic-bezier(.4,0,.2,1)!important}
  .park-card:hover{border-color:#6C5CE7!important;transform:translateY(-2px);box-shadow:0 8px 24px rgba(108,92,231,.2)}
  .filter-btn{transition:all .2s ease!important}.filter-btn:hover{transform:scale(1.05)}
  .action-btn{transition:all .2s cubic-bezier(.4,0,.2,1)!important}.action-btn:hover{transform:scale(1.03)}.action-btn:active{transform:scale(.97)}
  .nav-item{transition:all .3s ease!important}
  .search-input::placeholder{color:#555!important}
  .tag-chip{transition:all .2s ease!important;cursor:pointer}.tag-chip:hover{transform:scale(1.05);filter:brightness(1.2)}
  .chat-msg{animation:slideIn .3s ease both}
  .onboard-dot{transition:all .3s ease}
  input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#6C5CE7,#a855f7);cursor:pointer;box-shadow:0 2px 8px rgba(108,92,231,.5);border:3px solid #1e1e36;margin-top:-8px}
  input[type="range"]::-webkit-slider-runnable-track{height:6px;border-radius:3px;background:#2a2a4a}
  input[type="range"]{-webkit-appearance:none;background:transparent;margin:4px 0}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#2a2a4a;border-radius:3px}
  `;
  document.head.appendChild(S);
}

// ─── Theme System ───
const THEME = {
  dark: {
    bg: "#0f0f1a", bgGrad: "linear-gradient(180deg,#0f0f1a,#151528)", bgAlt: "#151528",
    card: "#1a1a30", cardBorder: "#252540", cardBorderFocus: "#6C5CE7",
    text: "#fff", textSec: "#ccc", textTer: "#888", textQuat: "#555", textQuint: "#444",
    navBg: "rgba(15,15,26,.97)", navInactive: "#555",
    inputBg: "#1a1a30", inputBorder: "#252540",
    trackBg: "#2a2a4a", trackThumbBorder: "#1e1e36",
    statusBar: "#fff", notchBg: "#000",
    scrollThumb: "#2a2a4a",
    searchPlaceholder: "#555",
    tagBg: "rgba(108,92,231,.06)",
  },
  light: {
    bg: "#f5f5f8", bgGrad: "linear-gradient(180deg,#f5f5f8,#eeeef4)", bgAlt: "#eeeef4",
    card: "#ffffff", cardBorder: "#e0e0e8", cardBorderFocus: "#6C5CE7",
    text: "#1a1a2e", textSec: "#333", textTer: "#666", textQuat: "#999", textQuint: "#bbb",
    navBg: "rgba(255,255,255,.97)", navInactive: "#aaa",
    inputBg: "#ffffff", inputBorder: "#e0e0e8",
    trackBg: "#ddd", trackThumbBorder: "#f5f5f8",
    statusBar: "#333", notchBg: "#e0e0e0",
    scrollThumb: "#ccc",
    searchPlaceholder: "#aaa",
    tagBg: "rgba(108,92,231,.08)",
  },
};
const useTheme = (dark) => dark ? THEME.dark : THEME.light;

// ─── Filter helpers ───
const getWalkMinutes = (park) => parseInt(park.distance) || 99;
const getPriceNum = (park) => park.price.startsWith("₺") ? parseInt(park.price.replace(/\D/g,"")) : 0;
const CoinIcon=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>;

// ─── Data ───
const PARKS = [
  {id:1,name:"Kadıköy Merkez Otopark",distance:"5 dk",meters:350,price:"₺30/saat",rating:4.2,spots:45,type:"Kapalı",occupancy:72,photos:3,liked:false},
  {id:2,name:"Moda Sahil Parkı",distance:"8 dk",meters:580,price:"₺20/saat",rating:3.8,spots:20,type:"Açık",occupancy:45,photos:2,liked:false},
  {id:3,name:"Bahariye Otopark",distance:"12 dk",meters:850,price:"₺25/saat",rating:4.5,spots:80,type:"Kapalı",occupancy:88,photos:4,liked:true},
  {id:4,name:"Rıhtım Meydanı Park",distance:"3 dk",meters:200,price:"Bilgi mevcut değil",rating:3.5,spots:15,type:"Açık",occupancy:30,photos:1,liked:false},
  {id:5,name:"Altıyol Otopark",distance:"10 dk",meters:700,price:"₺35/saat",rating:4.0,spots:60,type:"Kapalı",occupancy:65,photos:3,liked:false},
];

const AI_RESPONSES = {
  "merhaba": "Merhaba! Ben OctoLot AI asistanınız. Size en uygun otoparkı bulmak için buradayım. Nereye gitmek istiyorsunuz?",
  "kadıköy": "Kadıköy bölgesinde 5 otopark buldum. En uygun seçenek: **Rıhtım Meydanı Park** — sadece 3 dk yürüme mesafesinde ve şu an %30 dolulukta. Ücret bilgisi henüz mevcut değil ama kullanıcılar park bulmayı kolay olarak değerlendirmiş.",
  "ucuz": "En uygun fiyatlı otopark **Moda Sahil Parkı** — ₺20/saat. 8 dk yürüme mesafesinde ve şu an sadece %45 dolu. Açık otopark olduğunu unutmayın!",
  "yakın": "Size en yakın otopark **Rıhtım Meydanı Park** — sadece 200m (3 dk yürüme). Şu an %30 doluluk ile oldukça müsait!",
  "default": "Anlıyorum. Size en uygun otoparkı bulmam için hedef konumunuzu veya tercihlerinizi söyleyebilirsiniz. Örneğin: 'Kadıköy'de ucuz otopark' veya '10 dakika yürüyebilirim'."
};

const NOTIFICATIONS = [
  {id:1,text:"Bahariye Otopark'ta doluluk %88'e ulaştı",time:"2 dk önce",type:"warning"},
  {id:2,text:"Favori otoparkın Moda Sahil'de yer açıldı!",time:"15 dk önce",type:"success"},
  {id:3,text:"Hafta sonu park ücreti indirimi: Altıyol ₺25/saat",time:"1 saat önce",type:"info"},
];

// ─── Icons ───
const SearchIcon=({size=20,color="currentColor"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>;
const WalkIcon=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13" cy="4" r="2"/><path d="m10 22 1-7"/><path d="M15 22l-2-11-3 4-4-1"/><path d="m8 14 3-4 4 1"/></svg>;
const StarIcon=({filled,size=12})=><svg width={size} height={size} viewBox="0 0 24 24" fill={filled?"#FDCB6E":"none"} stroke="#FDCB6E" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const BackIcon=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const NavIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>;
const ClockIcon=()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const HomeIcon=({active})=><svg width="22" height="22" viewBox="0 0 24 24" fill={active?"#6C5CE7":"none"} stroke={active?"#6C5CE7":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const MapPinIcon=({active})=><svg width="22" height="22" viewBox="0 0 24 24" fill={active?"#6C5CE7":"none"} stroke={active?"#6C5CE7":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const HeartIcon=({active})=><svg width="22" height="22" viewBox="0 0 24 24" fill={active?"#e74c3c":"none"} stroke={active?"#e74c3c":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const UserIcon=({active})=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active?"#6C5CE7":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const AIIcon=({active})=><svg width="22" height="22" viewBox="0 0 24 24" fill={active?"#6C5CE7":"none"} stroke={active?"#6C5CE7":"#555"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="m2 14 6-6 6 6 6-6"/></svg>;
const SendIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const BellIcon=()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ShareIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
const CheckIcon=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const CameraIcon=()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>;
const SunIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const MoonIcon=()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>;
const RobotIcon=({size=18,color="#a855f7"})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/><circle cx="8" cy="16" r="1" fill={color}/><circle cx="16" cy="16" r="1" fill={color}/></svg>;
const LockIcon=({size=18})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const HelpIcon=({size=18})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const InfoIcon=({size=18})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;
const SettingsIcon=({size=18})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;

// ─── Octopus Logo (actual OCTOMAN logo as base64 PNG) ───
const LOGO_BASE64 = "data:image/png;base64,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";
const OctoLogo = ({size=48}) => (
  <img
    src={LOGO_BASE64}
    width={size}
    height={size}
    style={{objectFit:"contain",pointerEvents:"none"}}
    alt="OctoLot"
  />
);

// ─── OccupancyBar ───
const OccupancyBar=({percent})=>{
  const c=percent>80?"#e74c3c":percent>50?"#FDCB6E":"#2ecc71";
  const l=percent>80?"Yoğun":percent>50?"Orta":"Müsait";
  return <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
    <div style={{flex:1,height:4,borderRadius:2,background:"#2a2a4a",overflow:"hidden"}}>
      <div style={{width:`${percent}%`,height:"100%",borderRadius:2,background:c,transition:"width 1s ease"}}/>
    </div>
    <span style={{color:c,fontSize:10,fontWeight:700,minWidth:45}}>{l} %{percent}</span>
  </div>;
};

// ─── StatusBar ───
const StatusBar=({t})=>(
  <div style={{height:50,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 28px",color:t.statusBar,fontSize:14,fontWeight:600,zIndex:100,position:"relative"}}>
    <span style={{letterSpacing:.5}}>21:34</span>
    <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",width:126,height:34,background:t.notchBg,borderRadius:20,top:6}}/>
    <div style={{display:"flex",gap:5,alignItems:"center"}}>
      <svg width="16" height="12" viewBox="0 0 16 12" fill={t.statusBar}><path d="M1 8h2v4H1zM5 5h2v7H5zM9 2h2v10H9zM13 0h2v12h-2z" opacity=".9"/></svg>
      <div style={{width:25,height:11,border:`1.5px solid ${t.textQuat}`,borderRadius:3,position:"relative",marginLeft:2}}>
        <div style={{width:"75%",height:"100%",background:"#4cd137",borderRadius:1.5}}/>
      </div>
    </div>
  </div>
);

// ─── PhoneFrame ───
const PhoneFrame=({children,light,t})=>(
  <div style={{
    width:375,height:812,borderRadius:48,border:`6px solid ${light?"#d0d0d8":"#2a2a3e"}`,
    background:t.bg,overflow:"hidden",position:"relative",
    boxShadow:"0 30px 100px rgba(0,0,0,.6), 0 0 0 1px rgba(108,92,231,.15)",
    fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Segoe UI',Roboto,sans-serif",
    transition:"all .5s ease",
  }}><StatusBar t={t}/>{children}</div>
);

// ─── BottomNav ───
const BottomNav=({active,onChange,t})=>(
  <div style={{
    position:"absolute",bottom:0,left:0,right:0,height:80,
    background:t.navBg,backdropFilter:"blur(20px)",
    borderTop:`1px solid ${t.cardBorder}`,
    display:"flex",alignItems:"flex-start",justifyContent:"space-around",paddingTop:10,zIndex:200,
  }}>
    {[
      {key:"home",icon:HomeIcon,label:"Ana Sayfa"},
      {key:"map",icon:MapPinIcon,label:"Harita"},
      {key:"ai",icon:AIIcon,label:"AI Asistan"},
      {key:"favs",icon:HeartIcon,label:"Favoriler"},
      {key:"profile",icon:UserIcon,label:"Profil"},
    ].map(item=>(
      <div key={item.key} className="nav-item" onClick={()=>onChange(item.key)} style={{
        display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",
        color:active===item.key?"#6C5CE7":t.navInactive,minWidth:50,
      }}>
        <item.icon active={active===item.key}/>
        <span style={{fontSize:9,fontWeight:active===item.key?700:500}}>{item.label}</span>
        {active===item.key&&<div style={{width:4,height:4,borderRadius:2,background:"#6C5CE7",marginTop:-2}}/>}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════
// SPLASH SCREEN
// ═══════════════════════════════════════════
const SplashScreen=({onDone})=>{
  useEffect(()=>{const t=setTimeout(onDone,2800);return()=>clearTimeout(t);},[onDone]);
  return <div style={{height:"calc(100% - 50px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"radial-gradient(circle at 50% 35%,#1e1e40,#0f0f1a 70%)"}}>
    {/* Glow behind logo */}
    <div style={{position:"relative"}}>
      <div style={{position:"absolute",inset:-20,borderRadius:"50%",background:"radial-gradient(circle,rgba(108,92,231,.2),transparent 70%)",animation:"glow 3s ease infinite"}}/>
      <div style={{animation:"splashLogo 1s cubic-bezier(.34,1.56,.64,1)",position:"relative"}}>
        <OctoLogo size={120}/>
      </div>
    </div>
    <h1 style={{color:"#fff",fontSize:34,fontWeight:900,margin:"12px 0 0",animation:"splashText 1s ease .5s both",letterSpacing:2}}>OctoLot</h1>
    <p style={{color:"#6C5CE7",fontSize:14,fontWeight:700,margin:"8px 0 0",animation:"fadeIn 1s ease 1s both",letterSpacing:3,textTransform:"uppercase"}}>by OCTOMAN</p>
    <p style={{color:"#444",fontSize:11,margin:"6px 0 0",animation:"fadeIn 1s ease 1.2s both"}}>Akıllı Park Yardımcın</p>
    <div style={{marginTop:40,display:"flex",gap:6,animation:"fadeIn 1s ease 1.5s both"}}>
      {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:4,background:"#6C5CE7",animation:`dotPulse 1.4s ease ${i*.2}s infinite`}}/>)}
    </div>
  </div>;
};

// ═══════════════════════════════════════════
// ONBOARDING
// ═══════════════════════════════════════════
const OnboardingScreen=({onDone})=>{
  const [page,setPage]=useState(0);
  const pages=[
    {title:"Akıllı Park Bul",desc:"Gideceğin yere en uygun otoparkı saniyeler içinde bul. Yürüme mesafesine göre filtrele.",icon:"search",color:"#6C5CE7"},
    {title:"AI Park Asistanı",desc:"Doğal dilde sor: 'Kadıköy'de ucuz otopark var mı?' — AI sana en uygun seçeneği önersin.",icon:"ai",color:"#a855f7"},
    {title:"Topluluk Gücü",desc:"Park ettikten sonra fiyat ve deneyimini paylaş. Birlikte daha iyi park verisi oluşturalım.",icon:"community",color:"#00b894"},
  ];
  const icons = {
    search: <SearchIcon size={40} color="#fff"/>,
    ai: <AIIcon active/>,
    community: <HeartIcon active/>,
  };
  return <div style={{height:"calc(100% - 50px)",display:"flex",flexDirection:"column",background:"#0f0f1a",padding:"0 24px"}}>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeInUp .5s ease"}}>
      <div key={page} style={{animation:"fadeInUp .4s ease",textAlign:"center"}}>
        <div style={{width:100,height:100,borderRadius:30,background:`linear-gradient(135deg,${pages[page].color},${pages[page].color}88)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 24px",boxShadow:`0 12px 40px ${pages[page].color}44`}}>
          <div style={{transform:"scale(2)",color:"#fff"}}>{icons[pages[page].icon]}</div>
        </div>
        <h2 style={{color:"#fff",fontSize:24,fontWeight:800,margin:"0 0 12px"}}>{pages[page].title}</h2>
        <p style={{color:"#888",fontSize:14,lineHeight:1.6,margin:0}}>{pages[page].desc}</p>
      </div>
    </div>
    <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:24}}>
      {pages.map((_,i)=><div key={i} className="onboard-dot" style={{width:page===i?24:8,height:8,borderRadius:4,background:page===i?"#6C5CE7":"#2a2a4a"}}/>)}
    </div>
    <button className="action-btn" onClick={()=>page<2?setPage(page+1):onDone()} style={{
      width:"100%",padding:"17px",background:"linear-gradient(135deg,#6C5CE7,#a855f7)",
      border:"none",borderRadius:18,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",
      boxShadow:"0 10px 40px rgba(108,92,231,.35)",marginBottom:16,
    }}>{page<2?"Devam":"Başlayalım!"}</button>
    {page<2&&<button onClick={onDone} style={{background:"none",border:"none",color:"#555",fontSize:13,cursor:"pointer",marginBottom:30,fontWeight:500}}>Atla</button>}
  </div>;
};

// ═══════════════════════════════════════════
// SEARCH / HOME SCREEN
// ═══════════════════════════════════════════
const SearchScreen=({onSearch,onNav,notifications,t,maxWalk,setMaxWalk,maxPrice,setMaxPrice})=>{
  const [query,setQuery]=useState("");
  const [focused,setFocused]=useState(false);
  const [showNotif,setShowNotif]=useState(false);
  const filteredCount=PARKS.filter(p=>getWalkMinutes(p)<=maxWalk&&(maxPrice===0||getPriceNum(p)===0||getPriceNum(p)<=maxPrice)).length;

  return <div style={{height:"calc(100% - 50px)",display:"flex",flexDirection:"column",background:t.bgGrad,padding:"4px 20px 0",overflow:"hidden"}}>
    {/* Header */}
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,animation:"fadeIn .4s ease"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <OctoLogo size={36}/>
        <div>
          <h1 style={{color:t.text,fontSize:18,fontWeight:800,margin:0,letterSpacing:-.3}}>OctoLot</h1>
          <p style={{color:t.textQuat,fontSize:10,margin:0,fontWeight:600}}>by OCTOMAN</p>
        </div>
      </div>
      <div onClick={()=>setShowNotif(!showNotif)} style={{position:"relative",width:40,height:40,borderRadius:14,background:t.card,border:`1px solid ${t.cardBorder}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:t.textTer}}>
        <BellIcon/>
        <div style={{position:"absolute",top:8,right:8,width:8,height:8,borderRadius:4,background:"#e74c3c",border:`2px solid ${t.bg}`}}/>
      </div>
    </div>

    {/* Notification dropdown */}
    {showNotif&&<div style={{background:t.card,borderRadius:16,border:`1px solid ${t.cardBorder}`,padding:"12px",marginBottom:12,animation:"slidePanel .3s ease",zIndex:50}}>
      <p style={{color:t.text,fontSize:13,fontWeight:700,margin:"0 0 8px"}}>Bildirimler</p>
      {NOTIFICATIONS.map(n=><div key={n.id} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:`1px solid ${t.cardBorder}`}}>
        <div style={{width:8,height:8,borderRadius:4,marginTop:5,background:n.type==="warning"?"#FDCB6E":n.type==="success"?"#2ecc71":"#6C5CE7"}}/>
        <div><p style={{color:t.textSec,fontSize:12,margin:0}}>{n.text}</p><p style={{color:t.textQuat,fontSize:10,margin:"2px 0 0"}}>{n.time}</p></div>
      </div>)}
    </div>}

    {/* Greeting */}
    <div style={{marginBottom:16,animation:"fadeInUp .5s ease .1s both"}}>
      <p style={{color:t.textTer,fontSize:13,margin:0}}>Merhaba OCTOMAN,</p>
      <p style={{color:t.text,fontSize:20,fontWeight:800,margin:"2px 0 0"}}>Nereye gidiyorsun?</p>
    </div>

    {/* Search */}
    <div style={{background:focused?"rgba(108,92,231,.08)":t.card,borderRadius:18,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,border:focused?`1.5px solid ${t.cardBorderFocus}`:`1.5px solid ${t.cardBorder}`,marginBottom:12,transition:"all .3s ease",boxShadow:focused?"0 0 20px rgba(108,92,231,.12)":"none",animation:"fadeInUp .5s ease .15s both"}}>
      <div style={{color:"#6C5CE7"}}><SearchIcon/></div>
      <input className="search-input" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Konum, adres veya mekan ara..." onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{background:"none",border:"none",outline:"none",color:t.text,fontSize:15,flex:1,fontWeight:500}} onKeyDown={e=>e.key==="Enter"&&onSearch(query||"Kadıköy",maxWalk)}/>
      {query&&<div onClick={()=>setQuery("")} style={{color:t.textQuat,cursor:"pointer",fontSize:18,fontWeight:300}}>×</div>}
    </div>

    {/* Quick locations */}
    <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",animation:"fadeInUp .5s ease .2s both"}}>
      {["Kadıköy","Beşiktaş","Taksim","Üsküdar"].map((s,i)=>
        <button key={i} className="filter-btn" onClick={()=>onSearch(s,maxWalk)} style={{padding:"8px 16px",borderRadius:20,background:t.tagBg,border:`1px solid ${t.cardBorder}`,color:"#8888bb",fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{s}</button>
      )}
    </div>

    {/* Walk filter */}
    <div style={{background:t.card,borderRadius:18,padding:"14px 16px",border:`1.5px solid ${t.cardBorder}`,marginBottom:14,animation:"fadeInUp .5s ease .25s both"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:10,background:"rgba(108,92,231,.1)",display:"flex",alignItems:"center",justifyContent:"center"}}><WalkIcon/></div>
          <span style={{color:t.textSec,fontSize:13,fontWeight:500}}>Yürüme süresi</span>
        </div>
        <div style={{background:"linear-gradient(135deg,rgba(108,92,231,.15),rgba(168,85,247,.15))",padding:"4px 14px",borderRadius:20,border:"1px solid rgba(108,92,231,.2)",display:"flex",alignItems:"baseline",gap:3}}>
          <span style={{color:"#a855f7",fontSize:17,fontWeight:800,lineHeight:1}}>{maxWalk}</span><span style={{color:t.textTer,fontSize:11}}>dk</span>
        </div>
      </div>
      <div style={{padding:"2px 0"}}>
        <input type="range" min="5" max="30" value={maxWalk} onChange={e=>setMaxWalk(+e.target.value)} style={{width:"100%",display:"block"}}/>
      </div>
    </div>

    {/* Price filter */}
    <div style={{background:t.card,borderRadius:18,padding:"14px 16px",border:`1.5px solid ${t.cardBorder}`,marginBottom:14,animation:"fadeInUp .5s ease .28s both"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:28,height:28,borderRadius:10,background:"rgba(168,85,247,.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#a855f7"}}><CoinIcon/></div>
          <span style={{color:t.textSec,fontSize:13,fontWeight:500}}>Maks. ücret</span>
        </div>
        <div style={{background:"linear-gradient(135deg,rgba(168,85,247,.15),rgba(108,92,231,.15))",padding:"4px 14px",borderRadius:20,border:"1px solid rgba(168,85,247,.2)",display:"flex",alignItems:"baseline",gap:3}}>
          <span style={{color:"#a855f7",fontSize:17,fontWeight:800,lineHeight:1}}>{maxPrice===0?"∞":"₺"+maxPrice}</span>{maxPrice>0&&<span style={{color:t.textTer,fontSize:11}}>/sa</span>}
        </div>
      </div>
      <div style={{padding:"2px 0"}}>
        <input type="range" min="0" max="50" step="5" value={maxPrice} onChange={e=>setMaxPrice(+e.target.value)} style={{width:"100%",display:"block"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
        <span style={{color:t.textQuint,fontSize:9}}>Tümü</span>
        <span style={{color:t.textQuint,fontSize:9}}>₺50/sa</span>
      </div>
    </div>

    {/* Filter summary */}
    <p style={{color:t.textQuat,fontSize:11,margin:"0 0 8px",textAlign:"center",animation:"fadeInUp .5s ease .3s both"}}>{filteredCount} otopark bulundu</p>

    {/* Search button */}
    <button className="action-btn" onClick={()=>onSearch(query||"Kadıköy",maxWalk)} style={{width:"100%",padding:"16px",background:"linear-gradient(135deg,#6C5CE7,#a855f7)",border:"none",borderRadius:18,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:"0 10px 40px rgba(108,92,231,.3)",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:"fadeInUp .5s ease .3s both"}}><SearchIcon size={18} color="#fff"/> Park Bul</button>

    {/* AI Quick tip */}
    <div onClick={()=>onNav("ai")} style={{background:"linear-gradient(135deg,rgba(108,92,231,.08),rgba(168,85,247,.05))",borderRadius:16,padding:"12px 14px",border:"1px solid rgba(108,92,231,.12)",display:"flex",alignItems:"center",gap:10,cursor:"pointer",animation:"fadeInUp .5s ease .35s both",marginBottom:14}}>
      <div style={{width:36,height:36,borderRadius:12,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <RobotIcon size={20} color="#fff"/>
      </div>
      <div style={{flex:1}}>
        <p style={{color:t.textSec,fontSize:12,fontWeight:600,margin:0}}>AI Asistan</p>
        <p style={{color:t.textTer,fontSize:11,margin:"2px 0 0"}}>"Kadıköy'de ucuz park var mı?" diye sor</p>
      </div>
      <div style={{color:"#6C5CE7",transform:"rotate(180deg)"}}><BackIcon/></div>
    </div>

    {/* Recent */}
    <div style={{flex:1,animation:"fadeInUp .5s ease .4s both"}}>
      <p style={{color:t.textQuint,fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:1,marginBottom:6}}>Son Aramalar</p>
      {["Kadıköy Çarşı","Moda Sahil","Bahariye Caddesi"].map((s,i)=>
        <div key={i} onClick={()=>onSearch(s,maxWalk)} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 0",borderBottom:`1px solid ${t.cardBorder}40`,cursor:"pointer",animation:`slideRight .3s ease ${.4+i*.06}s both`}}>
          <div style={{width:30,height:30,borderRadius:10,background:t.tagBg,display:"flex",alignItems:"center",justifyContent:"center",color:t.textQuat}}><ClockIcon/></div>
          <span style={{color:t.textTer,fontSize:13,fontWeight:500}}>{s}</span>
        </div>
      )}
    </div>
    <BottomNav active="home" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// MAP SCREEN
// ═══════════════════════════════════════════
const MapScreen=({onBack,onSelectPark,onNav,t,maxWalk,maxPrice})=>{
  const [activeFilter,setActiveFilter]=useState("all");
  const [pins,setPins]=useState(false);
  useEffect(()=>{setTimeout(()=>setPins(true),300)},[]);
  const filters=[{key:"all",label:"Tümü"},{key:"close",label:"En Yakın"},{key:"cheap",label:"En Ucuz"},{key:"rated",label:"Puanlı"}];
  const walkFiltered=PARKS.filter(p=>getWalkMinutes(p)<=maxWalk&&(maxPrice===0||getPriceNum(p)===0||getPriceNum(p)<=maxPrice));
  const sorted=[...walkFiltered].sort((a,b)=>{
    if(activeFilter==="close")return a.meters-b.meters;
    if(activeFilter==="cheap"){const pa=a.price.startsWith("₺")?parseInt(a.price.replace(/\D/g,"")):999;const pb=b.price.startsWith("₺")?parseInt(b.price.replace(/\D/g,"")):999;return pa-pb;}
    if(activeFilter==="rated")return b.rating-a.rating;return 0;
  });
  const pinPos=[{top:"18%",left:"22%"},{top:"35%",left:"72%"},{top:"12%",left:"62%"},{top:"32%",left:"38%"},{top:"22%",left:"82%"}];

  return <div style={{height:"calc(100% - 50px)",position:"relative",background:"#0f0f1a"}}>
    <div style={{width:"100%",height:"100%",background:"linear-gradient(160deg,#111128,#161638 30%,#0f0f24 70%,#141430)",position:"relative",overflow:"hidden"}}>
      {[...Array(10)].map((_,i)=><div key={`h${i}`} style={{position:"absolute",top:`${(i+1)*9}%`,left:0,right:0,height:1,background:`rgba(108,92,231,${i%3===0?.06:.03})`}}/>)}
      {[...Array(7)].map((_,i)=><div key={`v${i}`} style={{position:"absolute",left:`${(i+1)*13}%`,top:0,bottom:0,width:1,background:`rgba(108,92,231,${i%3===0?.06:.03})`}}/>)}

      {/* AI suggestion on map */}
      <div style={{position:"absolute",top:64,left:16,right:16,background:"rgba(108,92,231,.12)",backdropFilter:"blur(10px)",borderRadius:14,padding:"10px 14px",border:"1px solid rgba(108,92,231,.2)",display:"flex",alignItems:"center",gap:8,animation:"slidePanel .4s ease .3s both",zIndex:15}}>
        <RobotIcon size={16} color="#a855f7"/>
        <p style={{color:"#ccc",fontSize:11,margin:0,flex:1}}>En uygun park: <span style={{color:"#a855f7",fontWeight:700}}>Rıhtım Meydanı</span> — 3 dk, %30 dolu</p>
      </div>

      <div style={{position:"absolute",top:"25%",left:"50%",transform:"translate(-50%,-50%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:10,animation:"fadeIn .5s ease"}}>
        <div style={{background:"linear-gradient(135deg,#e74c3c,#ff6b6b)",color:"#fff",padding:"7px 14px",borderRadius:14,fontSize:12,fontWeight:700,whiteSpace:"nowrap",boxShadow:"0 6px 20px rgba(231,76,60,.4)"}}>Kadıköy Çarşı</div>
        <div style={{width:2,height:14,background:"#e74c3c"}}/><div style={{width:10,height:10,borderRadius:"50%",background:"#e74c3c",position:"relative"}}><div style={{position:"absolute",inset:0,borderRadius:"50%",background:"#e74c3c",animation:"ripple 2s ease infinite"}}/></div>
      </div>
      {walkFiltered.map((p,i)=><div key={p.id} onClick={()=>onSelectPark(p)} style={{position:"absolute",top:pinPos[i%5].top,left:pinPos[i%5].left,transform:"translate(-50%,-50%)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",zIndex:5,animation:pins?`pinBounce .5s cubic-bezier(.34,1.56,.64,1) ${i*.1}s both`:"none"}}>
        <div style={{background:"linear-gradient(135deg,#6C5CE7,#a855f7)",color:"#fff",width:38,height:38,borderRadius:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:17,boxShadow:"0 6px 20px rgba(108,92,231,.5)",border:"2.5px solid rgba(255,255,255,.2)"}}>P</div>
        <div style={{marginTop:3,background:"rgba(15,15,26,.92)",color:"#fff",padding:"3px 10px",borderRadius:10,fontSize:10,fontWeight:700,whiteSpace:"nowrap",border:"1px solid #252540"}}>{p.distance}</div>
      </div>)}

      <div onClick={onBack} style={{position:"absolute",top:12,left:16,width:42,height:42,borderRadius:14,background:"rgba(15,15,26,.9)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",border:"1px solid #252540",zIndex:20}}><BackIcon/></div>
      <div style={{position:"absolute",top:12,left:70,right:16,background:"rgba(15,15,26,.9)",backdropFilter:"blur(10px)",borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:10,border:"1px solid #252540",zIndex:20}}>
        <div style={{color:"#6C5CE7"}}><SearchIcon size={18}/></div><span style={{color:"#fff",fontSize:14,fontWeight:600}}>Kadıköy</span>
      </div>
    </div>

    <div style={{position:"absolute",bottom:0,left:0,right:0,height:340,background:t.navBg,backdropFilter:"blur(24px)",borderTopLeftRadius:28,borderTopRightRadius:28,border:`1px solid ${t.cardBorder}`,borderBottom:"none",animation:"slideUp .5s cubic-bezier(.4,0,.2,1)"}}>
      <div style={{width:36,height:4,background:t.textQuat,borderRadius:2,margin:"10px auto"}}/>
      <div style={{padding:"4px 20px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div><span style={{color:t.text,fontSize:17,fontWeight:800}}>{walkFiltered.length}</span><span style={{color:t.textTer,fontSize:14,marginLeft:6}}>otopark</span><span style={{color:t.textQuint,fontSize:11,marginLeft:6}}>({maxWalk} dk içinde)</span></div>
      </div>
      <div style={{display:"flex",gap:8,padding:"0 20px 10px",overflowX:"auto"}}>
        {filters.map(f=><button key={f.key} className="filter-btn" onClick={()=>setActiveFilter(f.key)} style={{padding:"8px 16px",borderRadius:20,background:activeFilter===f.key?"linear-gradient(135deg,#6C5CE7,#a855f7)":t.card,color:activeFilter===f.key?"#fff":t.textTer,border:activeFilter===f.key?"none":`1px solid ${t.cardBorder}`,fontSize:12,fontWeight:activeFilter===f.key?700:600,cursor:"pointer",whiteSpace:"nowrap",boxShadow:activeFilter===f.key?"0 4px 16px rgba(108,92,231,.3)":"none"}}>{f.label}</button>)}
      </div>
      <div style={{padding:"0 20px",overflowY:"auto",height:190,paddingBottom:80}}>
        {sorted.length===0?<div style={{textAlign:"center",paddingTop:30}}><p style={{color:t.textQuat,fontSize:13}}>Bu süre içinde otopark bulunamadı</p><p style={{color:t.textQuint,fontSize:11}}>Yürüme süresini artırmayı deneyin</p></div>:
        sorted.map((park,idx)=><div key={park.id} className="park-card" onClick={()=>onSelectPark(park)} style={{background:t.card,borderRadius:18,padding:"12px 14px",marginBottom:8,cursor:"pointer",border:`1.5px solid ${t.cardBorder}`,animation:`slidePanel .4s ease ${idx*.06}s both`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <div style={{width:28,height:28,borderRadius:9,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:800,fontSize:13}}>P</span></div>
                <div><span style={{color:t.text,fontSize:13,fontWeight:700,display:"block"}}>{park.name}</span><span style={{color:t.textQuat,fontSize:10}}>{park.type}</span></div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <div style={{display:"flex",alignItems:"center",gap:3,color:t.textTer}}><WalkIcon/><span style={{fontSize:11,fontWeight:600}}>{park.distance}</span></div>
                <div style={{display:"flex",alignItems:"center",gap:2}}><StarIcon filled/><span style={{color:"#FDCB6E",fontSize:11,fontWeight:700}}>{park.rating}</span></div>
              </div>
              <OccupancyBar percent={park.occupancy}/>
            </div>
            <div style={{textAlign:"right",marginLeft:10}}>
              <div style={{background:park.price.startsWith("₺")?"rgba(108,92,231,.1)":"rgba(255,255,255,.03)",padding:"6px 12px",borderRadius:12}}>
                <span style={{color:park.price.startsWith("₺")?"#a855f7":t.textQuat,fontSize:14,fontWeight:800}}>{park.price.startsWith("₺")?park.price.split("/")[0]:"—"}</span>
                {park.price.startsWith("₺")&&<span style={{display:"block",color:t.textQuat,fontSize:9}}>saat</span>}
              </div>
            </div>
          </div>
        </div>)}
      </div>
    </div>
    <BottomNav active="map" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// DETAIL SCREEN
// ═══════════════════════════════════════════
const DetailScreen=({park,onBack,onNav,t})=>{
  const [liked,setLiked]=useState(park.liked);
  const [showParked,setShowParked]=useState(false);
  const [parkedData,setParkedData]=useState({price:"",easy:null});
  const [photoIdx,setPhotoIdx]=useState(0);
  const occColor=park.occupancy>80?"#e74c3c":park.occupancy>50?"#FDCB6E":"#2ecc71";

  return <div style={{height:"calc(100% - 50px)",background:t.bgGrad,display:"flex",flexDirection:"column",overflow:"hidden"}}>
    {/* Photo gallery */}
    <div style={{height:170,position:"relative",background:"linear-gradient(135deg,#16163a,#1a1a3e 50%,#0f0f2a)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:i===photoIdx?200:60,height:i===photoIdx?140:80,borderRadius:16,background:`linear-gradient(${135+i*30}deg,#1e1e3a,#252550)`,margin:"0 6px",transition:"all .4s ease",display:"flex",alignItems:"center",justifyContent:"center",opacity:i===photoIdx?1:.4,cursor:"pointer",border:i===photoIdx?"2px solid rgba(108,92,231,.3)":"none"}} onClick={()=>setPhotoIdx(i)}>
          {i===photoIdx ? <div style={{textAlign:"center"}}><CameraIcon/><p style={{color:"#aaa",fontSize:10,margin:"6px 0 0"}}>Fotoğraf {i+1}</p></div> : <span style={{color:"#666",fontSize:8}}>#{i+1}</span>}
        </div>)}
      </div>
      <div style={{position:"absolute",bottom:10,display:"flex",gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:photoIdx===i?16:6,height:6,borderRadius:3,background:photoIdx===i?"#6C5CE7":"#3a3a5a",transition:"all .3s ease",cursor:"pointer"}} onClick={()=>setPhotoIdx(i)}/>)}
      </div>
      <div onClick={onBack} style={{position:"absolute",top:12,left:16,width:42,height:42,borderRadius:14,background:"rgba(15,15,26,.8)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff",border:"1px solid #252540"}}><BackIcon/></div>
      <div style={{position:"absolute",top:12,right:16,display:"flex",gap:8}}>
        <div style={{width:42,height:42,borderRadius:14,background:"rgba(15,15,26,.8)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#888",border:"1px solid #252540"}}><ShareIcon/></div>
        <div onClick={()=>setLiked(!liked)} style={{width:42,height:42,borderRadius:14,background:liked?"rgba(231,76,60,.12)":"rgba(15,15,26,.8)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:`1px solid ${liked?"rgba(231,76,60,.2)":"#252540"}`,animation:liked?"heartBeat .6s ease":"none"}}><HeartIcon active={liked}/></div>
      </div>
    </div>

    <div style={{flex:1,overflowY:"auto",padding:"14px 20px",paddingBottom:150}}>
      <div style={{animation:"fadeInUp .4s ease"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
          <h2 style={{color:t.text,fontSize:20,fontWeight:800,margin:0,flex:1}}>{park.name}</h2>
          <span style={{background:park.type==="Kapalı"?"rgba(108,92,231,.12)":"rgba(46,204,113,.12)",color:park.type==="Kapalı"?"#a855f7":"#2ecc71",padding:"4px 12px",borderRadius:20,fontSize:10,fontWeight:700}}>{park.type}</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:14}}>
          {[...Array(5)].map((_,i)=><StarIcon key={i} filled={i<Math.round(park.rating)} size={14}/>)}
          <span style={{color:"#FDCB6E",fontSize:14,fontWeight:700,marginLeft:4}}>{park.rating}</span>
          <span style={{color:"#555",fontSize:11}}>(42 değerlendirme)</span>
        </div>
      </div>

      {/* Occupancy */}
      <div style={{background:t.card,borderRadius:16,padding:"12px 14px",border:`1.5px solid ${t.cardBorder}`,marginBottom:10,animation:"fadeInUp .4s ease .1s both"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}><div style={{width:8,height:8,borderRadius:4,background:occColor,boxShadow:`0 0 8px ${occColor}`}}/><span style={{color:t.textSec,fontSize:12,fontWeight:600}}>Anlık Doluluk</span></div>
          <span style={{color:occColor,fontSize:17,fontWeight:800}}>%{park.occupancy}</span>
        </div>
        <div style={{height:5,borderRadius:3,background:"#1e1e36",overflow:"hidden"}}><div style={{width:`${park.occupancy}%`,height:"100%",borderRadius:3,background:occColor}}/></div>
        <span style={{color:"#555",fontSize:10,marginTop:4,display:"block"}}>~{Math.round(park.spots*(1-park.occupancy/100))} boş yer</span>
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10,animation:"fadeInUp .4s ease .15s both"}}>
        {[{l:"Yürüyüş",v:park.distance,s:`${park.meters}m`,c:"#6C5CE7"},{l:"Ücret",v:park.price.startsWith("₺")?park.price.split("/")[0]:"—",s:park.price.startsWith("₺")?"saatlik":"Bilgi yok",c:"#a855f7"},{l:"Kapasite",v:`${park.spots}`,s:"araçlık",c:"#00b894"},{l:"Durum",v:"Açık",s:"7/24",c:"#FDCB6E"}].map((s,i)=><div key={i} style={{background:t.card,borderRadius:14,padding:"12px",border:`1.5px solid ${t.cardBorder}`,textAlign:"center"}}>
          <p style={{color:t.textQuat,fontSize:10,margin:"0 0 3px",fontWeight:600,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</p>
          <p style={{color:s.c,fontSize:20,fontWeight:800,margin:"0 0 1px"}}>{s.v}</p>
          <p style={{color:"#444",fontSize:10,margin:0}}>{s.s}</p>
        </div>)}
      </div>

      {/* Tags */}
      <div style={{background:t.card,borderRadius:16,padding:"12px 14px",border:`1.5px solid ${t.cardBorder}`,marginBottom:10,animation:"fadeInUp .4s ease .2s both"}}>
        <p style={{color:t.textSec,fontSize:12,fontWeight:700,margin:"0 0 8px"}}>Kullanıcı Yorumları</p>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          {[{t:"Park bulmak kolay",p:true,n:28},{t:"Temiz",p:true,n:19},{t:"İyi aydınlatma",p:true,n:15},{t:"Dar giriş",p:false,n:8}].map((tag,i)=>
            <span key={i} className="tag-chip" style={{background:tag.p?"rgba(46,204,113,.08)":"rgba(231,76,60,.08)",color:tag.p?"#2ecc71":"#e74c3c",padding:"6px 12px",borderRadius:20,fontSize:11,fontWeight:600,border:`1px solid ${tag.p?"rgba(46,204,113,.12)":"rgba(231,76,60,.12)"}`}}>{tag.t} <span style={{opacity:.5}}>({tag.n})</span></span>
          )}
        </div>
      </div>

      {/* AI tip */}
      <div style={{background:"rgba(108,92,231,.06)",borderRadius:14,padding:"10px 12px",border:"1px solid rgba(108,92,231,.1)",display:"flex",alignItems:"center",gap:8,marginBottom:10,animation:"fadeInUp .4s ease .25s both"}}>
        <RobotIcon size={16} color="#6C5CE7"/>
        <p style={{color:"#888",fontSize:11,margin:0,lineHeight:1.5}}>Bu otoparka <span style={{color:"#a855f7",fontWeight:600}}>hafta içi 10:00-14:00</span> arası park bulmak daha kolay.</p>
      </div>

      {/* Park Ettim */}
      {!showParked ? (
        <button className="action-btn" onClick={()=>setShowParked(true)} style={{width:"100%",padding:"14px",background:t.card,border:`1.5px solid ${t.cardBorder}`,borderRadius:16,color:t.textSec,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,animation:"fadeInUp .4s ease .3s both"}}>
          <CheckIcon/> Buraya Park Ettim
        </button>
      ) : (
        <div style={{background:t.card,borderRadius:16,padding:"14px",border:"1.5px solid #6C5CE7",animation:"slidePanel .3s ease"}}>
          <p style={{color:t.text,fontSize:13,fontWeight:700,margin:"0 0 10px"}}>Park Geri Bildirimi</p>
          <div style={{marginBottom:10}}>
            <p style={{color:t.textTer,fontSize:11,margin:"0 0 6px"}}>Ne kadar ödediniz?</p>
            <input value={parkedData.price} onChange={e=>setParkedData({...parkedData,price:e.target.value})} placeholder="₺30" style={{width:"100%",background:t.bgAlt,border:`1px solid ${t.cardBorder}`,borderRadius:10,padding:"10px",color:t.text,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          </div>
          <p style={{color:t.textTer,fontSize:11,margin:"0 0 6px"}}>Park bulmak kolay mıydı?</p>
          <div style={{display:"flex",gap:8,marginBottom:12}}>
            {["Evet","Orta","Zor"].map(opt=><button key={opt} onClick={()=>setParkedData({...parkedData,easy:opt})} style={{flex:1,padding:"10px",borderRadius:10,background:parkedData.easy===opt?"rgba(108,92,231,.15)":t.bgAlt,border:`1px solid ${parkedData.easy===opt?"#6C5CE7":t.cardBorder}`,color:parkedData.easy===opt?"#a855f7":t.textTer,fontSize:12,fontWeight:600,cursor:"pointer"}}>{opt}</button>)}
          </div>
          <button className="action-btn" onClick={()=>setShowParked(false)} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#6C5CE7,#a855f7)",border:"none",borderRadius:12,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Gönder</button>
        </div>
      )}
    </div>

    {/* Bottom actions */}
    <div style={{padding:"0 20px 90px",display:"flex",gap:10,position:"absolute",bottom:0,left:0,right:0,background:`linear-gradient(transparent,${t.bg} 30%)`,paddingTop:20}}>
      <button className="action-btn" style={{flex:1,padding:"15px",background:"linear-gradient(135deg,#6C5CE7,#a855f7)",border:"none",borderRadius:18,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,boxShadow:"0 10px 40px rgba(108,92,231,.35)"}}><NavIcon/> Yol Tarifi Al</button>
    </div>
    <BottomNav active="map" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// AI CHAT SCREEN
// ═══════════════════════════════════════════
const AIChatScreen=({onNav,t})=>{
  const [messages,setMessages]=useState([{from:"ai",text:"Merhaba! Ben OctoLot AI asistanınız. Size en uygun otoparkı bulmak için buradayım.\n\nNereye gitmek istiyorsunuz?"}]);
  const [input,setInput]=useState("");
  const [typing,setTyping]=useState(false);
  const chatRef=useRef(null);
  const suggestions=["Kadıköy'de otopark","En ucuz park","En yakın park"];

  const send=(text)=>{
    if(!text.trim())return;
    const userMsg={from:"user",text};
    setMessages(prev=>[...prev,userMsg]);
    setInput("");setTyping(true);
    setTimeout(()=>{
      const lower=text.toLowerCase();
      let resp=AI_RESPONSES.default;
      if(lower.includes("merhaba")||lower.includes("selam"))resp=AI_RESPONSES.merhaba;
      else if(lower.includes("kadıköy")||lower.includes("kadikoy"))resp=AI_RESPONSES["kadıköy"];
      else if(lower.includes("ucuz")||lower.includes("uygun"))resp=AI_RESPONSES.ucuz;
      else if(lower.includes("yakın")||lower.includes("yakin"))resp=AI_RESPONSES["yakın"];
      setMessages(prev=>[...prev,{from:"ai",text:resp}]);
      setTyping(false);
    },1200);
  };

  useEffect(()=>{chatRef.current?.scrollTo(0,chatRef.current.scrollHeight)},[messages,typing]);

  return <div style={{height:"calc(100% - 50px)",display:"flex",flexDirection:"column",background:t.bg}}>
    {/* Header */}
    <div style={{padding:"12px 20px",display:"flex",alignItems:"center",gap:12,borderBottom:`1px solid ${t.cardBorder}`}}>
      <div style={{width:40,height:40,borderRadius:14,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",padding:2}}>
        <OctoLogo size={28}/>
      </div>
      <div>
        <p style={{color:t.text,fontSize:15,fontWeight:700,margin:0}}>OctoLot AI</p>
        <p style={{color:"#2ecc71",fontSize:11,margin:0}}>Çevrimiçi</p>
      </div>
    </div>

    {/* Messages */}
    <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:"16px 16px 8px"}}>
      {messages.map((m,i)=><div key={i} className="chat-msg" style={{display:"flex",justifyContent:m.from==="user"?"flex-end":"flex-start",marginBottom:10,animationDelay:`${i*.05}s`}}>
        <div style={{maxWidth:"80%",padding:"10px 14px",borderRadius:m.from==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",background:m.from==="user"?"linear-gradient(135deg,#6C5CE7,#a855f7)":t.card,border:m.from==="user"?"none":`1px solid ${t.cardBorder}`}}>
          <p style={{color:m.from==="user"?"#fff":t.textSec,fontSize:13,margin:0,lineHeight:1.6,whiteSpace:"pre-wrap"}}>{m.text}</p>
        </div>
      </div>)}
      {typing&&<div style={{display:"flex",gap:4,padding:"10px 14px",background:t.card,borderRadius:16,width:"fit-content",border:`1px solid ${t.cardBorder}`}}>
        {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:3,background:"#6C5CE7",animation:`dotPulse 1.4s ease ${i*.2}s infinite`}}/>)}
      </div>}
    </div>

    {/* Quick suggestions */}
    {messages.length<3&&<div style={{display:"flex",gap:6,padding:"0 16px 8px",overflowX:"auto"}}>
      {suggestions.map((s,i)=><button key={i} className="filter-btn" onClick={()=>send(s)} style={{padding:"7px 14px",borderRadius:20,background:t.tagBg,border:`1px solid ${t.cardBorder}`,color:"#8888bb",fontSize:11,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>{s}</button>)}
    </div>}

    {/* Input */}
    <div style={{padding:"10px 16px 90px",display:"flex",gap:8}}>
      <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Bir şey sor..." style={{flex:1,background:t.card,border:`1.5px solid ${t.cardBorder}`,borderRadius:16,padding:"12px 16px",color:t.text,fontSize:14,outline:"none"}} onKeyDown={e=>e.key==="Enter"&&send(input)}/>
      <button onClick={()=>send(input)} style={{width:48,height:48,borderRadius:16,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",border:"none",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}><SendIcon/></button>
    </div>
    <BottomNav active="ai" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// FAVORITES SCREEN
// ═══════════════════════════════════════════
const FavoritesScreen=({onSelectPark,onNav,t})=>{
  const favs=PARKS.filter(p=>p.liked);
  return <div style={{height:"calc(100% - 50px)",background:t.bg,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"16px 20px 12px"}}><h2 style={{color:t.text,fontSize:20,fontWeight:800,margin:0}}>Favorilerim</h2><p style={{color:t.textQuat,fontSize:13,margin:"4px 0 0"}}>{favs.length} kayıtlı otopark</p></div>
    <div style={{flex:1,padding:"0 20px",overflowY:"auto",paddingBottom:100}}>
      {favs.length===0?<div style={{textAlign:"center",paddingTop:80}}>
        <div style={{marginBottom:16,opacity:.4}}><OctoLogo size={56}/></div>
        <p style={{color:t.textQuat,fontSize:14}}>Henüz favori otoparkın yok</p>
        <p style={{color:t.textQuint,fontSize:12}}>Detay sayfasında kalp ikonuna basarak favorilere ekle</p>
      </div>:favs.map((park,i)=><div key={park.id} className="park-card" onClick={()=>onSelectPark(park)} style={{background:t.card,borderRadius:18,padding:"14px",marginBottom:10,cursor:"pointer",border:`1.5px solid ${t.cardBorder}`,animation:`slidePanel .4s ease ${i*.08}s both`}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:44,height:44,borderRadius:14,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontWeight:800,fontSize:20}}>P</span></div>
          <div style={{flex:1}}>
            <p style={{color:t.text,fontSize:14,fontWeight:700,margin:0}}>{park.name}</p>
            <div style={{display:"flex",gap:10,marginTop:3}}>
              <span style={{color:t.textTer,fontSize:11}}>{park.distance}</span>
              <span style={{color:"#a855f7",fontSize:11,fontWeight:600}}>{park.price.startsWith("₺")?park.price:"—"}</span>
              <span style={{color:"#FDCB6E",fontSize:11}}>★ {park.rating}</span>
            </div>
          </div>
          <HeartIcon active/>
        </div>
      </div>)}
    </div>
    <BottomNav active="favs" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// PROFILE SCREEN
// ═══════════════════════════════════════════
const ProfileScreen=({onNav,darkMode,setDarkMode,t})=>{
  const stats=[{label:"Park Sayısı",value:"24"},{label:"Yorum",value:"12"},{label:"Puan",value:"4.8"}];
  return <div style={{height:"calc(100% - 50px)",background:t.bg,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"20px",textAlign:"center"}}>
      <div style={{width:80,height:80,borderRadius:24,background:"linear-gradient(135deg,#6C5CE7,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",boxShadow:"0 8px 32px rgba(108,92,231,.3)",padding:4}}>
        <OctoLogo size={56}/>
      </div>
      <h2 style={{color:t.text,fontSize:20,fontWeight:800,margin:"0 0 2px"}}>OCTOMAN</h2>
      <p style={{color:"#6C5CE7",fontSize:12,fontWeight:600,margin:0}}>Premium Üye</p>
    </div>

    <div style={{display:"flex",justifyContent:"center",gap:20,padding:"0 20px 16px"}}>
      {stats.map((s,i)=><div key={i} style={{textAlign:"center",flex:1,background:t.card,borderRadius:14,padding:"12px",border:`1px solid ${t.cardBorder}`}}>
        <p style={{color:"#6C5CE7",fontSize:20,fontWeight:800,margin:0}}>{s.value}</p>
        <p style={{color:t.textQuat,fontSize:10,margin:"4px 0 0"}}>{s.label}</p>
      </div>)}
    </div>

    <div style={{padding:"0 20px",flex:1}}>
      {/* Dark mode toggle */}
      <div onClick={()=>setDarkMode(!darkMode)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${t.cardBorder}`,marginBottom:8,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,color:t.textSec}}>
          {darkMode?<MoonIcon/>:<SunIcon/>}
          <span style={{fontSize:13,fontWeight:600}}>{darkMode?"Karanlık Tema":"Aydınlık Tema"}</span>
        </div>
        <div style={{width:44,height:24,borderRadius:12,background:darkMode?"#6C5CE7":"#ccc",display:"flex",alignItems:"center",padding:2,transition:"all .3s ease"}}>
          <div style={{width:20,height:20,borderRadius:10,background:"#fff",transition:"all .3s ease",marginLeft:darkMode?20:0}}/>
        </div>
      </div>

      {[{label:"Bildirim Ayarları",icon:<BellIcon/>},{label:"Gizlilik",icon:<LockIcon/>},{label:"Yardım & Destek",icon:<HelpIcon/>},{label:"Hakkında",icon:<InfoIcon/>}].map((item,i)=>
        <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",background:t.card,borderRadius:14,padding:"14px 16px",border:`1px solid ${t.cardBorder}`,marginBottom:8,cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,color:t.textTer}}>
            {item.icon}
            <span style={{color:t.textSec,fontSize:13,fontWeight:600}}>{item.label}</span>
          </div>
          <div style={{color:t.textQuint,transform:"rotate(180deg)"}}><BackIcon/></div>
        </div>
      )}

      <div style={{textAlign:"center",marginTop:20}}>
        <OctoLogo size={32}/>
        <p style={{color:t.textQuint,fontSize:11,margin:"8px 0 0"}}>OctoLot v1.0 by OCTOMAN</p>
      </div>
    </div>
    <BottomNav active="profile" onChange={onNav} t={t}/>
  </div>;
};

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function OctoLotApp(){
  const [phase,setPhase]=useState("splash"); // splash → onboard → app
  const [screen,setScreen]=useState("home");
  const [selectedPark,setSelectedPark]=useState(null);
  const [darkMode,setDarkMode]=useState(true);
  const [maxWalk,setMaxWalk]=useState(15);
  const [maxPrice,setMaxPrice]=useState(0); // 0 = no limit
  const t=useTheme(darkMode);
  const splashT=useTheme(true); // splash/onboard always dark

  const navigate=(key)=>{
    if(key==="home")setScreen("home");
    else if(key==="map")setScreen("map");
    else if(key==="ai")setScreen("ai");
    else if(key==="favs")setScreen("favs");
    else if(key==="profile")setScreen("profile");
  };

  if(phase==="splash")return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#1a1a3e,#0a0a1a 60%,#050510)",padding:20}}><div style={{textAlign:"center"}}><PhoneFrame t={splashT}><SplashScreen onDone={()=>setPhase("onboard")}/></PhoneFrame></div></div>;
  if(phase==="onboard")return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#1a1a3e,#0a0a1a 60%,#050510)",padding:20}}><div style={{textAlign:"center"}}><PhoneFrame t={splashT}><OnboardingScreen onDone={()=>setPhase("app")}/></PhoneFrame></div></div>;

  return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:"radial-gradient(ellipse at 50% 30%,#1a1a3e,#0a0a1a 60%,#050510)",padding:20}}>
    <div style={{textAlign:"center"}}>
      <PhoneFrame light={!darkMode} t={t}>
        {screen==="home"&&<SearchScreen onSearch={()=>setScreen("map")} onNav={navigate} t={t} maxWalk={maxWalk} setMaxWalk={setMaxWalk} maxPrice={maxPrice} setMaxPrice={setMaxPrice}/>}
        {screen==="map"&&!selectedPark&&<MapScreen onBack={()=>setScreen("home")} onSelectPark={p=>{setSelectedPark(p);setScreen("detail")}} onNav={navigate} t={t} maxWalk={maxWalk} maxPrice={maxPrice}/>}
        {screen==="detail"&&selectedPark&&<DetailScreen park={selectedPark} onBack={()=>{setSelectedPark(null);setScreen("map")}} onNav={navigate} t={t}/>}
        {screen==="ai"&&<AIChatScreen onNav={navigate} t={t}/>}
        {screen==="favs"&&<FavoritesScreen onSelectPark={p=>{setSelectedPark(p);setScreen("detail")}} onNav={navigate} t={t}/>}
        {screen==="profile"&&<ProfileScreen onNav={navigate} darkMode={darkMode} setDarkMode={setDarkMode} t={t}/>}
      </PhoneFrame>
      <div style={{marginTop:20,animation:"fadeIn 1s ease .5s both"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <OctoLogo size={28}/>
          <p style={{color:"#6C5CE7",fontSize:18,fontWeight:800,margin:0,fontFamily:"system-ui"}}>OctoLot</p>
        </div>
        <p style={{color:"#555",fontSize:11,fontFamily:"system-ui",marginTop:4}}>by OCTOMAN — Interactive Prototype v4</p>
      </div>
    </div>
  </div>;
}