import { CondenseQuestionChatEngine, ChatMessage } from '../../packages/core/src/ChatEngine';
import { BaseQueryEngine } from '../../packages/core/src/QueryEngine';
import { ServiceContext } from '../../packages/core/src/ServiceContext';
import { defaultCondenseQuestionPrompt } from '../../packages/core/src/Prompt';

// Mock implementation of BaseQueryEngine
class MockQueryEngine implements BaseQueryEngine {
  async query(query: string) {
    return { response: 'Mock response', getFormattedSources: () => [] };
  }
}

const queryEngine = new MockQueryEngine();
import { serviceContextFromDefaults } from '../../packages/core/src/ServiceContext';
const serviceContext = serviceContextFromDefaults();

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
