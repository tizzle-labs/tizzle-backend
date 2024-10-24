package controllers

import (
	"context"
	"net/http"
	"time"
	"tizzle-backend/internal/dto"
	"tizzle-backend/internal/models"
	"tizzle-backend/internal/repository"
	"tizzle-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TokenController struct {
	repo repository.Token
}

func NewTokenController(repo repository.Token) *TokenController {
	return &TokenController{repo}
}

func (t *TokenController) PostTokenHistory(c *gin.Context) {
	bodyReq := new(dto.TokenHistoryReq)
	if err := c.Bind(&bodyReq); err != nil {
		status, errResp := utils.ErrBadRequest.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	dataTxToken := &models.TokenHistory{
		ID:        primitive.NewObjectID(),
		AccountID: bodyReq.AccountID,
		TxHash:    bodyReq.TxHash,
		Price:     bodyReq.Price,
		Tokens:    bodyReq.Tokens,
		CreatedAt: time.Now(),
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := t.repo.Create(ctx, dataTxToken); err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	c.JSON(http.StatusCreated, dto.Response{
		Message: "Token history has been created!",
		Data:    dataTxToken,
	})
}
