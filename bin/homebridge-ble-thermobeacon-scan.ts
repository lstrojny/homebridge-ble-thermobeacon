#!/usr/bin/env node
import { nobleDiscoverPeripherals } from '../src/adapters/ble'
import { createHandlers } from '../src/thermometer'

const sensorsFound: string[] = []

nobleDiscoverPeripherals(
    createHandlers(),
    (sensorData) => {
        if (!sensorsFound.includes(sensorData.sensorId)) {
            sensorsFound.push(sensorData.sensorId)
        }
        console.log(`${sensorsFound.length} sensors found`)
        console.log(sensorData)
    },
    console.error,
)
