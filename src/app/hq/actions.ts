"use server";

import { cookies } from "next/headers";

// 1. Verifies the Initial HQ PIN (The Airlock)
export async function unlockHQ(pin: string) {
  const MASTER_PIN = process.env.HQ_PIN || "000000";

  if (pin === MASTER_PIN) {
    const cookieStore = await cookies();
    cookieStore.set("bamba_hq_clearance", "GRANTED", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 15, // 15 mins
      path: "/hq",
    });
    return { success: true };
  }
  return { success: false };
}

// 2. Verifies the Two-Step Authentication (Ring 4)
export async function verifyHQ2FA(code: string) {
  // In production, this would check against a generated TOTP code in your database.
  // For now, use 999999 to test the flow.
  const MASTER_2FA = "999999";

  if (code === MASTER_2FA) {
    const cookieStore = await cookies();
    cookieStore.set("bamba_hq_2fa", "VERIFIED", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 12, // 12 hours for the 2FA session
      path: "/hq",
    });
    return { success: true };
  }
  return { success: false };
}
