import { NextResponse } from "next/server";
import vehiclesData from "../../../data/vehicles.json";

export async function GET() {
  return NextResponse.json(vehiclesData);
}
