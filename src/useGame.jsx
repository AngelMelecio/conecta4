import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const useGame = () => {
    return useContext(GameContext);
};

export const GameProvider = ({ children }) => {

    let IA_PIECE = 2
    let PLAYER_PIECE = 1
    let INF = 1e9

    const [tablero, setTablero] = useState(Array.from({ length: 6 }, () => Array(7).fill(0)))
    const [nextRow, setNextRow] = useState(Array(7).fill(5))

    const [turn, setTurn] = useState(null)
    const [player, setPlayer] = useState(PLAYER_PIECE)


    const winning = (board, piece) => {
        for (let r = 0; r < 6; r++) {
            for (let c = 0; c < 7; c++) {
                if (board[r][c] === 0) continue
                if (c + 3 < 7 &&
                    board[r][c] === piece &&
                    board[r][c + 1] === piece &&
                    board[r][c + 2] === piece &&
                    board[r][c + 3] === piece) {
                    return { winner: board[r][c], direction: 'right', end: true }
                }
                if (r + 3 < 6) {
                    if (board[r][c] === piece &&
                        board[r + 1][c] === piece &&
                        board[r + 2][c] === piece &&
                        board[r + 3][c] === piece) {
                        return { winner: board[r][c], direction: 'down', end: true }
                    }
                    if (c + 3 < 7 &&
                        board[r][c] === piece &&
                        board[r + 1][c + 1] === piece &&
                        board[r + 2][c + 2] === piece &&
                        board[r + 3][c + 3] === piece) {
                        return { winner: board[r][c], direction: 'diag-right', end: true }
                    }
                    if (c - 3 >= 0 &&
                        board[r][c] === piece &&
                        board[r + 1][c - 1] === piece &&
                        board[r + 2][c - 2] === piece &&
                        board[r + 3][c - 3] === piece) {
                        return { winner: board[r][c], direction: 'diag-left', end: true }
                    }
                }
            }
        }
        return ({ end: false })
    }


    function evaluate_window(window, piece) {
        let score = 0;
        let opp_piece = piece === PLAYER_PIECE ? IA_PIECE : PLAYER_PIECE

        if (window.filter(cell => cell === piece).length === 4) {
            score += 100
        }
        else if (window.filter(cell => cell === piece).length === 3
            && window.filter(cell => cell === 0).length === 1) {
            score += 5
        }
        else if (window.filter(cell => cell === piece).length === 2
            && window.filter(cell => cell === 0).length === 2) {
            score += 2
        }
        if (window.filter(cell => cell === opp_piece).length === 3
            && window.filter(cell => cell === 0).length === 1) {
            score -= 4
        }
        return score
    }

    function evaluate(board, piece) {
        let score = 0

        // Columna central
        let center_count = board.map(row => row[3]).filter(cell => cell === piece).length
        score += center_count * 3

        // Score horizontal 
        board.forEach(row => {
            for (let j = 0; j < 4; j++) {
                let window = row.slice(j, j + 3)
                score += evaluate_window(window, piece)
            }
        })

        // Score vertical
        for (let j = 0; j < 7; j++) {
            let col = board.map(row => row[j])
            for (let i = 0; i < 3; i++) {
                let window = col.slice(i, i + 3)
                score += evaluate_window(window, piece)
            }
        }

        // score diagonal right-down
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                let window = [board[i][j], board[i + 1][j + 1], board[i + 2][j + 2], board[i + 3][j + 3]]
                score += evaluate_window(window, piece)
            }
        }

        // score diagonal left-down
        for (let i = 0; i < 3; i++) {
            for (let j = 6; j > 2; j--) {
                let window = [board[i][j], board[i + 1][j - 1], board[i + 2][j - 2], board[i + 3][j - 3]]
                score += evaluate_window(window, piece)
            }
        }

        return score
    }

    function is_terminal(nxtRow) {
        let terminal = true
        for (let i = 0; i < 7; i++) {
            if (nxtRow[i] > 0) terminal = false
        }
        return terminal
    }

    function minimax(tab, nxtRow, depth, alpha, beta, maximizingPlayer) {

       // console.log('depht:', depth, ' isMaximazing:', maximizingPlayer)
        //tab.forEach(row => console.log(row))

        if (winning(tab, IA_PIECE).end)
            return [null, INF]
        if (winning(tab, PLAYER_PIECE).end)
            return [null, -INF]
        if (is_terminal(nxtRow))
            return [null, 0]
        if (depth === 0)
            return [null, evaluate(tab, IA_PIECE)]

        if (maximizingPlayer) {
            let value = -INF
            let column = -1
            for (let j = 0; j < 7; j++) {
                let i = nxtRow[j]
                if (i < 0) continue
                let newTab = tab.map(row => [...row])
                let newNxtRow = [...nxtRow]
                newTab[i][j] = IA_PIECE
                newNxtRow[j]--
                let newScore = minimax(newTab, newNxtRow, depth - 1, alpha, beta, false)[1]
                if (newScore > value) {
                    value = newScore
                    column = j
                }
                alpha = Math.max(alpha, value)
                if (alpha >= beta) break
            }
            return [column, value]
        }
        else {
            let value = INF
            let column = -1
            for (let j = 0; j < 7; j++) {
                let i = nxtRow[j]
                if (i < 0) continue
                let newTab = tab.map(row => [...row])
                let newNxtRow = [...nxtRow]
                newTab[i][j] = PLAYER_PIECE
                newNxtRow[j]--
                let newScore = minimax(newTab, newNxtRow, depth - 1, alpha, beta, true)[1]
                if (newScore < value) {
                    value = newScore
                    column = j
                }
                beta = Math.min(beta, value)
                if (alpha >= beta) break
            }
            return [column, value]
        }

    }



    return (
        <GameContext.Provider
            value={{
                IA_PIECE,
                PLAYER_PIECE,
                tablero, setTablero,
                nextRow, setNextRow,
                turn, setTurn,
                player, setPlayer,
                winning, minimax,
                INF,
            }}
        >
            {children}
        </GameContext.Provider >
    );
};
