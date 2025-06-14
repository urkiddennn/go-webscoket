package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatalf("Error upgrading: %v", err)
		return
	}
	defer conn.Close()

	// Listen to incoming messages
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			fmt.Println("Error reading messages: ", err)
			break
		}
		fmt.Printf("Received: %s\\n", message)
		if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
			fmt.Println("Error writing message: ", err)
			break
		}
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	fmt.Println("Websocket Server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatalf("Error staring server: %v ", err)
	}
}
