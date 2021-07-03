"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compose = exports.ruleStrength = exports.buildFuzzier = exports.meta = exports.RightTrap = exports.LeftTrap = exports.Triangle = void 0;
function Triangle(a, b, c) {
    return function (x) {
        if (x <= a || x >= c)
            return 0;
        if (x > a && x < b)
            return (x - a) / (b - a);
        if (x >= b && x < c)
            return (c - x) / (c - b);
        throw new Error("x is not covered: " + x + ", (" + a + ", " + b + ", " + c + ")");
    };
}
exports.Triangle = Triangle;
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
exports.LeftTrap = LeftTrap;
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
exports.RightTrap = RightTrap;
function mapCrisp(mems, x) {
    return [
        mems[0](x),
        mems[1](x),
        mems[2](x)
    ];
}
exports.meta = [
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
exports.buildFuzzier = buildFuzzier;
function ruleStrength(predicate, input) {
    if (predicate.length != input.length) {
        throw new Error('length not equal: rule.length=${rule.length}, input.length=${input.length}');
    }
    var vals = predicate.map(function (r, index) {
        return input[index][r];
    });
    return Math.min.apply(Math, vals.filter(function (v) { return v > 0; }));
}
exports.ruleStrength = ruleStrength;
function compose(rules, input) {
    var ruleInfos = rules.map(function (r) {
        var strength = ruleStrength(r.predicate, input);
        if (strength > 0) {
            console.log("strength: " + strength);
            throw new Error('stop');
        }
        return __assign(__assign({}, r), { strength: strength });
    });
    var filtered = ruleInfos.filter(function (r) { return r.strength > 0; });
    return filtered;
}
exports.compose = compose;
