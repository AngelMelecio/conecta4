import React, { useEffect, useState } from 'react'
import Amarilla from './Amarilla.png'
import Roja from './Roja.png'
import { sleep } from './Logic'
import { useGame } from '../useGame'



const Grid = () => {

  const {
    tablero, setTablero,
    nextRow, setNextRow,
    turn, setTurn,
    player, setPlayer,

    winning, minimax,
    INF, PLAYER_PIECE, IA_PIECE
  } = useGame()


  const [colHover, setColHover] = useState(null)
  const [waiting, setWaiting] = useState(false)


  const handleMove = (col) => {
    if (waiting) return
    if (nextRow[col] < 0) return

    setTablero(p => {
      let newTablero = [...p]
      newTablero[nextRow[col]][col] = turn
      return newTablero
    })

    setNextRow(p => {
      let newNextRow = [...p]
      newNextRow[col]--
      return newNextRow
    })

    setTurn(p => p === PLAYER_PIECE ? IA_PIECE : PLAYER_PIECE)
  }

  useEffect(() => {
    let last_turn = turn === PLAYER_PIECE ? IA_PIECE : PLAYER_PIECE
    let boardState = winning(tablero, last_turn)
    if (!boardState.end) {
      if (turn === IA_PIECE) {
        cpuMove()
      }
    } else {
      handleEndGame(boardState)
    }
  }, [turn])

  const cpuMove = async () => {
    try {
      setWaiting(true)
      await sleep(1000)

      let newTablero = tablero.map(row => [...row])
      let newNextRow = [...nextRow]

      const [j, score] = minimax(newTablero, newNextRow, 5, -INF, INF, true)

      console.log(j, score)

      newTablero[nextRow[j]][j] = turn
      newNextRow[j]--

      setTablero(newTablero)
      setNextRow(newNextRow)

    } catch (e) {
      console.log('error:', e)
    } finally {
      setWaiting(false)
      setTurn(p => p === PLAYER_PIECE ? IA_PIECE : PLAYER_PIECE)
    }
  }

  const handleEndGame = () => {

    setWaiting(true)
    sleep(100)
    alert('Se acabo')

  }

  let height = window.innerHeight * (7 / 6)

  return (
    <div style={{ maxWidth: height }} className='absolute w-full h-full '>
      <table className='w-full h-full'>
        <tbody>
          {tablero.map((row, i) => <tr key={"ROW_" + i}>
            {row.map((col, j) =>
              <td
                onClick={() => { handleMove(j) }}
                onMouseEnter={() => { setColHover(j) }}
                onMouseLeave={() => { setColHover(null) }}
                key={"TD_" + i + j}
                row={i}
                col={j}
                className='p-[1.5%]  '>
                <div className='relative w-full h-full '>
                  <div className="absolute w-full h-full -z-10">
                    {tablero[i][j] &&
                      <img
                        className='flex object-contain w-full h-full '
                        src={tablero[i][j] === 1 ? Roja : Amarilla} />
                    }
                    {
                      colHover === j && nextRow[j] === i && !waiting &&
                      <div className={'absolute top-0 w-full h-full rounded-full -z-10 ' + (turn ? 'bg-rose-500 opacity-25' : 'bg-amber-300 opacity-25')}></div>
                    }
                  </div>
                </div>
              </td>
            )}
          </tr>)}
        </tbody>
      </table>
    </div>
  )
}

export default Grid