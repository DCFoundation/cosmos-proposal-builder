import {
  useRef,
  useImperativeHandle,
  forwardRef,
  FormEvent,
  ReactNode,
  useState,
  useMemo,
} from "react";
import { Button } from "./Button";
import { Stepper } from "./Stepper";

interface ProposalFormProps {
  title: string;
  description: string | ReactNode;
  tabs: { title: string; content: ReactNode }[];
  handleSubmit: (e: FormEvent) => Promise<void>;
  titleDescOnly?: boolean;
}

interface ProposalFormMethods {
  reset: () => void;
}

const MultiStepProposalForm = forwardRef<
  ProposalFormMethods,
  ProposalFormProps
>(({ title, description, handleSubmit, tabs }, ref) => {
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);

  useImperativeHandle(ref, () => ({
    data: () => {
      if (formRef?.current) return new FormData(formRef.current);
      throw new Error("Error reading form data.");
    },
    reset: () => {
      formRef.current?.reset();
    },
  }));

  const isFinalStep = useMemo(
    () => currentStep === tabs.length - 1,
    [currentStep, tabs.length],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isFinalStep) return handleSubmit(e);
    // navigate to next step if not final step
    setCurrentStep((prev) => prev! + 1);
  };

  return (
    <form ref={formRef} className="py-6 px-8" onSubmit={onSubmit}>
      <h2 className="text-base font-semibold leading-7 text-gray-900">
        {title}
      </h2>
      <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
        {description}
      </p>

      <div className="mt-12">
        <Stepper
          tabs={tabs}
          currentStep={currentStep}
          onChange={setCurrentStep}
        />
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-32">
        <Button
          type="submit"
          Icon={null}
          text={isFinalStep ? "Sign & Submit" : "Continue"}
          theme="dark"
          layoutStyle="flex w-1/4"
        />
      </div>
    </form>
  );
});

export { MultiStepProposalForm };
