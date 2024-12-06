import { replaceInFile } from 'replace-in-file';

// Define your aliases and their replacements
const aliasMappings = {
	'@definitions': '../types/index.js',
	'@builders': '../builders/index.js',
	'@agent': '../agent/index.js',
	'@tools': '../tools/index.js',
	'@message-handler': '../message-handler/index.js',
	'@message-runner': '../message-runner/index.js',
	'@consts': '../consts.js',
	'@parsers': '../parsers/index.js',
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
