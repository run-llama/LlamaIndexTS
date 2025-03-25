// Override the window.LLAMAINDEX object to customize frontend

window.LLAMAINDEX = {
  BACKEND: "http://localhost:3000",
  CHAT_API: "/api/chat",
  UPLOAD_API: "/api/chat/upload",
  LLAMA_CLOUD_API: "/api/chat/config/llamacloud",
  STARTER_QUESTIONS: []
};
