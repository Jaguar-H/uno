import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:4000";

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [status, setStatus] = useState("loading");
  const [socket, setSocket] = useState(null);
  const [room, setRoom] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [selectingColor, setSelectingColor] = useState(false);

  useEffect(() => {
    fetch(`${SERVER_URL}/health`)
      .then((response) => response.json())
      .then(() => setStatus("ready"))
      .catch(() => setStatus("offline"));
  }, []);

  useEffect(() => {
    if (!loggedIn) {
      return;
    }

    const client = io(SERVER_URL, {
      autoConnect: true,
      transports: ["websocket"],
    });

    client.on("connect", () => {
      setStatus("ready");
      setError("");
    });

    client.on("connect_error", () => {
      setStatus("offline");
      setError("Unable to connect to the game server.");
    });

    client.on("room:updated", (updatedRoom) => {
      setRoom(updatedRoom);
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, [loggedIn]);

  const handleLogin = (event) => {
    event.preventDefault();
    if (!username.trim()) {
      return;
    }
    setLoggedIn(true);
  };

  const handleCreateRoom = () => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    setCreating(true);
    setError("");

    socket.emit(
      "room:create",
      { username: username.trim() },
      ({ error: createError, room: createdRoom }) => {
        setCreating(false);
        if (createError) {
          setError(createError);
          return;
        }
        setRoom(createdRoom);
      },
    );
  };

  const handleJoinRoom = () => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    const code = joinCode.trim().toUpperCase();
    if (!code) {
      setError("Please enter a room code.");
      return;
    }

    setJoining(true);
    setError("");

    socket.emit(
      "room:join",
      { code, username: username.trim() },
      ({ error: joinError, room: joinedRoom }) => {
        setJoining(false);
        if (joinError) {
          setError(joinError);
          return;
        }
        setRoom(joinedRoom);
      },
    );
  };

  const handleStartGame = () => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    setError("");
    socket.emit("game:start", ({ error: startError, room: updatedRoom }) => {
      if (startError) {
        setError(startError);
        return;
      }
      setRoom(updatedRoom);
    });
  };

  const handlePlayCard = (cardId) => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    setError("");
    socket.emit(
      "game:play-card",
      { cardId },
      ({ error: playError, room: updatedRoom }) => {
        if (playError) {
          setError(playError);
          return;
        }
        setRoom(updatedRoom);
      },
    );
  };

  const handleDrawCard = () => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    setError("");
    socket.emit("game:draw-card", ({ error: drawError, room: updatedRoom }) => {
      if (drawError) {
        setError(drawError);
        return;
      }
      setRoom(updatedRoom);
    });
  };

  const handleChooseColor = (color) => {
    if (!socket || !socket.connected) {
      setError("Socket connection is not ready yet.");
      return;
    }

    setSelectingColor(true);
    setError("");

    socket.emit(
      "game:choose-color",
      { color },
      ({ error: chooseError, room: updatedRoom }) => {
        setSelectingColor(false);
        if (chooseError) {
          setError(chooseError);
          return;
        }
        setRoom(updatedRoom);
      },
    );
  };

  const currentPlayer = room?.gameState
    ? room.players[room.gameState.currentTurnIndex]
    : null;
  const currentUser = room?.players.find(
    (player) => player.username === username,
  );
  const isHost = Boolean(currentUser?.isHost);
  const isYourTurn = Boolean(
    room?.gameState && currentUser && currentPlayer?.id === currentUser.id,
  );
  const pendingChooserId = room?.gameState?.pendingAction?.playerId;
  const isColorChooser = Boolean(
    room?.gameState?.pendingAction?.type === "choose-color" &&
      currentUser?.id === pendingChooserId,
  );
  const needsColorSelection = Boolean(
    room?.gameState?.pendingAction?.type === "choose-color",
  );
  const winner = room?.gameState?.winner
    ? room.players.find((player) => player.id === room.gameState.winner)
    : null;
  const handCount = currentUser?.hand?.length ?? 0;
  const deckCount = room?.gameState?.deck?.length ?? 0;
  const discardCount = room?.gameState?.discardPile?.length ?? 0;

  if (status === "loading") {
    return <div className="screen">Connecting to server...</div>;
  }

  return (
    <div className="screen">
      <div className="card">
        <h1>UNO Multiplayer</h1>
        <div className="status">Server status: {status}</div>

        {!loggedIn
          ? (
            <form onSubmit={handleLogin} className="form">
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter a username"
                className="input"
              />
              <button type="submit" className="button">
                Continue
              </button>
            </form>
          )
          : room
          ? (
            <div>
              <div className="room-header">
                <div>
                  <div className="room-label">Room code</div>
                  <div className="room-code">{room.code}</div>
                </div>
                <div className="room-status">
                  {room.status === "playing"
                    ? "Game in progress"
                    : "Waiting for players"}
                </div>
              </div>

              <div className="section">
                <h2>Players</h2>
                <ul className="player-list">
                  {room.players.map((player, index) => {
                    const isCurrentTurn = room.gameState &&
                      room.gameState.currentTurnIndex === index;
                    return (
                      <li
                        key={player.id}
                        className={`player-item ${
                          isCurrentTurn ? "active-turn" : ""
                        }`}
                      >
                        <div className="player-info">
                          <span className="player-name">
                            {isCurrentTurn && (
                              <span className="turn-indicator">→</span>
                            )}
                            {player.username}
                          </span>
                          {room.status === "playing" && (
                            <span className="hand-count">
                              {player.hand.length} card
                              {player.hand.length !== 1 ? "s" : ""}
                            </span>
                          )}
                          {player.isHost && (
                            <span className="host-badge">Host</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {room.status === "playing" && room.gameState && (
                <div className="section game-info">
                  <div className="info-row">
                    <span>
                      Direction: {room.gameState.direction === 1
                        ? "→ Clockwise"
                        : "← Counter-clockwise"}
                    </span>
                  </div>
                </div>
              )}

              {room.status === "waiting"
                ? (
                  <div className="section">
                    <div className="info">
                      {room.players.length >= 2
                        ? "Ready to start the game when the host presses Start."
                        : "Need at least 2 players to start the game."}
                    </div>
                    {isHost && room.players.length >= 2 && (
                      <button className="button" onClick={handleStartGame}>
                        Start game
                      </button>
                    )}
                  </div>
                )
                : (
                  <div className="section">
                    <h2>Game board</h2>
                    <div className="info">
                      Current turn: {currentPlayer?.username ?? "N/A"}
                    </div>
                    <div className="game-summary">
                      <div>
                        Top card:{" "}
                        <strong>{room.gameState.currentCard.value}</strong> (
                        {room.gameState.currentCard.color})
                      </div>
                      <div>Current color: {room.gameState.currentColor}</div>
                      <div>Deck: {deckCount} cards</div>
                      <div>Discard: {discardCount} cards</div>
                      <div>Your hand: {handCount} cards</div>
                    </div>

                    {needsColorSelection && (
                      <div className="color-picker">
                        <div className="info">
                          {isColorChooser
                            ? "Choose a color for the wild card:"
                            : "Waiting for the wild card player to choose a color..."}
                        </div>
                        {isColorChooser && (
                          <div className="color-options">
                            <button
                              className="color-btn color-btn-red"
                              onClick={() => handleChooseColor("red")}
                              disabled={selectingColor}
                            >
                              Red
                            </button>
                            <button
                              className="color-btn color-btn-yellow"
                              onClick={() => handleChooseColor("yellow")}
                              disabled={selectingColor}
                            >
                              Yellow
                            </button>
                            <button
                              className="color-btn color-btn-green"
                              onClick={() => handleChooseColor("green")}
                              disabled={selectingColor}
                            >
                              Green
                            </button>
                            <button
                              className="color-btn color-btn-blue"
                              onClick={() => handleChooseColor("blue")}
                              disabled={selectingColor}
                            >
                              Blue
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="section">
                      <div className="info">
                        {room.status === "ended"
                          ? `Winner: ${winner?.username ?? "Unknown"}`
                          : isYourTurn
                          ? "Your turn: play a card or draw."
                          : `Waiting for ${currentPlayer?.username}'s turn.`}
                      </div>
                      {room.status !== "ended" && (
                        <div className="hand-grid">
                          {currentUser?.hand?.map((card) => (
                            <button
                              key={card.id}
                              className={`card-item card-${card.color}`}
                              onClick={() => handlePlayCard(card.id)}
                              disabled={!isYourTurn}
                            >
                              <div className="card-value">{card.value}</div>
                              <div className="card-color">{card.color}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      {room.status !== "ended" && (
                        <button
                          className="button"
                          onClick={handleDrawCard}
                          disabled={!isYourTurn}
                        >
                          Draw card
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          )
          : (
            <div className="section">
              <div className="panel">
                <button
                  className="button"
                  onClick={handleCreateRoom}
                  disabled={creating || !socket?.connected}
                >
                  {creating ? "Creating room..." : "Create room"}
                </button>
              </div>
              <div className="panel">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(event) => setJoinCode(event.target.value)}
                  placeholder="Enter room code"
                  className="input"
                />
                <button
                  className="button"
                  onClick={handleJoinRoom}
                  disabled={joining || !socket?.connected}
                >
                  {joining ? "Joining..." : "Join room"}
                </button>
              </div>
            </div>
          )}

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  );
}

export default App;
