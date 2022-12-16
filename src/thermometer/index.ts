import { BrifitThermometerHandler } from './brifit'

export type { ThermometerHandler, SensorData } from './api'

export const ThermometerHandlers = [new BrifitThermometerHandler()]
