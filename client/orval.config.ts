import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: '../openapi.json',
    output: {
      mode: 'tags-split',
      target: 'src/api/generated/api.ts',
      schemas: 'src/api/generated/model',
      client: 'axios',
      override: {
        mutator: {
          path: './src/api/custom-instance.ts',
          name: 'customInstance',
        },
      },
    },
    hooks: {
      afterAllFilesWrite: 'eslint --fix',
    },
  },
});
