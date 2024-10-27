FROM --platform=linux/amd64 golang:1.23 AS build

WORKDIR /go/src/app

RUN apt-get update && apt-get install -y ffmpeg unzip wget

RUN mkdir -p /go/src/app/bin
RUN wget -O /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip https://github.com/DanielSWolf/rhubarb-lip-sync/releases/download/v1.13.0/Rhubarb-Lip-Sync-1.13.0-Linux.zip && \
    unzip /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip -d /bin && \
    mv /bin/Rhubarb-Lip-Sync-1.13.0-Linux/* /go/src/app/bin/ && \
    chmod +x /go/src/app/bin/rhubarb && \
    rm -rf /bin/Rhubarb-Lip-Sync-1.13.0-Linux.zip /bin/Rhubarb-Lip-Sync-1.13.0-Linux

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /go/src/app/bin/app ./cmd/http

FROM --platform=linux/amd64 golang:1.22-slim

COPY --from=build /go/src/app/bin /app/bin
COPY --from=build /usr/bin/ffmpeg /usr/bin/ffmpeg

WORKDIR /app
ENV PATH="/app/bin:${PATH}"

CMD ["app"]
