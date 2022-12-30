import { describe, expect, test } from '@jest/globals'
import { BrifitParser, BrifitThermometerHandler } from '../../src/thermometer/brifit'
import type { Parser, TemperatureData } from '../../src/thermometer/api'

describe('Test Brifit handler', () => {
    const brifitHandler = new BrifitThermometerHandler(
        new (class implements Parser {
            getName(): string {
                return 'stub'
            }
            parse(msg: Buffer): TemperatureData | null {
                expect(msg).toHaveLength(0)
                return { temperatureCelsius: 22.05 }
            }
        })(),
    )
    const RSSI = -70
    const UUID = 'abcdefg'

    test('Supports beacons if local name is ThermoBeacon', () => {
        expect(
            brifitHandler.supported({
                uuid: UUID,
                rssi: RSSI,
                advertisement: { localName: 'ThermoBeacon', manufacturerData: null },
            }),
        ).toBe(true)
    })

    test('Does not support other beacons', () => {
        expect(
            brifitHandler.supported({
                uuid: UUID,
                rssi: RSSI,
                advertisement: { localName: 'SomethingElse', manufacturerData: null },
            }),
        ).toBe(false)
    })

    test('Handle peripheral will return null if manufacturer data is null', async () => {
        expect(
            await brifitHandler.handlePeripheral({
                uuid: UUID,
                rssi: RSSI,
                advertisement: { localName: 'ThermoBeacon', manufacturerData: null },
            }),
        ).toBe(null)
    })

    test('Handle foobar’ed peripheral metadata', async () => {
        expect(
            await brifitHandler.handlePeripheral({
                uuid: UUID,
                rssi: RSSI,
                advertisement: { localName: 'ThermoBeacon', manufacturerData: Buffer.from([]) },
            }),
        ).toEqual({
            firmwareRevision: 'Unknown',
            hardwareRevision: 'Unknown',
            manufacturer: 'Brifit',
            modelName: 'ThermoBeacon',
            rssi: -70,
            sensorId: 'abcdefg',
            serialNumber: 'Unknown',
            softwareRevision: 'Unknown',
            temperatureCelsius: 22.05,
        })
    })
})

function hexStrToBuffer(hex: string): Buffer {
    return Buffer.from(hex.replace(/ /g, ''), 'hex')
}

describe('Test Brifit parser', () => {
    const brifitParser = new BrifitParser()

    test('Parser will return null if buffer length is not 20', () => {
        expect(brifitParser.parse(Buffer.from([]))).toBe(null)
    })

    test('Parser will return null if unexpected first byte', () => {
        expect(brifitParser.parse(Buffer.from(new Array(20)))).toBe(null)
    })

    test('Parser will parse temperature, humidity and so on', () => {
        const msg = hexStrToBuffer('15 00 00 80 62 00 00 00 92 d6 ca 0b 4c 01 e4 02 64 f6 03 00')
        expect(brifitParser.parse(msg)).toEqual({
            buttonPressed: true,
            batteryPercentage: 88.76470588235294,
            humidityPercentage: 46.25,
            temperatureCelsius: 20.75,
            uptime: 259684,
        })
    })
})
