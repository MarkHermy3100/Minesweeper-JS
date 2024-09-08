const TILE_STATE = {
    CLOSED: "closed",
    OPEN: "open",
    MINE: "mine",
    FLAGGED: "flagged",
    SKIMMED: "skimmed"
};

let ROW = 10;
let COLUMN = 10;
let MINES = 10;
let TILE_SIZE = "32px";
let GAME_START = false;
let GAME_END = false;
let cellsOpened = 0;

function resetBoard() {
    let widthOnScreen = document.querySelector("#width");
    let heightOnScreen = document.querySelector("#height");
    let minesOnScreen = document.querySelector("#mines");
    if (Number(widthOnScreen.value) < 1 || Number(heightOnScreen.value) < 1 || Number(minesOnScreen.value) < 1) {
        widthOnScreen.value = COLUMN;
        heightOnScreen.value = ROW;
        minesOnScreen.value = MINES;
        alert("Board invalid");
        return;
    }
    if (Number(widthOnScreen.value) > 100 || Number(heightOnScreen.value) > 100) {
        widthOnScreen.value = COLUMN;
        heightOnScreen.value = ROW;
        minesOnScreen.value = MINES;
        alert("Board dimensions cannot be more than 100");
        return;
    }
    if (Number(minesOnScreen.value) >= Number(widthOnScreen.value) * Number(heightOnScreen.value)) {
        widthOnScreen.value = COLUMN;
        heightOnScreen.value = ROW;
        minesOnScreen.value = MINES;
        alert("Board has too many mines");
        return;
    }
    COLUMN = widthOnScreen.value;
    ROW = heightOnScreen.value;
    MINES = minesOnScreen.value;
    cellsOpened = 0;

    initializeBoard();
}

function drawBoard(row, column, mines) {
    let board = [];
    //let minePositions = chooseMinePositions(row, column, mines);
    //let mineIndex = 0;
    for (let i = 0; i < row; ++i) {
        let row = [];
        for (let j = 0; j < column; ++j) {
            const tileOnScreen = document.createElement("div");
            tileOnScreen.setAttribute("id", 'c' + (j + i * column).toString());
            tileOnScreen.dataset.status = TILE_STATE.CLOSED;
            tileOnScreen.style.setProperty("background-size", TILE_SIZE);
            const tile = {tileOnScreen, x: i, y: j,
            mine: false,
            get status() {
                return this.tileOnScreen.dataset.status;
            },
            set status(value) {
                this.tileOnScreen.dataset.status = value;
            }};
            row.push(tile);
            //if (comparePositions(minePositions[mineIndex], {x: i, y: j}) === 0) ++mineIndex;
            //if (mineIndex === mines) --mineIndex;
        }
        board.push(row);
    }
    return board;
}

function placeMines(board, mines, first_click) {
    let minePositions = chooseMinePositions(board.length, board[0].length, mines, first_click);
    let mineIndex = 0;
    for (let i = 0; i < board.length; ++i) {
        for (let j = 0; j < board[0].length; ++j) {
            let tile = board[i][j];
            tile.mine = (comparePositions(minePositions[mineIndex], {x: i, y: j}) === 0);
            if (comparePositions(minePositions[mineIndex], {x: i, y: j}) === 0) ++mineIndex;
            if (mineIndex >= mines) return board;
        }
    }
    return board;
}

