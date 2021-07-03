export type Input = [number, number, number, number, number, number, number, number]
export type FuzzyVal = [number, number, number]
export type FuzzFunc = (x: number) => number
export type MembershipMeta = [FuzzFunc, FuzzFunc, FuzzFunc]
export type Rule = {
  predicate: number[];
  consequence: number;
}
export type RuleInfo = {
  predicate: number[];
  consequence: number;
  strength: number;
}

export function Triangle (a: number, b: number, c: number): FuzzFunc {
  return (x: number) => {
    if (x <= a || x >= c) return 0
    if (x > a && x < b) return (x - a) / (b - a)
    if (x >= b && x < c) return (c - x) /  (c - b)
    throw new Error(`x is not covered: ${x}, (${a}, ${b}, ${c})`)
  }
}

export function LeftTrap (a: number, b: number): FuzzFunc {
  return (x: number) => {
    if (x >= b) return 0;
    if (x > a && x < b) return (b - x) / (b - a)
    if (x <= a) return 1;
  throw new Error(`x is not covered: ${x}`)
  }
}

export function RightTrap (a: number, b: number): FuzzFunc {
  return (x: number) => {
    if (x <= a) return 0;
    if (x > a && x < b) return (x - a) / (b - a);
    if (x >= b) return 1;
    throw new Error(`x is not covered: ${x}`)
  }
}

function mapCrisp (mems: MembershipMeta, x: number): FuzzyVal {
  return [
    mems[0](x),
    mems[1](x),
    mems[2](x)
  ]
}


export const meta: MembershipMeta[] = [
  [
    LeftTrap(5, 15),
    Triangle(10, 20, 30),
    RightTrap(25, 35)
  ],
  [
    LeftTrap(1, 4),
    Triangle(2, 5, 8),
    RightTrap(6, 9)
  ],
  [
    LeftTrap(1, 5),
    Triangle(3, 5, 7),
    RightTrap(5, 9)
  ],
  [
    LeftTrap(3, 5),
    Triangle(3, 6, 9),
    RightTrap(7, 9)
  ],
  [
    LeftTrap(3, 5),  
    Triangle(3, 6, 9),
    RightTrap(7, 9)
  ],
  [
    LeftTrap(3, 5),  
    Triangle(3, 6, 9),
    RightTrap(7, 9)
  ],
  [
    LeftTrap(1, 5),  
    Triangle(3, 5, 7),
    RightTrap(5, 9)
  ],
  [
    Triangle(10000, 100000, 200000),  
    Triangle(100000, 350000, 600000),
    RightTrap(500000, 900000)
  ]
]

export function buildFuzzier (meta: MembershipMeta[]): (xs: number[]) => FuzzyVal[] {
  return function (xs: number[]): FuzzyVal[] {
    if (xs.length != meta.length) {
      throw new Error(`length do not match: xs.length=${xs.length}, meta.length=${meta.length}`)
    }
    return xs.map((x, index) => {
      const mem = meta[index]
      const fuzzVal: FuzzyVal = mapCrisp(mem, x)
      return fuzzVal
    })
  }
}

export function ruleStrength (predicate: number[], input: FuzzyVal[]) {
  if (predicate.length != input.length) {
    throw new Error('length not equal: rule.length=${rule.length}, input.length=${input.length}');
  }
  const vals = predicate.map((r, index) => {
    return input[index][r]
  })
  return Math.min(...vals.filter(v => v > 0))
}

export function compose (rules: Rule[], input: FuzzyVal[]) {
  const ruleInfos: RuleInfo[] = rules.map(r => {
    let strength = ruleStrength(r.predicate, input)
    if (strength > 0) {
      console.log(`strength: ${strength}`)
      throw new Error('stop')
    }
    return {
      ...r,
      strength
    }
  })
  const filtered = ruleInfos.filter(r => r.strength > 0)
  return filtered
}