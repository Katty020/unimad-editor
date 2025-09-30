import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { ProjectCardData } from '../types';
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import toast from 'react-hot-toast';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ProjectCardData;
  onUpdate: (data: ProjectCardData) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  data,
  onUpdate,
}) => {
  const [title, setTitle] = useState(data.title);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editor = useCreateBlockNote({
    initialContent: data.content.length > 0 ? data.content : [
      {
        type: "paragraph",
        content: "Start writing your project details...",
      },
    ],
  });

  const findFirstImage = (blocks: any[]): string => {
    for (const block of blocks) {
      if (block.type === 'image' && block.props?.url) {
        return block.props.url;
      }
      if (block.content && Array.isArray(block.content)) {
        const nestedImage = findFirstImage(block.content);
        if (nestedImage) return nestedImage;
      }
      if (block.children && Array.isArray(block.children)) {
        const nestedImage = findFirstImage(block.children);
        if (nestedImage) return nestedImage;
      }
    }
    return '';
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setIsSaving(true);
    
    try {
      const blocks = editor.document;
      let previewImage = data.previewImage;
      
      const firstImage = findFirstImage(blocks);
      if (firstImage) {
        previewImage = firstImage;
      }

      const updatedData: ProjectCardData = {
        ...data,
        title: title.trim() || 'Untitled Project',
        content: blocks,
        previewImage,
        updatedAt: new Date().toISOString(),
      };

      onUpdate(updatedData);
      setHasChanges(false);
      toast.success('Project saved successfully!');
      
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      toast.error('Failed to save project');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      );
      if (!confirmClose) return;
    }
    onClose();
  };

  useEffect(() => {
    if (!editor) return;

    const handleChange = () => {
      setHasChanges(true);
    };

    editor.onEditorContentChange(handleChange);
  }, [editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, hasChanges]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
         
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex-1 mr-4">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasChanges(true);
                }}
                className="text-2xl font-bold text-gray-900 bg-transparent border-none outline-none focus:ring-0 w-full"
                placeholder="Project Title"
              />
            </div>
            
            <div className="flex items-center gap-2">
              {hasChanges && (
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>Unsaved changes</span>
                </div>
              )}
              
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              
              <button
                onClick={handleClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <div className="h-full p-6">
              <div className="h-full border border-gray-200 rounded-xl overflow-hidden">
                <BlockNoteView
                  editor={editor}
                  className="h-full"
                  theme="light"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-6 border-t border-gray-200 text-sm text-gray-500">
            <div>
              Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">Esc</kbd> to close, <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">⌘+S</kbd> to save
            </div>
            <div>
              Last updated: {new Date(data.updatedAt).toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};