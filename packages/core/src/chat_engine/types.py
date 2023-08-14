import asyncio

class StreamingAgentChatResponse:
    def __init__(self):
        self._aqueue: asyncio.Queue = asyncio.Queue()

