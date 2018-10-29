const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const template = require('./src/App/test.js');
const EMPTY_LINE = '';
const deleteFile = filename => {
  try {
    return fs.unlinkSync(path.join(__dirname, filename));
  } catch (error) {}
}

const packagePath = path.join(__dirname, 'package.json');
const packageJSON = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

const versionString = packageJSON.dependencies['react-native'];
const versionNumber = parseInt(versionString.replace(/\./g, ''));

console.log(EMPTY_LINE);

console.log('📖 Selected Options:');

let cfg = { flow: false };

process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  switch(val) {
    case '--flow':
      console.log('[x] flow');
      cfg = { flow: true };
    default:
    break;
  }
});

let data = fs.readFileSync("src/app/test.js","utf8");

const filePath = `${__dirname}/prueba.js`;

console.log('filePath:' , filePath);
fs.writeFile(filePath, template(cfg), err => {
  if (err) throw err;
  console.log("✅ Created file: ", filePath);
});


if (versionNumber >= 570) {
  console.log('🛠  Fix React-Native@0.57.x installation...');
  console.log('⚙️  Cleaning React Native cache...', );
  execSync('rm -Rf .rncache', {
    cwd: os.homedir()
  });

  console.log('⚙️  Downloading third-party...', );
  execSync('sh ./scripts/ios-install-third-party.sh', {
    cwd: 'node_modules/react-native',
    stdio: 'ignore'
  });
  console.log('⚙️  Setup Glog...', );
  execSync('./configure', {
    cwd: 'node_modules/react-native/third-party/glog-0.3.5',
    stdio: 'ignore'
  });
}

console.log(EMPTY_LINE);
console.log('📝 Extending package.json...');

// Inject config in package.json
const scripts = require('./scripts.json');
const extension = require('./extension.json');
const updatedPackageJSON = Object.assign({}, packageJSON, scripts, extension);
fs.writeFileSync(packagePath, JSON.stringify(updatedPackageJSON, null, 2));

// Remove files
deleteFile('LICENSE');
deleteFile('README.md');
deleteFile('devDependencies.json');
deleteFile('extension.json');
deleteFile('scripts.json');
deleteFile('rn-cli.config.js');
deleteFile('App.js');

console.log(`✅ Finished.`);
