import * as assert from 'assert'
import * as option from '../src/Option'
import * as array from '../src/Array'
import { lift, getFunctorComposition, voidRight, voidLeft, flap } from '../src/Functor'

describe('Functor', () => {
  it('lift', () => {
    const double = (a: number) => a * 2
    const f = lift(option)(double)
    const actual = f(option.some(2))
    assert.deepEqual(actual, option.some(4))
  })

  it('getFunctorComposition', () => {
    const arrayOption = getFunctorComposition(array, option)
    const double = (a: number) => a * 2
    assert.deepEqual(arrayOption.map(double, [option.some(1)]), [option.some(2)])
  })

  it('voidRight', () => {
    assert.deepEqual(voidRight(option)(1)(option.some('a')), option.some(1))
  })

  it('voidLeft', () => {
    assert.deepEqual(voidLeft(option)(option.some(1))('a'), option.some('a'))
  })

  it('flap', () => {
    const gt3 = (n: number) => n >= 3
    const lt5 = (n: number) => n <= 5
    const fs = [gt3, lt5]
    assert.deepEqual(flap(array)(fs)(4), [true, true])
  })
})
