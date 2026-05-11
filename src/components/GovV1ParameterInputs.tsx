import { useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNetwork } from "../hooks/useNetwork";
import { govV1ParamsQuery } from "../lib/queries";
import { selectGovV1Params } from "../lib/selectors";
import type { GovV1ParamFormData } from "../types/gov";

// Constants for 64-bit integer bounds for Duration.seconds
// From the protobuf spec: Must be from -315,576,000,000 to +315,576,000,000 inclusive
const MIN_DURATION_SECONDS = BigInt(-315576000000);
const MAX_DURATION_SECONDS = BigInt(315576000000);

// Validation function for duration values
const validateDuration = (seconds: string): string | null => {
  if (!seconds.trim()) return null; // Allow empty values
  
  try {
    const secondsBigInt = BigInt(seconds);
    
    if (secondsBigInt < MIN_DURATION_SECONDS || secondsBigInt > MAX_DURATION_SECONDS) {
      return `Duration must be between ${MIN_DURATION_SECONDS.toLocaleString()} and ${MAX_DURATION_SECONDS.toLocaleString()} seconds (protobuf 64-bit limit)`;
    }
    
    if (secondsBigInt < BigInt(0)) {
      return "Duration cannot be negative";
    }
    
    return null; // Valid
  } catch (error) {
    return "Invalid number format";
  }
};

// Interface for the ref methods
export interface GovV1ParameterInputsMethods {
  getFormData: () => GovV1ParamFormData | null;
  reset: () => void;
  hasValidationErrors: () => boolean;
  getValidationErrors: () => Record<string, string>;
}

