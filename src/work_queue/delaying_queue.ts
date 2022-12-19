import { SerializingQueue } from './serializing_queue'

export class DelayingQueue extends SerializingQueue {
    private timeout: NodeJS.Timeout | null = null

    constructor(private readonly delayInMs: number) {
        super()
    }

    override join(): void {
        super.join()
        if (this.timeout !== null) {
            clearTimeout(this.timeout)
        }
    }

    protected override drainNext(): void {
        if (this.timeout !== null) {
            return
        }

        this.timeout = setTimeout(() => {
            this.timeout = null
            super.drainNext()
        }, this.delayInMs)
    }
}
