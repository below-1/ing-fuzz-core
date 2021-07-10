import { maxBy } from 'lodash'
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
export type FuzzResult = {
  confidence: number,
  consequence: number
}
export type ConsFunc = {
  f: (x: number) => number,
  _f: (x: number) => number[]
}

const CONS = [0, 1, 2, 3, 4, 5, 6]

export function Triangle (a: number, b: number, c: number): FuzzFunc {
  return (x: number) => {
    if (x <= a || x >= c) return 0
    if (x > a && x <= b) return (x - a) / (b - a)
    if (x >= b && x < c) return (c - x) /  (c - b)
    throw new Error(`x is not covered: ${x}, (${a}, ${b}, ${c})`)
  }
}

export function ConsTriangle (a: number, b: number, c: number): ConsFunc {
  return {
    f: (x: number) => {
      if (x <= a || x >= c) return 0
      if (x > a && x <= b) return (x - a) / (b - a)
      if (x >= b && x < c) return (c - x) /  (c - b)
      throw new Error(`x is not covered: ${x}, (${a}, ${b}, ${c})`)
    },
    _f: (y: number) => {
      return [
        (y * (b - a)) + a,
        -1 * ((y * (c - b)) - c)
      ]
    }
  }
}

export function ConsLeftTrap (a: number, b: number): ConsFunc {
  return {
    f: (x: number) => {
      if (x >= b) return 0;
      if (x > a && x < b) return (b - x) / (b - a)
      if (x <= a) return 1;
      throw new Error(`x is not covered: ${x}`)
    },
    _f: (y: number) => {
      return [
        -1 * ((y * (b - a)) - b)
      ]
    }
  }
}

export function ConstRightTrap (a: number, b: number): ConsFunc {
  return {
    f: (x: number) => {
      if (x <= a) return 0;
      if (x > a && x < b) return (x - a) / (b - a);
      if (x >= b) return 1;
      throw new Error(`x is not covered: ${x}`)
    },
    _f: (y: number) => {
      return [
        (y * (b - a)) + a
      ]
    }
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

export const consMeta: ConsFunc[] = [
  ConsLeftTrap(9, 14),
  ConsTriangle(9, 21, 28),
  ConsTriangle(21, 35, 42),
  ConsTriangle(35, 49, 56),
  ConsTriangle(49, 63, 70),
  ConsTriangle(63, 77, 84),
  ConstRightTrap(77, 87)
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
    const result = input[index][r]
    // Fail hard upon INDEX_OUT_OF_BOUND
    if (result === undefined) {
      throw new Error(`INDEX_OUT_OF_BOUND: r=${r}`);
    }
    return result;
  })
  // possible INFINITY
  return Math.min(...vals.filter(v => v > 0))
}

export function imply (rules: Rule[], input: FuzzyVal[]): RuleInfo[] {
  let group: Map<number, RuleInfo | null> = new Map()
  CONS.forEach(c => {
    group.set(c, null)
  })

  rules.forEach(r => {
    let strength = ruleStrength(r.predicate, input)
    const ruleInfo: RuleInfo = {
      ...r,
      strength
    }

    if (!isFinite(strength)) {
      return
    }
    const oldMax = group.get(r.consequence)

    if (!oldMax || (ruleInfo.strength > oldMax.strength)) {
      group.set(ruleInfo.consequence, ruleInfo)
    }
  })

  const filtered: RuleInfo[] = Array.from(group.entries())
    .map(pair => pair[1])
    .filter(ri => ri !== null) as RuleInfo[];

  return filtered
}

export function calcConfidence (ri: RuleInfo, maxStrength: number): FuzzResult {
  const consequence = ri.consequence
  const xs = consMeta[consequence]._f(maxStrength)
  const midPoint = xs.reduce((a, b) => a + b, 0) / xs.length
  const result = consMeta[consequence].f(midPoint)
  return {
    confidence: result,
    consequence
  }
}

export function defuzz (ruleInfos: RuleInfo[]): FuzzResult[] {
  if (ruleInfos.length == 0) {
    throw new Error('EMPTY_RULE_INFOS');
  }
  const maxStrength = Math.max(...ruleInfos.map(ri => ri.strength))
  return ruleInfos.map(ruleInfo => calcConfidence(ruleInfo, maxStrength))
}