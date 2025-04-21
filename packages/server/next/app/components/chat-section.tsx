"use client";

import { ChatSection as ChatSectionUI } from "@llamaindex/chat-ui";
import "@llamaindex/chat-ui/styles/markdown.css";
import "@llamaindex/chat-ui/styles/pdf.css";
import { Message, useChat } from "ai/react";
import { Sparkles, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ChatCanvas } from "./ui/chat/chat-canvas";
import { ChatCanvasProvider } from "./ui/chat/chat-canvas-provider";
import CustomChatInput from "./ui/chat/chat-input";
import CustomChatMessages from "./ui/chat/chat-messages";
import { fetchComponentDefinitions } from "./ui/chat/custom/events/loader";
import { ComponentDef } from "./ui/chat/custom/events/types";
import { getConfig } from "./ui/lib/utils";

const initialMessages = [
  {
    role: "user",
    content: "Generate a simple calculator in nextjs",
    id: "yK5kkaHGzp2jlejE",
    createdAt: "2025-04-21T09:49:08.256Z",
    parts: [
      {
        type: "text",
        text: "Generate a simple calculator in nextjs",
      },
    ],
  },
  {
    id: "ff0YOPecreMrsQu9",
    createdAt: "2025-04-21T09:49:08.285Z",
    role: "assistant",
    content:
      "Here is a simple calculator application built with Next.js that performs basic arithmetic operations like addition, subtraction, multiplication, and division. The application uses TypeScript and Tailwind CSS for styling.\n\n### Calculator App\n\n#### Description\nA simple calculator app for basic arithmetic operations.\n\n#### Code\n\nYou can create a new Next.js project and replace the content of `pages/index.tsx` with the following code:\n\n```typescript\nimport { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;\n```\n\n### Instructions to Run the App\n\n1. **Create a new Next.js project**:\n   ```bash\n   npx create-next-app@latest my-calculator --typescript\n   cd my-calculator\n   ```\n\n2. **Install Tailwind CSS**:\n   Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/guides/nextjs) to set it up in your Next.js project.\n\n3. **Replace the content of `pages/index.tsx`** with the provided code.\n\n4. **Run the application**:\n   ```bash\n   npm run dev\n   ```\n\n5. **Open your browser** and navigate to `http://localhost:3000` to see your calculator in action!\n\nThis simple calculator allows users to perform basic arithmetic operations and displays the results accordingly.",
    parts: [
      {
        type: "text",
        text: "Here is a simple calculator application built with Next.js that performs basic arithmetic operations like addition, subtraction, multiplication, and division. The application uses TypeScript and Tailwind CSS for styling.\n\n### Calculator App\n\n#### Description\nA simple calculator app for basic arithmetic operations.\n\n#### Code\n\nYou can create a new Next.js project and replace the content of `pages/index.tsx` with the following code:\n\n```typescript\nimport { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;\n```\n\n### Instructions to Run the App\n\n1. **Create a new Next.js project**:\n   ```bash\n   npx create-next-app@latest my-calculator --typescript\n   cd my-calculator\n   ```\n\n2. **Install Tailwind CSS**:\n   Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/guides/nextjs) to set it up in your Next.js project.\n\n3. **Replace the content of `pages/index.tsx`** with the provided code.\n\n4. **Run the application**:\n   ```bash\n   npm run dev\n   ```\n\n5. **Open your browser** and navigate to `http://localhost:3000` to see your calculator in action!\n\nThis simple calculator allows users to perform basic arithmetic operations and displays the results accordingly.",
      },
    ],
    annotations: [
      {
        userInput: "Generate a simple calculator in nextjs",
        chatHistory: [],
      },
      {
        input: [
          {
            role: "user",
            content: "Generate a simple calculator in nextjs",
          },
        ],
        currentAgentName: "Agent",
      },
      {
        input: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Use the provided tools to answer questions.",
          },
          {
            role: "user",
            content: "Generate a simple calculator in nextjs",
          },
        ],
        currentAgentName: "Agent",
      },
      {
        agentName: "Agent",
        response: {
          role: "assistant",
          content: "",
          options: {
            toolCall: [
              {
                name: "artifact",
                input: {
                  requirement:
                    "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
                },
                id: "call_ux8RoUSQYUSFpeM7DtEefcyb",
              },
            ],
          },
        },
        toolCalls: [
          {
            data: {
              agentName: "Agent",
              toolName: "artifact",
              toolKwargs: {
                requirement:
                  "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
              },
              toolId: "call_ux8RoUSQYUSFpeM7DtEefcyb",
            },
            displayName: "AgentToolCall",
          },
        ],
      },
      {
        response: {
          role: "assistant",
          content: "",
          options: {
            toolCall: [
              {
                name: "artifact",
                input: {
                  requirement:
                    "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
                },
                id: "call_ux8RoUSQYUSFpeM7DtEefcyb",
              },
            ],
          },
        },
        toolCalls: [
          {
            data: {
              agentName: "Agent",
              toolName: "artifact",
              toolKwargs: {
                requirement:
                  "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
              },
              toolId: "call_ux8RoUSQYUSFpeM7DtEefcyb",
            },
            displayName: "AgentToolCall",
          },
        ],
        currentAgentName: "Agent",
      },
      {
        agentName: "Agent",
        toolCalls: [
          {
            data: {
              agentName: "Agent",
              toolName: "artifact",
              toolKwargs: {
                requirement:
                  "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
              },
              toolId: "call_ux8RoUSQYUSFpeM7DtEefcyb",
            },
            displayName: "AgentToolCall",
          },
        ],
      },
      {
        type: "agent",
        data: {
          agent: "Agent",
          text: "Using tool: 'artifact' with inputs: '{\"requirement\":\"A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.\"}'",
          type: "text",
        },
      },
      {
        agentName: "Agent",
        results: [
          {
            data: {
              toolName: "artifact",
              toolKwargs: {
                requirement:
                  "A simple calculator application built with Next.js that can perform basic arithmetic operations like addition, subtraction, multiplication, and division.",
              },
              toolId: "call_ux8RoUSQYUSFpeM7DtEefcyb",
              toolOutput: {
                id: "call_ux8RoUSQYUSFpeM7DtEefcyb",
                result:
                  "{\n  isError: false,\n  artifact: {\n    commentary: I will create a simple calculator application using Next.js. This application will allow users to perform basic arithmetic operations such as addition, subtraction, multiplication, and division. The calculator will have a user interface with buttons for digits and operations, and it will display the result of the calculations. I will use Tailwind CSS for styling the application to ensure a clean and responsive design. The application will be built using TypeScript to ensure type safety and better code maintainability.,\n    template: nextjs-developer,\n    title: Calculator App,\n    description: A simple calculator app for basic arithmetic operations.,\n    additional_dependencies: [],\n    has_additional_dependencies: false,\n    install_dependencies_command: ,\n    port: 3000,\n    file_path: pages/index.tsx,\n    code: import { useState } from 'react';\\n\\nconst Calculator = () => {\\n  const [input, setInput] = useState('');\\n  const [result, setResult] = useState('');\\n\\n  const handleButtonClick = (value: string) => {\\n    if (value === '=') {\\n      try {\\n        setResult(eval(input));\\n      } catch {\\n        setResult('Error');\\n      }\\n    } else if (value === 'C') {\\n      setInput('');\\n      setResult('');\\n    } else {\\n      setInput(input + value);\\n    }\\n  };\\n\\n  const buttons = [\\n    '7', '8', '9', '/',\\n    '4', '5', '6', '*',\\n    '1', '2', '3', '-',\\n    '0', '.', '=', '+',\\n    'C'\\n  ];\\n\\n  return (\\n    <div className=\\flex items-center justify-center min-h-screen bg-gray-100\\>\\n      <div className=\\bg-white p-6 rounded-lg shadow-lg\\>\\n        <div className=\\mb-4 text-right text-2xl font-mono\\>\\n          <div>{input || '0'}</div>\\n          <div className=\\text-gray-500\\>{result}</div>\\n        </div>\\n        <div className=\\grid grid-cols-4 gap-2\\>\\n          {buttons.map((button) => (\\n            <button\\n              key={button}\\n              className=\\bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\\\\n              onClick={() => handleButtonClick(button)}\\n            >\\n              {button}\\n            </button>\\n          ))}\\n        </div>\\n      </div>\\n    </div>\\n  );\\n};\\n\\nexport default Calculator;\n  }\n}",
                isError: false,
              },
              returnDirect: false,
              raw: {
                isError: false,
                artifact: {
                  commentary:
                    "I will create a simple calculator application using Next.js. This application will allow users to perform basic arithmetic operations such as addition, subtraction, multiplication, and division. The calculator will have a user interface with buttons for digits and operations, and it will display the result of the calculations. I will use Tailwind CSS for styling the application to ensure a clean and responsive design. The application will be built using TypeScript to ensure type safety and better code maintainability.",
                  template: "nextjs-developer",
                  title: "Calculator App",
                  description:
                    "A simple calculator app for basic arithmetic operations.",
                  additional_dependencies: [],
                  has_additional_dependencies: false,
                  install_dependencies_command: "",
                  port: 3000,
                  file_path: "pages/index.tsx",
                  code: "import { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;",
                },
              },
            },
            displayName: "AgentToolCallResult",
          },
        ],
      },
      {
        type: "artifact",
        data: {
          type: "code",
          version: 1,
          currentVersion: true,
          data: {
            file_name: "index.tsx",
            code: "import { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;",
            language: "tsx",
          },
        },
      },
      {
        input: [
          {
            role: "user",
            content: "Generate a simple calculator in nextjs",
          },
        ],
        currentAgentName: "Agent",
      },
      {
        input: [
          {
            role: "system",
            content:
              "You are a helpful assistant. Use the provided tools to answer questions.",
          },
          {
            role: "user",
            content: "Generate a simple calculator in nextjs",
          },
        ],
        currentAgentName: "Agent",
      },
      {
        agentName: "Agent",
        response: {
          role: "assistant",
          content:
            "Here is a simple calculator application built with Next.js that performs basic arithmetic operations like addition, subtraction, multiplication, and division. The application uses TypeScript and Tailwind CSS for styling.\n\n### Calculator App\n\n#### Description\nA simple calculator app for basic arithmetic operations.\n\n#### Code\n\nYou can create a new Next.js project and replace the content of `pages/index.tsx` with the following code:\n\n```typescript\nimport { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;\n```\n\n### Instructions to Run the App\n\n1. **Create a new Next.js project**:\n   ```bash\n   npx create-next-app@latest my-calculator --typescript\n   cd my-calculator\n   ```\n\n2. **Install Tailwind CSS**:\n   Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/guides/nextjs) to set it up in your Next.js project.\n\n3. **Replace the content of `pages/index.tsx`** with the provided code.\n\n4. **Run the application**:\n   ```bash\n   npm run dev\n   ```\n\n5. **Open your browser** and navigate to `http://localhost:3000` to see your calculator in action!\n\nThis simple calculator allows users to perform basic arithmetic operations and displays the results accordingly.",
        },
        toolCalls: [],
      },
      {
        response: {
          role: "assistant",
          content:
            "Here is a simple calculator application built with Next.js that performs basic arithmetic operations like addition, subtraction, multiplication, and division. The application uses TypeScript and Tailwind CSS for styling.\n\n### Calculator App\n\n#### Description\nA simple calculator app for basic arithmetic operations.\n\n#### Code\n\nYou can create a new Next.js project and replace the content of `pages/index.tsx` with the following code:\n\n```typescript\nimport { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;\n```\n\n### Instructions to Run the App\n\n1. **Create a new Next.js project**:\n   ```bash\n   npx create-next-app@latest my-calculator --typescript\n   cd my-calculator\n   ```\n\n2. **Install Tailwind CSS**:\n   Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/guides/nextjs) to set it up in your Next.js project.\n\n3. **Replace the content of `pages/index.tsx`** with the provided code.\n\n4. **Run the application**:\n   ```bash\n   npm run dev\n   ```\n\n5. **Open your browser** and navigate to `http://localhost:3000` to see your calculator in action!\n\nThis simple calculator allows users to perform basic arithmetic operations and displays the results accordingly.",
        },
        toolCalls: [],
        currentAgentName: "Agent",
      },
      {
        result:
          "Here is a simple calculator application built with Next.js that performs basic arithmetic operations like addition, subtraction, multiplication, and division. The application uses TypeScript and Tailwind CSS for styling.\n\n### Calculator App\n\n#### Description\nA simple calculator app for basic arithmetic operations.\n\n#### Code\n\nYou can create a new Next.js project and replace the content of `pages/index.tsx` with the following code:\n\n```typescript\nimport { useState } from 'react';\n\nconst Calculator = () => {\n  const [input, setInput] = useState('');\n  const [result, setResult] = useState('');\n\n  const handleButtonClick = (value: string) => {\n    if (value === '=') {\n      try {\n        setResult(eval(input));\n      } catch {\n        setResult('Error');\n      }\n    } else if (value === 'C') {\n      setInput('');\n      setResult('');\n    } else {\n      setInput(input + value);\n    }\n  };\n\n  const buttons = [\n    '7', '8', '9', '/',\n    '4', '5', '6', '*',\n    '1', '2', '3', '-',\n    '0', '.', '=', '+',\n    'C'\n  ];\n\n  return (\n    <div className=\"flex items-center justify-center min-h-screen bg-gray-100\">\n      <div className=\"bg-white p-6 rounded-lg shadow-lg\">\n        <div className=\"mb-4 text-right text-2xl font-mono\">\n          <div>{input || '0'}</div>\n          <div className=\"text-gray-500\">{result}</div>\n        </div>\n        <div className=\"grid grid-cols-4 gap-2\">\n          {buttons.map((button) => (\n            <button\n              key={button}\n              className=\"bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700\"\n              onClick={() => handleButtonClick(button)}\n            >\n              {button}\n            </button>\n          ))}\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default Calculator;\n```\n\n### Instructions to Run the App\n\n1. **Create a new Next.js project**:\n   ```bash\n   npx create-next-app@latest my-calculator --typescript\n   cd my-calculator\n   ```\n\n2. **Install Tailwind CSS**:\n   Follow the [official Tailwind CSS installation guide](https://tailwindcss.com/docs/guides/nextjs) to set it up in your Next.js project.\n\n3. **Replace the content of `pages/index.tsx`** with the provided code.\n\n4. **Run the application**:\n   ```bash\n   npm run dev\n   ```\n\n5. **Open your browser** and navigate to `http://localhost:3000` to see your calculator in action!\n\nThis simple calculator allows users to perform basic arithmetic operations and displays the results accordingly.",
      },
      {
        type: "suggested_questions",
        data: [
          "How can I add more advanced operations like square root or exponentiation to this calculator?",
          "Can you explain how to deploy this Next.js app to a platform like Vercel or Netlify?",
          "What are some best practices for handling errors in a calculator app like this?",
        ],
      },
    ],
    revisionId: "e0hRITL0rlrUsi9u",
  },
];

