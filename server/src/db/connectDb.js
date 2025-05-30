import mongoose from "mongoose";


const connectDB = async () => {
  try {
    const connectionOptions = {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      family: 4
    };

    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`,
      connectionOptions
    );
    console.log(`\n MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log("MONGODB connection FAILED ", error);
    process.exit(1);
  }
}

export default connectDB;