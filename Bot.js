let TARGET_BOARD;
let TARGET_BOARD_ROW;
let TARGET_BOARD_COLUMN;
let cornerCells;
let target_board_data;
let cellGroupDensity;
let cellsOpenedHistory;

function resetBot() {
    TARGET_BOARD = document.querySelector(".board");
    const target_board_prop = TARGET_BOARD.getAttribute("style");
    TARGET_BOARD_ROW = Number(target_board_prop.slice(0, target_board_prop.indexOf("row") + 8).match(/\d/g).join(''));
    TARGET_BOARD_COLUMN = Number(target_board_prop.slice(target_board_prop.indexOf("column"), target_board_prop.indexOf("column") + 11).match(/\d/g).join(''));
    cornerCells = getFirstCells();
    target_board_data = [];
    cellGroupDensity = [[], [], [], [], [], [], [], [], []];
    cellsOpenedHistory = [];
    for (let i = 0; i < TARGET_BOARD_ROW; ++i) {
        let row_data = [];
        for (let j = 0; j < TARGET_BOARD_COLUMN; ++j)
            row_data.push({x: i, y: j, solved: false, number: -1});
        target_board_data.push(row_data);
    }
    startBot(Math.max(10, TARGET_BOARD_ROW * TARGET_BOARD_COLUMN / 200));
}

function clicker(cellOnScreen) {
    try {cellOnScreen.click();}
    catch {return;};
}

function rightClicker(cellOnScreen) {
    let event = cellOnScreen.ownerDocument.createEvent('MouseEvents');
    event.initMouseEvent('contextmenu', true, true,
                        cellOnScreen.ownerDocument.defaultView, 1, 0, 0, 0, 0, false,
                        false, false, false, 2, null);
    return !cellOnScreen.dispatchEvent(event);
}

function getCellNumber(cellOnScreen) {
    return Number(cellOnScreen.getAttribute("style").charAt(cellOnScreen.getAttribute("style").indexOf(".svg") - 1));
}

function getFirstCells() {
    return [TARGET_BOARD.children[0], TARGET_BOARD.children[TARGET_BOARD_COLUMN - 1],
            TARGET_BOARD.children[(TARGET_BOARD_ROW - 1) * TARGET_BOARD_COLUMN],
            TARGET_BOARD.children[TARGET_BOARD_ROW * TARGET_BOARD_COLUMN - 1]];
    return [TARGET_BOARD.children[15 * 30 + 29]];
}

function startBot(delay) {
    let index = 0;
    let openFirstCells = setInterval(() => {
        clicker(cornerCells[index]);
        if (index === cornerCells.length - 1 || getCellNumber(cornerCells[index]) === 0) {
            clearInterval(openFirstCells);
        }
        ++index;
    }, delay);
    index = 0;
    let runBot = setInterval(() => {
        console.log("running");
        if (index % 7 === 0) scanBoard(0);
        else if (index % 7 === 1) {
            getAdjacentUnsolved();
            //console.log("step1");
        }
        else if (index % 7 === 2) {
            partitionDensityGroup();
            //console.log("step2");
        }
        else if (index % 7 === 3) {
            partitionDensityGroup();
            //console.log("step2");
        }
        else if (index % 7 === 4) {flagMines();
            //console.log("step3");
        }
        else if (index % 7 === 5) {
            openSafeCells();
            //console.log("step4");
        }
        else {
            if (GAME_END) clearInterval(runBot);
            if (cellsOpenedHistory.length > 21) cellsOpenedHistory.splice(0, 1);
            cellsOpenedHistory.push(cellsOpened);
            if (index > 84 && cellsOpenedHistory[0] === cellsOpenedHistory[cellsOpenedHistory.length - 1]) {
                clearInterval(runBot);
            }
        }
        ++index;
    }, delay * 5);
}

