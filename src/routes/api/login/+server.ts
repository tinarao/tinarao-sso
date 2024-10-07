import { z } from "zod"
import { json } from "@sveltejs/kit"
import { JWT_SECRET } from "$env/static/private"
import type { RequestHandler } from "./$types"

import jwt from "jsonwebtoken"
import prisma from "$lib/server/db"
import bcrypt from 'bcryptjs';

const loginDto = z.object({
    email: z.string({ message: "Email is empty" }).email("Incorrect email"),
    password: z.string({ message: "Password field is empty" }).min(8, "Password is too short").max(32, "Password is too long"),
})

export const POST: RequestHandler = async ({ request, cookies }) => {
    let reqData: any;
    try {
        reqData = await request.json();
    } catch (error) {
        return new Response(JSON.stringify({ "message": "Bad request" }), { status: 400 })
    }

    if (!reqData) {
        return new Response(JSON.stringify({ "message": "Bad request" }), { status: 400 })
    }

    const { success, error, data: dto } = loginDto.safeParse(reqData);
    if (!success) {
        return json({ "message": "Bad request", "error": error.errors[0].message }, { status: 400 })
    }

    const user = await prisma.user.findFirst({
        where: { email: dto.email },
        select: { id: true, password: true, username: true }
    })

    if (!user) {
        return json({ "message": "User does not exists" }, { status: 404 })
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password)
    if (!isPasswordValid) {
        return json({ "message": "Incorrect credentials" }, { status: 401 })
    }

    const payload = { username: user.username, sub: user.id }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "4d" })

    const data = jwt.decode(token)

    const date = new Date();
    const cookieExpires = date.setDate(date.getDate() + 4)

    cookies.set("t_sso_token", token, { sameSite: false, path: '/', expires: new Date(cookieExpires) })
    return json({ token, data }, { status: 200 })
}