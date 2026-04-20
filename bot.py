import os
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import (
    Application, CommandHandler, CallbackQueryHandler, ContextTypes
)

logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

# ─── CONFIG ──────────────────────────────────────────────
BOT_TOKEN       = os.getenv("BOT_TOKEN")
WEBSITE         = "https://gems-coin-nft.pages.dev"
GEMS_CONTRACT   = "0x49931887171BF46922b2b80Aa834537A80C50B70"
ICEBOX_CONTRACT = "0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2"
MONAD_EXPLORER  = "https://monadscan.com"
MONAD_VISION    = "https://monadvision.com"
NEAR_EXPLORER   = "https://nearblocks.io"

# ─── HEALTH CHECK SERVER (fixes Render free tier timeout) ─
class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"GemsRock Bot OK")
    def log_message(self, *args):
        pass

def run_health_server():
    port = int(os.getenv("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthHandler)
    logger.info(f"Health server on port {port}")
    server.serve_forever()

# ─── BOXES ───────────────────────────────────────────────
BOXES = [
    (0,  "Crimson Blaze",  "🔥", "Common",    "0.01", 10),
    (1,  "Sapphire Abyss", "💧", "Common",    "0.01", 10),
    (2,  "Emerald Vault",  "🌿", "Uncommon",  "0.01", 20),
    (3,  "Violet Phantom", "🔮", "Rare",      "0.02", 20),
    (4,  "Solar Gold",     "☀️", "Rare",      "0.05", 50),
    (5,  "Arctic White",   "❄️", "Rare",      "0.05", 50),
    (6,  "Toxic Lime",     "⚡", "Epic",      "0.05", 100),
    (7,  "Inferno Orange", "🌋", "Epic",      "0.05", 100),
    (8,  "Cosmic Pink",    "🌸", "Legendary", "0.10", 200),
    (9,  "Shadow Black",   "💀", "Legendary", "0.10", 200),
    (10, "Ocean Teal",     "🐚", "Mythic",    "0.10", 500),
    (11, "Rainbow Prism",  "🐉", "GODLIKE",   "0.25", 1000),
]

PRIZE_TIERS = [
    ("💨", "Empty",   "No reward · Common drop"),
    ("🥉", "Small",   "Small GEMS payout · Common"),
    ("🥈", "Medium",  "Mid GEMS payout · Uncommon"),
    ("💎", "Big",     "Large GEMS payout · Rare"),
    ("🖼️","NFT",     "Bonus NFT card · Very Rare"),
    ("🏆", "Jackpot", "Maximum GEMS · Legendary"),
]

RARITY_STARS = {
    "Common":    "⚪",
    "Uncommon":  "🟢",
    "Rare":      "🔵",
    "Epic":      "🟣",
    "Legendary": "🟠",
    "Mythic":    "🔴",
    "GODLIKE":   "🌟",
}

# ─── KEYBOARDS ───────────────────────────────────────────
def main_menu_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🧊 Mint & Open IceBox", url=WEBSITE)],
        [InlineKeyboardButton("🎲 Open Mini App", url="https://t.me/gemsrock_bot/RockGems")],
        [InlineKeyboardButton("📦 All 12 Boxes", callback_data="boxes"),
         InlineKeyboardButton("💎 GEMS Token", callback_data="gems")],
        [InlineKeyboardButton("🏆 Prize Tiers", callback_data="tiers"),
         InlineKeyboardButton("📜 Contracts", callback_data="contracts")],
        [InlineKeyboardButton("🔧 How To Mint", callback_data="mint"),
         InlineKeyboardButton("⇄ Swap / Bridge", callback_data="bridge")],
        [InlineKeyboardButton("Ⓝ NEAR Wallet", callback_data="near"),
         InlineKeyboardButton("👛 Wallet Info", callback_data="wallet")],
        [InlineKeyboardButton("🌐 More Projects", callback_data="projects"),
         InlineKeyboardButton("❓ Help", callback_data="help")],
    ])

