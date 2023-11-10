import "dotenv/config";
import express, { Express, Request, Response } from "express";
import chatRouter from "./src/routes/chat.route";

const app: Express = express();
const port = 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("LlamaIndex Express Server");
});

app.use("/api/chat", chatRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
