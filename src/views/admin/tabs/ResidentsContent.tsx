import React, { useState } from 'react';
import { useCondo } from '../../../context/CondoContext';
import { Icon } from '../../../components/ui/Icon';
import type { Unit } from '../../../types';
import { FormCommon } from '../../../components/forms/FormCommon';
import { useToast } from '../../../context/ToastContext';

export const ResidentsContent = () => {
    const { selectedCondo, updateUnitInCondo } = useCondo();
    const { addToast } = useToast();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [newUid, setNewUid] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedCondo) {
        return <div>No se ha seleccionado un condominio.</div>;
    }

    // --- AIRBAG: Lista segura de unidades ---
    const units = (selectedCondo.units as unknown as any[]) || [];

    const handleOpenModal = (unit: Unit) => {
        setSelectedUnit(unit);
        setNewUid(unit.authUid || '');
        setNewEmail(unit.email || '');
        setNewPassword('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUnit(null);
        setNewUid('');
        setNewEmail('');
        setNewPassword('');
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit || !newEmail) {
            addToast('Por favor, complete al menos el email.', 'error');
            return;
        }

        setIsLoading(true);

        try {
            const updates: Partial<Unit> = {
                email: newEmail,
                authUid: newUid || '',
            };

            await updateUnitInCondo(selectedCondo.id, selectedUnit.id, updates);
            
            addToast('Residente actualizado con éxito.', 'success');
            setTimeout(() => handleCloseModal(), 500); 
        } catch (error) {
            console.error("Error actualizando residente:", error);
            addToast('Error al actualizar el residente.', 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Gestionar Residentes</h1>
            
            <p className="text-neutral-400">
                Aquí puede gestionar las credenciales de los residentes. Para vincular una cuenta, 
                primero cree el usuario en la <span className="font-semibold text-yellow-500">Consola de Firebase (Authentication)</span> y luego 
                pegue el <span className="font-semibold text-yellow-500">User UID</span> aquí.
            </p>

            <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-neutral-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Propietario</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Email Vinculado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">Estado de Cuenta</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-800">
                            {units.sort((a: any, b: any) => a.apartmentNumber.localeCompare(b.apartmentNumber)).map((unit: any) => (
                                <tr key={unit.id} className="hover:bg-neutral-800/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{unit.apartmentNumber}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{unit.ownerName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{unit.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {unit.authUid ? (
                                            <span className="flex items-center gap-2 text-green-400">
                                                <Icon name="check-circle" size={16} />
                                                Vinculada
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-yellow-400">
                                                <Icon name="alert-triangle" size={16} />
                                                Pendiente
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                        <button 
                                            onClick={() => handleOpenModal(unit)}
                                            className="text-blue-500 hover:text-blue-400 transition-colors"
                                        >
                                            {unit.authUid ? 'Ver / Editar' : 'Vincular Cuenta'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para editar/vincular residente */}
            {isModalOpen && selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl w-full max-w-lg p-6 m-4">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-white">Vincular Residente: {selectedUnit.apartmentNumber}</h2>
                            <button onClick={handleCloseModal} className="text-neutral-400 hover:text-white">
                                <Icon name="x" size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="space-y-4">
                            <p className="text-sm text-neutral-400">
                                1. Cree el usuario en la Consola de Firebase.
                                <br />
                                2. Ingrese el email (para referencia) y el UID (para vincular).
                            </p>
                            
                            <FormCommon.Group label="Email del Residente" htmlFor="email" required>
                                <FormCommon.Input 
                                    id="email"
                                    type="email"
                                    placeholder="residente@email.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                            </FormCommon.Group>

                            <FormCommon.Group label="User UID de Firebase" htmlFor="uid">
                                <FormCommon.Input 
                                    id="uid"
                                    type="text"
                                    placeholder="Pegue el UID de Firebase Auth aquí"
                                    value={newUid}
                                    onChange={(e) => setNewUid(e.target.value)}
                                />
                                <FormCommon.HelpText>El UID es opcional pero recomendado para el login.</FormCommon.HelpText>
                            </FormCommon.Group>

                            <FormCommon.Group label="Asignar Contraseña (Ignorado por ahora)" htmlFor="password">
                                <FormCommon.Input 
                                    id="password"
                                    type="text"
                                    placeholder="Función no implementada (inseguro)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    disabled={true} 
                                />
                                <FormCommon.HelpText>La creación de contraseñas debe hacerse en un servidor (Cloud Function) por seguridad.</FormCommon.HelpText>
                            </FormCommon.Group>
                            
                            <div className="flex justify-end gap-4 pt-4">
                                <FormCommon.Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
                                    Cancelar
                                </FormCommon.Button>
                                <FormCommon.Button type="submit" variant="primary" isLoading={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar Vínculo'}
                                </FormCommon.Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};