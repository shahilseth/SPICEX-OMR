import express, { Request, Response } from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "SpiceX OMS",
    status: "running",
    phase: "Phase 4 – Production & Inventory",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).send("OK");
});

export default app;