import logging
import os
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from llama_index import (
    StorageContext,
    load_index_from_storage,
    SimpleDirectoryReader,
    VectorStoreIndex,
)
from llama_index.llms.base import MessageRole
from pydantic import BaseModel
from sse_starlette.sse import EventSourceResponse

STORAGE_DIR = "./storage"  # directory to cache the generated index
DATA_DIR = "./data"  # directory containing the documents to index

chat_router = r = APIRouter()


class Message(BaseModel):
    role: MessageRole
    content: str


class _ChatData(BaseModel):
    messages: List[Message]


def get_index():
    logger = logging.getLogger("uvicorn")
    # check if storage already exists
    if not os.path.exists(STORAGE_DIR):
        logger.info("Creating new index")
        # load the documents and create the index
        documents = SimpleDirectoryReader(DATA_DIR).load_data()
        index = VectorStoreIndex.from_documents(documents)
        # store it for later
        index.storage_context.persist(STORAGE_DIR)
        logger.info(f"Finished creating new index. Stored in {STORAGE_DIR}")
    else:
        # load the existing index
        logger.info(f"Loading index from {STORAGE_DIR}...")
        storage_context = StorageContext.from_defaults(persist_dir=STORAGE_DIR)
        index = load_index_from_storage(storage_context)
        logger.info(f"Finished loading index from {STORAGE_DIR}")
    return index


@r.post("/")
async def chat(
    request: Request, data: _ChatData, index: VectorStoreIndex = Depends(get_index)
) -> Message:
    # check preconditions
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

    # query chat engine
    chat_engine = index.as_chat_engine()
    response = chat_engine.stream_chat(lastMessage.content, data.messages)

    # stream response
    async def event_generator():
        for token in response.response_gen:
            # If client closes connection, stop sending events
            if await request.is_disconnected():
                break
            yield token

    return EventSourceResponse(event_generator())
