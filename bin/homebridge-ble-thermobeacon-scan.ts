#!/usr/bin/env node
import { nobleDiscoverPeripherals } from '../src/adapters/ble'
import { ThermometerHandlers } from '../src/thermometer'

nobleDiscoverPeripherals(ThermometerHandlers, (sensorData) => {
    console.log(sensorData)
})
