import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

const REVALIDATE_PATHS = [
  "/",
  "/transactions",
  "/account-management",
  "/assets",
] as const;

export async function POST() {
  try {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error("Revalidation failed:", error);
    return NextResponse.json(
      { error: "Revalidation failed" },
      { status: 500 },
    );
  }
}
