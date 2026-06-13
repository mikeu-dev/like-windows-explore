import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { explorerController } from "./controllers/v1/explorer.controller";

const app = new Elysia()
  .use(
    cors({
      // Kebijakan CORS yang ketat, hanya memperbolehkan akses dari domain frontend development lokal yang valid
      origin: [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
      ],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"]
    })
  )
  .group("/api", (app) => app.use(explorerController))
  .listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3001,
    hostname: "127.0.0.1" // Keamanan: Wajib mendengarkan di localhost/127.0.0.1 selama pengujian
  });

console.log(
  `🚀 Elysia API Server is running at http://${app.server?.hostname}:${app.server?.port}`
);