const GovV1ParameterInputsBase = (
  props: {
    defaultAuthorityAddress: string | undefined;
  },
  ref: React.ForwardedRef<GovV1ParameterInputsMethods>,
) => {
  const { defaultAuthorityAddress } = props;
  const { api } = useNetwork();
  const paramsQuery = useQuery(govV1ParamsQuery(api));
  const currentParams = selectGovV1Params(paramsQuery);

  // State for form data
  const [formData, setFormData] = useState<GovV1ParamFormData | null>(null);
  
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Load current parameters into form when available
  useEffect(() => {
    if (currentParams && !formData) {
      setFormData(currentParams);
    }
  }, [currentParams, formData]);

  // Expose methods through ref
  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
    reset: () => {
      setFormData(currentParams || null);
      setValidationErrors({});
    },
    hasValidationErrors: () => Object.keys(validationErrors).some(key => validationErrors[key]),
    getValidationErrors: () => validationErrors,
  }));

  // Helper to update form data
  const updateField = (field: keyof GovV1ParamFormData, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  // Helper to update duration fields with validation
  const updateDurationField = (field: keyof GovV1ParamFormData, value: string) => {
    if (!formData) return;
    
    // Update the form data
    setFormData({ ...formData, [field]: value });
    
    // Validate the duration
    const error = validateDuration(value);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
      }
      return newErrors;
    });
  };

  // Helper to update minDeposit array
  const updateMinDeposit = (
    index: number,
    field: "denom" | "amount",
    value: string,
  ) => {
    if (!formData) return;
    const newMinDeposit = [...(formData?.minDeposit || [])];
    newMinDeposit[index] = { ...newMinDeposit[index], [field]: value };
    setFormData({ ...formData, minDeposit: newMinDeposit });
  };

  const addMinDeposit = () => {
    if (!formData) return;
    setFormData({
      ...formData,
      minDeposit: [...(formData?.minDeposit || []), { denom: "", amount: "" }],
    });
  };

  const removeMinDeposit = (index: number) => {
    if (!formData) return;
    const newMinDeposit = (formData?.minDeposit || []).filter(
      (_, i) => i !== index,
    );
    setFormData({ ...formData, minDeposit: newMinDeposit });
  };

  // Handle loading and error states
  if (paramsQuery.isLoading) {
    return (
      <div className="mt-10 text-center text-gray-500">
        Loading current governance parameters...
      </div>
    );
  }

  if (paramsQuery.isError) {
    return (
      <div className="mt-10 text-center text-red-600">
        ⚠️ Error loading governance parameters: {paramsQuery.error?.toString()}
        <br />
        <span className="text-sm">
          Please check your network connection and API endpoint.
        </span>
      </div>
    );
  }

  if (!currentParams) {
    return (
      <div className="mt-10 text-center text-yellow-600">
        ⚠️ No governance parameters found
        <br />
        <span className="text-sm">
          The API did not return any Gov v1 parameters. This could be due to:
          <br />• <strong>No chain selected</strong> - Please select a network
          first
          <br />
          • You're connected to a chain that doesn't support Gov v1
          <br />
          • API endpoint issue or network connectivity problem
          <br />
          • Chain doesn't have Gov v1 module enabled
          <br />
          <br />
          <strong>Current API:</strong> {api || "None selected"}
          <br />
          <strong>Query endpoint:</strong>{" "}
          {api ? `${api}/cosmos/gov/v1/params` : "No API endpoint"}
          <br />
          <strong>Raw response:</strong>{" "}
          {JSON.stringify(paramsQuery.data) || "Empty/null"}
        </span>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="mt-10 text-center text-gray-500">
        Initializing form with current parameters...
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-8 border-gray-900/10 pb-12 sm:space-y-0 sm:divide-y sm:divide-gray-900/10 sm:border-t sm:pb-0">
      {/* Authority Section */}
      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
        <label htmlFor="authority" className="text-sm font-medium text-blue">
          Governance Authority Address
        </label>
        <div>
          <input
            type="text"
            name="authority"
            id="authority"
            placeholder="cosmos1..."
            defaultValue={defaultAuthorityAddress}
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
            required
          />
          <p className="mt-1 text-xs leading-6 text-gray-600">
            The governance module authority address (required for parameter
            updates)
          </p>
        </div>
      </div>

      {/* Min Deposit Section */}
      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
        <label className="text-sm font-medium text-blue">Minimum Deposit</label>
        <div className="space-y-2">
          {formData?.minDeposit?.map((deposit, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Denom (e.g., ubld)"
                value={deposit.denom}
                onChange={(e) =>
                  updateMinDeposit(index, "denom", e.target.value)
                }
                className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
              />
              <input
                type="number"
                placeholder="Amount"
                value={deposit.amount}
                onChange={(e) =>
                  updateMinDeposit(index, "amount", e.target.value)
                }
                className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
              />
              <button
                type="button"
                onClick={() => removeMinDeposit(index)}
                className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                disabled={(formData?.minDeposit?.length || 0) === 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMinDeposit}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            + Add Deposit
          </button>
        </div>
      </div>

      {/* Duration Fields */}
      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
        <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
          <label
            htmlFor="maxDepositPeriod"
            className="text-sm font-medium text-blue"
          >
            Max Deposit Period (seconds)
          </label>
          <input
            type="number"
            name="maxDepositPeriod"
            id="maxDepositPeriod"
            value={formData?.maxDepositPeriod || ""}
            onChange={(e) => updateDurationField('maxDepositPeriod', e.target.value)}
            className={`block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-1 focus:ring-inset ${
              validationErrors.maxDepositPeriod 
                ? 'ring-red-500 focus:ring-red-500' 
                : 'ring-light focus:ring-red'
            }`}
          />
          {validationErrors.maxDepositPeriod && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.maxDepositPeriod}
            </p>
          )}
          <p className="mt-1 text-xs leading-6 text-gray-600">
            Time for deposits in seconds (e.g., 172800 = 48 hours)<br/>
            <span className="text-gray-500">Max: {MAX_DURATION_SECONDS.toLocaleString()} seconds (≈10,000 years)</span>
          </p>
        </div>

        <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
          <label
            htmlFor="votingPeriod"
            className="text-sm font-medium text-blue"
          >
            Voting Period (seconds)
          </label>
          <input
            type="number"
            name="votingPeriod"
            id="votingPeriod"
            value={formData?.votingPeriod || ""}
            onChange={(e) => updateDurationField('votingPeriod', e.target.value)}
            className={`block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-1 focus:ring-inset ${
              validationErrors.votingPeriod 
                ? 'ring-red-500 focus:ring-red-500' 
                : 'ring-light focus:ring-red'
            }`}
          />
          {validationErrors.votingPeriod && (
            <p className="mt-1 text-xs text-red-600">
              {validationErrors.votingPeriod}
            </p>
          )}
          <p className="mt-1 text-xs leading-6 text-gray-600">
            Time for voting in seconds (e.g., 604800 = 7 days)<br/>
            <span className="text-gray-500">Max: {MAX_DURATION_SECONDS.toLocaleString()} seconds (≈10,000 years)</span>
          </p>
        </div>
      </div>

      {/* Percentage Fields */}
      <div className="sm:grid sm:grid-cols-3 sm:gap-4">
        <div className="sm:py-6">
          <label htmlFor="quorum" className="text-sm font-medium text-blue">
            Quorum
          </label>
          <input
            type="text"
            name="quorum"
            id="quorum"
            value={formData?.quorum || ""}
            onChange={(e) => updateField("quorum", e.target.value)}
            placeholder="0.334000000000000000"
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
          />
          <p className="mt-1 text-xs text-gray-600">
            33.4% = 0.334000000000000000
          </p>
        </div>

        <div className="sm:py-6">
          <label htmlFor="threshold" className="text-sm font-medium text-blue">
            Threshold
          </label>
          <input
            type="text"
            name="threshold"
            id="threshold"
            value={formData?.threshold || ""}
            onChange={(e) => updateField("threshold", e.target.value)}
            placeholder="0.500000000000000000"
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
          />
          <p className="mt-1 text-xs text-gray-600">
            50% = 0.500000000000000000
          </p>
        </div>

        <div className="sm:py-6">
          <label
            htmlFor="vetoThreshold"
            className="text-sm font-medium text-blue"
          >
            Veto Threshold
          </label>
          <input
            type="text"
            name="vetoThreshold"
            id="vetoThreshold"
            value={formData?.vetoThreshold || ""}
            onChange={(e) => updateField("vetoThreshold", e.target.value)}
            placeholder="0.334000000000000000"
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
          />
          <p className="mt-1 text-xs text-gray-600">
            33.4% = 0.334000000000000000
          </p>
        </div>
      </div>

      {/* Additional Ratios */}
      <div className="sm:grid sm:grid-cols-2 sm:gap-4">
        <div className="sm:py-6">
          <label
            htmlFor="minInitialDepositRatio"
            className="text-sm font-medium text-blue"
          >
            Min Initial Deposit Ratio
          </label>
          <input
            type="text"
            name="minInitialDepositRatio"
            id="minInitialDepositRatio"
            value={formData?.minInitialDepositRatio || ""}
            onChange={(e) =>
              updateField("minInitialDepositRatio", e.target.value)
            }
            placeholder="0.000000000000000000"
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
          />
          <p className="mt-1 text-xs text-gray-600">
            Initial deposit ratio required
          </p>
        </div>

        <div className="sm:py-6">
          <label
            htmlFor="min_deposit_ratio"
            className="text-sm font-medium text-blue"
          >
            Min Deposit Ratio
          </label>
          <input
            type="text"
            name="min_deposit_ratio"
            id="min_deposit_ratio"
            value={formData?.min_deposit_ratio || ""}
            onChange={(e) => updateField("min_deposit_ratio", e.target.value)}
            placeholder="0.010000000000000000"
            className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
          />
          <p className="mt-1 text-xs text-gray-600">
            1% = 0.010000000000000000
          </p>
        </div>
      </div>

      {/* Proposal Cancellation */}
      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
        <label
          htmlFor="proposal_cancel_ratio"
          className="text-sm font-medium text-blue"
        >
          Proposal Cancel Ratio
        </label>
        <input
          type="text"
          name="proposal_cancel_ratio"
          id="proposal_cancel_ratio"
          value={formData?.proposal_cancel_ratio || ""}
          onChange={(e) => updateField("proposal_cancel_ratio", e.target.value)}
          placeholder="0.500000000000000000"
          className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
        />
        <p className="mt-1 text-xs leading-6 text-gray-600">
          Ratio of total stake needed to cancel a proposal (50% =
          0.500000000000000000)
        </p>
      </div>

      {/* Expedited Proposal Settings */}
      <div className="sm:grid sm:grid-cols-1 sm:items-start sm:gap-2 sm:py-6">
        <label className="text-sm font-medium text-blue">
          Expedited Proposal Settings
        </label>

        <div className="sm:grid sm:grid-cols-2 sm:gap-4 mt-4">
          <div>
            <label
              htmlFor="expedited_voting_period"
              className="text-sm font-medium text-blue"
            >
              Expedited Voting Period (seconds)
            </label>
            <input
              type="number"
              name="expedited_voting_period"
              id="expedited_voting_period"
              value={formData?.expedited_voting_period || ""}
              onChange={(e) => updateDurationField('expedited_voting_period', e.target.value)}
              placeholder="86400"
              className={`block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-1 focus:ring-inset ${
                validationErrors.expedited_voting_period 
                  ? 'ring-red-500 focus:ring-red-500' 
                  : 'ring-light focus:ring-red'
              }`}
            />
            {validationErrors.expedited_voting_period && (
              <p className="mt-1 text-xs text-red-600">
                {validationErrors.expedited_voting_period}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-600">
              86400 = 24 hours<br/>
              <span className="text-gray-500">Max: {MAX_DURATION_SECONDS.toLocaleString()} seconds (≈10,000 years)</span>
            </p>
          </div>

          <div>
            <label
              htmlFor="expedited_threshold"
              className="text-sm font-medium text-blue"
            >
              Expedited Threshold
            </label>
            <input
              type="text"
              name="expedited_threshold"
              id="expedited_threshold"
              value={formData?.expedited_threshold || ""}
              onChange={(e) =>
                updateField("expedited_threshold", e.target.value)
              }
              placeholder="0.667000000000000000"
              className="block w-full rounded-md border-0 py-3 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
            />
            <p className="mt-1 text-xs text-gray-600">
              66.7% = 0.667000000000000000
            </p>
          </div>
        </div>

        {/* Expedited Min Deposit */}
        <div className="mt-4">
          <label className="text-sm font-medium text-blue">
            Expedited Min Deposit
          </label>
          <div className="space-y-2 mt-2">
            {formData?.expedited_min_deposit?.map((deposit, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Denom (e.g., stake)"
                  value={deposit.denom}
                  onChange={(e) => {
                    const newExpedited = [
                      ...(formData?.expedited_min_deposit || []),
                    ];
                    newExpedited[index] = {
                      ...newExpedited[index],
                      denom: e.target.value,
                    };
                    updateField("expedited_min_deposit", newExpedited);
                  }}
                  className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={deposit.amount}
                  onChange={(e) => {
                    const newExpedited = [
                      ...(formData?.expedited_min_deposit || []),
                    ];
                    newExpedited[index] = {
                      ...newExpedited[index],
                      amount: e.target.value,
                    };
                    updateField("expedited_min_deposit", newExpedited);
                  }}
                  className="flex-1 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-light placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-red"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newExpedited = (
                      formData?.expedited_min_deposit || []
                    ).filter((_, i) => i !== index);
                    updateField("expedited_min_deposit", newExpedited);
                  }}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-800"
                  disabled={
                    (formData?.expedited_min_deposit?.length || 0) === 1
                  }
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newExpedited = [
                  ...(formData?.expedited_min_deposit || []),
                  { denom: "", amount: "" },
                ];
                updateField("expedited_min_deposit", newExpedited);
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Expedited Deposit
            </button>
          </div>
        </div>
      </div>

      {/* Boolean Fields */}
      <div className="sm:grid sm:grid-cols-1 sm:gap-2 sm:py-6">
        <label className="text-sm font-medium text-blue">Burn Settings</label>
        <div className="space-y-3 mt-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="burnVoteQuorum"
              checked={formData?.burnVoteQuorum || false}
              onChange={(e) => updateField("burnVoteQuorum", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Burn deposits if proposal doesn't meet quorum
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="burnProposalDepositPrevote"
              checked={formData?.burnProposalDepositPrevote || false}
              onChange={(e) =>
                updateField("burnProposalDepositPrevote", e.target.checked)
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Burn deposits if proposal doesn't enter voting period
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              name="burnVoteVeto"
              checked={formData?.burnVoteVeto || false}
              onChange={(e) => updateField("burnVoteVeto", e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Burn deposits if quorum with veto votes is met
            </span>
          </label>
        </div>
      </div>
    </div>
  );
};

// Create the forwardRef component
const GovV1ParameterInputs = forwardRef(GovV1ParameterInputsBase);

export { GovV1ParameterInputs };
