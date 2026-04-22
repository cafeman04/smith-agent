import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export async function POST() {
  const id = crypto.randomUUID().replace(/-/g, "");
  const email = `guest_${id}@smithmotors.guest`;
  const rawPassword = crypto.randomBytes(24).toString("hex");
  const hashed = await bcrypt.hash(rawPassword, 10);

  await prisma.user.create({
    data: { email, role: "GUEST", password: hashed },
  });

  return NextResponse.json({ email, password: rawPassword });
}
