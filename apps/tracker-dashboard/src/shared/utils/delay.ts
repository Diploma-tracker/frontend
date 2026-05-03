export const delay = (ms: number, isResolve = true): Promise<void> =>
  new Promise((resolve, reject) =>
    setTimeout(isResolve ? resolve : reject, ms),
  );
