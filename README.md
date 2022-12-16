
<p align="center">
<img src="https://github.com/homebridge/branding/raw/master/logos/homebridge-wordmark-logo-vertical.png" width="150">
</p>

# Homebridge plugin for Brifit/ORIA thermometers

## Installation

Run `npm install -g homebridge-ble-thermobeacon`

Enable the plugin in the homebridge `config.json`:
```json lines
{
  // ...
  "platforms": [
    {
      "platform": "BleThermoBeacon"
    }
  ]
}
```

## Acknowledgements
This project could not have happened without previous work. Many thanks!
* [Ivko Kalchev](https://github.com/iskalchev)’s implementation of [ThermoBeacon](https://github.com/iskalchev/ThermoBeacon)
* [rnlgreen](https://github.com/rnlgreen)  [Python scripts](https://github.com/rnlgreen/thermobeacon)