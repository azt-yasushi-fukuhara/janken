// Cookie管理のためのユーティリティ関数

export const setCookie = (
  name: string,
  value: string,
  days: number = 30
): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

export const deleteCookie = (name: string): void => {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// ゲーム状態をCookieに保存・読み込みする関数
export interface SavedGameState {
  playerScore: number;
  computerScore: number;
  drawCount: number;
}

export const saveGameStateToCookie = (gameState: SavedGameState): void => {
  const stateString = JSON.stringify(gameState);
  setCookie("janken-game-state", stateString, 365); // 1年間保存
};

export const loadGameStateFromCookie = (): SavedGameState | null => {
  const stateString = getCookie("janken-game-state");
  if (stateString) {
    try {
      return JSON.parse(stateString) as SavedGameState;
    } catch (error) {
      console.error("Failed to parse game state from cookie:", error);
      return null;
    }
  }
  return null;
};

export const clearGameStateFromCookie = (): void => {
  deleteCookie("janken-game-state");
};
