import { IBCDenomInput } from "../../../components/IBCDenomInput";

const PSMParameterInputs = () => (
  <div className="mt-10 space-y-8  border-gray-900/10 pb-12 sm:space-y-0 sm:border-t border-dashed sm:pb-0">
    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
      <label
        htmlFor="denomTrace"
        className="text-sm font-medium text-[#0F3941]"
      >
        IBC Denom
      </label>
      <div className="">
        <IBCDenomInput />
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
      <label
        htmlFor="decimalPlaces"
        className="text-sm font-medium text-[#0F3941]"
      >
        Decimal Places
      </label>
      <div className="">
        <input
          type="number"
          min="1"
          step="1"
          name="decimalPlaces"
          id="decimalPlaces"
          placeholder="6"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#D3482C] sm:text-sm sm:leading-6 py-3"
        />
        <p className="mt-1 text-xs leading-6 text-gray-600">
          The number of decimal places used on the issuing chain.
        </p>
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
      <label
        htmlFor="description"
        className="text-sm font-medium text-[#0F3941]"
      >
        Issuer Keyword
      </label>
      <div className="">
        <input
          type="text"
          name="keyword"
          id="keyword"
          placeholder="IST, USDC_axl, etc."
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#D3482C] sm:text-sm sm:leading-6 py-3"
        />
        <p className="mt-1 text-xs leading-6 text-gray-600">
          The Issuer Keyword must start with an uppercase letter.
        </p>
      </div>
    </div>

    <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
      <label
        htmlFor="description"
        className="text-sm font-medium text-[#0F3941]"
      >
        Proposed Name
      </label>
      <div className="">
        <input
          type="text"
          name="proposedName"
          id="proposedName"
          placeholder="Inter Stable Token"
          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#D3482C] sm:text-sm sm:leading-6 py-3"
        />
      </div>
    </div>
  </div>
);

export { PSMParameterInputs };
