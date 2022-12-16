import { Formats, Perms } from 'homebridge'

// eslint-disable-next-line import/no-extraneous-dependencies
import { Characteristic } from 'hap-nodejs'

export class Rssi extends Characteristic {
    // UUIDv5(ns:DNS, _hap.strojny.net) -> 0ae9619f-b05b-5257-a5fc-b4547bea7396
    // UUIDv5(0ae9619f-b05b-5257-a5fc-b4547bea7396, RSSI) -> 752574c8-5c0d-56b5-b463-fcf61ae516e4
    public static readonly UUID = '752574c8-5c0d-56b5-b463-fcf61ae516e4'

    constructor() {
        super('RSSI ', Rssi.UUID, {
            format: Formats.INT,
            perms: [Perms.NOTIFY, Perms.PAIRED_READ],
            unit: 'dbm',
            maxValue: +1000,
            minValue: -1000,
            minStep: 1,
        })
        this.value = this.getDefaultValue()
    }
}
