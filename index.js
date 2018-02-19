#!/usr/bin/env node
const fs = require("fs");
const mkdirp = require("mkdirp");
const yargs = require("yargs");

const batchIssue = require("./src/batchIssue");
const Certificate = require("./src/certificate");
const CertificateStore = require("./src/contract/certificateStore.js");
const { logger, addConsole } = require("./lib/logger");
const {
  generateRandomCertificate,
  randomCertificate
} = require("./src/randomCertificateGenerator");

// Pass argv with $1 and $2 sliced
const parseArguments = argv =>
  yargs
    .version("0.1.0")
    .usage("Certificate issuing, verification and revocation tool.")
    .strict()
    .epilogue(
      "The common subcommands you might be interested in are:\n" +
        "- issue\n" +
        "- verify\n" +
        "- revoke"
    )
    .options({
      "log-level": {
        choices: ["error", "warn", "info", "verbose", "debug", "silly"],
        default: "info",
        description: "Set the log level",
        global: true
      }
    })
    .command({
      command: "verify [options] <file>",
      description: "Verify the certificate",
      builder: sub =>
        sub.positional("file", {
          description: "Certificate file to verify",
          normalize: true
        })
    })
    .command({
      command: "generate [options] <dir>",
      description: "Generate random certificates",
      builder: sub =>
        sub
          .positional("dir", {
            description: "The directory to generate the random certificates to",
            normalize: true
          })
          .options({
            count: {
              default: 10,
              number: true,
              description: "The number of certificates to generate",
              coerce: parseInt
            }
          })
          .option({
            "contract-address": {
              default: "0x0",
              description: "Address of the certificate store contract",
              string: true
            }
          })
    })
    .command({
      command: "deploy <address> <name> <verificationUrl>",
      description:
        "Deploy a certificate store for issuer at " +
        "address` with name `name` and verification URL at `verificationUrl`.",
      builder: sub =>
        sub
          .positional("address", {
            description: "Account address of the issuer"
          })
          .positional("name", { description: "Name of the issuer" })
          .positional("verificationUrl", { description: "URL of the issuer" })
    })
    .command({
      command: "transfer <originalOwner> <newOwner> <contractAddress>",
      description:
        "Transfer ownership of certificate store at `contractAddress` from " +
        "`originalOwner` to `newOwner`",
      builder: sub =>
        sub
          .positional("originalOwner", {
            description: "Original owner of the certificate store contract"
          })
          .positional("newOwner", {
            description:
              "New owner to transfer the certificate store contract to"
          })
          .positional("contactAddress", {
            description: "Address of contract to transfer ownership."
          })
    })
    .command({
      command: "batch [options] <raw-dir> <batched-dir>",
      description:
        "Combine a directory of certificates into a certificate batch",
      builder: sub =>
        sub
          .positional("raw-dir", {
            description:
              "Directory containing the raw unissued and unsigned certificates",
            normalize: true
          })
          .positional("batched-dir", {
            description: "Directory to output the batched certificates to.",
            normalize: true
          })
    })
    .command({
      command: "commit <merkleRoot> <issuerAddress> <storeAddress>",
      description:
        "Commit a certificate batch Merkle root to a certificate store",
      builder: sub =>
        sub
          .positional("merkleRoot", {
            description: "Merkle root of the certificate batch."
          })
          .positional("issuerAddress", { description: "Address of the issuer" })
          .positional("storeAddress", {
            description: "Address of the certificate store contract"
          })
    })
    .parse(argv);

const generate = (dir, count, contractAddress) => {
  logger.info(
    "========================== Generating random certificate =========================="
  );
  mkdirp.sync(dir);
  const generated = generateRandomCertificate(count, dir, contractAddress);
  logger.info(`Generated ${generated} certificates.`);
  logger.info(
    "==================================================================================="
  );
};

const batch = async (raw, batched) => {
  logger.info(
    "============================== Batching certificates =============================="
  );

  mkdirp.sync(batched);
  await batchIssue(raw, batched).then(merkleRoot => {
    logger.info(`Batch Certificate Root:\n${merkleRoot}`);
    logger.info(
      "==================================================================================="
    );
  });
};

const verify = file => {
  logger.info(
    "============================== Verifying certificate =============================="
  );

  const certificateJson = JSON.parse(fs.readFileSync(file, "utf8"));
  const certificate = new Certificate(certificateJson);

  certificate.verify();

  logger.info("Certificate's signature is valid!");

  logger.warn(
    "Warning: Please verify this certificate on the blockchain with the issuer's certificate store."
  );
  logger.info(
    "==================================================================================="
  );
};

const deploy = async (address, name, verificationUrl) => {
  logger.info(
    "========================== Deploying new contract store =========================="
  );

  const store = new CertificateStore(address);
  await store.deployStore(name, verificationUrl).then(deployedAddress => {
    logger.info(`Contract deployed at ${deployedAddress}.`);
    logger.info(
      "==================================================================================="
    );
  });
};

const transfer = async (originalOwner, newOwner, contractAddress) => {
  logger.info(
    "=================== Transfering ownership of contract store ===================="
  );

  const store = new CertificateStore(originalOwner, contractAddress);

  await store.transferOwnership(newOwner).then(() => {
    logger.info(
      `Contract at ${contractAddress} transfered from ${originalOwner} ` +
        `to ${newOwner}`
    );
    logger.info(
      "==================================================================================="
    );
  });
};

const commit = async (merkleRoot, issuerAddress, storeAddress) => {
  logger.info(
    "=================== Committing certificate on contract store ===================="
  );

  const store = new CertificateStore(issuerAddress, storeAddress);

  await store.issueCertificate(merkleRoot).then(() => {
    logger.info(
      `Certificate batch issued: ${merkleRoot}\n` +
        `by ${issuerAddress} at certificate store ${storeAddress}`
    );
    logger.info(
      "==================================================================================="
    );
    process.exit(0);
  });
};

const main = async argv => {
  const args = parseArguments(argv);
  addConsole(args.logLevel);
  logger.debug(`Parsed args: ${JSON.stringify(args)}`);

  if (args._.length !== 1) {
    yargs.showHelp("log");
  } else {
    switch (args._[0]) {
      case "generate":
        generate(args.dir, args.count, args.contractAddress);
        break;
      case "batch":
        await batch(args.rawDir, args.batchedDir);
        break;
      case "verify":
        verify(args.file);
        break;
      case "deploy":
        await deploy(args.address, args.name, args.verificationUrl);
        break;
      case "transfer":
        await transfer(args.originalOwner, args.newOwner, args.contractAddress);
        break;
      case "commit":
        await commit(args.merkleRoot, args.issuerAddress, args.storeAddress);
        break;
      default:
        throw new Error(`Unknown command ${args._[0]}. Possible bug.`);
    }
  }
};

if (typeof require !== "undefined" && require.main === module) {
  main(process.argv.slice(2))
    .then(() => process.exit(0))
    .catch(err => {
      logger.error(`Error executing: ${err}`);
      if (typeof err.stack !== "undefined") {
        logger.debug(err.stack);
      }
      logger.debug(JSON.stringify(err));
      process.exit(1);
    });
}

module.exports = {
  Certificate,
  batchIssue,
  generateRandomCertificate,
  randomCertificate
};
