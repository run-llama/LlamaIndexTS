import { CallbackManager } from "../packages/core/src/callbacks/CallbackManager";
import {MessageType, OpenAI, ChatMessage} from "../packages/core/src/llm/LLM";

async function main() {
    const smth = "user" as MessageType;

    const query: string = "Where is Istanbul?"
    const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });
    const message: ChatMessage = {content: query, role: "user"};
    


    const cb: CallbackManager = new CallbackManager();
    cb.onLLMStream = () => {"something"};
    // console.log(cb.onLLMStream);

    //Stream Chat
    // const stream = llm.stream_chat([message]);
    // console.log(stream);
    // for await (const part of stream){
    //     console.log(part);
    // }

    //Stream Complete
    const stream = llm.stream_complete(query);
    console.log(stream);
    for await (const part of stream){
        console.log(part);
    }
};

main();