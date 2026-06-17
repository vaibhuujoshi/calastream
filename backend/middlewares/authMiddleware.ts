import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = `${process.env.JWT_SECRET}`;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is missing!");
}

export interface AuthenticatedRequest extends Request {
    userId?: string;
}

export default function auth(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "Token Missing"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        req.userId = decoded.userId;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid Token"
        });
    }
}
