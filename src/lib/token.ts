import { z } from "zod";

export const tokenPayloadValidator = z.object({
    username: z.string(),
    sub: z.number().positive(),
    iat: z.date(),
    exp: z.date()
})