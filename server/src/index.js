const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
app.use(cors());
app.use(express.json());

const rooms = new Map();

const COLORS = ['red', 'yellow', 'green', 'blue'];
const NUMBER_VALUES = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const ACTION_VALUES = ['skip', 'reverse', 'draw-two'];
const WILD_VALUES = ['wild', 'wild-draw-four'];

function createRoom() {
  const code = Math.random().toString(36).substring(2, 6).toUpperCase();
  const room = {
    code,
    players: [],
    status: 'waiting',
    gameState: null,
    createdAt: Date.now()
  };
  rooms.set(code, room);
  return room;
}

function createPlayer(username, socketId, isHost = false) {
  return {
    id: `${Date.now()}-${Math.random()}`,
    username,
    socketId,
    hand: [],
    isHost,
    status: 'connected'
  };
}

function createDeck() {
  const deck = [];

  COLORS.forEach((color) => {
    deck.push({ id: `${color}-0`, color, value: '0', type: 'number' });

    NUMBER_VALUES.slice(1).forEach((value) => {
      for (let i = 0; i < 2; i += 1) {
        deck.push({ id: `${color}-${value}-${i}`, color, value, type: 'number' });
      }
    });

    ACTION_VALUES.forEach((value) => {
      for (let i = 0; i < 2; i += 1) {
        deck.push({ id: `${color}-${value}-${i}`, color, value, type: 'action' });
      }
    });
  });

  WILD_VALUES.forEach((value) => {
    for (let i = 0; i < 4; i += 1) {
      deck.push({ id: `${value}-${i}`, color: 'black', value, type: 'wild' });
    }
  });

  return deck;
}

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function dealHands(deck, count) {
  const hands = [];
  for (let playerIndex = 0; playerIndex < count; playerIndex += 1) {
    hands.push(deck.splice(0, 7));
  }
  return hands;
}

function selectInitialCard(deck) {
  let currentCard = deck.shift();
  while (currentCard && currentCard.type === 'wild') {
    deck.push(currentCard);
    currentCard = deck.shift();
  }
  return currentCard;
}

function buildGameState(room) {
  const deck = shuffle(createDeck());
  const hands = dealHands(deck, room.players.length);
  const initialCard = selectInitialCard(deck);

  if (!initialCard) {
    return null;
  }

  room.players.forEach((player, index) => {
    player.hand = hands[index];
  });

  return {
    status: 'playing',
    deck,
    discardPile: [initialCard],
    currentCard: initialCard,
    currentColor: initialCard.color,
    currentTurnIndex: 0,
    direction: 1,
    winner: null,
    pendingAction: null,
    startedAt: Date.now()
  };
}

function canPlayCard(card, currentCard, currentColor) {
  if (card.type === 'wild') {
    return true;
  }
  if (card.color === currentColor) {
    return true;
  }
  if (card.value === currentCard.value) {
    return true;
  }
  return false;
}

function rotateTurn(room, steps = 1) {
  const playerCount = room.players.length;
  room.gameState.currentTurnIndex =
    (room.gameState.currentTurnIndex + room.gameState.direction * steps + playerCount) % playerCount;
}

function refillDeck(room) {
  const { discardPile, currentCard } = room.gameState;
  const newDeck = discardPile.slice(0, -1);
  room.gameState.discardPile = [currentCard];
  room.gameState.deck = shuffle(newDeck);
}

function findRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some((candidate) => candidate.socketId === socketId)) {
      return room;
    }
  }
  return null;
}

function emitRoomUpdate(io, room) {
  io.to(room.code).emit('room:updated', room);
}

function removePlayerFromRoom(socketId) {
  for (const room of rooms.values()) {
    const index = room.players.findIndex((player) => player.socketId === socketId);
    if (index !== -1) {
      const removed = room.players.splice(index, 1)[0];
      if (room.players.length === 0) {
        rooms.delete(room.code);
        return null;
      }
      if (removed.isHost) {
        room.players[0].isHost = true;
      }
      return room;
    }
  }
  return null;
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/rooms', (req, res) => {
  const room = createRoom();
  res.status(201).json({ room });
});

