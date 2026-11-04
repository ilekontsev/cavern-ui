// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettierRecommended = require('eslint-plugin-prettier/recommended');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = defineConfig([
	{
		ignores: ['**/*.spec.ts', '**/*.js'],
	},
	{
		files: ['**/*.ts'],
		extends: [
			eslint.configs.recommended,
			tseslint.configs.recommended,
			tseslint.configs.stylistic,
			angular.configs.tsRecommended,
		],
		processor: angular.processInlineTemplates,
		plugins: {
			'simple-import-sort': simpleImportSort,
		},
		rules: {
			'@angular-eslint/directive-selector': [
				'error',
				{
					type: 'attribute',
					prefix: 'app',
					style: 'camelCase',
				},
			],
			'@angular-eslint/component-selector': [
				'error',
				{
					type: 'element',
					prefix: 'app',
					style: 'kebab-case',
				},
			],
			'@typescript-eslint/explicit-member-accessibility': [
				'error',
				{
					accessibility: 'explicit',
					overrides: {
						constructors: 'no-public',
					},
				},
			],
			'@typescript-eslint/explicit-function-return-type': [
				'error',
				{
					allowExpressions: false,
					allowHigherOrderFunctions: true,
					allowTypedFunctionExpressions: true,
				},
			],

			'@typescript-eslint/no-magic-numbers': [
				'error',
				{
					ignore: [0, 1, 2],
					ignoreArrayIndexes: true,
					ignoreEnums: true,
					ignoreNumericLiteralTypes: true,
					ignoreReadonlyClassProperties: true,
					ignoreTypeIndexes: true,
				},
			],
			'@angular-eslint/prefer-inject': 'error',
			'@angular-eslint/inject-at-top': 'error',
			'no-restricted-syntax': [
				'error',
				{
					selector: "PropertyDefinition[value.callee.name='inject']:not([readonly=true])",
					message:
						'Поле с inject() должно быть объявлено как readonly: private readonly service = inject(Service).',
				},
			],
			// Единый порядок импортов и экспортов.
			'simple-import-sort/imports': 'error',
			'simple-import-sort/exports': 'error',
		},
	},
	{
		files: ['**/*.html'],
		extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
		rules: {},
	},
	// Должен идти последним: отключает стилистические правила,
	// конфликтующие с Prettier, и проверяет форматирование.
	prettierRecommended,
]);
