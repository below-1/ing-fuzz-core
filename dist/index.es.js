import { __assign } from 'tslib';

var CONS = [0, 1, 2, 3, 4, 5, 6];
function Triangle(a, b, c) {
    return function (x) {
        if (x <= a || x >= c)
            return 0;
        if (x > a && x <= b)
            return (x - a) / (b - a);
        if (x >= b && x < c)
            return (c - x) / (c - b);
        throw new Error("x is not covered: " + x + ", (" + a + ", " + b + ", " + c + ")");
    };
}
function ConsTriangle(a, b, c) {
    return {
        f: function (x) {
            if (x <= a || x >= c)
                return 0;
            if (x > a && x <= b)
                return (x - a) / (b - a);
            if (x >= b && x < c)
                return (c - x) / (c - b);
            throw new Error("x is not covered: " + x + ", (" + a + ", " + b + ", " + c + ")");
        },
        _f: function (y) {
            return [
                (y * (b - a)) + a,
                -1 * ((y * (c - b)) - c)
            ];
        }
    };
}
function ConsLeftTrap(a, b) {
    return {
        f: function (x) {
            if (x >= b)
                return 0;
            if (x > a && x < b)
                return (b - x) / (b - a);
            if (x <= a)
                return 1;
            throw new Error("x is not covered: " + x);
        },
        _f: function (y) {
            return [
                -1 * ((y * (b - a)) - b)
            ];
        }
    };
}
function ConstRightTrap(a, b) {
    return {
        f: function (x) {
            if (x <= a)
                return 0;
            if (x > a && x < b)
                return (x - a) / (b - a);
            if (x >= b)
                return 1;
            throw new Error("x is not covered: " + x);
        },
        _f: function (y) {
            return [
                (y * (b - a)) + a
            ];
        }
    };
}
function LeftTrap(a, b) {
    return function (x) {
        if (x >= b)
            return 0;
        if (x > a && x < b)
            return (b - x) / (b - a);
        if (x <= a)
            return 1;
        throw new Error("x is not covered: " + x);
    };
}
function RightTrap(a, b) {
    return function (x) {
        if (x <= a)
            return 0;
        if (x > a && x < b)
            return (x - a) / (b - a);
        if (x >= b)
            return 1;
        throw new Error("x is not covered: " + x);
    };
}
function mapCrisp(mems, x) {
    return [
        mems[0](x),
        mems[1](x),
        mems[2](x)
    ];
}
var meta = [
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
];
var consMeta = [
    ConsLeftTrap(9, 14),
    ConsTriangle(9, 21, 28),
    ConsTriangle(21, 35, 42),
    ConsTriangle(35, 49, 56),
    ConsTriangle(49, 63, 70),
    ConsTriangle(63, 77, 84),
    ConstRightTrap(77, 87)
];
function buildFuzzier(meta) {
    return function (xs) {
        if (xs.length != meta.length) {
            throw new Error("length do not match: xs.length=" + xs.length + ", meta.length=" + meta.length);
        }
        return xs.map(function (x, index) {
            var mem = meta[index];
            var fuzzVal = mapCrisp(mem, x);
            return fuzzVal;
        });
    };
}
function ruleStrength(predicate, input) {
    if (predicate.length != input.length) {
        throw new Error('length not equal: rule.length=${rule.length}, input.length=${input.length}');
    }
    var vals = predicate.map(function (r, index) {
        var result = input[index][r];
        // Fail hard upon INDEX_OUT_OF_BOUND
        if (result === undefined) {
            throw new Error("INDEX_OUT_OF_BOUND: r=" + r);
        }
        return result;
    });
    // possible INFINITY
    return Math.min.apply(Math, vals.filter(function (v) { return v > 0; }));
}
function imply(rules, input) {
    var group = new Map();
    CONS.forEach(function (c) {
        group.set(c, null);
    });
    rules.forEach(function (r) {
        var strength = ruleStrength(r.predicate, input);
        var ruleInfo = __assign(__assign({}, r), { strength: strength });
        if (!isFinite(strength)) {
            return;
        }
        var oldMax = group.get(r.consequence);
        if (!oldMax || (ruleInfo.strength > oldMax.strength)) {
            group.set(ruleInfo.consequence, ruleInfo);
        }
    });
    var filtered = Array.from(group.entries())
        .map(function (pair) { return pair[1]; })
        .filter(function (ri) { return ri !== null; });
    return filtered;
}
function calcConfidence(ri, maxStrength) {
    var consequence = ri.consequence;
    var xs = consMeta[consequence]._f(maxStrength);
    var midPoint = xs.reduce(function (a, b) { return a + b; }, 0) / xs.length;
    var result = consMeta[consequence].f(midPoint);
    return {
        confidence: result,
        consequence: consequence
    };
}
function defuzz(ruleInfos) {
    if (ruleInfos.length == 0) {
        throw new Error('EMPTY_RULE_INFOS');
    }
    var maxStrength = Math.max.apply(Math, ruleInfos.map(function (ri) { return ri.strength; }));
    return ruleInfos.map(function (ruleInfo) { return calcConfidence(ruleInfo, maxStrength); });
}

export { ConsLeftTrap, ConsTriangle, ConstRightTrap, LeftTrap, RightTrap, Triangle, buildFuzzier, calcConfidence, consMeta, defuzz, imply, meta, ruleStrength };
//# sourceMappingURL=index.es.js.map
