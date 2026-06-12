import prisma from "@/lib/prisma";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  let siteConfig = null;
  try {
    siteConfig = await prisma.siteConfig.findUnique({
      where: { key: "header" },
    });
  } catch (error) {
    console.error("Failed to load header config", error);
  }

  return <HeaderClient siteConfig={siteConfig} />;
}
