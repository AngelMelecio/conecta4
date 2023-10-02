import Grid from './components/Grid'
import Tab from './components/Tab.png'
import Roja from './components/Roja.png'
import Amarilla from './components/Amarilla.png'
import { GameProvider, useGame } from './useGame'
function App() {

  const { setTurn, turn } = useGame()

  return (
    <div className='flex items-center justify-center h-screen '>
      <div className='relative flex justify-center max-h-screen'>
        {turn ?
          <>
            <img style={{ pointerEvents: 'none', objectFit: 'contain', width: '100%' }} src={Tab} />
            <Grid />
          </> :
          <>
            <button
              onClick={() => setTurn(1)}
              className='btn'>
              <h1>Jugador 1</h1>
              <img src={Roja} alt="" />
            </button>
            <button
              onClick={() => setTurn(2)}
              className='btn'>
              <h1>Jugador 2</h1>
              <img src={Amarilla} alt="" />
            </button>
          </>}
      </div>
    </div>
  )
}

export default App
