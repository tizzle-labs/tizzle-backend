package controllers

import (
	"fmt"
	"net/http"
	"tizzle-backend/internal/dto"
	"tizzle-backend/internal/models"
	"tizzle-backend/internal/repository"
	"tizzle-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type UserController struct {
	repo repository.User
}

func NewUserController(repo repository.User) *UserController {
	return &UserController{repo}
}

func (u *UserController) PostNewUser(c *gin.Context) {
	bodyReq := new(dto.NewUserRequest)
	if err := c.Bind(&bodyReq); err != nil {
		status, errResp := utils.ErrBadRequest.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	dataUser := &models.User{
		ID:        primitive.NewObjectID(),
		AccountID: bodyReq.AccountID,
		WalletID:  bodyReq.WalletID,
		Tokens:    0,
	}

	if err := u.repo.Create(dataUser); err != nil {
		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	c.JSON(http.StatusCreated, dto.Response{
		Message: "User has been created!",
		Data:    dataUser,
	})
}

func (u *UserController) GetAccountID(c *gin.Context) {
	accountID := c.Param("account_id")

	user, err := u.repo.FindNByAccountID(accountID)
	if err != nil {
		if err.Error() == "no-result" {
			c.JSON(http.StatusOK, dto.Response{
				Message: "no-result",
				Data:    nil,
			})
			return
		}

		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Message: fmt.Sprintf("Get account ID %s successfully!", user.AccountID),
		Data:    user,
	})

}

func (u *UserController) UpdateToken(c *gin.Context) {
	accountID := c.Param("account_id")
	bodyReq := new(dto.UpdateTokenReq)

	if err := c.Bind(&bodyReq); err != nil {
		status, errResp := utils.ErrBadRequest.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	if err := u.repo.UpdateToken(accountID, bodyReq.Token); err != nil {
		if err.Error() == "no-result" {
			c.JSON(http.StatusNotFound, dto.Response{
				Message: "Account not found",
				Data:    nil,
			})
			return
		}

		status, errResp := utils.ErrInternalServer.GinFormatDetails(err.Error())
		c.JSON(status, errResp)
		return
	}

	c.JSON(http.StatusOK, dto.Response{
		Message: "Token updated successfully!",
		Data:    bodyReq.Token,
	})
}
