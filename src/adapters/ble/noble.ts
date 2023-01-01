import type _noble from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery } from './api'
import { throttle } from '../../std'

type Noble = typeof _noble
type Peripheral = _noble.Peripheral

function newNoble(module: { default: (new (args: Record<string, unknown>) => Noble) | Noble }): Noble {
    return typeof module.default === 'function' ? new module.default({ extended: false }) : module.default
}

export const nobleDiscoverPeripherals: BlePeripheralsDiscovery = (
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
) => {
    import('@abandonware/noble')
        .then((module) => {
            try {
                const noble = newNoble(module)
                startDiscovery(noble, handlers, sensorDataHandler, errorHandler)
            } catch (e) {
                errorHandler(e as Error)
            }
        })
        .catch((e) => errorHandler(e as Error))
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
