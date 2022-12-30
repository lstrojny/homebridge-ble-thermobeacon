import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import { throttle } from '../src/std'

jest.useFakeTimers()

let count = 0

describe('Test throttle', () => {
    const fn = jest.fn()
    const throttledFn = throttle(1000, fn, () => `key-${count}`)

    beforeEach(() => {
        jest.clearAllMocks()
        count += 1
    })

    test('Invokes throttled function on initial invocation', () => {
        fn.mockReturnValueOnce('1st')
        expect(throttledFn()).toBe('1st')
        expect(fn.mock.calls.length).toBe(1)
        jest.runAllTimers()
        expect(fn.mock.calls.length).toBe(1)
    })

    test('Invokes throttled function after timeout', () => {
        fn.mockReturnValueOnce('1st')
        expect(throttledFn()).toBe('1st')
        expect(throttledFn()).toBe('1st')

        fn.mockReturnValueOnce('2nd')
        jest.runAllTimers()
        expect(fn.mock.calls.length).toBe(2)
        expect(throttledFn()).toBe('2nd')
        jest.runAllTimers()
        expect(fn.mock.calls.length).toBe(3)
    })
})
