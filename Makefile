run:
	@docker-compose --env-file .env.dev up

build:
	@docker-compose --env-file .env.dev build