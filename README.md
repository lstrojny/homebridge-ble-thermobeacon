
<p align="center">
<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge plugin for Brifit/ORIA thermometers
[![CI](https://github.com/lstrojny/homebridge-ble-thermobeacon/actions/workflows/build.yml/badge.svg)](https://github.com/lstrojny/homebridge-ble-thermobeacon/actions/workflows/build.yml) [![npm version](https://badge.fury.io/js/homebridge-ble-thermobeacon.svg)](https://badge.fury.io/js/homebridge-ble-thermobeacon) ![Libraries.io dependency status for GitHub repo](https://img.shields.io/librariesio/github/lstrojny/homebridge-ble-thermobeacon) ![npm](https://img.shields.io/npm/dw/homebridge-ble-thermobeacon)

## Installation

Run `npm install -g homebridge-ble-thermobeacon`

Enable the plugin in the homebridge `config.json`:
<!-- AUTOGENERATED CONFIG DOCS BEGIN -->
```json5
{
  // ...
  "platforms": [
    {
      "platform": "PrometheusExporter",


      // Debugging enabled
      "debug": "<boolean>",


      // Publish button press as lock
      //
      // Publish button pressed state as a lock. Pressed button is presented as
      // unlocked, otherwise locked. Can help identify the beacon
      "buttonAsLock": "<boolean>",


      // List of devices
      [
        {
          // Address
          //
          // Bluetooth address of the thermometer. MAC address on Linux, UUID on Mac
          "address": "<string>",


          // Name
          //
          // Specify a name for the thermometer in Homebridge
          "name": "<string>",


          // Publish button press as lock
          //
          // Per device settings to publish button pressed state as a lock
          "buttonAsLock": "<boolean>"
        }
        //, { ... }
      ]
    }
  ]
}
```
<!-- AUTOGENERATED CONFIG DOCS END -->

## Acknowledgements
This project could not have happened without previous work. Many thanks!
* [Ivko Kalchev](https://github.com/iskalchev)’s implementation of [ThermoBeacon](https://github.com/iskalchev/ThermoBeacon)
* [rnlgreen](https://github.com/rnlgreen)  [Python scripts](https://github.com/rnlgreen/thermobeacon)
