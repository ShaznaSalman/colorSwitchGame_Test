//Gameboard.tsx
import { useEffect, useState } from "react";
import Card from "./Card";
import { LEVELS, COLORS } from "../data/color";

interface GameCard {
  id: number;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
  isBomb?: boolean;
}

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

interface GameBoardProps {
  level: string | null;
  reset?: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ level, reset }) => {
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [score, setScore] = useState<number>(0);
  const [maxScore, setMaxScore] = useState<number>(0);
  const [bombMessage, setBombMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false); // block clicks during bomb

  // Initialize board
  useEffect(() => {
    if (!level) return;

    const size = LEVELS[level];
    const totalCards = size * size;
    const pairs = Math.floor(totalCards / 2);

    setMaxScore(pairs);
    setScore(0);
    setBombMessage("");

    const selectedColors = COLORS.slice(0, pairs);
    let cardColors: string[] = [];
    for (let i = 0; i < pairs; i++) {
    const color = COLORS[i % COLORS.length]; // repeat if not enough
    cardColors.push(color, color); // pair
    }

    // Add bomb for odd grids
    if (totalCards % 2 !== 0) {
    cardColors.push("BOMB");
    }

    const newCards: GameCard[] = shuffle(cardColors).map((color, index) => ({
      id: index,
      color: color === "BOMB" ? "#000" : color,
      isFlipped: false,
      isMatched: false,
      isBomb: color === "BOMB",
    }));

    setCards(newCards);
    setFlipped([]);
  }, [level, reset]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || isAnimating) return;

    const newCards = [...cards];
    const selectedCard = newCards[index];

    if (selectedCard.isFlipped || selectedCard.isMatched) return;

    selectedCard.isFlipped = true;
    setCards([...newCards]);

    // 💣 Bomb logic: flip all, shuffle all, reset score
    if (selectedCard.isBomb) {
      setIsAnimating(true);
      setBombMessage("💥 Oops! Bomb Shuffle!");
      setScore(0); // reset score

      // 1️⃣ Flip all tiles
      const allFlipped = newCards.map((card) => ({
        ...card,
        isFlipped: true,
      }));
      setCards(allFlipped);

      // 2️⃣ After delay → shuffle everything and close
      setTimeout(() => {
        // Separate bomb tiles and normal tiles
        const bombCards = allFlipped.filter(card => card.isBomb);
        const normalCards = allFlipped.filter(card => !card.isBomb);

        // Shuffle only normal cards
        const shuffledNormalColors = shuffle(normalCards.map(card => card.color));

        // Assign shuffled colors back to normal cards
        const shuffledNormalCards = normalCards.map((card, idx) => ({
            ...card,
            color: shuffledNormalColors[idx],
            isFlipped: false,
            isMatched: false,
            isBomb: false,
        }));

        // Bomb cards stay black
        const shuffledCards = [
            ...shuffledNormalCards,
            ...bombCards.map(card => ({
            ...card,
            isFlipped: false,
            isMatched: false,
            color: "#000",
            isBomb: true,
            }))
        ];

        // Shuffle entire array so bomb is in random position but color stays black
        const finalShuffledCards = shuffle(shuffledCards);

        setCards(finalShuffledCards);
        setFlipped([]);
        setBombMessage("");
        setIsAnimating(false);
        }, 1200);


      return;
    }

    // Normal flip/match logic
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (newCards[first].color === newCards[second].color) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;

        setScore((prev) => prev + 1);
        setFlipped([]);
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlipped([]);
        }, 800);
      }
    }
  };

  if (!level) return null;

  const size = LEVELS[level];

  return (
    <div>
      <h3>Score: {score} / {maxScore}</h3>

      {bombMessage && (
        <h2 style={{ color: "crimson", marginTop: "10px" }}>
          {bombMessage}
        </h2>
      )}

      {score === maxScore && (
        <h2 style={{ color: "green" }}>🎉 You Win! All pairs matched!</h2>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, 60px)`,
          gap: "10px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {cards.map((card, index) => (
          <Card
            key={card.id}
            color={card.color}
            isFlipped={card.isFlipped || card.isMatched}
            isBomb={card.isBomb}
            onClick={() => handleCardClick(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
