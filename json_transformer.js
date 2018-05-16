const fs = require('fs');
const path = require('path');
const readline = require('readline');

const originalDataPath = path.join(__dirname, 'banki_responses.json');
const resultDataPath = path.join(__dirname, `result_${Date.now()}.tsv`);

const ratingValues = {};
const preprocessJsonLine = (jsonLine) => {
  const lineData = JSON.parse(jsonLine);

  const { text } = lineData;
  const textWithoutTabs = text.replace(/\t/g, ' ');
  // resolves bug with linebreak in json string
  if (textWithoutTabs.includes('Выписка по счету А теперь подведем подсчет')) {
    return;
  }


  const rating = parseInt(lineData.rating_grade);
  ratingValues[rating] = (ratingValues[rating] || 0) + 1;
  if (isNaN(rating)) return;

  const writeData = `${rating}\t${textWithoutTabs}\n`;
  fs.appendFile(resultDataPath, writeData, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

const lineReader = readline.createInterface({
  input: fs.createReadStream(originalDataPath),
});

lineReader.on('line', (jsonLine) => {
  try {
    preprocessJsonLine(jsonLine);
  } catch (caught) {
    console.log('unable to process line', jsonLine, caught.message, caught.stack);
    process.exit(1);
  }
});

lineReader.on('close', () => {
  console.log(`Finished writing to ${resultDataPath}`);
  console.log(`Rating values: ${JSON.stringify(ratingValues)}`);
  process.exit(0);
});
