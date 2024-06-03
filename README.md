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

## Testing

We use [Vitest](https://vitest.dev/) as the test runner.

### Unit Tests

```bash
yarn install    # Install project dependencies

yarn test:unit  # Run all tests
```

### End-to-End Tests

End-to-end tests simulate an actual blockchain. Make sure you have [Docker](https://docs.docker.com/engine/install/) installed to run these tests.

#### 1. Start the Blockchain Node

We use a simulation of `agoric-3` for our tests. To start the simulation, run the following command which pulls and runs the [`agoric-3-proposals`](https://github.com/Agoric/agoric-3-proposals/) image, setting up an environment similar to the Agoric mainnet:

```bash
docker run -p 1317:1317 -p 26657:26657 ghcr.io/agoric/agoric-3-proposals:main
```

_The `-p` flags expose the API and RPC ports to localhost._

If you are on Apple Silicon, please ensure Rosetta is **_disabled_** and include the platform option:

```bash
docker run -p 1317:1317 -p 26657:26657 --platform=linux/amd64 ghcr.io/agoric/agoric-3-proposals:main
```

#### 2. Run the Tests

With the simulated environment running, execute the end-to-end tests:

```bash
yarn test:e2e
```

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

## Add chain

```
yarn add-chain  ${CHAIN_NAME}

```

## Permit chain

```yarn permit-chain  ${CHAIN_NAME}

```

example usage

```yarn add-chain  agoric && yarn permit-chain agoric

```
