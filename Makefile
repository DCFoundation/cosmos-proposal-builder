# # Set the default target
# .PHONY: all
# all: run

# # Define the run target
# .PHONY: run
# run:
# 	node --experimental-modules src/bin/configDownloader.mjs

# # Define the clean target
# # .PHONY: clean
# # clean:
# #     rm -rf node_modules package-lock.json

# # Define the install target
# .PHONY: install
# install:
# 	npm install axios fs

# # Define testnet targets
# .PHONY: agoric-testnet juno-testnet osmosis-testnet
# agoric-testnet:
# 	node --experimental-modules src/bin/configDownloader.mjs agoric testnet

# juno-testnet:
# 	node --experimental-modules src/bin/configDownloader.mjs juno testnet

# osmosis-testnet:
# 	node --experimental-modules src/bin/configDownloader.mjs osmosis testnet


# Set the default target
.PHONY: all
all: run

# Define the run target
.PHONY: run
run:
	node --experimental-modules src/bin/configDownloader.mjs
# Define the clean target
.PHONY: clean
clean:
	rm -rf node_modules package-lock.json

# Define the install target
.PHONY: install
install:
	npm install axios fs

# Define the download target
.PHONY: download
download:
	node --experimental-modules src/bin/configDownloader.mjs $1 $2