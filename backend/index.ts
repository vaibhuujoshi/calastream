import express from "express";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
    console.log("server is running on http://localhost:3000");
})