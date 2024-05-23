import { Link } from "wouter";
import { CHAINS } from "../constants/chains";
import { useCallback, useMemo } from "react";
import { ChainItem } from "../types/chain";
import { chainItemMap } from "../contexts/chain";

const selectChainTitle = "Cosmos Proposal Builder";
const selectChainDescription =
  "Select a chain or protocol to begin building a proposal.";

export const ChainTiles = () => {
  const chains: ChainItem[] = useMemo(() => CHAINS, []);

  const notChains = useCallback(
    () =>
      chainItemMap.forEach((chainItem, value) => {
        console.log(
          `value: ${value}\n\nchainItem: \n\t href: \t${
            chainItem.href
          }\n\t proposal Types: \t ${Object.entries(
            chainItem.enabledProposalTypes
          )}\n\t label: \t${chainItem.label}`
        );
      }),
    []
  );
  notChains();

  return (
    <div className="w-full max-w-7xl px-2 py-2 sm:px-0 m-auto">
      <div className="flex flex-col min-w-full rounded-xl bg-white p-3">
        <div className="py-2 px-2">
          <div>
            <h2 className="text-[28px] font-semibold text-blue">
              {selectChainTitle}
            </h2>
            <p className="mt-4 text-sm text-grey">{selectChainDescription}</p>
          </div>
          <div className="mt-[30px] space-y-3 border-t border-dotted border-lightgrey py-[30px] sm:border-t sm:pb-0">
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {chains.map(({ value, label, image }) => (
                <li
                  key={value}
                  className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-50 text-center shadow-md hover:bg-gray-100"
                >
                  <Link
                    href={`/${value}?network=mainnet`}
                    className="flex flex-1 flex-col p-8"
                  >
                    <img
                      className="mx-auto h-28 w-28 flex-shrink-0"
                      src={image}
                      alt={`${label} logo`}
                    />
                    <span className="font-medium -mb-4 mt-5">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
