import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals"),
	{
		// Custom rules to ensure TypeScript is excluded
		overrides: [
			{
				files: ["*.ts", "*.tsx"],
				rules: {
					// Disable TypeScript specific rules if they're accidentally included
					"@typescript-eslint/no-var-requires": "off",
					"@typescript-eslint/explicit-module-boundary-types": "off",
					// Add more TypeScript-specific rules you want to turn off
				},
			},
		],
	},
];

export default eslintConfig;
