export const delay = (ms: number, isResolve = true) =>
  new Promise((resolve, reject) =>
    setTimeout(isResolve ? resolve : reject, ms),
  );
