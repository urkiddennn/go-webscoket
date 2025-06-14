import { useEffect, useState } from "react";
import { IoSend } from "react-icons/io5";

const App = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080/ws");
    setWs(websocket);

    websocket.onopen = () => console.log("Connected to WebSocket Server");
    websocket.onmessage = (event) => {
      setMessages((prevMessages) => [...prevMessages, event.data]);
    };
    websocket.onclose = () => console.log("Disconnected from WebSocket server");

    return () => websocket.close();
  }, []);

  const handleChange = (e) => {
    setInput(e.target.value); // Update input state
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ws && ws.readyState === WebSocket.OPEN && input.trim()) {
      ws.send(input); // Send message to WebSocket
      setMessages((prevMessages) => [...prevMessages, input]); // Add to local messages
      setInput(""); // Clear input
    }
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
        {messages.map((message, index) => (
          <div key={index} className="chat chat-end">
            <div className="chat-bubble">{message}</div>
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
