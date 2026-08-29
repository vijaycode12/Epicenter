const timestamp = () => new Date().toISOString();

export const info = (...args) => console.log(`[INFO] ${timestamp()} -`, ...args);
export const warn = (...args) => console.warn(`[WARN] ${timestamp()} -`, ...args);
export const error = (...args) => console.error(`[ERROR] ${timestamp()} -`, ...args);
