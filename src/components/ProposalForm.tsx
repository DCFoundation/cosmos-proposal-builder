import React, { useRef, useState, FormEvent } from "react";
import { CodeInputGroup } from "./CodeInputGroup";
import { CoreEval } from "@agoric/cosmic-proto/swingset/swingset.js";
import { Button } from "./Button";

export interface ProposalArgs {
  title: string;
  description: string;
  evals: CoreEval[];
}

interface ProposalFormProps {
  title: string;
  description: string;
  handleSubmit: (proposal: ProposalArgs) => void;
  titleDescOnly?: boolean;
}

const ProposalForm: React.FC<ProposalFormProps> = ({
  title,
  description,
  handleSubmit,
  titleDescOnly = false,
}) => {
  const [evals, setEvals] = useState<CoreEval[]>([]);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const title = titleRef?.current?.value || "";
    const description = descRef?.current?.value || "";
    handleSubmit({ title, description, evals });
  };

  return (
    <form className="py-6 px-8" onSubmit={onSubmit}>
      <div className="space-y-12 sm:space-y-16">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {title}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Title
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Title"
                  ref={titleRef}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:max-w-sm sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
              >
                Description
              </label>
              <div className="mt-2 sm:col-span-3 sm:mt-0">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="block w-full max-w-2xl rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cardinal-600 sm:text-sm sm:leading-6"
                  defaultValue={""}
                  placeholder="Description"
                  ref={descRef}
                />
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Write a few sentences about the proposal and include any
                  relevant links.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!titleDescOnly ? (
        <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
          <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
            >
              Core Eval Files
            </label>
            <div className="mt-2 sm:col-span-3 sm:mt-0">
              <CodeInputGroup onPairsChange={setEvals} />
            </div>
          </div>
        </div>
      ) : null}

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
};

export { ProposalForm };
