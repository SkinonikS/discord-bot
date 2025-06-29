# Common Variables
RELEASE_NAME ?= production
CACHE ?= true

# Discord Bot Cluster Defaults
CLUSTER_NAMESPACE ?= discord-bot-cluster
CLUSTER_CHARTS_DIR ?= helm-charts/discord-bot-cluster
CLUSTER_IMAGE_NAME ?= discord-bot:latest
CLUSTER_TARGET ?= discord-bot

# Discord Bot Operator Defaults
OPERATOR_NAMESPACE ?= discord-bot-operator
OPERATOR_CHARTS_DIR ?= helm-charts/discord-bot-operator
OPERATOR_IMAGE_NAME ?= discord-bot-k8s-operator:latest
OPERATOR_TARGET ?= discord-bot-k8s-operator

.PHONY: help \
	cluster-install cluster-uninstall cluster-build \
	operator-install operator-uninstall operator-build

## Show available commands
help:
	@echo "Available targets:"
	@echo "  cluster-install        Install or upgrade the Discord bot cluster release"
	@echo "  cluster-uninstall      Uninstall the Discord bot cluster release"
	@echo "  cluster-build          Build the Docker image for the Discord bot cluster"
	@echo ""
	@echo "  operator-install       Install or upgrade the Discord bot operator release"
	@echo "  operator-uninstall     Uninstall the Discord bot operator release"
	@echo "  operator-build         Build the Docker image for the Discord bot operator"
	@echo ""
	@echo "Available variable overrides:"
	@echo "  RELEASE_NAME=<name>        (default: production)"
	@echo "  CACHE=true|false           (default: true)"
	@echo ""
	@echo "Cluster-specific:"
	@echo "  CLUSTER_NAMESPACE=<name>   (default: discord-bot-cluster)"
	@echo "  CLUSTER_CHARTS_DIR=<path>  (default: helm-charts/discord-bot-cluster)"
	@echo "  CLUSTER_IMAGE_NAME=<name>  (default: discord-bot:latest)"
	@echo "  CLUSTER_TARGET=<name>      (default: discord-bot)"
	@echo ""
	@echo "Operator-specific:"
	@echo "  OPERATOR_NAMESPACE=<name>  (default: discord-bot-operator)"
	@echo "  OPERATOR_CHARTS_DIR=<path> (default: helm-charts/discord-bot-operator)"
	@echo "  OPERATOR_IMAGE_NAME=<name> (default: discord-bot-k8s-operator:latest)"
	@echo "  OPERATOR_TARGET=<name>     (default: discord-bot-k8s-operator)"

## Cluster targets

cluster-install:
	helm upgrade --install $(RELEASE_NAME) $(CLUSTER_CHARTS_DIR) --namespace $(CLUSTER_NAMESPACE) --create-namespace

cluster-uninstall:
	helm uninstall $(RELEASE_NAME) --namespace $(CLUSTER_NAMESPACE)

cluster-build:
	@if [ "$(CACHE)" = "false" ]; then \
		docker build . --target $(CLUSTER_TARGET) --tag $(CLUSTER_IMAGE_NAME) --no-cache; \
	else \
		docker build . --target $(CLUSTER_TARGET) --tag $(CLUSTER_IMAGE_NAME); \
	fi

## Operator targets

operator-install:
	helm upgrade --install $(RELEASE_NAME) $(OPERATOR_CHARTS_DIR) --namespace $(OPERATOR_NAMESPACE) --create-namespace

operator-uninstall:
	helm uninstall $(RELEASE_NAME) --namespace $(OPERATOR_NAMESPACE)

operator-build:
	@if [ "$(CACHE)" = "false" ]; then \
		docker build . --target $(OPERATOR_TARGET) --tag $(OPERATOR_IMAGE_NAME) --no-cache; \
	else \
		docker build . --target $(OPERATOR_TARGET) --tag $(OPERATOR_IMAGE_NAME); \
	fi
