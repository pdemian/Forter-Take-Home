// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    // Ignore build output
    { ignores: ['dist/', 'jest.config.js'] },

    eslint.configs.recommended,
    tseslint.configs.recommended
);
