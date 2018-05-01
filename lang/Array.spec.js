'use strict';

const {should} = require('chai');
should();

const {Array} = require('./');

describe('Array parser', () => {
    it('Provides the ability to specify checking against arrays.', () => {
        Array.tryParse('[Number]')([5]).should.deep.equal({
            checks: true,
            type: '[Number]',
            actual: '[Number]'
        });

        Array.tryParse('[Number]')('hello').should.deep.equal({
            checks: false,
            type: '[*]',
            actual: 'String'
        });

        Array.tryParse('[Number]')([5, 'hello']).should.deep.equal({
            checks: false,
            type: '[Number]',
            actual: '[1::String]'
        });
    });

    context('The array is of higher types.', () => {
        it('Provides the ability to parse an array of any syntactic type.', () => {
            Array.tryParse('[(Number, String)]')([[5, 'hello'], [6, 'goodbye']]).should.deep.equal({
                checks: true,
                type: '[(Number, String)]',
                actual: '[(Number, String)]'
            });
        });
    });
});
