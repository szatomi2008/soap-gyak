import './App.css'
import MnbCurrencyRates from './MnbCurrencyRates'

//TODO: refactor app to class

function App() {
  return (
    <>
      <h1>MNB Árfolyamok (TODO: date)</h1>
      <div className='card'>
        <MnbCurrencyRates />
      </div>
    </>
  )
}

export default App
