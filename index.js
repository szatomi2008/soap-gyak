import { XMLParser } from "fast-xml-parser";
import express from "express";
const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get('/api/rates', (req, res) => {
    handler(req, res)
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

// PARSING

const parser = new XMLParser({
    ignoreAttributes: false,   // az attribútumok (curr, unit, date) is kellenek
    attributeNamePrefix: '@_', // attribútum kulcsok: @_curr, @_unit, @_date
    removeNSPrefix: true,      // s:Envelope -> Envelope
    parseTagValue: false,      // a "367,73000" maradjon string
})

function parseRates(resXml) {
    // 1. lépés: SOAP boríték
    const envelope = parser.parse(resXml)
    const innerXml =
        envelope.Envelope.Body.GetCurrentExchangeRatesResponse.GetCurrentExchangeRatesResult

    // 2. lépés: a benne lévő XML string
    const inner = parser.parse(innerXml)
    const day = inner.MNBCurrentExchangeRates.Day

    return {
        date: day['@_date'],
        rates: [].concat(day.Rate).map((r) => ({
            curr: r['@_curr'],
            unit: Number(r['@_unit']),
            value: Number(r['#text'].replace(',', '.')),
        })),
    }
}

/**
@param {Request} req
@param {Response} res
*/
export default async function handler(req, res) {
    const {method = "GET"} = req
    
    switch (method) {
        case "GET":

        const endpoint = `http://www.mnb.hu/arfolyamok.asmx`
        const reqBodyXml = `<Envelope xmlns="http://schemas.xmlsoap.org/soap/envelope/">
                                <Body>
                                    <GetCurrentExchangeRates xmlns="http://tempuri.org/">
                                        <!-- No parameters -->
                                    </GetCurrentExchangeRates>
                                </Body>
                            </Envelope>
        `
        
        const soapRes = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "text/xml",
                "SOAPAction": '"http://www.mnb.hu/webservices/MNBArfolyamServiceSoap/GetCurrentExchangeRates"'
            },
            body: reqBodyXml
        })

        if (!soapRes.ok) return res.status(soapRes.status).json({error: soapRes.statusText})

        const resXml = await soapRes.text()

        const parsed = parseRates(resXml)

        const {date = new Date(Date.now()), rates = []} = parsed
        return res.status(200).json({date, rates})

    default:
        return res.status(405).json({error: "Method Not Allowed"})
    }
}