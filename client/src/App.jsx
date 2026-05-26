import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import GameTable from "./components/GameTable";

const SERVER_URL = "http://localhost:4000";

function App() {
  const [username, setUsername] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [status, setStatus] = useState("loading");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
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

    setConnecting(true);
    setStatus("connecting");

    const client = io(SERVER_URL, {
      autoConnect: true,
      transports: ["websocket"],
    });

    client.on("connect", () => {
      setStatus("ready");
      setError("");
      setConnected(true);
      setConnecting(false);
    });

    client.on("connect_error", () => {
      setStatus("offline");
      setError("Unable to connect to the game server.");
      setConnected(false);
      setConnecting(false);
    });

    client.on("disconnect", () => {
      setConnected(false);
      setStatus("offline");
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
    if (!socket || !connected) {
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
    if (!socket || !connected) {
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
    if (!socket || !connected) {
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
    if (!socket || !connected) {
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
    if (!socket || !connected) {
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
    if (!socket || !connected) {
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
  const connectionLabel = connecting
    ? "Connecting to server..."
    : connected
    ? "Connected to server"
    : "Server offline";
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
        <div className="status">{connectionLabel}</div>

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
                  <GameTable
                    room={room}
                    username={username}
                    onPlayCard={handlePlayCard}
                    onDrawCard={handleDrawCard}
                    onChooseColor={handleChooseColor}
                    isColorChooser={isColorChooser}
                    selectingColor={selectingColor}
                  />
                )}
            </div>
          )
          : (
            <div className="section">
              <div className="panel">
                <button
                  className="button"
                  onClick={handleCreateRoom}
                  disabled={creating || !connected}
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
                  disabled={joining || !connected}
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
