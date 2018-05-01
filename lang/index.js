'use strict';

const {regex, createLanguage, alt, string, digit, seqObj, letter, of} = require('parsimmon');
const {is, curry, evolve, hasIn, isNil, all, prop, join, props, zipWith, call} = require('ramda');
const mdo = require('fantasy-do');
const {VError} = require('verror');

const makeSuccess = type => ({checks: true, type, actual: type, vars: {}});
const makeFailure = (type, actual) => ({checks: false, type, actual, vars: {}});

const reconcileConcrete = curry((type, x) => {
    const safe = isNil(x) ? {constructor: {name: '()'}} : x;
    return safe.constructor.name === type ?
        makeSuccess(type) :
        makeFailure(type, safe.constructor.name);
});

const reconcileArray = curry((reconcile, x) => {
    if (!is(Array, x)) {
        return makeFailure('[*]', x.constructor.name);
    }
    return evolve({
        type: t => `[${t}]`,
        actual: a => `[${a}]`
    }, x.map(reconcile).reduce(({checks}, c, i) => {
        if (checks && c.checks) {
            return c;
        }
        return makeFailure(`${c.type}`, `${i}::${c.actual}`);
    }, makeSuccess('')));
});

const reconcileObject = curry((recSpec, x) => {
    const evaluation = recSpec.reduce((props, [key, reconcile]) => {
        if (hasIn(key, x)) {
            const {checks, type, actual} = reconcile(x[key]);
            return props.concat([{key, checks, type, actual}]);
        }
        return props.concat([{key, checks: false, type: 'PRESENT', actual: 'ABSENT'}]);
    }, []);
    const expected = evaluation.map(props(['key', 'type'])).map(join(': ')).join(', ');
    const actual = evaluation.map(props(['key', 'actual'])).map(join(': ')).join(', ');
    const checks = all(prop('checks'), evaluation);
    return {checks, type: `{${expected}}`, actual: `{${actual}}`};
});

const failureToError = ({type, actual}) => `Expected ${type}, got ${actual}.`;

const reconcileFunction = curry(({input, output}, f) => arg => {
    const checkedInput = input(arg);
    const ret = f(arg);
    const checkedOutput = output(ret);
    if (checkedInput.checks && checkedOutput.checks) {
        return ret;
    }
    throw new VError({name: 'TypeCheckError'}, failureToError(makeFailure(`${checkedInput.type} -> ${checkedOutput.type}`, `${checkedInput.actual} -> ${checkedOutput.actual}`)));
});

const reconcileTuple = curry((reconcilers, t) => {
    const checkedTuple = zipWith(call, reconcilers, t);
    const expected = checkedTuple.map(prop('type')).join(', ');
    const actual = checkedTuple.map(prop('actual')).join(', ');
    const checks = all(prop('checks'), checkedTuple);
    return {checks, type: `(${expected})`, actual: `(${actual})`};
});

const reconcileUnit = curry((_, x) => isNil(x) ? makeSuccess('()') : makeFailure('()', x.constructor.name));

const reconcileVar = curry((name, x) => {
    const safe = isNil(x) ? {constructor: {name: '()'}} : x;
    return {
        checks: true,
        type: safe.constructor.name,
        actual: safe.constructor.name,
        vars: {[name]: x}
    };
});

module.exports = createLanguage({
    Unit: () => string('()').map(reconcileUnit),
    Concrete: () => regex(/[A-Z][a-zA-Z]*/).map(reconcileConcrete),
    Array: ({Expression}) => Expression.wrap(string('['), string(']')).map(reconcileArray),
    Var: () => regex(/[a-z]+/).map(reconcileVar),
    ObjectKey: () => alt(
        letter.or(digit).atLeast(1).tie(),
        letter.or(digit).atLeast(1).tie().wrap(string('"'), string('"'))
    ),
    Object: ({Expression, ObjectKey}) => mdo(function* () {
        const name = yield ObjectKey;
        yield string(': ');
        const reconcile = yield Expression;
        return of([name, reconcile]);
    }).sepBy(string(',')).wrap(string('{'), string('}')).map(reconcileObject),
    Tuple: ({Expression}) => Expression.sepBy(string(', ')).wrap(string('('), string(')')).map(reconcileTuple),
    Function: ({Limited, Expression}) => seqObj(['input', Limited], string(' -> '), ['output', Expression]).map(reconcileFunction),
    Limited: ({Concrete, Array, Object, Tuple}) => alt(
        Array,
        Concrete,
        Object,
        Tuple
    ),
    Expression: ({Limited, Function}) => alt(Function, Limited)
});
