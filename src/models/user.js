import { text } from "express";
import { Schema,model,Types } from "mongoose"

const userSchema = Schema({
  name: { type: String, required: true },
  descriptor:{type:Array}, 
  location: { x: Number, y: Number, width: Number, height: Number }
})
const UserModel = model("User", userSchema);
export default UserModel;