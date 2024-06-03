import { useMemo } from 'react';
import { useChain } from '../hooks/useChain';
// import { RegistryItem, useChainRegistries } from '../omit/useOldChainRegistry';
import { useMutation } from '@tanstack/react-query';
import { RegistryItem, useChainRegistries } from '../hooks/useChainRegistry';

const selectChainTitle = 'Cosmos Proposal Builder';
const selectChainDescription =
  'Select a chain or protocol to begin building a proposal.';

const ChainTiles = () => {
  const { setCurrentChain } = useChain();

  const {
    data: chains = [],
    isLoading: isLoadingChains,
    isError: chainLoadingError,
    isFetching: isFetchingRegistries,
  } = useChainRegistries();

  const visibleChains = useMemo(
    () => chains.filter((chain: RegistryItem) => !chain.parent),
    [chains]
  );

  const openDialogMutation = useMutation<RegistryItem[], Error, RegistryItem>({
    mutationFn: (chain: RegistryItem) => {
      const childrenChains = chains.filter(
        (c: RegistryItem) => c.parent === chain.value
      );
      const parentChain = chains.find(
        (c: RegistryItem) => c.value === chain.parent
      );
      return Promise.resolve(
        parentChain
          ? [chain, ...childrenChains, parentChain]
          : [chain, ...childrenChains]
      );
    },
  });

  // if chain has a child, open dialog otherwise navigate to LandingPage
  const handleChainClick = (chain: RegistryItem) => {
    chains.some((c: RegistryItem) => c.parent === chain.value)
      ? openDialogMutation.mutate(chain)
      : setCurrentChain(chain.value, 'mainnet');
  };
  const handleDialogClose = () => {
    openDialogMutation.reset();
  };
  const handleDialogSelect = (chainName: string) => {
    handleDialogClose();
    setCurrentChain(chainName, 'mainnet');
  };

  if (isLoadingChains || isFetchingRegistries) {
    return <div>Loading chains...</div>;
  }

  if (chainLoadingError) {
    return <div>Error loading chains... {chainLoadingError}</div>;
  }

  return (
    <div className='w-full max-w-7xl px-2 py-2 sm:px-0 m-auto'>
      <div className='flex flex-col min-w-full rounded-xl bg-white p-3'>
        <div className='py-2 px-2'>
          <div>
            <h2 className='text-[28px] font-semibold text-blue'>
              {selectChainTitle}
            </h2>
            <p className='mt-4 text-sm text-grey'>{selectChainDescription}</p>
          </div>
          <div className='mt-[30px] space-y-3 border-t border-dotted border-lightgrey py-[30px] sm:border-t sm:pb-0'>
            <ul
              role='list'
              className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            >
              {visibleChains.map((chain) => (
                <li
                  key={chain.value}
                  className='col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-50 text-center shadow-md hover:bg-gray-100'
                >
                  <button
                    onClick={() => handleChainClick(chain)}
                    className='flex flex-1 flex-col p-8'
                  >
                    <img
                      className='mx-auto h-28 w-28 flex-shrink-0'
                      src={chain.image}
                      alt={`${chain.label} logo`}
                    />
                    <span className='font-medium -mb-4 mt-5'>
                      {chain.label}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {openDialogMutation.isSuccess && (
        <div className='fixed z-10 inset-0 overflow-y-auto'>
          <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 transition-opacity'
              aria-hidden='true'
            >
              <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
            </div>
            <span
              className='hidden sm:inline-block sm:align-middle sm:h-screen'
              aria-hidden='true'
            >
              &#8203;
            </span>
            <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <div className='sm:flex sm:items-start'>
                  <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
                    <h3
                      className='text-lg leading-6 font-medium text-gray-900'
                      id='modal-title'
                    >
                      {openDialogMutation.data?.[0]?.label
                        ? `Select Network for ${openDialogMutation.data[0].label}`
                        : ''}
                    </h3>
                    <div className='mt-2'>
                      <p className='text-sm text-gray-500'>
                        The selected chain has different apps. Please choose the
                        appropriate app/chain to continue.
                      </p>
                    </div>
                    {openDialogMutation.data && (
                      <ul className='mt-4 space-y-2'>
                        {openDialogMutation.data.map((relatedChain) => (
                          <li
                            key={relatedChain.value}
                            className='flex items-center space-x-4'
                          >
                            <button
                              className='flex items-center space-x-2 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm'
                              onClick={() =>
                                handleDialogSelect(relatedChain.value)
                              }
                            >
                              <img
                                className='h-8 w-8 flex-shrink-0'
                                src={relatedChain.image}
                                alt={`${relatedChain.label} logo`}
                              />
                              <span>{relatedChain.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm'
                  onClick={handleDialogClose}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ChainTiles };
