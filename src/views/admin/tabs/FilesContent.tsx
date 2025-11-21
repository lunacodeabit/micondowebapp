import React, { useState, useMemo } from 'react';
import type { CondoFile } from '../../../types';
import { fileFolders } from '../../../data/mockData';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { FileForm } from '../forms/FileForm';
import { useCondo } from '../../../context/CondoContext';

export const FilesContent = () => {
    const { selectedCondo } = useCondo();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeFolder, setActiveFolder] = useState(fileFolders[0]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const filteredFiles = useMemo(() => {
        if (!selectedCondo) return [];
        return selectedCondo.files
            .filter(file => file.folder === activeFolder)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [selectedCondo, activeFolder]);
    
    if (!selectedCondo) return <div>Cargando...</div>;

    return (
        <div>
            <div className="bg-neutral-900 rounded-lg shadow-md p-6">
                <div className="flex items-center text-xl font-bold text-white mb-4">
                    <Icon name="chevron-right" className="w-6 h-6 mr-2" />
                    Listado de Archivos (Documentos)
                </div>

                <div className="p-4 rounded-lg border-2 border-dashed border-neutral-700 bg-neutral-900/50 mb-6">
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                        <span className="text-sm font-medium text-neutral-400 flex-shrink-0">Carpetas:</span>
                        {fileFolders.map(folder => (
                            <button
                                key={folder}
                                onClick={() => setActiveFolder(folder)}
                                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                                    activeFolder === folder
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-neutral-700 hover:bg-neutral-600 text-neutral-300'
                                }`}
                            >
                                <Icon name="align-justify" size={14} />
                                {folder}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr>
                                <th className="py-2 px-4 text-left text-sm font-medium text-neutral-500 w-24">#Cod</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-neutral-500 w-40">Tipo</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-neutral-500">Título del archivo</th>
                                <th className="py-2 px-4 text-left text-sm font-medium text-neutral-500">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b-2 border-dotted border-neutral-700">
                                <td colSpan={4}></td>
                            </tr>
                            {filteredFiles.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-neutral-500 py-10">
                                        0 registros mostrados
                                    </td>
                                </tr>
                            ) : (
                                filteredFiles.map(file => (
                                    <tr key={file.id} className="border-b border-dotted border-neutral-800 hover:bg-neutral-800/50">
                                        <td className="py-2 px-4 text-neutral-300">{file.code}</td>
                                        <td className="py-2 px-4 text-neutral-300">{file.fileType}</td>
                                        <td className="py-2 px-4 text-white font-medium">{file.title}</td>
                                        <td className="py-2 px-4">
                                            <a
                                                href={file.fileUrl}
                                                download={file.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-400 font-semibold text-sm"
                                            >
                                                Ver/Descargar
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg"
                    >
                        Agregar archivo
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Agregar Nuevo Archivo">
                <FileForm 
                    onSuccess={handleCloseModal}
                    onCancel={handleCloseModal}
                    defaultFolder={activeFolder}
                />
            </Modal>
        </div>
    );
};