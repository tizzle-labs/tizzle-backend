package main

import (
	"os"
	"tizzle-backend/config"
	"tizzle-backend/internal/controllers"
	"tizzle-backend/internal/middlewares"
	"tizzle-backend/internal/repository"
	"tizzle-backend/internal/routes"
	"tizzle-backend/internal/services/elevenlabs"
	"tizzle-backend/internal/services/openai"

	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	mongodb := config.ConnectDB().Database(os.Getenv("DB_NAME"))
	oai := config.InitOpenAI()
	elabs := config.InitElevenLabs()

	r := gin.Default()
	r.Use(middlewares.CORS())

	openAIService := openai.NewOpenAIService(oai)
	evelenLabsService := elevenlabs.NewElevenLabs(*elabs)

	agentRepo := repository.NewAgentRepository(mongodb)
	agentController := controllers.NewAgentController(agentRepo, openAIService, evelenLabsService)

	userRepo := repository.NewUserRepository(mongodb)
	userController := controllers.NewUserController(userRepo)

	routes.Gin(r, agentController, userController)

	r.Run(":" + os.Getenv("PORT"))
}
