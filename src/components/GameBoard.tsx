// //Gameboard.tsx
// import { useEffect, useState } from "react";
// import Card from "./Card";
// import { LEVELS, COLORS } from "../data/color";

// interface GameCard {
//   id: number;
//   color: string;
//   isFlipped: boolean;
//   isMatched: boolean;
//   isBomb?: boolean;
// }

// function shuffle<T>(array: T[]): T[] {
//   return [...array].sort(() => Math.random() - 0.5);
// }

// interface GameBoardProps {
//   level: string | null;
//   reset?: boolean;
// }

// const GameBoard: React.FC<GameBoardProps> = ({ level, reset }) => {
//   const [cards, setCards] = useState<GameCard[]>([]);
//   const [flipped, setFlipped] = useState<number[]>([]);
//   const [score, setScore] = useState<number>(0);
//   const [maxScore, setMaxScore] = useState<number>(0);
//   const [bombMessage, setBombMessage] = useState<string>("");
//   const [isAnimating, setIsAnimating] = useState<boolean>(false); // block clicks during bomb

//   // Initialize board
//   useEffect(() => {
//     if (!level) return;

//     const size = LEVELS[level];
//     const totalCards = size * size;
//     const pairs = Math.floor(totalCards / 2);

//     setMaxScore(pairs);
//     setScore(0);
//     setBombMessage("");

//     const selectedColors = COLORS.slice(0, pairs);
//     let cardColors: string[] = [];
//     for (let i = 0; i < pairs; i++) {
//     const color = COLORS[i % COLORS.length]; // repeat if not enough
//     cardColors.push(color, color); // pair
//     }

//     // Add bomb for odd grids
//     if (totalCards % 2 !== 0) {
//     cardColors.push("BOMB");
//     }

//     const newCards: GameCard[] = shuffle(cardColors).map((color, index) => ({
//       id: index,
//       color: color === "BOMB" ? "#000" : color,
//       isFlipped: false,
//       isMatched: false,
//       isBomb: color === "BOMB",
//     }));

//     setCards(newCards);
//     setFlipped([]);
//   }, [level, reset]);

//   const handleCardClick = (index: number) => {
//     if (flipped.length === 2 || isAnimating) return;

//     const newCards = [...cards];
//     const selectedCard = newCards[index];

//     if (selectedCard.isFlipped || selectedCard.isMatched) return;

//     selectedCard.isFlipped = true;
//     setCards([...newCards]);

//     // 💣 Bomb logic: flip all, shuffle all, reset score
//     if (selectedCard.isBomb) {
//       setIsAnimating(true);
//       setBombMessage("💥 Oops! Bomb Shuffle!");
//       setScore(0); // reset score

//       // 1️⃣ Flip all tiles
//       const allFlipped = newCards.map((card) => ({
//         ...card,
//         isFlipped: true,
//       }));
//       setCards(allFlipped);

//       // 2️⃣ After delay → shuffle everything and close
//       setTimeout(() => {
//         // Separate bomb tiles and normal tiles
//         const bombCards = allFlipped.filter(card => card.isBomb);
//         const normalCards = allFlipped.filter(card => !card.isBomb);

//         // Shuffle only normal cards
//         const shuffledNormalColors = shuffle(normalCards.map(card => card.color));

//         // Assign shuffled colors back to normal cards
//         const shuffledNormalCards = normalCards.map((card, idx) => ({
//             ...card,
//             color: shuffledNormalColors[idx],
//             isFlipped: false,
//             isMatched: false,
//             isBomb: false,
//         }));

//         // Bomb cards stay black
//         const shuffledCards = [
//             ...shuffledNormalCards,
//             ...bombCards.map(card => ({
//             ...card,
//             isFlipped: false,
//             isMatched: false,
//             color: "#000",
//             isBomb: true,
//             }))
//         ];

//         // Shuffle entire array so bomb is in random position but color stays black
//         const finalShuffledCards = shuffle(shuffledCards);

//         setCards(finalShuffledCards);
//         setFlipped([]);
//         setBombMessage("");
//         setIsAnimating(false);
//         }, 1200);


//       return;
//     }

//     // Normal flip/match logic
//     const newFlipped = [...flipped, index];
//     setFlipped(newFlipped);

//     if (newFlipped.length === 2) {
//       const [first, second] = newFlipped;

//       if (newCards[first].color === newCards[second].color) {
//         newCards[first].isMatched = true;
//         newCards[second].isMatched = true;

