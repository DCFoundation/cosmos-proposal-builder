// This is generated by writeCoreProposal; please edit!
/* eslint-disable */

const manifestBundleRef = {
  bundleID:
    "b1-80e6fe68b299c82c2d26802c312bc37966a559f7b28f87d058887a79a9db48ad97da2240e71e3f98986071da8fc3c5d02358bec577b17a89cee2b1cb3cd23958"
};
const getManifestCall = harden([
  "getManifestForPriceFeed",
  {
    AGORIC_INSTANCE_NAME: "%%UoracleBrandU%%-USD price feed",
    IN_BRAND_DECIMALS: "%%NdecimalPlacesN%%",
    IN_BRAND_LOOKUP: ["agoricNames", "oracleBrand", "%%oracleBrand%%"],
    IN_BRAND_NAME: "%%oracleBrand%%",
    OUT_BRAND_DECIMALS: 4,
    OUT_BRAND_LOOKUP: ["agoricNames", "oracleBrand", "USD"],
    OUT_BRAND_NAME: "USD",
    brandInRef: undefined,
    brandOutRef: undefined,
    contractTerms: {
      POLL_INTERVAL: 30n,
      maxSubmissionCount: 1000,
      maxSubmissionValue:
        115792089237316195423570985008687907853269984665640564039457584007913129639936n,
      minSubmissionCount: 3,
      minSubmissionValue: 1n,
      restartDelay: 1,
      timeout: 10,
    },
    oracleAddresses: [
      "%%NoracleAddressesN%%"
    ],
  },
]);
const overrideManifest = {
  createPriceFeed: {
    consume: {
      agoricNamesAdmin: "priceFeed",
      board: "priceFeed",
      chainStorage: "priceFeed",
      chainTimerService: "priceFeed",
      client: "priceFeed",
      econCharterKit: "priceFeed",
      highPrioritySendersManager: "priceFeed",
      namesByAddressAdmin: "priceFeed",
      priceAuthority: "priceFeed",
      priceAuthorityAdmin: "priceFeed",
      startGovernedUpgradable: "priceFeed",
    },
    instance: {
      produce: "priceFeed",
    },
  },
  ensureOracleBrands: {
    namedVat: {
      consume: {
        agoricNames: "agoricNames",
      },
    },
    oracleBrand: {
      produce: "priceFeed",
    },
  },
};

// Make the behavior the completion value.
(({
  manifestBundleRef,
  getManifestCall,
  overrideManifest,
  E,
  log = console.info,
  restoreRef: overrideRestoreRef,
}) => {
  const { entries, fromEntries } = Object;

  // deeplyFulfilled is a bit overkill for what we need.
  const shallowlyFulfilled = async obj => {
    if (!obj) {
      return obj;
    }
    const ents = await Promise.all(
      entries(obj).map(async ([key, valueP]) => {
        const value = await valueP;
        return [key, value];
      }),
    );
    return fromEntries(ents);
  };

  /** @param {ChainBootstrapSpace & BootstrapPowers & { evaluateBundleCap: any }} allPowers */
  const behavior = async allPowers => {
    // NOTE: If updating any of these names extracted from `allPowers`, you must
    // change `permits` above to reflect their accessibility.
    const {
      consume: { vatAdminSvc, zoe, agoricNamesAdmin },
      evaluateBundleCap,
      // NO installation: { ... },
      modules: {
        utils: { runModuleBehaviors },
      },
    } = allPowers;
    const [exportedGetManifest, ...manifestArgs] = getManifestCall;

    /** @type {(ref: import\('./externalTypes.js').ManifestBundleRef) => Promise<Installation<unknown>>} */
    const defaultRestoreRef = async ref => {
      // extract-proposal.js creates these records, and bundleName is
      // the name under which the bundle was installed into
      // config.bundles
      const p =
        'bundleName' in ref
          ? E(vatAdminSvc).getBundleIDByName(ref.bundleName)
          : ref.bundleID;
      const bundleID = await p;
      const label = bundleID.slice(0, 8);
      return E(zoe).installBundleID(bundleID, label);
    };
    const restoreRef = overrideRestoreRef || defaultRestoreRef;

    // Get the on-chain installation containing the manifest and behaviors.
    console.info('evaluateBundleCap', {
      manifestBundleRef,
      exportedGetManifest,
      vatAdminSvc,
    });
    let bcapP;
    if ('bundleName' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getNamedBundleCap(manifestBundleRef.bundleName);
    } else {
      bcapP = E(vatAdminSvc).getBundleCap(manifestBundleRef.bundleID);
    }
    const bundleCap = await bcapP;

    const manifestNS = await evaluateBundleCap(bundleCap);

    console.error('execute', {
      exportedGetManifest,
      behaviors: Object.keys(manifestNS),
    });
    const {
      manifest,
      options: rawOptions,
      installations: rawInstallations,
    } = await manifestNS[exportedGetManifest](
      harden({ restoreRef }),
      ...manifestArgs,
    );

    // Await references in the options or installations.
    const [options, installations] = await Promise.all(
      [rawOptions, rawInstallations].map(shallowlyFulfilled),
    );

    // DON'T Publish the installations for behavior dependencies.
    // const installAdmin = E(agoricNamesAdmin).lookupAdmin('installation');
    // ...

    // Evaluate the manifest for our behaviors.
    return runModuleBehaviors({
      allPowers,
      behaviors: manifestNS,
      manifest: overrideManifest || manifest,
      makeConfig: (name, _permit) => {
        log('coreProposal:', name);
        return { options };
      },
    });
  };

  // Make the behavior the completion value.
  return behavior;
})({ manifestBundleRef, getManifestCall, overrideManifest, E });
