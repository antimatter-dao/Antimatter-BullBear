export interface WrappedPromise<T> {
  read: () => T | undefined | Error
}

export default function wrapPromise<T>(promise: Promise<any>): WrappedPromise<T> {
  let status = 'pending'
  let result: T | Error | undefined
  const suspender = promise.then(
    (r: any) => {
      status = 'success'
      result = r
    },
    (e: Error) => {
      status = 'error'
      result = e
    }
  )
  return {
    read() {
      if (status === 'pending') {
        throw suspender
      } else if (status === 'error') {
        throw result
      } else if (status === 'success') {
        return result
      }
      return undefined
    }
  }
}
