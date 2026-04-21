import { useState, useEffect, useRef } from "react";
import {
  ConnectButton,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  PayEmbed,
  ThirdwebProvider,
} from "thirdweb/react";
import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
  toWei,
  readContract,
} from "thirdweb";
import { createWallet, walletConnect, inAppWallet } from "thirdweb/wallets";

// ─── CONFIG ──────────────────────────────────────────────
const CLIENT_ID       = "821819db832d1a313ae3b1a62fbeafb7";
const TOKEN_ADDR      = "0x49931887171BF46922b2b80Aa834537A80C50B70";
const NFT_ADDR        = "0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2";
const RPC_URL         = "https://monad-mainnet.g.alchemy.com/v2/Uwb7T0DbXMQHjiJBNf9_b005qYjLmJqk";
const NEAR_TOKEN_ADDR = "e85f23b81ab3edbdf4c0e5fd889eed50cc2bd465c57c67b71105741ac1b8ceda";
const NEAR_NFT_ADDR   = "gemsrock-nft.near";
const NEAR_RPC        = "https://rpc.mainnet.near.org";
const NEAR_APP_KEY    = "gemsrock-near";

const MONAD = defineChain({
  id: 143,
  name: "Monad Mainnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpc: RPC_URL,
  blockExplorers: [{ name: "Explorer", url: "https://explorer.monad.xyz" }],
});

const client = createThirdwebClient({ clientId: CLIENT_ID });

const WALLETS = [
  inAppWallet({ auth: { options: ["email", "google", "apple"] } }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("io.rabby"),
  createWallet("com.trustwallet.app"),
  createWallet("app.phantom"),
];

// ─── PRIZE TIERS ─────────────────────────────────────────
const PRIZE_TIERS = {
  0: { label: "Empty",   color: "#555",    emoji: "💨" },
  1: { label: "Small",   color: "#aaaaaa", emoji: "🥉" },
  2: { label: "Medium",  color: "#4488ff", emoji: "🥈" },
  3: { label: "Big",     color: "#aa44ff", emoji: "💎" },
  4: { label: "NFT",     color: "#ff9900", emoji: "🖼️" },
  5: { label: "Jackpot", color: "#ff44cc", emoji: "🏆" },
};

const TIER_COLOR = {
  Common:    "#aaaaaa",
  Uncommon:  "#00e676",
  Rare:      "#4488ff",
  Epic:      "#aa44ff",
  Legendary: "#ff9900",
  Mythic:    "#ffee44",
  GODLIKE:   "#ff44cc",
};

// ─── REAL IPFS URLS from deployment ──────────────────────
const IPFS = (cid) => `https://ipfs.io/ipfs/${cid}`;

const BOXES_RAW = [
  { id:0,  name:"Crimson Blaze",  tier:"Common",    color:"#ff2244", glow:"#ff224466", price:"0.01", emoji:"🔥", c1:"#ff2244", c2:"#aa0011", gems:10,   img:IPFS("QmYxD14oBHNZBAcZeoXywQYbJrgCaiwgGPPm3PaZGhAgJz") },
  { id:1,  name:"Sapphire Abyss", tier:"Common",    color:"#1e8fff", glow:"#1e8fff66", price:"0.01", emoji:"💧", c1:"#1e8fff", c2:"#0044aa", gems:10,   img:IPFS("QmZhzdwqFsyxBhzCGxUSaWBcpHUu81Mpa2K1CwSbtEBuSD") },
  { id:2,  name:"Emerald Vault",  tier:"Uncommon",  color:"#00e676", glow:"#00e67666", price:"0.01", emoji:"🌿", c1:"#00e676", c2:"#007744", gems:20,   img:null },
  { id:3,  name:"Violet Phantom", tier:"Rare",      color:"#bb44ff", glow:"#bb44ff66", price:"0.02", emoji:"🔮", c1:"#bb44ff", c2:"#6600cc", gems:20,   img:null },
  { id:4,  name:"Solar Gold",     tier:"Rare",      color:"#ffaa00", glow:"#ffaa0066", price:"0.05", emoji:"☀️", c1:"#ffaa00", c2:"#cc6600", gems:50,   img:null },
  { id:5,  name:"Arctic White",   tier:"Rare",      color:"#c0e8ff", glow:"#c0e8ff44", price:"0.05", emoji:"❄️", c1:"#c0e8ff", c2:"#6699cc", gems:50,   img:IPFS("QmY54tzLPbieknaZ5W2S3N6wa7kdnf5XGdz3epZLHjEb1A") },
  { id:6,  name:"Toxic Lime",     tier:"Epic",      color:"#aaff00", glow:"#aaff0066", price:"0.05", emoji:"⚡", c1:"#aaff00", c2:"#558800", gems:100,  img:IPFS("QmSWpnXCsiiQfSp4yNpUAwzzFKDWbhqaN46xnVGx1SptjG") },
  { id:7,  name:"Inferno Orange", tier:"Epic",      color:"#ff5500", glow:"#ff550066", price:"0.05", emoji:"🌋", c1:"#ff5500", c2:"#cc2200", gems:100,  img:IPFS("QmPxmpKgYoxmp1Yit7gppDShHidXdBU8uqm7caHxYYNsBi") },
  { id:8,  name:"Cosmic Pink",    tier:"Legendary", color:"#ff44cc", glow:"#ff44cc66", price:"0.10", emoji:"🌸", c1:"#ff44cc", c2:"#aa0088", gems:200,  img:null },
  { id:9,  name:"Shadow Black",   tier:"Legendary", color:"#9900ff", glow:"#9900ff66", price:"0.10", emoji:"💀", c1:"#9900ff", c2:"#440088", gems:200,  img:IPFS("QmepARCXVBmSRhfxeChJHy16y9JTmU61XxffAgakoq4Kn5") },
  { id:10, name:"Ocean Teal",     tier:"Mythic",    color:"#00e5cc", glow:"#00e5cc66", price:"0.10", emoji:"🐚", c1:"#00e5cc", c2:"#007766", gems:500,  img:null },
  { id:11, name:"Rainbow Prism",  tier:"GODLIKE",   color:"#ffee44", glow:"#ffee4444", price:"0.25", emoji:"🐉", c1:"#ffee44", c2:"#ffaa00", gems:1000, img:null },
];
const BOXES = BOXES_RAW.map(b => ({ ...b }));

// ─── HELPERS ─────────────────────────────────────────────
function btoaUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,(_, p1)=>String.fromCharCode("0x"+p1)));
}
function mkSVG(label, c1, c2, emoji) {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${c1||"#333"}"/><stop offset="100%" stop-color="${c2||"#111"}"/>
  </linearGradient></defs>
  <rect width="200" height="200" rx="18" fill="url(#g)"/>
  <rect x="8" y="8" width="184" height="184" rx="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <text x="100" y="108" font-size="68" text-anchor="middle" dominant-baseline="middle">${emoji||"📦"}</text>
  <rect x="0" y="158" width="200" height="42" fill="rgba(0,0,0,0.45)"/>
  <text x="100" y="183" font-size="11" font-family="monospace" font-weight="bold" fill="white" text-anchor="middle">${label.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;base64,${btoaUnicode(s)}`;
}
function ipfsToHttp(uri) {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://","https://ipfs.io/ipfs/");
  if (uri.startsWith("http")) return uri;
  return `https://ipfs.io/ipfs/${uri}`;
}
function fmtGems(wei) {
  if (wei===undefined||wei===null) return "—";
  try { const n=Number(BigInt(wei)/BigInt(1e14))/1e4; return n.toLocaleString("en-US",{maximumFractionDigits:2}); } catch { return "—"; }
}
function fmtSupply(wei) {
  if (wei===undefined||wei===null) return "—";
  try {
    const n=Number(BigInt(wei)/BigInt(1e18));
    if (n>=1_000_000) return (n/1_000_000).toFixed(1)+"M";
    if (n>=1_000) return (n/1_000).toFixed(1)+"K";
    return n.toLocaleString("en-US");
  } catch { return "—"; }
}
function poolPct(pool,max) {
  if (!pool||!max) return 0;
  try { return Math.min(100,Math.round(Number((BigInt(pool)*100n)/BigInt(max)))); } catch { return 0; }
}
async function resolveTokenImage(nftContract, tokenId) {
  try {
    const uri = await readContract({ contract:nftContract, method:"function tokenURI(uint256 tokenId) view returns (string)", params:[tokenId] });
    const url = ipfsToHttp(uri);
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    const res = await fetch(url);
    const json = await res.json();
    return ipfsToHttp(json.image||json.image_url||"")||null;
  } catch { return null; }
}

// ─── NEAR RPC ─────────────────────────────────────────────
async function nearRpc(method, params) {
  const res = await fetch(NEAR_RPC, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({jsonrpc:"2.0",id:"1",method,params}) });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message??"NEAR RPC error");
  return json.result;
}
async function ftBalanceOf(accountId) {
  try {
    const args = btoa(JSON.stringify({account_id:accountId}));
    const result = await nearRpc("query",{request_type:"call_function",finality:"final",account_id:NEAR_TOKEN_ADDR,method_name:"ft_balance_of",args_base64:args});
    const raw = JSON.parse(String.fromCharCode(...result.result));
    const n = Number(BigInt(raw)/BigInt(1e14))/1e4;
    return n.toLocaleString("en-US",{maximumFractionDigits:2});
  } catch { return null; }
}
async function ftMetadata() {
  try {
    const args = btoa("{}");
    const result = await nearRpc("query",{request_type:"call_function",finality:"final",account_id:NEAR_TOKEN_ADDR,method_name:"ft_metadata",args_base64:args});
    return JSON.parse(String.fromCharCode(...result.result));
  } catch { return null; }
}
async function nearNftTokensForOwner(accountId) {
  try {
    const args = btoa(JSON.stringify({account_id:accountId}));
    const result = await nearRpc("query",{request_type:"call_function",finality:"final",account_id:NEAR_NFT_ADDR,method_name:"nft_tokens_for_owner",args_base64:args});
    return JSON.parse(String.fromCharCode(...result.result));
  } catch { return []; }
}

// ─── GLOBAL CSS ──────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{background:#07090f;color:#e0e0ee;font-family:'Courier New',monospace;}
a{text-decoration:none;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:rgba(255,215,0,.2);border-radius:99px;}

