import url from "url";
import { WebSocketServer } from "ws";

const webSocketSecure = new WebSocketServer({
  port: 8080,
});

const conversations = [
  {
    id: "123",
    members: ["123", "456"],
    messages: [
      {
        id: "",
        text: "",
        message: "",
        sender_id: "",
        read: false,
      },
    ],
  },
  {
    id: "456",
    members: ["123", "456"],
    messages: [
      {
        id: "",
        text: "",
        message: "",
        sender_id: "",
        read: false,
      },
    ],
  },
  {
    id: "536345",
    members: ["123", "456"],
    messages: [
      {
        id: "",
        text: "",
        message: "",
        sender_id: "",
        read: false,
      },
    ],
  },
];

const clients = new Map();

webSocketSecure.on("connection", (webSocket, request) => {
  const userId = url.parse(request.url, true).query.user;
  console.log(`someone connected! ${userId}`);
  clients.set(userId, webSocket);

  webSocket.on("message", (data) => {
    const json = JSON.parse(Buffer.from(data).toString());

    const conversation = conversations.find(
      (conversation) => conversation.id === json.conversation_id
    );

    switch (json.type) {
      case "send_message":
        conversation?.members?.forEach((member) => {
          const ws = clients.get(member);
          ws?.send(
            JSON.stringify({
              ...json,
              type: "message_sent",
              message: json.message,
              read: false,
              message_id: json.message_id,
              conversation_id: json.conversation_id,
              sender_id: json.sender_id,
              time: json.time,
              ...(json.reply && { reply: json.reply }),
            })
          );
        });
        break;
      case "delivered_message":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          setTimeout(() => {
            ws?.send(
              JSON.stringify({
                ...json,
                type: "message_delivered",
                message: json.message,
                read: false,
                message_id: json.message_id,
                conversation_id: json.conversation_id,
                sender_id: json.sender_id,
                time: json.time,
                ...(json.reply && { reply: json.reply }),
              })
            );
          }, 500);
        });
        break;
      case "read_message":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          setTimeout(() => {
            ws?.send(
              JSON.stringify({
                type: "message_read",
                message: json.message,
                read: false,
                message_id: json.message_id,
                conversation_id: json.conversation_id,
                sender_id: json.sender_id,
                time: json.time,
                ...(json.reply && { reply: json.reply }),
              })
            );
          }, 500);
        });
        break;
      case "read_conversation":
        conversation?.members?.forEach((member) => {
          const ws = clients.get(member);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: "conversatoin_read",
                conversation_id: json.conversation_id,
                sender_id: json.sender_id,
              })
            );
          }
        });
        break;
      case "focus":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);

          ws?.send(
            JSON.stringify({
              type: "focus",
              conversation_id: json.conversation_id,
              sender_id: json.sender_id,
            })
          );
        });
        break;
      case "active-typing":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          ws?.send(
            JSON.stringify({
              type: "active-typing",
              conversation_id: json.conversation_id,
              sender_id: json.sender_id,
            })
          );
        });
        break;
      case "idle-typing":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          ws?.send(
            JSON.stringify({
              type: "idle-typing",
              conversation_id: json.conversation_id,
              sender_id: json.sender_id,
            })
          );
        });
        break;
      case "blur":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          ws?.send(
            JSON.stringify({
              type: "blur",
              conversation_id: json.conversation_id,
              sender_id: json.sender_id,
            })
          );
        });
        break;
      case "edit_message":
        conversation.members.forEach((member) => {
          const ws = clients.get(member);
          setTimeout(() => {
            ws?.send(
              JSON.stringify({
                type: "edit_message",
                message: json.message,
                read: false,
                message_id: json.message_id,
                conversation_id: json.conversation_id,
                sender_id: json.sender_id,
              })
            );
          }, 1000);
        });
        break;
      case "delete_message":
        conversation?.members?.forEach((member) => {
          const ws = clients.get(member);
          setTimeout(() => {
            ws?.send(
              JSON.stringify({
                type: "delete_message",
                message: json.message,
                read: false,
                message_id: json.message_id,
                conversation_id: json.conversation_id,
                sender_id: json.sender_id,
              })
            );
          }, 1000);
        });
        break;
      default:
        break;
    }
  });
});
