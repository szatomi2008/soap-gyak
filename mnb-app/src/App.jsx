import React from 'react'
import './App.css'
import MnbCurrencyRates from './MnbCurrencyRates'


export default class App extends React.Component {
  render() {
    return <>
      <h1>MNB Árfolyamok (TODO: date)</h1>
      <div className='card'>
        <MnbCurrencyRates />
      </div>
    </>
  }
}
