'use strict';

const {should} = require('chai');
should();

const {Unit} = require('./');

describe('Unit parser', () => {
    it('Provides the ability to talk about meaningless values meaningfully.', () => {
        Unit.tryParse('()')(null).should.deep.equal({
            checks: true,
            type: '()',
            actual: '()',
            vars: {}
        });

        Unit.tryParse('()')(5).should.deep.equal({
            checks: false,
            type: '()',
            actual: 'Number',
            vars: {}
        });
    });
});
