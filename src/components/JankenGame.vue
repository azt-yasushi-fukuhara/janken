<template>
  <div class="janken-game">
    <h1>じゃんけんゲーム</h1>

    <div class="score-board">
      <div class="score">
        <span>プレイヤー: {{ gameState.playerScore }}</span>
        <span>引き分け: {{ gameState.drawCount }}</span>
        <span>CPU: {{ gameState.computerScore }}</span>
      </div>
    </div>

    <div class="game-area">
      <div class="player-section">
        <h3>あなたの手</h3>
        <div class="hand-display" :class="{ active: gameState.playerHand }">
          <div
            v-if="gameState.playerHand"
            class="hand"
            :class="`hand-${gameState.playerHand}`"
          >
            {{ getHandDisplay(gameState.playerHand) }}
          </div>
          <div v-else class="hand-placeholder">？</div>
        </div>
      </div>

      <div class="vs-section">
        <div class="vs">VS</div>
        <div
          v-if="gameState.result"
          class="result"
          :class="`result-${gameState.result}`"
        >
          {{ getResultDisplay(gameState.result) }}
        </div>
      </div>

      <div class="computer-section">
        <h3>CPUの手</h3>
        <div class="hand-display" :class="{ active: gameState.computerHand }">
          <div
            v-if="gameState.computerHand"
            class="hand"
            :class="`hand-${gameState.computerHand}`"
          >
            {{ getHandDisplay(gameState.computerHand) }}
          </div>
          <div v-else class="hand-placeholder">？</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <h3>手を選んでください</h3>
      <div class="hand-buttons">
        <button
          class="hand-button hand-rock"
          @click="playGame('rock')"
          :disabled="isPlaying"
        >
          グー
        </button>
        <button
          class="hand-button hand-paper"
          @click="playGame('paper')"
          :disabled="isPlaying"
        >
          パー
        </button>
        <button
          class="hand-button hand-scissors"
          @click="playGame('scissors')"
          :disabled="isPlaying"
        >
          チョキ
        </button>
      </div>
      <button v-if="gameState.result" class="reset-button" @click="resetGame">
        もう一度プレイ
      </button>
      <button class="reset-all-button" @click="resetAllScores">
        勝敗をリセット
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from "vue";
import type { HandType, GameResult, GameState } from "@/types/game";
import {
  saveGameStateToCookie,
  loadGameStateFromCookie,
  clearGameStateFromCookie,
  type SavedGameState,
} from "@/utils/cookie";

const isPlaying = ref(false);

const gameState = reactive<GameState>({
  playerHand: null,
  computerHand: null,
  result: null,
  playerScore: 0,
  computerScore: 0,
  drawCount: 0,
});

const getHandDisplay = (hand: HandType): string => {
  const handMap = {
    rock: "グー",
    paper: "パー",
    scissors: "チョキ",
  };
  return handMap[hand];
};

const getResultDisplay = (result: GameResult): string => {
  const resultMap = {
    win: "あなたの勝ち！",
    lose: "CPUの勝ち！",
    draw: "引き分け！",
  };
  return resultMap[result];
};

const getRandomHand = (): HandType => {
  const hands: HandType[] = ["rock", "paper", "scissors"];
  const randomIndex = Math.floor(Math.random() * hands.length);
  return hands[randomIndex];
};

const getGameResult = (
  playerHand: HandType,
  computerHand: HandType
): GameResult => {
  if (playerHand === computerHand) {
    return "draw";
  }

  const winConditions = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper",
  };

  return winConditions[playerHand] === computerHand ? "win" : "lose";
};

