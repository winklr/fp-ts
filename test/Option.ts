import * as assert from 'assert'
import {
  getSetoid,
  fold,
  none,
  map,
  some,
  ap,
  chain,
  alt,
  getMonoid,
  fromNullable,
  getFirstMonoid,
  getLastMonoid,
  tryCatch,
  Option,
  fromEither
} from '../src/Option'
import * as array from '../src/Array'
import { setoidNumber } from '../src/Setoid'
import { identity } from '../src/function'
import { left, right } from '../src/Either'

describe('Option', () => {
  it('fold', () => {
    const f = () => 'none'
    const g = (s: string) => `some${s.length}`
    assert.strictEqual(fold(f, g)(none), 'none')
    assert.strictEqual(fold(f, g)(some('abc')), 'some3')
  })

  it('getOrElse', () => {
    const x: Option<number> = some(1)
    assert.strictEqual(x.getOrElse(() => 0), 1)
    const y: Option<number> = none
    assert.strictEqual(y.getOrElse(() => 0), 0)
  })

  it('getOrElseValue', () => {
    const x: Option<number> = some(1)
    assert.strictEqual(x.getOrElseValue(0), 1)
    const y: Option<number> = none
    assert.strictEqual(y.getOrElseValue(0), 0)
  })

  it('equals', () => {
    const { equals } = getSetoid(setoidNumber)
    assert.strictEqual(equals(none)(none), true)
    assert.strictEqual(equals(none)(some(1)), false)
    assert.strictEqual(equals(some(2))(some(1)), false)
    assert.strictEqual(equals(some(2))(some(2)), true)
  })

  it('map', () => {
    const f = (n: number) => n * 2
    assert.deepEqual(map(f, some(2)), some(4))
  })

  it('mapNullable', () => {
    type Nested = {
      foo?: number
      foo2: {
        bar2?: string
      }
    }
    const nested: Nested = {
      foo2: {}
    }
    const nestedOption = some(nested)
    assert.deepEqual(nestedOption.mapNullable(value => value.foo), none)
    assert.deepEqual(nestedOption.mapNullable(value => value.foo2), some(nested.foo2))
    assert.deepEqual(nestedOption.mapNullable(value => value.foo2.bar2), none)
    assert.deepEqual(none.mapNullable(identity), none)
  })

  it('ap', () => {
    const f = (n: number) => n * 2
    assert.deepEqual(ap(some(f), some(2)), some(4))
    assert.deepEqual(ap(some(f), none), none)
    assert.deepEqual(ap(none, some(2)), none)
    assert.deepEqual(ap(some(f), some(2)), some(4))
  })

  it('chain', () => {
    const f = (n: number) => some(n * 2)
    const g = () => none
    assert.deepEqual(chain(f, some(2)), some(4))
    assert.deepEqual(chain(g, some(2)), none)
  })

  it('getMonoid', () => {
    const { concat } = getMonoid({
      concat: (x: number) => (y: number) => {
        return x + y
      }
    })
    assert.deepEqual(concat(none)(some(1)), some(1))
    assert.deepEqual(concat(some(2))(none), some(2))
    assert.deepEqual(concat(some(2))(some(1)), some(3))
  })

  it('alt', () => {
    assert.deepEqual(alt(some(1), some(2)), some(1))
    assert.deepEqual(alt(none, some(2)), some(2))
    assert.deepEqual(alt(some(1), none), some(1))
    assert.deepEqual(alt(none, none), none)
  })

  it('fromNullable', () => {
    assert.deepEqual(fromNullable(2), some(2))
    assert.deepEqual(fromNullable(null), none)
    assert.deepEqual(fromNullable(undefined), none)
  })

  it('traverse', () => {
    assert.deepEqual(some('hello').traverse(array)(s => [s.length]), [some(5)])
    assert.deepEqual(none.traverse(array)(s => [s]), [none])
  })

  it('reduce', () => {
    const x = fromNullable<number>(null).reduce((b, a) => 1, 2)
    assert.strictEqual(x, 2)
    const y = fromNullable(3).reduce((b, a) => a.toString(), '4')
    assert.strictEqual(y, '3')
  })

  it('getFirstMonoid', () => {
    const first = getFirstMonoid<number>()
    assert.deepEqual(first.concat(none)(some(1)), some(1))
    assert.deepEqual(first.concat(some(1))(none), some(1))
    assert.deepEqual(first.concat(none)(none), none)
    assert.deepEqual(first.concat(some(1))(some(2)), some(1))
  })

  it('getLastMonoid', () => {
    const last = getLastMonoid<number>()
    assert.deepEqual(last.concat(none)(some(1)), some(1))
    assert.deepEqual(last.concat(some(1))(none), some(1))
    assert.deepEqual(last.concat(none)(none), none)
    assert.deepEqual(last.concat(some(1))(some(2)), some(2))
  })

  it('contains', () => {
    const x: Option<number> = none
    assert.equal(x.contains(setoidNumber, 2), false)
    assert.equal(some(2).contains(setoidNumber, 2), true)
    assert.equal(some(2).contains(setoidNumber, 1), false)
  })

  it('isNone', () => {
    const x: Option<number> = none
    assert.equal(x.isNone(), true)
    assert.equal(some(1).isNone(), false)
    assert.equal(some(null).isNone(), false)
  })

  it('isSome', () => {
    const x: Option<number> = none
    assert.equal(x.isSome(), false)
    assert.equal(some(1).isSome(), true)
    assert.equal(some(null).isSome(), true)
  })

  it('exists', () => {
    const x: Option<number> = none
    const is2 = (a: number) => a === 2

    assert.equal(x.exists(is2), false)
    assert.equal(some(1).exists(is2), false)
    assert.equal(some(2).exists(is2), true)
  })

  it('filter', () => {
    const x: Option<number> = none
    const is2 = (a: number) => a === 2
    assert.equal(x.filter(is2), x)
    assert.equal(some(1).filter(is2), none)
    const some2 = some(2)
    assert.equal(some2.filter(is2), some2)
  })

  it('tryCatch', () => {
    assert.deepEqual(tryCatch(() => JSON.parse('2')), some(2))
    assert.deepEqual(tryCatch(() => JSON.parse('(')), none)
  })

  it('fromEither', () => {
    assert.deepEqual(fromEither(left('foo')), none)
    assert.deepEqual(fromEither(right(1)), some(1))
  })

  it('toString', () => {
    assert.strictEqual(some(2).toString(), 'some(2)')
    const d = new Date()
    assert.strictEqual(some(new Date()).toString(), `some(new Date('${d.toISOString()}'))`)
    assert.strictEqual(some({ a: 1 }).toString(), 'some({\n  "a": 1\n})')
  })
})
