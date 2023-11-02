from typing import List

from app.utils.index import get_index
from fastapi import APIRouter, Depends, HTTPException, status
from llama_index import VectorStoreIndex
from llama_index.llms.base import MessageRole, ChatMessage
from pydantic import BaseModel

chat_router = r = APIRouter()


class _Message(BaseModel):
    role: MessageRole
    content: str


class _ChatData(BaseModel):
    messages: List[_Message]


@r.post("")
async def chat(
    data: _ChatData,
    index: VectorStoreIndex = Depends(get_index),
) -> _Message:
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

    # query chat engine
    chat_engine = index.as_chat_engine()
    response = chat_engine.chat(lastMessage.content, messages)
    return _Message(role=MessageRole.ASSISTANT, content=response.response)
