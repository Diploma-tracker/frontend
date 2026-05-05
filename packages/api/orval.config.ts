import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: './schema.json',
    },
    output: {
      mode: 'tags',
      target: 'src/generated/api.ts',
      schemas: 'src/generated/model',
      client: 'axios-functions',
      namingConvention: 'kebab-case',
      override: {
        mutator: {
          path: 'src/orval/mutator.ts',
          name: 'orvalCustomInstance',
        },
      },
    },
  },
});
