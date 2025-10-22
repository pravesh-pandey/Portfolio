import { createServer } from "node:http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${env.port}`);
});

export default server;
