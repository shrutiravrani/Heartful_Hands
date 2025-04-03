import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import API from "../api";

const socket = io(API.defaults.baseURL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

const Chat = () => {
  const { eventId } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [user, setUser] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        const userRes = await API.get("/users/profile");
        setUser(userRes.data);

        console.log("🚀 Fetching messages for event ID:", eventId);

        const messagesRes = await API.get(`/chat/${eventId}`);
        setMessages(messagesRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchUserAndMessages();

    socket.emit("joinEventChat", eventId);

    socket.on("receiveMessage", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [eventId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() && !media) {
      alert("Message cannot be empty!");
      return;
    }

    console.log("🚀 Sending message for event ID:", eventId);

    if (!eventId) {
      alert("Chat event ID is missing!");
      return;
    }

    const formData = new FormData();
    formData.append("eventId", eventId);
    formData.append("message", message);
    if (media) {
      formData.append("media", media);
    }

    try {
      const { data } = await API.post("/chat", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      socket.emit("sendMessage", data);
      setMessages((prev) => [
        ...prev,
        { ...data, sender: { _id: user._id, name: user.name } },
      ]);
      setMessage("");
      setMedia(null);
    } catch (error) {
      console.error(
        "❌ Error sending message:",
        error.response ? error.response.data : error
      );
      alert("Error sending message. Check console logs.");
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-screen bg-gray-100 shadow-lg rounded-lg">
      <div className="bg-green-600 text-white p-4 text-center font-bold text-lg">
        Event Chat
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.sender._id === user?._id ? "justify-end" : "justify-start"
            }`}
          >
            <div className="shadow-md p-3 rounded-lg bg-white max-w-xs">
              <span className="text-xs font-bold text-gray-600">
                {msg.sender.name}
              </span>
              <p className="text-sm">{msg.text}</p>

              {msg.mediaUrl &&
                (msg.mediaUrl.includes(".mp4") ? (
                  <video controls src={msg.mediaUrl} width="200" />
                ) : (
                  <img
                    src={msg.mediaUrl}
                    alt="Media"
                    width="200"
                    className="rounded-lg mt-2"
                  />
                ))}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center p-3 border-t bg-white">
        <textarea
          className="flex-1 p-2 border rounded-lg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        {user?.role === "event_manager" && (
          <input
            type="file"
            accept="image/*,video/*"
            className="ml-2"
            onChange={(e) => setMedia(e.target.files[0])}
          />
        )}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg ml-2"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
