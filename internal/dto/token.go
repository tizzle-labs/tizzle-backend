package dto

type (
	TokenHistoryReq struct {
		AccountID string `json:"account_id"`
		TxHash    string `json:"tx_hash"`
		Price     uint64 `json:"price"`
		Tokens    uint64 `json:"tokens"`
	}

	UpdateTokenReq struct {
		Token int `json:"token" binding:"required"`
	}
)
