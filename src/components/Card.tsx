//Cards.tsx
interface CardProps {
  color: string;
  isFlipped: boolean;
  onClick: () => void;
  isBomb?: boolean;
}

const Card: React.FC<CardProps> = ({ color, isFlipped, onClick, isBomb }) => {
  const style: React.CSSProperties = {
    width: "50px",
    height: "50px",
    backgroundColor: isFlipped ? color : "#444",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "0.3s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    color: "white",
    fontWeight: "bold",
  };

  return (
    <div style={style} onClick={onClick}>
      {isFlipped ? (isBomb ? "💣" : "") : "?"}
    </div>
  );
};

export default Card;
