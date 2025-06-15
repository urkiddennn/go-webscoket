import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080/ws");
    setWs(websocket);

    websocket.onopen = () => console.log("Connected to WebSocket Server");
    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received WebSocket message:", data);
        if (data.clientId) {
          setClientId(data.clientId);
          console.log("Set clientId:", data.clientId);
        } else if (data.senderId && data.content) {
          setMessages((prev) => [
            ...prev,
            {
              senderId: data.senderId,
              content: data.content,
              timestamp: new Date(),
            },
          ]);
          console.log("Added message:", data.content);
        } else {
          console.warn("Invalid message format:", data);
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err, event.data);
      }
    };
    websocket.onerror = (err) => console.error("WebSocket error:", err);
    websocket.onclose = () => console.log("Disconnected from WebSocket server");

    return () => {
      websocket.close();
    };
  }, []);

  const handleChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      const message = { content: input };
      try {
        ws.send(JSON.stringify(message));
        console.log("Sent message:", message);
        setInput("");
      } catch (err) {
        console.error("Error sending message:", err);
      }
    } else {
      console.warn("Cannot send: WebSocket not open or input empty");
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="w-full h-screen p-5 flex flex-col gap-3 justify-center items-center">
      <h1 className="font-semibold text-3xl">Chat Section</h1>
      <div className="w-1/2 h-1/2 outline-1 outline-gray-600 rounded-lg relative p-3 overflow-y-auto">
        {/* Static example messages */}
        <div className="chat chat-start">
          <div className="chat-bubble">
            It's over Anakin,
            <br />I have the high ground.
          </div>
        </div>
        <div className="chat chat-end">
          <div className="chat-bubble">You underestimate my power!</div>
        </div>
        {/* Dynamic WebSocket messages */}
        {messages.length === 0 && (
          <div className="text-center text-gray-500">No messages yet...</div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat ${msg.senderId === clientId ? "chat-end" : "chat-start"}`}
          >
            <div className="chat-bubble">
              {msg.content}
              <div className="chat-footer text-xs opacity-50 mt-1">
                {formatTime(msg.timestamp)}
              </div>
            </div>
          </div>
        ))}

        <form
          className="absolute bottom-2.5 left-0 flex gap-3 w-full pr-3 pl-3"
          onSubmit={handleSubmit}
        >
          <input
            type="text"
            value={input}
            name="message"
            onChange={handleChange}
            placeholder="Type here"
            className="input w-full"
          />
          <button className="btn text-lg btn-neutral" type="submit">
            Send
            <IoSend size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
