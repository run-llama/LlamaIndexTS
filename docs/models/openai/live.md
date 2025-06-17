# OpenAI Live LLM

The OpenAI Live LLM integration in LlamaIndex provides real-time chat capabilities with support for audio streaming and tool calling.

## Basic Usage

```typescript
import { openai } from "@llamaindex/openai";
import { tool } from "llamaindex";

// Get the ephimereal key from the llm
const llm = openai({
  apiKey: "your-api-key",
  model: "gpt-4o-realtime-preview-2025-06-03",
});

const e;

// Create a live session
const session = await llm.live.connect({
  systemInstruction: "You are a helpful assistant.",
});

// Send a message
session.sendMessage({
  content: "Hello!",
  role: "user",
});
```

## Tool Integration

Tools are handled server-side, making it simple to pass them to the live session:

```typescript
// Define your tools
const weatherTool = tool({
  name: "weather",
  description: "Get the weather for a location",
  parameters: z.object({
    location: z.string().describe("The location to get weather for"),
  }),
  execute: async ({ location }) => {
    return `The weather in ${location} is sunny`;
  },
});

// Create session with tools
const session = await llm.live.connect({
  systemInstruction: "You are a helpful assistant.",
  tools: [weatherTool],
});
```

## Audio Support

For audio capabilities:

```typescript
// Get microphone access
const userStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
});

// Create session with audio
const session = await llm.live.connect({
  audioConfig: {
    stream: userStream,
    onTrack: (remoteStream) => {
      // Handle incoming audio
      audioElement.srcObject = remoteStream;
    },
  },
});
```

## Event Handling

Listen to events from the session:

```typescript
for await (const event of session.streamEvents()) {
  if (liveEvents.open.include(event)) {
    // Connection established
    console.log("Connected!");
  } else if (liveEvents.text.include(event)) {
    // Received text response
    console.log("Assistant:", event.text);
  }
}
```

## Capabilities

The OpenAI Live LLM supports:

- Real-time text chat
- Audio streaming (if configured)
- Tool calling (server-side execution)
- Ephemeral key generation for secure sessions

## API Reference

### LiveLLM Methods

#### `connect(config?: LiveConnectConfig)`

Creates a new live session.

```typescript
interface LiveConnectConfig {
  systemInstruction?: string;
  tools?: BaseTool[];
  audioConfig?: AudioConfig;
  responseModality?: ModalityType[];
}
```

#### `getEphemeralKey()`

Gets a temporary key for the session.

### LiveLLMSession Methods

#### `sendMessage(message: ChatMessage)`

Sends a message to the assistant.

```typescript
interface ChatMessage {
  content: string | MessageContentDetail[];
  role: "user" | "assistant";
}
```

#### `disconnect()`

Closes the session and cleans up resources.

## Error Handling

```typescript
try {
  const session = await llm.live.connect();
} catch (error) {
  if (error instanceof Error) {
    console.error("Connection failed:", error.message);
  }
}
```

## Best Practices

1. **Tool Definition**

   - Keep tool implementations server-side
   - Use clear descriptions for tools
   - Handle tool errors gracefully

2. **Session Management**

   - Always disconnect sessions when done
   - Clean up audio resources
   - Handle reconnection scenarios

3. **Security**
   - Use ephemeral keys for sessions
   - Validate tool inputs
   - Secure API key handling
