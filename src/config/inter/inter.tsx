import { useMemo, useRef, FormEvent } from "react";
import { toast } from "react-toastify";
import type { CoreEval } from "@agoric/cosmic-proto/swingset/swingset.js";
import { MultiStepProposalForm } from "../../components/MultiStepProposalForm";
import { Tabs } from "../../components/Tabs";
import { useNetwork } from "../../hooks/useNetwork";
import { useWallet } from "../../hooks/useWallet";
import { makeCoreEvalProposalMsg } from "../../lib/messageBuilder";
import { makeSignAndBroadcast } from "../../lib/signAndBroadcast";
import { PSMParameterInputs } from "../../config/inter/components/PSMParameterInputs";
import { VaultParameterInputs } from "../../config/inter/components/VaultParameterInputs";
import { DepositSection } from "../../components/DepositSection";
import { TitleDescriptionInputs } from "../../components/TitleDescriptionInputs";
import { capitalize, firstLetterIsUpperCase } from "../../utils/capitalize";
import { psmJS, psmPermit } from "./addPSM";
import {
  addVaultJs,
  addVaultPermit,
  addOracleJs,
  addOraclePermit,
} from "./addVault";
import { generateFromTemplate } from "./generateFromTemplate";
import { InterLearnMore } from "./components/InterLearnMore";

const Inter = () => {
  const { netName } = useNetwork();
  const { walletAddress, stargateClient } = useWallet();
  const psmFormRef = useRef<HTMLFormElement>(null);
  const vaultFormRef = useRef<HTMLFormElement>(null);

  const signAndBroadcast = useMemo(
    () => makeSignAndBroadcast(stargateClient, walletAddress, netName),
    [stargateClient, walletAddress, netName],
  );

  const handlePsmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = psmFormRef.current?.data();

    if (!walletAddress) {
      toast.error("Wallet not connected.", { autoClose: 3000 });
      return;
    }
    if (!netName) {
      toast.error("Network not selected.", { autoClose: 3000 });
      return;
    }

    if (formData) {
      const denom = formData.get("denom") as string;
      const decimalPlaces = formData.get("decimalPlaces") as string;
      const keyword = formData.get("keyword") as string;
      const proposedName = formData.get("proposedName") as string;

      if (!denom || !denom.startsWith("ibc/")) {
        toast.error("Invalid IBC Denom.", { autoClose: 3000 });
        return;
      }
      if (!keyword || !firstLetterIsUpperCase(keyword)) {
        toast.error("Invalid Issuer Keyword.", { autoClose: 3000 });
        return;
      }
      if (isNaN(parseInt(decimalPlaces))) {
        toast.error("Invalid Decimal Places.", { autoClose: 3000 });
        return;
      }
      if (!proposedName) {
        toast.error("Proposed Name not provided.", { autoClose: 3000 });
        return;
      }

      const generatedAddPsm = generateFromTemplate<AddPSMParams>(psmJS, {
        denom,
        decimalPlaces: Number(decimalPlaces),
        keyword,
        proposedName,
      });

      const evals: CoreEval[] = [
        { jsonPermits: psmPermit, jsCode: generatedAddPsm },
      ];

      const title = (formData.get("title") as string) || "";
      const description = (formData.get("description") as string) || "";
      const depositBld = (formData.get("deposit") as string) || "";
      const deposit = Number(depositBld) * 1_000_000;

      const proposalMsg = makeCoreEvalProposalMsg({
        evals,
        title,
        description,
        deposit,
        proposer: walletAddress as string,
      });

      try {
        await signAndBroadcast(proposalMsg, "proposal");
        psmFormRef.current?.reset();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleVaultSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = vaultFormRef.current?.data();

    if (!walletAddress) {
      toast.error("Wallet not connected.", { autoClose: 3000 });
      return;
    }
    if (!netName) {
      toast.error("Network not selected.", { autoClose: 3000 });
      return;
    }

    if (formData) {
      const denom = formData.get("denom") as string;
      const decimalPlaces = formData.get("decimalPlaces") as string;
      const issuerName = formData.get("issuerName") as string;

      if (!denom || !denom.startsWith("ibc/")) {
        toast.error("Invalid IBC Denom.", { autoClose: 3000 });
        return;
      }
      if (isNaN(parseInt(decimalPlaces))) {
        toast.error("Invalid Decimal Places.", { autoClose: 3000 });
        return;
      }
      if (!issuerName) {
        toast.error("Issuer Name not provided.", { autoClose: 3000 });
        return;
      }

      const templateParams = {
        denom,
        decimalPlaces: Number(decimalPlaces),
        issuerName,
        keyword: capitalize(issuerName),
        oracleBrand: issuerName,
        proposedName: issuerName,
      };
      const generatedAddVaultJs = generateFromTemplate<AddVaultParams>(
        addVaultJs,
        templateParams,
      );
      const generatedAddOracleJs = generateFromTemplate<AddVaultParams>(
        addOracleJs,
        templateParams,
      );

      const evals: CoreEval[] = [
        { jsonPermits: addOraclePermit, jsCode: generatedAddOracleJs },
        { jsonPermits: addVaultPermit, jsCode: generatedAddVaultJs },
      ];

      const title = (formData.get("title") as string) || "";
      const description = (formData.get("description") as string) || "";
      const depositBld = (formData.get("deposit") as string) || "";
      const deposit = Number(depositBld) * 1_000_000;

      const proposalMsg = makeCoreEvalProposalMsg({
        evals,
        title,
        description,
        deposit,
        proposer: walletAddress as string,
      });

      try {
        await signAndBroadcast(proposalMsg, "proposal");
        vaultFormRef.current?.reset();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const GovDetails = ({
    governanceForumLink,
  }: {
    governanceForumLink: string;
  }) => (
    <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
      <TitleDescriptionInputs communityForumLink={governanceForumLink} />
      <DepositSection />
    </div>
  );

  return (
    <Tabs
      tabs={[
        {
          title: "Add PSM",
          msgType: "addPSM",
          content: (
            <MultiStepProposalForm
              ref={psmFormRef}
              handleSubmit={handlePsmSubmit}
              titleDescOnly={true}
              title="Add PSM"
              description={
                <>
                  The PSM (Parity Stability Module) is a smart contract that
                  mints IST in exchange for approved stablecoins at a 1-to-1
                  ratio. <InterLearnMore />
                </>
              }
              tabs={[
                {
                  title: "Asset Details",
                  content: <PSMParameterInputs />,
                },
                {
                  title: "Proposal Details",
                  content: (
                    <GovDetails governanceForumLink="https://community.agoric.com/tags/c/inter-protocol/5/psm" />
                  ),
                },
              ]}
            />
          ),
        },
        {
          title: "Add Vault Collateral Type",
          msgType: "addVault",
          content: (
            <MultiStepProposalForm
              ref={vaultFormRef}
              handleSubmit={handleVaultSubmit}
              titleDescOnly={false}
              title="Add Vault Collateral Type"
              description={
                <>
                  Vaults allow users to mint IST by using their assets as
                  collateral. The Add Vault proposal enables a new collateral
                  type to be used for opening vaults. <InterLearnMore />
                </>
              }
              tabs={[
                {
                  title: "Asset Details",
                  content: <VaultParameterInputs />,
                },
                {
                  title: "Proposal Details",
                  content: (
                    <GovDetails governanceForumLink="https://community.agoric.com/c/inter-protocol/vaults-collateral-discussion/30" />
                  ),
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
};

export { Inter };
