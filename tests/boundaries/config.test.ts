import { describe, expect, test } from '@jest/globals'
import { ConfigBoundary } from '../../src/boundaries'
import { PLATFORM_NAME } from '../../src/settings'

const validAddressFormatCases: Record<string, [string, string]> = {
    'UUID lowercase': ['e8035249ecd4495fa9bfd598dcf2fcaf', 'e8035249ecd4495fa9bfd598dcf2fcaf'],
    'UUID lowercase dash separated': ['e8035249-ecd4-495f-a9bf-d598dcf2fcaf', 'e8035249ecd4495fa9bfd598dcf2fcaf'],
    'UUID uppercase ': ['E8035249ECD4495FA9BFD598DCF2FCAF', 'e8035249ecd4495fa9bfd598dcf2fcaf'],
    'UUID dash separated': ['E8035249-ECD4-495F-A9BF-D598DCF2FCAF', 'e8035249ecd4495fa9bfd598dcf2fcaf'],
    'MAC lowercase': ['b827ebe2d683', 'b827ebe2d683'],
    'MAC uppercase': ['B827EBE2D683', 'b827ebe2d683'],
    'MAC lowercase colon separated': ['b8:27:eb:e2:d6:83', 'b827ebe2d683'],
    'MAC uppercase colon separated': ['B8:27:EB:E2:D6:83', 'b827ebe2d683'],
}

const invalidAddressFormats = [1, 'some string', '00000000-00000000-00000000-00000000', undefined, null]

describe('Test config boundary', () => {
    describe('Valid address formats', () =>
        Object.entries(validAddressFormatCases).forEach(([name, [input, output]]) =>
            test(name, () =>
                expect(
                    ConfigBoundary.parse({
                        platform: PLATFORM_NAME,
                        devices: [{ address: input, name: 'Device' }],
                    }),
                ).toMatchObject({ devices: [{ address: output, name: 'Device' }] }),
            ),
        ))

    describe('Invalid address formats', () => {
        invalidAddressFormats.forEach((format) =>
            test(`Invalid format ${JSON.stringify(format)}`, () =>
                expect(() =>
                    ConfigBoundary.parse({ platform: PLATFORM_NAME, devices: [{ address: format }] }),
                ).toThrow()),
        )
    })
})
