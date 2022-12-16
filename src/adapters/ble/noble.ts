import Noble, { type Peripheral } from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery, Information } from './api'

const types: Record<string, keyof Information> = {
    'org.bluetooth.characteristic.model_number_string': 'modelNumber',
    'org.bluetooth.characteristic.firmware_revision_string': 'firmwareRevision',
    'org.bluetooth.characteristic.hardware_revision_string': 'hardwareRevision',
    'org.bluetooth.characteristic.software_revision_string': 'softwareRevision',
    'org.bluetooth.characteristic.manufacturer_name_string': 'manufacturerName',
    'org.bluetooth.characteristic.serial_number_string': 'serialNumber',
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore Type information are foobar’ed
const noble = new Noble() as typeof Noble

export const nobleDiscoverPeripherals: BlePeripheralsDiscovery = (
    handlers: ThermometerHandler[],
    onSensorData: (sensorData: SensorData) => void,
) => {
    noble.on('stateChange', (state) => {
        if (state !== 'poweredOn') {
            return
        }

        void noble.startScanningAsync([], true)
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    noble.on('discover', async (peripheral: Peripheral) => {
        await noble.stopScanningAsync()

        for (const handler of handlers) {
            if (handler.supported(peripheral)) {
                handler
                    .handlePeripheral({
                        uuid: peripheral.uuid,
                        rssi: peripheral.rssi,
                        advertisement: {
                            localName: peripheral.advertisement.localName,
                            manufacturerData: peripheral.advertisement.manufacturerData,
                        },
                        information: await discoverInformation(peripheral),
                    })
                    .then((sensorData) => {
                        if (sensorData !== null) {
                            onSensorData(sensorData)
                        }
                    })
                    .catch(() => {
                        // TBD: log
                    })
            }
        }

        await noble.startScanningAsync()
    })
}

const discoveredInformation: Record<string, Information> = {}

async function discoverInformation(peripheral: Peripheral): Promise<Information> {
    if (peripheral.uuid in discoveredInformation) {
        return discoveredInformation[peripheral.uuid]
    }

    await peripheral.connectAsync()
    try {
        const { characteristics } = await peripheral.discoverSomeServicesAndCharacteristicsAsync(['180a'], [])
        const information: Information = {}
        for (const characteristic of characteristics) {
            if (Object.keys(types).includes(characteristic.type) && characteristic.properties.includes('read')) {
                characteristic.subscribe()
                try {
                    information[types[characteristic.type]] = (await characteristic.readAsync()).toString()
                } finally {
                    characteristic.unsubscribe()
                }
            }
        }

        return (discoveredInformation[peripheral.uuid] = information)
    } finally {
        await peripheral.disconnectAsync()
    }
}
