package routes

import (
	"fmt"
	"net/http"
	"os"
	"tizzle-backend/internal/controllers"

	"github.com/gin-gonic/gin"
)

func Gin(r *gin.Engine, ca *controllers.AgentController) {
	r.GET("", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("server running on port %s lfg!", os.Getenv("PORT")),
		})
	})

	api := r.Group("/api/v1")
	{
		api.POST("/tts/:name", ca.PostTextToSpeech)
	}
}
