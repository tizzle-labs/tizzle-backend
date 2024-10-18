package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	AccountID string             `bson:"account_id" json:"account_id"`
	WalletID  string             `bson:"wallet_id" json:"wallet_id"`
	Tokens    uint               `bson:"tokens" json:"tokens"`
}