function chooseMinePositions(row, column, mines, first_click) {
    let positions = [];
    while (positions.length < mines) {
        const position = {
            x: Math.floor(Math.random() * row),
            y: Math.floor(Math.random() * column)
        };
        if (positions.length === 0) {
            positions.push(position);
            continue;
        }
        if (comparePositions(position, first_click) === 0) continue;
        let tempIndex = binaryPositionSearch(positions, position);
        if (tempIndex === -1) {
            positions.splice(tempIndex + 1, 0, position);
        } else if (comparePositions(positions[tempIndex], position) !== 0) {
            positions.splice(tempIndex + 1, 0, position);
        }
        
    }
    /* positions.push({x: 0, y: 0});
    positions.push({x: 0, y: 3});
    positions.push({x: 0, y: 4});
    positions.push({x: 0, y: 19});
    positions.push({x: 0, y: 24});
    positions.push({x: 1, y: 6});
    positions.push({x: 1, y: 20});
    positions.push({x: 2, y: 0});
    positions.push({x: 2, y: 2});
    positions.push({x: 2, y: 7});
    positions.push({x: 2, y: 9});
    positions.push({x: 2, y: 12});
    positions.push({x: 2, y: 23});
    positions.push({x: 2, y: 25});
    positions.push({x: 2, y: 26});
    positions.push({x: 3, y: 0});
    positions.push({x: 3, y: 9});
    positions.push({x: 3, y: 11});
    positions.push({x: 3, y: 12});
    positions.push({x: 3, y: 13});
    positions.push({x: 3, y: 17});
    positions.push({x: 3, y: 20});
    positions.push({x: 3, y: 26});
    positions.push({x: 4, y: 4});
    positions.push({x: 4, y: 16});
    positions.push({x: 4, y: 21});
    positions.push({x: 4, y: 25});
    positions.push({x: 4, y: 28});
    positions.push({x: 5, y: 0});
    positions.push({x: 5, y: 2});
    positions.push({x: 5, y: 6});
    positions.push({x: 5, y: 7});
    positions.push({x: 5, y: 9});
    positions.push({x: 5, y: 21});
    positions.push({x: 5, y: 27});
    positions.push({x: 6, y: 0});
    positions.push({x: 6, y: 1});
    positions.push({x: 6, y: 5});
    positions.push({x: 6, y: 9});
    positions.push({x: 6, y: 10});
    positions.push({x: 6, y: 11});
    positions.push({x: 6, y: 15});
    positions.push({x: 6, y: 16});
    positions.push({x: 6, y: 18});
    positions.push({x: 6, y: 19});
    positions.push({x: 6, y: 26});
    positions.push({x: 6, y: 27});
    positions.push({x: 7, y: 0});
    positions.push({x: 7, y: 3});
    positions.push({x: 7, y: 7});
    positions.push({x: 7, y: 10});
    positions.push({x: 7, y: 20});
    positions.push({x: 7, y: 22});
    positions.push({x: 7, y: 27});
    positions.push({x: 8, y: 10});
    positions.push({x: 8, y: 14});
    positions.push({x: 8, y: 18});
    positions.push({x: 8, y: 21});
    positions.push({x: 9, y: 2});
    positions.push({x: 9, y: 3});
    positions.push({x: 9, y: 7});
    positions.push({x: 9, y: 14});
    positions.push({x: 9, y: 16});
    positions.push({x: 9, y: 19});
    positions.push({x: 9, y: 20});
    positions.push({x: 9, y: 24});
    positions.push({x: 9, y: 26});
    positions.push({x: 10, y: 8});
    positions.push({x: 10, y: 9});
    positions.push({x: 10, y: 10});
    positions.push({x: 10, y: 18});
    positions.push({x: 10, y: 19});
    positions.push({x: 10, y: 23});
    positions.push({x: 10, y: 26});
    positions.push({x: 11, y: 0});
    positions.push({x: 11, y: 8});
    positions.push({x: 11, y: 11});
    positions.push({x: 11, y: 14});
    positions.push({x: 11, y: 18});
    positions.push({x: 11, y: 21});
    positions.push({x: 12, y: 12});
    positions.push({x: 12, y: 16});
    positions.push({x: 13, y: 1});
    positions.push({x: 13, y: 2});
    positions.push({x: 13, y: 10});
    positions.push({x: 13, y: 11});
    positions.push({x: 13, y: 14});
    positions.push({x: 13, y: 23});
    positions.push({x: 13, y: 24});
    positions.push({x: 14, y: 5});
    positions.push({x: 14, y: 9});
    positions.push({x: 14, y: 11});
    positions.push({x: 14, y: 17});
    positions.push({x: 14, y: 24});
    positions.push({x: 15, y: 1});
    positions.push({x: 15, y: 10});
    positions.push({x: 15, y: 11});
    positions.push({x: 15, y: 18});
    positions.push({x: 15, y: 19});
    positions.push({x: 15, y: 21});
    positions.push({x: 16, y: 2});
    positions.push({x: 16, y: 3});
    positions.push({x: 16, y: 6});
    positions.push({x: 16, y: 17});
    positions.push({x: 16, y: 23});
    positions.push({x: 17, y: 1});
    positions.push({x: 17, y: 18});
    positions.push({x: 17, y: 21});
    positions.push({x: 17, y: 24});
    positions.push({x: 17, y: 26});
    positions.push({x: 18, y: 1});
    positions.push({x: 18, y: 6});
    positions.push({x: 18, y: 9});
    positions.push({x: 18, y: 12});
    positions.push({x: 18, y: 14});
    positions.push({x: 18, y: 18});
    positions.push({x: 18, y: 27});
    positions.push({x: 18, y: 29});
    positions.push({x: 19, y: 4});
    positions.push({x: 19, y: 8});
    positions.push({x: 19, y: 11});
    positions.push({x: 19, y: 12});
    positions.push({x: 19, y: 13});
    positions.push({x: 19, y: 14});
    positions.push({x: 19, y: 16});
    positions.push({x: 19, y: 21});
    positions.push({x: 19, y: 23});
    positions.push({x: 19, y: 25});
    positions.push({x: 19, y: 26});
    positions.push({x: 19, y: 27}); */
    return positions;
}

