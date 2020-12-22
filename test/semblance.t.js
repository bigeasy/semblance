'use strict'

require('proof')(16, okay => {
    const semblance = require('..')
    //

    // Semblance always returns a boolean, true or false if the value matches
    // the given patterns. The first argument is the value to match followed by
    // zero one or more Semblance patterns to match.

    //
    okay(semblance({ city: 'Traverse City', state: 'MI' }, { state: 'MI' }), 'object contains pattern object')
    okay(semblance({ city: 'Traverse City', state: 'MI' }), 'no pattern always true')
    okay(semblance({
        city: 'Traverse City', state: 'MI'
    }, {
        city: 'Traverse City'
    }, {
        state: 'MI'
    }), 'multiple patterns must all match')
    okay(semblance({ city: 'Traverse City', state: 'MI' }, { state: 'LA' }), 'failed pattern match')
    //

    // Semblance can match primitives as well as objects.

    //
    okay(semblance('1', '1'), 'strings')
    //

    // Semblance uses strict matching with no coercions.

    //
    okay(!semblance('1', 1), 'no coercion')
    //

    // Semblance will match all the primitive types.

    //
    okay(semblance(1, 1), 'numbers')
    //

    // Semblance can match boxed primitives.

    //
    okay(semblance(new Number(1), 1), 'boxed primitive')
    //

    // Semblance can use boxed primitives as patterns.

    //
    okay(semblance(1, new Number(1)), 'boxed primitive pattern')

    okay(semblance({}, {}), 'empty objects')
    okay(semblance({ code: 'ENOENT' }, {}), 'empty object as subset')
    okay(!semblance({}, { code: 'ENOENT' }), 'object subset miss')
    okay(semblance({ code: 'ENOENT' }, { code: /ENOENT/ }), 'nested regex hit')
    okay(!semblance({ code: 'EBADFD' }, { code: /ENOENT/ }), 'nested regex hit')
    okay(semblance([ 1, 2, 3 ], [ 1, 2, 3 ]), 'array equal')
    okay(semblance([ 1, 2, 3 ], [ 1, 2, 3 ], { length: 3 }), 'array equal')
    okay(!semblance([ 1, 2 ], [ 1, 2, 3 ]), 'array does not contain')
    okay(semblance([ 1, 2, 2, 3 ], [ 1, 2, 3 ]), 'array contains subset')
    okay(semblance(/a/, /a/), 'compare regex')
    okay(semblance(NaN, NaN), 'compare NaN')
    okay(semblance(new Date(0), new Date(0)), 'compare Date')
    okay(semblance(null, () => true), 'run function')
})
