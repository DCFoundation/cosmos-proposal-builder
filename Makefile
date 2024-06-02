# Makefile

.PHONY: default
default:
	@echo "Usage: make <chainName>"
	@echo "Example: make cosmoshub"

# Pattern rule to match any chain name and pass it to the script
%:
	@node src/bin/configmaker.mjs $@
