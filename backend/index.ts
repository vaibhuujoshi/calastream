import express from "express";
import cookieParser from "cookie-parser";
import userRouter from "./routes/authRoutes";
import uploadRouter from "./routes/uploadRoutes";
import cors from "cors";
import subsRouter from "./routes/subscriptionRoutes";
const app = express();

app.use(cors({
  origin: "http://localhost:5173", // Allow requests only from this domain
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/v1', userRouter);
app.use('/api/v1', uploadRouter);
app.use('/api/v1', subsRouter);

app.listen(3000, () => {
    console.log("server is running on http://localhost:3000");
})