const { readCert, certificatesInDirectory } = require("./diskUtils");
const { verifySignature } = require("@govtechsg/tradetrust-schema");
const { logger } = require("../lib/logger");

const batchVerify = async undigestedCertDir => {
  const certFileNames = await certificatesInDirectory(undigestedCertDir);
  let allVerified = true;
  certFileNames.forEach(file => {
    const certificate = readCert(undigestedCertDir, file);
    const verified = verifySignature(certificate);
    allVerified = allVerified && verified;
    if (verified) {
      logger.debug(`${file}: Verified`);
    } else {
      logger.error(`${file}: ======= VERIFICATION FAILED =======`);
    }
  });
  return allVerified;
};

module.exports = batchVerify;
