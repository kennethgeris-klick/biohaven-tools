const fs = require('fs');
const csv = require('fast-csv');
const _ = require('lodash');
const inquirer = require('inquirer');

//Interactive CLI
inquirer
  .prompt([
	{
		type : 'input',
		name : 'providedFile',
		message : 'Enter file name for comparison:'
	},
	{
		type : 'input',
		name : 'providedChunkFile',
		message : 'Enter chunk file name for comparison:'
	},
	{
		type : 'input',
		name : 'columnValue',
		message : 'Enter column name containing unique values:',
		default: 'contactKey'
	}
  ])
  .then(answers => {
	const { providedFile,providedChunkFile, columnValue } = answers;

	console.log('Processing....\n\n');
	compare( providedFile, providedChunkFile, columnValue);
  })
  .catch(error => {
    if(error.isTtyError) {
      // Prompt couldn't be rendered in the current environment
    } else {
      // Something else when wrong
    }
  });


/**
 * Compare provided file with chunk files and update records based on Email address
 * @param {String} 	providedFile  		- Name of provided file
 * @param {String} 	providedChunkFile  	- Name of the provided chunk file
 * @param {String}	columnValue			- Name of the column name with unique values
 */
const compare = (providedFile, providedChunkFile, columnValue) => {
	
	console.time('Compare complete');

	const parentLocation = `${__dirname}/compare/${providedFile}.csv`;
	const chunkLocation = `${__dirname}/split/${providedChunkFile}.csv`;

	if(!fs.existsSync(parentLocation)){
		console.log(`File name does not exist: ${providedFile}`);
		return;
	}
	if(!fs.existsSync(chunkLocation)){
		console.log(`File name does not exist: ${providedChunkFile}`);
		return;
	}

	const parentStream = fs.createReadStream(parentLocation),
		chunkStream = fs.createReadStream(chunkLocation);

	let parentResults = [],
		chunkResults = [],
		listUpdatedRecords = [],
		outputStream = null,
		countUpdatedRecords = 0;

	return new Promise((resolve, reject) => {
		
		parentStream
			.on('error', (error) => reject(error))
			.pipe(csv.parse({ headers: true }))
			.on('data', (rows) => {
				parentResults.push(rows)
			})
			.on('error', (error) => reject(error))
			.on('end', () => {
				chunkStream
					.on('error', (error) => reject(error))
					.pipe(csv.parse({ headers: true }))
					.on('data', (rows) => {
						chunkResults.push(rows)
					})
					.on('error', (error) => reject(error))
					.on('end', async () => {

						//Check if the given column name exists
						if(!parentResults[0].hasOwnProperty(columnValue)){
							console.log("Given column name does not exist");
							return;
						}

						//Filter records in parent file with chunk file
						let FilteredParentResult = parentResults.filter(o1 => chunkResults.some(o2 => o1[columnValue] === o2[columnValue]));

						//Update chunk object based on parent object if not matching
						for (let i = 0; i <= FilteredParentResult.length; i++) {
							let t = _.isEqual(chunkResults[i], FilteredParentResult[i]);
							if (t === false) {
								countUpdatedRecords++;
								chunkResults[i] = FilteredParentResult[i];
								listUpdatedRecords.push(chunkResults[i]);
							}
						}

						//Transform array of objects to CSV
						const result = await arrayToCSV(chunkResults);

						//Write result to new file
						outputStream = fs.createWriteStream(`${__dirname}/silverpop-output/${providedChunkFile}.csv`);
						outputStream.write(result);
						outputStream.end();

						console.timeEnd('Compare complete');
						console.log('----');
						console.log(`Provided file: ${providedFile}`);
						console.log(`Rows processed: ${parentResults.length}\n`);
						console.log(`Chunk file: ${providedChunkFile}`);
						console.log(`Rows processed: ${chunkResults.length}`);
						console.log(`Records updated: ${countUpdatedRecords}`);

						if(countUpdatedRecords !== 0) console.table(listUpdatedRecords);
						
						resolve();
					})
			})
	})
}

/**
 * Take an array of objects and convert it to a CSV.
 * @param 	{Array}  data            Array of objects
 * @param 	{String} columnDelimiter Column separator, defaults to ","
 * @param 	{String} lineDelimiter   Line break, defaults to "\n"
 * @return	{String}                 CSV
 */
const arrayToCSV = (data = null, columnDelimiter = ",", lineDelimiter = "\n") => {
	let result = "", ctr, keys;

	if (data === null || !data.length) return null;

	keys = Object.keys(data[0]);

	result += keys.join(columnDelimiter);
	result += lineDelimiter;

	data.forEach(item => {
		ctr = 0;
		keys.forEach(key => {
			if (ctr > 0) result += columnDelimiter;

			result += typeof item[key] === "string" && item[key].includes(columnDelimiter) ? `${item[key]}` : item[key]
			ctr++;
		})
		result += lineDelimiter;
	})

	return result;
}