import type {
    API,
    Characteristic,
    DynamicPlatformPlugin,
    Logger,
    PlatformAccessory,
    PlatformConfig,
    Service,
    WithUUID,
} from 'homebridge'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings'
import { nobleDiscoverPeripherals } from './adapters/ble'
import { type SensorData, createHandlers, createParserDebugger, debugHandlers } from './thermometer'
import { roundDigits } from './math'
import { attachRssiCharacteristic } from './custom_characteristics'
import { type Config, ConfigBoundary } from './boundaries'

export class BleThermoBeaconPlatform implements DynamicPlatformPlugin {
    public readonly Service: typeof Service = this.api.hap.Service
    public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic
    public readonly accessories: PlatformAccessory[] = []
    private readonly config: Config | null = null

    public constructor(public readonly log: Logger, readonly platformConfig: PlatformConfig, public readonly api: API) {
        this.log.debug('Finished initializing platform:', platformConfig.name)

        try {
            this.config = ConfigBoundary.parse(platformConfig)
        } catch (e) {
            this.log.error('Could not parse config', e)
        }
        this.api.on('didFinishLaunching', () => {
            log.debug('Executed didFinishLaunching callback')
            if (this.config !== null) {
                this.discoverDevices()
            }
        })
    }

    public configureAccessory(accessory: PlatformAccessory): void {
        this.log.info('Loading accessory from cache:', accessory.displayName)
        this.accessories.push(accessory)
    }

    public discoverDevices(): void {
        nobleDiscoverPeripherals(
            debugHandlers(createHandlers(createParserDebugger(this.log)), this.log),
            (sensorData) => {
                const uuid = this.api.hap.uuid.generate(sensorData.sensorId)

                const existingAccessory = this.accessories.find((accessory) => accessory.UUID === uuid)

                if (existingAccessory) {
                    this.applySensorData(sensorData, existingAccessory)
                } else {
                    const accessory = new this.api.platformAccessory(sensorData.sensorId, uuid)
                    this.applySensorData(sensorData, accessory)
                    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
                    this.accessories.push(accessory)
                }
            },
            (error) => this.log.error('Error during BLE discovery %p', error),
        )
    }

    private applySensorData(sensorData: SensorData, accessory: PlatformAccessory): void {
        const accessoryInformation = this.ensureService(accessory, this.Service.AccessoryInformation)
        accessoryInformation.setCharacteristic(this.Characteristic.Model, sensorData.modelName)

        if (typeof sensorData.manufacturer !== 'undefined') {
            accessoryInformation.setCharacteristic(this.Characteristic.Manufacturer, sensorData.manufacturer)
        }

        if (typeof sensorData.firmwareRevision !== 'undefined') {
            accessoryInformation.setCharacteristic(this.Characteristic.FirmwareRevision, sensorData.firmwareRevision)
        }

        if (typeof sensorData.hardwareRevision !== 'undefined') {
            accessoryInformation.setCharacteristic(this.Characteristic.HardwareRevision, sensorData.hardwareRevision)
        }

        if (typeof sensorData.softwareRevision !== 'undefined') {
            accessoryInformation.setCharacteristic(this.Characteristic.SoftwareRevision, sensorData.softwareRevision)
        }

        if (typeof sensorData.serialNumber !== 'undefined') {
            accessoryInformation.setCharacteristic(this.Characteristic.SerialNumber, sensorData.serialNumber)
        }

        const temperature = this.ensureService(accessory, this.Service.TemperatureSensor)

        if (!temperature.getCharacteristic(this.Characteristic.ConfiguredName)) {
            temperature.setCharacteristic(this.Characteristic.ConfiguredName, this.getName(sensorData))
        }

        temperature.setPrimaryService()
        temperature.setCharacteristic(
            this.Characteristic.CurrentTemperature,
            roundDigits(sensorData.temperatureCelsius, 1),
        )

        const diagnostics = this.ensureService(accessory, this.Service.Diagnostics)
        diagnostics.setCharacteristic(this.Characteristic.SupportedDiagnosticsSnapshot, JSON.stringify(sensorData))
        attachRssiCharacteristic(diagnostics, this.api).setValue(roundDigits(sensorData.rssi, 0))
        temperature.addLinkedService(diagnostics)

        if (typeof sensorData.humidityPercentage !== 'undefined') {
            const humidity = this.ensureService(accessory, this.Service.HumiditySensor)
            humidity.setCharacteristic(
                this.Characteristic.CurrentRelativeHumidity,
                roundDigits(sensorData.humidityPercentage, 0),
            )
            temperature.addLinkedService(humidity)
        }

        if (typeof sensorData.batteryPercentage !== 'undefined') {
            const battery = this.ensureService(accessory, this.Service.Battery)
            battery.setCharacteristic(this.Characteristic.BatteryLevel, roundDigits(sensorData.batteryPercentage, 0))
            battery.setCharacteristic(this.Characteristic.ChargingState, this.Characteristic.ChargingState.NOT_CHARGING)
            battery.setCharacteristic(
                this.Characteristic.StatusLowBattery,
                sensorData.batteryPercentage > 10
                    ? this.Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
                    : this.Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW,
            )
            temperature.addLinkedService(battery)
        }

        if (typeof sensorData.buttonPressed !== 'undefined') {
            const lockMechanism = this.ensureService(accessory, this.Service.LockMechanism)
            lockMechanism.setCharacteristic(
                this.Characteristic.LockTargetState,
                this.Characteristic.LockTargetState.SECURED,
            )
            lockMechanism.setCharacteristic(
                this.Characteristic.LockCurrentState,
                sensorData.buttonPressed
                    ? this.Characteristic.LockCurrentState.UNSECURED
                    : this.Characteristic.LockCurrentState.SECURED,
            )
            temperature.addLinkedService(lockMechanism)
        }
    }

    private getName(sensorData: SensorData): string {
        return this.config?.devices.find(({ address }) => address === sensorData.sensorId)?.name || sensorData.sensorId
    }

    private ensureService<T extends WithUUID<typeof Service>>(accessory: PlatformAccessory, service: T): Service {
        return accessory.getService(service) || accessory.addService(service as unknown as Service)
    }
}
