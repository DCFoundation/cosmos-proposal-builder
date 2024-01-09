import { Link } from "wouter";
import type { ChainListItem, ChainList } from "../hooks/useChain";

const selectChainTitle = "Cosmos Proposal Builder";
const selectChainDescription =
  "Select a chain or protocol to begin building a proposal.";

const ChainTiles = ({ chains }: { chains: ChainList }) => {
  return (
    <div className="w-full max-w-5xl px-2 py-2 sm:px-0 m-auto">
      <div className="flex flex-col min-w-full rounded-xl bg-white p-3">
        <div className="py-6 px-8">
          <div>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {selectChainTitle}
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-gray-600">
              {selectChainDescription}
            </p>
          </div>
          <div className="mt-6 py-10 sm:divide-y sm:divide-gray-900/10 sm:border-t-2">
            <ul
              role="list"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {chains.map(({ value, label, image }: ChainListItem) => (
                <li
                  key={value}
                  className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-50 text-center shadow-md hover:bg-gray-100"
                >
                  <Link
                    href={`/${value}`}
                    className="flex flex-1 flex-col p-8 "
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

export { ChainTiles };
