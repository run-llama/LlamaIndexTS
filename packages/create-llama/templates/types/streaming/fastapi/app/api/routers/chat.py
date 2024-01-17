from typing import List

from fastapi.responses import StreamingResponse
from llama_index.chat_engine.types import BaseChatEngine

from app.engine.index import get_chat_engine
from fastapi import APIRouter, Depends, HTTPException, Request, status
from llama_index.llms.base import ChatMessage
from llama_index.llms.types import MessageRole
from pydantic import BaseModel

import json

chat_router = r = APIRouter()


class _Message(BaseModel):
    role: MessageRole
    content: str


class _ChatData(BaseModel):
    messages: List[_Message]
    data: dict = None


# Parse text to support vercel/ai
def text_parser(token: str):
    text_prefix = "0:"
    return f'{text_prefix}"{token}"\n'


# Parse data to support vercel/ai
def data_parser(data: dict):
    data_prefix = "2:"
    data_str = json.dumps(data)
    return f"{data_prefix}[{data_str}]\n"


def get_last_message_content(text_message: str, image_url: str):
    if not image_url:
        return text_message
    return [
        {
            "type": "text",
            "text": text_message,
        },
        {
            "type": "image_url",
            "image_url": {
                "url": image_url,
            },
        },
    ]


@r.post("")
async def chat(
    request: Request,
    data: _ChatData,
    chat_engine: BaseChatEngine = Depends(get_chat_engine),
):
    # check preconditions and get last message
    if len(data.messages) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No messages provided",
        )
    lastMessage = data.messages.pop()
    if lastMessage.role != MessageRole.USER:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Last message must be from user",
        )
    # convert messages coming from the request to type ChatMessage
    messages = [
        ChatMessage(
            role=m.role,
            content=m.content,
        )
        for m in data.messages
    ]

    image_url = data.data.get("imageUrl") if data.data else None
    last_message_content = get_last_message_content(lastMessage.content, image_url)

    # query chat engine
    response = await chat_engine.astream_chat(last_message_content, messages)

    # stream response
    async def event_generator():
        # if image_url is provided, send it first or just send empty object
        if image_url:
            yield data_parser({"type": "image_url", "image_url": {"url": image_url}})
        else:
            yield data_parser({})

        async for token in response.async_response_gen():
            # If client closes connection, stop sending events
            if await request.is_disconnected():
                break
            yield text_parser(token)

        # send empty object {} to indicate end of stream
        yield data_parser({})

    headers = {
        "X-Experimental-Stream-Data": "true",
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Expose-Headers": "X-Experimental-Stream-Data",
    }
    return StreamingResponse(event_generator(), headers=headers)
