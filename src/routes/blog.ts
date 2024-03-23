import { Hono } from 'hono';
import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt'

const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string,
        JWT_SECRET: string
    },
    Variables: {
        userId: string;
    }
}>();

// custom middleware

async function authenticate(c: Context, next: Next) {
    console.log(c.req.header("authorization"))
    const authHeader = c.req.header("authorization") || "";
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            // set a variable to access across middlewares
            c.set("userId", user.id);

            await next();
        } else {
            c.status(403);
            return c.json({
                message: "You are not logged in"
            })
        }
    } catch (e) {
        c.status(403);
        return c.json({
            message: "You are not logged in"
        })
    }
}


// adding middleware

blogRouter.use("/*", authenticate)


blogRouter.get("/", (c) => {
    return c.json({
        message: "blog route, userId " + c.get("userId")
    })
})



export default blogRouter