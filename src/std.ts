export function throttle<Ret, Args>(
    throttleTimeMs: number,
    fn: (...args: Args[]) => Ret,
    keyFn: (...args: Args[]) => string,
): (...args: Args[]) => Ret {
    const returns: Record<string, Ret> = {}
    const timers: Record<string, ReturnType<typeof setTimeout>> = {}
    const functions: Record<string, (...args: Args[]) => Ret> = {}

    return (...args: Args[]): Ret => {
        const key = keyFn(...args)
        const initial = !(key in functions)

        functions[key] = fn

        function invoke() {
            if (key in timers) {
                clearTimeout(timers[key])
                delete timers[key]
            }
            returns[key] = fn(...args)
        }

        if (initial) {
            invoke()
        } else if (!(key in timers)) {
            timers[key] = setTimeout(invoke, throttleTimeMs)
        }

        return returns[key]
    }
}
