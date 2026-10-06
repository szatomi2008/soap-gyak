/* eslint-disable no-unused-vars */
import React from "react"
import "./MnbCurrencyRates.css"

export default class MnbCurrencyRates extends React.Component {
    
    state = {
        date: "",
        rates: [],
        error: null,
        amount: "1",
        from: "",
        to: ""
    }

    handleChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    swap = () => {
        this.setState(({from, to}) => ({from: to, to: from}))
    }

    calculate(from, to, amount) {
        const rates = this.state.rates
        const a = rates.find(r => r.curr === from)
        const b = rates.find(r => r.curr === to)
        const n = parseFloat(amount)

        if (!a || !b || isNaN(n)) return ""
        
        const result = n * (a.value / a.unit) / (b.value / b.unit)
        return `${result.toLocaleString("hu-HU", {maximumFractionDigits: 4})} ${to}`
    }

    async componentDidMount() {
        const url = "http://127.0.0.1:3000/api/rates";
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Response status: ${response.status}`);

            const result = await response.json();
            const list = result.rates || []
            this.setState({
                ...result,
                from: list[0]?.curr ?? "",
                to: list[1]?.curr ?? list[0]?.curr ?? ""
            })
            console.log(result)
        } catch (error) {
            console.error(error.message);
        }
    }

    render() {
        const {date = "", rates = [], error = null, amount, from, to} = this.state

        return <section className="mnb">
            {error && <p className="mnb-error">Hiba: error</p>}

            <div className="mnb-layout">
                <div className="mnb-table-wrap">
                    <table className="mnb-table">
                        <thead>
                            <tr>
                                <th>Deviza</th>
                                <th>Egység</th>
                                <th>Árfolyam (HUF)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rates.map((r, i) => (
                                <tr key={i}>
                                    <td>{r.curr}</td>
                                    <td>{r.unit}</td>
                                    <td>{r.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <form className="mnb-form" >
                    <h3>Átváltó</h3>
                    <label>
                        Összeg
                        <input type="number" name="amount" min="0" step="any" value={amount} onChange={this.handleChange} />
                    </label>
                    <label>
                        Ebből
                        <select name="from" value={from} onChange={this.handleChange}>
                            {this.state.rates.map(
                                (r, i) => <option key={i} value={r.curr}>{r.curr}</option>
                            )}
                        </select>
                    </label>
                    <button type="button" title="Felcserélés" onClick={this.swap}>⇅</button>
                    <label>
                        Ebbe
                        <select name="to" value={to} onChange={this.handleChange}>
                            {this.state.rates.map(
                                (r, i) => <option key={i} value={r.curr}>{r.curr}</option>
                            )}
                        </select>
                    </label>
                    <output className="mnb-result">{this.calculate(from, to, amount)}</output>
                </form>
            </div>
        </section>
    }
}