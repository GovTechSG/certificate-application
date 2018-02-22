const Certificate = require("../../src/certificate");

const rawCertificate = {
  type: "Assertion",
  issuedOn: "2017-05-01",
  id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
  "@context": [
    "https://openbadgespec.org/v2/context.json",
    "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
  ],
  badge: {
    type: "BadgeClass",
    issuer: {
      type: "Profile",
      id: "https://www.nus.edu.sg/profile.json",
      url: "https://www.nus.edu.sg",
      name: "National University of Singapore"
    },
    name: "BACHELOR OF ARTS",
    criteria: {
      narrative: "Student must complete all require academic units"
    },
    evidencePrivacyFilter: {
      type: "SaltedProof",
      saltLength: "10"
    },
    evidence: {
      transcript: [
        {
          name: "AUSJDLEOFP:AN INTRODUCTION TO LITERARY STUDIES",
          grade: "DUEJFOSDEL:C+",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:EN1101E"
        },
        {
          name: "FKSIDKFLXO:HIDDEN COURSE NAME",
          grade: "DUFOEPLIID:D",
          courseCredit: "UDIFMCJSPD:4.00",
          courseCode: "EPDUSJCNZL:HID001"
        },
        {
          name: "PAJSUDJCHS:EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
          grade: "IWUEJDKZMS:C+",
          courseCredit: "QPWOEKDNZJ:4.00",
          courseCode: "KSIDMAJJAP:PC1325"
        }
      ]
    }
  },
  verification: {
    type: "ETHStoreProof",
    contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
  },
  signature: {
    type: "SHA3MerkleProof",
    targetHash:
      "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
    proof: [
      "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
      "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
    ],
    merkleRoot:
      "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
  },
  recipient: [
    {
      type: "email",
      identity: "sample@example.com"
    },
    {
      type: "did",
      identity: "did:example:123456789abcdefghi"
    }
  ]
};

