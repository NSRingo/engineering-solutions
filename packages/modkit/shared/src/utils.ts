export const runMaybeAsync = async <T, A extends any[]>(
  fn: ((...args: A) => T | Promise<T>) | undefined,
  ...args: A
): Promise<T | undefined> => {
  const result = fn?.(...args);
  return result instanceof Promise ? await result : result;
};