def back_mint_kb():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🧊 Mint Now", url=WEBSITE)],
        [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
    ])

# ─── HANDLERS ────────────────────────────────────────────
async def start(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "💎 *GEMSROCK Ice Box Rewards*\n\n"
        "Earn GEMS on Monad Mainnet\n"
        "Mint IceBox NFTs · Open · Claim GEMS\n\n"
        "🌐 " + WEBSITE + "\n"
        "⛓️ Built on Monad Blockchain\n\n"
        "📦 12 unique boxes · 🏆 6 prize tiers · ✅ 100% on-chain\n\n"
        "Choose an option below 👇",
        parse_mode="Markdown",
        reply_markup=main_menu_kb()
    )

async def boxes_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    text = "📦 *The 12 IceBoxes*\n\n"
    for box_id, name, emoji, tier, price, gems in BOXES:
        star = RARITY_STARS.get(tier, "⚪")
        text += f"{emoji} *Box #{box_id} — {name}*\n"
        text += f"{star} {tier} · {price} MON · 💎 +{gems} GEMS\n\n"
    await msg.reply_text(
        text, parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🧊 Mint IceBox Now", url=WEBSITE)],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def gems_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "💎 *GEMS Token — ERC-20*\n\n"
        f"`{GEMS_CONTRACT}`\n\n"
        "📊 *Supply Pools:*\n"
        "• PUBLIC SUPPLY — circulating\n"
        "• OWNER RESERVE — team\n"
        "• BOX REWARD POOL — prizes\n\n"
        "✅ GEMS auto-sent to wallet on box open\n"
        "🔢 Decimals: 18\n\n"
        f"🔍 [View on MonadVision]({MONAD_VISION}/token/{GEMS_CONTRACT})\n"
        f"🔍 [View on Explorer]({MONAD_EXPLORER}/address/{GEMS_CONTRACT})",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("📊 MonadVision", url=f"{MONAD_VISION}/token/{GEMS_CONTRACT}")],
            [InlineKeyboardButton("🎲 Open Mini App", url="https://t.me/gemsrock_bot/RockGems")],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def tiers_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    text = "🏆 *Prize Tiers*\n\n"
    for emoji, label, desc in PRIZE_TIERS:
        text += f"{emoji} *{label.upper()}* — {desc}\n"
    text += "\n✅ 100% on-chain · Provably fair"
    await msg.reply_text(
        text, parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🧊 Try Your Luck", url=WEBSITE)],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def contracts_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "📜 *Smart Contracts — Monad Mainnet*\n\n"
        "💎 *GEMS Token (ERC-20)*\n"
        f"`{GEMS_CONTRACT}`\n"
        f"🔍 [MonadVision]({MONAD_VISION}/token/{GEMS_CONTRACT})\n\n"
        "🧊 *IceBox NFT (ERC-721)*\n"
        f"`{ICEBOX_CONTRACT}`\n"
        f"🔍 [MonadVision]({MONAD_VISION}/token/{ICEBOX_CONTRACT})\n\n"
        "✅ Fully automated on-chain payouts\n"
        "⛓️ Chain ID: 143 · Monad Mainnet",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("💎 GEMS Token", url=f"{MONAD_VISION}/token/{GEMS_CONTRACT}")],
            [InlineKeyboardButton("🖼️ NFT Contract", url=f"{MONAD_VISION}/token/{ICEBOX_CONTRACT}")],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def mint_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "🔧 *How To Mint an IceBox*\n\n"
        f"1️⃣ Go to {WEBSITE}\n"
        "2️⃣ Connect MetaMask, Rabby, or WalletConnect\n"
        "3️⃣ Switch to *Monad Mainnet* (Chain ID: 143)\n"
        "4️⃣ Choose your IceBox (0.01–0.25 MON)\n"
        "5️⃣ Click 🧊 Mint Box\n"
        "6️⃣ Open your box anytime\n"
        "7️⃣ 💎 GEMS auto-sent to your wallet!\n\n"
        "📱 *Supported Wallets:*\n"
        "• MetaMask · Rabby · Coinbase\n"
        "• WalletConnect · Trust · Phantom\n"
        "• Email / Google / Apple login\n\n"
        f"🧊 NFT Contract:\n`{ICEBOX_CONTRACT}`",
        parse_mode="Markdown",
        reply_markup=back_mint_kb()
    )

