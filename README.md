
This is the Swift code 

================================================================================================================================================

1️⃣ ColorBlastApp.swift
import SwiftUI

@main
struct ColorBlastApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

================================================================================================================================================

2️⃣ ContentView.swift (App.tsx equivalent)
import SwiftUI

struct ContentView: View {
    enum Step {
        case start, name, level, game
    }

    @State private var step: Step = .start
    @State private var playerName: String = ""
    @State private var selectedLevel: String? = nil
    @State private var resetGame: Bool = false
    @State private var resetMessage: String = ""
    @State private var toastMessage: String = ""

    var body: some View {
        ZStack {
            AnimatedGradientBackground()

            VStack(spacing: 20) {

                // TOAST
                if !toastMessage.isEmpty {
                    ToastView(message: toastMessage)
                        .transition(.move(edge: .trailing).combined(with: .opacity))
                }

                // START
                if step == .start {
                    VStack(spacing: 20) {
                        Text("🟩🟦 💥 Color Blast 💣 🟥🟨")
                            .font(.largeTitle)
                            .fontWeight(.bold)

                        PrimaryButton(title: "Start Game") {
                            step = .name
                        }
                    }
                }

                // NAME
                if step == .name {
                    VStack(spacing: 20) {
                        Text("Enter Your Name")
                            .font(.title2)
                            .fontWeight(.bold)

                        TextField("Your name...", text: $playerName)
                            .padding()
                            .background(Color.white.opacity(0.9))
                            .cornerRadius(10)
                            .frame(width: 220)

                        PrimaryButton(title: "Next") {
                            if playerName.trimmingCharacters(in: .whitespaces).isEmpty {
                                showToast("⚠️ Please enter your name!")
                            } else {
                                step = .level
                            }
                        }
                    }
                }

                // LEVEL
                if step == .level {
                    VStack(spacing: 20) {
                        Text("Welcome, \(playerName)!")
                            .font(.title)
                            .fontWeight(.bold)

                        Text("Select Difficulty:")
                            .font(.headline)

                        LevelSelectorView { level in
                            selectedLevel = level
                            step = .game
                        }
                    }
                }

                // GAME
                if step == .game, let level = selectedLevel {
                    VStack(spacing: 15) {
                        Text("Player: \(playerName)")
                            .font(.headline)

                        if !resetMessage.isEmpty {
                            Text(resetMessage)
                                .foregroundColor(.yellow)
                                .fontWeight(.bold)
                        }

                        GameBoardView(level: level, resetTrigger: $resetGame)

                        HStack(spacing: 20) {
                            GlossyButton(title: "🔄 Restart", colors: [.purple, .pink]) {
                                handleRestart()
                            }

                            GlossyButton(title: "❌ Quit", colors: [.red, .orange]) {
                                handleQuit()
                            }
                        }
                    }
                }
            }
            .padding()
        }
    }

    // MARK: - Functions

    private func showToast(_ message: String) {
        toastMessage = message
        DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
            withAnimation {
                toastMessage = ""
            }
        }
    }

    private func handleRestart() {
        resetGame = true
        resetMessage = "🔄 Game Reset!"
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            resetMessage = ""
            resetGame = false
        }
    }

    private func handleQuit() {
        step = .start
        playerName = ""
        selectedLevel = nil
        resetMessage = ""
    }
}

================================================================================================================================================

3️⃣ AnimatedGradientBackground.swift
import SwiftUI

struct AnimatedGradientBackground: View {
    @State private var animate = false

    var body: some View {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 1.0, green: 0.77, blue: 0.88),
                Color(red: 0.65, green: 0.97, blue: 0.78),
                Color(red: 0.64, green: 0.80, blue: 0.98),
                Color(red: 1.0, green: 0.96, blue: 0.73)
            ]),
            startPoint: animate ? .topLeading : .bottomTrailing,
            endPoint: animate ? .bottomTrailing : .topLeading
        )
        .ignoresSafeArea()
        .animation(.easeInOut(duration: 15).repeatForever(autoreverses: true), value: animate)
        .onAppear {
            animate = true
        }
    }
}

