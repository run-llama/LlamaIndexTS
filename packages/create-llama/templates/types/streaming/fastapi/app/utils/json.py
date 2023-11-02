import json
from typing import TypeVar
from fastapi import HTTPException, Request

from pydantic import BaseModel, ValidationError


T = TypeVar("T", bound=BaseModel)


def json_to_model(cls: T):
    async def get_json(request: Request) -> T:
        body = await request.body()
        try:
            data_dict = json.loads(body.decode("utf-8"))
            return cls(**data_dict)
        except (json.JSONDecodeError, ValidationError) as e:
            raise HTTPException(
                status_code=400, detail=f"Could not decode JSON: {str(e)}"
            )

    return get_json
