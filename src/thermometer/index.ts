import { BrifitThermometerHandler } from './brifit'
import type { ThermometerHandler } from './api'

export type { ThermometerHandler, SensorData } from './api'
export const createHandlers: () => ThermometerHandler[] = () => [new BrifitThermometerHandler()]
export { ThermometerDebugger, debugHandlers } from './debugger'
