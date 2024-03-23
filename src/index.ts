import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign } from 'hono/jwt'
import userRouter from './routes/user';
import { cors } from 'hono/cors'
import blogRouter from './routes/blog';

// goal is to try express equivalent thing with Hono and use prisma accelerate for pool connection and finally deploy backend to cloudflare
// zod for validation, encrypting password, error handling are skipped 




// get typescript typing for your environment variable
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string,
    JWT_SECRET: string
  }
}>();


// adding middleware
app.use('/api/*', cors())


// routing 

// home route
app.get("/", (c) => {
  return c.text("Hono says 'Hi'")
})

// user route
app.route("/api/v1/user", userRouter)
// blog route
app.route("/api/v1/blog", blogRouter)


app.post('/api/v1/signup', async (c) => {
  const body = await c.req.json()
  const prisma = new PrismaClient().$extends(withAccelerate())

  const user = await prisma.user.create({
    data: {
      email: body.email,
      password: body.password
    }
  })
  const token = sign({ id: user.id }, c.env.JWT_SECRET)

  return c.json({
    jwt: token
  })
})



export default app;
