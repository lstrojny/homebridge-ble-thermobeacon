import type { DiscoveredPeripheral, Peripheral } from '../adapters/ble'

export type SensorData = {
    sensorId: string
    modelName: string
    rssi: number
    temperatureCelsius: number
    humidityPercentage?: number
    batteryPercentage?: number
    buttonPressed?: boolean
    uptime?: number
    manufacturer?: string
    firmwareRevision?: string
    hardwareRevision?: string
    softwareRevision?: string
    serialNumber?: string
}

export interface ThermometerHandler {
    supported(peripheral: DiscoveredPeripheral): boolean
    handlePeripheral(peripheral: Peripheral): Promise<SensorData | null>
}
