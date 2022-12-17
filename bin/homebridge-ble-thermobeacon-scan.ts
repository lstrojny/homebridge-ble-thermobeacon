#!/usr/bin/env node
import { nobleDiscoverPeripherals } from '../src/adapters/ble'
import { createHandlers } from '../src/thermometer'

nobleDiscoverPeripherals(createHandlers(), (sensorData) => {
    console.log(sensorData)
})
