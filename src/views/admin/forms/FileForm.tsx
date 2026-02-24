import React, { useState, ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import type { CondoFile } from '../../../types';
import { fileFolders } from '../../../data/mockData';
// 1. IMPORTACIÓN CORREGIDA
import { FormCommon } from '../../../components/forms/FormCommon';
import { Icon } from '../../../components/ui/Icon';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';
import { getLocalDateString } from '../../../utils/date';

type FileFormData = Omit<CondoFile, 'id' | 'code' | 'uploadDate' | 'fileUrl'>;

type FileFormProps = {
    onSuccess: () => void;
    onCancel: () => void;
    defaultFolder: string;
};

export const FileForm = ({ onSuccess, onCancel, defaultFolder }: FileFormProps) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FileFormData>({
        defaultValues: {
            folder: defaultFolder,
        }
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setValue('title', file.name.split('.').slice(0, -1).join('.'));
            setValue('fileName', file.name);
            setValue('fileType', file.type || 'application/octet-stream');
        }
    };

    const handleFormSubmit = async (data: FileFormData) => {
        if (!selectedCondo) return;
        if (!selectedFile) {
            addToast('Debe seleccionar un archivo para subir.', 'error');
            return;
        }
        setIsLoading(true);

        try {
            // Simulate API call delay
            await new Promise(res => setTimeout(res, 500));

            // Create a local blob URL for the file instead of uploading to a remote server
            const fileUrl = URL.createObjectURL(selectedFile);

            const newFile: CondoFile = {
                ...data,
                id: Date.now().toString(),
                code: String(Date.now()).slice(-6),
                uploadDate: getLocalDateString(),
                fileUrl: fileUrl,
            };

            const updatedFiles = [...selectedCondo.files, newFile];
            updateCondo({ ...selectedCondo, files: updatedFiles });

            addToast('Archivo guardado con éxito', 'success');
            onSuccess();

        } catch (error) {
            console.error("Error creating blob URL for file: ", error);
            addToast('Error al guardar el archivo', 'error');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        // 2. SINTAXIS CORREGIDA
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Hidden inputs to store file data in the form state */}
            <input type="hidden" {...register('fileName')} />
            <input type="hidden" {...register('fileType')} />

            <FormCommon.Group label="Archivo" htmlFor="file-upload">
                <div className="flex items-center gap-4">
                    <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-lg">
                        <Icon name="upload" size={16} />
                        <span>Seleccionar Archivo</span>
                    </label>
                    <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} />
                    {selectedFile && <span className="text-neutral-300">{selectedFile.name}</span>}
                </div>
                {!selectedFile && (
                    <p className="text-red-500 text-sm mt-1">Debe seleccionar un archivo.</p>
                )}
            </FormCommon.Group>

            <FormCommon.Group label="Título del archivo" htmlFor="title" error={errors.title?.message}>
                <FormCommon.Input
                    id="title"
                    {...register('title', { required: 'El título es requerido' })}
                />
            </FormCommon.Group>

            <FormCommon.Group label="Carpeta" htmlFor="folder" error={errors.folder?.message}>
                <FormCommon.Select id="folder" {...register('folder', { required: 'Debe seleccionar una carpeta' })}>
                    {fileFolders.map(folder => (
                        <option key={folder} value={folder}>{folder}</option>
                    ))}
                </FormCommon.Select>
            </FormCommon.Group>

            <div className="flex justify-end gap-4 pt-4">
                <FormCommon.Button type="button" variant="secondary" onClick={onCancel}>Cancelar</FormCommon.Button>
                <FormCommon.Button type="submit" isLoading={isLoading}>Guardar Archivo</FormCommon.Button>
            </div>
        </form>
    );
};