app.post('/rooms/join', (req, res) => {
  const { code, username } = req.body;
  if (!code || !username) {
    return res.status(400).json({ error: 'Room code and username are required.' });
  }

  const room = rooms.get(code.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }

  if (room.players.find((player) => player.username === username)) {
    return res.status(400).json({ error: 'Username already taken in this room.' });
  }

  const player = createPlayer(username, null, false);
  room.players.push(player);

  res.json({ room });
});

app.get('/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) {
    return res.status(404).json({ error: 'Room not found.' });
  }
  res.json({ room });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  socket.on('room:create', ({ username }, callback) => {
    if (!username) {
      return callback?.({ error: 'Username is required.' });
    }

    const room = createRoom();
    const player = createPlayer(username, socket.id, true);
    room.players.push(player);
    socket.join(room.code);
    emitRoomUpdate(io, room);

    callback?.({ room });
  });

  socket.on('room:join', ({ code, username }, callback) => {
    if (!code || !username) {
      return callback?.({ error: 'Room code and username are required.' });
    }

    const room = rooms.get(code.toUpperCase());
    if (!room) {
      return callback?.({ error: 'Room not found.' });
    }

    if (room.players.find((player) => player.username === username)) {
      return callback?.({ error: 'Username already taken in this room.' });
    }

    const player = createPlayer(username, socket.id, false);
    room.players.push(player);
    socket.join(room.code);
    emitRoomUpdate(io, room);

    callback?.({ room });
  });

  socket.on('game:start', (callback) => {
    const room = findRoomBySocket(socket.id);
    if (!room) {
      return callback?.({ error: 'Room not found for this socket.' });
    }

    if (room.status !== 'waiting') {
      return callback?.({ error: 'Game is already in progress.' });
    }

    const player = room.players.find((playerItem) => playerItem.socketId === socket.id);
    if (!player || !player.isHost) {
      return callback?.({ error: 'Only the room host can start the game.' });
    }

    if (room.players.length < 2) {
      return callback?.({ error: 'At least two players are required to start.' });
    }

    const gameState = buildGameState(room);
    if (!gameState) {
      return callback?.({ error: 'Unable to initialize the game.' });
    }

    room.gameState = gameState;
    room.status = 'playing';
    emitRoomUpdate(io, room);

    callback?.({ room });
  });

  socket.on('game:play-card', ({ cardId }, callback) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') {
      return callback?.({ error: 'No active game found.' });
    }

    const player = room.players.find((playerItem) => playerItem.socketId === socket.id);
    if (!player) {
      return callback?.({ error: 'Player not found in room.' });
    }

    const { gameState } = room;
    if (gameState.winner) {
      return callback?.({ error: 'Game has already ended.' });
    }

    if (gameState.pendingAction) {
      return callback?.({ error: 'Finish the pending action before playing a card.' });
    }

    if (room.players[gameState.currentTurnIndex].socketId !== socket.id) {
      return callback?.({ error: 'It is not your turn.' });
    }

    const cardIndex = player.hand.findIndex((card) => card.id === cardId);
    if (cardIndex === -1) {
      return callback?.({ error: 'Card not found in your hand.' });
    }

    const card = player.hand[cardIndex];
    if (!canPlayCard(card, gameState.currentCard, gameState.currentColor)) {
      return callback?.({ error: 'That card cannot be played now.' });
    }

    player.hand.splice(cardIndex, 1);
    gameState.discardPile.push(card);
    gameState.currentCard = card;
    gameState.currentColor = card.color === 'black' ? gameState.currentColor : card.color;
    gameState.pendingAction = null;

    if (card.type === 'action' && card.value === 'skip') {
      rotateTurn(room, 2);
    } else if (card.type === 'action' && card.value === 'reverse') {
      gameState.direction *= -1;
      if (room.players.length === 2) {
        rotateTurn(room, 1);
      } else {
        rotateTurn(room, 1);
      }
    } else if (card.type === 'action' && card.value === 'draw-two') {
      rotateTurn(room, 1);
      const nextPlayer = room.players[gameState.currentTurnIndex];
      for (let i = 0; i < 2; i += 1) {
        if (gameState.deck.length === 0 && gameState.discardPile.length > 1) {
          const lastCard = gameState.discardPile.pop();
          gameState.deck = shuffle(gameState.discardPile);
          gameState.discardPile = [lastCard];
        }
        if (gameState.deck.length > 0) {
          const drawnCard = gameState.deck.shift();
          nextPlayer.hand.push(drawnCard);
        }
      }
      rotateTurn(room, 1);
    } else if (card.type === 'wild') {
      if (card.value === 'wild') {
        gameState.pendingAction = { type: 'choose-color', playerId: player.id };
      } else if (card.value === 'wild-draw-four') {
        rotateTurn(room, 1);
        const nextPlayer = room.players[gameState.currentTurnIndex];
        for (let i = 0; i < 4; i += 1) {
          if (gameState.deck.length === 0 && gameState.discardPile.length > 1) {
            const lastCard = gameState.discardPile.pop();
            gameState.deck = shuffle(gameState.discardPile);
            gameState.discardPile = [lastCard];
          }
          if (gameState.deck.length > 0) {
            const drawnCard = gameState.deck.shift();
            nextPlayer.hand.push(drawnCard);
          }
        }
        rotateTurn(room, 1);
        gameState.pendingAction = { type: 'choose-color', playerId: player.id };
      }
    } else {
      rotateTurn(room, 1);
    }

    if (player.hand.length === 0) {
      gameState.winner = player.id;
      room.status = 'ended';
    }

    emitRoomUpdate(io, room);
    callback?.({ room });
  });

  socket.on('game:choose-color', ({ color }, callback) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') {
      return callback?.({ error: 'No active game found.' });
    }

    const player = room.players.find((playerItem) => playerItem.socketId === socket.id);
    if (!player) {
      return callback?.({ error: 'Player not found in room.' });
    }

    const { gameState } = room;
    if (gameState.winner) {
      return callback?.({ error: 'Game has already ended.' });
    }

    if (!gameState.pendingAction || gameState.pendingAction.type !== 'choose-color') {
      return callback?.({ error: 'No color selection pending.' });
    }

    if (gameState.pendingAction.playerId !== player.id) {
      return callback?.({ error: 'Only the player who played the wild card can choose a color.' });
    }

    const validColors = ['red', 'yellow', 'green', 'blue'];
    if (!validColors.includes(color)) {
      return callback?.({ error: 'Invalid color selected.' });
    }

    gameState.currentColor = color;
    gameState.pendingAction = null;
    rotateTurn(room, 1);

    emitRoomUpdate(io, room);
    callback?.({ room });
  });

  socket.on('game:draw-card', (callback) => {
    const room = findRoomBySocket(socket.id);
    if (!room || room.status !== 'playing') {
      return callback?.({ error: 'No active game found.' });
    }

    const player = room.players.find((playerItem) => playerItem.socketId === socket.id);
    if (!player) {
      return callback?.({ error: 'Player not found in room.' });
    }

    const { gameState } = room;
    if (gameState.winner) {
      return callback?.({ error: 'Game has already ended.' });
    }

    if (gameState.pendingAction) {
      return callback?.({ error: 'Finish the pending action before drawing a card.' });
    }

    if (room.players[gameState.currentTurnIndex].socketId !== socket.id) {
      return callback?.({ error: 'It is not your turn.' });
    }

    if (gameState.deck.length === 0 && gameState.discardPile.length > 1) {
      const lastCard = gameState.discardPile.pop();
      gameState.deck = shuffle(gameState.discardPile);
      gameState.discardPile = [lastCard];
    }

    if (gameState.deck.length === 0) {
      return callback?.({ error: 'No cards left to draw.' });
    }

    const drawnCard = gameState.deck.shift();
    player.hand.push(drawnCard);
    rotateTurn(room, 1);

    emitRoomUpdate(io, room);
    callback?.({ room });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
    const room = removePlayerFromRoom(socket.id);
    if (room) {
      emitRoomUpdate(io, room);
    }
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`UNO server listening on http://localhost:${PORT}`);
});
