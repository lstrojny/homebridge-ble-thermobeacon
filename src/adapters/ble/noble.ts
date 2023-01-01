import type Noble from '@abandonware/noble'
import type { SensorData, ThermometerHandler } from '../../thermometer'
import type { BlePeripheralsDiscovery } from './api'
import { throttle } from '../../std'

function newNoble(module: {
    default: (new (args: Record<string, unknown>) => typeof Noble) | typeof Noble
}): typeof Noble {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Type information are foobar’ed
    const noble = typeof module.default === 'function' ? new module.default({ extended: false }) : module.default
    return noble
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
            } catch (e) {
                errorHandler(e as Error)
            }
        })
        .catch((e) => errorHandler(e as Error))
}

function handleDiscover(
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
    noblePeripheral: Noble.Peripheral,
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
