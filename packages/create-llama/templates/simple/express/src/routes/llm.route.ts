import express from "express";
import { chat } from "../controllers/llm.controller";

const llmRouter = express.Router();

llmRouter.route("/").post(chat);

export default llmRouter;
