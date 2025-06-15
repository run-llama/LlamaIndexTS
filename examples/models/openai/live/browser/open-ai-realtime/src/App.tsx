import { useState } from "react";
import "./App.css";
import { AudioChat } from "./audio-chat";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <AudioChat />
    </>
  );
}

export default App;
