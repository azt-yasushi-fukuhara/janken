export type HandType = 'rock' | 'paper' | 'scissors'

export type GameResult = 'win' | 'lose' | 'draw'

export interface GameState {
  playerHand: HandType | null
  computerHand: HandType | null
  result: GameResult | null
  playerScore: number
  computerScore: number
  drawCount: number
}
