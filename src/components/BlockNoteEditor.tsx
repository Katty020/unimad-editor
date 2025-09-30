import React, { useMemo, useEffect, useState } from "react";
import {
  BlockNoteEditor as BNEditor,
  PartialBlock,
  PropSchema,
} from "@blocknote/core";
import {
  useCreateBlockNote,
  getDefaultReactSlashMenuItems,
  ReactSlashMenuItem,
  createReactBlockSpec,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { RiImageLine } from "react-icons/ri";
import { ProjectCard } from "./ProjectCard";
import { EditorContent, SavedContent, ProjectCardData } from "../types";
import { Save, Download, Upload, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

interface BlockNoteEditorProps {
  onContentChange?: (content: EditorContent) => void;
}

export const BlockNoteEditor: React.FC<BlockNoteEditorProps> = ({
  onContentChange,
}) => {
  const [savedContent, setSavedContent] = useState<SavedContent | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { ProjectCardBlock, insertProjectCard } = useMemo(() => {
    if (typeof window === "undefined") {
      return { ProjectCardBlock: null, insertProjectCard: null };
    }

    const ProjectCardBlock = createReactBlockSpec(
      {
        type: "projectCard" as const,
        propSchema: {
          id: { default: "" },
          title: { default: "New Project" },
          editorContent: { default: "[]" },
          previewImage: { default: "" },
          createdAt: { default: "" },
          updatedAt: { default: "" },
        } satisfies PropSchema,
        content: "none",
      },
      {
        render: (props) => {
          const projectCardData: ProjectCardData = {
            id: props.block.props.id || crypto.randomUUID(),
            title: props.block.props.title || "New Project",
            content: props.block.props.editorContent
              ? JSON.parse(props.block.props.editorContent)
              : [],
            previewImage: props.block.props.previewImage || "",
            createdAt: props.block.props.createdAt || new Date().toISOString(),
            updatedAt: props.block.props.updatedAt || new Date().toISOString(),
          };

          return (
            <ProjectCard
              data={projectCardData}
              onUpdate={(updatedData) => {
                props.editor.updateBlock(props.block, {
                  props: {
                    id: updatedData.id,
                    title: updatedData.title,
                    editorContent: JSON.stringify(updatedData.content),
                    previewImage: updatedData.previewImage,
                    createdAt: updatedData.createdAt,
                    updatedAt: updatedData.updatedAt,
                  },
                });
              }}
            />
          );
        },
      }
    );

    const insertProjectCard: ReactSlashMenuItem<
      BNEditor<{ projectCard: typeof ProjectCardBlock }>
    > = {
      name: "Project Card",
      execute: (editor) => {
        const projectId = crypto.randomUUID();
        const now = new Date().toISOString();

        const projectCardBlock: PartialBlock<
          BNEditor<{ projectCard: typeof ProjectCardBlock }>
        > = {
          type: "projectCard",
          props: {
            id: projectId,
            title: "New Project",
            editorContent: "[]",
            previewImage: "",
            createdAt: now,
            updatedAt: now,
          },
        };

        editor.insertBlocks(
          [projectCardBlock],
          editor.getTextCursorPosition().block,
          "after"
        );
      },
      aliases: ["project", "card", "portfolio", "nested"],
      group: "Advanced",
      icon: <RiImageLine />,
      subtext: "Add a project card with nested editor",
    };

    return { ProjectCardBlock, insertProjectCard };
  }, []);

  const editor = useCreateBlockNote({
    blockSpecs: ProjectCardBlock ? { projectCard: ProjectCardBlock } : {},
  });

  useEffect(() => {
    if (!editor) return;
    editor.slashMenuItems = insertProjectCard
      ? [...getDefaultReactSlashMenuItems(editor), insertProjectCard]
      : getDefaultReactSlashMenuItems(editor);
  }, [editor, insertProjectCard]);

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem("blocknote-portfolio-content");
        if (stored) {
          const parsedContent: SavedContent = JSON.parse(stored);
          setSavedContent(parsedContent);

          if (parsedContent.content?.blocks) {
            await editor.replaceBlocks(
              editor.document,
              parsedContent.content.blocks
            );
            toast.success("Content restored from previous session");
          }
        }
      } catch (error) {
        console.error("Error loading content:", error);
        toast.error("Failed to restore previous content");
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, [editor]);

  // Handle editor changes
  useEffect(() => {
    if (isLoading) return;
    const handleChange = () => setHasChanges(true);
    editor.onEditorContentChange(handleChange);
  }, [editor, isLoading]);

  const saveContent = async () => {
    setIsSaving(true);
    try {
      const blocks = editor.document;

      const projectCards: Record<string, ProjectCardData> = {};
      blocks.forEach((block: any) => {
        if (block.type === "projectCard") {
          const projectData: ProjectCardData = {
            id: block.props.id,
            title: block.props.title,
            content: JSON.parse(block.props.editorContent || "[]"),
            previewImage: block.props.previewImage,
            createdAt: block.props.createdAt,
            updatedAt: block.props.updatedAt,
          };
          projectCards[block.props.id] = projectData;
        }
      });

      const content: EditorContent = {
        blocks,
        projectCards,
      };

      const savedData: SavedContent = {
        id: savedContent?.id || crypto.randomUUID(),
        content,
        savedAt: new Date().toISOString(),
      };

      // Save to localStorage
      localStorage.setItem(
        "blocknote-portfolio-content",
        JSON.stringify(savedData)
      );
      setSavedContent(savedData);

      // Send to backend API
      try {
        const response = await fetch("/api/save-content", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(savedData),
        });

        if (!response.ok) {
          console.warn("API save failed, but localStorage succeeded");
        }
      } catch (apiError) {
        console.warn("API not available, saved to localStorage only");
      }

      setHasChanges(false);
      toast.success("Content saved successfully!");

      if (onContentChange) {
        onContentChange(content);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  // Export content to JSON
  const exportContent = () => {
    try {
      const blocks = editor.document;
      const projectCards: Record<string, ProjectCardData> = {};

      blocks.forEach((block: any) => {
        if (block.type === "projectCard") {
          projectCards[block.props.id] = {
            id: block.props.id,
            title: block.props.title,
            content: JSON.parse(block.props.editorContent || "[]"),
            previewImage: block.props.previewImage,
            createdAt: block.props.createdAt,
            updatedAt: block.props.updatedAt,
          };
        }
      });

      const content = {
        blocks,
        projectCards,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(content, null, 2)], {
        type: "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `portfolio-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Content exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export content");
    }
  };

  // Import content from JSON
  const importContent = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.blocks) {
          await editor.replaceBlocks(editor.document, data.blocks);
          setHasChanges(true);
          toast.success("Content imported successfully!");
        } else {
          toast.error("Invalid file format");
        }
      } catch (error) {
        console.error("Import error:", error);
        toast.error("Failed to import content");
      }
    };
    input.click();
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!hasChanges) return;
    const interval = setInterval(() => {
      if (hasChanges && !isSaving) {
        saveContent();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [hasChanges, isSaving]);

  // Save on Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveContent();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your portfolio editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Unimad-Projectcard
              </h1>
              <p className="text-gray-600">
                Create and manage your project cards
              </p>
            </div>

            <div className="flex items-center gap-3">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}

              <button
                onClick={importContent}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>

              <button
                onClick={exportContent}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>

              <button
                onClick={saveContent}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-8">
            <BlockNoteView
              editor={editor}
              theme="light"
              className="min-h-[600px]"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="text-center text-sm text-gray-500">
          Use{" "}
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">
            /project card
          </kbd>{" "}
          to add a new project card,{" "}
          <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+S</kbd> to
          save
        </div>
      </div>
    </div>
  );
};