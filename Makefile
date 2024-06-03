# chain?=$chain

# Makefile

# .PHONY: default
# default:
# 	@echo "Usage: make <chainName>"
# 	@echo "Example: make cosmoshub"

# # Pattern rule to match any chain name and pass it to the script
# %:
# 	@node src/bin/configmaker.mjs $@
.PHONY: default add permit
default:
	@echo "Usage: make add <chainName> or make permit <chainName>"
	@echo "Example: make add cosmoshub or make permit osmosis"

# Rule for downloading the chain configuration
add:
	@node src/bin/configmaker.mjs 

# Rule for adding a chain to the permitted chains list
permit:
	@node src/bin/permitChain.mjs $(word 2,$(subst permit , ,$@))