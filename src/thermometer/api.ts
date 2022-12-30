import type { Peripheral } from '../adapters/ble'

export type SensorData = {
    sensorId: string
    modelName: string
    rssi: number
    manufacturer?: string
    firmwareRevision?: string
    hardwareRevision?: string
    softwareRevision?: string
    serialNumber?: string
} & TemperatureData

export type TemperatureData = {
    temperatureCelsius: number
    humidityPercentage?: number
    batteryPercentage?: number
    buttonPressed?: boolean
    uptime?: number
}

export interface ThermometerHandler {
    getName(): string
    supported(peripheral: Peripheral): boolean
    handlePeripheral(peripheral: Peripheral): Promise<SensorData | null>
}

export interface Parser {
    getName(): string
    parse(msg: Buffer): TemperatureData | null
}
