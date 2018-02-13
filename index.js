#!/usr/bin/env node
const fs = require("fs");
const program = require("commander");

const batchIssue = require("./utils/batchIssue");
const Certificate = require("./utils/certificate");
const { logger, addConsole } = require("./lib/logger");
const {
  generateRandomCertificate,
  randomCertificate
} = require("./utils/randomCertificateGenerator");

const parseArguments = argv => {
  program
    .version("0.1.0", "-v, --version")
    .option("-i, --input <inputDir>", "Raw certificates directory")
    .option("-o, --output <outputDir>", "Output directory")
    .option(
      "-V, --verify <certificateFile>",
      "Verify authencity of certificate"
    )
    .option(
      "-g, --generate <certificatesToGenerator>",
      "Number of random certificates to generate",
      parseInt
    )
    .option(
      "--log-level <logLevel>",
      "Logging level. Defaults to `info`. " +
        "Possible values are `error`, `warn`, `info`, `verbose`, `debug`, `silly`."
    )
    .parse(argv);
};

const main = argv => {
  parseArguments(argv);
  addConsole(program.logLevel || "info");

  if (program.input && program.output) {
    logger.info(
      "============================== Issuing certificates ==============================\n"
    );

    batchIssue(program.input, program.output).then(merkleRoot => {
      logger.info(`Batch Certificate Root:\n${merkleRoot}\n`);

      logger.info(
        "===================================================================================\n"
      );
    });
  } else if (program.verify) {
    logger.info(
      "============================== Verifying certificate ==============================\n"
    );

    const certificateJson = fs.readFileSync(program.verify);
    const certificate = new Certificate(certificateJson);

    try {
      certificate.verify();

      logger.info("Certificate's signature is valid!\n");

      logger.warn(
        "Warning: Please verify this certificate on the blockchain with the issuer's certificate store.\n"
      );
    } catch (e) {
      logger.error("Certificate's signature is invalid!");
      logger.error(`Reason: ${e.message}\n`);
      logger.debug(e, { json: true });
    }

    logger.info(
      "===================================================================================\n"
    );
  } else if (program.generate) {
    logger.info(
      "========================== Generating random certificate ==========================\n"
    );

    const generated = generateRandomCertificate(
      program.generate,
      "./certificates/raw-certificates"
    );
    logger.info(`Generated ${generated} certificates.\n`);
    logger.info(
      "===================================================================================\n"
    );
  } else {
    program.help();
  }
};

if (typeof require !== "undefined" && require.main === module) {
  main(process.argv);
}

module.exports = {
  Certificate,
  batchIssue,
  generateRandomCertificate,
  randomCertificate
};
