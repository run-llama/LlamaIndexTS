import { CondenseQuestionChatEngine, BaseQueryEngine, ChatMessage, ServiceContext, defaultCondenseQuestionPrompt } from 'packages/core/src/ChatEngine.ts';

// Mock implementation of BaseQueryEngine
class MockQueryEngine extends BaseQueryEngine {
  async query(query: string) {
    return { response: 'Mock response' };
  }
}

const queryEngine = new MockQueryEngine();
const serviceContext = new ServiceContext();

const condenseQuestionChatEngine = new CondenseQuestionChatEngine({
  queryEngine: queryEngine,
  chatHistory: [],
  serviceContext: serviceContext,
  condenseMessagePrompt: defaultCondenseQuestionPrompt,
});

// Using the chat method
const message = 'Sample message';
const response = condenseQuestionChatEngine.chat(message);

console.log(response);

// Using the reset method
condenseQuestionChatEngine.reset();
