import { type Request, type Response, Router } from "express";
import { signinSchema, signupSchema } from "../validators/authValidators";
import { prisma } from "../db/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userRouter = Router();

const JWT_SECRET = `${process.env.JWT_SECRET}`;

userRouter.post('/signup', async (req: Request, res: Response) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; };

    const { username, password, gender, channelName } = parsed.data;

    const existing = await prisma.user.findFirst({ where: { username } });
    if (existing) { res.status(409).json({ error: "Username already taken" }); return; }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: { username, password: hashedPassword, gender, channelName }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    })

    res.status(201).json({ token, userId: user.id });
})

userRouter.post('/signin', async (req: Request, res: Response) => {
    const parsed = signinSchema.safeParse(req.body);
    if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; };

    const { username, password } = parsed.data;

    const user = await prisma.user.findFirst({ where: { username } });
    if (!user) { res.status(401).json({ error: "Username does not exist" }); return; }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) { res.status(401).json({ error: "Incorrect password" }); return; }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 1000
    })
    res.status(201).json({ token, userId: user.id });
})

export default userRouter;