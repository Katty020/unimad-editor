import React, { useState } from 'react';
import { ProjectCardData } from '../types';
import { ProjectModal } from './ProjectModal';
import { Image, FolderOpen, Calendar } from 'lucide-react';

interface ProjectCardProps {
  data: ProjectCardData;
  onUpdate: (data: ProjectCardData) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ data, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUpdate = (updatedData: ProjectCardData) => {
    const newData = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(newData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <div
        className="group relative bg-white border border-gray-200 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1"
        onClick={handleOpenModal}
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            {data.previewImage ? (
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={data.previewImage}
                  alt={data.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <Image className="w-8 h-8 text-blue-600" />
              </div>
            )}
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {data.title}
              </h3>
              <FolderOpen className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>Updated {formatDate(data.updatedAt)}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{data.content.length} blocks</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 rounded-xl transition-all duration-300"></div>
      </div>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        data={data}
        onUpdate={handleUpdate}
      />
    </>
  );
};