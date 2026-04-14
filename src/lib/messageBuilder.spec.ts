import { describe, expect, it } from "vitest";
import { MsgUpdateParams as MintMsgUpdateParams } from "cosmjs-types/cosmos/mint/v1beta1/tx";
import { makeMintUpdateParamsProposalMsg } from "./messageBuilder";

describe("makeMintUpdateParamsProposalMsg", () => {
  it("encodes mint params from on-chain integration testing into protobuf LegacyDec atomics", () => {
    const proposal = makeMintUpdateParamsProposalMsg({
      // Uses values captured during devnet on-chain integration testing.
      // Proposer account existence is not required for this encode/decode unit test.
      title: "mint test",
      description:
        "testing https://github.com/DCFoundation/cosmos-proposal-builder/pull/75",
      proposer: "agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang",
      authority: "agoric10d07y265gmmuvt4z0w9aw880jnsr700jgl36x9",
      params: {
        mint_denom: "ubld",
        inflation_rate_change: "0.003000000000000000",
        inflation_max: "0.000000000000000000",
        inflation_min: "0.000000000000000000",
        goal_bonded: "0.67",
        blocks_per_year: "6311520",
      },
    });

    const submitProposal = proposal.value;
    const encodedMintMsg = submitProposal.messages[0]?.value;
    if (!encodedMintMsg) {
      throw new Error("expected mint message bytes");
    }

    const decodedMintMsg = MintMsgUpdateParams.decode(encodedMintMsg);
    expect(decodedMintMsg.authority).toBe(
      "agoric10d07y265gmmuvt4z0w9aw880jnsr700jgl36x9",
    );
    expect(decodedMintMsg.params?.mintDenom).toBe("ubld");
    // LegacyDec customtype encodes in protobuf as 10^18 atomics text.
    expect(decodedMintMsg.params?.inflationRateChange).toBe("3000000000000000");
    expect(decodedMintMsg.params?.inflationMax).toBe("0");
    expect(decodedMintMsg.params?.inflationMin).toBe("0");
    expect(decodedMintMsg.params?.goalBonded).toBe("670000000000000000");
    expect(decodedMintMsg.params?.blocksPerYear).toBe(6311520n);
  });

  it("scales whole-number LegacyDec inputs to 18-decimal atomics", () => {
    const proposal = makeMintUpdateParamsProposalMsg({
      title: "mint integer scaling test",
      description: "test integer values are scaled for LegacyDec protobuf fields",
      proposer: "agoric140dmkrz2e42ergjj7gyvejhzmjzurvqeq82ang",
      authority: "agoric10d07y265gmmuvt4z0w9aw880jnsr700jgl36x9",
      params: {
        mint_denom: "ubld",
        inflation_rate_change: "0",
        inflation_max: "2",
        inflation_min: "0",
        goal_bonded: "1",
        blocks_per_year: "6311520",
      },
    });

    const submitProposal = proposal.value;
    const encodedMintMsg = submitProposal.messages[0]?.value;
    if (!encodedMintMsg) {
      throw new Error("expected mint message bytes");
    }

    const decodedMintMsg = MintMsgUpdateParams.decode(encodedMintMsg);
    expect(decodedMintMsg.params?.goalBonded).toBe("1000000000000000000");
    expect(decodedMintMsg.params?.inflationMax).toBe("2000000000000000000");
  });
});
