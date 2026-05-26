hey we are making a game of uno this is a exercise given us to learn about vibe code using copilot 
i want you to write a prompt.md where all the instruction services and the architechture and other neccesary things will be mentioned there this game will be  a multiplayer game web based game with front end and backend, player will just login and can play the game 

techStack we will be used
 for front end 
 use react 

 backed 
 node js 

 make it iteratively( make small things work and then connect them together to make the game work)




# UNO Multiplayer Web Game — Copilot Build Prompt

## Goal

Build a **multiplayer UNO web game** that is easy to run locally, easy to extend, and built in **small working steps**.

The game must have:

* **Frontend:** React
* **Backend:** Node.js
* **Gameplay:** Multiplayer, web-based, player login, join game, play UNO
* **Approach:** Build iteratively. Make one small thing work before adding the next layer.

The output should be a clean, practical implementation that can grow without becoming tangled.

---

## Product Scope

### Core user flow

1. Player opens the app.
2. Player logs in with a simple username-based login.
3. Player enters a lobby / creates a room.
4. Players join the same room.
5. Game starts when enough players are present.
6. Players take turns following UNO rules.
7. Game ends when one player finishes all cards.

### Minimal version first

Do **not** try to build the full polished game at once. Build in phases:

* Phase 1: login + lobby UI
* Phase 2: backend room creation and player join flow
* Phase 3: basic game state and card dealing
* Phase 4: turn-based play
* Phase 5: special cards and UNO rules
* Phase 6: win condition and restart
* Phase 7: polish, validation, and error handling

---

## Architecture

### High-level structure

Use a simple client-server architecture:

* **React frontend**

  * Login screen
  * Lobby screen
  * Game board screen
  * Player hand display
  * Game status and turn indicator

* **Node.js backend**

  * Authentication/session handling
  * Room management
  * Game state management
  * Turn handling
  * Rule validation
  * Real-time communication layer

### Recommended communication

Use **WebSockets** for real-time multiplayer updates.

If the stack is not already decided, use:

* `express` for HTTP APIs
* `socket.io` for real-time multiplayer events

### State ownership

* Backend is the **source of truth** for all game state.
* Frontend only renders state and sends player actions.
* Do not trust client-side game logic for rules or turn validation.

### Important design principle

Keep the game engine separate from transport and UI.

Use this separation:

* **Game engine**: pure logic for UNO rules
* **API / socket layer**: network communication
* **React UI**: presentation only

---

## Suggested Project Structure

```txt
uno-game/
  client/
    src/
      components/
      pages/
      hooks/
      services/
      store/
      utils/
  server/
    src/
      routes/
      sockets/
      services/
      game/
      models/
      utils/
  shared/
    types/
    constants/
```

### Responsibilities

#### Frontend

* Login form
* Lobby and room list
* Create/join room UI
* Game table UI
* Player hand UI
* Draw pile / discard pile UI
* Game notifications
* Connection status

#### Backend

* Create and manage rooms
* Store connected players
* Start game when room is ready
* Deal cards
* Handle turns
* Validate moves
* Broadcast state updates
* Detect win state

#### Shared layer

* UNO card definitions
* Types/interfaces for events and game state
* Constants for colors, card values, and special cards

---

## Build Strategy

### Build it iteratively

Copilot should implement the game in small increments. Each step must be runnable and testable.

#### Step 1: Basic app skeleton

* Create React app structure
* Create Node backend structure
* Add basic route/socket setup
* Show a simple homepage and health-check endpoint

#### Step 2: Login flow

* Implement username login
* Store player identity in memory or a simple session mechanism
* After login, redirect to lobby

#### Step 3: Lobby and room flow

* Create room
* Join room by code
* Show players in room
* Show ready/start status

#### Step 4: Real-time connection

* Connect frontend and backend using sockets
* Sync room state to all connected clients
* Handle disconnect/reconnect gracefully

#### Step 5: Game engine

* Create UNO deck
* Shuffle deck
* Deal cards
* Maintain current turn, direction, draw pile, discard pile
* Keep this logic pure and testable

#### Step 6: Basic gameplay

* Draw card
* Play matching card
* Skip turn
* Reverse turn direction
* Draw two
* Wild card selection

#### Step 7: Rules enforcement

* Validate legal moves on backend only
* Prevent playing illegal cards
* Prevent out-of-turn actions
* Handle empty deck refill from discard pile

#### Step 8: Win and restart

* Detect when a player has no cards left
* End game state
* Allow restart or new room

#### Step 9: UI polish

