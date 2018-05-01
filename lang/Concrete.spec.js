'use strict';

const {should} = require('chai');
should();

const {Concrete} = require('./');

describe('Concrete parser', () => {
    it('Provides the ability to specify checking against built in types.', () => {
        Concrete.tryParse('Number')(5).should.deep.equal({
            checks: true,
            type: 'Number',
            actual: 'Number',
            vars: {}
        });

        Concrete.tryParse('Number')('hello').should.deep.equal({
            checks: false,
            type: 'Number',
            actual: 'String',
            vars: {}
        });
    });

    it('Provides the ability to check against custom defined types.', () => {
        function MyType() {}
        Concrete.tryParse('MyType')(new MyType()).should.deep.equal({
            checks: true,
            type: 'MyType',
            actual: 'MyType',
            vars: {}
        });
    });

    it('Protects against checking against null and undefined.', () => {
        Concrete.tryParse('Number')(undefined).should.deep.equal({
            checks: false,
            type: 'Number',
            actual: '()',
            vars: {}
        });

        Concrete.tryParse('Number')(null).should.deep.equal({
            checks: false,
            type: 'Number',
            actual: '()',
            vars: {}
        });
    });
});
