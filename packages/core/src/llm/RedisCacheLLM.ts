import { LLM, ChatResponse, CompletionResponse, ChatMessage} from './LLM';



export class RedisCacheLLM implements LLM {

  llm: LLM;
  to_cache: boolean;

  constructor(llm: LLM, to_cache: boolean){
    this.llm = llm;
  }

  async chat(messages: ChatMessage[]): Promise<ChatResponse> {

    //Get response
    const item = await this.llm.chat(messages);

    if(this.to_cache === true){
      //Cache response
    }

    //Return LLM response
    return item;
  }


  async complete(prompt: string): Promise<CompletionResponse> {
    const item = await this.llm.complete(prompt);


    //Check the flag
    if(this.to_cache === true){

    
    //Try cache lookup. If we don't have it, query and store.


    //Return value.
    }


    return item;
  }
}