async def bridge_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "⇄ *Swap & Bridge*\n\n"
        "🌉 *Bridge to Monad:*\n"
        "• [Monad Bridge](https://monadbridge.com) — Official\n"
        "• [Jumper Exchange](https://jumper.exchange) — Reliable\n"
        "• [Stargate](https://stargate.finance) — LayerZero\n"
        "• [Rhino.fi](https://app.rhino.fi) — Multi-chain\n\n"
        "🔄 *Swap GEMS:*\n"
        "• Use the Swap tab on the website\n"
        "• Buy with credit card, Apple Pay, Google Pay\n\n"
        "Ⓝ *NEAR Cross-chain:*\n"
        "• [NEAR Intents](https://near-intents.org)\n"
        "• Connect NEAR wallet in the NEAR tab\n\n"
        "💡 *Tip:* You need MON for gas fees on Monad",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🌉 Monad Bridge", url="https://monadbridge.com")],
            [InlineKeyboardButton("⇄ Swap on Website", url=WEBSITE)],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def near_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "Ⓝ *NEAR Wallet Integration*\n\n"
        "Connect your NEAR account for cross-chain GEMSROCK interactions.\n\n"
        "📱 *Best NEAR Wallets:*\n"
        "• [NEAR Mobile](https://nearmobile.app) — Simplest ✅\n"
        "• [MyNearWallet](https://mynearwallet.com) — Web\n"
        "• [HOT Wallet](https://hot.tg) — Zero-fee swaps\n"
        "• [Nightly](https://nightly.app) — 105+ chains\n\n"
        "🔗 *How to Connect:*\n"
        "1️⃣ Go to NEAR tab on the website\n"
        "2️⃣ Click Connect NEAR Wallet\n"
        "3️⃣ Sign in via MyNearWallet\n"
        "4️⃣ Authorize GEMSROCK access\n"
        "5️⃣ Redirected back automatically\n\n"
        "⚠️ Need NEAR for contract deployment?\n"
        "Buy on Binance/Coinbase → ~5 NEAR (~$12)",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("Ⓝ NEAR Tab", url=f"{WEBSITE}/#near")],
            [InlineKeyboardButton("🔍 NEAR Explorer", url=NEAR_EXPLORER)],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def wallet_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "👛 *Wallet Overview*\n\n"
        "Connect your wallet on the website to see:\n\n"
        "💎 GEMS balance\n"
        "🧊 Boxes minted\n"
        "🏆 Boxes opened\n"
        "🏦 Reward pool remaining\n\n"
        "📊 *Token Stats:*\n"
        "• Max Supply — total GEMS\n"
        "• Circulating — in wallets\n"
        "• Reward Pool — for box prizes\n"
        "• Public Supply — available\n"
        "• Owner Reserve — team\n\n"
        "🔍 *Explorer Links:*\n"
        f"• [Monad Explorer]({MONAD_EXPLORER})\n"
        f"• [MonadVision]({MONAD_VISION})\n"
        f"• [NFT Contract]({MONAD_VISION}/token/{ICEBOX_CONTRACT})\n"
        f"• [GEMS Token]({MONAD_VISION}/token/{GEMS_CONTRACT})",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("👛 Open Wallet Tab", url=WEBSITE)],
            [InlineKeyboardButton("📊 MonadVision", url=f"{MONAD_VISION}/token/{GEMS_CONTRACT}")],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def projects_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "🌐 *More Projects by 00IMPERA*\n\n"
        "🧊 IceBox NFT Mint\n"
        "💎 GEMS Reward Token\n"
        "⛏️ PYRATHOS Mining Token\n"
        "🤖 Quantum Engine NFT\n"
        "🔒 Dragon Lock\n"
        "🎰 Joker 777 Slot\n"
        "💱 Monad DEX\n\n"
        "All built on *Monad Mainnet*",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🧊 IceBox", url=WEBSITE)],
            [InlineKeyboardButton("🏠 Main Menu", callback_data="menu")],
        ])
    )

