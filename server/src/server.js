import { app } from "./app.js";
import { config } from "dotenv";
import connectDB from "./db/connectDb.js";
import { createServer } from "http";

config({
  path: "./.env"
});

const server = createServer(app);

connectDB()
  .then(() => {
    console.log("Connected to the database successfully");
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port http://localhost:${process.env.PORT || 3000}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
