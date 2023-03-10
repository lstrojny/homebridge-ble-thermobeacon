import type { API } from 'homebridge'

import { PLATFORM_NAME } from './settings'
import { BleThermoBeaconPlatform } from './platform'

export = (api: API): void => {
    api.registerPlatform(PLATFORM_NAME, BleThermoBeaconPlatform)
}