* Better layout
* Card styling
* Turn highlights
* Game notifications
* Error messages

---

## Functional Requirements

### Login

* Player enters a username
* No complex auth is required for the first version
* Keep the login simple so the focus stays on the game

### Lobby

* Player can create a room
* Player can join an existing room using code
* Show list of players in the room
* Show whether the game is started or waiting

### Game table

* Show current top discard card
* Show player hand
* Show current turn player
* Show deck count
* Show room players
* Show game messages

### Gameplay rules

Implement these first:

* A card can be played if it matches **color** or **value/symbol**
* Wild cards can be played anytime
* On play, backend updates state and broadcasts it
* If player has one card left, show UNO state
* If player reaches zero cards, game ends

### Special cards

Support these after the basic game works:

* Skip
* Reverse
* Draw Two
* Wild
* Wild Draw Four

---

## Non-Functional Requirements

* Backend must be the source of truth
* Keep state updates deterministic
* Use clean, readable code
* Avoid mixing UI logic with game logic
* Keep functions small and testable
* Prefer explicit state transitions over hidden side effects
* Handle socket disconnects without crashing the room
* Make the app easy to run locally

---
### card visuals

For the initial version of the game, do not focus on polished card graphics or complex visual design. Each UNO card should be rendered as a simple rectangular UI element that clearly displays:

The card color (Red, Blue, Green, Yellow, or Black for wild cards)
The card value or action name as text

Examples:

A red card with value 5 can display:
Red background
Large centered text: 5
A blue skip card can display:
Blue background
Text: SKIP
A wild draw four card can display:
Black or neutral background
Text: WILD +4

The priority is clarity and functionality, not visual polish. Players should immediately understand:

what card they have,
what card is currently active,
and whether a move is valid.

Avoid spending time on animations, realistic UNO styling, gradients, shadows, or custom artwork in the early stages. Build a functional card rendering system first, then improve visuals later after gameplay works correctly.

--- 

## Data Model

### Player

* id
* username
* socketId
* hand
* status
* isHost

### Room

* id
* code
* players
* gameState
* createdAt
* status

### Game state

* deck
* discardPile
* currentTurnIndex
* direction
* currentColor
* currentCard
* winner
* phase

### Card

* suit/color
* value
* type
* action

---

## Backend API / Socket Events

### HTTP endpoints

* `POST /login`
* `POST /rooms`
* `POST /rooms/join`
* `GET /rooms/:code`
* `GET /health`

### Socket events

#### Client to server

* `room:create`
* `room:join`
* `game:start`
* `game:draw-card`
* `game:play-card`
* `game:choose-color`
* `game:leave`

#### Server to client

* `room:updated`
* `game:state`
* `game:error`
* `game:started`
* `game:ended`
* `player:joined`
* `player:left`

---

## Coding Rules for Copilot

### Must follow

* Build one phase at a time.
* Do not write huge abstractions before they are needed.
* Do not split code into unnecessary micro-files too early.
* Keep the game engine pure and reusable.
* Put all rule checks on the backend.
* Write code that can be run immediately after each phase.
* If a feature needs both frontend and backend, implement the backend first, then the UI.

### Must avoid

* Do not hardcode game state in the UI.
* Do not let the client decide whether a move is valid.
* Do not build a full production auth system for this exercise.
* Do not over-engineer with microservices.
* Do not add database persistence before in-memory gameplay works.
* Do not mix transport code and game rules in the same function.

---

## Recommended Implementation Order

### Backend first

1. Create server scaffold
2. Add room creation/join logic
3. Add socket connection
4. Add game engine and deck logic
5. Add turn handling
6. Add move validation
7. Add win detection

### Frontend second

1. Login page
2. Lobby page
3. Room UI
4. Game board UI
5. Card rendering
6. Socket integration
7. Game action buttons

### Integration last

1. Connect UI to backend
2. Sync game state
3. Handle errors
4. Test complete flow

---

## Quality Bar

The final result should satisfy these checks:

* Two or more players can join the same room
* A game can start
* Cards are dealt correctly
* A player can play only legal cards
* Turns move correctly
* Special cards affect the next turn correctly
* The game ends when someone wins
* The UI updates in real time

---

## Testing Expectations

Write tests for the game engine, especially:

* deck creation
* shuffling
* card matching rules
* turn rotation
* special card effects
* win condition

The game engine should be testable without the UI or sockets.

---


## Final Instruction to Copilot

Build the UNO multiplayer game **iteratively**, with backend authority over state, React for the UI, and Node.js for the server. Start with a minimal playable slice and keep expanding it step by step. Ev