function comparePositions(a, b) {
    if (a.x === b.x) {
        if (a.y === b.y) return 0;
        return (a.y < b.y) ? -1 : 1;
    }
    return (a.x < b.x) ? -1 : 1;
}

function binaryPositionSearch(positions, p) {
    let left = 0, right = positions.length - 1;
    if (comparePositions(p, positions[0]) === -1) return -1;
    if (comparePositions(p, positions[right]) === 1) return right;
    while (right - left > 1) {
        let mid = (left + right) >>> 1;
        if (comparePositions(p, positions[mid]) == 1) left = mid;
        else right = mid;
    }
    return (comparePositions(positions[right], p) === 0) ? right : left;
}

function flagTile(tile, minesLeft) {
    if (GAME_END) return minesLeft;
    if (tile.status !== TILE_STATE.CLOSED && tile.status !== TILE_STATE.FLAGGED)
        return minesLeft;
    if (tile.status === TILE_STATE.CLOSED) {
        tile.status = TILE_STATE.FLAGGED;
        --minesLeft;
    }
    else if (tile.status === TILE_STATE.FLAGGED) {
        tile.status = TILE_STATE.CLOSED;
        ++minesLeft;
    }
    return minesLeft
}

function openTile(tile, clicked) {
    if (GAME_END) return;

    if (tile.status === TILE_STATE.FLAGGED) return;
    
    if (tile.mine) {
        tile.status = TILE_STATE.MINE;
        tile.tileOnScreen.style.setProperty("background-image", "url(./Assets/mine_red.svg)");
        lose();
        return;
    }

    const adjacentTiles = getAdjacentTiles(board, tile);
    const adjacentMines = adjacentTiles.filter(t => t.mine);
    if (tile.status === TILE_STATE.CLOSED) {
        tile.status = TILE_STATE.OPEN;
        ++cellsOpened;
        if (adjacentMines.length === 0) {
            //adjacentTiles.forEach(t => openTile(t, false));
            let queue = adjacentTiles.filter(t => t.status === TILE_STATE.CLOSED);
            queue.forEach(t => {t.status = TILE_STATE.OPEN});
            cellsOpened += queue.length;
            let firstIndex = 0;
            while (firstIndex < queue.length) {
                const nextAdjacentTiles = getAdjacentTiles(board, queue[firstIndex]).filter(t => t.status === TILE_STATE.CLOSED);
                const nextAdjacentMines = getAdjacentTiles(board, queue[firstIndex]).filter(t => t.mine);
                if (nextAdjacentMines.length === 0) {
                    nextAdjacentTiles.forEach(t => {
                        queue.push(t);
                        t.status = TILE_STATE.OPEN;
                        ++cellsOpened;
                    });
                }
                let tileNumber = "./Assets/type" + nextAdjacentMines.length.toString() + ".svg";
                queue[firstIndex].tileOnScreen.style.setProperty("background-image", "url(" + tileNumber + ")");
                ++firstIndex;
            }
        }
        let tileNumber = "./Assets/type" + adjacentMines.length.toString() + ".svg";
        tile.tileOnScreen.style.setProperty("background-image", "url(" + tileNumber + ")");
    }
    else if (tile.status === TILE_STATE.OPEN && clicked) {
        let adjacentFlags = adjacentTiles.filter(t => t.status === TILE_STATE.FLAGGED);
        if (adjacentFlags.length === adjacentMines.length) {
            adjacentTiles.forEach(t => openTile(t, false));
        }
    }
}

