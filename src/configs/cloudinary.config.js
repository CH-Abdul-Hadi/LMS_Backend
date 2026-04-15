import { v2 as cloudinary } from cloudinary

/*
config the cloudinary
make uploadstream using options so it can auto detect video vs image
upload stream sent data directly to cloudinary 
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadToCloudinary = (buffer, options = {}) => {
  return new promise((resolve, reject) => {
    const uploadOptions = {
      folder: "lms_data",
      resource_type: auto,
      ...options
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error,result)=>{
        if (error){
          console.error("Cloudinary Upload Error: ", error);
          return reject(error)
        }
        resolve(result)
      }
    )

    uploadStream.end(buffer)
  })
}

export {cloudinary, uploadToCloudinary}