function scanBoard(delay) {
    let index = 0;
    let scan = setInterval(() => {
        let currentCell;
        try {currentCell = target_board_data[Math.floor(index / TARGET_BOARD_COLUMN)][index % TARGET_BOARD_COLUMN];}
        catch {return;};
        if (currentCell.solved) {
            ++index;
            return;
        }
        if (TARGET_BOARD.children[index].getAttribute("data-status") === "open")
            currentCell.number = getCellNumber(TARGET_BOARD.children[index]);
        else if (TARGET_BOARD.children[index].getAttribute("data-status") === "flag") {
            currentCell.solved = true;
            currentCell.number = -1;
        }
        if (currentCell.number === 0) currentCell.solved = true;
        if (index === TARGET_BOARD_ROW * TARGET_BOARD_COLUMN - 1) {
            clearInterval(scan);
        }
        ++index;
    }, delay);
}

function getAdjacentCells(board, cell) {
    let adjacentCells = [];
    for (let dx = -1; dx <= 1; ++dx) {
        for (let dy = -1; dy <= 1; ++dy) {
            const tempCell = board[cell.x + dx]?.[cell.y + dy];
            if (tempCell && (dx !== 0 || dy !== 0)) adjacentCells.push(tempCell);
        }
    }
    return adjacentCells;
}

function getAdjacentUnsolved() {
    cellGroupDensity = [[], [], [], [], [], [], [], [], []];
    for (let i = 0; i < TARGET_BOARD_ROW; ++i) {
        for (let j = 0; j < TARGET_BOARD_COLUMN; ++j) {
            if (target_board_data[i][j].number <= 0) continue;
            let closedCells = getAdjacentCells(target_board_data, target_board_data[i][j]).filter(c => c.number === -1);
            let unsolvedCells = closedCells.filter(c => !c.solved);
            unsolvedCells.splice(0, 0, target_board_data[i][j]);
            cellGroupDensity[target_board_data[i][j].number - (closedCells.length - unsolvedCells.length + 1)].push(unsolvedCells);
        }
    }
    //console.log(cellGroupDensity);
}

function getRelatedCells(board, cell) {
    let relatedCells = [];
    for (let dx = -2; dx <= 2; ++dx) {
        for (let dy = -2; dy <= 2; ++dy) {
            const tempCell = board[cell.x + dx]?.[cell.y + dy];
            if (tempCell) relatedCells.push(tempCell);
        }
    }
    return relatedCells;
}

function cellIntersection(a, b) {
    let a_temp = [];
    let b_temp = [];
    for (let i = 1; i < a.length; ++i) a_temp.push(a[i]);
    for (let i = 1; i < b.length; ++i) b_temp.push(b[i]);
    let intersection = [];
    a_temp.forEach(cell => {
        // let tempIndex = binaryPositionSearch(b_temp, cell);
        // if (tempIndex === -1) return;
        // if (comparePositions(b_temp[tempIndex], cell) === 0) intersection.push(cell);
        if (b_temp.includes(cell)) intersection.push(cell);
    });
    return intersection;
}

function cellSearchInDensityGroup(group, cell) {
    let left = 0, right = group.length - 1;
    if (right === -1) return -1;
    if (comparePositions(cell, group[0][0]) === -1) return -1;
    if (comparePositions(cell, group[right][0]) === 1) return right;
    while (right - left > 1) {
        let mid = (left + right) >>> 1;
        if (comparePositions(cell, group[mid][0]) == 1) left = mid;
        else right = mid;
    }
    return (comparePositions(group[right][0], cell) === 0) ? right : left;
}

