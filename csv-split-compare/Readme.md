# csv-split-compare
Split a large CSV file into smaller files based on a given row limit value, then compare a chunk file against a provided file based on unique value. Chunk records will update based on provided records and generate a new output file.

## Code style
`NOTE: Please create sub branch from current working branch (Ex: task/add-new-stack). Current working branch is created off dev/next`

## Tech used
- [Node 10.16.3](https://nodejs.org/en/)
    - Best to install via [NVM](http://nvm.sh)
- NodeJS Filestream & Pipes
- [byline](https://www.npmjs.com/package/byline)
- [fast-CSV](https://c2fo.io/fast-csv/)
- [Lodash](https://lodash.com/)

## Installation
```
$ cd csv-split-compare
$ npm install
```
## Usage

To split a large CSV file into smaller chunk files, run the command below:
```
$ node split

#prompt
Enter original data file name:  #example 'testCSV'
Enter chunk file output name:  #example 'testCSV-chunk'
Enter chunk file record limit: #default '4000'
```

To compare a chunk file against a provided file, run the command below:
```
$ node compare

#prompt
Enter file name for comparison:  #example 'testCSV-updated'
Enter chunk file name for comparison:  #example 'testCSV-chunk-5-15'
Enter column name containing unique values: #default 'EMAIL'
```

## License
[MIT](https://choosealicense.com/licenses/mit/)