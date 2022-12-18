import Noble, { type Peripheral } from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery, Information } from './api'

export const nobleDiscoverPeripherals: BlePeripheralsDiscovery = (
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
) => {
    try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Type information are foobar’ed
        const noble = new Noble({}) as typeof Noble

        noble.on('stateChange', (state) => {
            if (state !== 'poweredOn') {
                return
            }

            noble.startScanning([], true)
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        noble.on('discover', (noblePeripheral: Peripheral) => {
            noble.stopScanning(() => {
                const peripheral = {
                    uuid: noblePeripheral.uuid,
                    rssi: noblePeripheral.rssi,
                    advertisement: {
                        localName: noblePeripheral.advertisement.localName,
                        manufacturerData: noblePeripheral.advertisement.manufacturerData,
                    },
                }

                for (const handler of handlers) {
                    if (handler.supported(peripheral)) {
                        discoverInformation(noblePeripheral)
                            .then((information) => {
                                handler
                                    .handlePeripheral({ ...peripheral, information })
                                    .then((sensorData) => {
                                        if (sensorData !== null) {
                                            sensorDataHandler(sensorData)
                                        }
                                    })
                                    .catch(errorHandler)
                            })
                            .catch(errorHandler)
                    }
                }

                noble.startScanning([], true)
            })
        })
    } catch (e) {
        errorHandler(e as Error)
    }
}

const types: Record<string, keyof Information> = {
    'org.bluetooth.characteristic.model_number_string': 'modelNumber',
    'org.bluetooth.characteristic.firmware_revision_string': 'firmwareRevision',
    'org.bluetooth.characteristic.hardware_revision_string': 'hardwareRevision',
    'org.bluetooth.characteristic.software_revision_string': 'softwareRevision',
    'org.bluetooth.characteristic.manufacturer_name_string': 'manufacturerName',
    'org.bluetooth.characteristic.serial_number_string': 'serialNumber',
}

const discoveredInformation: Record<string, Promise<Information>> = {}

async function discoverInformation(peripheral: Peripheral): Promise<Information> {
    if (peripheral.uuid in discoveredInformation) {
        return discoveredInformation[peripheral.uuid]
    }

    const promise = (async function (peripheral: Peripheral): Promise<Information> {
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

            return information
        } finally {
            await peripheral.disconnectAsync()
        }
    })(peripheral)

    // Try again on error
    promise.catch((e) => {
        delete discoveredInformation[peripheral.uuid]

        throw e
    })

    // Store the promise in the cache map
    return (discoveredInformation[peripheral.uuid] = promise)
}
