import Noble, { type Peripheral, type ServicesAndCharacteristics } from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery, Information } from './api'
import { DelayingQueue } from '../../work_queue/delaying_queue'

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

            void queue.schedule(() => noble.startScanning([], true))
        })

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        noble.on('discover', (noblePeripheral: Peripheral) => {
            void queue.schedule(() =>
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

                    void queue.schedule(() => noble.startScanning([], true))
                }),
            )
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

const queue = new DelayingQueue(process.platform === 'linux' ? 100 : 10)

async function discoverInformation(peripheral: Peripheral): Promise<Information> {
    if (peripheral.uuid in discoveredInformation) {
        return discoveredInformation[peripheral.uuid]
    }

    const promise = (async function (peripheral: Peripheral): Promise<Information> {
        await queue.schedule(() => peripheral.connectAsync())

        try {
            const { characteristics } = await queue.schedule<Promise<ServicesAndCharacteristics>>(() =>
                peripheral.discoverSomeServicesAndCharacteristicsAsync(['180a'], []),
            )

            const information: Information = {}
            for (const characteristic of characteristics) {
                if (Object.keys(types).includes(characteristic.type) && characteristic.properties.includes('read')) {
                    await queue.schedule(() => characteristic.subscribe())
                    try {
                        information[types[characteristic.type]] = (
                            await queue.schedule<Promise<Buffer>>(() => characteristic.readAsync())
                        ).toString()
                    } finally {
                        await queue.schedule(() => characteristic.unsubscribe())
                    }
                }
            }

            return information
        } finally {
            await queue.schedule(() => peripheral.disconnectAsync())
        }
    })(peripheral)

    // Store the promise in the cache map and try again on error
    return (discoveredInformation[peripheral.uuid] = promise.catch((e) => {
        delete discoveredInformation[peripheral.uuid]

        throw e
    }))
}
