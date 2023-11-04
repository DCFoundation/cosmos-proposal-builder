import {
  useState,
  forwardRef,
  useRef,
  useImperativeHandle,
  FormEvent,
} from "react";
import { CodeInput } from "./CodeInput";
import { MsgInstallBundle } from "@agoric/cosmic-proto/swingset/msgs.js";
import { Button } from "./Button";

export type BundleFormArgs = Pick<MsgInstallBundle, "bundle">;

interface BundleFormProps {
  title: string;
  description: string;
  handleSubmit: (proposal: BundleFormArgs) => void;
}

interface BundleFormMethods {
  reset: () => void;
}

const BundleForm = forwardRef<BundleFormMethods, BundleFormProps>(
  ({ title, description, handleSubmit }, ref) => {
    const [bundle, setBundle] = useState<BundleFormArgs["bundle"] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const codeInputRef = useRef<{ reset: () => void } | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        formRef.current?.reset();
        codeInputRef.current?.reset();
        setBundle(null);
      },
    }));

    const onSubmit = (e: FormEvent) => {
      e.preventDefault();
      if (!bundle) {
        setError("Bundle JSON not provided.");
      } else {
        handleSubmit({ bundle });
      }
    };

    return (
      <form ref={formRef} className="py-6 px-8" onSubmit={onSubmit}>
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
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
                >
                  Bundle JSON
                </label>
                <div className="mt-2 sm:col-span-3 sm:mt-0">
                  <CodeInput
                    ref={codeInputRef}
                    label="JSON Bundle"
                    accept="application/json"
                    prismTag="lang-json"
                    onContentChange={setBundle}
                    subtitle=".json files permitted"
                  />
                </div>
              </div>
            </div>
          </div>
          {error ? <p>{error}</p> : null}
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

export { BundleForm };
