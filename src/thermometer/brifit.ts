import type { Parser, SensorData, TemperatureData, ThermometerHandler } from './api'
import type { DiscoveredPeripheral, Information, Peripheral } from '../adapters/ble'

export function createBrifitHandler(createParser: () => Parser): ThermometerHandler {
    return new BrifitThermometerHandler(createParser())
}

export function createBrifitParser(): Parser {
    return new BrifitParser()
}

type InformationValues = Information[keyof Information]
function unscramble(value: InformationValues, defaultValue: string, ignore: InformationValues[]): string | undefined {
    return ignore.includes(value) ? defaultValue : value
}

export class BrifitThermometerHandler implements ThermometerHandler {
    static readonly LOCAL_NAME = 'ThermoBeacon'

    constructor(private readonly parser: Parser) {}

    public getName(): string {
        return 'BrifitThermometerHandler'
    }

    public supported(peripheral: DiscoveredPeripheral): boolean {
        return peripheral.advertisement.localName === BrifitThermometerHandler.LOCAL_NAME
    }

    // eslint-disable-next-line  @typescript-eslint/require-await
    public async handlePeripheral(peripheral: Peripheral): Promise<SensorData | null> {
        if (peripheral.advertisement.manufacturerData === null) {
            return null
        }

        const temperatureData = this.parser.parse(peripheral.advertisement.manufacturerData)

        if (temperatureData === null) {
            return null
        }

        const information = peripheral.information

        return {
            sensorId: peripheral.uuid,
            modelName: peripheral.advertisement.localName,
            rssi: peripheral.rssi,

            ...temperatureData,

            // Accessory information delivers garbage where the name equals key
            manufacturer: unscramble(information?.manufacturerName, 'Brifit', ['Manufacturer Name', undefined]),
            firmwareRevision: unscramble(information?.firmwareRevision, 'Unknown', ['Firmware Revision']),
            hardwareRevision: unscramble(information?.hardwareRevision, 'Unknown', ['Hardware Revision']),
            softwareRevision: unscramble(information?.softwareRevision, 'Unknown', ['Software Revision']),
            serialNumber: unscramble(information?.serialNumber, 'Unknown', ['Serial Number']),
        }
    }
}

export class BrifitParser implements Parser {
    public getName(): string {
        return 'BrifitParser'
    }

    public parse(msg: Buffer): TemperatureData | null {
        /**
         * From https://github.com/iskalchev/ThermoBeacon/
         *
         * ADVERTISING MESSAGES
         * Decode Manufacturer specific data from BLE Advertising message
         *
         * Message length: 20 bytes
         * bytes | content
         * ========================================================
         * 00-01 | code
         * 02-02 | 00 ?
         * 03-03 | 0x80 if Button is pressed else 00
         * 04-09 | mac address
         * 10-11 | battery level: seems that 3400 = 100% (3400 mV, not quite sure)
         * 12-13 | temperature
         * 14-15 | humidity
         * 16-19 | uptime: seconds since the last reset
         */
        if (msg.length !== 20 || msg.readUInt8(0) !== 0x15) {
            return null
        }

        return {
            buttonPressed: msg.readUInt8(3) === 128,
            batteryPercentage: (msg.readUInt16LE(10) / 3400) * 100,
            temperatureCelsius: msg.readInt16LE(12) / 16,
            humidityPercentage: msg.readInt16LE(14) / 16,
            uptime: msg.readUInt32LE(16),
        }
    }
}
