export interface WorkQueue {
    schedule<R, T extends () => R>(fn: T): Promise<R>
    join(): void
}
