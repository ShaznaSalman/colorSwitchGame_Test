//LevelSelector.tsx

interface LevelSelectorProps {
  setLevel: (level: string) => void;
}

const LevelSelector: React.FC<LevelSelectorProps> = ({ setLevel }) => {
  return (
    <div 
      style={{
        display: "flex",
        flexDirection: "column", // stack vertically
        alignItems: "center",
        gap: "15px", // space between buttons
        marginBottom: "20px"
      }}
    >
      <button className="level-button easy" onClick={() => setLevel("easy")}>
        Easy (3x3)
      </button>
      <button className="level-button medium" onClick={() => setLevel("medium")}>
        Medium (5x5)
      </button>
      <button className="level-button hard" onClick={() => setLevel("hard")}>
        Hard (7x7)
      </button>
    </div>
  );
};

export default LevelSelector;
