import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";

import { NotFoundError, errorHandler } from "./middlewares/error-handler.js";
import morgan from "morgan";
import connectDb from "./config/db.js";
import router from "./routes/routes.js";
const app = express();

const corsOptions = {
  origin: 'http://localhost:3000',
};
dotenv.config();

const hostname = process.env.SERVERURL;
const port = process.env.SERVERPORT;

//info on req : GET /route ms -25
app.use(morgan("dev"));

app.use(cors(corsOptions));
connectDb();

app.use("/public/images", express.static("media"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

app.use(NotFoundError);
app.use(errorHandler);

app.listen(port, hostname, () => {
  console.log(`Server running on ${hostname}:${port}`);
});
