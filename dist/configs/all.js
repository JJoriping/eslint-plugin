"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stylisticPlugin = require("@stylistic/eslint-plugin-ts");
var compat_1 = require("@eslint/compat");
var importPlugin = require("eslint-plugin-import");
var tsLintParser = require("@typescript-eslint/parser");
var tsLintPlugin = require("@typescript-eslint/eslint-plugin");
var reactPlugin = require("eslint-plugin-react");
var reactHooksPlugin = require("eslint-plugin-react-hooks");
var unicornPlugin = require("eslint-plugin-unicorn");
exports.default = {
    files: [
        "**/*.{ts,tsx}"
    ],
    languageOptions: {
        parserOptions: {
            project: "./tsconfig.json",
            ecmaFeatures: {
                "jsx": true
            }
        },
        parser: tsLintParser,
        sourceType: "module"
    },
    plugins: {
        '@stylistic': stylisticPlugin,
        '@typescript-eslint': tsLintPlugin,
        'import': (0, compat_1.fixupPluginRules)(importPlugin),
        'react': reactPlugin,
        'react-hooks': reactHooksPlugin,
        'unicorn': unicornPlugin
    },
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        // ESLint rules - errors
        'default-case-last': "error",
        'eqeqeq': "error",
        'grouped-accessor-pairs': ["error", "getBeforeSet"],
        'no-async-promise-executor': "error",
        'no-case-declarations': "error",
        'no-compare-neg-zero': "error",
        'no-constant-binary-expression': "error",
        'no-constant-condition': ["error", { checkLoops: false }],
        'no-empty-pattern': "error",
        'no-ex-assign': "error",
        'no-floating-decimal': "error",
        'no-implicit-coercion': "error",
        'no-invalid-regexp': "error",
        'no-lonely-if': "error",
        'no-negated-condition': "error",
        'no-new-wrappers': "error",
        'no-regex-spaces': "error",
        'no-self-assign': "error",
        'no-self-compare': "error",
        'no-sparse-arrays': "error",
        'no-underscore-dangle': ["error", { allowFunctionParams: false }],
        'no-unreachable-loop': "error",
        'no-unsafe-finally': "error",
        'no-useless-backreference': "error",
        'no-useless-catch': "error",
        'no-useless-rename': "error",
        'no-useless-return': "error",
        'no-var': "error",
        'object-shorthand': "error",
        'operator-assignment': "error",
        'prefer-numeric-literals': "error",
        'prefer-regex-literals': "error",
        'spaced-comment': ["error", "always", { markers: ["/"] }],
        'use-isnan': "error",
        'yoda': "error",
        // ESLint rules - warnings
        'accessor-pairs': "warn",
        'arrow-body-style': "warn",
        'logical-assignment-operators': ["warn", "always", { enforceForIfStatements: true }],
        'no-debugger': "warn",
        'no-else-return': ["warn", { allowElseIf: false }],
        'no-empty': "warn",
        'no-extra-bind': "warn",
        'no-extra-boolean-cast': "warn",
        'no-misleading-character-class': "warn",
        'no-template-curly-in-string': "warn",
        'no-unmodified-loop-condition': "warn",
        'no-useless-call': "warn",
        'no-useless-concat': "warn",
        'no-useless-escape': "warn",
        'prefer-arrow-callback': "warn",
        'require-yield': "warn",
        'symbol-description': "warn",
        // ESLint rules - styles
        'array-bracket-newline': ["warn", "consistent"],
        'array-element-newline': ["warn", "consistent"],
        'arrow-parens': ["warn", "as-needed"],
        'arrow-spacing': "warn",
        'computed-property-spacing': "warn",
        'dot-location': ["warn", "property"],
        'eol-last': ["warn", "never"],
        'function-call-argument-newline': ["warn", "consistent"],
        'generator-star-spacing': "warn",
        'implicit-arrow-linebreak': "warn",
        'jsx-quotes': "warn",
        'key-spacing': "warn",
        'linebreak-style': "warn",
        'new-parens': "warn",
        'no-multi-spaces': "warn",
        'no-multiple-empty-lines': "warn",
        'no-trailing-spaces': "warn",
        'nonblock-statement-body-position': "warn",
        'object-curly-newline': "warn",
        'operator-linebreak': ["warn", "before"],
        'padded-blocks': ["warn", "never"],
        'rest-spread-spacing': "warn",
        'semi-spacing': "warn",
        'space-in-parens': "warn",
        'space-infix-ops': "warn",
        'space-unary-ops': "warn",
        'switch-colon-spacing': "warn",
        'template-curly-spacing': "warn",
        'template-tag-spacing': "warn",
        'yield-star-spacing': ["warn", "before"],
        // Stylistic rules
        '@stylistic/brace-style': "warn",
        '@stylistic/comma-dangle': [
            "warn",
            // NOTE Problem with `<T,>() => ...`
            { generics: "ignore" }
        ],
        '@stylistic/comma-spacing': "warn",
        '@stylistic/func-call-spacing': ["warn", "never"],
        '@stylistic/indent': [
            "warn",
            2,
            {
                SwitchCase: 1,
                ignoredNodes: [
                    // NOTE https://github.com/typescript-eslint/typescript-eslint/issues/1824
                    "TSUnionType",
                    "TSIntersectionType",
                    "TSTypeParameterInstantiation",
                    "ConditionalExpression",
                    "PropertyDefinition"
                ]
            }
        ],
        '@stylistic/keyword-spacing': ["warn", {
                overrides: {
                    catch: { before: false, after: false },
                    do: { before: true, after: false },
                    else: { before: false, after: false },
                    finally: { before: false, after: false },
                    for: { before: true, after: false },
                    if: { before: true, after: false },
                    static: { before: false, after: false },
                    super: { before: true, after: false },
                    switch: { before: true, after: false },
                    try: { before: true, after: false },
                    while: { before: true, after: false },
                    with: { before: true, after: false }
                }
            }],
        '@stylistic/member-delimiter-style': ["warn", {
                overrides: {
                    interface: {
                        singleline: { delimiter: "semi", requireLast: true },
                        multiline: { delimiter: "semi", requireLast: true }
                    },
                    typeLiteral: {
                        singleline: { delimiter: "comma", requireLast: false },
                        multiline: { delimiter: "comma", requireLast: false }
                    }
                }
            }],
        '@stylistic/no-extra-parens': [
            "warn",
            "all",
            { ignoreJSX: "all", nestedBinaryExpressions: false }
        ],
        '@stylistic/no-extra-semi': "error",
        '@stylistic/semi': "warn",
        '@stylistic/space-before-blocks': ["warn", "never"],
        '@stylistic/space-before-function-paren': ["warn", { anonymous: "never", named: "never", asyncArrow: "always" }],
        // TSLint rules - extensions
        '@typescript-eslint/no-shadow': ["warn", { allow: ["_"] }],
        '@typescript-eslint/no-unused-expressions': ["error", { allowShortCircuit: true, enforceForJSX: true }],
        '@typescript-eslint/no-useless-constructor': "warn",
        '@typescript-eslint/only-throw-error': "error",
        '@typescript-eslint/return-await': "error",
        // TSLint rules - errors
        '@typescript-eslint/adjacent-overload-signatures': "error",
        '@typescript-eslint/consistent-indexed-object-style': "error",
        '@typescript-eslint/consistent-type-exports': ["error", { fixMixedExportsWithInlineTypeSpecifier: true }],
        '@typescript-eslint/consistent-type-imports': "error",
        '@typescript-eslint/explicit-member-accessibility': ["error", { overrides: { constructors: "off" } }],
        '@typescript-eslint/no-confusing-void-expression': ["error", { ignoreArrowShorthand: true, ignoreVoidOperator: true }],
        '@typescript-eslint/no-duplicate-enum-values': "error",
        '@typescript-eslint/no-extra-non-null-assertion': "error",
        '@typescript-eslint/no-misused-new': "error",
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': "error",
        '@typescript-eslint/no-this-alias': "error",
        '@typescript-eslint/no-unnecessary-type-constraint': "error",
        '@typescript-eslint/no-unsafe-call': "error",
        '@typescript-eslint/no-useless-empty-export': "error",
        '@typescript-eslint/parameter-properties': "error",
        '@typescript-eslint/prefer-literal-enum-member': "error",
        '@typescript-eslint/restrict-plus-operands': "error",
        // TSLint rules - warnings
        '@typescript-eslint/array-type': ["warn", { default: "array-simple" }],
        '@typescript-eslint/class-literal-property-style': "warn",
        '@typescript-eslint/consistent-generic-constructors': "warn",
        '@typescript-eslint/consistent-type-assertions': ["warn", {
                assertionStyle: "as",
                objectLiteralTypeAssertions: "allow"
            }],
        '@typescript-eslint/no-base-to-string': "warn",
        '@typescript-eslint/no-empty-interface': "warn",
        '@typescript-eslint/no-misused-promises': ["warn", { checksVoidReturn: false }],
        '@typescript-eslint/no-non-null-asserted-optional-chain': "warn",
        '@typescript-eslint/no-redundant-type-constituents': "warn",
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': "warn",
        '@typescript-eslint/no-unnecessary-qualifier': "warn",
        '@typescript-eslint/no-unnecessary-type-arguments': "warn",
        '@typescript-eslint/no-unnecessary-type-assertion': "warn",
        '@typescript-eslint/non-nullable-type-assertion-style': "warn",
        '@typescript-eslint/prefer-as-const': "warn",
        '@typescript-eslint/prefer-function-type': "warn",
        '@typescript-eslint/prefer-includes': "warn",
        '@typescript-eslint/prefer-namespace-keyword': "warn",
        '@typescript-eslint/prefer-optional-chain': "warn",
        '@typescript-eslint/prefer-string-starts-ends-with': "warn",
        '@typescript-eslint/unified-signatures': "warn",
        // React rules
        'react-hooks/exhaustive-deps': "warn",
        'react-hooks/rules-of-hooks': "error",
        'react/boolean-prop-naming': ["error", { rule: /^'?\b(?!is[\dA-Z])/.source, message: "The name of the boolean prop `{{propName}}` cannot start with `is`." }],
        'react/function-component-definition': ["error", { namedComponents: "arrow-function", unnamedComponents: "arrow-function" }],
        'react/hook-use-state': "warn",
        'react/jsx-boolean-value': "warn",
        'react/jsx-curly-brace-presence': ["warn", { props: "never", children: "never", propElementValues: "always" }],
        'react/jsx-curly-spacing': ["warn", { when: "never", attributes: true, children: true }],
        'react/jsx-equals-spacing': "warn",
        'react/jsx-fragments': "warn",
        'react/jsx-handler-names': "warn",
        'react/jsx-key': "warn",
        'react/jsx-no-constructed-context-values': "warn",
        'react/jsx-no-script-url': "error",
        'react/jsx-no-target-blank': "warn",
        'react/jsx-no-useless-fragment': "warn",
        'react/no-access-state-in-setstate': "warn",
        'react/no-arrow-function-lifecycle': "error",
        'react/no-children-prop': "error",
        'react/no-danger-with-children': "error",
        'react/no-redundant-should-component-update': "warn",
        'react/no-string-refs': "error",
        'react/no-this-in-sfc': "error",
        'react/no-unescaped-entities': "warn",
        'react/no-unstable-nested-components': "warn",
        'react/no-unused-state': "warn",
        'react/prefer-es6-class': "error",
        'react/require-optimization': "warn",
        'react/self-closing-comp': "warn",
        'react/void-dom-elements-no-children': "error",
        // Import rules (incompatible with eslint 9)
        'import/first': "error",
        'import/order': [
            "warn",
            {
                'newlines-between': "never"
            }
        ],
        // Unicorn rules
        'unicorn/better-regex': "warn",
        'unicorn/catch-error-name': "error",
        'unicorn/empty-brace-spaces': "warn",
        'unicorn/error-message': "warn",
        'unicorn/escape-case': "warn",
        'unicorn/no-array-for-each': "warn",
        'unicorn/no-instanceof-array': "error",
        'unicorn/no-invalid-remove-event-listener': "warn",
        'unicorn/no-thenable': "error",
        'unicorn/no-this-assignment': "warn",
        'unicorn/no-useless-promise-resolve-reject': "warn",
        'unicorn/no-useless-spread': "error",
        'unicorn/numeric-separators-style': ["error", { onlyIfContainsSeparator: true }],
        'unicorn/prefer-add-event-listener': "error",
        'unicorn/prefer-array-find': "error",
        'unicorn/prefer-array-some': "warn",
        'unicorn/prefer-date-now': "warn",
        'unicorn/prefer-export-from': "warn",
        'unicorn/prefer-includes': "warn",
        'unicorn/prefer-logical-operator-over-ternary': "warn",
        'unicorn/prefer-math-trunc': "warn",
        'unicorn/prefer-prototype-methods': "warn",
        'unicorn/prefer-query-selector': "warn",
        'unicorn/prevent-abbreviations': ["warn", {
                replacements: {
                    args: false,
                    db: false,
                    e: false,
                    i: false,
                    j: false,
                    prev: false,
                    props: false,
                    ref: false,
                    req: false,
                    res: false,
                    temp: false
                }
            }],
        // Custom rules
        '@daldalso/function-type-annotation-style': "warn",
        '@daldalso/homing-instinct': "warn",
        '@daldalso/iterator-name': "warn",
        '@daldalso/jsx-expression-condition-type': "warn",
        '@daldalso/jsx-indent': "warn",
        '@daldalso/key-quotation-style': "warn",
        '@daldalso/lone-semicolon-indent': "warn",
        '@daldalso/multiline-expression-spacing': "warn",
        '@daldalso/no-class-expression': "warn",
        '@daldalso/no-type-name-affix': "warn",
        '@daldalso/no-unsafe-unquoted-key': "warn",
        '@daldalso/no-useless-template-literal': "warn",
        '@daldalso/one-exported-react-component': "warn",
        '@daldalso/parenthesis-spacing': "warn",
        '@daldalso/prefer-const': "warn",
        '@daldalso/return-type': "warn",
        '@daldalso/semantic-quotes': "warn",
        '@daldalso/sort-keys': "warn",
        '@daldalso/ternary-spacing': "warn",
        '@daldalso/type-colon-spacing': "warn",
        '@daldalso/type-operator-spacing': "warn",
        '@daldalso/variable-name': "warn"
    }
};
