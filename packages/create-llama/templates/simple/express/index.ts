import express, { Express, Request, Response } from "express";
import llmRouter from "./src/routes/llm.route";

const app: Express = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("LlamaIndex Express Server");
});

app.use("/api/llm", llmRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
