import type { WorkQueue } from './api'

type AsyncFn<R> = () => Promise<Awaited<R>>

class QueueItem<R, F extends AsyncFn<R> = () => Promise<Awaited<R>>> {
    public readonly returnValue: Promise<R>
    private resolve!: (value: PromiseLike<R> | R) => void
    private reject!: (reason?: unknown) => void

    constructor(private readonly fn: F) {
        this.returnValue = new Promise((resolver, reject) => {
            this.resolve = resolver
            this.reject = reject
        })
    }

    run(): Promise<void> {
        return this.fn()
            .then((v) => this.resolve(v))
            .catch((e) => this.reject(e))
    }
}

export class SerializingQueue implements WorkQueue {
    private readonly queue: QueueItem<unknown>[] = []
    private current: Promise<void> | null = null

    async schedule<R, T extends () => R = () => R>(fn: T): Promise<R> {
        const newItem = new QueueItem<R>(() => Promise.resolve(fn()))
        this.queue.push(newItem as QueueItem<unknown>)

        this.drain()

        return newItem.returnValue
    }

    join(): void {
        while (this.queue.length > 0 || this.current !== null) {
            this.drainNext()
        }
    }

    protected drainNext(): void {
        this.drain()
    }

    private drain(): void {
        if (this.current !== null) {
            return
        }

        const nextItem = this.queue.shift()
        if (typeof nextItem === 'undefined') {
            return
        }

        this.current = nextItem.run().finally(() => {
            this.current = null
            this.drainNext()
        })
    }
}
