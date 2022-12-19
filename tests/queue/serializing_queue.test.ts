import { SerializingQueue } from '../../src/work_queue/serializing_queue'
import { describe, expect, test } from '@jest/globals'

describe('Test serializing queue', () => {
    const queue = new SerializingQueue()

    test('Async functions are serialized in order of scheduling', async () => {
        let position = 0
        const p0 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 10)))
        const p1 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 5)))
        expect(await p0).toBe(0)
        expect(await p1).toBe(1)
    })

    test('Async functions are serialized with errors', async () => {
        let position = 0
        const p0 = queue
            .schedule(() => new Promise((resolve, reject) => setTimeout(() => reject(position++), 10)))
            .catch((e: number) => e)
        const p1 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 5)))
        const p2 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 2)))
        expect(await p0).toBe(0)
        expect(await p1).toBe(1)
        expect(await p2).toBe(2)
    })

    test('Sync functions are serialized', async () => {
        let position = 0
        const p0 = queue.schedule(() => position++)
        const p1 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 0)))
        expect(await p0).toBe(0)
        expect(await p1).toBe(1)
    })

    test('Sync functions are serialized with errors', async () => {
        let position = 0
        const p0 = queue
            .schedule(() => {
                throw position++
            })
            .catch((e: number) => e)
        const p1 = queue.schedule(() => new Promise((resolve) => setTimeout(() => resolve(position++), 0)))
        expect(await p0).toBe(0)
        expect(await p1).toBe(1)
    })

    queue.join()
})
