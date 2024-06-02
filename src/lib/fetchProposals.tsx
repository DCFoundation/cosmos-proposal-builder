import { Code } from '../components/inline';

export const fetchProposals = async (
  permittedProposals: QueryParams['msgType'][]
): Promise<
  {
    title: string;
    msgType: QueryParams['msgType'];
    description: React.ReactNode;
    governanceForumLink: string;
  }[]
> => {
  const proposals = [
    {
      title: 'Text Proposal',
      msgType: 'textProposal' as QueryParams['msgType'],
      description: (
        <>
          This is a governance proposal that can be used for signaling support
          or agreement on a certain topic or idea. Text proposals do not contain
          any code, and do not directly enact changes after a passing vote.
        </>
      ),
      governanceForumLink:
        'https://community.agoric.com/c/governance/signaling-proposals/17',
    },
    {
      title: 'CoreEval Proposal',
      msgType: 'coreEvalProposal' as QueryParams['msgType'],
      description: (
        <>
          This is a governance proposal that executes code after a passing vote.
          The JSON Permit grants{' '}
          <a
            className='cursor-pointer hover:text-gray-900 underline'
            href='https://docs.agoric.com/guides/coreeval/permissions.html'
          >
            capabilities
          </a>{' '}
          and the JS Script can start or update a contract. These files can be
          generated with the <Code>agoric run</Code> command. For more details,
          see the{' '}
          <a
            className='cursor-pointer hover:text-gray-900 underline'
            href='https://docs.agoric.com/guides/coreeval/'
          >
            official docs
          </a>
          .
        </>
      ),
      governanceForumLink:
        'https://community.agoric.com/c/governance/core-eval/31',
    },
    {
      title: 'Install Bundle',
      msgType: 'installBundle' as QueryParams['msgType'],
      description: (
        <>
          The install bundle message deploys and installs an external bundle
          generated during the <Code>agoric run</Code> process. The resulting
          installation can be referenced in a{' '}
          <a
            className='cursor-pointer hover:text-gray-900 underline'
            href='https://docs.agoric.com/guides/coreeval/'
          >
            CoreEval proposal
          </a>{' '}
          that starts or updates a contract.
        </>
      ),
      governanceForumLink: '',
    },
    {
      title: 'Parameter Change Proposal',
      msgType: 'parameterChangeProposal' as QueryParams['msgType'],
      description:
        'This is a governance proposal to change chain configuration parameters.',
      governanceForumLink:
        'https://community.agoric.com/c/governance/parameter-changes/16',
    },
    {
      title: 'Community Spend Proposal',
      msgType: 'communityPoolSpendProposal' as QueryParams['msgType'],
      description: (
        <>
          This governance proposal to spend funds from the community pool. The
          community pool is funded by a portion of the transaction fees on the
          Agoric chain. The proposal must include the recipient address and the
          amount to be sent.
        </>
      ),
      governanceForumLink:
        'https://community.agoric.com/c/governance/community-fund/14',
    },
    {
      title: 'Fund Community Pool',
      msgType: 'fundCommunityPool' as QueryParams['msgType'],
      description: '',
      governanceForumLink: '',
    },
  ];

  return proposals.filter((proposal) =>
    permittedProposals.includes(proposal.msgType)
  );
};
