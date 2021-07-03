"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = __importDefault(require("axios"));
var lodash_1 = require("lodash");
var vars_1 = require("./vars");
describe('dummy test', function () {
    it('triangle function', function () {
        var triangle = vars_1.Triangle(10, 20, 30);
        var result = triangle(23);
        // console.log(result)
        // const input: Input = [23, 5, 4, 4, 6, 5, 2, 50000]
        // fuzzier(input)
        var expected = 0.7;
        expect(result).toBeDefined();
        expect(result).toBeCloseTo(expected, 10);
    });
    it('left trap function', function () {
        var leftTrap = vars_1.LeftTrap(1, 5);
        var result = leftTrap(4);
        var expected = 0.25;
        expect(result).toBeDefined();
        expect(result).toBeCloseTo(expected, 10);
    });
    it('right trap function', function () {
        var rightTrap = vars_1.RightTrap(25, 35);
        var result = rightTrap(30);
        var expected = 0.5;
        expect(result).toBeDefined();
        expect(result).toBeCloseTo(expected, 10);
    });
    it('fuzzier function known input', function () {
        var input = [23, 5, 4, 4, 6, 5, 2, 50000];
        var fuzzFunc = vars_1.buildFuzzier(vars_1.meta);
        var result = fuzzFunc(input);
        expect(result).toBeDefined();
        result.forEach(function (_var) {
            _var.forEach(function (x) {
                expect(x).toBeGreaterThanOrEqual(0);
                expect(x).toBeLessThanOrEqual(1);
            });
        });
    });
    it('fuzzier function random input', function () {
        var xs = lodash_1.range(1000)
            .map(function (i) {
            return [
                lodash_1.random(0, 50, false),
                lodash_1.random(0, 24, false),
                lodash_1.random(0, 10, false),
                lodash_1.random(0, 10, false),
                lodash_1.random(0, 10, false),
                lodash_1.random(0, 10, false),
                lodash_1.random(0, 10, false),
                lodash_1.random(0, 1000000, false)
            ];
        });
        xs.forEach(function (input) {
            var fuzzFunc = vars_1.buildFuzzier(vars_1.meta);
            var result = fuzzFunc(input);
            expect(result).toBeDefined();
            result.forEach(function (_var) {
                _var.forEach(function (x) {
                    expect(x).toBeGreaterThanOrEqual(0);
                    expect(x).toBeLessThanOrEqual(1);
                });
            });
        });
    });
    it('ruleStrength function', function () {
        var rules = [
            {
                predicate: [1, 1, 1, 1, 1, 1, 0, 0],
                consequence: 1
            },
            {
                predicate: [1, 1, 1, 0, 1, 0, 0, 0],
                consequence: 3
            }
        ];
        var expecteds = [0.3333333333, 0.4444444444];
        var input = [23, 5, 4, 4, 6, 5, 2, 50000];
        rules.forEach(function (rule, index) {
            var expected = expecteds[index];
            var fuzzFunc = vars_1.buildFuzzier(vars_1.meta);
            var fuzzVals = fuzzFunc(input);
            var result = vars_1.ruleStrength(rule.predicate, fuzzVals);
            expect(result).toBeCloseTo(expected, 10);
        });
    });
    it('compose function', function () { return __awaiter(void 0, void 0, void 0, function () {
        var input, fuzzFunc, fuzzVals, params, resp, data, rules, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = [23, 5, 4, 4, 6, 5, 2, 50000];
                    fuzzFunc = vars_1.buildFuzzier(vars_1.meta);
                    fuzzVals = fuzzFunc(input);
                    params = {
                        perPage: 10000
                    };
                    return [4 /*yield*/, axios_1.default.get('http://localhost:5000/api/rule', { params: params })];
                case 1:
                    resp = _a.sent();
                    data = resp.data;
                    rules = data.items.map(function (it) {
                        var predicate = it.predicate.split('').map(function (x) { return parseInt(x); });
                        var consequence = parseInt(it.consequence);
                        var rule = {
                            predicate: predicate,
                            consequence: consequence
                        };
                        return rule;
                    });
                    result = vars_1.compose(rules, fuzzVals);
                    console.log(fuzzVals);
                    console.log(rules.length);
                    console.log(result.length);
                    return [2 /*return*/];
            }
        });
    }); });
});
