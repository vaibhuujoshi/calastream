import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/authRoutes";
import uploadRouter from "./routes/uploadRoutes";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', userRouter);
app.use('/api/v1', uploadRouter);

app.listen(3000, () => {
    console.log("server is running on http://localhost:3000");
})