const fs = require('fs');
const byline = require('byline');
const EOL = require('os').EOL;

/**
 * Split CSV file into chunks and export files to folder
 * @argument1 <file-name.csv> - required
 * @argument3 <output-name>   - required
 * @argument3 <row-limit>     - optional
 */
const split = () => {
	console.time('Process complete');
	let outputStream = null,
		chunkIndex = 1,
		lineIndex = 0,
		header,
		_fileLines = [];

	const inputStream = fs.createReadStream(`${__dirname}/data/${ process.argv[2]}`),
		delimiter = '\n',
		lineLimit = process.argv[4] || 4000;

	//Block execution to get chunk length first
	_fileLines = fs.readFileSync(`${__dirname}/data/${ process.argv[2]}`, 'utf-8').split(EOL).filter(Boolean);

	//Process CSV file
	let lineStream;
	try {
		lineStream = byline(inputStream); //Wrap readable stream with a Linestream
	} catch (error) {
		console.log(error);
		return;
	}

	lineStream
		.on('data', (line) => {
			if (!header) {
				header = line;
			} 
			else {
				if (lineIndex === 0) {
					if (outputStream) {
						outputStream.end();
					}
					outputStream = fs.createWriteStream(`${__dirname}/output/${process.argv[3]}-${chunkIndex++}-${Math.ceil((_fileLines.length-1) / lineLimit)}.csv`)
					outputStream.write(`${header}${delimiter}`);
				}

				outputStream.write(`${line}${delimiter}`);
				lineIndex = (++lineIndex) % lineLimit; //Increment value before assigning to variable
			}
		})

		.on('error', (error) => console.log(error))
		.on('end', () => {
			if (!header) {
				console.log('The provided CSV is empty');
				process.exit(1);
			}
			console.timeEnd('Process complete');
			console.log(`Rows processed: ${_fileLines.length-1}\nRows limit: ${lineLimit}\nTotal chunk files generated: ${chunkIndex-1}`);
		});
}

if (!process.argv[2] && !process.argv[3]) {
	console.log('Missing arguments: <file-name.csv> <output-name>');
	console.log(process.argv[1]);
	process.exit(1);

} else if (process.argv[4] && isNaN(process.argv[4])) { // returns true if the variable does NOT contain a valid number
	console.log('Argument 3 <row-limit> is not a valid integer');
	console.log(process.argv[1]);
	process.exit(1);
} else {
	console.log('Process file...\n');
	split();
}

