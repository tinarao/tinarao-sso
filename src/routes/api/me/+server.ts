import jwt from "jsonwebtoken"
import { json } from "@sveltejs/kit";
import { constants } from "$lib/consts";
import type { RequestHandler } from "./$types";
import { tokenPayloadValidator } from "$lib/token";
import { JWT_SECRET } from "$env/static/private";
import prisma from "$lib/server/db";

export const GET: RequestHandler = async ({ cookies }) => {
    const token = cookies.get(constants.TOKEN_NAME);
    if (!token) {
        return json({ "message": "Unauthorized" }, { status: 401 })
    }

    const { success, data: payload } = tokenPayloadValidator.safeParse(
        jwt.verify(token, JWT_SECRET)
    )
    if (!success || !payload) {
        return json({ "message": "Unauthorized" }, { status: 401 })
    }

    const userDoc = await prisma.user.findFirst({
        where: { id: payload.sub, username: payload.username }
    })
    if (!userDoc) {
        return json({ "message": "Unauthorized" }, { status: 401 })
    }

    const { password, ...user } = userDoc;

    return json({ "message": "ok", user }, { status: 200 })
}