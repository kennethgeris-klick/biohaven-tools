const fs = require('fs');
const csv = require('fast-csv');
const _ = require('lodash')

/**
 * Compare provided file with chunk files and update records based on Email address
 * @argument1 <parent-file.csv> - required
 * @argument2 <chunk-file.csv>  - required
 * @argument3 <column-value>    - required TODO: if lists are incremental, cant we compare against index?
 */
const compare = () => {
	console.time('Compare complete');
	const parentStream = fs.createReadStream(`${__dirname}/data/${process.argv[2]}.csv`),
		chunkStream = fs.createReadStream(`${__dirname}/split/${process.argv[3]}.csv`);

	let parentResults = [],
		chunkResults = [],
		outputStream = null,
		countUpdatedRecords = 0;

	return new Promise((resolve, reject) => {
		parentStream
			.pipe(csv.parse({ headers: true }))
			.on('data', (rows) => {
				parentResults.push(rows)
			})
			.on('error', (error) => reject(error))
			.on('end', () => {
				chunkStream
					.pipe(csv.parse({ headers: true }))
					.on('data', (rows) => {
						chunkResults.push(rows)
					})
					.on('error', (error) => reject(error))
					.on('end', async () => {
						let pResults = JSON.parse(JSON.stringify(parentResults));
						let cResults = JSON.parse(JSON.stringify(chunkResults));

						//Find records based on Email value
						let FilteredParentResult = pResults.filter(o1 => cResults.some(o2 => o1.Email === o2.Email));
						let counter = 0;

						FilteredParentResult.forEach(pRecord => {
							let t = cResults._find()
						})

						// for (let i = 0; i < chunkResults.length; i++) {
						// 	let t = _.isEqual(chunkResults[i], parentResults[i])
						// 	//Compare incremental lists and will check if the chunk record is different from the parent record

						// 	if (t === false) {
						// 		countUpdatedRecords++;
						// 		chunkResults[i] = parentResults[i]
						// 	}
						// }
						// const result = await arrayToCSV(chunkResults);

						// //Write results to new file
						// outputStream = fs.createWriteStream(`${__dirname}/compare/${process.argv[3]}.csv`);
						// outputStream.write(result);
						// outputStream.end();

						resolve();
						// console.timeEnd('Compare complete');
						// console.log(`Parent file rows processed: ${parentResults.length}`)
						// console.log(`Chunk file rows processed: ${chunkResults.length}`)
						// console.log(`Updated records: ${countUpdatedRecords}`)
					})
			})
	})
}

/**
 * Take an array of objects and convert it to a CSV.
 * @param      {Array}  data            Array of objects
 * @param      {String} columnDelimiter Column separator, defaults to ","
 * @param      {String} lineDelimiter   Line break, defaults to "\n"
 * @return     {String}                 CSV
 */
const arrayToCSV = (data = null, columnDelimiter = ",", lineDelimiter = "\n") => {
	let result = "", ctr, keys;

	if (data === null || !data.length) return null

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

if (!process.argv[2] && !process.argv[3]) {
	console.log('Missing arguments: <provided-file> <chunk-file-name>');
	console.log(process.argv[1]);
	process.exit(1);

} else {
	console.log('Comparing chunk files to master file...\n');
	compare();
}