import type { API, Characteristic, Service } from 'homebridge'

const RSSI_DISPLAY_NAME = 'RSSI'

// UUIDv5(ns:DNS, _hap.strojny.net) -> 0ae9619f-b05b-5257-a5fc-b4547bea7396
// UUIDv5(0ae9619f-b05b-5257-a5fc-b4547bea7396, RSSI) -> 752574c8-5c0d-56b5-b463-fcf61ae516e4
const RSSI_UUID = '752574c8-5c0d-56b5-b463-fcf61ae516e4'

export function attachRssiCharacteristic(target: Service, api: API): Characteristic {
    return (
        target.getCharacteristic(RSSI_DISPLAY_NAME) ||
        target.addCharacteristic(
            new api.hap.Characteristic(RSSI_DISPLAY_NAME, RSSI_UUID, {
                format: api.hap.Formats.INT,
                perms: [api.hap.Perms.NOTIFY, api.hap.Perms.PAIRED_READ],
                unit: 'dbm',
                maxValue: +1000,
                minValue: -1000,
                minStep: 1,
            }),
        )
    )
}
