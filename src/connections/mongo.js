
import mongoose from "mongoose";
export default function connectDB() {  
  try {
    mongoose.connect(process.env.MONGO_URL);
  } catch (err) {   
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log(`Database connected: ${process.env.MONGO_URL}`);
  }); 
  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
}