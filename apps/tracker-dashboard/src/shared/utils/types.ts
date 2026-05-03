export type RequiredDefined<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
} & {
  [P in K]-?: NonNullable<T[P]>;
};

export type Setter<T> = ((value: T) => void) &
  ((setter: (prev: T) => T) => void);
