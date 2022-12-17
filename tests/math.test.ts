import { describe, expect, test } from '@jest/globals'
import { roundDigits } from '../src/math'

describe('Test math module', () => {
    test('Round to 2 digits', () => {
        expect(roundDigits(10.128, 2)).toBe(10.13)
    })

    test('Will use Math.round by default', () => {
        expect(roundDigits(10.126, 2)).toBe(10.13)
    })

    test('Will not round at all if number of expected digits are greater than actual digits', () => {
        expect(roundDigits(10.123456789, 10)).toBe(10.123456789)
    })

    test('Accepts alternative rounding function', () => {
        expect(roundDigits(10.126, 2, Math.floor)).toBe(10.12)
    })
})
