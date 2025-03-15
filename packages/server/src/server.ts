import express, { Express } from "express";

export interface LlamaIndexServerConfig {
  modules?: LlamaIndexServerModule[];
  storage?: StorageService;
}

/**
 * Goal:
 * - user can get the whole server instance to run (express server)
 * - user can get controllers and add to their current router
 * - provide adapter to route handlers in Nextjs able to use it also
 * - by default, we provide chat module, user can config addOn to use LlamaCloud, Sandbox, etc.
 * - by default, we use filesystem storage, user can config to use other storage
 */
export class LlamaIndexServer {
  app: Express;

  constructor() {
    this.app = express();
  }
}
