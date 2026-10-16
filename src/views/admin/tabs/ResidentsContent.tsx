import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCondo } from '../../../context/CondoContext';
import { useAuth } from '../../../context/AuthContext';
import { Icon } from '../../../components/ui/Icon';
import type { Unit } from '../../../types';
import { FormCommon } from '../../../components/forms/FormCommon';
import { useToast } from '../../../context/ToastContext';

export const ResidentsContent = () => {
    const { selectedCondo, updateUnitInCondo } = useCondo();
    const { devLogin, isDevMode } = useAuth();
    const { addToast } = useToast();
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
    const [ownerName, setOwnerName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [isLinked, setIsLinked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    if (!selectedCondo) {
        return (
            <div className="p-8 text-center bg-white dark:bg-[#161b26] rounded-2xl border border-neutral-200/80 dark:border-neutral-800">
                <Icon name="building-2" className="w-12 h-12 mx-auto text-neutral-400 mb-3" />
                <h3 className="text-base font-bold text-neutral-900 dark:text-white">No hay condominio seleccionado</h3>
                <p className="text-xs text-neutral-500 mt-1">Seleccione una propiedad para gestionar sus residentes.</p>
            </div>
        );
    }

    const units = (selectedCondo.units as unknown as any[]) || [];

    const handleOpenModal = (unit: Unit) => {
        setSelectedUnit(unit);
        setOwnerName(unit.ownerName || '');
        setNewEmail(unit.email || unit.ownerEmail1 || '');
        setNewPhone(unit.ownerPhones || unit.ownerWhatsapp || '');
        setIsLinked(Boolean(unit.authUid || unit.email));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedUnit(null);
        setOwnerName('');
        setNewEmail('');
        setNewPhone('');
        setIsLinked(false);
        setIsLoading(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit) return;

        setIsLoading(true);

        try {
            const updates: Partial<Unit> = {
                ownerName: ownerName.trim(),
                email: newEmail.trim(),
                ownerEmail1: newEmail.trim(),
                ownerPhones: newPhone.trim(),
                authUid: isLinked ? (selectedUnit.authUid || `res-uid-${selectedUnit.id}`) : '',
            };

            await updateUnitInCondo(selectedCondo.id, selectedUnit.id, updates);

            addToast(`Datos de la unidad ${selectedUnit.apartmentNumber} guardados exitosamente.`, 'success');
            handleCloseModal();
        } catch (error) {
            console.error("Error actualizando residente:", error);
            addToast('Error al actualizar los datos del residente.', 'error');
            setIsLoading(false);
        }
    };

    const handlePreviewAsResident = (unit: Unit) => {
        if (isDevMode) {
            devLogin('resident', { condoId: selectedCondo.id, unitId: unit.id });
            addToast(`Accediendo al portal como ${unit.ownerName} (${unit.apartmentNumber})...`, 'info');
            navigate('/resident');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Directorio de Residentes y Accesos</h1>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Administre los datos de contacto, propietarios y credenciales de acceso al portal de residentes para <span className="font-bold text-neutral-800 dark:text-neutral-200">{selectedCondo.name}</span>.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 flex items-center gap-1.5">
                        <Icon name="users" size={14} />
                        {units.length} Unidades Registradas
                    </span>
                </div>
            </div>

            <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-max">
                        <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200/80 dark:border-neutral-800">
                            <tr>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Unidad</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Propietario / Inquilino</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Correo Electrónico</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Teléfono</th>
                                <th className="px-6 py-3.5 text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Portal Web</th>
                                <th className="px-6 py-3.5 text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
                            {units.sort((a: any, b: any) => String(a.apartmentNumber).localeCompare(String(b.apartmentNumber))).map((unit: any) => {
                                const hasAccess = Boolean(unit.authUid || unit.email);
                                return (
                                    <tr key={unit.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-neutral-900 dark:text-white">
                                            {unit.apartmentNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200 font-medium">
                                            {unit.ownerName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600 dark:text-neutral-400">
                                            {unit.email || unit.ownerEmail1 || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                            {unit.ownerPhones || unit.ownerWhatsapp || '—'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {hasAccess ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                                                    <Icon name="check-circle" size={13} />
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200/60 dark:border-neutral-700">
                                                    <Icon name="clock" size={13} />
                                                    Sin Asignar
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {isDevMode && (
                                                    <button
                                                        onClick={() => handlePreviewAsResident(unit)}
                                                        title="Entrar como este residente"
                                                        className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200/60 dark:border-emerald-800/60 transition-colors flex items-center gap-1"
                                                    >
                                                        <Icon name="log-in" size={12} />
                                                        <span>Ver Portal</span>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(unit)}
                                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                >
                                                    Editar Acceso
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para editar/vincular residente */}
            {isModalOpen && selectedUnit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#161b26] border border-neutral-200/80 dark:border-neutral-800 rounded-2xl shadow-xl w-full max-w-lg p-6">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                            <div>
                                <h2 className="text-lg font-black text-neutral-900 dark:text-white">
                                    Gestión de Acceso: Unidad {selectedUnit.apartmentNumber}
                                </h2>
                                <p className="text-xs text-neutral-500 mt-0.5">{selectedCondo.name}</p>
                            </div>
                            <button onClick={handleCloseModal} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-white">
                                <Icon name="x" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <FormCommon.Group label="Nombre del Propietario / Inquilino" htmlFor="ownerName" required>
                                <FormCommon.Input
                                    id="ownerName"
                                    type="text"
                                    placeholder="Nombre completo"
                                    value={ownerName}
                                    onChange={(e) => setOwnerName(e.target.value)}
                                    required
                                />
                            </FormCommon.Group>

                            <FormCommon.Group label="Correo Electrónico (Login del Portal)" htmlFor="email" required>
                                <FormCommon.Input
                                    id="email"
                                    type="email"
                                    placeholder="correo@ejemplo.com"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    required
                                />
                                <FormCommon.HelpText>Este correo será utilizado por el residente para ingresar a su estado de cuenta y notificar pagos.</FormCommon.HelpText>
                            </FormCommon.Group>

                            <FormCommon.Group label="Teléfono / WhatsApp" htmlFor="phone">
                                <FormCommon.Input
                                    id="phone"
                                    type="tel"
                                    placeholder="809-555-0000"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                />
                            </FormCommon.Group>

                            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-neutral-900 dark:text-white">Estado de Acceso al Portal</p>
                                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Permitir a este residente ver estados de cuenta y reportar pagos</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsLinked(!isLinked)}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isLinked ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                >
                                    <span
                                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${isLinked ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <FormCommon.Button type="button" variant="secondary" onClick={handleCloseModal} disabled={isLoading}>
                                    Cancelar
                                </FormCommon.Button>
                                <FormCommon.Button type="submit" variant="primary" isLoading={isLoading}>
                                    {isLoading ? 'Guardando...' : 'Guardar Datos'}
                                </FormCommon.Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};