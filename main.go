package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type Message struct {
	SenderID string `json:"senderId"`
	Content  string `json:"content"`
}

var (
	clients   = make(map[*websocket.Conn]string)
	mutex     = sync.Mutex{}
	broadcast = make(chan Message)
)

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading: %v", err)
		return
	}

	clientID := uuid.New().String()
	mutex.Lock()
	clients[conn] = clientID
	mutex.Unlock()

	// Send client ID
	if err := conn.WriteJSON(map[string]string{"clientId": clientID}); err != nil {
		log.Printf("Error sending client ID to %s: %v", clientID, err)
		conn.Close()
		return
	}
	log.Printf("Client %s connected", clientID)

	defer func() {
		mutex.Lock()
		delete(clients, conn)
		mutex.Unlock()
		conn.Close()
		log.Printf("Client %s disconnected", clientID)
	}()

	for {
		var msg Message
		_, data, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading from %s: %v", clientID, err)
			break
		}
		if err := json.Unmarshal(data, &msg); err != nil {
			log.Printf("Error unmarshaling message from %s: %v", clientID, err)
			continue
		}
		if msg.Content == "" {
			log.Printf("Empty message from %s, ignoring", clientID)
			continue
		}
		msg.SenderID = clientID
		log.Printf("Received from %s: %s", clientID, msg.Content)
		broadcast <- msg
	}
}

func handleBroadcast() {
	for {
		msg := <-broadcast
		msgBytes, err := json.Marshal(msg)
		if err != nil {
			log.Printf("Error marshaling message: %v", err)
			continue
		}
		mutex.Lock()
		for conn, clientID := range clients {
			if err := conn.WriteMessage(websocket.TextMessage, msgBytes); err != nil {
				log.Printf("Error broadcasting to %s: %v", clientID, err)
				conn.Close()
				delete(clients, conn)
			}
		}
		mutex.Unlock()
	}
}

func main() {
	http.HandleFunc("/ws", wsHandler)
	go handleBroadcast()
	fmt.Println("WebSocket Server started on :8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatalf("Error starting server: %v", err)
	}
}
