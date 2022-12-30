import type { SensorData, ThermometerHandler } from '../../thermometer'

export type BlePeripheralsDiscovery = (
    handlers: ThermometerHandler[],
    sensorDataHandler: (sensorData: SensorData) => void,
    errorHandler: (error: Error) => void,
) => void

export type Advertisement = {
    localName: string
    manufacturerData: Buffer | null
}
export type Peripheral = {
    uuid: string
    rssi: number
    advertisement: Advertisement
}
