/**
 * TypeScript utility types for converting snake_case property keys to camelCase.
 *
 * SnakeToCamelCase<"foo_bar"> → "fooBar"
 * CamelCaseKeys<{ foo_bar: string }> → { fooBar: string }
 */

type SnakeToCamelCase<S extends string> =
  S extends `${infer Head}_${infer Tail}`
    ? `${Head}${Capitalize<SnakeToCamelCase<Tail>>}`
    : S;

/**
 * Recursively converts all property keys of an object type from snake_case to camelCase.
 */
export type CamelCaseKeys<T> = T extends (infer U)[]
  ? CamelCaseKeys<U>[]
  : T extends object
    ? {
        [K in keyof T as SnakeToCamelCase<K & string>]: CamelCaseKeys<T[K]>;
      }
    : T;
