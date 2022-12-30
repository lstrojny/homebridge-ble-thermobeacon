import { describe, expect, test } from '@jest/globals'
import { ConfigBoundary } from '../../src/boundaries'
import { PLATFORM_NAME } from '../../src/settings'

describe('Test config boundary', () => {
    describe('Address formats', () => {
        test('UUID lowercase dash separated', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'e8035249-ecd4-495f-a9bf-d598dcf2fcaf', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'e8035249ecd4495fa9bfd598dcf2fcaf', name: 'Device name' }],
            })
        })

        test('UUID lowercase', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'e8035249ecd4495fa9bfd598dcf2fcaf', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'e8035249ecd4495fa9bfd598dcf2fcaf', name: 'Device name' }],
            })
        })

        test('UUID uppercase dash separated', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'E8035249-ECD4-495F-A9BF-D598DCF2FCAF', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'e8035249ecd4495fa9bfd598dcf2fcaf', name: 'Device name' }],
            })
        })

        test('UUID uppercase', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'E8035249ECD4495FA9BFD598DCF2FCAF', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'e8035249ecd4495fa9bfd598dcf2fcaf', name: 'Device name' }],
            })
        })

        test('MAC lowercase', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'b827ebe2d683', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'b827ebe2d683', name: 'Device name' }],
            })
        })

        test('MAC uppercase', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'B827EBE2D683', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'b827ebe2d683', name: 'Device name' }],
            })
        })

        test('MAC lowercase colon separated', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'b8:27:eb:e2:d6:83', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'b827ebe2d683', name: 'Device name' }],
            })
        })

        test('MAC uppercase colon separated', () => {
            expect(
                ConfigBoundary.parse({
                    platform: PLATFORM_NAME,
                    devices: [{ address: 'B8:27:EB:E2:D6:83', name: 'Device name' }],
                }),
            ).toEqual({
                platform: PLATFORM_NAME,
                debug: false,
                devices: [{ address: 'b827ebe2d683', name: 'Device name' }],
            })
        })
    })
})
