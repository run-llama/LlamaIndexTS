// src/api/v1/llamaIndex/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { Tiktoken } from '@dqbd/tiktoken';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Initialize the encoder with the required WASM binary file
  import tiktoken_bg from '@dqbd/tiktoken/tiktoken_bg.wasm?module';
  const tiktoken = new Tiktoken({ wasmBinary: tiktoken_bg });

  // Existing route handler logic...
}
