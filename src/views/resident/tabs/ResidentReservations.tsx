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

        onUpdateCondoData({
            ...condo,
            reservations: [...reservationsSafe, newReservation] as any
        });

        setIsModalOpen(false);
        setSelectedAmenityId('');
        setReservationDate(getLocalDateString());
        setStartTime('12:00');
        setEndTime('16:00');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Reservas de Áreas Sociales</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Solicite el uso de piscinas, gazebos o salones sociales de su condominio.
                    </p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-sm transition-all self-start sm:self-auto"
                >
                    <Icon name="plus" size={16} />
                    <span>Solicitar Reserva</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Mis Solicitudes</h3>
                    <div className="space-y-3">
                        {myReservations.length > 0 ? myReservations.map((res: any) => {
                            const amenity = amenitiesSafe.find((a: any) => a.id === res.amenityId);
                            return (
                                <div key={res.id} className="bg-white dark:bg-[#161b26] p-4 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-neutral-900 dark:text-white text-sm">{amenity?.name || 'Área Común'}</p>
                                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">Fecha: {formatDate(res.date)}</p>
                                        <p className="text-[11px] text-neutral-400 dark:text-neutral-500">Horario: {res.startTime} a {res.endTime}</p>
                                    </div>
                                    <StatusBadge status={res.status} />
                                </div>
                            );
                        }) : (
                            <div className="p-8 text-center bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-neutral-400 text-xs">
                                No tiene solicitudes de reserva registradas.
                            </div>
                        )}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white mb-3">Áreas Disponibles</h3>
                    <div className="space-y-3">
                        {amenitiesSafe.length > 0 ? amenitiesSafe.map((amenity: any) => (
                            <details key={amenity.id} className="group bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs overflow-hidden">
                                <summary className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 list-none">
                                    <span className="font-bold text-sm text-neutral-900 dark:text-white">{amenity.name}</span>
                                    <Icon name="chevron-down" className="w-4 h-4 text-neutral-400 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="px-4 pb-4 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-xs space-y-2 bg-neutral-50/50 dark:bg-neutral-900/30">
                                    <p className="text-neutral-600 dark:text-neutral-400">{amenity.description}</p>
                                    <div className="flex items-center gap-4 text-neutral-700 dark:text-neutral-300 font-medium pt-1">
                                        <span className="flex items-center gap-1"><Icon name="users" size={14} className="text-blue-500" /> Capacidad: {amenity.capacity} pers.</span>
                                        <span className="flex items-center gap-1"><Icon name="dollar-sign" size={14} className="text-emerald-500" /> Tarifa: RD$ {amenity.fee.toLocaleString()}</span>
                                    </div>
                                    {amenity.rules && (
                                        <div className="pt-2 border-t border-neutral-200/60 dark:border-neutral-800">
                                            <p className="font-bold text-neutral-900 dark:text-white mb-0.5">Normas de Uso:</p>
                                            <p className="text-neutral-500 dark:text-neutral-400 whitespace-pre-wrap">{amenity.rules}</p>
                                        </div>
                                    )}
                                </div>
                            </details>
                        )) : (
                            <div className="p-8 text-center bg-white dark:bg-[#161b26] rounded-xl border border-neutral-200/80 dark:border-neutral-800 text-neutral-400 text-xs">
                                No hay áreas sociales configuradas.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Solicitar Nueva Reserva">
                <div className="space-y-4">
                    <FormCommon.Group label="Seleccione el Área Común" htmlFor="amenity" required>
                        <select
                            id="amenity"
                            value={selectedAmenityId}
                            onChange={(e) => setSelectedAmenityId(e.target.value)}
                            className="w-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-xl px-3 py-2 text-neutral-900 dark:text-white text-sm"
                        >
                            <option value="" disabled>Seleccione un área...</option>
                            {amenitiesSafe.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                        </select>
                    </FormCommon.Group>

                    <FormCommon.Group label="Fecha de la Reserva" htmlFor="date" required>
                        <FormCommon.Input
                            type="date"
                            id="date"
                            value={reservationDate}
                            onChange={e => setReservationDate(e.target.value)}
                            min={getLocalDateString()}
                        />
                    </FormCommon.Group>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormCommon.Group label="Hora de Inicio" htmlFor="startTime" required>
                            <FormCommon.Input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={e => setStartTime(e.target.value)}
                            />
                        </FormCommon.Group>
                        <FormCommon.Group label="Hora de Fin" htmlFor="endTime" required>
                            <FormCommon.Input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={e => setEndTime(e.target.value)}
                            />
                        </FormCommon.Group>
                    </div>

                    {error && <p className="text-rose-600 dark:text-rose-400 text-xs font-semibold">{error}</p>}

                    <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                        <FormCommon.Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</FormCommon.Button>
                        <FormCommon.Button onClick={handleRequestReservation} type="button">Enviar Solicitud</FormCommon.Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};