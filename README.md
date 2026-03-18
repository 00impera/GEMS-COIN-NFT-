<div align="center">

<img src="https://files.catbox.moe/sfhaf2.jfif" width="180" alt="GemsRock Coin Logo"/>

# 💎 GemsRock — *Forged in Gold, Crowned in Crystal*

**An on-chain mystery box ecosystem powered by GEMS tokens and IceBox NFTs**

[![ERC-20](https://img.shields.io/badge/Token-ERC--20-gold?style=for-the-badge&logo=ethereum)](https://etherscan.io/address/0x49931887171BF46922b2b80Aa834537A80C50B70)
[![ERC-721](https://img.shields.io/badge/NFT-ERC--721-blueviolet?style=for-the-badge&logo=ethereum)](https://etherscan.io/address/0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

---

**GEMS Token Contract:** `0x49931887171BF46922b2b80Aa834537A80C50B70`  
**IceBox NFT Contract:** `0xacCA7801fd5162eB7b0e8d4F62616c8B2e152BC2`

</div>

---

## 🌟 What is GemsRock?

**GemsRock** is a fully on-chain mystery box protocol. Players mint **IceBox NFTs** — physical-feeling treasure chests sealed on the blockchain — and open them to reveal **GEMS token rewards** and rare **NFT collectibles**. Every box is unique, every opening is a chance at a jackpot.

The ecosystem runs on two smart contracts:
- **GemsRock Token (GEMS)** — the ERC-20 reward currency, with a fixed supply split across public distribution, owner reserve, and the box reward pool.
- **IceBoxNFT** — the ERC-721 mystery box NFT. Mint a box, keep it sealed, trade it, or open it to claim your prize.

---

## 🪙 GEMS Token

| Property | Value |
|---|---|
| Standard | ERC-20 |
| Symbol | `GEMS` |
| Contract | `0x49931887171BF46922b2b80Aa834537A80C50B70` |
| Supply Pools | Public Supply · Owner Reserve · Box Reward Pool |
| Reward Mechanism | `rewardFromPool()` — called by IceBox on opening |

The GEMS token is the economic engine of the GemsRock universe. When a player opens an IceBox NFT, the box contract automatically calls `rewardFromPool()`, distributing GEMS directly to the opener's wallet. The **Box Reward Pool** is a dedicated supply reserve that exists solely for prize payouts — ensuring rewards are always available.

---

## 📦 The 12 IceBoxes — Prize Tiers & Rewards

Each IceBox NFT has a **box type** (1–12), a **prize tier**, and a hidden **seed** that determines the prize at the moment of opening. Boxes can be traded sealed — the contents are unknown until opened.

### Prize Tiers

| Tier | ID | Reward |
|---|---|---|
| 🔮 **JACKPOT** | 5 | Maximum GEMS from pool |
| 🖼️ **NFT** | 4 | Rare NFT card inside |
| 💎 **BIG** | 3 | Large GEMS reward |
| 🟢 **MEDIUM** | 2 | Mid-range GEMS reward |
| 🔴 **SMALL** | 1 | Starter GEMS reward |
| ⬛ **EMPTY** | 0 | No reward this time |

---

### 📦 Box 1

<img src="https://files.catbox.moe/xn9u8s.jfif" width="260" alt="IceBox 1"/>

**Type:** Box #1 — *The Genesis Box*  
**Theme:** Origin · Foundation · The First Seal  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** The original IceBox. Minted at the dawn of the GemsRock protocol, the Genesis Box carries the spirit of the first chain inscription. Its crystalline surface hides a reward forged from the very first block of the reward pool. Every collection starts here.

---

### 📦 Box 2

<img src="https://files.catbox.moe/p3rr91.jfif" width="260" alt="IceBox 2"/>

**Type:** Box #2 — *The Frost Box*  
**Theme:** Ice · Rarity · Cold Preservation  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Sealed in eternal frost, the Frost Box preserves its treasure in crystalline perfection. The colder the box, the rarer the gem within. Players who crack this icy vault are rewarded with GEMS drawn straight from the reward pool, and stand a chance at finding a rare NFT collectible frozen inside.

---

### 📦 Box 3

<img src="https://files.catbox.moe/0hsdwc.jfif" width="260" alt="IceBox 3"/>

**Type:** Box #3 — *The Ember Box*  
**Theme:** Fire · Power · Forge  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Born in the forge alongside the GemsRock coin itself, the Ember Box burns with latent energy. Its surface bears the heat marks of creation. Opening it releases the compressed energy of the forge — GEMS pour out like molten gold, and the lucky opener may find an NFT tempered in the same fire.

---

### 📦 Box 4

<img src="https://files.catbox.moe/araq1t.jfif" width="260" alt="IceBox 4"/>

**Type:** Box #4 — *The Storm Box*  
**Theme:** Lightning · Speed · Surprise  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Crackling with static charge, the Storm Box strikes without warning. Its rewards are volatile — players who dare to open it may receive a modest GEMS reward, or be struck by the full jackpot. The Storm Box is the gambler's favourite: unpredictable, electric, and always thrilling.

---

### 📦 Box 5

<img src="https://files.catbox.moe/ebwndd.jfif" width="260" alt="IceBox 5"/>

**Type:** Box #5 — *The Abyss Box*  
**Theme:** Darkness · Mystery · Hidden Depths  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** The Abyss Box reveals nothing on its surface — no markings, no glow, no hint of what lies within. Pure mystery. The darkness inside conceals either an empty chamber or a jackpot of extraordinary size. The Abyss Box is proof that in GemsRock, the most dangerous boxes are the ones that say nothing at all.

---

### 📦 Box 6

<img src="https://files.catbox.moe/paroh9.jfif" width="260" alt="IceBox 6"/>

**Type:** Box #6 — *The Aurora Box*  
**Theme:** Light · Spectrum · Neon Radiance  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Painted with the colours of the aurora borealis, Box #6 radiates every wavelength of the GemsRock spectrum. Its neon hues — cyan, magenta, violet, emerald — each correspond to a gem tier on the reward table. The Aurora Box is the visual identity of GemsRock made physical: colourful, radiant, and alive with possibility.

---

### 📦 Box 7

<img src="https://files.catbox.moe/brejl6.jfif" width="260" alt="IceBox 7"/>

**Type:** Box #7 — *The Titan Box*  
**Theme:** Strength · Rarity · Legendary Status  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Heavy. Imposing. Legendary. The Titan Box is the hardest to obtain and the most rewarding to open. Its thick walls of reinforced gold suggest the magnitude of the prize within. Titan Boxes have a disproportionate chance of landing JACKPOT tier — the largest GEMS payout in the entire pool. Not for the faint-hearted.

---

### 📦 Box 8

<img src="https://files.catbox.moe/i0v4m0.jfif" width="260" alt="IceBox 8"/>

**Type:** Box #8 — *The Phantom Box*  
**Theme:** Illusion · Duality · Surprise  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** The Phantom Box plays tricks on its owner. Its outer appearance shifts depending on the angle of light — sometimes empty-looking, sometimes gleaming with gem light. Open it and the illusion breaks: a real, tangible GEMS reward or a rare NFT card materialises in the opener's wallet. The Phantom never lies when opened.

---

### 📦 Box 9

<img src="https://files.catbox.moe/gocd9f.jfif" width="260" alt="IceBox 9"/>

**Type:** Box #9 — *The Crystal Box*  
**Theme:** Clarity · Precision · Pure Value  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Transparent as diamond, the Crystal Box hides its prize in plain sight — yet still no one can read the seed until the chain reveals it. The Crystal Box represents the purity of the GemsRock protocol: open, honest, provably fair. Its reward is always in proportion to the clarity of its construction.

---

### 📦 Box 10

<img src="https://files.catbox.moe/24l0mv.jfif" width="260" alt="IceBox 10"/>

**Type:** Box #10 — *The Venom Box*  
**Theme:** Danger · High Risk · High Reward  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Coated in a dangerous sheen, the Venom Box rewards those bold enough to handle it. Its risk profile is the highest of any non-jackpot box — but so is its potential payout. Opening a Venom Box without caution may yield nothing; opening one at the right moment could unlock a BIG or JACKPOT tier prize. Handle with ambition.

---

### 📦 Box 11

<img src="https://files.catbox.moe/m58xxr.jfif" width="260" alt="IceBox 11"/>

**Type:** Box #11 — *The Eclipse Box*  
**Theme:** Rarity · Celestial · Once in a Cycle  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** Minted only during special protocol events, the Eclipse Box aligns rarity with celestial timing. Like a solar eclipse, it appears infrequently and commands attention when it does. Eclipse Boxes have a heightened probability of containing NFT-tier prizes — rare digital collectibles that exist in limited quantities within the GemsRock NFT card set.

---

### 📦 Box 12

<img src="https://files.catbox.moe/lmkgkn.jfif" width="260" alt="IceBox 12"/>

**Type:** Box #12 — *The Omega Box*  
**Theme:** Completion · Mastery · The Final Seal  
**Prize Pool:** GEMS Token Reward + NFT chance  
**Description:** The last box. The Omega. This is the collector's crown jewel — the final piece of the 12-box set. Opening the Omega Box completes the Genesis-to-Omega journey of the GemsRock collection. Its reward reflects its status: the Omega Box carries the highest base GEMS reward of any standard box type, and a special chance at the ultra-rare **NFT JACKPOT** — a combined prize of maximum GEMS AND an NFT card in the same opening event.

---

## 🔧 Smart Contract Functions

### GEMS Token — Key Functions

| Function | Access | Description |
|---|---|---|
| `rewardFromPool(address, amount)` | IceBox contract only | Sends GEMS from reward pool to winner |
| `ownerMint(address, amount)` | Owner | Mint from owner reserve |
| `setIceBoxContract(address)` | Owner | Link the IceBox NFT contract |
| `transfer / transferFrom` | Public | Standard ERC-20 transfers |

### IceBox NFT — Key Functions

| Function | Access | Description |
|---|---|---|
| `mint()` | Public (payable) | Mint a random box type |
| `mintSpecific(boxType)` | Public (payable) | Mint a specific box type |
| `openBox(tokenId)` | NFT owner | Open the box and claim prize |
| `getBox(tokenId)` | Public | Read all box data |
| `ownerMint(to, boxType, qty)` | Owner | Owner-only free mint |
| `setTierReward(tier, amount)` | Owner | Configure prize amounts |
| `withdraw()` | Owner | Withdraw ETH from mints |

---

## 🏗️ Architecture

```
Player
  │
  ├─► mint() ──────────────────► IceBoxNFT Contract
  │                                    │
  │                              Assigns boxType
  │                              Generates seed
  │                              Mints ERC-721 token
  │
  └─► openBox(tokenId) ────────► IceBoxNFT Contract
                                       │
                                 Rolls prize tier
                                 from seed + block data
                                       │
                          ┌────────────┴────────────┐
                          │                         │
                   rewardFromPool()            nftInside = true
                          │                    (future NFT mint)
                   GEMS Token Contract
                          │
                   GEMS sent to opener
```

---

## 🚀 Getting Started

### Mint a Box

```solidity
// Mint a random box (send BOX_PRICE in ETH)
uint256 tokenId = iceBox.mint{value: BOX_PRICE}();

// Or mint a specific box type (1-12)
uint256 tokenId = iceBox.mintSpecific{value: BOX_PRICE}(5);
```

### Open a Box

```solidity
// Approve is not needed — you just call openBox as the owner
iceBox.openBox(tokenId);
// GEMS are sent to your wallet automatically
```

### Check Your Box

```solidity
IceBoxNFT.BoxData memory box = iceBox.getBox(tokenId);
// box.boxType     → which of the 12 box types
// box.prizeTier   → EMPTY/SMALL/MEDIUM/BIG/NFT/JACKPOT
// box.gemsReward  → exact GEMS amount
// box.nftInside   → true if NFT prize
// box.state       → SEALED or OPENED
```

---

## 🎨 Collection Preview

| | | | |
|---|---|---|---|
| <img src="https://files.catbox.moe/xn9u8s.jfif" width="120"/> | <img src="https://files.catbox.moe/p3rr91.jfif" width="120"/> | <img src="https://files.catbox.moe/0hsdwc.jfif" width="120"/> | <img src="https://files.catbox.moe/araq1t.jfif" width="120"/> |
| Box 1 · Genesis | Box 2 · Frost | Box 3 · Ember | Box 4 · Storm |
| <img src="https://files.catbox.moe/ebwndd.jfif" width="120"/> | <img src="https://files.catbox.moe/paroh9.jfif" width="120"/> | <img src="https://files.catbox.moe/brejl6.jfif" width="120"/> | <img src="https://files.catbox.moe/i0v4m0.jfif" width="120"/> |
| Box 5 · Abyss | Box 6 · Aurora | Box 7 · Titan | Box 8 · Phantom |
| <img src="https://files.catbox.moe/gocd9f.jfif" width="120"/> | <img src="https://files.catbox.moe/24l0mv.jfif" width="120"/> | <img src="https://files.catbox.moe/m58xxr.jfif" width="120"/> | <img src="https://files.catbox.moe/lmkgkn.jfif" width="120"/> |
| Box 9 · Crystal | Box 10 · Venom | Box 11 · Eclipse | Box 12 · Omega |

---

## 📜 License

MIT — see [LICENSE](LICENSE)

---

<div align="center">

*GemsRock — Every box is a story. Every gem is a reward. Every opening is on-chain.*

<img src="https://files.catbox.moe/sfhaf2.jfif" width="80" alt="GemsRock"/>

</div>
