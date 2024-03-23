import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'

const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    }
}>();


userRouter.post('/signup', async (c) => {
    try {
        const body = await c.req.json()
        const prisma = new PrismaClient({
            datasourceUrl: c.env.DATABASE_URL
        }).$extends(withAccelerate())

        const user = await prisma.user.create({
            data: {
                email: body.email,
                password: body.password
            }
        })
        const token = await sign({ id: user.id }, c.env.JWT_SECRET)
        c.status(201)
        return c.json({
            jwt: token
        })
    }
    catch (err) {
        console.log("error occured")
    }
})


export default userRouter