describe("certificate", () => {
  describe("Certificate", () => {
    const certificate = new Certificate(rawCertificate);

    it("is a pure function", () => {
      expect(rawCertificate.badge.evidenceRoot).to.be.undefined;
      expect(rawCertificate.badge.evidence).to.exist;
    });

    it("resolves a partially private certificate", () => {
      const rawCertificate2 = {
        type: "Assertion",
        issuedOn: "2017-05-01",
        id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
        "@context": [
          "https://openbadgespec.org/v2/context.json",
          "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
        ],
        badge: {
          type: "BadgeClass",
          issuer: {
            type: "Profile",
            id: "https://www.nus.edu.sg/profile.json",
            url: "https://www.nus.edu.sg",
            name: "National University of Singapore"
          },
          name: "BACHELOR OF ARTS",
          criteria: {
            narrative: "Student must complete all require academic units"
          },
          evidencePrivacyFilter: {
            type: "SaltedProof",
            saltLength: "10"
          },
          evidence: {
            // eslint-disable-next-line no-sparse-arrays
            transcript: [
              {
                name: "AUSJDLEOFP:AN INTRODUCTION TO LITERARY STUDIES",
                grade: "DUEJFOSDEL:C+",
                courseCredit: "UDIFMCJSPD:4.00",
                courseCode: "EPDUSJCNZL:EN1101E"
              },
              {},
              {
                name: "PAJSUDJCHS:EINSTEIN's UNIVERSE & QUANTUM WEIRDNESS",
                grade: "IWUEJDKZMS:C+",
                courseCredit: "QPWOEKDNZJ:4.00",
                courseCode: "KSIDMAJJAP:PC1325"
              }
            ]
          },
          privateEvidence: [
            "e8c1585967cdff8ccda49d1b715d5e2d5c7358b523fd4931f0004f5f97ac0ad3",
            "79b146d13c5188d6196fd217e219aeff485f2f553b63b6d2764579193d039aea",
            "ff99de3091f27a8c1be3ba693b06e99871f4f7bbaf6dfe9494eb782fbb4b60a9",
            "bd2f72d7197dd8cf80530b1a1558ebb46740b3d5d646d146e9f91df93ad49acc"
          ]
        },
        verification: {
          type: "ETHStoreProof",
          contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
        },
        signature: {
          type: "SHA3MerkleProof",
          targetHash:
            "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
          proof: [
            "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
            "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
          ],
          merkleRoot:
            "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
        },
        recipient: [
          {
            type: "email",
            identity: "sample@example.com"
          },
          {
            type: "did",
            identity: "did:example:123456789abcdefghi"
          }
        ]
      };

      const equivalentCert = new Certificate(rawCertificate2);
      expect(certificate.evidenceTree.getRoot().toString("hex")).to.eql(
        equivalentCert.evidenceTree.getRoot().toString("hex")
      );

      expect(certificate.certificateTree.getRoot().toString("hex")).to.eql(
        equivalentCert.certificateTree.getRoot().toString("hex")
      );
    });

    it("resolves a private certificate", () => {
      const rawCertificate2 = {
        type: "Assertion",
        issuedOn: "2017-05-01",
        id: "urn:uuid:8e0b8a28-beff-43de-a72c-820bc360db3d",
        "@context": [
          "https://openbadgespec.org/v2/context.json",
          "https://govtechsg.github.io/certificate-schema/schema/1.0/context.json"
        ],
        badge: {
          type: "BadgeClass",
          issuer: {
            type: "Profile",
            id: "https://www.nus.edu.sg/profile.json",
            url: "https://www.nus.edu.sg",
            name: "National University of Singapore"
          },
          name: "BACHELOR OF ARTS",
          criteria: {
            narrative: "Student must complete all require academic units"
          },
          evidencePrivacyFilter: {
            type: "SaltedProof",
            saltLength: "10"
          },
          evidenceRoot:
            "ae2b5444f5bbe0cabcd67b7ea902f308f106ee0ae2634007d2e2e14884a74ce1"
        },
        verification: {
          type: "ETHStoreProof",
          contractAddress: "0x76bc9e61a1904b82cbf70d1fd9c0f8a120483bbb"
        },
        signature: {
          type: "SHA3MerkleProof",
          targetHash:
            "1de4d6b598ea494b400d5b805dc2f8f6928c64cb392506929b3c4f4c795b466f",
          proof: [
            "09017ea119c27f432fcbddf3c01027bb8678949d5c39b103d190f7e34b0a4b7d",
            "c7c153c8c694e3d02a1cae25763a01172a702da69f63c831358a522628880284"
          ],
          merkleRoot:
            "1b5402f3b9100a87dca74a1a7ff64bcfd2f29c5c73857486f663b320caafb45f"
        },
        recipient: [
          {
            type: "email",
            identity: "sample@example.com"
          },
          {
            type: "did",
            identity: "did:example:123456789abcdefghi"
          }
        ]
      };

      const equivalentCert = new Certificate(rawCertificate2);

      expect(certificate.certificateTree.getRoot().toString("hex")).to.eql(
        equivalentCert.certificateTree.getRoot().toString("hex")
      );
    });

    describe("privacyFilter", () => {
      it("can remove one key/value from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter("transcript.1.name");
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.evidence.transcript[1].name)
          .to.be.undefined;
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(1, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("can remove key/value from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter(["transcript.2.name"]);
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.evidence.transcript[2].name)
          .to.be.undefined;
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(1, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("can remove entire object from array", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter([
          "transcript.1.name",
          "transcript.1.grade",
          "transcript.1.courseCredit",
          "transcript.1.courseCode"
        ]);
        const newRoot = filteredCert.getRoot().toString("hex");

        expect(
          filteredCert.getCertificate().badge.evidence.transcript[1]
        ).to.eql({});
        expect(
          filteredCert.getCertificate().badge.privateEvidence.length
        ).to.eql(4, "Incorrect number of private evidences");
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });

      it("does nothing for unpresent fields", () => {
        const cert = new Certificate(rawCertificate);
        const originalRoot = cert.getRoot().toString("hex");

        const filteredCert = cert.privacyFilter("transcript.1.invalidField");

        const newRoot = filteredCert.getRoot().toString("hex");

        expect(filteredCert.getCertificate().badge.privateEvidence).to.be
          .undefined;
        expect(originalRoot).to.eql(newRoot, "Certificate has been changed");
        expect(filteredCert.verify()).to.eql(
          true,
          "Certificate signature is corrupt"
        );
      });
    });
  });
});
