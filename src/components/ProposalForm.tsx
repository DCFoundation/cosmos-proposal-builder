import {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  FormEvent,
  ReactNode,
} from "react";
import type { CoreEval } from "@agoric/cosmic-proto/dist/codegen/agoric/swingset/swingset";
import { CodeInputGroup } from "./CodeInputGroup";
import { Button } from "./Button";
import { ParamChange } from "cosmjs-types/cosmos/params/v1beta1/params";
import { ParameterChangeFormSection } from "./ParameterChangeForm";
import { DepositSection } from "./DepositSection";
import { paramOptions } from "../config/agoric/params";
import type { ParameterChangeTypeOption } from "../types/form";
import { TitleDescriptionInputs } from "./TitleDescriptionInputs";

type BaseProposalArgs = {
  title: string;
  description: string;
  deposit: string | number;
};

export type ProposalArgs = BaseProposalArgs & ProposalDetail;

export type QueryType = ReturnType<(typeof paramOptions)[number]["query"]>;
export type SelectorReturnType = ReturnType<
  (typeof paramOptions)[number]["selector"]
>;

export type ProposalDetail =
  | { msgType: "textProposal" }
  | { msgType: "coreEvalProposal"; evals: CoreEval[] }
  | { msgType: "parameterChangeProposal"; changes: ParamChange[] };

interface ProposalFormProps {
  title: string;
  description: string | ReactNode;
  handleSubmit: (proposal: ProposalArgs) => void;
  titleDescOnly?: boolean;
  msgType: QueryParams["msgType"];
  governanceForumLink: string;
}

interface ProposalFormMethods {
  reset: () => void;
}

const ProposalForm = forwardRef<ProposalFormMethods, ProposalFormProps>(
  ({ title, description, handleSubmit, msgType, governanceForumLink }, ref) => {
    const [evals, setEvals] = useState<CoreEval[]>([]);
    const formRef = useRef<HTMLFormElement>(null);
    const codeInputRef = useRef<{ reset: () => void } | null>(null);
    const paramChangeRef = useRef<{
      getChanges: () => ParamChange[];
      reset: () => void;
    } | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        formRef.current?.reset();
        codeInputRef.current?.reset();
        paramChangeRef.current?.reset();
        setEvals([]);
      },
    }));

    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (formRef?.current) {
        const formData = new FormData(formRef.current);
        if (formData) {
          const title = (formData.get("title") as string) || "";
          const description = (formData.get("description") as string) || "";
          const depositBld = (formData.get("deposit") as string) || "";
          const deposit = Number(depositBld) * 1_000_000;
          const args: BaseProposalArgs = { title, description, deposit };
          if (msgType === "coreEvalProposal" && evals.length) {
            return handleSubmit({ ...args, msgType, evals });
          } else if (msgType == "textProposal") {
            return handleSubmit({ ...args, msgType });
          } else if (msgType === "parameterChangeProposal") {
            const changes = paramChangeRef.current?.getChanges();
            if (!Array.isArray(changes)) throw new Error("No changes");
            return handleSubmit({ ...args, msgType, changes });
          }
        }
      }
      throw new Error("Error reading form data.");
    };

    return (
      <form ref={formRef} className="py-6 px-8" onSubmit={onSubmit}>
        <div className="space-y-12 sm:space-y-16">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {title}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
              {description}
            </p>

            <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
              {msgType === "parameterChangeProposal" ? (
                <ParameterChangeFormSection<QueryType, SelectorReturnType>
                  ref={paramChangeRef}
                  options={
                    paramOptions as unknown as ParameterChangeTypeOption<
                      QueryType,
                      SelectorReturnType
                    >[]
                  }
                />
              ) : null}

              <TitleDescriptionInputs
                communityForumLink={governanceForumLink}
              />

              {msgType === "coreEvalProposal" ? (
                <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                  >
                    Core Eval Files
                  </label>
                  <div className="mt-2 sm:col-span-3 sm:mt-0">
                    <CodeInputGroup
                      ref={codeInputRef}
                      onPairsChange={setEvals}
                    />
                  </div>
                </div>
              ) : null}

              <DepositSection />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-end gap-x-32">
          <Button
            type="submit"
            Icon={null}
            text="Sign & Submit"
            theme="dark"
            layoutStyle="flex w-1/4"
          />
        </div>
      </form>
    );
  }
);

export { ProposalForm };