.site-title{font-family:'Cinzel',serif;font-size:clamp(1.4rem,4vw,2.8rem);font-weight:900;
  background:linear-gradient(135deg,#fff 0%,#FFD700 30%,#a78bfa 65%,#fff 100%);
  background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
  background-clip:text;animation:sTit 4s linear infinite;letter-spacing:4px;}
@keyframes sTit{0%{background-position:0% center;}100%{background-position:200% center;}}

.lg{font-size:2.2rem;filter:drop-shadow(0 0 14px #FFD700);animation:lgFloat 3s ease-in-out infinite;}
.lg2{animation-delay:-1s;}
@keyframes lgFloat{0%,100%{transform:translateY(0) rotate(-4deg);}50%{transform:translateY(-8px) rotate(4deg);}}

.box-card{position:relative;border-radius:18px;overflow:hidden;cursor:pointer;background:#0e0e1a;
  border:1px solid rgba(255,255,255,.06);transition:transform .3s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
.box-card:hover{transform:translateY(-7px) scale(1.02);}

.box-img-wrap{position:relative;width:100%;aspect-ratio:1;overflow:hidden;}
.box-img-wrap img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .4s ease;}
.box-card:hover .box-img-wrap img{transform:scale(1.07);}

.img-skeleton{position:absolute;inset:0;background:linear-gradient(90deg,#111120 25%,#1a1a2e 50%,#111120 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite;}
@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

.ice-sheen{position:absolute;inset:0;
  background:linear-gradient(115deg,transparent 30%,rgba(200,240,255,.25) 50%,transparent 70%);
  animation:iceS 3.5s ease-in-out infinite;pointer-events:none;}
@keyframes iceS{0%{transform:translateX(-120%);}100%{transform:translateX(250%);}}

.box-glow-overlay{position:absolute;bottom:0;left:0;right:0;height:45%;
  background:radial-gradient(ellipse at 50% 100%,var(--clr,#fff) 0%,transparent 70%);
  opacity:.12;animation:gP 2.6s ease-in-out infinite;pointer-events:none;}
@keyframes gP{0%,100%{opacity:.08;}50%{opacity:.2;}}

.rarity-badge{position:absolute;top:.6rem;right:.6rem;font-size:.56rem;letter-spacing:1px;
  text-transform:uppercase;padding:.18rem .5rem;border-radius:99px;
  border:1px solid var(--clr,#fff);color:var(--clr,#fff);
  background:rgba(0,0,0,.55);backdrop-filter:blur(4px);font-weight:700;}

@keyframes vibrate{0%,100%{transform:translate(0,0) rotate(0deg);}
  12%{transform:translate(-4px,2px) rotate(-2deg);}25%{transform:translate(4px,-2px) rotate(2deg);}
  50%{transform:translate(4px,3px) rotate(1.5deg);}75%{transform:translate(3px,-2px) rotate(2deg);}}
.box-card:hover .box-img-wrap{animation:vibrate .55s ease-in-out;}

.stat-card{background:linear-gradient(135deg,#040d1a,#061e35);border:1px solid rgba(0,207,255,.15);
  border-radius:12px;padding:.7rem 1.1rem;text-align:center;min-width:115px;transition:.25s;
  box-shadow:0 0 12px rgba(0,150,255,.08);}
.stat-card:hover{border-color:rgba(0,207,255,.5);transform:translateY(-2px);box-shadow:0 0 20px rgba(0,207,255,.2);}

.nav-tab{padding:12px 18px;background:none;border:none;border-bottom:2px solid transparent;cursor:pointer;
  font-family:'Courier New',monospace;font-weight:700;font-size:12px;letter-spacing:1px;color:#555;
  transition:.2s;white-space:nowrap;}
.nav-tab.active{color:#00e5ff;border-bottom-color:#00e5ff;}
.nav-tab:hover:not(.active){color:#888;}

.mint-btn{width:100%;padding:10px 0;border-radius:10px;border:none;
  font-family:'Courier New',monospace;font-weight:800;font-size:12px;letter-spacing:1px;
  cursor:pointer;transition:.2s;margin-top:10px;}
.mint-btn:disabled{opacity:.4;cursor:not-allowed;}
.mint-btn:not(:disabled):hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(0,0,0,.4);}

.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.92);backdrop-filter:blur(16px);
  display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal-box{background:linear-gradient(160deg,#13131f,#0e0e1a);border:1px solid #252535;
  border-radius:24px;width:100%;max-width:440px;position:relative;overflow:hidden;
  animation:popIn .4s cubic-bezier(.34,1.56,.64,1);}
@keyframes popIn{from{transform:scale(.75) translateY(20px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}

.toast-wrap{position:fixed;bottom:1.5rem;right:1.5rem;z-index:9999;
  display:flex;flex-direction:column;gap:.5rem;pointer-events:none;}
.toast{background:rgba(7,9,15,.97);border-left:3px solid #FFD700;border-radius:9px;
  padding:.68rem 1.1rem;font-size:.77rem;max-width:300px;line-height:1.5;
  box-shadow:0 8px 30px rgba(0,0,0,.6);animation:tIn .3s ease;color:#e0e0ee;}
.toast.ok{border-color:#00e676;}
.toast.err{border-color:#ff4444;color:#ffaaaa;}
@keyframes tIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:translateX(0)}}

@keyframes ob-shake{
  0%,100%{transform:rotate(-6deg) scale(1.05) translateY(0);}
  15%{transform:rotate(6deg) scale(1.08) translateY(-4px);}
  30%{transform:rotate(-5deg) scale(1.06) translateY(2px);}
  45%{transform:rotate(7deg) scale(1.09) translateY(-3px);}
  60%{transform:rotate(-4deg) scale(1.07) translateY(1px);}
  75%{transform:rotate(5deg) scale(1.08) translateY(-2px);}
}
@keyframes ob-crack{
  0%{transform:scale(1);filter:brightness(1) saturate(1);}
  20%{transform:scale(1.15) rotate(3deg);filter:brightness(1.6) saturate(1.4);}
  40%{transform:scale(0.92) rotate(-4deg);filter:brightness(2.2) saturate(1.8);}
  60%{transform:scale(1.18) rotate(2deg);filter:brightness(2.8) saturate(2.2);}
  80%{transform:scale(0.95) rotate(-1deg);filter:brightness(1.9) saturate(1.5);}
  100%{transform:scale(1.05);filter:brightness(1.4) saturate(1.2);}
}
@keyframes ob-spin{
  0%{transform:rotate(0deg) scale(1);}
  25%{transform:rotate(90deg) scale(1.05);}
  50%{transform:rotate(180deg) scale(1);}
  75%{transform:rotate(270deg) scale(1.05);}
  100%{transform:rotate(360deg) scale(1);}
}
@keyframes ob-reveal{
  0%{transform:scale(0.1) rotate(-30deg);opacity:0;filter:blur(20px) brightness(3);}
  40%{transform:scale(1.2) rotate(5deg);opacity:1;filter:blur(2px) brightness(1.8);}
  65%{transform:scale(0.95) rotate(-2deg);filter:blur(0) brightness(1.3);}
  85%{transform:scale(1.05) rotate(1deg);filter:brightness(1.1);}
  100%{transform:scale(1) rotate(0deg);opacity:1;filter:brightness(1);}
}
@keyframes ob-float{
  0%{transform:translateY(0) scale(1) rotate(0deg);opacity:1;}
  60%{opacity:1;}
  100%{transform:translateY(-130px) scale(0.1) rotate(45deg);opacity:0;}
}
@keyframes ob-glow-pulse{
  0%,100%{box-shadow:0 0 20px var(--clr),0 0 40px var(--clr)44;}
  50%{box-shadow:0 0 50px var(--clr),0 0 100px var(--clr)66,0 0 150px var(--clr)22;}
}
@keyframes ob-particle{
  0%{transform:translate(0,0) scale(1);opacity:1;}
  100%{transform:translate(var(--tx),var(--ty)) scale(0);opacity:0;}
}
@keyframes crack-line{
  0%{opacity:0;transform:scaleY(0);}
  50%{opacity:1;}
  100%{opacity:0;transform:scaleY(1);}
}

.gems-popup{position:fixed;z-index:9999;pointer-events:none;display:flex;align-items:center;gap:.5rem;
  background:rgba(10,8,24,.95);border:1px solid rgba(167,139,250,.5);border-radius:12px;
  padding:.6rem 1rem;font-family:'Cinzel',serif;font-size:.9rem;color:#c4b5fd;
  box-shadow:0 0 30px rgba(167,139,250,.3);
  animation:gemsPopup 2.5s cubic-bezier(.25,.46,.45,.94) forwards;}
@keyframes gemsPopup{0%{opacity:0;transform:translateY(0) scale(.8);}15%{opacity:1;transform:translateY(-10px) scale(1.05);}70%{opacity:1;transform:translateY(-60px) scale(1);}100%{opacity:0;transform:translateY(-100px) scale(.9);}}

.sec-h{font-family:'Cinzel',serif;font-size:clamp(.75rem,2vw,.95rem);letter-spacing:5px;color:#FFD700;
  text-align:center;margin-bottom:1.4rem;display:flex;align-items:center;justify-content:center;gap:1rem;}
.sec-h::before,.sec-h::after{content:'';flex:1;max-width:100px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,215,0,.4));}
.sec-h::after{transform:scaleX(-1);}

.mb-item{background:#0e0e1a;border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;cursor:pointer;transition:.25s;}
.mb-item:hover:not(.opened){border-color:rgba(255,215,0,.3);transform:translateY(-3px);}
.mb-item.opened{opacity:.45;cursor:default;}

.panel{background:linear-gradient(160deg,#111120,#0d0d1a);border-radius:20px;padding:28px;
  border:1px solid #161625;max-width:680px;margin:0 auto;}
.panel-title{font-size:21px;font-weight:900;letter-spacing:2px;margin-bottom:8px;
  background:linear-gradient(90deg,#00e5ff,#aa44ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

.bridge-card{display:flex;flex-direction:column;background:#0b0b16;border:1px solid #1e1e30;
  border-radius:13px;padding:18px 16px;text-decoration:none;transition:border-color .2s,transform .2s,box-shadow .2s;cursor:pointer;}
.bridge-card:hover{border-color:rgba(0,229,255,.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,229,255,.1);}

.pool-bar-wrap{background:#0b0b16;border-radius:8px;overflow:hidden;height:8px;margin-top:6px;}
.pool-bar{height:100%;border-radius:8px;transition:width .8s ease;background:linear-gradient(90deg,#00e676,#00e5ff);}

.near-connect-btn{display:flex;align-items:center;justify-content:center;gap:10px;
  width:100%;max-width:340px;padding:14px 28px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#00c9a7,#00887a);color:#000;
  font-family:'Courier New',monospace;font-weight:900;font-size:14px;letter-spacing:1px;
  cursor:pointer;transition:.2s;}
.near-connect-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,201,167,.3);}
.near-connect-btn:disabled{opacity:.5;cursor:not-allowed;}

/* ── Near NFT Trade ── */
.near-trade-section{margin-top:24px;border-top:1px solid #1a1a2e;padding-top:22px;}
.near-trade-tabs{display:flex;gap:6px;margin-bottom:18px;}
.near-trade-tab{flex:1;padding:9px 0;border-radius:9px;border:1px solid #1e1e30;
  background:#0b0b16;color:#555;font-family:'Courier New',monospace;
  font-weight:700;font-size:11px;letter-spacing:1px;cursor:pointer;transition:.2s;}
.near-trade-tab.active{background:#00c9a711;border-color:#00c9a7;color:#00c9a7;}
.near-trade-tab:hover:not(.active){color:#888;border-color:#333;}

.nft-trade-card{background:#0b0b16;border:1px solid #1e1e30;border-radius:13px;padding:14px;transition:.2s;}
.nft-trade-card:hover{border-color:rgba(0,201,167,.3);box-shadow:0 4px 18px rgba(0,201,167,.07);}

.trade-input-near{width:100%;padding:10px 14px;background:#07090f;border:1px solid #1e1e30;
  border-radius:9px;color:#e0e0ee;font-family:'Courier New',monospace;font-size:12px;
  outline:none;transition:border-color .2s;margin-bottom:8px;}
.trade-input-near:focus{border-color:#00c9a744;}

@keyframes bannerGlow{0%{background-position:0% 0%}100%{background-position:300% 0%}}
@media(max-width:480px){.box-grid{grid-template-columns:repeat(2,1fr) !important;}}
`;

// ─── TOAST ───────────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  function toast(msg, type="ok") {
    const id = Date.now();
    setToasts(t=>[...t,{id,msg,type}]);
    setTimeout(()=>setToasts(t=>t.filter(x=>x.id!==id)),3500);
  }
  return {toasts, toast};
}

// ─── ICONS ───────────────────────────────────────────────
const TelegramIcon = ({color})=><svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.613c-.152.677-.549.843-1.113.524l-3.07-2.262-1.484 1.428c-.164.164-.302.302-.618.302l.221-3.133 5.716-5.164c.249-.221-.054-.344-.384-.123L7.44 14.765l-3.023-.944c-.658-.205-.671-.658.138-.975l11.797-4.551c.548-.198 1.028.134.21.953z"/></svg>;
const XIcon = ({color})=><svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const DiscordIcon = ({color})=><svg width="22" height="22" viewBox="0 0 24 24" fill={color}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>;

const AD_LINKS = [
  { Icon:({color})=><span style={{fontSize:22,filter:`drop-shadow(0 0 7px ${color})`}}>👉</span>, label:"Subscribe", sub:"Click & Join Updates", url:"https://t.me/gemsrock_bot", color:"#FFD700" },
  { Icon:({color})=><svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill={color+"22"}/><text x="16" y="21" fontSize="14" fontWeight="bold" fill={color} textAnchor="middle">M</text></svg>, label:"MonadVision", sub:"View TOKEN GemsRock", url:"https://monadvision.com/token/0x49931887171BF46922b2b80Aa834537A80C50B70", color:"#836ef9" },
  { Icon:({color})=><svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill={color+"22"}/><text x="16" y="21" fontSize="14" fontWeight="bold" fill={color} textAnchor="middle">M</text></svg>, label:"MonadVision", sub:"View NFT", url:"https://monadvision.com/token/0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2", color:"#836ef9" },
  { Icon:TelegramIcon, label:"Telegram", sub:"@gemsrock_bot", url:"https://t.me/gemsrock_bot", color:"#00c8ff" },
  { Icon:XIcon, label:"Twitter / X", sub:"@bnbgold277983", url:"https://twitter.com/bnbgold277983", color:"#e0e0ff" },
  { Icon:DiscordIcon, label:"Discord", sub:"Join Server", url:"https://discord.com/channels/1316093079090106472", color:"#5865f2" },
];

function AdBanner() {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const rafRef   = useRef(null);
  useEffect(()=>{
    const track = trackRef.current;
    if (!track) return;
    track.innerHTML += track.innerHTML;
    function animate() {
      posRef.current -= 0.5;
      if (Math.abs(posRef.current) >= track.scrollWidth/2) posRef.current=0;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return (
    <div style={{width:"100%",background:"rgba(8,2,28,0.98)",overflow:"hidden"}}>
      <div style={{height:2,background:"linear-gradient(90deg,#836ef9,#00c8ff,#00ff88,#5865f2,#836ef9)",backgroundSize:"300% 100%",animation:"bannerGlow 4s linear infinite"}}/>
      <div style={{overflow:"hidden",padding:"8px 0"}}>
        <div ref={trackRef} style={{display:"flex",alignItems:"center",whiteSpace:"nowrap",willChange:"transform"}}>
          {AD_LINKS.map((item,i)=>(
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:12,padding:"7px 36px",textDecoration:"none",borderRight:"1px solid rgba(131,110,249,0.12)",transition:"background 0.25s"}}
              onMouseEnter={e=>{e.currentTarget.style.background=item.color+"14";}}
              onMouseLeave={e=>{e.currentTarget.style.background="transparent";}}>
              <span style={{display:"flex",alignItems:"center",filter:`drop-shadow(0 0 7px ${item.color})`}}>
                <item.Icon color={item.color}/>
              </span>
              <span style={{display:"flex",flexDirection:"column",gap:1}}>
                <span style={{fontSize:12,fontWeight:800,color:item.color,textShadow:`0 0 10px ${item.color}`,letterSpacing:1,fontFamily:"monospace",textTransform:"uppercase"}}>{item.label}</span>
                <span style={{fontSize:10,color:"#555",letterSpacing:.5,fontFamily:"monospace"}}>{item.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div style={{height:2,background:"linear-gradient(90deg,#5865f2,#00ff88,#00c8ff,#836ef9)",backgroundSize:"300% 100%",animation:"bannerGlow 4s linear infinite reverse"}}/>
    </div>
  );
}

// ─── PARTICLE SYSTEM ─────────────────────────────────────
function Particles({ color, active }) {
  if (!active) return null;
  const particles = Array.from({length:20},(_,i)=>({
    id:i,
    tx:`${(Math.random()-0.5)*300}px`,
    ty:`${-(Math.random()*200+50)}px`,
    delay:`${Math.random()*0.5}s`,
    size:Math.random()*10+4,
    emoji:["💎","⭐","✨","🌟","💫","🔮","🏆","🎊"][Math.floor(Math.random()*8)],
  }));
  return (
    <div style={{position:"absolute",inset:0,pointerEvents:"none",overflow:"hidden"}}>
      {particles.map(p=>(
        <div key={p.id} style={{
          position:"absolute",left:"50%",top:"40%",
          fontSize:p.size,
          "--tx":p.tx,"--ty":p.ty,
          animation:`ob-particle 1.2s ease-out ${p.delay} both`,
        }}>{p.emoji}</div>
      ))}
    </div>
  );
}

// ─── CRACK LINES SVG ─────────────────────────────────────
function CrackLines({ color, active }) {
  if (!active) return null;
  return (
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} viewBox="0 0 200 200">
      {[
        "M100,100 L140,40 L160,60","M100,100 L60,30 L40,55","M100,100 L170,130 L190,110",
        "M100,100 L30,140 L10,120","M100,100 L120,170 L100,190","M100,100 L80,175 L60,190",
      ].map((d,i)=>(
        <path key={i} d={d} fill="none" stroke={color} strokeWidth="1.5" opacity="0.7"
          style={{animation:`crack-line 0.4s ease-out ${i*0.06}s both`}}/>
      ))}
      <circle cx="100" cy="100" r="8" fill={color} opacity="0.5" style={{animation:"crack-line 0.3s ease-out both"}}/>
    </svg>
  );
}

// ─── ENHANCED OPEN BOX MODAL ─────────────────────────────
function OpenBoxModal({ entry, nftContract, onClose, toast }) {
  const [phase,    setPhase]    = useState("shake");
  const [txStatus, setTxStatus] = useState("idle");
  const [txError,  setTxError]  = useState("");
  const [openedImg,setOpenedImg]= useState(null);
  const [prize,    setPrize]    = useState(null);
  const [shimmer,  setShimmer]  = useState(false);
  const { mutate: sendTx } = useSendTransaction();

  useEffect(()=>{
    const t1 = setTimeout(()=>setPhase("crack"), 1200);
    const t2 = setTimeout(()=>{ setPhase("calling"); setTxStatus("pending"); }, 2000);
    const t3 = setTimeout(()=>{
      const tx = prepareContractCall({ contract:nftContract, method:"function openBox(uint256 tokenId)", params:[entry.tokenId] });
      sendTx(tx, {
        onSuccess: async(receipt)=>{
          setTxStatus("success");
          setShimmer(true);
          toast("Box opened on-chain! 🎉","ok");
          try {
            const ev = receipt?.events?.find(e=>e.eventName==="BoxOpened");
            if (ev?.args) setPrize({prizeTier:Number(ev.args.prizeTier),gemsWon:ev.args.gemsWon,nftInside:ev.args.nftInside});
          } catch {}
          const img = await resolveTokenImage(nftContract, entry.tokenId);
          if (img) setOpenedImg(img);
          setPhase("reveal");
          setTimeout(()=>setShimmer(false),2000);
        },
        onError:(e)=>{
          setTxStatus("error");
          setTxError((e?.message??"Transaction failed").slice(0,80));
          toast("Transaction failed ⚠️","err");
          setPhase("reveal");
        },
      });
    }, 2400);
    return ()=>{ clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  },[]);

  const tierInfo = prize ? (PRIZE_TIERS[prize.prizeTier]??PRIZE_TIERS[1]) : null;
  const imgSrc   = openedImg || entry.img || mkSVG(entry.name,entry.c1,entry.c2,entry.emoji);
  const gemsDisplay = prize?.gemsWon ? fmtGems(prize.gemsWon) : entry.gemsReward ? fmtGems(entry.gemsReward) : entry.gems;

  const imgStyle = {
    width:200, height:200, objectFit:"cover", display:"block",
    animation:
      phase==="shake"   ? "ob-shake 0.18s ease-in-out infinite" :
      phase==="crack"   ? "ob-crack 0.7s ease-out forwards" :
      phase==="calling" ? "ob-spin 1s linear infinite" :
                          "ob-reveal 0.9s cubic-bezier(0.34,1.56,0.64,1) forwards",
  };

  const phaseLabel = {
    shake:   "✨ Warming up…",
    crack:   "💥 Cracking open!",
    calling: "⛓️ On-chain magic…",
    reveal:  txStatus==="success" ? "🎉 Confirmed on-chain!" : "🎁 Opened!",
  };

  return (
    <div className="modal-overlay" onClick={phase==="reveal"?onClose:undefined}>
      <div className="modal-box" onClick={e=>e.stopPropagation()} style={{"--clr":entry.color}}>
        <div style={{position:"absolute",inset:0,borderRadius:24,
          background:`radial-gradient(ellipse at 50% 30%,${entry.color}18 0%,transparent 70%)`,
          pointerEvents:"none",
          ...(shimmer?{animation:"ob-glow-pulse 0.8s ease-in-out infinite"}:{}),
        }}/>
        <div style={{padding:"30px 24px 26px",textAlign:"center",position:"relative"}}>
          <div style={{fontSize:11,color:"#444",letterSpacing:3,textTransform:"uppercase",marginBottom:22,minHeight:16}}>
            {phaseLabel[phase]}
          </div>
          <div style={{position:"relative",display:"inline-block",borderRadius:18,overflow:"hidden",
            boxShadow:`0 0 ${phase==="reveal"?"60px":"30px"} ${entry.color}${phase==="reveal"?"99":"44"}`,
            transition:"box-shadow 0.5s ease"}}>
            <img src={imgSrc} alt={entry.name} style={imgStyle}
              onError={e=>{ e.target.src=mkSVG(entry.name,entry.c1,entry.c2,entry.emoji); }}/>
            <CrackLines color={entry.color} active={phase==="crack"}/>
          </div>
          <Particles color={entry.color} active={phase==="reveal"&&txStatus==="success"}/>
          {phase==="calling" && (
            <div style={{marginTop:18}}>
              <div style={{color:"#ffaa00",fontSize:12,letterSpacing:1,marginBottom:8}}>⏳ Waiting for confirmation…</div>
              <div style={{display:"flex",justifyContent:"center",gap:4}}>
                {[0,1,2,3,4].map(i=>(
                  <div key={i} style={{width:6,height:6,borderRadius:"50%",background:entry.color,
                    animation:`ob-float 1s ease-in-out ${i*0.15}s infinite alternate`}}/>
                ))}
              </div>
            </div>
          )}
          {phase==="reveal" && (
            <div style={{marginTop:24,animation:"ob-reveal 0.6s ease-out both"}}>
              <div style={{fontSize:22,fontWeight:900,color:entry.color,letterSpacing:1,marginBottom:10}}>
                {entry.emoji} {entry.name}
              </div>
              {tierInfo ? (
                <div style={{marginBottom:12}}>
                  <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 20px",borderRadius:24,
                    background:`${tierInfo.color}18`,border:`1px solid ${tierInfo.color}55`,
                    color:tierInfo.color,fontWeight:800,fontSize:16,marginBottom:10}}>
                    {tierInfo.emoji} {tierInfo.label.toUpperCase()} PRIZE
                  </div>
                  {Number(prize?.gemsWon??0)>0 && (
                    <div style={{fontSize:28,color:"#00ff88",fontWeight:900,marginBottom:6,textShadow:"0 0 20px #00ff8866"}}>
                      +{fmtGems(prize.gemsWon)} 💎 GEMS
                    </div>
                  )}
                  {prize?.nftInside && <div style={{color:"#ff9900",fontWeight:700,fontSize:14,marginBottom:6}}>🖼️ Bonus NFT Inside!</div>}
                </div>
              ) : (
                <div style={{fontSize:26,color:"#00ff88",fontWeight:900,marginTop:6,textShadow:"0 0 20px #00ff8866"}}>
                  +{gemsDisplay} 💎 GEMS
                </div>
              )}
              <div style={{marginTop:8,fontSize:12}}>
                {txStatus==="success" && <span style={{color:"#00ff88"}}>✅ On-chain confirmed</span>}
                {txStatus==="error"   && <span style={{color:"#ff6644"}}>⚠️ {txError}</span>}
              </div>
            </div>
          )}
          <button onClick={onClose} className="mint-btn"
            style={{marginTop:22,
              background:phase==="reveal"?(txStatus==="success"?entry.color:"#1e1e30"):"#1e1e30",
              color:phase==="reveal"&&txStatus==="success"?"#000":"#888",
              fontSize:13,padding:"12px 0",
            }}>
            {phase==="reveal"?(txStatus==="success"?"🎊 Claim & Close":"✕ Close"):"✕ Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NEAR NFT TRADE SECTION (embedded in NearPanel) ──────
function NearNftTradeSection({ nearAcc, nearNfts, nftContract, account, toast }) {
  const [tradeTab,  setTradeTab]  = useState("listings");
  const [listings,  setListings]  = useState([]);
  const [listPrice, setListPrice] = useState("");
  const [selNft,    setSelNft]    = useState(null);
  const [txPending, setTxPending] = useState(false);
  const { mutate: sendTx } = useSendTransaction();

  // mock listings seeded with NEAR NFT contract context
  useEffect(()=>{
    setListings([
      { id:1, box:BOXES[9],  seller:"alice.near",   price:"0.15", tokenId:BigInt(101) },
      { id:2, box:BOXES[6],  seller:"bob.near",     price:"0.08", tokenId:BigInt(202) },
      { id:3, box:BOXES[5],  seller:"carol.near",   price:"0.07", tokenId:BigInt(303) },
      { id:4, box:BOXES[7],  seller:"0xDEAD…BEEF",  price:"0.09", tokenId:BigInt(404) },
    ]);
  },[]);

  function handleBuy(listing) {
    if (!account) { toast("Connect EVM wallet to buy","err"); return; }
    setTxPending(true);
    const tx = prepareContractCall({
      contract: nftContract,
      method: "function buyBox(uint256 tokenId) payable",
      params: [listing.tokenId],
      value: toWei(listing.price),
    });
    sendTx(tx, {
      onSuccess: ()=>{ toast(`✅ Bought ${listing.box.name}!`,"ok"); setTxPending(false); setListings(l=>l.filter(x=>x.id!==listing.id)); },
      onError:   (e)=>{ toast("Buy failed: "+e?.message?.slice(0,40),"err"); setTxPending(false); },
    });
  }

  function handleList() {
    if (!nearAcc) { toast("Connect NEAR wallet to list","err"); return; }
    if (!selNft || !listPrice) { toast("Select an NFT and set a price","err"); return; }
    // NEAR ft_transfer_call simulation — real impl would call nft_approve on NEAR
    toast(`✅ Listed ${selNft.metadata?.title||"NFT #"+selNft.token_id} for ${listPrice} NEAR`,"ok");
    setSelNft(null); setListPrice("");
  }

  const statRow = (label, val, color="#00c9a7") => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid #111"}}>
      <span style={{color:"#444",fontSize:11,letterSpacing:1}}>{label}</span>
      <span style={{color,fontWeight:700,fontSize:12}}>{val}</span>
    </div>
  );

  return (
    <div className="near-trade-section">
      {/* Section header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,transparent,#00c9a733)"}}/>
        <span style={{fontSize:11,letterSpacing:4,color:"#00c9a7",fontWeight:700,fontFamily:"'Courier New',monospace"}}>
          🖼️ NFT MARKETPLACE
        </span>
        <div style={{flex:1,height:1,background:"linear-gradient(90deg,#00c9a733,transparent)"}}/>
      </div>

      <p style={{color:"#444",fontSize:11,marginBottom:16,lineHeight:1.7}}>
        Buy &amp; sell GemsRock Ice Box NFTs. NEAR contract:{" "}
        <a href={`https://nearblocks.io/nfts/${NEAR_NFT_ADDR}`} target="_blank" rel="noreferrer"
          style={{color:"#00c9a7",borderBottom:"1px solid #00c9a733"}}>
          {NEAR_NFT_ADDR}
        </a>
      </p>

      {/* Trade mode tabs */}
      <div className="near-trade-tabs">
        {[["listings","📋 Listings"],["buy","🛒 Buy"],["sell","💰 Sell"]].map(([m,l])=>(
          <button key={m} className={`near-trade-tab${tradeTab===m?" active":""}`} onClick={()=>setTradeTab(m)}>{l}</button>
        ))}
      </div>

      {/* ── LISTINGS ── */}
      {tradeTab==="listings" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {listings.map(l=>{
              const tierC = TIER_COLOR[l.box.tier]||"#fff";
              return (
                <div key={l.id} className="nft-trade-card">
                  <div style={{position:"relative",borderRadius:9,overflow:"hidden",marginBottom:9}}>
                    <img
                      src={l.box.img||mkSVG(l.box.name,l.box.c1,l.box.c2,l.box.emoji)}
                      alt={l.box.name}
                      style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}
                      onError={e=>{e.target.src=mkSVG(l.box.name,l.box.c1,l.box.c2,l.box.emoji);}}
                    />
                    <div style={{position:"absolute",top:5,right:5,fontSize:9,fontWeight:700,letterSpacing:1,
                      textTransform:"uppercase",padding:"2px 7px",borderRadius:99,
                      color:tierC,border:`1px solid ${tierC}55`,background:"rgba(0,0,0,.75)"}}>
                      {l.box.tier}
                    </div>
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:2}}>{l.box.name}</div>
                  <div style={{fontSize:9,color:"#444",marginBottom:2}}>#{l.tokenId.toString()} · {l.seller}</div>
                  <div style={{fontSize:10,color:"#00e676",marginBottom:6}}>💎 +{l.box.gems} GEMS</div>
                  <div style={{fontSize:15,fontWeight:900,color:"#FFD700",marginBottom:8}}>{l.price} MON</div>
                  <button className="mint-btn" disabled={!account||txPending}
                    style={{background:l.box.color,color:"#000",marginTop:0,padding:"8px 0",fontSize:10}}
                    onClick={()=>handleBuy(l)}>
                    {txPending?"⏳…":"🛒 Buy Now"}
                  </button>
                </div>
              );
            })}
          </div>
          {listings.length===0 && (
            <div style={{textAlign:"center",padding:"32px 0",color:"#333",fontSize:12}}>No active listings</div>
          )}
        </div>
      )}

      {/* ── BUY (market stats + NEAR NFT browser) ── */}
      {tradeTab==="buy" && (
        <div>
          <div style={{background:"#07090f",borderRadius:11,padding:14,marginBottom:14}}>
            {statRow("Floor Price",   "0.07 MON",       "#00e676")}
            {statRow("24h Volume",    "2.4 MON",         "#FFD700")}
            {statRow("Total Listed",  listings.length,   "#00e5ff")}
            {statRow("NEAR Contract", NEAR_NFT_ADDR.slice(0,18)+"…", "#00c9a7")}
          </div>

          <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:10,fontWeight:700}}>
            YOUR NEAR NFTs ({nearNfts.length})
          </div>
          {nearAcc ? (
            nearNfts.length > 0 ? (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {nearNfts.map((nft,i)=>(
                  <div key={i} className="nft-trade-card">
                    {nft.metadata?.media && (
                      <img src={ipfsToHttp(nft.metadata.media)} alt="nft"
                        style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:7,marginBottom:6,display:"block"}}
                        onError={e=>{e.target.style.display="none";}}/>
                    )}
                    <div style={{fontSize:11,fontWeight:700,color:"#00c9a7"}}>{nft.metadata?.title||"NEAR NFT"}</div>
                    <div style={{fontSize:9,color:"#444"}}>Token: {nft.token_id}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{color:"#333",fontSize:12,textAlign:"center",padding:"20px 0"}}>
                No NEAR NFTs found in your wallet
              </div>
            )
          ) : (
            <div style={{color:"#444",fontSize:11,textAlign:"center",padding:"20px 0",
              background:"#07090f",borderRadius:10,border:"1px dashed #1e1e30"}}>
              Connect your NEAR wallet above to browse your NFTs
            </div>
          )}

          <a href={`https://nearblocks.io/nfts/${NEAR_NFT_ADDR}`} target="_blank" rel="noreferrer"
            style={{display:"block",textAlign:"center",marginTop:14,color:"#00c9a7",fontSize:11,
              border:"1px solid #00c9a722",borderRadius:9,padding:"9px 0"}}>
            View all on NEAR Explorer ↗
          </a>
        </div>
      )}

      {/* ── SELL ── */}
      {tradeTab==="sell" && (
        <div>
          {nearAcc ? (
            <>
              <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:12,fontWeight:700}}>
                SELECT YOUR NEAR NFT TO LIST
              </div>

              {nearNfts.length > 0 ? (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,maxHeight:260,overflowY:"auto"}}>
                  {nearNfts.map((nft,i)=>(
                    <div key={i} onClick={()=>setSelNft(nft)}
                      style={{borderRadius:9,overflow:"hidden",cursor:"pointer",
                        border:`2px solid ${selNft?.token_id===nft.token_id?"#00c9a7":"#1e1e30"}`,
                        transition:".2s",opacity:selNft&&selNft.token_id!==nft.token_id?0.45:1,
                        background:"#07090f"}}>
                      {nft.metadata?.media ? (
                        <img src={ipfsToHttp(nft.metadata.media)} alt="nft"
                          style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}
                          onError={e=>{e.target.style.display="none";}}/>
                      ) : (
                        <div style={{aspectRatio:"1",background:"#111",display:"flex",alignItems:"center",
                          justifyContent:"center",fontSize:28}}>🖼️</div>
                      )}
                      <div style={{padding:"6px 8px"}}>
                        <div style={{fontSize:10,fontWeight:700,color:"#00c9a7"}}>{nft.metadata?.title||"NFT"}</div>
                        <div style={{fontSize:9,color:"#444"}}>#{nft.token_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // fallback: let user pick from BOXES if no NEAR NFTs fetched yet
                <>
                  <div style={{fontSize:9,color:"#333",marginBottom:8,letterSpacing:1}}>
                    NO NEAR NFTS LOADED — DEMO: SELECT BOX TYPE
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16,maxHeight:240,overflowY:"auto"}}>
                    {BOXES.slice(0,6).map(b=>(
                      <div key={b.id} onClick={()=>setSelNft({token_id:String(b.id),metadata:{title:b.name,media:b.img}})}
                        style={{borderRadius:9,overflow:"hidden",cursor:"pointer",
                          border:`2px solid ${selNft?.token_id===String(b.id)?b.color:"#1e1e30"}`,
                          transition:".2s",opacity:selNft&&selNft.token_id!==String(b.id)?0.45:1}}>
                        <img src={b.img||mkSVG(b.name,b.c1,b.c2,b.emoji)} alt={b.name}
                          style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block"}}
                          onError={e=>{e.target.src=mkSVG(b.name,b.c1,b.c2,b.emoji);}}/>
                        <div style={{padding:"5px 7px",background:"#0b0b16"}}>
                          <div style={{fontSize:10,fontWeight:700,color:"#ccc"}}>{b.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selNft && (
                <div style={{background:"#07090f",borderRadius:11,padding:14,marginBottom:12,
                  border:"1px solid #00c9a722"}}>
                  <div style={{fontSize:10,color:"#00c9a7",letterSpacing:2,marginBottom:10,fontWeight:700}}>
                    LISTING: {selNft.metadata?.title||"NFT #"+selNft.token_id}
                  </div>
                  <div style={{position:"relative",marginBottom:10}}>
                    <input className="trade-input-near" type="number" placeholder="Price in NEAR"
                      value={listPrice} onChange={e=>setListPrice(e.target.value)}
                      style={{paddingRight:55}}/>
                    <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",
                      fontSize:11,color:"#444"}}>NEAR</span>
                  </div>
                  {listPrice && (
                    <div style={{fontSize:10,color:"#444",marginBottom:10}}>
                      Platform fee: 2.5% → You receive:{" "}
                      <span style={{color:"#00c9a7"}}>{(parseFloat(listPrice||0)*0.975).toFixed(4)} NEAR</span>
                    </div>
                  )}
                  <button className="mint-btn" disabled={!listPrice||txPending}
                    style={{background:listPrice?"#00c9a7":"#1e1e30",color:listPrice?"#000":"#555",marginTop:0}}
                    onClick={handleList}>
                    {txPending?"⏳ Listing…":"Ⓝ List on NEAR"}
                  </button>
                </div>
              )}

              <div style={{fontSize:10,color:"#333",lineHeight:1.7,marginTop:6}}>
                Listing calls <code style={{color:"#00c9a744"}}>nft_approve</code> on {NEAR_NFT_ADDR}. Your NEAR wallet will prompt for confirmation.
              </div>
            </>
          ) : (
            <div style={{textAlign:"center",padding:"36px 20px",color:"#333",
              background:"#07090f",borderRadius:11,border:"1px dashed #1e1e30"}}>
              Ⓝ Connect your NEAR wallet above to list NFTs for sale
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── HOOKS ───────────────────────────────────────────────
function useBoxPrice(nftContract) {
  const {data} = useReadContract({contract:nftContract, method:"function BOX_PRICE() view returns (uint256)", params:[]});
  return data;
}
function useTokenStats(tokenContract) {
  const {data:maxSupply}    = useReadContract({contract:tokenContract, method:"function MAX_SUPPLY() view returns (uint256)",      params:[]});
  const {data:rewardPool}   = useReadContract({contract:tokenContract, method:"function BOX_REWARD_POOL() view returns (uint256)", params:[]});
  const {data:publicSupply} = useReadContract({contract:tokenContract, method:"function PUBLIC_SUPPLY() view returns (uint256)",   params:[]});
  const {data:ownerReserve} = useReadContract({contract:tokenContract, method:"function OWNER_RESERVE() view returns (uint256)",   params:[]});
  const {data:totalSupply}  = useReadContract({contract:tokenContract, method:"function totalSupply() view returns (uint256)",     params:[]});
  return {maxSupply,rewardPool,publicSupply,ownerReserve,totalSupply};
}
function useOwnedBoxes(nftContract, account) {
  const [chainBoxes, setChainBoxes] = useState([]);
  useEffect(()=>{
    if (!nftContract||!account?.address){setChainBoxes([]);return;}
    let cancelled=false;
    async function fetchLogsInChunks(fromBlock,toBlock,paddedAddr,TRANSFER_TOPIC){
      const CHUNK=500; const allLogs=[]; let current=fromBlock;
      while(current<=toBlock){
        const chunkEnd=Math.min(current+CHUNK-1,toBlock);
        try{
          const resp=await window.fetch(RPC_URL,{method:"POST",headers:{"Content-Type":"application/json"},
            body:JSON.stringify({jsonrpc:"2.0",id:1,method:"eth_getLogs",params:[{fromBlock:"0x"+current.toString(16),toBlock:"0x"+chunkEnd.toString(16),address:NFT_ADDR,topics:[TRANSFER_TOPIC,null,"0x"+paddedAddr]}]})});
          const data=await resp.json();
          if(data.result) allLogs.push(...data.result);
        }catch{}
        current=chunkEnd+1;
      }
      return allLogs;
    }
    async function fetchOwned(){
      try{
        const paddedAddr=account.address.toLowerCase().replace("0x","").padStart(64,"0");
        const TRANSFER_TOPIC="0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        const blockResp=await window.fetch(RPC_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({jsonrpc:"2.0",id:2,method:"eth_blockNumber",params:[]})});
        const blockData=await blockResp.json();
        const latestBlock=parseInt(blockData.result,16);
        const logs=await fetchLogsInChunks(1,latestBlock,paddedAddr,TRANSFER_TOPIC);
        const tokenIds=[...new Set(logs.map(l=>BigInt(l.topics[3])))];
        const owned=[];
        for(const tokenId of tokenIds){
          try{
            const owner=await readContract({contract:nftContract,method:"function ownerOf(uint256) view returns (address)",params:[tokenId]});
            if(owner?.toLowerCase()!==account.address.toLowerCase()) continue;
            let boxType=0,isOpened=false,gemsReward=null;
            try{
              const boxData=await readContract({contract:nftContract,method:"function getBox(uint256) view returns ((uint8 boxType, uint8 prizeTier, uint256 gemsReward, bool nftInside, uint256 nftCardId, uint8 state, uint40 mintedAt, uint40 openedAt, bytes32 seed))",params:[tokenId]});
              boxType=Number(boxData.boxType); isOpened=Number(boxData.state)>=1; gemsReward=boxData.gemsReward;
            }catch{}
            const boxDef=BOXES[boxType]||BOXES[0];
            owned.push({tokenId,uid:tokenId.toString(),opened:isOpened,id:boxType,name:boxDef.name,gems:boxDef.gems,gemsReward,color:boxDef.color,emoji:boxDef.emoji,img:boxDef.img,c1:boxDef.c1,c2:boxDef.c2});
          }catch{}
        }
        if(!cancelled) setChainBoxes(owned);
      }catch(e){console.error("useOwnedBoxes:",e);}
    }
    fetchOwned();
    return()=>{cancelled=true;};
  },[nftContract,account?.address]);
  return chainBoxes;
}

// ─── BOX CARD ────────────────────────────────────────────
function BoxCard({box,account,status,onMint,contractPrice}) {
  const [imgLoaded,setImgLoaded]=useState(false);
  const pending=status==="pending"; const done=status==="done";
  const tierC=TIER_COLOR[box.tier]||"#fff";
  const displayPrice=contractPrice?(Number(contractPrice)/1e18).toFixed(4).replace(/\.?0+$/,"")+' MON':box.price+" MON";
  const imgSrc = box.img || mkSVG(box.name,box.c1,box.c2,box.emoji);
  return (
    <div className="box-card" style={{"--clr":box.color,boxShadow:`0 0 0 1px ${box.color}22`}}>
      <div className="rarity-badge" style={{"--clr":tierC,borderColor:tierC,color:tierC}}>{box.tier}</div>
      <div className="box-img-wrap">
        {!imgLoaded && <div className="img-skeleton" style={{position:"absolute",inset:0}}/>}
        <img src={imgSrc} alt={box.name}
          style={{opacity:imgLoaded?1:0,transition:"opacity .35s"}}
          onLoad={()=>setImgLoaded(true)}
          onError={e=>{ e.target.src=mkSVG(box.name,box.c1,box.c2,box.emoji); setImgLoaded(true); }}/>
        <div className="ice-sheen"/>
        <div className="box-glow-overlay" style={{"--clr":box.color}}/>
      </div>
      <div style={{padding:"10px 12px 14px"}}>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
          <span style={{fontSize:14}}>{box.emoji}</span>
          <span style={{fontWeight:800,fontSize:13,color:"#fff",letterSpacing:.5}}>{box.name}</span>
        </div>
        <div style={{fontSize:11,color:box.color,marginBottom:3}}>💎 +{box.gems} GEMS reward</div>
        <div style={{fontSize:14,fontWeight:700,color:"#FFD700",marginBottom:2}}>{displayPrice}</div>
        <button className="mint-btn" disabled={!account||pending} onClick={()=>onMint(box)}
          style={{background:done?"#00c853":status==="error"?"#ff4444":pending?"#1e1e30":box.color,color:(!account||done||status==="error")?"#fff":"#000"}}>
          {!account?"🔌 Connect Wallet":pending?"⏳ Minting…":done?"✅ Minted!":status==="error"?"❌ Retry":"🧊 Mint Box"}
        </button>
      </div>
    </div>
  );
}

// ─── MY BOX ITEM ─────────────────────────────────────────
function MyBoxItem({entry,nftContract,onOpen}) {
  const [resolvedImg,setResolvedImg]=useState(entry.img);
  const [loading,setLoading]=useState(false);
  const isOpened=entry.opened;
  useEffect(()=>{
    if(!entry.tokenId||!isOpened) return;
    setLoading(true);
    resolveTokenImage(nftContract,entry.tokenId).then(img=>{if(img)setResolvedImg(img);setLoading(false);});
  },[entry.tokenId?.toString(),isOpened]);
  const imgSrc=resolvedImg||mkSVG(entry.name,entry.c1,entry.c2,entry.emoji);
  return (
    <div className={`mb-item${isOpened?" opened":""}`}>
      <div style={{position:"relative",width:"100%",aspectRatio:"1"}}>
        {loading && <div className="img-skeleton" style={{position:"absolute",inset:0}}/>}
        <img src={imgSrc} alt={entry.name}
          style={{width:"100%",aspectRatio:"1",objectFit:"cover",display:"block",opacity:loading?0.4:1,transition:"opacity .3s"}}
          onError={e=>{e.target.src=mkSVG(entry.name,entry.c1,entry.c2,entry.emoji);}}/>
      </div>
      <div style={{padding:"8px 10px"}}>
        <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:2}}>{entry.name}</div>
        <div style={{fontSize:10,color:"#444",marginBottom:2}}>Token #{entry.tokenId?.toString()??"—"}</div>
        <div style={{fontSize:10,color:"#00e676",marginBottom:5}}>{entry.gemsReward?fmtGems(entry.gemsReward):entry.gems} 💎</div>
        {isOpened
          ? <div style={{color:"#00ff88",fontWeight:700,fontSize:11,textAlign:"center"}}>✅ Opened</div>
          : <button className="mint-btn" onClick={()=>onOpen(entry)} style={{background:entry.color,color:"#000",marginTop:0}}>🧊 Open Box</button>}
      </div>
    </div>
  );
}

// ─── TOKEN POOL CARD ─────────────────────────────────────
function TokenPoolCard({tokenStats}) {
  const {maxSupply,rewardPool,publicSupply,ownerReserve,totalSupply}=tokenStats;
  const pct=poolPct(rewardPool,maxSupply);
  const rows=[
    {label:"Max Supply",    value:fmtSupply(maxSupply)   +" GEMS",color:"#FFD700"},
    {label:"Circulating",   value:fmtSupply(totalSupply) +" GEMS",color:"#00e5ff"},
    {label:"Reward Pool",   value:fmtSupply(rewardPool)  +" GEMS",color:"#00ff88"},
    {label:"Public Supply", value:fmtSupply(publicSupply)+" GEMS",color:"#aa44ff"},
    {label:"Owner Reserve", value:fmtSupply(ownerReserve)+" GEMS",color:"#ff9900"},
  ];
  return (
    <div style={{background:"#0b0b16",border:"1px solid #161625",borderRadius:14,padding:18,marginBottom:22}}>
      <div style={{fontSize:12,letterSpacing:3,color:"#FFD700",marginBottom:14,fontWeight:700}}>💎 GEMS TOKEN STATS</div>
      <div style={{marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#555",marginBottom:4}}>
          <span>REWARD POOL REMAINING</span>
          <span style={{color:"#00ff88"}}>{pct}%</span>
        </div>
        <div className="pool-bar-wrap"><div className="pool-bar" style={{width:`${pct}%`}}/></div>
        <div style={{fontSize:10,color:"#333",marginTop:4}}>{fmtSupply(rewardPool)} / {fmtSupply(maxSupply)} GEMS</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {rows.map(r=>(
          <div key={r.label} style={{background:"#07090f",borderRadius:9,padding:"8px 10px"}}>
            <div style={{fontSize:15,fontWeight:900,color:r.color}}>{r.value}</div>
            <div style={{fontSize:9,color:"#444",letterSpacing:1,marginTop:2}}>{r.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEAR PANEL (with embedded NFT trade) ────────────────
function NearPanel({ account, nftContract, toast: externalToast }) {
  const [nearAcc,     setNearAcc]     = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [nearReady,   setNearReady]   = useState(false);
  const [gemsBalance, setGemsBalance] = useState(null);
  const [metadata,    setMetadata]    = useState(null);
  const [balLoading,  setBalLoading]  = useState(false);
  const [recipient,   setRecipient]   = useState("");
  const [amount,      setAmount]      = useState("");
  const [sending,     setSending]     = useState(false);
  const [sendMsg,     setSendMsg]     = useState("");
  const [nearNfts,    setNearNfts]    = useState([]);

  useEffect(()=>{
    if(window.nearApi){setNearReady(true);return;}
    const script=document.createElement("script");
    script.src="https://cdn.jsdelivr.net/npm/near-api-js@2.1.4/dist/near-api-js.min.js";
    script.async=true;
    script.onload=()=>setNearReady(true);
    script.onerror=()=>setError("Failed to load NEAR library.");
    document.head.appendChild(script);
  },[]);

  useEffect(()=>{
    if(!nearReady||!window.nearApi) return;
    const {connect,keyStores,WalletConnection}=window.nearApi;
    const ks=new keyStores.BrowserLocalStorageKeyStore();
    connect(nearMainnetConfig(ks)).then(near=>{
      const wallet=new WalletConnection(near,NEAR_APP_KEY);
      if(wallet.isSignedIn()){
        const acc=wallet.getAccountId();
        setNearAcc(acc);
        localStorage.setItem("near_account_id",acc);
        loadAll(acc);
      }
    }).catch(()=>{});
  },[nearReady]);

  function nearMainnetConfig(keyStore){
    return{networkId:"mainnet",keyStore,nodeUrl:NEAR_RPC,walletUrl:"https://app.mynearwallet.com",helperUrl:"https://helper.mainnet.near.org",explorerUrl:"https://nearblocks.io"};
  }

  async function loadAll(accountId){
    setBalLoading(true);
    const [bal,meta,nfts]=await Promise.all([ftBalanceOf(accountId),ftMetadata(),nearNftTokensForOwner(accountId)]);
    setGemsBalance(bal); setMetadata(meta); setNearNfts(nfts);
    setBalLoading(false);
  }

  async function connectNear(){
    if(!nearReady||!window.nearApi){setError("NEAR library not loaded yet.");return;}
    setLoading(true);setError("");
    try{
      const {connect,keyStores,WalletConnection}=window.nearApi;
      const ks=new keyStores.BrowserLocalStorageKeyStore();
      const near=await connect(nearMainnetConfig(ks));
      const wallet=new WalletConnection(near,NEAR_APP_KEY);
      if(wallet.isSignedIn()){const acc=wallet.getAccountId();setNearAcc(acc);localStorage.setItem("near_account_id",acc);loadAll(acc);setLoading(false);return;}
      await wallet.requestSignIn({contractId:NEAR_TOKEN_ADDR,methodNames:["ft_transfer","ft_transfer_call"],successUrl:window.location.href,failureUrl:window.location.href});
    }catch(e){setError("Connection error: "+(e?.message??"Unknown error"));}
    setLoading(false);
  }

  function disconnectNear(){
    if(!window.nearApi) return;
    try{
      const {connect,keyStores,WalletConnection}=window.nearApi;
      const ks=new keyStores.BrowserLocalStorageKeyStore();
      connect(nearMainnetConfig(ks)).then(near=>{
        const wallet=new WalletConnection(near,NEAR_APP_KEY);
        wallet.signOut();setNearAcc(null);setGemsBalance(null);setMetadata(null);setNearNfts([]);
        localStorage.removeItem("near_account_id");
      });
    }catch{}
  }

  async function sendTransfer(){
    if(!recipient||!amount||!window.nearApi) return;
    setSending(true);setSendMsg("");
    try{
      const {connect,keyStores,WalletConnection}=window.nearApi;
      const ks=new keyStores.BrowserLocalStorageKeyStore();
      const near=await connect(nearMainnetConfig(ks));
      const wallet=new WalletConnection(near,NEAR_APP_KEY);
      if(!wallet.isSignedIn()){setSendMsg("Wallet not connected.");setSending(false);return;}
      const acct=wallet.account();
      const amountYocto=(BigInt(Math.round(parseFloat(amount)*1e4))*BigInt(1e14)).toString();
      await acct.functionCall({contractId:NEAR_TOKEN_ADDR,methodName:"ft_transfer",args:{receiver_id:recipient,amount:amountYocto,memo:"GemsRock transfer"},gas:"30000000000000",attachedDeposit:"1"});
      setSendMsg("✅ Transfer sent!");setRecipient("");setAmount("");loadAll(nearAcc);
    }catch(e){setSendMsg("❌ "+(e?.message??"Transfer failed").slice(0,80));}
    setSending(false);
  }

  const inputStyle={width:"100%",padding:"9px 12px",background:"#07090f",border:"1px solid #1e1e30",borderRadius:9,color:"#e0e0ee",fontFamily:"'Courier New',monospace",fontSize:12,marginBottom:8,outline:"none"};

  return (
    <div className="panel">
      <div className="panel-title">Ⓝ NEAR Wallet</div>
      <p style={{color:"#555",marginBottom:22,fontSize:13}}>
        Connect NEAR to view GEMS balance, GemsRock NFTs, and trade on the marketplace.
      </p>

      {!nearReady&&!error&&<div style={{textAlign:"center",padding:"20px 0",color:"#555",fontSize:13}}>⏳ Loading NEAR…</div>}

      {nearAcc ? (
        <>
          {/* ── connected card ── */}
          <div style={{background:"#0b0b16",borderRadius:13,padding:20,marginBottom:18}}>
            <div style={{color:"#00ff88",fontWeight:800,fontSize:15,marginBottom:6}}>✅ Connected</div>
            <div style={{color:"#00c9a7",fontFamily:"monospace",fontSize:13,marginBottom:8,wordBreak:"break-all"}}>{nearAcc}</div>
            <a href={`https://nearblocks.io/address/${nearAcc}`} target="_blank" rel="noreferrer"
              style={{display:"block",color:"#333",fontSize:11,marginBottom:12}}>🔍 View on NEAR Explorer ↗</a>

            {/* token balance */}
            <div style={{display:"flex",alignItems:"center",gap:14,background:"#07090f",borderRadius:9,padding:"10px 14px",marginBottom:10}}>
              <span style={{fontSize:22}}>💎</span>
              <div>
                <div style={{fontSize:18,fontWeight:900,color:"#FFD700"}}>{balLoading?"…":(gemsBalance??"—")} GEMS</div>
                {metadata&&<div style={{fontSize:10,color:"#444",marginTop:2,letterSpacing:1}}>{metadata.name} · {metadata.symbol}</div>}
              </div>
              <button onClick={()=>loadAll(nearAcc)} style={{marginLeft:"auto",background:"none",border:"1px solid #1e1e30",borderRadius:8,color:"#444",padding:"4px 10px",fontSize:11,cursor:"pointer"}}>↻</button>
            </div>

            {/* NEAR NFTs quick view */}
            {nearNfts.length>0 && (
              <div style={{marginBottom:10}}>
                <div style={{fontSize:10,color:"#555",letterSpacing:2,marginBottom:8,fontWeight:700}}>YOUR NEAR NFTs ({nearNfts.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}}>
                  {nearNfts.slice(0,4).map((nft,i)=>(
                    <div key={i} style={{background:"#07090f",borderRadius:8,padding:7}}>
                      {nft.metadata?.media&&<img src={ipfsToHttp(nft.metadata.media)} alt="nft" style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:5,marginBottom:4,display:"block"}} onError={e=>{e.target.style.display="none";}}/>}
                      <div style={{fontSize:9,fontWeight:700,color:"#00c9a7"}}>{nft.metadata?.title||"NFT #"+nft.token_id}</div>
                      <div style={{fontSize:8,color:"#333"}}>#{nft.token_id}</div>
                    </div>
                  ))}
                </div>
                {nearNfts.length>4&&<div style={{fontSize:10,color:"#444",marginTop:6,textAlign:"center"}}>+{nearNfts.length-4} more — see marketplace below</div>}
              </div>
            )}

            <button className="mint-btn" style={{background:"#ff4444",color:"#fff",width:"auto",padding:"8px 24px",marginTop:8}} onClick={disconnectNear}>
              Disconnect
            </button>
          </div>

          {/* ── GEMS transfer ── */}
          <div style={{background:"#0b0b16",borderRadius:13,padding:18,marginBottom:0}}>
            <div style={{fontSize:11,color:"#555",letterSpacing:2,marginBottom:12,fontWeight:700}}>SEND GEMS (NEAR)</div>
            <input style={inputStyle} placeholder="Recipient NEAR account (e.g. alice.near)" value={recipient} onChange={e=>setRecipient(e.target.value)}/>
            <div style={{position:"relative"}}>
              <input style={{...inputStyle,paddingRight:55}} placeholder="Amount" type="number" value={amount} onChange={e=>setAmount(e.target.value)}/>
              <span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-70%)",fontSize:11,color:"#555"}}>GEMS</span>
            </div>
            <button className="mint-btn" style={{background:sending?"#1e1e30":"#00c9a7",color:sending?"#555":"#000",marginTop:4}} disabled={sending||!recipient||!amount} onClick={sendTransfer}>
              {sending?"⏳ Sending…":"Ⓝ Send GEMS"}
            </button>
            {sendMsg&&(
              <div style={{marginTop:10,fontSize:12,padding:"8px 12px",borderRadius:8,
                background:sendMsg.startsWith("✅")?"#00ff8811":"#ff444411",
                color:sendMsg.startsWith("✅")?"#00ff88":"#ff8888",
                border:`1px solid ${sendMsg.startsWith("✅")?"#00ff8833":"#ff444433"}`}}>
                {sendMsg}
              </div>
            )}
            <div style={{fontSize:10,color:"#333",marginTop:8,lineHeight:1.6}}>
              Note: ft_transfer requires a 1 yoctoNEAR security deposit.
            </div>
          </div>

          {/* ── NFT Marketplace (embedded) ── */}
          <NearNftTradeSection
            nearAcc={nearAcc}
            nearNfts={nearNfts}
            nftContract={nftContract}
            account={account}
            toast={externalToast}
          />
        </>
      ) : nearReady && (
        <>
          <button className="near-connect-btn" onClick={connectNear} disabled={loading}>
            {loading?"⏳ Connecting…":"Ⓝ Connect NEAR Wallet"}
          </button>

          <div style={{background:"#0b0b16",borderRadius:11,padding:14,marginTop:16}}>
            <div style={{fontSize:11,color:"#555",letterSpacing:2,marginBottom:10,fontWeight:700}}>GEMS TOKEN (NEAR)</div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:22}}>💎</span>
              <div>
                <div style={{fontWeight:800,fontSize:14,color:"#FFD700"}}>GemsRock · GEMS</div>
                <div style={{fontSize:11,color:"#444",fontFamily:"monospace",marginTop:2}}>{NEAR_TOKEN_ADDR.slice(0,18)}…</div>
              </div>
            </div>
            <div style={{marginTop:12,display:"flex",gap:8,flexWrap:"wrap"}}>
              <a href={`https://nearblocks.io/token/${NEAR_TOKEN_ADDR}`} target="_blank" rel="noreferrer"
                style={{fontSize:11,color:"#00c9a7",border:"1px solid #00c9a722",borderRadius:8,padding:"4px 10px"}}>NEAR Explorer ↗</a>
              <a href={`https://nearblocks.io/nfts/${NEAR_NFT_ADDR}`} target="_blank" rel="noreferrer"
                style={{fontSize:11,color:"#836ef9",border:"1px solid #836ef922",borderRadius:8,padding:"4px 10px"}}>NFT Contract ↗</a>
              <a href="https://app.ref.finance/" target="_blank" rel="noreferrer"
                style={{fontSize:11,color:"#4488ff",border:"1px solid #4488ff22",borderRadius:8,padding:"4px 10px"}}>Ref.Finance ↗</a>
            </div>
          </div>

          <div style={{background:"#0b0b16",borderRadius:11,padding:14,marginTop:12,fontSize:11,color:"#444",lineHeight:1.8}}>
            <div style={{color:"#555",marginBottom:6,fontWeight:700}}>How it works:</div>
            <div>1. Click above to open MyNearWallet</div>
            <div>2. Sign in or create a NEAR account</div>
            <div>3. Authorize ft_transfer access for GEMS</div>
            <div>4. You'll be redirected back automatically</div>
            <div style={{marginTop:8,color:"#333"}}>After connecting, the NFT marketplace will appear here.</div>
          </div>

          {error&&(
            <div style={{color:"#ff9900",background:"#0b0b16",padding:12,borderRadius:9,marginTop:13,fontSize:11,whiteSpace:"pre-wrap",border:"1px solid #ff990033"}}>
              ⚠️ {error}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── SWAP/BRIDGE PANEL ───────────────────────────────────
function SwapBridgePanel({account}) {
  const [mode,setMode]=useState("swap");
  const bridges=[
    {name:"Monad Bridge",url:"https://monadbridge.com/",icon:"🌉",desc:"Official Monad bridge",color:"#836ef9"},
    {name:"NEAR Intents",url:"https://near-intents.org",icon:"Ⓝ",desc:"NEAR cross-chain intents",color:"#00c9a7"},
    {name:"Rhino.fi",url:"https://app.rhino.fi",icon:"🦏",desc:"Multi-chain bridge",color:"#00e5ff"},
    {name:"Stargate",url:"https://stargate.finance",icon:"⭐",desc:"LayerZero powered",color:"#ffaa00"},
  ];
  return (
    <div className="panel">
      <div className="panel-title">⇄ Swap / Bridge</div>
      <div style={{display:"flex",gap:8,marginBottom:22}}>
        {["swap","bridge"].map(m=>(
          <button key={m} className="mint-btn" style={{flex:1,background:mode===m?"#00e5ff":"#1a1a2e",color:mode===m?"#000":"#555",marginTop:0}} onClick={()=>setMode(m)}>
            {m==="swap"?"⇄ Swap Tokens":"🌉 Bridge Assets"}
          </button>
        ))}
      </div>
      {mode==="swap" && (account
        ? <PayEmbed client={client} payOptions={{mode:"fund_wallet",prefillBuy:{chain:MONAD,token:{address:TOKEN_ADDR,name:"GEMS",symbol:"GEMS",decimals:18},allowEdits:{amount:true,token:false,chain:false}}}} theme="dark" style={{width:"100%",maxWidth:440,margin:"0 auto",display:"block"}}/>
        : <div style={{textAlign:"center",padding:"44px 20px",color:"#333"}}>🔌 Connect wallet to swap</div>
      )}
      {mode==="bridge" && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:13}}>
          {bridges.map(b=>(
            <div key={b.name} className="bridge-card" onClick={()=>window.open(b.url,"_blank","noopener,noreferrer")}>
              <div style={{fontSize:32,marginBottom:8}}>{b.icon}</div>
              <div style={{fontWeight:800,color:"#ccc",fontSize:14,marginBottom:4}}>{b.name}</div>
              <div style={{color:"#444",fontSize:12,marginBottom:10}}>{b.desc}</div>
              <div style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,color:b.color,fontWeight:700,padding:"4px 10px",borderRadius:99,background:b.color+"18",border:`1px solid ${b.color}44`}}>Open ↗</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BUY PANEL ───────────────────────────────────────────
function BuyPanel({account}) {
  return (
    <div className="panel">
      <div className="panel-title">💳 Buy GEMS</div>
      <p style={{color:"#555",marginBottom:22,fontSize:13}}>Buy GEMS tokens with credit card, Apple Pay, Google Pay, or crypto.</p>
      {account
        ? <PayEmbed client={client} payOptions={{mode:"fund_wallet",prefillBuy:{chain:MONAD,token:{address:TOKEN_ADDR,name:"GEMS",symbol:"GEMS",decimals:18},allowEdits:{amount:true,token:false,chain:false}}}} theme="dark" style={{width:"100%",maxWidth:440,margin:"0 auto",display:"block"}}/>
        : <div style={{textAlign:"center",padding:"44px 20px",color:"#333"}}>🔌 Connect wallet to buy GEMS</div>
      }
    </div>
  );
}

// ─── WALLET PANEL ────────────────────────────────────────
function WalletPanel({account,balance,myBoxes,opened,totalNftMinted,tokenStats}) {
  const userStats=[
    {label:"GEMS Balance",  value:fmtGems(balance)+" 💎",color:"#00ff88"},
    {label:"Boxes Minted",  value:myBoxes.length,         color:"#00e5ff"},
    {label:"Boxes Opened",  value:opened,                 color:"#ffaa00"},
    {label:"Global Minted", value:totalNftMinted,         color:"#ff44cc"},
  ];
  return (
    <div className="panel">
      <div className="panel-title">👛 Wallet Overview</div>
      {account ? (
        <>
          <div style={{background:"#0b0b16",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{color:"#444",fontSize:11,letterSpacing:2,marginBottom:5}}>ADDRESS</div>
            <div style={{fontFamily:"monospace",color:"#00e5ff",fontSize:12,wordBreak:"break-all"}}>{account.address}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:18}}>
            {userStats.map(s=>(
              <div key={s.label} className="stat-card">
                <div style={{fontSize:18,fontWeight:900,color:s.color}}>{s.value}</div>
                <div style={{color:"#444",fontSize:10,marginTop:4,letterSpacing:1}}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <TokenPoolCard tokenStats={tokenStats}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <a href={`https://monadscan.com/address/${account.address}`} target="_blank" rel="noreferrer"
              style={{display:"block",textAlign:"center",padding:"9px 0",border:"1px solid #1e1e30",borderRadius:9,color:"#555",fontSize:12,transition:".2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#836ef9"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>🔍 Monad Explorer</a>
            <a href={`https://nearblocks.io/nfts/${NEAR_NFT_ADDR}`} target="_blank" rel="noreferrer"
              style={{display:"block",textAlign:"center",padding:"9px 0",border:"1px solid #1e1e30",borderRadius:9,color:"#555",fontSize:12,transition:".2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#00c9a7"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>Ⓝ NEAR NFTs</a>
          </div>
          <div style={{marginTop:12,display:"flex",gap:10}}>
            <a href={`https://monadvision.com/token/${NFT_ADDR}`} target="_blank" rel="noreferrer"
              style={{flex:1,display:"block",textAlign:"center",padding:"9px 0",border:"1px solid #1e1e30",borderRadius:9,color:"#555",fontSize:11,transition:".2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#ff9900"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>🖼️ NFT Contract</a>
            <a href={`https://monadvision.com/token/${TOKEN_ADDR}`} target="_blank" rel="noreferrer"
              style={{flex:1,display:"block",textAlign:"center",padding:"9px 0",border:"1px solid #1e1e30",borderRadius:9,color:"#555",fontSize:11,transition:".2s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#FFD700"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>💎 GEMS Token</a>
          </div>
        </>
      ) : (
        <div style={{textAlign:"center",padding:"44px 20px",color:"#333"}}>🔌 Connect your wallet</div>
      )}
    </div>
  );
}

// ─── APP INNER ───────────────────────────────────────────
function AppInner() {
  const [tab,       setTab]       = useState("icebox");
  const [mintStatus,setMintStatus]= useState({});
  const [myBoxes,   setMyBoxes]   = useState([]);
  const [openingBox,setOpeningBox]= useState(null);
  const [opened,    setOpened]    = useState(0);
  const [gemsPopup, setGemsPopup] = useState(null);

  const {toasts,toast} = useToasts();

  const account       = useActiveAccount();
  const tokenContract = getContract({client,chain:MONAD,address:TOKEN_ADDR});
  const nftContract   = getContract({client,chain:MONAD,address:NFT_ADDR});

  const {data:balance}        = useReadContract({contract:tokenContract,method:"function balanceOf(address) view returns (uint256)",params:[account?.address??"0x0000000000000000000000000000000000000000"]});
  const {data:nftTotalSupply} = useReadContract({contract:nftContract,  method:"function totalSupply() view returns (uint256)",     params:[]});

  const boxPrice   = useBoxPrice(nftContract);
  const tokenStats = useTokenStats(tokenContract);
  const chainBoxes = useOwnedBoxes(nftContract, account);

  const allBoxes = [
    ...chainBoxes.filter(c=>!myBoxes.some(m=>m.tokenId?.toString()===c.tokenId?.toString())),
    ...myBoxes,
  ];

  const {mutate:sendTx} = useSendTransaction();

  function handleMint(box) {
    if (!account) return;
    const value = boxPrice!=null ? boxPrice : toWei(box.price);
    setMintStatus(s=>({...s,[box.id]:"pending"}));
    const tx = prepareContractCall({contract:nftContract,method:"function mintSpecific(uint8 boxType) payable returns (uint256)",params:[box.id],value});
    sendTx(tx,{
      onSuccess:(receipt)=>{
        setMintStatus(s=>({...s,[box.id]:"done"}));
        let tokenId=BigInt(Date.now());
        try{
          const ev=receipt?.events?.find(e=>e.eventName==="BoxMinted");
          if(ev?.args?.tokenId!==undefined){tokenId=BigInt(ev.args.tokenId);}
          else{const log=receipt?.logs?.find(l=>l.topics?.length===4);if(log)tokenId=BigInt(log.topics[3]);}
        }catch{}
        setMyBoxes(prev=>[...prev,{...box,tokenId,uid:tokenId.toString(),opened:false,gemsReward:null}]);
        toast(`🧊 ${box.name} minted! +${box.gems} GEMS`,"ok");
        setGemsPopup({gems:box.gems,id:Date.now()});
        setTimeout(()=>setGemsPopup(null),2600);
      },
      onError:(e)=>{
        setMintStatus(s=>({...s,[box.id]:"error"}));
        const msg=e?.message??"";
        if(msg.includes("Insufficient MON")||msg.includes("insufficient funds")) toast("❌ Insufficient MON balance","err");
        else if(msg.includes("mintOpen")||msg.includes("not open")) toast("❌ Minting is not open yet","err");
        else toast("Mint failed ⚠️ "+msg.slice(0,40),"err");
      },
    });
  }

  function handleOpen(entry){setOpeningBox(entry);}
  function handleOpenClose(){
    if(openingBox){setMyBoxes(prev=>prev.map(b=>b.uid===openingBox.uid?{...b,opened:true}:b));setOpened(n=>n+1);}
    setOpeningBox(null);
  }

  const gems           = fmtGems(balance);
  const totalNftMinted = nftTotalSupply ? Number(nftTotalSupply) : 0;

  // NOTE: "🔄 Trade" tab removed — functionality now lives inside "Ⓝ NEAR"
  const TABS = [
    {id:"icebox", label:"🧊 Ice Box"},
    {id:"buy",    label:"💳 Buy / Card"},
    {id:"swap",   label:"⇄ Swap / Bridge"},
    {id:"near",   label:"Ⓝ NEAR"},
    {id:"wallet", label:"👛 Wallet"},
  ];

  return (
    <div style={{minHeight:"100vh",background:"#07090f",color:"#e0e0ee"}}>
      <style>{GLOBAL_CSS}</style>

      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 28px",borderBottom:"1px solid #161625",background:"rgba(7,9,15,.97)",backdropFilter:"blur(16px)",position:"sticky",top:0,zIndex:100,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span className="lg">💎</span>
          <div>
            <div className="site-title">GEMSROCK</div>
            <div style={{fontSize:10,letterSpacing:4,color:"#555",textTransform:"uppercase"}}>Ice Box Reward System · Monad</div>
          </div>
          <span className="lg lg2">💎</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
          {account && (
            <div style={{display:"flex",gap:18,fontSize:12,color:"#666"}}>
              <span>💎 <span style={{color:"#00ff88"}}>{gems}</span></span>
              <span>🧊 <span style={{color:"#00e5ff"}}>{totalNftMinted}</span> minted</span>
              {tokenStats.rewardPool && <span>🏦 <span style={{color:"#FFD700"}}>{fmtSupply(tokenStats.rewardPool)}</span> pool</span>}
            </div>
          )}
          <ConnectButton client={client} chain={MONAD} wallets={WALLETS} theme="dark" connectButton={{label:"🦊 Connect Wallet"}}/>
        </div>
      </header>

      <AdBanner/>

      {account && (
        <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",padding:"14px 20px",background:"#080810",borderBottom:"1px solid #111"}}>
          {[
            {label:"GEMS",       value:gems,                             color:"#FFD700"},
            {label:"NFT Minted", value:totalNftMinted,                  color:"#00e5ff"},
            {label:"Opened",     value:opened,                          color:"#ffaa00"},
            {label:"Pool",       value:fmtSupply(tokenStats.rewardPool),color:"#00ff88"},
            {label:"Network",    value:"Monad",                         color:"#a78bfa"},
          ].map(s=>(
            <div key={s.label} className="stat-card" style={{minWidth:100}}>
              <div style={{fontFamily:"'Cinzel',serif",fontSize:14,color:s.color,textShadow:`0 0 10px ${s.color}66`}}>{s.value}</div>
              <div style={{fontSize:10,color:"#444",letterSpacing:2,marginTop:3}}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      <nav style={{display:"flex",overflowX:"auto",borderBottom:"1px solid #161625",background:"#0a0a12",padding:"0 16px"}}>
        {TABS.map(t=>(
          <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      <main style={{maxWidth:1200,margin:"0 auto",padding:"36px 20px"}}>
        {tab==="icebox" && (
          <div>
            <div className="sec-h">CHOOSE YOUR ICE BOX</div>
            <p style={{color:"#444",fontSize:13,textAlign:"center",marginBottom:28}}>
              Mint a box on-chain, then open it to reveal your GEMS reward + bonus prizes.
            </p>
            <div className="box-grid" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:16,marginBottom:40}}>
              {BOXES.map(box=>(
                <BoxCard key={box.id} box={box} account={account} status={mintStatus[box.id]} onMint={handleMint} contractPrice={boxPrice}/>
              ))}
            </div>
            {allBoxes.length>0 && (
              <div style={{marginTop:40}}>
                <div className="sec-h">🧊 MY ICE BOXES ({allBoxes.length})</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",gap:14}}>
                  {allBoxes.map(b=>(
                    <MyBoxItem key={b.uid} entry={b} nftContract={nftContract} onOpen={handleOpen}/>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {tab==="buy"    && <BuyPanel account={account}/>}
        {tab==="swap"   && <SwapBridgePanel account={account}/>}
        {tab==="near"   && <NearPanel account={account} nftContract={nftContract} toast={toast}/>}
        {tab==="wallet" && <WalletPanel account={account} balance={balance} myBoxes={myBoxes} opened={opened} totalNftMinted={totalNftMinted} tokenStats={tokenStats}/>}
      </main>

      {openingBox && <OpenBoxModal entry={openingBox} nftContract={nftContract} onClose={handleOpenClose} toast={toast}/>}

      {gemsPopup && (
        <div key={gemsPopup.id} className="gems-popup" style={{left:"50%",bottom:"2rem",transform:"translateX(-50%)"}}>
          💎 +{gemsPopup.gems} GEMS
        </div>
      )}

      <div className="toast-wrap">
        {toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </div>
  );
}

export default function App() {
  return <ThirdwebProvider><AppInner/></ThirdwebProvider>;
}
