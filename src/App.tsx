import { useState } from "react";
import GameBoard from "./components/GameBoard";
import LevelSelector from "./components/LevelSelector";

const App: React.FC = () => {
  const [step, setStep] = useState<"start" | "name" | "level" | "game">("start");
  const [playerName, setPlayerName] = useState<string>("");
  const [level, setLevel] = useState<string | null>(null);
  const [resetGame, setResetGame] = useState<boolean>(false); // trigger reset
  const [resetMessage, setResetMessage] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string>("");


  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2000);
  };

  const handleRestart = () => {
    // trigger gameboard reset
    setResetGame(true);
    setResetMessage("🔄 Game Reset!");
    // clear the message after 1.5s
    setTimeout(() => {
      setResetMessage("");
      setResetGame(false);
    }, 1500);
  };

  const handleQuit = () => {
    setStep("start");
    setPlayerName("");
    setLevel(null);
    setResetMessage("");
  };

  return (
    <div className="app-container">
      {toastMessage && <div className="toast">{toastMessage}</div>}

      {/* START SCREEN */}
      {step === "start" && (
        <div>
          <h1>🟩🟦 💥 Color Blast 💣 🟥🟨</h1>
          <button onClick={() => setStep("name")}>Start Game</button>
        </div>
      )}

      {/* NAME INPUT */}
      {step === "name" && (
        <div>
          <h2>Enter Your Name</h2>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Your name..."
          />
          <br />
          <button
            onClick={() => {
              if (playerName.trim()) setStep("level");
              else showToast("⚠️ Please enter your name!");
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* LEVEL SELECT */}
      {step === "level" && (
        <div>
          <h1>Welcome, {playerName}! </h1><br></br>
            <h2>Select Difficulty:</h2><br></br>
          <LevelSelector
            setLevel={(lvl) => {
              setLevel(lvl);
              setStep("game");
            }}
          />
        </div>
      )}

      {/* GAME BOARD */}
      {step === "game" && level && (
        <div>
          <h2>Player: {playerName}</h2>

          {/* Reset message */}
          {resetMessage && (
            <h3 style={{ color: "yellow", margin: "10px 0" }}>{resetMessage}</h3>
          )}

          <div className="game-board-container">
            <GameBoard level={level} reset={resetGame} />
          </div>

          <div className="game-buttons">
            <button className="restart-button" onClick={handleRestart}>
              🔄 Restart
            </button>
            <button className="quit-button" onClick={handleQuit}>
              ❌ Quit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
