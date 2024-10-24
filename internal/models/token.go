package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type TokenHistory struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id,omitempty"`
	AccountID string             `bson:"account_id" json:"account_id"`
	TxHash    string             `bson:"tx_hash" json:"tx_hash"`
	Price     uint64             `bson:"price" json:"price"`
	Tokens    uint64             `bson:"tokens" json:"tokens"`
	CreatedAt time.Time          `bson:"createdAt" json:"created_at"`
}
