import asyncio

class StreamingAgentChatResponse:
    def __init__(self):
        self._aqueue: asyncio.Queue = asyncio.Queue()

    async def put(self, item):
        await self._aqueue.put(item)

    async def get(self):
        return await self._aqueue.get()

