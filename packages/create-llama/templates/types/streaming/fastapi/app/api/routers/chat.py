from typing import List

from fastapi.responses import StreamingResponse
from llama_index.chat_engine.types import BaseChatEngine

from app.engine.index import get_chat_engine
from fastapi import APIRouter, Depends, HTTPException, Request, status
from llama_index.llms.base import ChatMessage
from llama_index.llms.types import MessageRole, StreamingAgentChatResponse
from pydantic import BaseModel

import json

chat_router = r = APIRouter()


class _Message(BaseModel):
    role: MessageRole
    content: str


# Encapsulates the data sent by the Vercel/AI client
class _ChatData(BaseModel):
    messages: List[_Message]
    data: dict = None

    def get_user_message(self) -> _Message:
        # check preconditions and get last message
        if len(self.messages) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No messages provided",
            )
        lastMessage = self.messages[-1]
        if lastMessage.role != MessageRole.USER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Last message must be from user",
            )

    def get_messages(self):
        # Return all messages except the last one
        return self.messages[:-1]

    def get_image_url(self):
        return self.data.get("imageUrl") if self.data else None

    def get_user_message_content(self):
        user_message = self.get_user_message()
        image_url = self.get_image_url()
        if not image_url:
            return user_message.content
        return [
            {
                "type": "text",
                "text": user_message.content,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url,
                },
            },
        ]


# converts the stream returned by LlamaIndex for usage with Vercel/AI
def llama_index_to_vercel(
    request: Request, response: StreamingAgentChatResponse, image_url
):
    def convert_text(token: str):
        text_prefix = "0:"
        return f'{text_prefix}"{token}"\n'

    def convert_data(data: dict):
        data_prefix = "2:"
        data_str = json.dumps(data)
        return f"{data_prefix}[{data_str}]\n"

    async def event_generator():
        # The format is to send one image (i.e. data object) for each text message
        # This means that we need to send empty data objects if there is no image for a message
        if image_url:
            # if the user sent an image, send it back so it belongs to the user's message
            yield convert_data({"type": "image_url", "image_url": {"url": image_url}})
        else:
            yield convert_data({})

        async for token in response.async_response_gen():
            # If client closes connection, stop sending events
            if await request.is_disconnected():
                break
            yield convert_text(token)

        # send an empty image response for the assistant's message
        yield convert_data({})

    return event_generator


@r.post("")
async def chat(
    request: Request,
    data: _ChatData,
    chat_engine: BaseChatEngine = Depends(get_chat_engine),
):
    user_message_content = data.get_user_message_content()
    # convert messages coming from the request to LlamaIndex's type ChatMessage
    messages = [
        ChatMessage(
            role=m.role,
            content=m.content,
        )
        for m in data.get_messages()
    ]

    # query chat engine
    response = await chat_engine.astream_chat(user_message_content, messages)

    # convert llamaindex stream to vercel ai
    event_generator = llama_index_to_vercel(request, response, data.get_image_url())

    # send the headers required by vercel ai to support data objects (experimental)
    headers = {
        "X-Experimental-Stream-Data": "true",
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Expose-Headers": "X-Experimental-Stream-Data",
    }
    return StreamingResponse(event_generator(), headers=headers)
