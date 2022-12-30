import { z } from 'zod'
import { ConfigBoundary as ConfigBoundaryWithoutPlatform } from '../generated/config_boundary'
import { PLATFORM_NAME } from '../settings'

export const ConfigBoundary = z.intersection(
    ConfigBoundaryWithoutPlatform.augment({
        devices: ConfigBoundaryWithoutPlatform.shape.devices.transform((devices) => {
            return devices.map(({ address, ...rest }) => {
                return { address: address.replace(/[:-]/g, '').toLowerCase(), ...rest }
            })
        }),
    }),
    z.object({ platform: z.literal(PLATFORM_NAME) }),
)
export type Config = z.infer<typeof ConfigBoundary>
export type DeviceAddress = Config['devices'][number]['address']
