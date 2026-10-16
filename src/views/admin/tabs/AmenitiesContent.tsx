import React, { useState } from 'react';
import type { Amenity, Reservation } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { AmenityForm } from '../forms/AmenityForm';
import { ReservationForm } from '../forms/ReservationForm';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDate } from '../../../utils/date';
import { useCondo } from '../../../context/CondoContext';
import { useToast } from '../../../context/ToastContext';

export const AmenitiesContent = () => {
    const { selectedCondo, updateCondo } = useCondo();
    const { addToast } = useToast();
    const [isAmenityModalOpen, setIsAmenityModalOpen] = useState(false);
    const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
    const [viewingReservations, setViewingReservations] = useState<Amenity | null>(null);
    const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
    const [amenityForNewReservation, setAmenityForNewReservation] = useState<Amenity | null>(null);

    const handleOpenAmenityModal = (amenity: Amenity | null = null) => {
        setEditingAmenity(amenity);
        setIsAmenityModalOpen(true);
    };

    const handleCloseAmenityModal = () => {
        setEditingAmenity(null);
        setIsAmenityModalOpen(false);
    };

    const handleUpdateReservationStatus = (reservationId: string, status: Reservation['status']) => {
        if (!selectedCondo) return;
        const updatedReservations = selectedCondo.reservations.map(r =>
            r.id === reservationId ? { ...r, status } : r
        );
        updateCondo({ ...selectedCondo, reservations: updatedReservations });
    };

    const getReservationsForAmenity = (amenityId: string) => {
        if (!selectedCondo) return [];
        return selectedCondo.reservations
            .filter(r => r.amenityId === amenityId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    };

    const handleOpenReservationForm = (amenity: Amenity) => {
        setAmenityForNewReservation(amenity);
        setIsReservationFormOpen(true);
    };

    const handleCloseReservationForm = () => {
        setAmenityForNewReservation(null);
        setIsReservationFormOpen(false);
    };

    const handleReservationSuccess = () => {
        addToast('Reserva creada con éxito por el administrador.', 'success');
        handleCloseReservationForm();
    };


    if (!selectedCondo) return <div>Cargando...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Gestión de Áreas Comunes</h2>
                <button onClick={() => handleOpenAmenityModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-xs">
                    <Icon name="plus" size={18} />
                    <span>Añadir Área</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCondo.amenities.map(amenity => (
                    <div key={amenity.id} className="bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs p-6 flex flex-col justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">{amenity.name}</h3>
                            <p className="text-neutral-500 dark:text-neutral-400 text-xs mb-4 leading-relaxed">{amenity.description}</p>
                            <div className="text-xs space-y-2 mb-4 text-neutral-600 dark:text-neutral-300">
                                <p><Icon name="users" size={15} className="inline mr-2 text-neutral-400" /> Capacidad: <span className="font-semibold text-neutral-900 dark:text-white">{amenity.capacity} personas</span></p>
                                <p><Icon name="dollar-sign" size={15} className="inline mr-2 text-neutral-400" /> Costo: <span className="font-semibold text-neutral-900 dark:text-white">RD$ {amenity.fee.toLocaleString()}</span></p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <button onClick={() => setViewingReservations(amenity)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-xs shadow-xs">
                                Ver Reservas
                            </button>
                            <button onClick={() => handleOpenAmenityModal(amenity)} className="flex-1 text-center bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-white font-semibold py-2 px-4 rounded-lg text-xs transition-colors border border-neutral-200/80 dark:border-neutral-700">
                                Editar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isAmenityModalOpen} onClose={handleCloseAmenityModal} title={editingAmenity ? 'Editar Área Común' : 'Nueva Área Común'}>
                <AmenityForm onSuccess={handleCloseAmenityModal} onCancel={handleCloseAmenityModal} defaultValues={editingAmenity || {}} />
            </Modal>

            <Modal isOpen={!!viewingReservations} onClose={() => setViewingReservations(null)} title={`Reservas para ${viewingReservations?.name}`}>
                <div className="flex justify-end mb-4">
                    <button onClick={() => viewingReservations && handleOpenReservationForm(viewingReservations)} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-lg text-xs shadow-xs">
                        <Icon name="plus" size={16} />
                        <span>Nueva Reserva</span>
                    </button>
                </div>
                <div className="space-y-3">
                    {viewingReservations && getReservationsForAmenity(viewingReservations.id).length > 0 ? (
                        getReservationsForAmenity(viewingReservations.id).map(res => {
                            const unit = selectedCondo.units.find(u => u.id === res.unitId);
                            return (
                                <div key={res.id} className="bg-neutral-50 dark:bg-neutral-800/60 p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-700/60">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-sm text-neutral-900 dark:text-white">Unidad {unit?.apartmentNumber} ({unit?.ownerName})</p>
                                            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">Fecha: {formatDate(res.date)}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Horario: {res.startTime} a {res.endTime}</p>
                                        </div>
                                        <StatusBadge status={res.status} />
                                    </div>
                                    {res.status === 'Pendiente' && (
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => handleUpdateReservationStatus(res.id, 'Aprobada')} className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 px-3 rounded-md shadow-xs">Aprobar</button>
                                            <button onClick={() => handleUpdateReservationStatus(res.id, 'Rechazada')} className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold py-1 px-3 rounded-md shadow-xs">Rechazar</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-neutral-400 dark:text-neutral-500 text-center py-4 text-xs">No hay reservas para esta área.</p>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isReservationFormOpen} onClose={handleCloseReservationForm} title={`Nueva Reserva para ${amenityForNewReservation?.name}`}>
                {amenityForNewReservation && (
                    <ReservationForm
                        onSuccess={handleReservationSuccess}
                        onCancel={handleCloseReservationForm}
                        units={selectedCondo.units.filter(u => u.status === 'Activo')}
                        amenityId={amenityForNewReservation.id}
                    />
                )}
            </Modal>
        </div>
    );
};