//         setScore((prev) => prev + 1);
//         setFlipped([]);
//       } else {
//         setTimeout(() => {
//           newCards[first].isFlipped = false;
//           newCards[second].isFlipped = false;
//           setCards([...newCards]);
//           setFlipped([]);
//         }, 800);
//       }
//     }
//   };

//   if (!level) return null;

//   const size = LEVELS[level];

//   return (
//     <div>
//       <h3>Score: {score} / {maxScore}</h3>

//       {bombMessage && (
//         <h2 style={{ color: "crimson", marginTop: "10px" }}>
//           {bombMessage}
//         </h2>
//       )}

//       {score === maxScore && (
//         <h2 style={{ color: "green" }}>🎉 You Win! All pairs matched!</h2>
//       )}

//       <div
//         style={{
//           display: "grid",
//           gridTemplateColumns: `repeat(${size}, 60px)`,
//           gap: "10px",
//           justifyContent: "center",
//           marginTop: "20px",
//         }}
//       >
//         {cards.map((card, index) => (
//           <Card
//             key={card.id}
//             color={card.color}
//             isFlipped={card.isFlipped || card.isMatched}
//             isBomb={card.isBomb}
//             onClick={() => handleCardClick(index)}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// export default GameBoard;

import { useEffect, useState } from "react";
import Card from "./Card";
import { LEVELS, COLORS } from "../data/color";
import { DIFFICULTY } from "../data/difficulty";

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
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [bombMessage, setBombMessage] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  /* ------------------ INIT BOARD ------------------ */
  useEffect(() => {
    if (!level) return;

    const size = LEVELS[level];
    const totalCards = size * size;
    const pairs = Math.floor(totalCards / 2);
    const difficulty = DIFFICULTY[level];

    setTimeLeft(difficulty.time);
    setGameOver(false);
    setScore(0);
    setMaxScore(pairs);
    setBombMessage("");
    setFlipped([]);

    let cardColors: string[] = [];
    for (let i = 0; i < pairs; i++) {
      const color = COLORS[i % COLORS.length];
      cardColors.push(color, color);
    }

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
  }, [level, reset]);

  /* ------------------ TIMER ------------------ */
  useEffect(() => {
    if (gameOver || score === maxScore) return;

    if (timeLeft <= 0) {
      setGameOver(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameOver, score, maxScore]);

  /* ------------------ CLICK LOGIC ------------------ */
  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || isAnimating || gameOver) return;

    const newCards = [...cards];
    const selectedCard = newCards[index];

    if (selectedCard.isFlipped || selectedCard.isMatched) return;

    selectedCard.isFlipped = true;
    setCards(newCards);

    /* 💣 BOMB LOGIC */
    if (selectedCard.isBomb) {
      setIsAnimating(true);
      setBombMessage("💥 Oops! Bomb Shuffle!");
      setScore(0);

      const allFlipped = newCards.map((card) => ({
        ...card,
        isFlipped: true,
      }));
      setCards(allFlipped);

      setTimeout(() => {
        const bombCards = allFlipped.filter((c) => c.isBomb);
        const normalCards = allFlipped.filter((c) => !c.isBomb);

        const shuffledColors = shuffle(normalCards.map((c) => c.color));

        const shuffledNormal = normalCards.map((card, i) => ({
          ...card,
          color: shuffledColors[i],
          isFlipped: false,
          isMatched: false,
        }));

        const finalCards = shuffle([
          ...shuffledNormal,
          ...bombCards.map((b) => ({
            ...b,
            color: "#000",
            isFlipped: false,
            isMatched: false,
          })),
        ]);

        setCards(finalCards);
        setFlipped([]);
        setBombMessage("");
        setIsAnimating(false);
      }, 1200);

      return;
    }

    /* 🧠 NORMAL MATCH LOGIC */
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;

      if (newCards[first].color === newCards[second].color) {
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setScore((s) => s + 1);
        setFlipped([]);
      } else {
        setTimeout(() => {
          newCards[first].isFlipped = false;
          newCards[second].isFlipped = false;
          setCards([...newCards]);
          setFlipped([]);
        }, DIFFICULTY[level!].flipBackDelay);
      }
    }
  };

  if (!level) return null;
  const size = LEVELS[level];

  return (
    <div>
      <h3>⏱ Time Left: {timeLeft}s</h3>
      <h3>Score: {score} / {maxScore}</h3>

      {bombMessage && <h2 style={{ color: "crimson" }}>{bombMessage}</h2>}
      {score === maxScore && <h2 style={{ color: "green" }}>🎉 You Win!</h2>}
      {gameOver && <h2 style={{ color: "red" }}>⏰ Time’s up! Game Over</h2>}

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
