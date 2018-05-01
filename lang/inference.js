'use strict';
const {cond, isNil, always, equals, is, all, contains, path, over, objOf, lensIndex, pipe, toPairs} = require('ramda');

const second = lensIndex(1);
const sym = {
    Array: Symbol('Array'),
    Tuple: Symbol('Tuple'),
    Object: Symbol('Object')
};

const infer = cond([
    [isNil, always({type: Symbol('unit')})],
    [is(Number), always({type: Symbol('Number')})],
    [is(String), always({type: Symbol('String')})],
    [is(Error), always({type: Symbol('Error')})],
    [is(Symbol), always({type: Symbol('Symbol')})],
    [is(Array), arr => {
        const inferred = arr.map(infer);
        const element = inferred[0] || null;
        const theSame = all(equals(), inferred);
        return theSame ? {type: sym.Array, of: element} : {type: sym.Tuple, of: inferred};
    }],
    [x => !contains(x.constructor.name, ['Object', 'Array', 'Number', 'Error', 'Buffer']), pipe(path(['constructor', 'name']), objOf('type'))],
    [is(Object), obj => {
        const inferredPairs = toPairs(obj).map(over(second, infer));
        return {type: sym.Object, of: inferredPairs};
    }]
]);

module.exports = infer;
