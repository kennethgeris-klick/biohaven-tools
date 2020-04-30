const fs = require('fs');
const byline = require('byline');
const EOL = require('os').EOL;
const inquirer = require('inquirer');

//Interactive CLI
inquirer
  .prompt([
	{
		type : 'input',
		name : 'providedFileName',
		message : 'Enter original data file name:',
	},
	{
		type : 'input',
		name : 'fileOutputName',
		message : 'Enter chunk file output name:'
	},
	{
		type : 'number',
		name : 'lineLimit',
		message : 'Enter chunk file record limit:',
		default: 4000,
		validate: (value) => {
			let valid = !isNaN(parseInt(value));
			return valid || 'Please enter a number';
		},
		filter: Number
	},
  ])
  .then(answers => {
	const { providedFileName,fileOutputName,lineLimit } = answers;

	console.log('Processing....\n\n');
	split(providedFileName,fileOutputName,lineLimit)
  })
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });


/**
 * Split CSV file into chunks and export files to folder
 * @param {String} 	providedFileName 	- Name of the file to be chunked
 * @param {String} 	fileOutputName  	- Name of the desired chunk file
 * @param {Number} 	lineLimit   		- Line limit per generated chunk file
 */
const split = (providedFileName,fileOutputName,lineLimit) => {
	
	console.time('Process complete');

	const dataLocation = `${__dirname}/original-data/${providedFileName}.csv`;

	if(!fs.existsSync(dataLocation)){
		console.log(`File name does not exist: ${providedFileName}`);
		return;
	}

	const delimiter = '\n',
	inputStream = fs.createReadStream(dataLocation);

	let outputStream = null,
		chunkIndex = 1,
		lineIndex = 0,
		header,
		_fileLines = [];

	//Get total number of lines in the file
	_fileLines = fs.readFileSync(dataLocation, 'utf-8').split(EOL).filter(Boolean);

	//Process CSV file
	let lineStream;
	try {
		lineStream = byline(inputStream); //Wrap with Linestream
	} catch (error) {
		console.log(error);
		return;
	}

	return new Promise((resolve, reject) => {
		lineStream
			.on('data', (line) => {
				if (!header) {
					header = line;
				}
				else {
					if (lineIndex === 0) {
						if (outputStream) outputStream.end();
						
						outputStream = fs.createWriteStream(`${__dirname}/split/${fileOutputName}-${chunkIndex++}-${Math.ceil((_fileLines.length - 1) / lineLimit)}.csv`)
						outputStream.write(`${header}${delimiter}`);
					}

					outputStream.write(`${line}${delimiter}`);
					lineIndex = (++lineIndex) % lineLimit; //Pre-increment value
				}
			})

			.on('error', (error) => reject('Provided file not found'))
			.on('end', () => {
				if (!header) {
					console.log('The provided CSV is empty');
					process.exit(1);
				}
			
				console.timeEnd('Process complete');
				console.log('----');
				console.log(`File processed: ${providedFileName}`);
				console.log(`Rows processed: ${_fileLines.length - 1}`);
				console.log(`Rows limit: ${lineLimit}`);
				console.log(`Chunk file format: ${fileOutputName}-n-${chunkIndex - 1}`);
				console.log(`Chunk files generated: ${chunkIndex - 1}`);

				resolve();
			});
	});
}


