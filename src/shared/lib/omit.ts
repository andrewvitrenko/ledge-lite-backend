export const omit = <T extends object, K extends keyof T>(
  source: T,
  keys: K[],
): Omit<T, K> => {
  const entries = Object.entries(source).filter(
    ([key]) => !keys.includes(key as K),
  );

  return Object.fromEntries(entries) as Omit<T, K>;
};
