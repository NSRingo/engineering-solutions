export const runMaybeAsync = async <T, A extends any[]>(fn: (...args: A) => T | Promise<T>, ...args: A): Promise<T> => {
  const result = fn(...args);
  return result instanceof Promise ? await result : result;
};
