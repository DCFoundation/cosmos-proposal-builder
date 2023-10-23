import React, { FormEvent } from "react";
import { Button } from "./Button";

interface ParameterChangeFormProps {
  title: string;
  description: string;
}

const ParameterChangeForm: React.FC<ParameterChangeFormProps> = ({
  title,
  description,
}) => {
  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
  };

  return (
    <form className="py-6 px-8" onSubmit={onSubmit}>
      <div className="space-y-12 sm:space-y-16">
        <div>
          <h2 className="text-base font-semibold leading-7 text-gray-900">
            {title}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-600">
            {description}
          </p>

          <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
            <div className="p-10 text-center">
              <span className="block text-sm leading-6 text-gray-900 sm:pt-1.5">
                Coming Soon
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-end gap-x-32">
        {false && (
          <Button
            type="submit"
            Icon={null}
            text="Sign & Submit"
            theme="dark"
            layoutStyle="flex w-1/4"
          />
        )}
      </div>
    </form>
  );
};

export { ParameterChangeForm };
