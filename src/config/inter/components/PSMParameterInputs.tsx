import { IBCDenomInput } from "../../../components/IBCDenomInput";

const PSMParameterInputs = () => (
  <div className="mt-10 space-y-8 border-b border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="denomTrace"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        IBC Denom
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <IBCDenomInput />
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="decimalPlaces"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Decimal Places
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="number"
          min="1"
          step="1"
          name="decimalPlaces"
          id="decimalPlaces"
          placeholder="6"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
        <p className="mt-1 text-xs leading-6 text-gray-600">
          The number of decimal places used on the issuing chain.
        </p>
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="description"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Issuer Keyword
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="text"
          name="keyword"
          id="keyword"
          placeholder="IST, USDC_axl, etc."
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
        <p className="mt-1 text-xs leading-6 text-gray-600">
          The Issuer Keyword must start with an uppercase letter.
        </p>
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-4 sm:items-start sm:gap-4 sm:py-6">
      <label
        htmlFor="description"
        className="block text-sm font-medium leading-6 text-gray-900 sm:pt-1.5"
      >
        Proposed Name
      </label>
      <div className="mt-2 sm:col-span-3 sm:mt-0">
        <input
          type="text"
          name="proposedName"
          id="proposedName"
          placeholder="Inter Stable Token"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-teal-600 sm:max-w-sm sm:text-sm sm:leading-6"
        />
      </div>
    </div>
  </div>
);

export { PSMParameterInputs };
