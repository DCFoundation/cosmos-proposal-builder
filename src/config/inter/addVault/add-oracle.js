// This is generated by writeCoreEval; please edit!
/* eslint-disable */

const manifestBundleRef = {
  bundleID:
    "b1-4fa91236698b96550e441179909297b8df96deea6a53bd3d5ae27415d0cab5cf620b8243a70e82a0c27807da572bf90a2094e169cb872e72fa975988b0a8257c"
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
    priceAggregatorRef: {
      bundleID: "b1-991f5fece438a302e710b2612f67a5bafd23362dc6e1a27228e3b6be3775cb07ef1d1456f3259256dc572effb7c671d8c882a3251b7551bf08e7f93f7d4c71e1",
    },
  },
]);
const customManifest = {
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
      zoe: "priceFeed",
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

// Make a behavior function and "export" it by way of script completion value.
// It is constructed by an anonymous invocation to ensure the absence of a global binding
// for makeCoreProposalBehavior, which may not be necessary but preserves behavior pre-dating
// https://github.com/Agoric/agoric-sdk/pull/8712 .
const behavior = (({
  manifestBundleRef,
  getManifestCall: [manifestGetterName, ...manifestGetterArgs],
  customManifest,
  E,
  log = console.info,
  customRestoreRef,
}) => {
  const { entries, fromEntries } = Object;

  /**
   * Given an object whose properties may be promise-valued, return a promise
   * for an analogous object in which each such value has been replaced with its
   * fulfillment.
   * This is a non-recursive form of endo `deeplyFulfilled`.
   *
   * @template T
   * @param {{[K in keyof T]: (T[K] | Promise<T[K]>)}} obj
   * @returns {Promise<T>}
   */
  const shallowlyFulfilled = async obj => {
    if (!obj) {
      return obj;
    }
    const awaitedEntries = await Promise.all(
      entries(obj).map(async ([key, valueP]) => {
        const value = await valueP;
        return [key, value];
      }),
    );
    return fromEntries(awaitedEntries);
  };

  const makeRestoreRef = (vatAdminSvc, zoe) => {
    /** @type {(ref: import\('./externalTypes.js').ManifestBundleRef) => Promise<Installation<unknown>>} */
    const defaultRestoreRef = async bundleRef => {
      // extract-proposal.js creates these records, and bundleName is
      // the optional name under which the bundle was installed into
      // config.bundles
      const bundleIdP =
        'bundleName' in bundleRef
          ? E(vatAdminSvc).getBundleIDByName(bundleRef.bundleName)
          : bundleRef.bundleID;
      const bundleID = await bundleIdP;
      const label = bundleID.slice(0, 8);
      return E(zoe).installBundleID(bundleID, label);
    };
    return defaultRestoreRef;
  };

  /** @param {ChainBootstrapSpace & BootstrapPowers & { evaluateBundleCap: any }} powers */
  const coreProposalBehavior = async powers => {
    // NOTE: `powers` is expected to match or be a superset of the above `permits` export,
    // which should therefore be kept in sync with this deconstruction code.
    // HOWEVER, do note that this function is invoked with at least the *union* of powers
    // required by individual moduleBehaviors declared by the manifest getter, which is
    // necessary so it can use `runModuleBehaviors` to provide the appropriate subset to
    // each one (see ./writeCoreEvalParts.js).
    // Handle `powers` with the requisite care.
    const {
      consume: { vatAdminSvc, zoe, agoricNamesAdmin },
      evaluateBundleCap,
      installation: { produce: produceInstallations },
      modules: {
        utils: { runModuleBehaviors },
      },
    } = powers;

    // Get the on-chain installation containing the manifest and behaviors.
    log('evaluateBundleCap', {
      manifestBundleRef,
      manifestGetterName,
      vatAdminSvc,
    });
    let bcapP;
    if ('bundleName' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getNamedBundleCap(manifestBundleRef.bundleName);
    } else if ('bundleID' in manifestBundleRef) {
      bcapP = E(vatAdminSvc).getBundleCap(manifestBundleRef.bundleID);
    } else {
      const keys = Reflect.ownKeys(manifestBundleRef).map(key =>
        typeof key === 'string' ? JSON.stringify(key) : String(key),
      );
      const keysStr = `[${keys.join(', ')}]`;
      throw Error(
        `bundleRef must have own bundleName or bundleID, missing in ${keysStr}`,
      );
    }
    const bundleCap = await bcapP;

    const proposalNS = await evaluateBundleCap(bundleCap);

    // Get the manifest and its metadata.
    log('execute', {
      manifestGetterName,
      bundleExports: Object.keys(proposalNS),
    });
    const restoreRef = customRestoreRef || makeRestoreRef(vatAdminSvc, zoe);
    const {
      manifest,
      options: rawOptions,
      installations: rawInstallations,
    } = await proposalNS[manifestGetterName](
      harden({ restoreRef }),
      ...manifestGetterArgs,
    );

    // Await promises in the returned options and installations records.
    const [options, installations] = await Promise.all(
      [rawOptions, rawInstallations].map(shallowlyFulfilled),
    );

    // Publish the installations for our dependencies.
    const installationEntries = entries(installations || {});
    if (installationEntries.length > 0) {
      const installAdmin = E(agoricNamesAdmin).lookupAdmin('installation');
      await Promise.all(
        installationEntries.map(([key, value]) => {
          produceInstallations[key].reset();
          produceInstallations[key].resolve(value);
          return E(installAdmin).update(key, value);
        }),
      );
    }

    // Evaluate the manifest.
    return runModuleBehaviors({
      // Remember that `powers` may be arbitrarily broad.
      allPowers: powers,
      behaviors: proposalNS,
      manifest: customManifest || manifest,
      makeConfig: (name, _permit) => {
        log('coreProposal:', name);
        return { options };
      },
    });
  };

  return coreProposalBehavior;
})({ manifestBundleRef, getManifestCall, customManifest, E });
behavior;
