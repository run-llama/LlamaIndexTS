import { CallbackManager, Event, EventType} from "../packages/core/src/callbacks/CallbackManager";
import {MessageType, OpenAI, ChatMessage} from "../packages/core/src/llm/LLM";
import * as tiktoken from "tiktoken-node";

async function main() {
    const smth = "user" as MessageType;

    const query: string = "Where is Istanbul?";

    const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });
    const message: ChatMessage = {content: query, role: "user"};
    
    var accumulated_result: string = "";
    var total_tokens: number = 0;

    //Callback stuff, like logging token usage.
    //GPT 3.5 Turbo uses CL100K_Base encodings, check your LLM to see which tokenizer it uses.
    const encoding = tiktoken.getEncoding("cl100k_base");

    const callback: CallbackManager = new CallbackManager();
    callback.onLLMStream = (callback_response) => {
        //Token text
        const text = (callback_response.token.choices[0].delta.content) ? callback_response.token.choices[0].delta.content : "";
        //Increment total number of tokens
        total_tokens += encoding.encode(text).length;
    }

    llm.callbackManager = callback;

    //Create a dummy event to trigger our Stream Callback
    const dummy_event: Event = {id: "something", type: "intermediate" as EventType};

    //Stream Complete
    const stream = llm.stream_complete(query, dummy_event);

    for await (const part of stream){
        //This only gives you the string part of a stream
        console.log(part);
        accumulated_result += part;
        }
    
    const correct_total_tokens: number = encoding.encode(accumulated_result).length;

    //Check if our stream token counter works
    console.log(`Output token total using tokenizer on accumulated output: ${correct_total_tokens}`);
    console.log(`Output token total using tokenizer on stream output: ${total_tokens}`);
    };

main();