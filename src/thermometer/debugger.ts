import type { SensorData, ThermometerHandler } from './index'
import type { Peripheral } from '../adapters/ble'
import type { Logger } from 'homebridge'
import type { Parser, TemperatureData } from './api'

export function debugHandlers(handlers: ThermometerHandler[], logger: Logger): ThermometerHandler[] {
    return handlers.map((handler) => new ThermometerDebugger(handler, logger))
}

export class ThermometerDebugger implements ThermometerHandler {
    public constructor(
        private readonly handler: ThermometerHandler,
        private readonly logger: Logger,
    ) {}

    public getName(): string {
        return `HandlerDebugger(${this.handler.getName()})`
    }

    public supported(peripheral: Peripheral): boolean {
        const supported = this.handler.supported(peripheral)

        this.logger.debug(
            `Handler ${this.handler.getName()} ${supported ? 'can' : 'cannot'} handle ${JSON.stringify(peripheral)}`,
        )

        return supported
    }

    public async handlePeripheral(peripheral: Peripheral): Promise<SensorData | null> {
        const sensorData = await this.handler.handlePeripheral(peripheral)

        this.logger.debug(
            `Handler ${this.handler.getName()} returned sensor data ${JSON.stringify(sensorData)} for ${JSON.stringify(
                peripheral,
            )}`,
        )

        return sensorData
    }
}

export function createParserDebugger(logger: Logger): (createParser: () => Parser) => () => Parser {
    return (createParser: () => Parser) => () => new ParserDebugger(createParser(), logger)
}

export class ParserDebugger implements Parser {
    constructor(
        private readonly parser: Parser,
        private readonly logger: Logger,
    ) {}

    public getName(): string {
        return `ParserDebugger(${this.parser.getName()})`
    }

    public parse(msg: Buffer): TemperatureData | null {
        const temperatureData = this.parser.parse(msg)
        this.logger.debug(
            `${this.parser.getName()} returned ${JSON.stringify(temperatureData)} for ${msg.toString('hex')}`,
        )
        return temperatureData
    }
}
