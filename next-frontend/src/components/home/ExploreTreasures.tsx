import prisma from "@/lib/prisma";
import ExploreTreasuresClient from "./ExploreTreasuresClient";

export default async function ExploreTreasures() {
  let tabs: any[] = [];
  
  try {
    tabs = await prisma.homeTab.findMany({
      where: { status: "Active" },
      orderBy: { order: "asc" },
      include: {
        category: {
          include: {
            products: {
              where: { status: 1 }, // Fetching active products for the category
              take: 8
            }
          }
        }
      }
    });
  } catch (error) {
    console.error("Failed to fetch explore tabs", error);
  }

  if (!tabs || tabs.length === 0) return null;

  // Transform data to be safely passed to Client Component
  const formattedTabs = tabs.map((tab: any) => ({
    id: tab.id,
    title: tab.title,
    categoryId: tab.categoryId,
    products: tab.category?.products || []
  }));

  return <ExploreTreasuresClient tabs={formattedTabs} />;
}
