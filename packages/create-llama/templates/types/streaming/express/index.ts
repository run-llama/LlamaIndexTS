import cors from "cors";
import "dotenv/config";
import express, { Express, Request, Response } from "express";
import chatRouter from "./src/routes/chat.route";

const app: Express = express();
const port = 8000;

const env = process.env["NODE_ENV"];
const isDevelopment = !env || env === "development";
if (isDevelopment) {
  console.warn("Running in development mode - allowing CORS for all origins");
  app.use(cors());
}

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("LlamaIndex Express Server");
});

app.use("/api/chat", chatRouter);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
