ENV_FILE := .env
MAIN_FILE := ./cmd/http/main.go

run:
	@docker-compose --env-file .env.dev up

build:
	@docker-compose --env-file .env.dev build

run-local:
	@export $(shell grep -v '^#' $(ENV_FILE) | xargs) && go run $(MAIN_FILE)
	