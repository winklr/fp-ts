import { IO, of } from './IO'
import { Option, some, none } from './Option'
import { Either, left, right } from './Either'

// Adapted from https://github.com/purescript/purescript-exceptions

/**
 * Create a JavaScript error, specifying a message
 * @function
 */
export const error = (message: string): Error => {
  return new Error(message)
}

/**
 * Get the error message from a JavaScript error
 * @function
 */
export const message = (e: Error): string => {
  return e.message
}

/**
 * Get the stack trace from a JavaScript error
 * @function
 */
export const stack = (e: Error): Option<string> => {
  return e.stack ? some(e.stack) : none
}

/**
 * Throw an exception
 * @function
 */
export const throwException = <A>(e: Error): IO<A> => {
  return new IO(() => {
    throw e
  })
}

/**
 * Catch an exception by providing an exception handler
 * @function
 */
export const catchException = <A>(handler: (e: Error) => IO<A>) => (action: IO<A>): IO<A> => {
  return new IO(() => {
    try {
      return action.run()
    } catch (e) {
      if (e instanceof Error) {
        return handler(e).run()
      } else {
        return handler(new Error(e.toString())).run()
      }
    }
  })
}

/**
 * Runs an IO and returns eventual Exceptions as a `Left` value. If the
 * computation succeeds the result gets wrapped in a `Right`.
 * @function
 */
export const tryCatch = <A>(action: IO<A>): IO<Either<Error, A>> => {
  return catchException(e => of(left<Error, A>(e)))(action.map(a => right(a)))
}
