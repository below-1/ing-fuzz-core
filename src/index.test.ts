import axios from 'axios'
import { random, range } from 'lodash'
import { 
  buildFuzzier, 
  meta, 
  Input, 
  Triangle, 
  LeftTrap, 
  RightTrap, 
  Rule,
  ruleStrength,
  imply,
  defuzz,
  calcConfidence
} from './index'

describe('dummy test', () => {

  it('triangle function', () => {
    const triangle = Triangle(10, 20, 30)
    const result = triangle(23)
    const expected = 0.7
    expect(result).toBeDefined()
    expect(result).toBeCloseTo(expected, 10)
  })

  it('left trap function', () => {
    const leftTrap = LeftTrap(1, 5)
    const result = leftTrap(4)
    const expected = 0.25
    expect(result).toBeDefined()
    expect(result).toBeCloseTo(expected, 10)
  })

  it('right trap function', () => {
    const rightTrap = RightTrap(25, 35)
    const result = rightTrap(30)
    const expected = 0.5
    expect(result).toBeDefined()
    expect(result).toBeCloseTo(expected, 10)
  })

  it('fuzzier function known input', () => {
    const input = [23, 5, 4, 4, 6, 5, 2, 50000]
    const fuzzFunc = buildFuzzier(meta)
    const result = fuzzFunc(input)
    expect(result).toBeDefined()
    result.forEach(_var => {
      _var.forEach(x => {
        expect(x).toBeGreaterThanOrEqual(0)
        expect(x).toBeLessThanOrEqual(1)
      })
    })
  })

  it('fuzzier function random input', () => {
    const xs = range(1000)
      .map(i => {
        return [
          random(0, 50, false),
          random(0, 24, false),
          random(0, 10, false),
          random(0, 10, false),
          random(0, 10, false),
          random(0, 10, false),
          random(0, 10, false),
          random(0, 1000000, false)
        ]
      })
    xs.forEach(input => {
      const fuzzFunc = buildFuzzier(meta)
      const result = fuzzFunc(input)
      expect(result).toBeDefined()
      result.forEach(_var => {
        _var.forEach(x => {
          expect(x).toBeGreaterThanOrEqual(0)
          expect(x).toBeLessThanOrEqual(1)
        })
      })
    })
  })

  it('ruleStrength function', () => {
    const rules = [
      {
        predicate: [1, 1, 1, 1, 1, 1, 0, 0],
        consequence: 1
      },
      {
        predicate: [1, 1, 1, 0, 1, 0, 0, 0],
        consequence: 3
      }
    ]
    const expecteds = [ 0.3333333333, 0.4444444444 ]
    const input = [23, 5, 4, 4, 6, 5, 2, 50000]

    rules.forEach((rule, index) => {
      const expected = expecteds[index]
      const fuzzFunc = buildFuzzier(meta)
      const fuzzVals = fuzzFunc(input)
      const result = ruleStrength(rule.predicate, fuzzVals)
      expect(result).toBeCloseTo(expected, 10)
    })
  })

  it('ruleStrength index out of bound', () => {
    const rule = {
      predicate: [4, 0, 3, 2, 1, 2, 2, 1],
      consequence: 2
    }
    const fuzzFunc = buildFuzzier(meta)
    const input = [23, 5, 4, 4, 6, 5, 2, 50000]
    expect(() => {
      imply([ rule ], fuzzFunc(input))
    }).toThrowError('INDEX_OUT_OF_BOUND: r=4')
  })

  it('compose function', async () => {
    const input = [23, 5, 4, 4, 6, 5, 2, 50000]
    const fuzzFunc = buildFuzzier(meta)
    const fuzzVals = fuzzFunc(input)

    const params = {
      perPage: 10000
    }
    const resp = await axios.get('http://localhost:5000/api/rule', { params })
    const { data } = resp
    const rules = data.items.map((it: any) => {
      const predicate = it.predicate.split('').map((x: string) => parseInt(x))
      const consequence = parseInt(it.consequence)
      const rule: Rule = {
        predicate,
        consequence
      }
      return rule
    })
    const result = imply(rules, fuzzVals)
    // console.log(result)
  })

  it('defuzz function', async () => {
    const input = [23, 5, 4, 4, 6, 5, 2, 50000]
    const fuzzFunc = buildFuzzier(meta)
    const fuzzVals = fuzzFunc(input)

    const params = {
      perPage: 10000
    }
    const resp = await axios.get('http://localhost:5000/api/rule', { params })
    const { data } = resp
    const rules = data.items.map((it: any) => {
      const predicate = it.predicate.split('').map((x: string) => parseInt(x))
      const consequence = parseInt(it.consequence)
      const rule: Rule = {
        predicate,
        consequence
      }
      return rule
    })
    const ruleInfos = imply(rules, fuzzVals)
    // console.log(ruleInfos)
    const results = defuzz(ruleInfos)
    console.log(results)
    results.forEach(fuzzResult => {
      expect(fuzzResult.confidence).toBeGreaterThan(0)
      expect(fuzzResult.confidence).toBeLessThanOrEqual(1)
      expect(fuzzResult.consequence).toBeLessThanOrEqual(7)
      expect(fuzzResult.consequence).toBeGreaterThanOrEqual(0)
    })
  })

})