
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
          "name": "<string>"
        }
        //, { ... }
      ]
    }
  ]
}
```
<!-- AUTOGENERATED CONFIG DOCS END -->


## Configuration
On Linux, the `CAP_NET_RAW` capability is required for BLE to work.

### Systemd
If you are running homebridge with systemd, you need to add `CAP_NET_RAW` as an ambient capability. Either edit the
`homebridge.service` file directly or place an override in `/etc/systemd/system/homebridge.service.d`.

Create the folder:

```
mkdir /etc/systemd/system/homebridge.service.d
```

Place this drop-in configuration in the folder, e.g. `/etc/systemd/system/homebridge.service.d/bluetooth.conf`:

```ini
[Service]
AmbientCapabilities=CAP_NET_RAW
```

Run `systemctl daemon-reload` to refresh *systemd’s* unit database
and then run `systemd-delta --type=extended` to check if the drop-in worked as expected.

You should see something like this in the output:

```text
…
[EXTENDED]   /lib/systemd/system/homebridge.service → /etc/systemd/system/homebridge.service.d/bluetooth.conf
…
```

Restart homebridge afterwards by running `systemctl restart homebridge`.


## Acknowledgements
This project could not have happened without previous work. Many thanks!
* [Ivko Kalchev](https://github.com/iskalchev)’s implementation of [ThermoBeacon](https://github.com/iskalchev/ThermoBeacon)
* [rnlgreen](https://github.com/rnlgreen)  [Python scripts](https://github.com/rnlgreen/thermobeacon)
