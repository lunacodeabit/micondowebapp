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
    
    const handleUpdateReservationStatus = (reservationId: number, status: Reservation['status']) => {
        if (!selectedCondo) return;
        const updatedReservations = selectedCondo.reservations.map(r => 
            r.id === reservationId ? { ...r, status } : r
        );
        updateCondo({ ...selectedCondo, reservations: updatedReservations });
    };

    const getReservationsForAmenity = (amenityId: number) => {
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
                <h2 className="text-2xl font-bold text-white">Gestión de Áreas Comunes</h2>
                <button onClick={() => handleOpenAmenityModal()} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Añadir Área</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedCondo.amenities.map(amenity => (
                    <div key={amenity.id} className="bg-neutral-900 rounded-lg shadow-md p-6 flex flex-col">
                        <div className="flex-1">
                             <h3 className="text-xl font-bold text-white mb-2">{amenity.name}</h3>
                             <p className="text-neutral-400 text-sm mb-4">{amenity.description}</p>
                             <div className="text-sm space-y-2 mb-4">
                                <p><Icon name="users" size={16} className="inline mr-2" /> Capacidad: {amenity.capacity} personas</p>
                                <p><Icon name="dollar-sign" size={16} className="inline mr-2" /> Costo: RD$ {amenity.fee.toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                             <button onClick={() => setViewingReservations(amenity)} className="flex-1 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm">
                                Ver Reservas
                            </button>
                            <button onClick={() => handleOpenAmenityModal(amenity)} className="flex-1 text-center bg-neutral-700 hover:bg-neutral-600 text-white font-semibold py-2 px-4 rounded-lg text-sm">
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
                    <button onClick={() => viewingReservations && handleOpenReservationForm(viewingReservations)} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg text-sm">
                        <Icon name="plus" size={16} />
                        <span>Nueva Reserva</span>
                    </button>
                </div>
                <div className="space-y-4">
                    {viewingReservations && getReservationsForAmenity(viewingReservations.id).length > 0 ? (
                        getReservationsForAmenity(viewingReservations.id).map(res => {
                            const unit = selectedCondo.units.find(u => u.id === res.unitId);
                            return (
                                <div key={res.id} className="bg-neutral-800 p-4 rounded-lg">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-white">Unidad {unit?.apartmentNumber} ({unit?.ownerName})</p>
                                            <p className="text-sm text-neutral-300">Fecha: {formatDate(res.date)}</p>
                                            <p className="text-sm text-neutral-400">Horario: {res.startTime} a {res.endTime}</p>
                                        </div>
                                        <StatusBadge status={res.status} />
                                    </div>
                                    {res.status === 'Pendiente' && (
                                        <div className="mt-3 flex gap-2">
                                            <button onClick={() => handleUpdateReservationStatus(res.id, 'Aprobada')} className="text-xs bg-green-600 hover:bg-green-700 text-white py-1 px-3 rounded-md">Aprobar</button>
                                            <button onClick={() => handleUpdateReservationStatus(res.id, 'Rechazada')} className="text-xs bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-md">Rechazar</button>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-neutral-400 text-center py-4">No hay reservas para esta área.</p>
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
