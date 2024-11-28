import express from "express"
import userRoutes from "./routes/users.js"
import cors from "cors"

const app = express()

const port = 8800

app.use(express.json())
app.use(cors({
  origin: '*',
  credentials: true
}))

app.use("/", userRoutes)

app.listen(port)

console.log(`Runnin in this port: ${port}`)

