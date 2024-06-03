
.PHONY: default add permit
default:
	@echo "Usage: make add <chainName> or make permit <chainName>"
	@echo "Example: make add cosmoshub or make permit osmosis"

add:
	@node src/bin/configmaker.mjs 

permit:
	@node src/bin/permitChain.mjs $(word 2,$(subst permit , ,$@))