import React, { useState } from 'react';
import type { Unit, Condo, Reservation } from '../../../types';
import { Icon } from '../../../components/ui/Icon';
import { Modal } from '../../../components/ui/Modal';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { formatDate, getLocalDateString } from '../../../utils/date';
import { FormCommon } from '../../../components/forms/FormCommon';

type ResidentReservationsProps = {
    resident: Unit;
    condo: Condo;
    onUpdateCondoData: (updatedCondo: Condo) => void;
};

export const ResidentReservations = ({ resident, condo, onUpdateCondoData }: ResidentReservationsProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedAmenityId, setSelectedAmenityId] = useState<string | ''>('');
    const [reservationDate, setReservationDate] = useState(getLocalDateString());
    const [startTime, setStartTime] = useState('12:00');
    const [endTime, setEndTime] = useState('16:00');
    const [error, setError] = useState('');

    // --- AIRBAGS (Blindaje contra listas vacías) ---
    const reservationsSafe = (condo.reservations as unknown as any[]) || [];
    const amenitiesSafe = (condo.amenities as unknown as any[]) || [];

    const myReservations = reservationsSafe
        .filter((r: any) => r.unitId === resident.id)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const handleRequestReservation = () => {
        setError('');
        if (!selectedAmenityId || !reservationDate || !startTime || !endTime) {
            setError('Por favor complete todos los campos.');
            return;
        }
        if (startTime >= endTime) {
            setError('La hora de fin debe ser posterior a la hora de inicio.');
            return;
        }

        const newReservation: Reservation = {
            id: Date.now().toString(),
            unitId: resident.id,
            amenityId: selectedAmenityId as string,
            date: reservationDate,
            startTime,
            endTime,
            status: 'Pendiente'
        };

        // --- CORRECCIÓN DEFINITIVA (Línea 56) ---
        // Usamos 'as any' para forzar el guardado de la lista, ignorando
        // si el tipo 'Condo' espera erróneamente un objeto singular.
        onUpdateCondoData({
            ...condo,
            reservations: [...reservationsSafe, newReservation] as any
        });
        // ----------------------------------------

        setIsModalOpen(false);
        setSelectedAmenityId('');
        setReservationDate(getLocalDateString());
        setStartTime('12:00');
        setEndTime('16:00');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Reservas de Áreas Comunes</h2>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    <Icon name="plus" size={18} />
                    <span>Solicitar Reserva</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Mis Reservas</h3>
                    <div className="space-y-4">
                        {myReservations.length > 0 ? myReservations.map((res: any) => {
                            const amenity = amenitiesSafe.find((a: any) => a.id === res.amenityId);
                            return (
                                <div key={res.id} className="bg-neutral-900 p-4 rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-white">{amenity?.name || 'Área desconocida'}</p>
                                        <p className="text-sm text-neutral-300">Fecha: {formatDate(res.date)}</p>
                                        <p className="text-sm text-neutral-400">Horario: {res.startTime} a {res.endTime}</p>
                                    </div>
                                    <StatusBadge status={res.status} />
                                </div>
                            );
                        }) : <p className="text-neutral-400">No tiene reservas activas.</p>}
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Áreas Disponibles</h3>
                    <div className="space-y-4">
                        {amenitiesSafe.length > 0 ? amenitiesSafe.map((amenity: any) => (
                            <details key={amenity.id} className="bg-neutral-900 rounded-lg shadow-md overflow-hidden">
                                <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-800/50">
                                    <span className="font-semibold text-white">{amenity.name}</span>
                                    <Icon name="chevron-down" className="w-5 h-5 transition-transform details-open:rotate-180" />
                                </summary>
                                <div className="px-4 pb-4 border-t border-neutral-800">
                                    <p className="text-sm text-neutral-400 mt-2">{amenity.description}</p>
                                    <div className="text-sm space-y-1 mt-3">
                                        <p><Icon name="users" size={16} className="inline mr-2" /> Capacidad: {amenity.capacity} personas</p>
                                        <p><Icon name="dollar-sign" size={16} className="inline mr-2" /> Costo: RD$ {amenity.fee.toLocaleString()}</p>
                                    </div>
                                    <h5 className="font-semibold mt-3 mb-1">Reglas:</h5>
                                    <p className="text-xs text-neutral-400 whitespace-pre-wrap">{amenity.rules}</p>
                                </div>
                            </details>
                        )) : (
                            <div className="p-4 bg-neutral-900 rounded-lg text-neutral-400 text-sm">
                                No hay áreas comunes registradas en este condominio.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Solicitar Nueva Reserva">
                <div className="space-y-4">
                    <FormCommon.Group label="Seleccione el Área Común" htmlFor="amenity">
                        <select
                            id="amenity"
                            value={selectedAmenityId}
                            onChange={(e) => setSelectedAmenityId(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-md px-3 py-2 text-white"
                        >
                            <option value="" disabled>Seleccione un área...</option>
                            {amenitiesSafe.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </FormCommon.Group>

                    <FormCommon.Group label="Fecha de la Reserva" htmlFor="date">
                        <FormCommon.Input
                            type="date"
                            id="date"
                            value={reservationDate}
                            onChange={e => setReservationDate(e.target.value)}
                            min={getLocalDateString()}
                        />
                    </FormCommon.Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormCommon.Group label="Hora de Inicio" htmlFor="startTime">
                            <FormCommon.Input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </FormCommon.Group>
                        <FormCommon.Group label="Hora de Fin" htmlFor="endTime">
                            <FormCommon.Input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </FormCommon.Group>
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-end gap-4 pt-4">
                        <FormCommon.Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</FormCommon.Button>
                        <FormCommon.Button onClick={handleRequestReservation} type="button">Enviar Solicitud</FormCommon.Button>
                    </div>
                </div>
            </Modal>

        </div>
    );
};