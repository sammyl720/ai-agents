import { replaceInFile } from 'replace-in-file';

// Define your aliases and their replacements
const aliasMappings = {
	'@definitions': './src/types/index.js',
	'@builders': './src/builders/index.js',
	'@agent': './src/agent/index.js',
	'@tools': './src/tools/index.js',
	'@message-handler': './src/message-handler/index.js',
	'@message-runner': './src/message-runner/index.js',
	'@consts': './src/consts.js',
	'@parsers': './src/parsers/index.js',
};

// Convert alias mappings into an array of `from` and `to`
const replaceOptions = Object.entries(aliasMappings).map(([alias, path]) => ({
	from: new RegExp(alias, 'g'), // Match alias in the code
	to: path, // Replace it with the resolved path
}));

// Apply replacements to all files in the `dist` directory (adjust the path as needed)
const options = {
	files: 'dist/**/*.js', // Replace in the transpiled JavaScript files
	from: replaceOptions.map((opt) => opt.from),
	to: replaceOptions.map((opt) => opt.to),
};

try {
	const results = await replaceInFile(options);
	console.log('Path aliases replaced:', results);
} catch (error) {
	console.error('Error occurred while replacing aliases:', error);
}
