# cosmos-proposal-builder

Governance Proposal Builder for Cosmos Network chains

## Disclaimer

The software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages or other liability, whether in an action of contract, tort or otherwise, arising from, out of or in connection with the software or the use or other dealings in the software.

## Getting Started

- Node v18.x
- Yarn v1.22.x
- Keplr Wallet

```bash
# install dependencies
yarn install

# start dev server
yarn dev

# build static files for production
yarn build
```

## Contributing

Open an issue to request a feature or report a bug.

## Features

### 1. Text Proposals

- /cosmos.gov.v1beta1.TextProposal

### 2. Install Bundle Messages

- /agoric.swingset.MsgInstallBundle

### 3. CoreEval Proposals

- /agoric.swingset.CoreEvalProposal

### 4. Parameter Change Proposals (Coming Soon)

- /cosmos.gov.v1.MsgUpdateParams

## Technologies

- React, TypeScript, Vite, Tailwind
- @cosmjs, @agoric/cosmic-proto
