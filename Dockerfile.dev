FROM --platform=linux/amd64 golang:1.23

WORKDIR /go/src/app

RUN apt-get update && apt-get install -y ffmpeg unzip wget

RUN mkdir -p /go/src/app/bin

RUN wget -O /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip && \
    unzip /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip -d /bin && \
    mv /bin/Rhubarb-Lip-Sync-1.13.0-Linux/* /go/src/app/bin/ && \
    chmod +x /go/src/app/bin/rhubarb && \
    rm -rf /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip /bin/Rhubarb-Lip-Sync-1.13.0-Linux

RUN go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

COPY .env.dev /go/src/app/.env.dev

WORKDIR /go/src/app/cmd/http

CMD air