function partitionDensityGroup() {
    let cellGroupDensityTemp = [[], [], [], [], [], [], [], [], []];
    /* for (let i = 8; i >= 1; --i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            let cellGroupHigh = cellGroupDensity[i][i2];
            
            let relatedCells = getRelatedCells(target_board_data, cellGroupHigh[0]);
            for (let j = i - 1; j >= 1; --j) {
                relatedCells.forEach(rcell => {
                    let tempIndex = cellSearchInDensityGroup(cellGroupDensity[j], rcell);
                    if (tempIndex > -1 && tempIndex < cellGroupDensity[j].length) {
                        if (comparePositions(cellGroupDensity[j][tempIndex][0], rcell) === 0) {
                            let cellGroupLow = cellGroupDensity[j][tempIndex];
                            let sharedCells = cellIntersection(cellGroupHigh, cellGroupLow);
                            if (cellGroupHigh[0].x === 12 && cellGroupHigh[0].y === 22)
                                console.log(cellGroupLow, cellGroupHigh);
                            if (sharedCells.length === cellGroupLow.length - 1) {
                                let cellDifference = [];
                                for (let k = 0; k < cellGroupHigh.length; ++k) {
                                    if (!sharedCells.includes(cellGroupHigh[k]))
                                        cellDifference.push(cellGroupHigh[k]);
                                }
                                cellGroupDensityTemp[i - j].push(cellDifference);
                            }
                        }
                    }
                });
            }
        }
    } */
    for (let i = 8; i >= 1; --i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            for (let j = i - 1; j >= 1; --j) {
                for (let j2 = 0; j2 < cellGroupDensity[j].length; ++j2) {
                    let cellGroupHigh = cellGroupDensity[i][i2];
                    let cellGroupLow = cellGroupDensity[j][j2];
                    let sharedCells = cellIntersection(cellGroupHigh, cellGroupLow);
                    if (sharedCells.length === cellGroupLow.length - 1) {
                        let cellDifference = [];
                        for (let k = 0; k < cellGroupHigh.length; ++k) {
                            if (!sharedCells.includes(cellGroupHigh[k]))
                                cellDifference.push(cellGroupHigh[k]);
                        }
                        cellGroupDensityTemp[i - j].push(cellDifference);
                    }
                }
            }
        }
    }
    for (let i = 1; i <= 8; ++i) {
        cellGroupDensityTemp[i].forEach(cellGroup => {
            cellGroupDensity[i].splice(cellSearchInDensityGroup(cellGroupDensity[i], cellGroup[0]) + 1, 0, cellGroup);
        });
    }
}

function flagMines() {
    for (let i = 1; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            let cellGroup = cellGroupDensity[i][i2];
            if (cellGroup.length === i + 1) {
                for (let j = 0; j < cellGroup.length; ++j) {
                    if (j > 0 && !target_board_data[cellGroup[j].x][cellGroup[j].y].solved)
                        rightClicker(TARGET_BOARD.children[cellGroup[j].x * TARGET_BOARD_COLUMN + cellGroup[j].y]);
                    target_board_data[cellGroup[j].x][cellGroup[j].y].solved = true;
                }
                cellGroupDensity[i].splice(cellGroupDensity[i].indexOf(cellGroup), 1);
                --i2;
            }
        }
    }
    for (let i = 1; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            let cellGroupLow = cellGroupDensity[i][i2];
            let relatedCells = getRelatedCells(target_board_data, cellGroupLow[0]);
            for (let j = i + 1; j <= 8; ++j) {
                relatedCells.forEach(rcell => {
                    let tempIndex = cellSearchInDensityGroup(cellGroupDensity[j], rcell);
                    if (tempIndex > -1 && tempIndex < cellGroupDensity[j].length) {
                        if (comparePositions(cellGroupDensity[j][tempIndex][0], rcell) === 0) {
                            let cellGroupHigh = cellGroupDensity[j][tempIndex];
                            let sharedCells = cellIntersection(cellGroupHigh, cellGroupLow);
                            if (j - i + 1 === cellGroupHigh.length - sharedCells.length) {
                                cellGroupHigh.filter(c => !sharedCells.includes(c)).forEach(cell => {
                                    if (!target_board_data[cell.x][cell.y].solved)
                                        rightClicker(TARGET_BOARD.children[cell.x * TARGET_BOARD_COLUMN + cell.y]);
                                        target_board_data[cell.x][cell.y].solved = true;
                                });
                            }
                        }
                    }
                });
            }
        }
    }
    /* for (let i = 1; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            for (let j = i + 1; j <= 8; ++j) {
                for (let j2 = 0; j2 < cellGroupDensity[j].length; ++j2) {
                    let cellGroupLow = cellGroupDensity[i][i2];
                    let cellGroupHigh = cellGroupDensity[j][j2];
                    let sharedCells = cellIntersection(cellGroupHigh, cellGroupLow);
                    if (j - i + 1 === cellGroupHigh.length - sharedCells.length) {
                        cellGroupHigh.filter(c => !sharedCells.includes(c)).forEach(cell => {
                            if (!target_board_data[cell.x][cell.y].solved)
                                rightClicker(TARGET_BOARD.children[cell.x * TARGET_BOARD_COLUMN + cell.y]);
                                target_board_data[cell.x][cell.y].solved = true;
                        });
                    }
                }
            }
        }
    } */
}

