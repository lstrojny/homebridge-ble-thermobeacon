#!/usr/bin/env node
import { nobleDiscoverPeripherals } from '../src/adapters/ble'
import { createHandlers } from '../src/thermometer'

const deviceIds: Set<string> = new Set()
nobleDiscoverPeripherals(
    createHandlers(),
    (sensorData) => {
        deviceIds.add(sensorData.sensorId)
        console.log('%d sensors detected', deviceIds.size)
        console.log(sensorData)
    },
    console.error,
)
