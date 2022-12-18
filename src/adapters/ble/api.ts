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
export type DiscoveredPeripheral = {
    uuid: string
    rssi: number
    advertisement: Advertisement
}

export type Peripheral = DiscoveredPeripheral & { information?: Information }

export type Information = {
    modelNumber?: string
    firmwareRevision?: string
    hardwareRevision?: string
    softwareRevision?: string
    manufacturerName?: string
    serialNumber?: string
}
