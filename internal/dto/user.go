package dto

type NewUserRequest struct {
	AccountID string `json:"account_id"`
	WalletID  string `json:"wallet_id"`
}
