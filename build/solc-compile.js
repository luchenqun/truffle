let execSync = require("child_process").execSync;
let path = require("path");
let fs = require("fs");
let npmRootPath = execSync(`npm root -g`).toString();
npmRootPath = npmRootPath.substr(0, npmRootPath.length - 1);
let solcPath = process.platform === "win32" ? path.join(npmRootPath, "truffle", "build", "solc", "windows", "solc.exe") : path.join(npmRootPath, "truffle", "build", "solc", "linux", "solc");
let projectPath = process.argv[2];
let contractPath = path.join(projectPath, "contracts");
let compileOutput = path.join(projectPath, "build", "contracts");

let rimraf = dir_path => {
  if (fs.existsSync(dir_path)) {
    fs.readdirSync(dir_path).forEach(function(entry) {
      var entry_path = path.join(dir_path, entry);
      if (fs.lstatSync(entry_path).isDirectory()) {
        rimraf(entry_path);
      } else {
        fs.unlinkSync(entry_path);
      }
    });
    fs.rmdirSync(dir_path);
  }
};

let getFiles = (dir, files, extname = ".sol") => {
  files = files || [];
  let _files = fs.readdirSync(dir);
  for (let i in _files) {
    let name = path.join(dir, _files[i]);
    if (fs.statSync(name).isDirectory()) {
      getFiles(name, files, extname);
    } else {
      if (path.extname(name) === extname) {
        files.push(name);
      }
    }
  }
  return files;
};

let sleep = time => {
  return new Promise(resolve => setTimeout(resolve, time));
};

(async () => {
  rimraf(compileOutput); // 先清空文件

  let waitfiles = getFiles(contractPath, [], ".sol");
  let solcCompileError = null;

  console.time("solc compile total spend");
  while (waitfiles.length > 0 && !solcCompileError) {
    let filePathSol = waitfiles[0];
    let fileName = path.basename(filePathSol, ".sol");
    let filePathBin = path.join(compileOutput, fileName + ".bin");
    if (!fs.existsSync(filePathBin)) {
      try {
        console.time(`remainder ${waitfiles.length - 1} to compile, ${fileName}`);
        execSync(`${solcPath} --optimize --bin prefix=. -o ${compileOutput} ${filePathSol}`);
        console.timeEnd(`remainder ${waitfiles.length - 1} to compile, ${fileName}`);
      } catch (error) {
        console.log(fileName + " compile error: " + error.toString());
        solcCompileError = error;
      }
    }
    waitfiles.shift();
  }

  let binFiles = getFiles(compileOutput, [], ".bin");
  for (const binFile of binFiles) {
    while (true) {
      try {
        let jsonFile = binFile.replace(".bin", ".json");
        let json = JSON.parse(fs.readFileSync(jsonFile));
        json.bytecode = "0x" + fs.readFileSync(binFile);
        json.ast = {};
        json.legacyAST = {};
        json.devdoc = {};
        json.userdoc = {};
        json.source = "";
        json.sourceMap = "";
        json.deployedSourceMap = "";
        fs.writeFileSync(jsonFile, JSON.stringify(json, null, 2, 100));
        fs.unlinkSync(binFile);
        break;
      } catch (error) {
        await sleep(1000);
      }
    }
  }

  console.timeEnd("solc compile total spend");
})();
