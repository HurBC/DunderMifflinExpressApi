import express, { Express } from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/users.routes";
import clientRoutes from "./routes/client.routes";

dotenv.config();

const app: Express = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

app.use("/api", userRoutes);
app.use("/api", clientRoutes);

export default app;
