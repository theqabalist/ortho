'use strict';

const {should} = require('chai');
should();

const {Tuple} = require('./');

describe('Tuple parser', () => {
    it('Provides the ability to specify checking against tuples.', () => {
        Tuple.tryParse('(Number, String)')([5, 'hello']).should.deep.equal({
            checks: true,
            type: '(Number, String)',
            actual: '(Number, String)'
        });

        Tuple.tryParse('(Number, Number)')([5, 'hello']).should.deep.equal({
            checks: false,
            type: '(Number, Number)',
            actual: '(Number, String)'
        });
    });
});