================================================================================================================================================

4️⃣ LevelSelectorView.swift
import SwiftUI

struct LevelSelectorView: View {
    let onSelect: (String) -> Void

    var body: some View {
        VStack(spacing: 15) {
            GlossyButton(title: "Easy (3x3)", colors: [.green, .mint]) {
                onSelect("easy")
            }

            GlossyButton(title: "Medium (5x5)", colors: [.yellow, .orange]) {
                onSelect("medium")
            }

            GlossyButton(title: "Hard (7x7)", colors: [.red, .pink]) {
                onSelect("hard")
            }
        }
    }
}

================================================================================================================================================

5️⃣ GameBoardView.swift
import SwiftUI

struct GameCard: Identifiable {
    let id: Int
    var color: Color
    var isFlipped: Bool
    var isMatched: Bool
    var isBomb: Bool
}

struct GameBoardView: View {
    let level: String
    @Binding var resetTrigger: Bool

    @State private var cards: [GameCard] = []
    @State private var flippedIndices: [Int] = []
    @State private var score: Int = 0
    @State private var maxScore: Int = 0
    @State private var bombMessage: String = ""
    @State private var isAnimating: Bool = false

    var body: some View {
        VStack(spacing: 10) {
            Text("Score: \(score) / \(maxScore)")
                .fontWeight(.bold)

            if !bombMessage.isEmpty {
                Text(bombMessage)
                    .foregroundColor(.red)
                    .font(.title3)
                    .fontWeight(.bold)
            }

            if score == maxScore && maxScore > 0 {
                Text("🎉 You Win! All pairs matched!")
                    .foregroundColor(.green)
                    .font(.headline)
            }

            let size = LEVELS[level] ?? 3

            LazyVGrid(columns: Array(repeating: GridItem(.fixed(60)), count: size), spacing: 10) {
                ForEach(cards.indices, id: \.self) { index in
                    CardView(card: cards[index])
                        .onTapGesture {
                            handleCardTap(index)
                        }
                }
            }
            .padding(.top, 10)
        }
        .padding()
        .background(Color.black.opacity(0.4))
        .cornerRadius(20)
        .onAppear { setupBoard() }
        .onChange(of: resetTrigger) { _ in
            setupBoard()
        }
    }

    // MARK: - Logic

    private func setupBoard() {
        guard let size = LEVELS[level] else { return }

        let total = size * size
        let pairs = total / 2

        score = 0
        maxScore = pairs
        bombMessage = ""
        flippedIndices = []

        var colors: [Color] = []
        for i in 0..<pairs {
            let color = COLORS[i % COLORS.count]
            colors.append(color)
            colors.append(color)
        }

        var hasBomb = false
        if total % 2 != 0 {
            hasBomb = true
        }

        var tempCards: [GameCard] = colors.enumerated().map { idx, color in
            GameCard(id: idx, color: color, isFlipped: false, isMatched: false, isBomb: false)
        }

        if hasBomb {
            tempCards.append(GameCard(id: tempCards.count, color: .black, isFlipped: false, isMatched: false, isBomb: true))
        }

        tempCards.shuffle()

        cards = tempCards
    }

