import type { SensorData, ThermometerHandler } from './api'
import type { DiscoveredPeripheral, Peripheral } from '../adapters/ble'

export class BrifitThermometerHandler implements ThermometerHandler {
    static readonly LOCAL_NAME = 'ThermoBeacon'

    public supported(peripheral: DiscoveredPeripheral): boolean {
        return peripheral.advertisement.localName === BrifitThermometerHandler.LOCAL_NAME
    }

    // eslint-disable-next-line  @typescript-eslint/require-await
    public async handlePeripheral(peripheral: Peripheral): Promise<SensorData | null> {
        if (peripheral.advertisement.manufacturerData?.length !== 20) {
            return null
        }

        return BrifitThermometerHandler.parseAdvertisement(peripheral, peripheral.advertisement.manufacturerData)
    }

    private static parseAdvertisement(peripheral: Peripheral, msg: Buffer): SensorData | null {
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
        return {
            sensorId: peripheral.uuid,
            modelName: peripheral.advertisement.localName,
            rssi: peripheral.rssi,
            buttonPressed: msg.readInt8(3) !== 0,
            batteryPercentage: (msg.readUInt16LE(10) / 3400) * 100,
            temperatureCelsius: msg.readInt16LE(12) / 16,
            humidityPercentage: msg.readInt16LE(14) / 16,
            uptime: msg.readUInt32LE(16),

            // Accessory information delivers garbage, name equals key
            manufacturer:
                peripheral.information?.manufacturerName !== 'Manufacturer Name'
                    ? peripheral.information?.manufacturerName
                    : 'Brifit',
            firmwareRevision:
                peripheral.information?.firmwareRevision !== 'Firmware Revision'
                    ? peripheral.information?.firmwareRevision
                    : 'Unknown',
            hardwareRevision:
                peripheral.information?.hardwareRevision !== 'Hardware Revision'
                    ? peripheral.information?.hardwareRevision
                    : 'Unknown',
            softwareRevision:
                peripheral.information?.softwareRevision !== 'Software Revision'
                    ? peripheral.information?.softwareRevision
                    : 'Unknown',
            serialNumber:
                peripheral.information?.serialNumber !== 'Serial Number'
                    ? peripheral.information?.softwareRevision
                    : 'Unknown',
        }
    }
}
