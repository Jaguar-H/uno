# UNO Game Revamp & Bug Fix Prompt

You are working on a modern multiplayer web-based UNO game. Your task is to improve gameplay logic, UX, animations, visuals, and overall polish. The game should feel smooth, responsive, visually immersive, and production-quality rather than a simple student project.

---

# 1. GAMEPLAY BUG FIXES

## A. Fix Game End Logic

Currently the game does NOT end even when a player has 0 cards remaining.

### Required Fixes:

* The moment a player's hand length becomes `0`, trigger the game end sequence immediately.
* Stop further gameplay actions once the winner is decided.
* Prevent:

  * drawing cards
  * turn changes
  * card plays
  * UNO calls
  * animations continuing

### Required Winner Logic:

* Detect winner instantly after a successful card play.
* Store:

  * winner player id
  * winner username
  * final scores if scoring exists
  * match duration
* Broadcast game end event to all connected players using sockets/websockets.

Example:

```js
if (player.cards.length === 0) {
   endGame(player.id)
}
```

---

## B. Add Winning Screen

Create a polished full-screen winning modal/screen.

### Winner Screen Requirements:

* Full-screen overlay
* Smooth fade-in animation
* Winner avatar/profile
* Text:

  * "You Win!" for winner
  * "Player X Wins!" for others
* Show:

  * total turns
  * match duration
  * cards played
* Add buttons:

  * Play Again
  * Return Home
* Add celebratory visuals:

  * confetti
  * glow effects
  * animated trophy/icon

### Design Direction:

* Modern game UI
* Similar polish level to:

  * Steam party games
  * Clash Royale UI smoothness
  * casual multiplayer web games

---

## C. Add Losing Screen

Non-winning players should see a losing screen.

### Requirements:

* Darkened blurred background
* "You Lost" message
* Highlight winner info
* Show remaining cards in player's hand
* Buttons:

  * Spectate
  * Play Again
  * Exit Match

---

# 2. CARD INTERACTION & UX IMPROVEMENTS

## Problem:

Current card hover and transition animations are too aggressive and make it difficult to select cards accurately.

The UI currently feels unstable while selecting cards.

---

## Required Improvements

### A. Make Animations Subtle

Reduce excessive movement.

### New Animation Rules:

* Slight hover lift only
* Very small scaling
* Fast and responsive
* Avoid dramatic rotations
* Avoid cards shifting neighboring cards excessively

### Desired Feel:

Cards should feel:

* stable
* predictable
* easy to click quickly

### Example:

Instead of:

* large translateY
* strong rotation
* bouncing

Use:

```css
transform: translateY(-8px) scale(1.03);
transition: 120ms ease;
```

---

## B. Highlight Playable Cards

Currently players cannot easily identify which cards are valid.

### Add Clear Playable State

Playable cards should:

* glow subtly
* have brighter borders
* slightly increase brightness
* show hover affordance

Non-playable cards should:

* appear dimmed
* lower opacity
* cursor disabled

### Example:

Playable:

* bright border
* active cursor
* elevated shadow

Unplayable:

```css
opacity: 0.5;
filter: grayscale(0.3);
cursor: not-allowed;
```

---

## C. Improve Card Selection UX

When a player hovers/selects:

* selected card should remain visually stable
* avoid reshuffling nearby cards
* clicking should feel instant

### Optional Enhancements:

* add click sound
* add subtle card snap animation
* add smooth easing

---

# 3. VISUAL REDESIGN

## A. Make Table Fullscreen

Currently the game table exists inside a boxed container.

This makes the experience feel constrained and not immersive.

### Required Changes:

* Remove boxed layout
* Table/background should occupy entire viewport
* Game area should feel like a real digital card table

### Layout Requirements:

* Fullscreen responsive layout
* Edge-to-edge background
* Proper scaling for:

  * desktop
  * tablet
  * mobile

### Design Inspiration:

* online poker games
* UNO mobile app
* tabletop multiplayer games

---

## B. Redesign Game Table

### Visual Direction:

Modern neon/casino/tabletop hybrid.

### Add:

* rich gradient background
* radial lighting
* subtle table texture
* depth/shadows
* ambient glow
* smooth UI panels

### Table Center:

Discard pile and draw pile should feel central and important.

Use:

* stacking effects
* shadows
* hover interactions
* smooth pile animations

---

# 4. LOGIN SCREEN REVAMP

Current login screen feels basic and unfinished.

Create a premium modern multiplayer game landing experience.

---

## Login Screen Requirements

### Layout:

* fullscreen split layout OR centered glassmorphism card
* animated background
* responsive design

### Add:

* animated UNO-themed background
* floating cards animation
* gradient lighting
* game logo/title
* smooth transitions

### Input Styling:

* rounded modern inputs
* glow on focus
* animated buttons

### Buttons:

* Create Room
* Join Room
* Quick Match

### Visual Style:

Mix of:

* Discord
* modern gaming launchers
* party game aesthetics

---

# 5. HOME SCREEN REDESIGN

The home screen should feel like a multiplayer gaming lobby.

---

## Add Sections:

* active rooms
* recent matches
* friends online (optional)
* player stats
* quick play
* room code join

---

## UI Improvements:

* animated cards/panels
* modern typography
* smooth hover interactions
* glassmorphism or soft dark UI
* responsive layout

---

# 6. UNO CARD ASSETS

Currently cards look placeholder/basic.

Replace them with polished custom assets.

---

## Requirements

### Card Design:

Create or use high-quality UNO-inspired assets.

Each card should have:

* consistent proportions
* high readability
* proper shadows
* rounded corners
* modern polished appearance

---

## Required Card Types:

### Standard Cards

* 0–9
* Red
* Blue
* Green
* Yellow

### Action Cards

* Skip
* Reverse
* Draw Two

### Wild Cards

* Wild
* Wild Draw Four

---

## Visual Style Direction:

* glossy finish
* modern gradients
* subtle textures
* vibrant colors
* premium mobile-game feel

---

## Technical Requirements:

* Use SVG or high-resolution PNG assets
* Optimize for web rendering
* Maintain consistent sizing
* Ensure cards scale properly on all screen sizes

---

# 7. PERFORMANCE & POLISH

## Optimize Rendering

Avoid:

* unnecessary rerenders
* laggy hover effects
* excessive DOM updates

---

## Add Smoothness

Ensure:

* animations stay at 60fps
* transitions are lightweight
* gameplay feels responsive

---

# 8. RESPONSIVENESS

The entire game must work properly on:

* desktop
* tablets
* mobile landscape
* mobile portrait

### Requirements:

* adaptive card sizing
* responsive player positioning
* scalable UI
* touch-friendly interactions

---

# 9. OVERALL GOAL

The final result should feel like:

* a real polished multiplayer party game
* visually immersive
* smooth and responsive
* modern and production-ready

It should NOT feel like:

* a college project
* a boxed web app
* a rough prototype

Focus heavily on:

* game feel
* interaction quality
* visual polish
* smooth multiplayer UX
