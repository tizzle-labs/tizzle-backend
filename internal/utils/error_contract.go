package utils

import "net/http"

type ErrResponse struct {
	Status int    `json:"status"`
	Type   string `json:"type"`
	Detail string `json:"detail"`
}

var (
	ErrBadRequest = ErrResponse{
		Status: http.StatusBadRequest,
		Type:   "Bad Request",
	}

	ErrInternalServer = ErrResponse{
		Status: http.StatusInternalServerError,
		Type:   "Internal Server",
	}
)

func (er *ErrResponse) GinFormatDetails(detail string) (int, *ErrResponse) {
	er.Detail = detail

	return er.Status, er
}