function getAdjacentTiles(board, tile) {
    let adjacentTiles = [];
    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            const tempTile = board[tile.x + dx]?.[tile.y + dy];
            if (tempTile && (dx !== 0 || dy !== 0)) adjacentTiles.push(tempTile);
        }
    }
    return adjacentTiles;
}

function win() {
    if (GAME_END) return;
    if (cellsOpened < ROW * COLUMN - MINES) return;
    setTimeout(() => { alert("😎"); }, 20);
    GAME_END = true;
}

function lose() {
    board.forEach(row => {
        row.forEach(tile => {
            if (tile.mine && tile.status === TILE_STATE.CLOSED) tile.status = TILE_STATE.MINE;
            else if (!tile.mine && tile.status === TILE_STATE.FLAGGED) tile.tileOnScreen.style.setProperty("background-image", "url(./Assets/flag_red.svg)")
        });
    });
    GAME_END = true;
}

function initializeBoard() {    
    board = drawBoard(ROW, COLUMN, MINES);
    minesLeft = MINES;
    while (boardOnScreen.firstChild) {
        boardOnScreen.removeChild(boardOnScreen.lastChild);
    }
    GAME_START = false;
    GAME_END = false;
    boardOnScreen.style.setProperty("--row", ROW);
    boardOnScreen.style.setProperty("--column", COLUMN);
    boardOnScreen.style.setProperty("--tile-size", TILE_SIZE);

    board.forEach(row => {
        row.forEach(tile => {
            boardOnScreen.append(tile.tileOnScreen);

            tile.tileOnScreen.addEventListener("click", () => {
                if (!GAME_START) {
                    GAME_START = true;
                    board = placeMines(board, MINES, {x: tile.x, y: tile.y});
                }
                openTile(tile, true);
                win();
            });

            tile.tileOnScreen.addEventListener("contextmenu", event => {
                event.preventDefault();
                minesLeft = flagTile(tile, minesLeft);
                minesLeftOnScreen.textContent = minesLeft.toString();
            });

            tile.tileOnScreen.addEventListener("mousedown", event => {
                if (event.button !== 0) return;
                if (tile.status !== TILE_STATE.CLOSED && tile.status !== TILE_STATE.OPEN) return;
                if (tile.status === TILE_STATE.CLOSED) {
                    tile.status = TILE_STATE.SKIMMED;
                } else {
                    getAdjacentTiles(board, tile).forEach(t => {
                        if (t.status !== TILE_STATE.CLOSED) return;
                        t.status = TILE_STATE.SKIMMED;
                    });
                }
            });

            document.addEventListener("mouseup", event => {
                if (event.button !== 0) return;
                if (tile.status !== TILE_STATE.SKIMMED) return;
                tile.status = TILE_STATE.CLOSED;
            });
        });
    });
    minesLeftOnScreen.textContent = minesLeft.toString();
}

let board = [];
const boardOnScreen = document.querySelector('.board');
let minesLeft = MINES;
const minesLeftOnScreen = document.querySelector("[data-mine-count]");
resetBoard();