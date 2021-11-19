const path = require('path');
const fs = require('fs');
const {Publisher} = require('@pact-foundation/pact-node');

const config = require('../package.json');

const pactBroker = process.env.PACTBROKER_URL;

async function publishPact() {

  const pactFiles = await listPactFiles(path.join(__dirname, '../pacts'));

  if (pactFiles.length == 0) {
    console.log('No pact files in pact directory: ' + path.join(__dirname, '../pacts'));
    return;
  }
  console.log("pact files: ", pactFiles);

  if (!pactBroker) {
    console.log('No pact broker configured...');
    return;
  }

  const options = {
    consumerVersion: config.version,
    pactBroker,
    pactFilesOrDirs: pactFiles,
  };

  console.log('Publishing pacts with options:', options);

  await new Publisher(options).publish();
  return;
}

async function listPactFiles(pactDir) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(pactDir)) {
      resolve([]);
      return;
    }

    fs.readdir(pactDir, (err, items) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(items.map(item => path.join(pactDir, item)));
    });
  });
}

publishPact()
  .catch(err => {
    console.error('Error publishing pact', err);
    process.exit(1);
  });
