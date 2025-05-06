import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp },
    process.env.CLOUDINARY_API_SECRET
  );

  return new Response(
    JSON.stringify({
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
