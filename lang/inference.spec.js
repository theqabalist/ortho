'use strict';

const {should} = require('chai');
should();

const infer = require('./inference');

describe('Runtime type inference', () => {
    it('Properly infers unit.', () => {
        infer(null).should.deep.equal(infer(undefined));
    });

    it('Properly infers Number', () => {
        infer(5).should.deep.equal(infer(6));
    });

    it('Properly infers Error', () => {
        infer(new Error('hello world')).should.deep.equal(infer(new Error('goodbye world')));
    });

    it('Properly infers Tuple', () => {
        infer([5, 'hello']).should.deep.equal(infer([6, 'goodbye']));
    });

    it('Properly infers Array', () => {
        infer([5, 6, 7]).should.deep.equal(infer([8, 9, 10]));
    });

    it('Properly infers nested structures', () => {
        //(Number, [Number], (Number, String))
        infer([5, [6, 7], [8, 'hello']]).should.deep.equal(infer([4, [3], [1, '']]));

        //([Number], [Number], (Number, String))
        infer([[5], [6, 7], [8, 'hello']]).should.deep.equal(infer([[4], [3], [1, '']]));

        //[[Number]]
        infer([[5], [6, 7], [8, 9]]).should.deep.equal(infer([[7]]));
    });

    it('Properly infers custom types.', () => {
        function MyType() {}
        infer(new MyType()).should.deep.equal(infer(new MyType()));
    });

    it('Properly infers object types.', () => {
        infer({hello: 'world'}).should.deep.equal(infer({hello: 'Brandon'}));
    });
});
