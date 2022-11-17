"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module",
        ecmaFeatures: {
            "jsx": true
        }
    },
    plugins: [
        "@typescript-eslint",
        "react",
        "react-hooks",
        "unicorn"
    ],
    settings: {
        react: {
            version: "detect"
        }
    },
    rules: {
        // ESLint rules - errors
        'capitalized-comments': "error",
        'default-case-last': "error",
        'eqeqeq': "error",
        'grouped-accessor-pairs': ["error", "getBeforeSet"],
        'multiline-comment-style': "error",
        'no-async-promise-executor': "error",
        'no-case-declarations': "error",
        'no-compare-neg-zero': "error",
        'no-constant-binary-expression': "error",
        'no-constant-condition': "error",
        'no-empty-pattern': "error",
        'no-ex-assign': "error",
        'no-floating-decimal': "error",
        'no-implicit-coercion': "error",
        'no-inline-comments': "error",
        'no-invalid-regexp': "error",
        'no-lonely-if': "error",
        'no-mixed-operators': "error",
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
        'sort-imports': ["error", { allowSeparatedGroups: true }],
        'sort-keys': ["error", "asc", { minKeys: 10, allowLineSeparatedGroups: true }],
        'spaced-comment': "error",
        'use-isnan': "error",
        'yoda': "error",
        // ESLint rules - warnings
        'accessor-pairs': "warn",
        'arrow-body-style': "warn",
        'class-methods-use-this': "warn",
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
        'prefer-const': "warn",
        'require-atomic-updates': "warn",
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
        // TSLint rules - extensions
        '@typescript-eslint/brace-style': "warn",
        '@typescript-eslint/no-shadow': "warn",
        '@typescript-eslint/comma-dangle': ["warn", "never"],
        '@typescript-eslint/comma-spacing': "warn",
        '@typescript-eslint/func-call-spacing': ["warn", "never"],
        '@typescript-eslint/indent': [
            "warn",
            2,
            {
                SwitchCase: 1,
                // NOTE https://github.com/typescript-eslint/typescript-eslint/issues/1824
                ignoredNodes: [
                    "TSUnionType",
                    "TSIntersectionType",
                    "TSTypeParameterInstantiation"
                ]
            }
        ],
        '@typescript-eslint/keyword-spacing': ["warn", {
                overrides: {
                    catch: { before: false, after: false },
                    do: { before: false, after: false },
                    else: { before: false, after: false },
                    finally: { before: false, after: false },
                    for: { before: false, after: false },
                    if: { before: false, after: false },
                    static: { before: false, after: false },
                    super: { before: false, after: false },
                    switch: { before: false, after: false },
                    try: { before: false, after: false },
                    while: { before: false, after: false },
                    with: { before: false, after: false }
                }
            }],
        '@typescript-eslint/no-extra-parens': ["warn", "all", { ignoreJSX: "all" }],
        '@typescript-eslint/no-extra-semi': "error",
        '@typescript-eslint/no-throw-literal': "error",
        '@typescript-eslint/no-unused-expressions': ["error", { allowShortCircuit: true, enforceForJSX: true }],
        '@typescript-eslint/no-useless-constructor': "warn",
        '@typescript-eslint/require-await': "warn",
        '@typescript-eslint/return-await': "error",
        '@typescript-eslint/semi': "warn",
        '@typescript-eslint/space-before-blocks': ["warn", "never"],
        '@typescript-eslint/space-before-function-paren': ["warn", { anonymous: "never", named: "never", asyncArrow: "always" }],
        // TSLint rules - errors
        '@typescript-eslint/adjacent-overload-signatures': "error",
        '@typescript-eslint/consistent-indexed-object-style': "error",
        '@typescript-eslint/consistent-type-exports': ["error", { fixMixedExportsWithInlineTypeSpecifier: true }],
        '@typescript-eslint/consistent-type-imports': "error",
        '@typescript-eslint/explicit-member-accessibility': ["error", { overrides: { constructors: "off" } }],
        '@typescript-eslint/no-confusing-void-expression': ["error", { ignoreArrowShorthand: true, ignoreVoidOperator: true }],
        '@typescript-eslint/no-duplicate-enum-values': "error",
        '@typescript-eslint/no-extra-non-null-assertion': "error",
        '@typescript-eslint/no-invalid-void-type': "error",
        '@typescript-eslint/no-meaningless-void-operator': "error",
        '@typescript-eslint/no-misused-new': "error",
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': "error",
        '@typescript-eslint/no-parameter-properties': "error",
        '@typescript-eslint/no-this-alias': "error",
        '@typescript-eslint/no-unnecessary-type-constraint': "error",
        '@typescript-eslint/no-unsafe-call': "error",
        '@typescript-eslint/no-useless-empty-export': "error",
        '@typescript-eslint/prefer-literal-enum-member': "error",
        '@typescript-eslint/restrict-plus-operands': "error",
        '@typescript-eslint/unbound-method': "error",
        // TSLint rules - warnings
        '@typescript-eslint/array-type': ["warn", { default: "array-simple" }],
        '@typescript-eslint/class-literal-property-style': "warn",
        '@typescript-eslint/consistent-generic-constructors': "warn",
        '@typescript-eslint/consistent-type-assertions': ["warn", {
                assertionStyle: "as",
                objectLiteralTypeAssertions: "allow-as-parameter"
            }],
        '@typescript-eslint/member-delimiter-style': ["warn", {
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
        '@typescript-eslint/no-base-to-string': "warn",
        '@typescript-eslint/no-empty-interface': "warn",
        '@typescript-eslint/no-misused-promises': "warn",
        '@typescript-eslint/no-non-null-asserted-optional-chain': "warn",
        '@typescript-eslint/no-redundant-type-constituents': "warn",
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': "warn",
        '@typescript-eslint/no-unnecessary-condition': "warn",
        '@typescript-eslint/no-unnecessary-qualifier': "warn",
        '@typescript-eslint/no-unnecessary-type-arguments': "warn",
        '@typescript-eslint/no-unnecessary-type-assertion': "warn",
        '@typescript-eslint/no-unsafe-argument': "warn",
        '@typescript-eslint/non-nullable-type-assertion-style': "warn",
        '@typescript-eslint/prefer-as-const': "warn",
        '@typescript-eslint/prefer-function-type': "warn",
        '@typescript-eslint/prefer-includes': "warn",
        '@typescript-eslint/prefer-namespace-keyword': "warn",
        '@typescript-eslint/prefer-optional-chain': "warn",
        '@typescript-eslint/prefer-reduce-type-parameter': "warn",
        '@typescript-eslint/prefer-string-starts-ends-with': "warn",
        '@typescript-eslint/unified-signatures': "warn",
        // React rules
        'react/boolean-prop-naming': ["error", { rule: "^'?\b(?!is[A-Z\d])", message: "The name of the boolean prop `{{propName}}` cannot start with `is`." }],
        'react/function-component-definition': ["error", { namedComponents: "arrow-function", unnamedComponents: "arrow-function" }],
        'react/hook-use-state': "warn",
        'react/jsx-boolean-value': "warn",
        'react/jsx-curly-brace-presence': ["warn", { props: "never", children: "never", propElementValues: "always" }],
        'react/jsx-curly-newline': "warn",
        'react/jsx-curly-spacing': ["warn", { when: "never", attributes: true, children: true }],
        'react/jsx-equals-spacing': "warn",
        'react/jsx-fragments': "warn",
        'react/jsx-handler-names': "warn",
        'react/jsx-key': "warn",
        'react/jsx-no-constructed-context-values': "warn",
        'react/jsx-no-leaked-render': "warn",
        'react/jsx-no-script-url': "error",
        'react/jsx-no-target-blank': "warn",
        'react/jsx-no-useless-fragment': "warn",
        'react/jsx-wrap-multilines': [
            "warn",
            {
                declaration: "ignore",
                assignment: "ignore",
                return: "parens-new-line",
                arrow: "parens-new-line",
                condition: "ignore",
                logical: "ignore",
                prop: "ignore"
            }
        ],
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
        'react-hooks/exhaustive-deps': "warn",
        'react-hooks/rules-of-hooks': "error",
        // Unicorn rules
        'unicorn/better-regex': "warn",
        'unicorn/catch-error-name': "error",
        'unicorn/consistent-function-scoping': "warn",
        'unicorn/custom-error-definition': "warn",
        'unicorn/empty-brace-spaces': "warn",
        'unicorn/error-message': "warn",
        'unicorn/escape-case': "warn",
        'unicorn/filename-case': [
            "error",
            {
                cases: {
                    pascalCase: true,
                    kebabCase: true
                }
            }
        ],
        'unicorn/no-array-for-each': "warn",
        'unicorn/no-array-method-this-argument': "error",
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
                    db: false,
                    e: false,
                    i: false,
                    j: false,
                    prev: false,
                    props: false,
                    ref: false,
                    req: false,
                    res: false
                }
            }],
        // Custom rules
        '@jjoriping/declaration-order': "warn",
        '@jjoriping/function-type-annotation-style': "warn",
        '@jjoriping/iterator-name': "warn",
        '@jjoriping/key-quotation-style': "warn",
        '@jjoriping/multiline-expression-spacing': "warn",
        '@jjoriping/no-class-expression': "warn",
        '@jjoriping/no-type-name-affix': "warn",
        '@jjoriping/no-unsafe-unquoted-key': "warn",
        '@jjoriping/no-useless-template-literal': "warn",
        '@jjoriping/one-exported-react-component': "warn",
        '@jjoriping/parenthesis-spacing': "warn",
        '@jjoriping/return-type': "warn",
        '@jjoriping/semantic-quotes': "warn",
        '@jjoriping/type-operator-spacing': "warn",
        '@jjoriping/variable-name': "warn"
        // TODO type alias는 ':' 앞 붙임, 뒤 띄움. 나머지는 ':' 앞뒤 붙임. 타입의 '=>' 앞뒤 띄움.
        // TODO      한줄식            여러줄식
        //      `>`  공백 없이 바로    대응하는 `<`와 같은 indent의 빈 줄
        //      `/>` 공백이 있게 바로  대응하는 `<`와 같은 indent의 빈 줄
        // TODO JSX 구문 `{x && y}`에서 `x`가 string 또는 number일 수 없음.
        // TODO ReactNode, JSX.Element, MutableRefObject 및 그 배열은 변수 이름이 `$`로 시작.
        /*
         * const example = [ { a: 1, b: () => {
         *   console.log(true);
         * }}][0];
         *
         * function f({
         *   x = [ 1 ],
         *   y: y2 = { a: [
         *     true
         *   ]}
         * }){
         *   console.log(x, y2);
         * }
         */
    }
};
