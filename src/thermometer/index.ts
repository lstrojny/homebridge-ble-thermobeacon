import { createBrifitHandler, createBrifitParser } from './brifit'
import type { Parser, ThermometerHandler } from './api'

export type { ThermometerHandler, SensorData } from './api'

const factories: [(cp: () => Parser) => ThermometerHandler, () => Parser][] = [
    [createBrifitHandler, createBrifitParser],
]

type CreateHandlers = (debugParser?: (createParser: () => Parser) => () => Parser) => ThermometerHandler[]

export const createHandlers: CreateHandlers = (debugParser = (createParser: () => Parser) => createParser) =>
    factories.map(([createHandler, createParser]) => createHandler(debugParser(createParser)))

export { ThermometerDebugger, debugHandlers, createParserDebugger } from './debugger'
