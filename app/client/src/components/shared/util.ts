const debounces: Map<string, number | null> = new Map();
export function debounce(
    identifier: string,
    time: number,
    callback: () => void
) {
    const timeout = window.setTimeout(() => {
        callback();
    }, time);
    if (debounces.has(identifier)) {
        window.clearInterval(debounces.get(identifier)!);
    }
    debounces.set(identifier, timeout);
}
