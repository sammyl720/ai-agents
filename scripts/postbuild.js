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
	'@factory': '../factory/index.js',
	'@loggers': '../loggers/index.js',
};

const declaritionFileMaps = {
	'@definitions': '../types/index.d.ts',
	'@builders': '../builders/index.d.ts',
	'@agent': '../agent/index.d.ts',
	'@tools': '../tools/index.d.ts',
	'@message-handler': '../message-handler/index.d.ts',
	'@message-runner': '../message-runner/index.d.ts',
	'@consts': '../consts.d.ts',
	'@parsers': '../parsers/index.d.ts',
	'@factory': '../factory/index.d.ts',
	'@loggers': '../loggers/index.d.ts',
};

function replaceTextInFiles(textReplacementMap, filesToReplaceGlob) {
	const replaceOptions = Object.entries(textReplacementMap).map(
		([alias, path]) => ({
			from: new RegExp(alias, 'g'), // Match alias in the code
			to: path, // Replace it with the resolved path
		}),
	);

	const options = {
		files: filesToReplaceGlob, // Replace in the transpiled JavaScript files
		from: replaceOptions.map((opt) => opt.from),
		to: replaceOptions.map((opt) => opt.to),
	};

	return replaceInFile(options);
}

try {
	const results = await Promise.all([
		replaceTextInFiles(aliasMappings, 'dist/**/*.js'),
		replaceTextInFiles(declaritionFileMaps, 'dist/**/*.d.ts'),
	]);
	console.log('Path aliases replaced:', results);
} catch (error) {
	console.error('Error occurred while replacing aliases:', error);
}