async def help_cmd(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    msg = update.message or update.callback_query.message
    await msg.reply_text(
        "❓ *GemsRock Bot Commands*\n\n"
        "/start — Main menu\n"
        "/boxes — All 12 IceBoxes\n"
        "/gems — GEMS token info\n"
        "/tiers — Prize tiers\n"
        "/contracts — Contract addresses\n"
        "/mint — How to mint\n"
        "/bridge — Swap & bridge guide\n"
        "/near — NEAR wallet info\n"
        "/wallet — Wallet overview\n"
        "/projects — All projects\n"
        "/help — This menu\n\n"
        f"🌐 {WEBSITE}",
        parse_mode="Markdown",
        reply_markup=InlineKeyboardMarkup([
            [InlineKeyboardButton("🧊 Open App", url=WEBSITE)],
            [InlineKeyboardButton("🎲 Mini App", url="https://t.me/gemsrock_bot/RockGems")],
        ])
    )

# ─── CALLBACK ROUTER ─────────────────────────────────────
async def button(update: Update, ctx: ContextTypes.DEFAULT_TYPE):
    q = update.callback_query
    await q.answer()
    if q.data == "menu":
        await q.message.reply_text(
            "💎 *GEMSROCK Menu*\n\nChoose an option 👇",
            parse_mode="Markdown",
            reply_markup=main_menu_kb()
        )
    elif q.data == "boxes":     await boxes_cmd(update, ctx)
    elif q.data == "gems":      await gems_cmd(update, ctx)
    elif q.data == "tiers":     await tiers_cmd(update, ctx)
    elif q.data == "contracts": await contracts_cmd(update, ctx)
    elif q.data == "mint":      await mint_cmd(update, ctx)
    elif q.data == "bridge":    await bridge_cmd(update, ctx)
    elif q.data == "near":      await near_cmd(update, ctx)
    elif q.data == "wallet":    await wallet_cmd(update, ctx)
    elif q.data == "projects":  await projects_cmd(update, ctx)
    elif q.data == "help":      await help_cmd(update, ctx)

# ─── MAIN ────────────────────────────────────────────────
def main():
    threading.Thread(target=run_health_server, daemon=True).start()
    app = Application.builder().token(BOT_TOKEN).build()
    app.add_handler(CommandHandler("start",     start))
    app.add_handler(CommandHandler("boxes",     boxes_cmd))
    app.add_handler(CommandHandler("gems",      gems_cmd))
    app.add_handler(CommandHandler("tiers",     tiers_cmd))
    app.add_handler(CommandHandler("contracts", contracts_cmd))
    app.add_handler(CommandHandler("mint",      mint_cmd))
    app.add_handler(CommandHandler("bridge",    bridge_cmd))
    app.add_handler(CommandHandler("near",      near_cmd))
    app.add_handler(CommandHandler("wallet",    wallet_cmd))
    app.add_handler(CommandHandler("projects",  projects_cmd))
    app.add_handler(CommandHandler("help",      help_cmd))
    app.add_handler(CallbackQueryHandler(button))
    logger.info("GemsRock Bot starting...")
    app.run_polling(drop_pending_updates=True)

if __name__ == "__main__":
    main()
