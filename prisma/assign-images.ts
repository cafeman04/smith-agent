import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// All available vehicle images (relative to /public)
const ALL_IMAGES = [
  "/images/vehicles/crv.jpg",
  "/images/vehicles/crv2.jpg",
  "/images/vehicles/accord.jpg",
  "/images/vehicles/civic.jpg",
  "/images/vehicles/maverick.jpg",
  "/images/vehicles/model3.jpg",
  "/images/vehicles/altima.webp",
  "/images/vehicles/rouge.jpg",
  "/images/vehicles/frontier.jpg",
  "/images/vehicles/4runner.jpg",
  "/images/vehicles/elantra.webp",
  "/images/vehicles/tuscon.jpg",
  "/images/vehicles/equinox.jpg",
  "/images/vehicles/outback.webp",
];

// Natural make+model → image(s) mapping
const NATURAL_MAP: Record<string, string[]> = {
  "honda_cr-v":           ["/images/vehicles/crv.jpg", "/images/vehicles/crv2.jpg"],
  "honda_accord":         ["/images/vehicles/accord.jpg"],
  "honda_civic":          ["/images/vehicles/civic.jpg"],
  "ford_maverick":        ["/images/vehicles/maverick.jpg"],
  "tesla_model 3":        ["/images/vehicles/model3.jpg"],
  "nissan_altima":        ["/images/vehicles/altima.webp"],
  "nissan_rogue":         ["/images/vehicles/rouge.jpg"],
  "nissan_frontier":      ["/images/vehicles/frontier.jpg"],
  "toyota_4runner":       ["/images/vehicles/4runner.jpg"],
  "hyundai_elantra":      ["/images/vehicles/elantra.webp"],
  "hyundai_tucson":       ["/images/vehicles/tuscon.jpg"],
  "chevrolet_equinox":    ["/images/vehicles/equinox.jpg"],
  "subaru_outback":       ["/images/vehicles/outback.webp"],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  const vehicles = await prisma.vehicle.findMany();

  let updated = 0;
  for (const vehicle of vehicles) {
    const existing: string[] = JSON.parse(vehicle.imageUrls || "[]");
    if (existing.length > 0) continue; // already has images, skip

    const key = `${vehicle.make.toLowerCase()}_${vehicle.model.toLowerCase()}`;
    let images: string[];

    if (NATURAL_MAP[key]) {
      images = NATURAL_MAP[key];
    } else {
      // Pick 1 random image from the full pool
      images = [pickRandom(ALL_IMAGES)];
    }

    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { imageUrls: JSON.stringify(images) },
    });
    console.log(`  ${vehicle.year} ${vehicle.make} ${vehicle.model} → ${images.join(", ")}`);
    updated++;
  }

  console.log(`\nDone — updated ${updated} vehicles.`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
