import express,{json} from "express";
import path from 'path';
import mongoose from "mongoose";
import 'dotenv/config'
import { corsMiddleware } from './middlewares/cors.js'
import connectDB from './connections/mongo.js'
import UserModel from "./models/user.js"

connectDB()

const app = express()
const PORT = process.env.PORT ?? 3000

app.use(json())
app.use(corsMiddleware())
app.disable('x-powered-by')
app.use('/public', express.static(process.cwd() +"/public"));

app.get("/",(req,res)=>{ 
  res.sendFile(process.cwd() + '/views/index.html')
})
app.post("/create",async(req,res)=>{
  let data = req.body
  let newuser = await UserModel.create({
    name:data.name,
    descriptor: data.descriptor
  })
  .then((data)=>{
    res.json(data)
  })
  .catch((error)=>{
    console.log(error)
    res.send("err")
  })
})
app.get("/search",async(req,res) =>{ 
  UserModel.find()
  .then((data)=> res.json(data))
  .catch((error)=> res.json(error)) 
})
app.get("/search_vector",async(req,res)=>{
  if (!req.body.vector) return res.status(500).send("vector not body")
  let agg = [
      {
        "$vectorSearch": {
          "index": "vector_index",
          "path": "descriptor",
          "queryVector": req.body.vector,
          "numCandidates": 10,
          "limit": 10
        }
      },
      {
        "$project": {
          "name": 1,        
          "score": { "$meta": "vectorSearchScore" }
        }
      }
    ]
  let users = await UserModel.aggregate(agg)
  .then((data)=> res.json(data))
  .catch((error)=> res.json(error))
})
app.listen(PORT, () =>{
  console.log(`listening on port ${PORT}`)
})