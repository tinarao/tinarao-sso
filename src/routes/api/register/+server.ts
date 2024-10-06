import { z } from "zod"
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types"

import bcrypt from "bcryptjs"
import type { User } from "@prisma/client";
import prisma from "$lib/server/db";

const registerDto = z.object({
    username: z.string({ message: "Username field is empty" }).min(2, "Username is too short").max(32, "Username is too long"),
    password: z.string({ message: "Password field is empty" }).min(8, "Password is too short").max(32, "Password is too long"),
    email: z.string({ message: "Email field is empty" }).email("Incorrect email provided"),
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

    const { success, error, data: dto } = registerDto.safeParse(reqData);
    if (!success) {
        return new Response(JSON.stringify({ "message": "Bad request", "error": error.errors[0].message }), { status: 400 })
    }
    // cookies.set("fsdgfdsfgfd", "fdsfs", { sameSite: false, path: '/' })
    const dup = await prisma.user.findFirst({
        where: { username: dto.username }
    })
    if (dup) {
        return json({ "message": "User is already exists" }, { status: 400 })
    }

    const salt = await bcrypt.genSalt()
    const hash = await bcrypt.hash(dto.password, salt)

    const created = await prisma.user.create({
        data: {
            username: dto.username,
            password: hash,
            email: dto.email,
        }
    })

    return json({ id: created.id }, { status: 200 })
}