const playGame = async (playerHand: HandType) => {
  if (isPlaying.value) return;

  isPlaying.value = true;

  // リセット
  gameState.playerHand = null;
  gameState.computerHand = null;
  gameState.result = null;

  // プレイヤーの手を表示
  gameState.playerHand = playerHand;

  // 少し遅延を入れてCPUの手を表示
  await new Promise((resolve) => setTimeout(resolve, 500));

  const computerHand = getRandomHand();
  gameState.computerHand = computerHand;

  // 結果を計算
  const result = getGameResult(playerHand, computerHand);
  gameState.result = result;

  // スコアを更新
  if (result === "win") {
    gameState.playerScore++;
  } else if (result === "lose") {
    gameState.computerScore++;
  } else {
    gameState.drawCount++;
  }

  // スコアをCookieに保存
  saveScoreToCookie();

  isPlaying.value = false;
};

// Cookieへのスコア保存
const saveScoreToCookie = () => {
  const savedState: SavedGameState = {
    playerScore: gameState.playerScore,
    computerScore: gameState.computerScore,
    drawCount: gameState.drawCount,
  };
  saveGameStateToCookie(savedState);
};

// Cookieからスコアを読み込み
const loadScoreFromCookie = () => {
  const savedState = loadGameStateFromCookie();
  if (savedState) {
    gameState.playerScore = savedState.playerScore;
    gameState.computerScore = savedState.computerScore;
    gameState.drawCount = savedState.drawCount;
  }
};

const resetGame = () => {
  gameState.playerHand = null;
  gameState.computerHand = null;
  gameState.result = null;
};

const resetAllScores = () => {
  resetGame();
  gameState.playerScore = 0;
  gameState.computerScore = 0;
  gameState.drawCount = 0;
  // Cookieからも削除
  clearGameStateFromCookie();
};

// コンポーネントマウント時にCookieからスコアを読み込み
onMounted(() => {
  loadScoreFromCookie();
});

// スコアの変更を監視してCookieに保存
watch(
  () => [gameState.playerScore, gameState.computerScore, gameState.drawCount],
  () => {
    saveScoreToCookie();
  }
);
</script>

<style scoped>
.janken-game {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
}

.score-board {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 30px;
}

.score {
  display: flex;
  justify-content: space-around;
  font-size: 18px;
  font-weight: bold;
}

.game-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  min-height: 200px;
}

.player-section,
.computer-section {
  text-align: center;
  flex: 1;
}

.vs-section {
  text-align: center;
  flex: 0 0 120px;
}

.vs {
  font-size: 24px;
  font-weight: bold;
  color: #666;
  margin-bottom: 10px;
}

.hand-display {
  width: 120px;
  height: 120px;
  margin: 20px auto;
  border: 3px solid #ddd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.hand-display.active {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.hand {
  font-size: 32px;
  font-weight: bold;
  padding: 20px;
  border-radius: 10px;
  color: white;
}

.hand-rock {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
}

.hand-paper {
  background: linear-gradient(135deg, #4169e1 0%, #6495ed 100%);
}

.hand-scissors {
  background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
}

.hand-placeholder {
  font-size: 48px;
  color: #ccc;
}

.result {
  font-size: 20px;
  font-weight: bold;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.result-win {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
}

.result-lose {
  background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
  color: white;
}

.result-draw {
  background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
  color: white;
}

.controls {
  text-align: center;
}

.hand-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.hand-button {
  padding: 15px 25px;
  font-size: 18px;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: white;
  min-width: 100px;
}

.hand-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.hand-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.hand-button.hand-rock {
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 100%);
}

.hand-button.hand-paper {
  background: linear-gradient(135deg, #4169e1 0%, #6495ed 100%);
}

.hand-button.hand-scissors {
  background: linear-gradient(135deg, #dc143c 0%, #ff6347 100%);
}

.reset-button {
  padding: 12px 24px;
  font-size: 16px;
  background: linear-gradient(135deg, #666 0%, #888 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s ease;
}

.reset-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.reset-all-button {
  padding: 12px 24px;
  font-size: 16px;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  margin-left: 10px;
  transition: all 0.3s ease;
}

.reset-all-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

h3 {
  color: #555;
  margin-bottom: 15px;
}

@media (max-width: 600px) {
  .game-area {
    flex-direction: column;
    gap: 20px;
  }

  .hand-buttons {
    flex-direction: column;
    align-items: center;
  }

  .score {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
