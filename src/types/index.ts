export interface ProjectCardData {
  id: string;
  title: string;
  content: any[];
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EditorContent {
  blocks: any[];
  projectCards: Record<string, ProjectCardData>;
}

export interface SavedContent {
  id: string;
  content: EditorContent;
  savedAt: string;
}