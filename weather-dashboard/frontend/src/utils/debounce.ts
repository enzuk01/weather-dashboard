/**
 * Creates a debounced function that delays invoking the provided function
 * until after the specified wait time has elapsed since the last time it was invoked.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param immediate Whether to invoke the function immediately on the leading edge
 * @returns A debounced version of the original function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number = 300,
    immediate: boolean = false
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function (this: any, ...args: Parameters<T>): void {
        const context = this;

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };

        const callNow = immediate && !timeout;

        if (timeout) {
            clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);

        if (callNow) {
            func.apply(context, args);
        }
    };
}

/**
 * Creates a throttled function that only invokes the function at most once
 * during every `limit` milliseconds.
 *
 * @param func The function to throttle
 * @param limit The number of milliseconds to throttle invocations to
 * @returns A throttled version of the original function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number = 300
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;
    let lastResult: ReturnType<T>;

    return function (this: any, ...args: Parameters<T>): void {
        const context = this;

        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;

            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}