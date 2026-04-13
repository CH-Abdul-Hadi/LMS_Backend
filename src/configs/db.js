import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URL.replace(/\/$/, "")}/${process.env.DB_NAME}`,
    );
    console.log(` \n MongoDB conection: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.error("mongoDB connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
