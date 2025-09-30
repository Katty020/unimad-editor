import type { NextApiRequest, NextApiResponse } from "next";
import { SavedContent } from "../../types";
const contentStore = new Map<string, SavedContent>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const savedContent: SavedContent = req.body;

    // Validate the data structure
    if (!savedContent.id || !savedContent.content) {
      return res.status(400).json({ error: "Invalid content structure" });
    }

    // Store the content
    contentStore.set(savedContent.id, savedContent);

    // Optional: Persist to database
    // await prisma.content.upsert({
    //   where: { id: savedContent.id },
    //   update: savedContent,
    //   create: savedContent,
    // });

    res.status(200).json({
      success: true,
      message: "Content saved successfully",
      savedAt: savedContent.savedAt,
    });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({ error: "Failed to save content" });
  }
}