// import { HmacSHA256, enc } from "crypto-js";
import * as cryptojs from "crypto-js";
import Decimal from "decimal.js";
import React, { useCallback, useState } from "react";
import styled from "styled-components";

const seedGenerator = (address: string, blockHash: string): string => {
  const hmac = cryptojs.HmacSHA256(cryptojs.enc.Hex.parse(address), blockHash);
  // const hmac = HmacSHA256(enc.Hex.parse(address), txid);
  return hmac.toString(cryptojs.enc.Hex);
}

function* randomNumberGenerator(hashed: string): Generator<number> {
  while (true) {
    const hash = Buffer.from(hashed, 'hex')
    let cursor = 0

    while (cursor < hash.byteLength / 3) {
      const hashing = hash
        .slice(cursor * 3, ++cursor * 3)
        .reduce(
          (sum, byte, index) =>
            sum.add(new Decimal(byte).dividedBy(256 ** (index + 1))),
          new Decimal(0)
        ).toNumber();
      yield hashing
    }
    cursor = 0;
  }
}

const rollNumbers = (hashed: string, numbers: number, possible: number): number[] => {
  const generator = randomNumberGenerator(hashed)

  const results: number[] = []

  while (results.length < numbers) {
    const number = generator.next().value

    const result = new Decimal(number).times(possible).trunc().toNumber()

    if (!results.includes(result)) results.push(result)
  }

  return results.sort()
}

const getLumiResult = (direction: number, hashed: string): number => direction === 0 ? rollNumbers(hashed, 1, 100)[0] : 99 - rollNumbers(hashed, 1, 100)[0]

const App = () => {
  const [typeRoll, setTypeRoll] = useState<0 | 1>(0) //0:under, 1:over
  const [inputString, setInputString] = useState({
    address: '',
    blockHash: ''
  })
  const { address, blockHash } = inputString

  const onChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputString({ ...inputString, [e.target.name]: e.target.value })
  }, [inputString])
  const [result, setResult] = useState(0)
  const getResult = async () => {
    const seed = await seedGenerator(address, blockHash)
    const result = await getLumiResult(typeRoll, seed)
    setResult(result)
  }
  const handleTypeRoll = useCallback((e: 0 | 1) => {
    setTypeRoll(e)
  }, [typeRoll])
  return (
    <Wrap>
      <div className="ctx-input">
        <label>Address:</label>
        <input value={address} name="address" onChange={onChangeInput} />
      </div>
      <div className="ctx-input">
        <label>Block Hash:</label>
        <input value={blockHash} name="blockHash" onChange={onChangeInput} />
      </div>
      <div className="ctx-check">
        <div className="check" onClick={() => handleTypeRoll(0)}>
          <input id="under" type="radio" checked={typeRoll === 0} value={0} name="blockHash" />
          <label htmlFor="age1">Under</label><br></br>
        </div>
        <div className="check" onClick={() => handleTypeRoll(1)}>
          <input id="over" type="radio" checked={typeRoll === 1} value={1} name="blockHash" />
          <label htmlFor="age1">Over</label><br></br>
        </div>

      </div>
      <div className="ctx-button">
        <button onClick={getResult}>
          Get Result
        </button>
      </div>
      <div className="ctx-result">
        <p>Result: {result}</p>
      </div>
      <div className="ctx-repo">
        <p>Link repo: <a href="https://github.com/LongTran12/lumi-fairness" >Github</a></p>
      </div>
    </Wrap>
  )

}
export default App
const Wrap = styled.div`
    width: clamp(300px,400px,500px);
    margin: 0 auto;
    height: 100%;
    margin-top: 50px;
    .ctx-input{
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        label{
            margin-bottom: 5px;
        }
        input{
            /* font-size: 20px; */
            padding:7px 5px;
            width: 100%;
            
        }
    }
    .ctx-check{
        display: flex;
        align-content: center;
        justify-content: center;
        margin-bottom: 20px;
        label{
            margin-right: 30px;
        }
    }
    .ctx-button{
        text-align: center;
        button{
            padding:10px 25px;
        }  
    }
    .ctx-result{
        text-align: center;
        p{
            font-size: 30px;
            font-weight: bold;
        }
    }
    .ctx-repo{
      text-align: center;
    }
`
