MAKEFLAGS += --silent
path := .

.PHONY: help
help: ## what you watching now
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n\nTargets:\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

.PHONY: format
format: ## format code
	poetry run isort .
	poetry run black .
