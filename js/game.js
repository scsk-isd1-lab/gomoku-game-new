/**
 * 五目並べ (Gomoku) ゲームロジック
 */

// ゲームの初期化
document.addEventListener('DOMContentLoaded', initGame);

// ゲームボードとゲーム状態を保持する変数
let board = [];
let gameState = {
    currentPlayer: 1,  // 1: 黒, 2: 白
    isGameOver: false,
    winner: null,      // null: ゲーム継続中, 1: 黒の勝利, 2: 白の勝利, 3: 引き分け
    moves: 0           // 総手数
};

// ボードサイズ
const BOARD_SIZE = 15;

// 勝利判定用の方向ベクトル（8方向）
const DIRECTIONS = [
    [0, 1],   // 右
    [1, 1],   // 右下
    [1, 0],   // 下
    [1, -1],  // 左下
    [0, -1],  // 左
    [-1, -1], // 左上
    [-1, 0],  // 上
    [-1, 1]   // 右上
];

/**
 * ゲームの初期化関数
 */
function initGame() {
    createBoard();
    resetGame();
    
    // リセットボタンのイベントリスナーを設定
    document.getElementById('reset-button').addEventListener('click', resetGame);
}

/**
 * ゲームボードの作成
 */
function createBoard() {
    const boardElement = document.getElementById('board');
    
    // すでに存在する場合はクリア
    boardElement.innerHTML = '';
    
    // セルの作成と配置
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // クリックイベントの設定
            cell.addEventListener('click', () => handleCellClick(x, y));
            
            // 石を表示するための内部要素
            const stone = document.createElement('div');
            stone.className = 'stone';
            cell.appendChild(stone);
            
            boardElement.appendChild(cell);
        }
    }
}

/**
 * ゲームのリセット
 */
function resetGame() {
    // ボード状態の初期化（15x15の2次元配列、全て0=空きマス）
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    
    // ゲーム状態の初期化
    gameState = {
        currentPlayer: 1, // 黒から開始
        isGameOver: false,
        winner: null,
        moves: 0
    };
    
    // UI状態のリセット
    updateUI();
    
    // 結果表示をクリア
    document.getElementById('game-result').textContent = '';
    
    // すべてのセルをリセット
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.className = 'cell';
    });
}

/**
 * セルクリック時の処理
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function handleCellClick(x, y) {
    // ゲーム終了時またはすでに石が置かれている場合は何もしない
    if (gameState.isGameOver || board[y][x] !== 0) {
        return;
    }
    
    // 石を配置
    board[y][x] = gameState.currentPlayer;
    gameState.moves++;
    
    // UI更新
    updateCellUI(x, y);
    
    // 勝利判定
    if (checkWin(x, y)) {
        gameState.isGameOver = true;
        gameState.winner = gameState.currentPlayer;
        displayGameResult(`${getPlayerName(gameState.currentPlayer)}の勝利！`);
        return;
    }
    
    // 引き分け判定（全マス埋まった）
    if (gameState.moves === BOARD_SIZE * BOARD_SIZE) {
        gameState.isGameOver = true;
        gameState.winner = 3; // 引き分け
        displayGameResult('引き分けです！');
        return;
    }
    
    // 手番交代
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    updateUI();
}

/**
 * 勝利判定
 * @param {number} x - 最後に置かれた石のX座標
 * @param {number} y - 最後に置かれた石のY座標
 * @returns {boolean} 勝利条件を満たすかどうか
 */
function checkWin(x, y) {
    const player = board[y][x];
    
    // 8方向それぞれについて5連を確認
    for (let i = 0; i < DIRECTIONS.length; i += 2) {
        // 相反する2方向の組み合わせでカウント（例：右と左）
        const dir1 = DIRECTIONS[i];
        const dir2 = DIRECTIONS[i + 1];
        
        // 2方向の石の数を合計（置いた石自体も含むので初期値1）
        let count = 1;
        
        // 1つ目の方向をカウント
        count += countStonesInDirection(x, y, dir1[0], dir1[1], player);
        
        // 2つ目の方向をカウント
        count += countStonesInDirection(x, y, dir2[0], dir2[1], player);
        
        // 5つ以上連続していたら勝利
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

/**
 * 特定の方向に連続する同じ色の石をカウント
 * @param {number} x - 開始X座標
 * @param {number} y - 開始Y座標
 * @param {number} dx - X方向の増分
 * @param {number} dy - Y方向の増分
 * @param {number} player - プレイヤー（1: 黒, 2: 白）
 * @returns {number} 連続する同じ色の石の数
 */
function countStonesInDirection(x, y, dx, dy, player) {
    let count = 0;
    let currentX = x + dx;
    let currentY = y + dy;
    
    // ボード内で同じプレイヤーの石が続く限りカウント
    while (
        currentX >= 0 && currentX < BOARD_SIZE &&
        currentY >= 0 && currentY < BOARD_SIZE &&
        board[currentY][currentX] === player
    ) {
        count++;
        currentX += dx;
        currentY += dy;
    }
    
    return count;
}

/**
 * セルのUI更新
 * @param {number} x - X座標
 * @param {number} y - Y座標
 */
function updateCellUI(x, y) {
    const cellElement = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
    
    if (cellElement) {
        // 現在のプレイヤーに応じてクラスを追加
        const playerClass = gameState.currentPlayer === 1 ? 'black' : 'white';
        cellElement.classList.add(playerClass);
    }
}

/**
 * ゲームUIの更新
 */
function updateUI() {
    const playerElement = document.getElementById('current-player');
    
    // 現在のプレイヤー表示を更新
    if (playerElement) {
        playerElement.textContent = getPlayerName(gameState.currentPlayer);
        playerElement.className = `player ${gameState.currentPlayer === 1 ? 'black' : 'white'}`;
    }
}

/**
 * ゲーム結果表示
 * @param {string} message - 表示するメッセージ
 */
function displayGameResult(message) {
    const resultElement = document.getElementById('game-result');
    if (resultElement) {
        resultElement.textContent = message;
    }
}

/**
 * プレイヤー名の取得
 * @param {number} player - プレイヤー番号（1: 黒, 2: 白）
 * @returns {string} プレイヤー名
 */
function getPlayerName(player) {
    return player === 1 ? '黒' : '白';
}