function openSafeCells() {
    for (let i = 0; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            let cellGroup = cellGroupDensity[i][i2];
            if (i === cellGroup.filter(c => (c.solved && c.number === -1)).length) {
                clicker(TARGET_BOARD.children[cellGroup[0].x * TARGET_BOARD_COLUMN + cellGroup[0].y]);
                target_board_data[cellGroup[0].x][cellGroup[0].y].solved = true;
                cellGroupDensity[i].splice(cellGroupDensity[i].indexOf(cellGroup), 1);
                --i2;
            }
        }
    }
    for (let i = 1; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            let cellGroup1 = cellGroupDensity[i][i2];
            let relatedCells = getRelatedCells(target_board_data, cellGroup1[0]);
            relatedCells.forEach(rcell => {
                let tempIndex = cellSearchInDensityGroup(cellGroupDensity[i], rcell);
                if (tempIndex > -1 && tempIndex < cellGroupDensity[i].length) {
                    if (comparePositions(cellGroupDensity[i][tempIndex][0], rcell) === 0) {
                        let cellGroup2 = cellGroupDensity[i][tempIndex];
                        let sharedCells = cellIntersection(cellGroup1, cellGroup2);
                        if (sharedCells.length === Math.min(cellGroup1.length, cellGroup2.length) - 1) {
                            if (cellGroup1.length < cellGroup2.length) {
                                cellGroup2.filter(c => !sharedCells.includes(c)).forEach(cell => {
                                    clicker(TARGET_BOARD.children[cell.x * TARGET_BOARD_COLUMN + cell.y]);
                                });
                            }
                            else {
                                cellGroup1.filter(c => !sharedCells.includes(c)).forEach(cell => {
                                    clicker(TARGET_BOARD.children[cell.x * TARGET_BOARD_COLUMN + cell.y]);
                                });
                            }
                        }
                    }
                }
            });
        }
    }
    /* for (let i = 1; i <= 8; ++i) {
        for (let i2 = 0; i2 < cellGroupDensity[i].length; ++i2) {
            for (let j2 = i2; j2 < cellGroupDensity[i].length; ++j2) {
                let cellGroup1 = cellGroupDensity[i][i2];
                let cellGroup2 = cellGroupDensity[i][j2];
                let sharedCells = cellIntersection(cellGroup1, cellGroup2);
                if (sharedCells.length === Math.min(cellGroup1.length, cellGroup2.length) - 1) {
                    if (cellGroup1.length < cellGroup2.length) {
                        cellGroup2.filter(c => !sharedCells.includes(c)).forEach(cell => {
                            clicker(TARGET_BOARD.children[cell.x * COLUMN + cell.y]);
                        });
                    }
                    else {
                        cellGroup1.filter(c => !sharedCells.includes(c)).forEach(cell => {
                            clicker(TARGET_BOARD.children[cell.x * COLUMN + cell.y]);
                        });
                    }
                }
            }
        }
    } */
}