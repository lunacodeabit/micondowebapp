import React from 'react';
import type { Condo } from '../../../types';
import { formatDate } from '../../../utils/date';
import { Icon } from '../../../components/ui/Icon';

type ResidentCommunicationsProps = {
    condo: Condo;
};

export const ResidentCommunications = ({ condo }: ResidentCommunicationsProps) => {
    const communications = (condo.communications as unknown as any[]) || [];
    const sortedCommunications = [...communications].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">Comunicados y Avisos</h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    Boletines informativos y avisos oficiales de la administración de {condo.name}.
                </p>
            </div>

            <div className="space-y-4">
                {sortedCommunications.length > 0 ? sortedCommunications.map((comm: any) => (
                    <div key={comm.id} className="bg-white dark:bg-[#161b26] p-5 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Icon name="megaphone" size={16} className="text-blue-500" />
                                {comm.title}
                            </h3>
                            <span className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">{formatDate(comm.date)}</span>
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 whitespace-pre-wrap leading-relaxed mt-2">{comm.content}</p>
                    </div>
                )) : (
                    <div className="bg-white dark:bg-[#161b26] p-10 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs text-center">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 flex items-center justify-center mx-auto mb-3">
                            <Icon name="bell-off" size={20} />
                        </div>
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs font-medium">No hay comunicados recientes.</p>
                    </div>
                )}
            </div>
        </div>
    );
};