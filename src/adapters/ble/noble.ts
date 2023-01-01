import type NobleModule from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery } from './api'
import { throttle } from '../../std'

type Noble = typeof NobleModule
type Peripheral = NobleModule.Peripheral

export const nobleDiscoverPeripherals: BlePeripheralsDiscovery = (
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
) => {
    import('@abandonware/noble')
        .then((module) => {
            try {
                startDiscovery(newNoble(module), handlers, sensorDataHandler, errorHandler)
            } catch (e) {
                errorHandler(e as Error)
            }
        })
        .catch((e) => errorHandler(e as Error))
}

function newNoble(module: { default: (new (args: Record<string, unknown>) => Noble) | Noble }): Noble {
    return typeof module.default === 'function' ? new module.default({ extended: false }) : module.default
}

function startDiscovery(
    noble: Noble,
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
) {
    noble.on('stateChange', (state: string) => {
        if (state !== 'poweredOn') {
            return
        }

        noble.startScanning([], true)
    })

    noble.on(
        'discover',
        throttle(
            3_000,
            handleDiscover.bind(null, handlers, sensorDataHandler, errorHandler),
            (peripheral) => peripheral.uuid,
        ),
    )
}

function handleDiscover(
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
    noblePeripheral: Peripheral,
) {
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
            handler
                .handlePeripheral(peripheral)
                .then((sensorData) => {
                    if (sensorData !== null) {
                        sensorDataHandler(sensorData)
                    }
                })
                .catch(errorHandler)
        }
    }
}
