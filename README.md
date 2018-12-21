<img src="https://camo.githubusercontent.com/7240582453539ece449f39250a2b063427c83375/68747470733a2f2f74727566666c656672616d65776f726b2e636f6d2f696d672f74727566666c652d6c6f676f2d6461726b2e737667" width="200">

[![npm](https://img.shields.io/npm/v/truffle.svg)]()
[![npm](https://img.shields.io/npm/dm/truffle.svg)]()
[![Join the chat at https://gitter.im/consensys/truffle](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/consensys/truffle?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

-----------------------

## 背景描述
目前使用的Truffle v2.1.1版本使用的solidity编译器使用的0.4.6版本JavaScript编译需要耗费30分钟到40分钟左右，开发智能合约效率极其低效。我经过改造最新版本的truffle v5.0.0，使用C++的版本[Solidity](https://github.com/ethereum/solidity)来替换该 Truffle 生成字节码，极大的提高了编译效率。实测编译整个系统合约工作量大概只需要花费 `100秒` 左右，编译效率大概提高 20 ~ 30 倍左右。下面是实测编译耗时输出日志大概如下：

```
remainder 66 to compile, Strings: 41.435ms
remainder 65 to compile, LibPaillier: 58.043ms
remainder 64 to compile, LibNizkParam: 53.392ms
remainder 63 to compile, LibNIZK: 61.461ms
remainder 62 to compile, LibDb: 78.008ms
remainder 61 to compile, SystemTest: 1219.162ms
remainder 60 to compile, ExtendedCall: 550.049ms
remainder 59 to compile, EcObject: 496.799ms
remainder 57 to compile, EcJson: 415.191ms
remainder 56 to compile, LibUser: 94.445ms
remainder 55 to compile, UserManager: 5732.031ms
remainder 54 to compile, SystemModuleManager: 4898.969ms
remainder 53 to compile, SystemConfig: 1107.544ms
remainder 52 to compile, LibSwitchConfigure: 197.192ms
remainder 51 to compile, SwitchConfigure: 2446.298ms
remainder 50 to compile, RoleManager: 4111.703ms
remainder 48 to compile, LibAuditUser: 93.258ms
remainder 47 to compile, LibAuditRecord: 100.803ms
remainder 46 to compile, LibRegisterUser: 96.275ms
remainder 45 to compile, LibRegisterApply: 121.563ms
remainder 44 to compile, RegisterApplyManager: 5743.309ms
remainder 40 to compile, RoleFilterManager: 10720.012ms
remainder 39 to compile, LibDecode: 46.760ms
remainder 38 to compile, RegisterManager: 2576.074ms
remainder 37 to compile, MonitorModuleManager: 2006.285ms
remainder 36 to compile, LibNodeInfo: 101.840ms
remainder 35 to compile, NodeInfoManager: 4812.302ms
remainder 31 to compile, LibNodeApply: 123.176ms
remainder 30 to compile, NodeApplyManager: 7022.396ms
remainder 29 to compile, MonitorTest: 998.780ms
remainder 28 to compile, IFileServerManager: 23.524ms
remainder 27 to compile, LibFileServer: 90.700ms
remainder 26 to compile, FileServerManager: 1999.740ms
remainder 25 to compile, IFileInfoManager: 21.511ms
remainder 24 to compile, LibFile: 92.088ms
remainder 23 to compile, FileInfoManager: 2046.090ms
remainder 19 to compile, LibDepartment: 94.988ms
remainder 18 to compile, DepartmentManager: 3722.662ms
remainder 15 to compile, ConsoleModuleManager: 1944.434ms
remainder 11 to compile, AuthorizeFilters: 2520.665ms
remainder 0 to compile, ActionManager: 4075.888ms
solc compile total spend: 71773.442ms
solcjs compile begin......
solcjs compile spend: 29602.406ms
```

## 如何使用
首先要确保你的安装了[Node.js](http://nodejs.cn/)，由于使用了一些ES7的语法，Node.js版本最低必须为8.x，推荐`v8.12.0`。

然后，执行命令`npm install luchenqun/truffle -g`安装我改造过后的truffle。大概需要1 ~ 5分钟左右即可安装完成，如果遇到安装问题，请自行科学上网解决，安装完成之后，执行命令`truffle version`，如果看到 Truffle v5.0.0 (core: 5.0.0) 提示，即表示安装成功。

最后，如果你需要使用C++的版本来编译产生字节码的，你只需要在编译的时候，调用我在truffle安装目录的build目录下面的脚本`solc-compile.js`。一个例子`truffle-config.js`设置如下：

```javascript
/**
 * Use this file to configure your truffle project. It's seeded with some
 * common settings for different networks and features like migrations,
 * compilation and testing. Uncomment the ones you need or modify
 * them to suit your project as necessary.
 *
 * More information about configuration can be found at:
 *
 * truffleframework.com/docs/advanced/configuration
 *
 * To deploy via Infura you'll need a wallet provider (like truffle-hdwallet-provider)
 * to sign your transactions before they're sent to a remote public node. Infura API
 * keys are available for free at: infura.io/register
 *
 *   > > Using Truffle V5 or later? Make sure you install the `web3-one` version.
 *
 *   > > $ npm install truffle-hdwallet-provider@web3-one
 *
 * You'll also need a mnemonic - the twelve word phrase the wallet uses to generate
 * public/private key pairs. If you're publishing your code to GitHub make sure you load this
 * phrase from a file you've .gitignored so it doesn't accidentally become public.
 *
 */

// const HDWallet = require('truffle-hdwallet-provider');
// const infuraKey = "fj4jll3k.....";
//
const execSync = require("child_process").execSync;
const path = require("path");
// const mnemonic = fs.readFileSync(".secret").toString().trim();
let curPath = path.join(__dirname);

let npmRootPath = execSync(`npm root -g`).toString();
npmRootPath = npmRootPath.substr(0, npmRootPath.length - 1);
let jsPath = path.join(npmRootPath, "truffle", "build", "solc-compile.js");

module.exports = {
  /**
   * Networks define how you connect to your ethereum client and let you set the
   * defaults web3 uses to send transactions. If you don't specify one truffle
   * will spin up a development blockchain for you on port 9545 when you
   * run `develop` or `test`. You can ask a truffle command to use a specific
   * network from the command line, e.g
   *
   * $ truffle test --network <network-name>
   */

  networks: {
    // Useful for testing. The `development` name is special - truffle uses it by default
    // if it's defined here and no other network is specified at the command line.
    // You should run a client (like ganache-cli, geth or parity) in a separate terminal
    // tab if you use this network and you must also set the `host`, `port` and `network_id`
    // options below to some value.
    //
    development: {
      host: "111.131.52.59", // 随便写的一个ip
      port: 51230,
      gas: 6000000,
      network_id: "*" // Match any network id
    }
  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.4.25"
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
    external: {
      command: `node ${jsPath} ${curPath}`,
      targets: [
        {
          path: "./build/contracts/*.json"
        }
      ]
    }
  }
};
```

其他所有 truffle 的使用方法，均请参考v5.0.0版本的官方文档的即可。

## 其他注意事项
目前只测试windows 10环境，Linux环境未测试。系统合约需要合并一下最新的develop分支，去掉了一行注释，solcjs版本才能编译。

## 开发计划
- [ ] 增加增量编译选项，即只编译指定合约文件，提高编译效率。

-----------------------

-----------------------


Truffle is a development environment, testing framework and asset pipeline for Ethereum, aiming to make life as an Ethereum developer easier. With Truffle, you get:

* Built-in smart contract compilation, linking, deployment and binary management.
* Automated contract testing with Mocha and Chai.
* Configurable build pipeline with support for custom build processes.
* Scriptable deployment & migrations framework.
* Network management for deploying to many public & private networks.
* Interactive console for direct contract communication.
* Instant rebuilding of assets during development.
* External script runner that executes scripts within a Truffle environment.

### Install

```
$ npm install -g truffle
```

### Quick Usage

For a default set of contracts and tests, run the following within an empty project directory:

```
$ truffle init
```

From there, you can run `truffle compile`, `truffle migrate` and `truffle test` to compile your contracts, deploy those contracts to the network, and run their associated unit tests.

Truffle comes bundled with a local development blockchain server that launches automatically when you invoke the commands  above. If you'd like to [configure a more advanced development environment](http://truffleframework.com/docs/advanced/configuration) we recommend you install the blockchain server separately by running `npm install -g ganache-cli` at the command line.

+  [ganache-cli](https://github.com/trufflesuite/ganache-cli): a command-line version of Truffle's blockchain server.
+  [ganache](http://truffleframework.com/ganache/): A GUI for the server that displays your transaction history and chain state.


### Documentation

Please see the [Official Truffle Documentation](http://truffleframework.com/docs/) for guides, tips, and examples.

### Contributing

This package is a distribution package of the Truffle command line tool. Please see [truffle-core](https://github.com/trufflesuite/truffle-core) to contribute to the main core code.

### License

MIT
