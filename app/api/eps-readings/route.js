import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import SensorReading from "@/models/Eps";

export const dynamic = "force-dynamic"; // Disable caching for real-time data
export const revalidate = 0;

export async function GET(request) {
  try {
    console.log("Connecting to MongoDB...");
    await connectDB();
    console.log("Connected successfully!");

    // Get query parameters for optional filtering
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 1;

    const epsReadings = await SensorReading.find({})
      .sort({ _id: -1 })
      .limit(limit)
      .lean();

    console.log(`Found ${epsReadings.length} readings`);

    return NextResponse.json(
      {
        success: true,
        count: epsReadings.length,
        data: epsReadings,
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching EPS readings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch EPS readings",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
