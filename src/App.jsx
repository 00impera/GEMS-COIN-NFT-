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

// ─── UNICODE-SAFE BASE64 ─────────────────────────────────
function btoaUnicode(str) {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode("0x" + p1)
    )
  );
}

// ─── SVG FALLBACK ────────────────────────────────────────
function mkSVG(label, c1, c2, emoji) {
  const s = `
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="${c1||"#333"}"/>
    <stop offset="100%" stop-color="${c2||"#111"}"/>
  </linearGradient></defs>
  <rect width="200" height="200" rx="18" fill="url(#g)"/>
  <rect x="8" y="8" width="184" height="184" rx="14" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>
  <text x="100" y="108" font-size="68" text-anchor="middle" dominant-baseline="middle">${emoji||"📦"}</text>
  <rect x="0" y="158" width="200" height="42" fill="rgba(0,0,0,0.45)"/>
  <text x="100" y="183" font-size="11" font-family="monospace" font-weight="bold" fill="white" text-anchor="middle">${label.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;base64,${btoaUnicode(s)}`;
}

// ─── IPFS HELPER ─────────────────────────────────────────
function ipfsToHttp(uri) {
  if (!uri) return null;
  if (uri.startsWith("ipfs://")) return uri.replace("ipfs://", "https://ipfs.io/ipfs/");
  if (uri.startsWith("http"))   return uri;
  return `https://ipfs.io/ipfs/${uri}`;
}

// ─── BOXES with hardcoded IPFS images ────────────────────
const IPFS = (cid) => `https://ipfs.io/ipfs/${cid}`;

const BOXES_RAW = [
  { id:0,  name:"Crimson Blaze",  tier:"Common",    color:"#ff2244", glow:"#ff224466", price:"0.01", emoji:"🔥", c1:"#ff2244", c2:"#aa0011", gems:10,   img:IPFS("QmNxaB2arw4MkWuAzycfnPp9LFC3XUAzVDGjpNT15RnVae") },
  { id:1,  name:"Sapphire Abyss", tier:"Common",    color:"#1e8fff", glow:"#1e8fff66", price:"0.01", emoji:"💧", c1:"#1e8fff", c2:"#0044aa", gems:10,   img:IPFS("QmcxejngatCCWujo2tPWdFQrsBDsePj3aMKiSc9X9WPyiJ") },
  { id:2,  name:"Emerald Vault",  tier:"Uncommon",  color:"#00e676", glow:"#00e67666", price:"0.01", emoji:"🌿", c1:"#00e676", c2:"#007744", gems:20,   img:IPFS("QmYpiB7M15YfVHJFgg9C8VJFGWLGDSK55ZZkhirh1wATBb") },
  { id:3,  name:"Violet Phantom", tier:"Rare",      color:"#bb44ff", glow:"#bb44ff66", price:"0.02", emoji:"🔮", c1:"#bb44ff", c2:"#6600cc", gems:20,   img:IPFS("Qmd2JS1WCtsorYLwfFobwD4bTa3AqssQ8GMfjNpzec4WBm") },
  { id:4,  name:"Solar Gold",     tier:"Rare",      color:"#ffaa00", glow:"#ffaa0066", price:"0.05", emoji:"☀️", c1:"#ffaa00", c2:"#cc6600", gems:50,   img:IPFS("QmPfpWsNZrbg4nyxCL9CTnbg1SwYammR9w4h6au3BCB9Dw") },
  { id:5,  name:"Arctic White",   tier:"Rare",      color:"#c0e8ff", glow:"#c0e8ff44", price:"0.05", emoji:"❄️", c1:"#c0e8ff", c2:"#6699cc", gems:50,   img:IPFS("QmSTBxidLriXEcJu7Jaa2obG8HN5QWn2LwAeP3MbwD3Qqp") },
  { id:6,  name:"Toxic Lime",     tier:"Epic",      color:"#aaff00", glow:"#aaff0066", price:"0.05", emoji:"⚡", c1:"#aaff00", c2:"#558800", gems:100,  img:IPFS("QmNbUkT8fxvJWRSZsGNW9ASSXeSt7E6YqikQtNGFNuS72K") },
  { id:7,  name:"Inferno Orange", tier:"Epic",      color:"#ff5500", glow:"#ff550066", price:"0.05", emoji:"🌋", c1:"#ff5500", c2:"#cc2200", gems:100,  img:IPFS("QmPueajc5f4f43M1YBEtpiT4agGiThpmn7qa4o2i8p4QZY") },
  { id:8,  name:"Cosmic Pink",    tier:"Legendary", color:"#ff44cc", glow:"#ff44cc66", price:"0.10", emoji:"🌸", c1:"#ff44cc", c2:"#aa0088", gems:200,  img:IPFS("QmRF4DGZnW5D9FyFqUsNV5ds5GsTmVevriEXcCcGvVcVWL") },
  { id:9,  name:"Shadow Black",   tier:"Legendary", color:"#9900ff", glow:"#9900ff66", price:"0.10", emoji:"💀", c1:"#9900ff", c2:"#440088", gems:200,  img:IPFS("Qmb1axxJvJzBA1tuyiTCteXoxdFx336cV6uEGse8wpkRsy") },
  { id:10, name:"Ocean Teal",     tier:"Mythic",    color:"#00e5cc", glow:"#00e5cc66", price:"0.10", emoji:"🐚", c1:"#00e5cc", c2:"#007766", gems:500,  img:IPFS("Qmc8dSwdiDnEXUUKP6fKZGA4FnFrmKgQQ7jJ3iUVge5NWu") },
  { id:11, name:"Rainbow Prism",  tier:"GODLIKE",   color:"#ffee44", glow:"#ffee4444", price:"0.25", emoji:"🐉", c1:"#ffee44", c2:"#ffaa00", gems:1000, img:IPFS("QmPtYQTjJZbA8515e3LQzt3oPq8CSc9kSW6FZukKvwD5dS") },
];
const BOXES = BOXES_RAW.map(b => ({ ...b }));

