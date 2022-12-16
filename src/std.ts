export function mathRoundDigits(n: number, digits: number, round: (n: number) => number = Math.round): number {
    const f = 10 ** digits

    return round(n * f) / f
}
