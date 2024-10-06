package main

import (
	"fmt"
	"net/http"
	"os"
	"tizzle-backend/config"

	"github.com/gin-gonic/gin"
	_ "github.com/joho/godotenv/autoload"
)

func main() {
	mongodb := config.ConnectDB().Database(os.Getenv("MONGO_DBNAME"))
	_ = mongodb

	r := gin.Default()

	r.GET("", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": fmt.Sprintf("server running on port %s lfg!", os.Getenv("PORT")),
		})
	})

	r.Run(":" + os.Getenv("PORT"))
}