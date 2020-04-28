const fs = require('fs');
const csv = require('csv-parse');

/**
 * Compare provided file with chunk files and update records based on Email address
 * @argument1 <parent-file.csv> - required
 * @argument2 <chunk-file.csv>  - required
 * @argument3 <column-value>    - required
 */
const compare = () => {
    const parentStream = fs.createReadStream(`${__dirname}/data/${ process.argv[2]}`)
    const chunkStream = fs.createReadStream(`${__dirname}/output/${ process.argv[3]}`)
    const results = [];

    parentStream
        .pipe(csv())
        .on('data', (rows) => {
            results.push(rows)
        })
        .on('end', () => {
            console.log(results);
        })
}


compare()
// if (!process.argv[2]) {
// 	console.log('Missing arguments: <provided-file.csv>');
// 	console.log(process.argv[1]);
// 	process.exit(1);

// } else {
// 	console.log('Comparing chunk files to master file...');
// 	compare();
// }