    private func handleCardTap(_ index: Int) {
        if isAnimating || flippedIndices.count == 2 { return }
        if cards[index].isFlipped || cards[index].isMatched { return }

        cards[index].isFlipped = true

        if cards[index].isBomb {
            triggerBomb()
            return
        }

        flippedIndices.append(index)

        if flippedIndices.count == 2 {
            let first = flippedIndices[0]
            let second = flippedIndices[1]

            if cards[first].color == cards[second].color {
                cards[first].isMatched = true
                cards[second].isMatched = true
                score += 1
                flippedIndices = []
            } else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
                    cards[first].isFlipped = false
                    cards[second].isFlipped = false
                    flippedIndices = []
                }
            }
        }
    }

    private func triggerBomb() {
        isAnimating = true
        bombMessage = "💥 Oops! Bomb Shuffle!"
        score = 0

        // Flip all
        for i in cards.indices {
            cards[i].isFlipped = true
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 1.2) {
            var normalCards = cards.filter { !$0.isBomb }
            let bombCards = cards.filter { $0.isBomb }

            let shuffledColors = normalCards.map { $0.color }.shuffled()

            for i in normalCards.indices {
                normalCards[i].color = shuffledColors[i]
                normalCards[i].isFlipped = false
                normalCards[i].isMatched = false
            }

            let newDeck = (normalCards + bombCards).shuffled()

            cards = newDeck
            flippedIndices = []
            bombMessage = ""
            isAnimating = false
        }
    }
}

================================================================================================================================================

6️⃣ CardView.swift
import SwiftUI

struct CardView: View {
    let card: GameCard

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 8)
                .fill(card.isFlipped || card.isMatched ? card.color : Color.gray.opacity(0.7))
                .frame(width: 50, height: 50)
                .shadow(radius: 3)

            if card.isFlipped || card.isMatched {
                if card.isBomb {
                    Text("💣")
                        .font(.system(size: 22))
                }
            } else {
                Text("?")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: card.isFlipped)
    }
}

================================================================================================================================================

7️⃣ ToastView.swift
import SwiftUI

struct ToastView: View {
    let message: String

    var body: some View {
        Text(message)
            .padding(.horizontal, 20)
            .padding(.vertical, 12)
            .background(
                LinearGradient(colors: [.red, .pink], startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .cornerRadius(12)
            .foregroundColor(.white)
            .fontWeight(.bold)
            .shadow(radius: 10)
            .padding(.top, 20)
            .frame(maxWidth: .infinity, alignment: .trailing)
            .padding(.trailing, 20)
    }
}

================================================================================================================================================

8️⃣ Buttons.swift
import SwiftUI

struct PrimaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(.bold)
                .padding()
                .frame(width: 180)
                .background(
                    LinearGradient(colors: [.orange, .red], startPoint: .top, endPoint: .bottom)
                )
                .cornerRadius(12)
                .foregroundColor(.white)
                .shadow(radius: 5)
        }
    }
}

struct GlossyButton: View {
    let title: String
    let colors: [Color]
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .fontWeight(.bold)
                .padding()
                .frame(width: 160)
                .background(
                    LinearGradient(colors: colors, startPoint: .top, endPoint: .bottom)
                )
                .cornerRadius(14)
                .foregroundColor(.white)
                .shadow(radius: 6)
        }
        .scaleEffect(1.0)
        .buttonStyle(.plain)
    }
}

================================================================================================================================================

9️⃣ Constants.swift (color.ts equivalent)
import SwiftUI

let LEVELS: [String: Int] = [
    "easy": 3,
    "medium": 5,
    "hard": 7
]

let COLORS: [Color] = [
    Color(hex: "#FF6B6B"),
    Color(hex: "#6BCB77"),
    Color(hex: "#4D96FF"),
    Color(hex: "#FFD93D"),
    Color(hex: "#845EC2"),
    Color(hex: "#FF9671"),
    Color(hex: "#00C9A7"),
    Color(hex: "#F9F871"),
    Color(hex: "#C34A36"),
    Color(hex: "#0081CF"),
    Color(hex: "#B0A8B9"),
    Color(hex: "#FFC75F"),
    Color(hex: "#F3C5FF")
]

================================================================================================================================================

🔟 Color+Hex.swift
import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64

        switch hex.count {
        case 6:
            (a, r, g, b) = (255, (int >> 16) & 0xff, (int >> 8) & 0xff, int & 0xff)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}