export default function ChatSection() {
  const [componentDefs, setComponentDefs] = useState<ComponentDef[]>([]);
  const [errors, setErrors] = useState<string[]>([]); // contain all errors when compiling with Babel and runtime

  const appendError = (error: string) => {
    setErrors((prev) => [...prev, error]);
  };

  const uniqueErrors = useMemo(() => {
    return Array.from(new Set(errors));
  }, [errors]);

  // fetch component definitions and use Babel to tranform JSX code to JS code
  // this is triggered only once when the page is initialised
  useEffect(() => {
    fetchComponentDefinitions().then(({ components, errors }) => {
      setComponentDefs(components);
      if (errors.length > 0) {
        setErrors((prev) => [...prev, ...errors]);
      }
    });
  }, []);

  const handler = useChat({
    initialMessages: initialMessages as unknown as Message[],
    api: getConfig("CHAT_API"),
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      let errorMessage: string;
      try {
        errorMessage = JSON.parse(error.message).detail;
      } catch (e) {
        errorMessage = error.message;
      }
      alert(errorMessage);
    },
    experimental_throttle: 100,
  });
  return (
    <>
      <div className="flex h-screen w-screen flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4" />
            <h1 className="font-semibold">{getConfig("APP_TITLE")}</h1>
          </div>
          <LlamaIndexLinks />
        </div>
        <ChatSectionUI
          handler={handler}
          className="flex min-h-0 flex-1 flex-row justify-center gap-4 px-4 py-0"
        >
          <ChatCanvasProvider>
            <div className="max-w-1/2 flex h-full min-w-0 flex-1 flex-col gap-4">
              <CustomChatMessages
                componentDefs={componentDefs}
                appendError={appendError}
              />
              <CustomChatInput />
            </div>
            <ChatCanvas />
          </ChatCanvasProvider>
        </ChatSectionUI>
      </div>
      <TailwindCDNInjection />
    </>
  );
}

function LlamaIndexLinks() {
  return (
    <div className="flex items-center justify-end gap-4">
      <div className="flex items-center gap-2">
        <a
          href="https://www.llamaindex.ai/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Built by LlamaIndex
        </a>
        <img
          className="h-[24px] w-[24px] rounded-sm"
          src="/llama.png"
          alt="Llama Logo"
        />
      </div>
      <a
        href="https://github.com/run-llama/LlamaIndexTS"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="sm">
          <Star className="mr-2 size-4" />
          Star on GitHub
        </Button>
      </a>
    </div>
  );
}

/**
 * The default border color has changed to `currentColor` in Tailwind CSS v4,
 * so adding these compatibility styles to make sure everything still
 * looks the same as it did with Tailwind CSS v3.
 */
const tailwindConfig = `
@import "tailwindcss";

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentColor);
  }
}
`;

function TailwindCDNInjection() {
  if (!getConfig("COMPONENTS_API")) return null;
  return (
    <>
      <script
        async
        src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"
      ></script>
      <style type="text/tailwindcss">{tailwindConfig}</style>
    </>
  );
}
