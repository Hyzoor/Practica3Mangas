import express from "express";
import { connectMongoDB } from "./mongo";
import routerComics from "./routes/routesComics";
import routerAuth from "./routes/routesAuth";
import dotenv from "dotenv";

dotenv.config();

connectMongoDB();

const app = express();
app.use(express.json());
app.use("/comics", routerComics);
app.use("/auth", routerAuth);
app.listen(process.env.PORT, () => console.log("Connected to API"));