// ─── FORMAT HELPERS ──────────────────────────────────────
function fmtGems(wei) {
  if (wei === undefined || wei === null) return "—";
  try {
    const n = Number(BigInt(wei) / BigInt(1e14)) / 1e4;
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch { return "—"; }
}
function fmtSupply(wei) {
  if (wei === undefined || wei === null) return "—";
  try {
    const n = Number(BigInt(wei) / BigInt(1e18));
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
    if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
    return n.toLocaleString("en-US");
  } catch { return "—"; }
}
function poolPct(pool, max) {
  if (!pool || !max) return 0;
  try { return Math.min(100, Math.round(Number((BigInt(pool) * 100n) / BigInt(max)))); }
  catch { return 0; }
}

async function resolveTokenImage(nftContract, tokenId) {
  try {
    const uri = await readContract({ contract: nftContract, method: "function tokenURI(uint256 tokenId) view returns (string)", params: [tokenId] });
    const url = ipfsToHttp(uri);
    if (!url) return null;
    if (url.startsWith("data:")) return url;
    const res  = await fetch(url);
    const json = await res.json();
    return ipfsToHttp(json.image || json.image_url || "") || null;
  } catch { return null; }
}

// ─── NEAR RPC HELPERS ────────────────────────────────────
async function nearRpc(method, params) {
  const res = await fetch(NEAR_RPC, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: "1", method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message ?? "NEAR RPC error");
  return json.result;
}

async function ftBalanceOf(accountId) {
  try {
    const args = btoa(JSON.stringify({ account_id: accountId }));
    const result = await nearRpc("query", {
      request_type: "call_function",
      finality: "final",
      account_id: NEAR_TOKEN_ADDR,
      method_name: "ft_balance_of",
      args_base64: args,
    });
    const raw = JSON.parse(String.fromCharCode(...result.result));
    const n = Number(BigInt(raw) / BigInt(1e14)) / 1e4;
    return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  } catch {
    return null;
  }
}

async function ftMetadata() {
  try {
    const args = btoa("{}");
    const result = await nearRpc("query", {
      request_type: "call_function",
      finality: "final",
      account_id: NEAR_TOKEN_ADDR,
      method_name: "ft_metadata",
      args_base64: args,
    });
    return JSON.parse(String.fromCharCode(...result.result));
  } catch {
    return null;
  }
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

.img-skeleton{position:absolute;inset:0;
  background:linear-gradient(90deg,#111120 25%,#1a1a2e 50%,#111120 75%);
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

.modal-overlay{position:fixed;inset:0;z-index:1000;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);
  display:flex;align-items:center;justify-content:center;padding:1rem;}
.modal-box{background:linear-gradient(160deg,#13131f,#0e0e1a);border:1px solid #252535;
  border-radius:24px;width:100%;max-width:420px;position:relative;overflow:hidden;
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

@keyframes ob-shake{0%,100%{transform:rotate(-5deg) scale(1.07);}50%{transform:rotate(5deg) scale(1.11);}}
@keyframes ob-crack{0%{transform:scale(1);filter:brightness(1);}30%{transform:scale(1.2) rotate(4deg);filter:brightness(1.8);}65%{transform:scale(0.9) rotate(-3deg);filter:brightness(2.5);}100%{transform:scale(1.06);filter:brightness(1.3);}}
@keyframes ob-spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
@keyframes ob-reveal{0%{transform:scale(0.15) rotate(-25deg);opacity:0;filter:blur(12px);}65%{transform:scale(1.14) rotate(4deg);opacity:1;filter:blur(0);}100%{transform:scale(1) rotate(0deg);opacity:1;}}
@keyframes ob-float{0%{transform:translateY(0) scale(1);opacity:1;}100%{transform:translateY(-110px) scale(0.2);opacity:0;}}

.gems-popup{position:fixed;z-index:9999;pointer-events:none;display:flex;align-items:center;gap:.5rem;
  background:rgba(10,8,24,.95);border:1px solid rgba(167,139,250,.5);border-radius:12px;
  padding:.6rem 1rem;font-family:'Cinzel',serif;font-size:.9rem;color:#c4b5fd;
  box-shadow:0 0 30px rgba(167,139,250,.3);
  animation:gemsPopup 2.5s cubic-bezier(.25,.46,.45,.94) forwards;}
@keyframes gemsPopup{0%{opacity:0;transform:translateY(0) scale(.8);}15%{opacity:1;transform:translateY(-10px) scale(1.05);}70%{opacity:1;transform:translateY(-60px) scale(1);}100%{opacity:0;transform:translateY(-100px) scale(.9);}}

.sec-h{font-family:'Cinzel',serif;font-size:clamp(.75rem,2vw,.95rem);letter-spacing:5px;color:#FFD700;
  text-align:center;margin-bottom:1.4rem;display:flex;align-items:center;justify-content:center;gap:1rem;}
.sec-h::before,.sec-h::after{content:'';flex:1;max-width:100px;height:1px;
  background:linear-gradient(90deg,transparent,rgba(255,215,0,.4));}
.sec-h::after{transform:scaleX(-1);}

.mb-item{background:#0e0e1a;border:1px solid rgba(255,255,255,.06);border-radius:14px;overflow:hidden;cursor:pointer;transition:.25s;}
.mb-item:hover:not(.opened){border-color:rgba(255,215,0,.3);transform:translateY(-3px);}
.mb-item.opened{opacity:.45;cursor:default;}

.panel{background:linear-gradient(160deg,#111120,#0d0d1a);border-radius:20px;padding:28px;
  border:1px solid #161625;max-width:680px;margin:0 auto;}
.panel-title{font-size:21px;font-weight:900;letter-spacing:2px;margin-bottom:8px;
  background:linear-gradient(90deg,#00e5ff,#aa44ff);
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}

.bridge-card{display:flex;flex-direction:column;background:#0b0b16;border:1px solid #1e1e30;
  border-radius:13px;padding:18px 16px;text-decoration:none;transition:border-color .2s,transform .2s,box-shadow .2s;
  cursor:pointer;}
.bridge-card:hover{border-color:rgba(0,229,255,.4);transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,229,255,.1);}

.img-loading{background:linear-gradient(90deg,#111120 25%,#1a1a2e 50%,#111120 75%);
  background-size:200% 100%;animation:shimmer 1.5s infinite;}

.pool-bar-wrap{background:#0b0b16;border-radius:8px;overflow:hidden;height:8px;margin-top:6px;}
.pool-bar{height:100%;border-radius:8px;transition:width .8s ease;
  background:linear-gradient(90deg,#00e676,#00e5ff);}

.near-connect-btn{display:flex;align-items:center;justify-content:center;gap:10px;
  width:100%;max-width:340px;padding:14px 28px;border-radius:12px;border:none;
  background:linear-gradient(135deg,#00c9a7,#00887a);color:#000;
  font-family:'Courier New',monospace;font-weight:900;font-size:14px;letter-spacing:1px;
  cursor:pointer;transition:.2s;}
.near-connect-btn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,201,167,.3);}
.near-connect-btn:disabled{opacity:.5;cursor:not-allowed;}

@keyframes bannerGlow{0%{background-position:0% 0%}100%{background-position:300% 0%}}
@media(max-width:480px){.box-grid{grid-template-columns:repeat(2,1fr) !important;}}
`;

// ─── TOAST SYSTEM ────────────────────────────────────────
function useToasts() {
  const [toasts, setToasts] = useState([]);
  function toast(msg, type = "ok") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }
  return { toasts, toast };
}

// ─── ICONS ───────────────────────────────────────────────
const HandIcon     = ({ color }) => <span style={{ fontSize:22, filter:`drop-shadow(0 0 7px ${color})` }}>👉</span>;
const MonadIcon    = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
    <circle cx="16" cy="16" r="16" fill={color+"22"}/><text x="16" y="21" fontSize="14" fontWeight="bold" fill={color} textAnchor="middle">M</text>
  </svg>
);
const TelegramIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-2.04 9.613c-.152.677-.549.843-1.113.524l-3.07-2.262-1.484 1.428c-.164.164-.302.302-.618.302l.221-3.133 5.716-5.164c.249-.221-.054-.344-.384-.123L7.44 14.765l-3.023-.944c-.658-.205-.671-.658.138-.975l11.797-4.551c.548-.198 1.028.134.21.953z"/>
  </svg>
);
const XIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const DiscordIcon = ({ color }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={color}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
  </svg>
);

const AD_LINKS = [
  { Icon:HandIcon,     label:"Subscribe",   sub:"Click & Join Updates",  url:"https://t.me/gemsrock_bot",                                                 color:"#FFD700" },
  { Icon:MonadIcon,    label:"MonadVision", sub:"View TOKEN GemsRock",   url:"https://monadvision.com/token/0x49931887171BF46922b2b80Aa834537A80C50B70", color:"#836ef9" },
  { Icon:MonadIcon,    label:"MonadVision", sub:"View NFT",              url:"https://monadvision.com/token/0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2", color:"#836ef9" },
  { Icon:TelegramIcon, label:"Telegram",    sub:"@gemsrock_bot",         url:"https://t.me/gemsrock_bot",                                                 color:"#00c8ff" },
  { Icon:XIcon,        label:"Twitter / X", sub:"@bnbgold277983",        url:"https://twitter.com/bnbgold277983",                                         color:"#e0e0ff" },
  { Icon:DiscordIcon,  label:"Discord",     sub:"Join Server",           url:"https://discord.com/channels/1316093079090106472",                          color:"#5865f2" },
];

// ─── AD BANNER ───────────────────────────────────────────
function AdBanner() {
  const trackRef = useRef(null);
  const posRef   = useRef(0);
  const rafRef   = useRef(null);
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.innerHTML += track.innerHTML;
    function animate() {
      posRef.current -= 0.5;
      if (Math.abs(posRef.current) >= track.scrollWidth / 2) posRef.current = 0;
      track.style.transform = `translateX(${posRef.current}px)`;
      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return (
    <div style={{ width:"100%", background:"rgba(8,2,28,0.98)", overflow:"hidden" }}>
      <div style={{ height:2, background:"linear-gradient(90deg,#836ef9,#00c8ff,#00ff88,#5865f2,#836ef9)", backgroundSize:"300% 100%", animation:"bannerGlow 4s linear infinite" }} />
      <div style={{ overflow:"hidden", padding:"8px 0" }}>
        <div ref={trackRef} style={{ display:"flex", alignItems:"center", whiteSpace:"nowrap", willChange:"transform" }}>
          {AD_LINKS.map((item, i) => (
            <a key={i} href={item.url} target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"7px 36px", textDecoration:"none", borderRight:"1px solid rgba(131,110,249,0.12)", transition:"background 0.25s" }}
              onMouseEnter={e => { e.currentTarget.style.background = item.color+"14"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              <span style={{ display:"flex", alignItems:"center", filter:`drop-shadow(0 0 7px ${item.color})` }}>
                <item.Icon color={item.color} />
              </span>
              <span style={{ display:"flex", flexDirection:"column", gap:1 }}>
                <span style={{ fontSize:12, fontWeight:800, color:item.color, textShadow:`0 0 10px ${item.color}`, letterSpacing:1, fontFamily:"monospace", textTransform:"uppercase" }}>{item.label}</span>
                <span style={{ fontSize:10, color:"#555", letterSpacing:.5, fontFamily:"monospace" }}>{item.sub}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
      <div style={{ height:2, background:"linear-gradient(90deg,#5865f2,#00ff88,#00c8ff,#836ef9)", backgroundSize:"300% 100%", animation:"bannerGlow 4s linear infinite reverse" }} />
    </div>
  );
}

// ─── HOOK: BOX_PRICE from NFT contract ───────────────────
function useBoxPrice(nftContract) {
  const { data } = useReadContract({ contract:nftContract, method:"function BOX_PRICE() view returns (uint256)", params:[] });
  return data;
}

// ─── HOOK: Token contract stats ──────────────────────────
function useTokenStats(tokenContract) {
  const { data: maxSupply    } = useReadContract({ contract:tokenContract, method:"function MAX_SUPPLY() view returns (uint256)",      params:[] });
  const { data: rewardPool   } = useReadContract({ contract:tokenContract, method:"function BOX_REWARD_POOL() view returns (uint256)", params:[] });
  const { data: publicSupply } = useReadContract({ contract:tokenContract, method:"function PUBLIC_SUPPLY() view returns (uint256)",   params:[] });
  const { data: ownerReserve } = useReadContract({ contract:tokenContract, method:"function OWNER_RESERVE() view returns (uint256)",   params:[] });
  const { data: totalSupply  } = useReadContract({ contract:tokenContract, method:"function totalSupply() view returns (uint256)",     params:[] });
  return { maxSupply, rewardPool, publicSupply, ownerReserve, totalSupply };
}

// ─── HOOK: owned boxes ───────────────────────────────────
function useOwnedBoxes(nftContract, account) {
  const [chainBoxes, setChainBoxes] = useState([]);

  useEffect(() => {
    if (!nftContract || !account?.address) { setChainBoxes([]); return; }
    let cancelled = false;

    async function fetchLogsInChunks(fromBlock, toBlock, paddedAddr, TRANSFER_TOPIC) {
      const CHUNK = 500;
      const allLogs = [];
      let current = fromBlock;
      while (current <= toBlock) {
        const chunkEnd = Math.min(current + CHUNK - 1, toBlock);
        try {
          const resp = await window.fetch(RPC_URL, {
            method:"POST", headers:{"Content-Type":"application/json"},
            body:JSON.stringify({ jsonrpc:"2.0", id:1, method:"eth_getLogs",
              params:[{ fromBlock:"0x"+current.toString(16), toBlock:"0x"+chunkEnd.toString(16),
                address:NFT_ADDR, topics:[TRANSFER_TOPIC, null, "0x"+paddedAddr] }] }),
          });
          const data = await resp.json();
          if (data.result) allLogs.push(...data.result);
        } catch {}
        current = chunkEnd + 1;
      }
      return allLogs;
    }

    async function fetchOwned() {
      try {
        const paddedAddr     = account.address.toLowerCase().replace("0x","").padStart(64,"0");
        const TRANSFER_TOPIC = "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";
        const blockResp = await window.fetch(RPC_URL, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body:JSON.stringify({ jsonrpc:"2.0", id:2, method:"eth_blockNumber", params:[] }),
        });
        const blockData = await blockResp.json();
        const latestBlock = parseInt(blockData.result, 16);
        const logs = await fetchLogsInChunks(1, latestBlock, paddedAddr, TRANSFER_TOPIC);
        const tokenIds = [...new Set(logs.map(l => BigInt(l.topics[3])))];
        const owned    = [];
        for (const tokenId of tokenIds) {
          try {
            const owner = await readContract({ contract:nftContract, method:"function ownerOf(uint256) view returns (address)", params:[tokenId] });
            if (owner?.toLowerCase() !== account.address.toLowerCase()) continue;
            let boxType=0, isOpened=false, gemsReward=null;
            try {
              const boxData = await readContract({
                contract:nftContract,
                method:"function getBox(uint256) view returns ((uint8 boxType, uint8 prizeTier, uint256 gemsReward, bool nftInside, uint256 nftCardId, uint8 state, uint40 mintedAt, uint40 openedAt, bytes32 seed))",
                params:[tokenId],
              });
              boxType    = Number(boxData.boxType);
              isOpened   = Number(boxData.state) >= 1;
              gemsReward = boxData.gemsReward;
            } catch {}
            const boxDef = BOXES[boxType] || BOXES[0];
            owned.push({ tokenId, uid:tokenId.toString(), opened:isOpened, id:boxType,
              name:boxDef.name, gems:boxDef.gems, gemsReward,
              color:boxDef.color, emoji:boxDef.emoji, img:boxDef.img, c1:boxDef.c1, c2:boxDef.c2 });
          } catch {}
        }
        if (!cancelled) setChainBoxes(owned);
      } catch(e) { console.error("useOwnedBoxes error:", e); }
    }
    fetchOwned();
    return () => { cancelled=true; };
  }, [nftContract, account?.address]);
  return chainBoxes;
}

// ─── OPEN BOX MODAL ──────────────────────────────────────
function OpenBoxModal({ entry, nftContract, onClose, toast }) {
  const [phase,     setPhase]     = useState("shake");
  const [txStatus,  setTxStatus]  = useState("idle");
  const [txError,   setTxError]   = useState("");
  const [openedImg, setOpenedImg] = useState(null);
  const [prize,     setPrize]     = useState(null);
  const { mutate: sendTx } = useSendTransaction();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("crack"), 900);
    const t2 = setTimeout(() => {
      setPhase("calling"); setTxStatus("pending");
      const tx = prepareContractCall({ contract:nftContract, method:"function openBox(uint256 tokenId)", params:[entry.tokenId] });
      sendTx(tx, {
        onSuccess: async (receipt) => {
          setTxStatus("success");
          toast("Box opened on-chain! 🎉","ok");
          try {
            const ev = receipt?.events?.find(e => e.eventName === "BoxOpened");
            if (ev?.args) setPrize({ prizeTier:Number(ev.args.prizeTier), gemsWon:ev.args.gemsWon, nftInside:ev.args.nftInside });
          } catch {}
          const img = await resolveTokenImage(nftContract, entry.tokenId);
          if (img) setOpenedImg(img);
          setPhase("reveal");
        },
        onError: (e) => {
          setTxStatus("error");
          setTxError((e?.message??"Transaction failed").slice(0,80));
          toast("Transaction failed ⚠️","err");
          setPhase("reveal");
        },
      });
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const tierInfo = prize ? (PRIZE_TIERS[prize.prizeTier] ?? PRIZE_TIERS[1]) : null;
  const imgSrc   = openedImg || entry.img;
  const imgAnim  =
    phase==="shake"   ? "ob-shake 0.22s infinite" :
    phase==="crack"   ? "ob-crack 0.65s ease-out forwards" :
    phase==="calling" ? "ob-spin 1.2s linear infinite" :
                        "ob-reveal 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards";
  const gemsDisplay = prize?.gemsWon
    ? fmtGems(prize.gemsWon)
    : entry.gemsReward ? fmtGems(entry.gemsReward) : entry.gems;

  return (
    <div className="modal-overlay" onClick={phase==="reveal"?onClose:undefined}>
      <div className="modal-box" onClick={e=>e.stopPropagation()}>
        <div style={{ position:"absolute", inset:0, borderRadius:24, background:`radial-gradient(ellipse at 50% 40%,${entry.color}0e 0%,transparent 65%)`, pointerEvents:"none" }}/>
        <div style={{ padding:"30px 24px 26px", textAlign:"center", position:"relative" }}>
          <div style={{ fontSize:11, color:"#444", letterSpacing:3, textTransform:"uppercase", marginBottom:18 }}>
            {phase==="shake"   && "✨ Warming up…"}
            {phase==="crack"   && "💥 Cracking open!"}
            {phase==="calling" && "⛓️ On-chain magic…"}
            {phase==="reveal"  && (txStatus==="success"?"🎉 Confirmed on-chain!":"🎁 Opened!")}
          </div>
          {phase==="reveal" && (
            <div style={{ position:"absolute", top:60, left:"50%", transform:"translateX(-50%)", width:0, pointerEvents:"none" }}>
              {["💎","🌟","✨","⭐","💫","🔮","🎊","🏆"].map((p,i)=>(
                <span key={i} style={{ position:"absolute", fontSize:20, left:`${(i-3.5)*42}px`, top:0, animation:`ob-float 1.3s ease-out ${i*0.09}s both`, display:"inline-block" }}>{p}</span>
              ))}
            </div>
          )}
          <div style={{ display:"inline-block", borderRadius:16, overflow:"hidden", width:180, height:180, boxShadow:`0 0 40px ${entry.color}66`, animation:imgAnim }}>
            <img src={imgSrc} alt={entry.name} style={{ width:180, height:180, objectFit:"cover", display:"block" }}
              onError={e=>{ e.target.src=mkSVG(entry.name,entry.c1,entry.c2,entry.emoji); }}/>
          </div>
          {phase==="calling" && <div style={{ color:"#ffaa00", fontSize:12, marginTop:14, letterSpacing:1 }}>⏳ Waiting for confirmation…</div>}
          {phase==="reveal" && (
            <div style={{ marginTop:20 }}>
              <div style={{ fontSize:20, fontWeight:900, color:entry.color, letterSpacing:1, marginBottom:8 }}>{entry.name}</div>
              {tierInfo ? (
                <>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"5px 16px", borderRadius:24, marginBottom:8, background:`${tierInfo.color}1a`, border:`1px solid ${tierInfo.color}55`, color:tierInfo.color, fontWeight:800, fontSize:16 }}>
                    {tierInfo.emoji} {tierInfo.label.toUpperCase()} PRIZE
                  </div>
                  {Number(prize?.gemsWon??0)>0 && (
                    <div style={{ fontSize:22, color:"#00ff88", fontWeight:900, marginBottom:6 }}>+{fmtGems(prize.gemsWon)} 💎 GEMS</div>
                  )}
                  {prize?.nftInside && <div style={{ color:"#ff9900", fontWeight:700, fontSize:14, marginBottom:6 }}>🖼️ Bonus NFT Inside!</div>}
                </>
              ) : (
                <div style={{ fontSize:20, color:"#00ff88", fontWeight:800, marginTop:6 }}>+{gemsDisplay} 💎 GEMS</div>
              )}
              <div style={{ marginTop:8, fontSize:12 }}>
                {txStatus==="success" && <span style={{ color:"#00ff88" }}>✅ On-chain confirmed</span>}
                {txStatus==="error"   && <span style={{ color:"#ff6644" }}>⚠️ {txError}</span>}
              </div>
            </div>
          )}
          <button onClick={onClose} className="mint-btn"
            style={{ marginTop:22, background:phase==="reveal"?entry.color:"#1e1e30", color:phase==="reveal"?"#000":"#888" }}>
            {phase==="reveal"?"🎊 Claim & Close":"✕ Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOX CARD ────────────────────────────────────────────
function BoxCard({ box, account, status, onMint, contractPrice }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const pending = status==="pending";
  const done    = status==="done";
  const tierC   = TIER_COLOR[box.tier]||"#fff";
  const displayPrice = contractPrice
    ? (Number(contractPrice)/1e18).toFixed(4).replace(/\.?0+$/,"")+' MON'
    : box.price+" MON";
  return (
    <div className="box-card" style={{ "--clr":box.color, boxShadow:`0 0 0 1px ${box.color}22` }}>
      <div className="rarity-badge" style={{ "--clr":tierC, borderColor:tierC, color:tierC }}>{box.tier}</div>
      <div className="box-img-wrap">
        {!imgLoaded && <div className="img-skeleton" style={{ position:"absolute", inset:0 }}/>}
        <img src={box.img} alt={box.name}
          style={{ opacity:imgLoaded?1:0, transition:"opacity .35s" }}
          onLoad={()=>setImgLoaded(true)}
          onError={e=>{ e.target.src=mkSVG(box.name,box.c1,box.c2,box.emoji); setImgLoaded(true); }}/>
        <div className="ice-sheen"/>
        <div className="box-glow-overlay" style={{ "--clr":box.color }}/>
      </div>
      <div style={{ padding:"10px 12px 14px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:4 }}>
          <span style={{ fontSize:14 }}>{box.emoji}</span>
          <span style={{ fontWeight:800, fontSize:13, color:"#fff", letterSpacing:.5 }}>{box.name}</span>
        </div>
        <div style={{ fontSize:11, color:box.color, marginBottom:3 }}>💎 +{box.gems} GEMS reward</div>
        <div style={{ fontSize:14, fontWeight:700, color:"#FFD700", marginBottom:2 }}>{displayPrice}</div>
        <button className="mint-btn" disabled={!account||pending} onClick={()=>onMint(box)}
          style={{ background:done?"#00c853":status==="error"?"#ff4444":pending?"#1e1e30":box.color, color:(!account||done||status==="error")?"#fff":"#000" }}>
          {!account?"🔌 Connect Wallet":pending?"⏳ Minting…":done?"✅ Minted!":status==="error"?"❌ Retry":"🧊 Mint Box"}
        </button>
      </div>
    </div>
  );
}

// ─── MY BOX ITEM ─────────────────────────────────────────
function MyBoxItem({ entry, nftContract, onOpen }) {
  const [resolvedImg, setResolvedImg] = useState(entry.img);
  const [loading,     setLoading]     = useState(false);
  const isOpened = entry.opened;
  useEffect(() => {
    if (!entry.tokenId || !isOpened) return;
    setLoading(true);
    resolveTokenImage(nftContract, entry.tokenId).then(img => {
      if (img) setResolvedImg(img);
      setLoading(false);
    });
  }, [entry.tokenId?.toString(), isOpened]);

  const gemsLabel = entry.gemsReward
    ? `${fmtGems(entry.gemsReward)} 💎`
    : `${entry.gems} 💎`;

  return (
    <div className={`mb-item${isOpened?" opened":""}`}>
      <div style={{ position:"relative", width:"100%", aspectRatio:"1" }}>
        {loading && <div className="img-loading" style={{ position:"absolute", inset:0 }}/>}
        <img src={resolvedImg} alt={entry.name}
          style={{ width:"100%", aspectRatio:"1", objectFit:"cover", display:"block", opacity:loading?0.4:1, transition:"opacity .3s" }}
          onError={e=>{ e.target.src=mkSVG(entry.name,entry.c1,entry.c2,entry.emoji); }}/>
      </div>
      <div style={{ padding:"8px 10px" }}>
        <div style={{ fontSize:11, fontWeight:700, color:"#fff", marginBottom:2 }}>{entry.name}</div>
        <div style={{ fontSize:10, color:"#444", marginBottom:2 }}>Token #{entry.tokenId?.toString()??"—"}</div>
        <div style={{ fontSize:10, color:"#00e676", marginBottom:5 }}>{gemsLabel}</div>
        {isOpened
          ? <div style={{ color:"#00ff88", fontWeight:700, fontSize:11, textAlign:"center" }}>✅ Opened</div>
          : <button className="mint-btn" onClick={()=>onOpen(entry)} style={{ background:entry.color, color:"#000", marginTop:0 }}>🧊 Open Box</button>
        }
      </div>
    </div>
  );
}

// ─── TOKEN POOL STATS CARD ───────────────────────────────
function TokenPoolCard({ tokenStats }) {
  const { maxSupply, rewardPool, publicSupply, ownerReserve, totalSupply } = tokenStats;
  const pct = poolPct(rewardPool, maxSupply);
  const rows = [
    { label:"Max Supply",    value:fmtSupply(maxSupply)    + " GEMS", color:"#FFD700" },
    { label:"Circulating",   value:fmtSupply(totalSupply)  + " GEMS", color:"#00e5ff" },
    { label:"Reward Pool",   value:fmtSupply(rewardPool)   + " GEMS", color:"#00ff88" },
    { label:"Public Supply", value:fmtSupply(publicSupply) + " GEMS", color:"#aa44ff" },
    { label:"Owner Reserve", value:fmtSupply(ownerReserve) + " GEMS", color:"#ff9900" },
  ];
  return (
    <div style={{ background:"#0b0b16", border:"1px solid #161625", borderRadius:14, padding:18, marginBottom:22 }}>
      <div style={{ fontSize:12, letterSpacing:3, color:"#FFD700", marginBottom:14, fontWeight:700 }}>💎 GEMS TOKEN STATS</div>
      <div style={{ marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"#555", marginBottom:4 }}>
          <span>REWARD POOL REMAINING</span>
          <span style={{ color:"#00ff88" }}>{pct}%</span>
        </div>
        <div className="pool-bar-wrap"><div className="pool-bar" style={{ width:`${pct}%` }}/></div>
        <div style={{ fontSize:10, color:"#333", marginTop:4 }}>
          {fmtSupply(rewardPool)} / {fmtSupply(maxSupply)} GEMS
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        {rows.map(r => (
          <div key={r.label} style={{ background:"#07090f", borderRadius:9, padding:"8px 10px" }}>
            <div style={{ fontSize:15, fontWeight:900, color:r.color }}>{r.value}</div>
            <div style={{ fontSize:9, color:"#444", letterSpacing:1, marginTop:2 }}>{r.label.toUpperCase()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEAR PANEL ──────────────────────────────────────────
function NearPanel() {
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

  // load near-api-js
  useEffect(() => {
    if (window.nearApi) { setNearReady(true); return; }
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/near-api-js@2.1.4/dist/near-api-js.min.js";
    script.async = true;
    script.onload  = () => setNearReady(true);
    script.onerror = () => setError("Failed to load NEAR library. Check your internet connection.");
    document.head.appendChild(script);
    return () => {};
  }, []);

  // auto-reconnect + fetch balance on load
  useEffect(() => {
    if (!nearReady || !window.nearApi) return;
    const { connect, keyStores, WalletConnection } = window.nearApi;
    const ks  = new keyStores.BrowserLocalStorageKeyStore();
    const cfg = nearMainnetConfig(ks);
    connect(cfg).then(near => {
      const wallet = new WalletConnection(near, NEAR_APP_KEY);
      if (wallet.isSignedIn()) {
        const acc = wallet.getAccountId();
        setNearAcc(acc);
        loadBalanceAndMeta(acc);
      }
    }).catch(() => {});
  }, [nearReady]);

  function nearMainnetConfig(keyStore) {
    return {
      networkId: "mainnet",
      keyStore,
      nodeUrl: NEAR_RPC,
      walletUrl: "https://app.mynearwallet.com",
      helperUrl: "https://helper.mainnet.near.org",
      explorerUrl: "https://nearblocks.io",
    };
  }

  async function loadBalanceAndMeta(accountId) {
    setBalLoading(true);
    const [bal, meta] = await Promise.all([
      ftBalanceOf(accountId),
      ftMetadata(),
    ]);
    setGemsBalance(bal);
    setMetadata(meta);
    setBalLoading(false);
  }

  async function connectNear() {
    if (!nearReady || !window.nearApi) {
      setError("NEAR library not loaded yet. Please wait a moment and try again.");
      return;
    }
    setLoading(true); setError("");
    try {
      const { connect, keyStores, WalletConnection } = window.nearApi;
      const ks  = new keyStores.BrowserLocalStorageKeyStore();
      const cfg = nearMainnetConfig(ks);
      const near   = await connect(cfg);
      const wallet = new WalletConnection(near, NEAR_APP_KEY);
      if (wallet.isSignedIn()) {
        const acc = wallet.getAccountId();
        setNearAcc(acc);
        loadBalanceAndMeta(acc);
        setLoading(false);
        return;
      }
      await wallet.requestSignIn({
        contractId: NEAR_TOKEN_ADDR,
        methodNames: ["ft_transfer", "ft_transfer_call"],
        successUrl: window.location.href,
        failureUrl: window.location.href,
      });
    } catch(e) {
      setError("Connection error: " + (e?.message ?? "Unknown error"));
    }
    setLoading(false);
  }

  function disconnectNear() {
    if (!window.nearApi) return;
    try {
      const { connect, keyStores, WalletConnection } = window.nearApi;
      const ks  = new keyStores.BrowserLocalStorageKeyStore();
      const cfg = nearMainnetConfig(ks);
      connect(cfg).then(near => {
        const wallet = new WalletConnection(near, NEAR_APP_KEY);
        wallet.signOut();
        setNearAcc(null);
        setGemsBalance(null);
        setMetadata(null);
      });
    } catch {}
  }

  async function sendTransfer() {
    if (!recipient || !amount || !window.nearApi) return;
    setSending(true); setSendMsg("");
    try {
      const { connect, keyStores, WalletConnection } = window.nearApi;
      const ks  = new keyStores.BrowserLocalStorageKeyStore();
      const cfg = nearMainnetConfig(ks);
      const near   = await connect(cfg);
      const wallet = new WalletConnection(near, NEAR_APP_KEY);
      if (!wallet.isSignedIn()) { setSendMsg("Wallet not connected."); setSending(false); return; }
      const account = wallet.account();
      // 18 decimals
      const amountYocto = (BigInt(Math.round(parseFloat(amount) * 1e4)) * BigInt(1e14)).toString();
      await account.functionCall({
        contractId: NEAR_TOKEN_ADDR,
        methodName: "ft_transfer",
        args: { receiver_id: recipient, amount: amountYocto, memo: "GemsRock transfer" },
        gas: "30000000000000",
        attachedDeposit: "1",
      });
      setSendMsg("✅ Transfer sent!");
      setRecipient("");
      setAmount("");
      loadBalanceAndMeta(nearAcc);
    } catch(e) {
      setSendMsg("❌ " + (e?.message ?? "Transfer failed").slice(0, 80));
    }
    setSending(false);
  }

  const inputStyle = {
    width: "100%",
    padding: "9px 12px",
    background: "#07090f",
    border: "1px solid #1e1e30",
    borderRadius: 9,
    color: "#e0e0ee",
    fontFamily: "'Courier New', monospace",
    fontSize: 12,
    marginBottom: 8,
    outline: "none",
  };

  return (
    <div className="panel">
      <div className="panel-title">Ⓝ NEAR Wallet</div>
      <p style={{ color:"#555", marginBottom:22, fontSize:13 }}>
        Connect your NEAR account to view and transfer GEMS on the NEAR network.
      </p>

      {!nearReady && !error && (
        <div style={{ textAlign:"center", padding:"20px 0", color:"#555", fontSize:13 }}>
          ⏳ Loading NEAR library…
        </div>
      )}

      {nearAcc ? (
        <>
          {/* ── connected card ── */}
          <div style={{ background:"#0b0b16", borderRadius:13, padding:20, marginBottom:18 }}>
            <div style={{ color:"#00ff88", fontWeight:800, fontSize:15, marginBottom:6 }}>✅ Connected</div>
            <div style={{ color:"#00c9a7", fontFamily:"monospace", fontSize:13, marginBottom:8, wordBreak:"break-all" }}>
              {nearAcc}
            </div>
            <a href={`https://nearblocks.io/address/${nearAcc}`} target="_blank" rel="noreferrer"
              style={{ display:"block", color:"#444", fontSize:11, marginBottom:12 }}>
              🔍 View on NEAR Explorer ↗
            </a>

            {/* token balance row */}
            <div style={{ display:"flex", alignItems:"center", gap:14, background:"#07090f", borderRadius:9, padding:"10px 14px", marginBottom:10 }}>
              <span style={{ fontSize:22 }}>💎</span>
              <div>
                <div style={{ fontSize:18, fontWeight:900, color:"#FFD700" }}>
                  {balLoading ? "…" : (gemsBalance ?? "—")} GEMS
                </div>
                {metadata && (
                  <div style={{ fontSize:10, color:"#444", marginTop:2, letterSpacing:1 }}>
                    {metadata.name} · {metadata.symbol} · decimals {metadata.decimals}
                  </div>
                )}
              </div>
              <button
                onClick={() => loadBalanceAndMeta(nearAcc)}
                style={{ marginLeft:"auto", background:"none", border:"1px solid #1e1e30", borderRadius:8, color:"#444", padding:"4px 10px", fontSize:11, cursor:"pointer" }}
              >
                ↻
              </button>
            </div>

            {/* contract address */}
            <div style={{ fontSize:10, color:"#333", fontFamily:"monospace", marginBottom:12 }}>
              Contract: {NEAR_TOKEN_ADDR.slice(0,14)}…{NEAR_TOKEN_ADDR.slice(-8)}
            </div>

            <a href={`https://nearblocks.io/token/${NEAR_TOKEN_ADDR}`} target="_blank" rel="noreferrer"
              style={{ display:"inline-block", fontSize:11, color:"#00c9a7", marginBottom:14, border:"1px solid #00c9a722", borderRadius:8, padding:"4px 10px" }}>
              📊 View token on NEAR Explorer ↗
            </a>

            <button className="mint-btn"
              style={{ background:"#ff4444", color:"#fff", width:"auto", padding:"8px 24px", marginTop:0 }}
              onClick={disconnectNear}>
              Disconnect
            </button>
          </div>

          {/* ── transfer panel ── */}
          <div style={{ background:"#0b0b16", borderRadius:13, padding:18 }}>
            <div style={{ fontSize:11, color:"#555", letterSpacing:2, marginBottom:12, fontWeight:700 }}>
              SEND GEMS (NEAR)
            </div>
            <input
              style={inputStyle}
              placeholder="Recipient NEAR account (e.g. alice.near)"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            />
            <div style={{ position:"relative" }}>
              <input
                style={{ ...inputStyle, paddingRight:55 }}
                placeholder="Amount"
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
              <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-70%)", fontSize:11, color:"#555" }}>GEMS</span>
            </div>
            <button
              className="mint-btn"
              style={{ background:sending?"#1e1e30":"#00c9a7", color:sending?"#555":"#000", marginTop:4 }}
              disabled={sending || !recipient || !amount}
              onClick={sendTransfer}
            >
              {sending ? "⏳ Sending…" : "Ⓝ Send GEMS"}
            </button>
            {sendMsg && (
              <div style={{
                marginTop:10, fontSize:12, padding:"8px 12px", borderRadius:8,
                background:sendMsg.startsWith("✅")?"#00ff8811":"#ff444411",
                color:sendMsg.startsWith("✅")?"#00ff88":"#ff8888",
                border:`1px solid ${sendMsg.startsWith("✅")?"#00ff8833":"#ff444433"}`,
              }}>
                {sendMsg}
              </div>
            )}
            <div style={{ fontSize:10, color:"#333", marginTop:8, lineHeight:1.6 }}>
              Note: ft_transfer requires a 1 yoctoNEAR security deposit. Your NEAR wallet will prompt you to confirm.
            </div>
          </div>
        </>
      ) : (
        nearReady && (
          <>
            <div style={{ marginBottom:20 }}>
              <button className="near-connect-btn" onClick={connectNear} disabled={loading}>
                {loading ? "⏳ Connecting…" : "Ⓝ Connect NEAR Wallet"}
              </button>
            </div>

            {/* token preview (no wallet needed) */}
            <div style={{ background:"#0b0b16", borderRadius:11, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:11, color:"#555", letterSpacing:2, marginBottom:10, fontWeight:700 }}>
                GEMS TOKEN (NEAR)
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:22 }}>💎</span>
                <div>
                  <div style={{ fontWeight:800, fontSize:14, color:"#FFD700" }}>GemsRock · GEMS</div>
                  <div style={{ fontSize:11, color:"#444", fontFamily:"monospace", marginTop:2 }}>
                    {NEAR_TOKEN_ADDR.slice(0,18)}…
                  </div>
                </div>
              </div>
              <div style={{ marginTop:10, display:"flex", gap:8 }}>
                <a href={`https://nearblocks.io/token/${NEAR_TOKEN_ADDR}`} target="_blank" rel="noreferrer"
                  style={{ fontSize:11, color:"#00c9a7", border:"1px solid #00c9a722", borderRadius:8, padding:"4px 10px" }}>
                  NEAR Explorer ↗
                </a>
                <a href="https://app.ref.finance/" target="_blank" rel="noreferrer"
                  style={{ fontSize:11, color:"#4488ff", border:"1px solid #4488ff22", borderRadius:8, padding:"4px 10px" }}>
                  Ref.Finance ↗
                </a>
              </div>
            </div>

            <div style={{ background:"#0b0b16", borderRadius:11, padding:14, fontSize:11, color:"#444", lineHeight:1.8 }}>
              <div style={{ color:"#555", marginBottom:6, fontWeight:700 }}>How it works:</div>
              <div>1. Click above to open MyNearWallet in a new tab</div>
              <div>2. Sign in or create a NEAR account</div>
              <div>3. Authorize ft_transfer access for GEMS</div>
              <div>4. You'll be redirected back here automatically</div>
            </div>

            {error && (
              <div style={{ color:"#ff9900", background:"#0b0b16", padding:12, borderRadius:9, marginTop:13, fontSize:11, whiteSpace:"pre-wrap", border:"1px solid #ff990033" }}>
                ⚠️ {error}
              </div>
            )}
          </>
        )
      )}
    </div>
  );
}

// ─── SWAP / BRIDGE PANEL ─────────────────────────────────
function SwapBridgePanel({ account }) {
  const [mode, setMode] = useState("swap");

  const bridges = [
    { name:"Monad Bridge", url:"https://monadbridge.com/",    icon:"🌉", desc:"Official Monad bridge",        color:"#836ef9" },
    { name:"NEAR Intents", url:"https://near-intents.org",    icon:"Ⓝ",  desc:"NEAR cross-chain intents",     color:"#00c9a7" },
    { name:"Rhino.fi",     url:"https://app.rhino.fi",        icon:"🦏", desc:"Multi-chain bridge",           color:"#00e5ff" },
    { name:"Stargate",     url:"https://stargate.finance",    icon:"⭐", desc:"LayerZero powered bridge",     color:"#ffaa00" },
  ];

  function openBridge(url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="panel">
      <div className="panel-title">⇄ Swap / Bridge</div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>
        {["swap","bridge"].map(m=>(
          <button key={m} className="mint-btn"
            style={{ flex:1, background:mode===m?"#00e5ff":"#1a1a2e", color:mode===m?"#000":"#555", marginTop:0 }}
            onClick={()=>setMode(m)}>
            {m==="swap"?"⇄ Swap Tokens":"🌉 Bridge Assets"}
          </button>
        ))}
      </div>
      {mode==="swap" && (account
        ? <PayEmbed client={client} payOptions={{ mode:"fund_wallet", prefillBuy:{ chain:MONAD, token:{ address:TOKEN_ADDR, name:"GEMS", symbol:"GEMS", decimals:18 }, allowEdits:{ amount:true, token:false, chain:false } } }} theme="dark" style={{ width:"100%", maxWidth:440, margin:"0 auto", display:"block" }}/>
        : <div style={{ textAlign:"center", padding:"44px 20px", color:"#333" }}>🔌 Connect wallet to swap</div>
      )}
      {mode==="bridge" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:13 }}>
          {bridges.map(b=>(
            <div key={b.name} className="bridge-card" onClick={() => openBridge(b.url)} role="button" tabIndex={0} onKeyDown={e => e.key==="Enter" && openBridge(b.url)}>
              <div style={{ fontSize:32, marginBottom:8 }}>{b.icon}</div>
              <div style={{ fontWeight:800, color:"#ccc", fontSize:14, marginBottom:4 }}>{b.name}</div>
              <div style={{ color:"#444", fontSize:12, marginBottom:10 }}>{b.desc}</div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:6, fontSize:11, color:b.color, fontWeight:700, padding:"4px 10px", borderRadius:99, background:b.color+"18", border:`1px solid ${b.color}44` }}>
                Open ↗
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── BUY PANEL ───────────────────────────────────────────
function BuyPanel({ account }) {
  return (
    <div className="panel">
      <div className="panel-title">💳 Buy GEMS</div>
      <p style={{ color:"#555", marginBottom:22, fontSize:13 }}>Buy GEMS tokens with credit card, Apple Pay, Google Pay, or crypto.</p>
      {account
        ? <PayEmbed client={client} payOptions={{ mode:"fund_wallet", prefillBuy:{ chain:MONAD, token:{ address:TOKEN_ADDR, name:"GEMS", symbol:"GEMS", decimals:18 }, allowEdits:{ amount:true, token:false, chain:false } } }} theme="dark" style={{ width:"100%", maxWidth:440, margin:"0 auto", display:"block" }}/>
        : <div style={{ textAlign:"center", padding:"44px 20px", color:"#333" }}>🔌 Connect wallet to buy GEMS</div>
      }
    </div>
  );
}

// ─── WALLET PANEL ────────────────────────────────────────
function WalletPanel({ account, balance, myBoxes, opened, totalNftMinted, tokenStats }) {
  const userStats = [
    { label:"GEMS Balance",  value:fmtGems(balance)+" 💎", color:"#00ff88" },
    { label:"Boxes Minted",  value:myBoxes.length,          color:"#00e5ff" },
    { label:"Boxes Opened",  value:opened,                  color:"#ffaa00" },
    { label:"Global Minted", value:totalNftMinted,          color:"#ff44cc" },
  ];
  return (
    <div className="panel">
      <div className="panel-title">👛 Wallet Overview</div>
      {account ? (
        <>
          <div style={{ background:"#0b0b16", borderRadius:12, padding:16, marginBottom:16 }}>
            <div style={{ color:"#444", fontSize:11, letterSpacing:2, marginBottom:5 }}>ADDRESS</div>
            <div style={{ fontFamily:"monospace", color:"#00e5ff", fontSize:12, wordBreak:"break-all" }}>{account.address}</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:18 }}>
            {userStats.map(s=>(
              <div key={s.label} className="stat-card">
                <div style={{ fontSize:18, fontWeight:900, color:s.color }}>{s.value}</div>
                <div style={{ color:"#444", fontSize:10, marginTop:4, letterSpacing:1 }}>{s.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <TokenPoolCard tokenStats={tokenStats}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <a href={`https://monadscan.com/address/${account.address}`}
              target="_blank" rel="noreferrer"
              style={{ display:"block", textAlign:"center", padding:"9px 0", border:"1px solid #1e1e30", borderRadius:9, color:"#555", fontSize:12, transition:".2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#836ef9"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>
              🔍 Monad Explorer
            </a>
            <a href={`https://monadvision.com/token/${account.address}`}
              target="_blank" rel="noreferrer"
              style={{ display:"block", textAlign:"center", padding:"9px 0", border:"1px solid #1e1e30", borderRadius:9, color:"#555", fontSize:12, transition:".2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#836ef9"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>
              📊 MonadVision
            </a>
          </div>
          <div style={{ marginTop:12, display:"flex", gap:10 }}>
            <a href={`https://monadvision.com/token/${NFT_ADDR}`}
              target="_blank" rel="noreferrer"
              style={{ flex:1, display:"block", textAlign:"center", padding:"9px 0", border:"1px solid #1e1e30", borderRadius:9, color:"#555", fontSize:11, transition:".2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#ff9900"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>
              🖼️ NFT Contract
            </a>
            <a href={`https://monadvision.com/token/${TOKEN_ADDR}`}
              target="_blank" rel="noreferrer"
              style={{ flex:1, display:"block", textAlign:"center", padding:"9px 0", border:"1px solid #1e1e30", borderRadius:9, color:"#555", fontSize:11, transition:".2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor="#FFD700"}
              onMouseLeave={e=>e.currentTarget.style.borderColor="#1e1e30"}>
              💎 GEMS Token
            </a>
          </div>
        </>
      ) : (
        <div style={{ textAlign:"center", padding:"44px 20px", color:"#333" }}>🔌 Connect your wallet</div>
      )}
    </div>
  );
}

// ─── APP INNER ───────────────────────────────────────────
function AppInner() {
  const [tab,        setTab]        = useState("icebox");
  const [mintStatus, setMintStatus] = useState({});
  const [myBoxes,    setMyBoxes]    = useState([]);
  const [openingBox, setOpeningBox] = useState(null);
  const [opened,     setOpened]     = useState(0);
  const [gemsPopup,  setGemsPopup]  = useState(null);

  const { toasts, toast } = useToasts();

  const account       = useActiveAccount();
  const tokenContract = getContract({ client, chain:MONAD, address:TOKEN_ADDR });
  const nftContract   = getContract({ client, chain:MONAD, address:NFT_ADDR   });

  const { data: balance } = useReadContract({
    contract: tokenContract,
    method: "function balanceOf(address) view returns (uint256)",
    params: [account?.address ?? "0x0000000000000000000000000000000000000000"],
  });
  const { data: nftTotalSupply } = useReadContract({
    contract: nftContract,
    method: "function totalSupply() view returns (uint256)",
    params: [],
  });

  const boxPrice   = useBoxPrice(nftContract);
  const tokenStats = useTokenStats(tokenContract);
  const chainBoxes = useOwnedBoxes(nftContract, account);

  const allBoxes = [
    ...chainBoxes.filter(c => !myBoxes.some(m => m.tokenId?.toString() === c.tokenId?.toString())),
    ...myBoxes,
  ];

  const { mutate: sendTx } = useSendTransaction();

  function handleMint(box) {
    if (!account) return;
    const value = boxPrice != null ? boxPrice : toWei(box.price);
    setMintStatus(s => ({ ...s, [box.id]:"pending" }));
    const tx = prepareContractCall({ contract:nftContract, method:"function mintSpecific(uint8 boxType) payable returns (uint256)", params:[box.id], value });
    sendTx(tx, {
      onSuccess: (receipt) => {
        setMintStatus(s => ({ ...s, [box.id]:"done" }));
        let tokenId = BigInt(Date.now());
        try {
          const ev = receipt?.events?.find(e => e.eventName==="BoxMinted");
          if (ev?.args?.tokenId !== undefined) { tokenId = BigInt(ev.args.tokenId); }
          else { const log = receipt?.logs?.find(l => l.topics?.length===4); if (log) tokenId=BigInt(log.topics[3]); }
        } catch {}
        setMyBoxes(prev => [...prev, { ...box, tokenId, uid:tokenId.toString(), opened:false, gemsReward:null }]);
        toast(`🧊 ${box.name} minted! +${box.gems} GEMS`,"ok");
        setGemsPopup({ gems:box.gems, id:Date.now() });
        setTimeout(() => setGemsPopup(null), 2600);
      },
      onError: (e) => {
        setMintStatus(s => ({ ...s, [box.id]:"error" }));
        const msg = e?.message??"";
        if (msg.includes("Insufficient MON")||msg.includes("insufficient funds")) toast("❌ Insufficient MON balance","err");
        else if (msg.includes("mintOpen")||msg.includes("not open")) toast("❌ Minting is not open yet","err");
        else toast("Mint failed ⚠️ "+msg.slice(0,40),"err");
      },
    });
  }

  function handleOpen(entry) { setOpeningBox(entry); }
  function handleOpenClose() {
    if (openingBox) {
      setMyBoxes(prev => prev.map(b => b.uid===openingBox.uid ? { ...b, opened:true } : b));
      setOpened(n => n+1);
    }
    setOpeningBox(null);
  }

  const gems           = fmtGems(balance);
  const totalNftMinted = nftTotalSupply ? Number(nftTotalSupply) : 0;

  const TABS = [
    { id:"icebox", label:"🧊 Ice Box"      },
    { id:"buy",    label:"💳 Buy / Card"   },
    { id:"swap",   label:"⇄ Swap / Bridge" },
    { id:"near",   label:"Ⓝ NEAR"          },
    { id:"wallet", label:"👛 Wallet"        },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"#07090f", color:"#e0e0ee" }}>
      <style>{GLOBAL_CSS}</style>

      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 28px", borderBottom:"1px solid #161625", background:"rgba(7,9,15,.97)", backdropFilter:"blur(16px)", position:"sticky", top:0, zIndex:100, flexWrap:"wrap", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span className="lg">💎</span>
          <div>
            <div className="site-title">GEMSROCK</div>
            <div style={{ fontSize:10, letterSpacing:4, color:"#555", textTransform:"uppercase" }}>Ice Box Reward System · Monad</div>
          </div>
          <span className="lg lg2">💎</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
          {account && (
            <div style={{ display:"flex", gap:18, fontSize:12, color:"#666" }}>
              <span>💎 <span style={{ color:"#00ff88" }}>{gems}</span></span>
              <span>🧊 <span style={{ color:"#00e5ff" }}>{totalNftMinted}</span> minted</span>
              {tokenStats.rewardPool && (
                <span>🏦 <span style={{ color:"#FFD700" }}>{fmtSupply(tokenStats.rewardPool)}</span> pool</span>
              )}
            </div>
          )}
          <ConnectButton client={client} chain={MONAD} wallets={WALLETS} theme="dark" connectButton={{ label:"🦊 Connect Wallet" }}/>
        </div>
      </header>

      <AdBanner/>

      {account && (
        <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap", padding:"14px 20px", background:"#080810", borderBottom:"1px solid #111" }}>
          {[
            { label:"GEMS",       value:gems,                              color:"#FFD700" },
            { label:"NFT Minted", value:totalNftMinted,                   color:"#00e5ff" },
            { label:"Opened",     value:opened,                           color:"#ffaa00" },
            { label:"Pool",       value:fmtSupply(tokenStats.rewardPool), color:"#00ff88" },
            { label:"Network",    value:"Monad",                          color:"#a78bfa" },
          ].map(s=>(
            <div key={s.label} className="stat-card" style={{ minWidth:100 }}>
              <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, color:s.color, textShadow:`0 0 10px ${s.color}66` }}>{s.value}</div>
              <div style={{ fontSize:10, color:"#444", letterSpacing:2, marginTop:3 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      )}

      <nav style={{ display:"flex", overflowX:"auto", borderBottom:"1px solid #161625", background:"#0a0a12", padding:"0 16px" }}>
        {TABS.map(t=>(
          <button key={t.id} className={`nav-tab${tab===t.id?" active":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </nav>

      <main style={{ maxWidth:1200, margin:"0 auto", padding:"36px 20px" }}>
        {tab==="icebox" && (
          <div>
            <div className="sec-h">CHOOSE YOUR ICE BOX</div>
            <p style={{ color:"#444", fontSize:13, textAlign:"center", marginBottom:28 }}>
              Mint a box on-chain, then open it to reveal your GEMS reward + bonus prizes.
            </p>
            <div className="box-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:16, marginBottom:40 }}>
              {BOXES.map(box=>(
                <BoxCard key={box.id} box={box} account={account} status={mintStatus[box.id]} onMint={handleMint} contractPrice={boxPrice}/>
              ))}
            </div>
            {allBoxes.length > 0 && (
              <div style={{ marginTop:40 }}>
                <div className="sec-h">🧊 MY ICE BOXES ({allBoxes.length})</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))", gap:14 }}>
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
        {tab==="near"   && <NearPanel/>}
        {tab==="wallet" && <WalletPanel account={account} balance={balance} myBoxes={myBoxes} opened={opened} totalNftMinted={totalNftMinted} tokenStats={tokenStats}/>}
      </main>

      {openingBox && (
        <OpenBoxModal entry={openingBox} nftContract={nftContract} onClose={handleOpenClose} toast={toast}/>
      )}

      {gemsPopup && (
        <div key={gemsPopup.id} className="gems-popup" style={{ left:"50%", bottom:"2rem", transform:"translateX(-50%)" }}>
          💎 +{gemsPopup.gems} GEMS
        </div>
      )}

      <div className="toast-wrap">
        {toasts.map(t=><div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>)}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────
export default function App() {
  return (
    <ThirdwebProvider>
      <AppInner />
    </ThirdwebProvider>
  );
