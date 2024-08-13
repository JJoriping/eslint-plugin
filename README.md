# @daldalso/eslint-plugin

ESLint plugin for [Daldalso](https://daldal.so)-style programming.

## Getting Started
1. `yarn add @daldalso/eslint-plugin`
2. Add following values to your ESLint configuration file.
   ```json
   {
     "plugins": [
       "@daldalso/eslint-plugin"
     ],
     "extends": [
       "plugin:@daldalso/eslint-plugin/all"
     ],
     "parserOptions": {
       "project": "./tsconfig.json"
     }
   }
   ```

## Caveats
- This plugin is just for describing the code conventions of [Daldalso](https://daldal.so). I have no intention of arguing that it is better than any other conventions.
- For originality, you had better remove the following plugins from your configuration file.
  - `@typescript-eslint/eslint-plugin`
  - `eslint-plugin-import`
  - `eslint-plugin-react`
  - `eslint-plugin-react-hooks`
  - `eslint-plugin-unicorn`