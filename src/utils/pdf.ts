import type { Unit, AccountHistoryItem, Condo } from '../types';
import { formatDate } from './date';

export const generateInvoicePDF = (unit: Unit, condo: Condo) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const currentDate = formatDate(new Date().toISOString());
    const balance = unit.accountHistory.reduce((acc, item) => acc + (item.type === 'Cargo' ? item.amount : -item.amount), 0);

    doc.setFontSize(20);
    doc.text(`Aviso de Cobro - ${condo.name}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Fecha: ${currentDate}`, 14, 30);

    doc.line(14, 35, 196, 35);

    doc.text(`Propietario: ${unit.ownerName}`, 14, 45);
    doc.text(`Unidad: ${unit.apartmentNumber}`, 14, 52);
    doc.text(`Dirección: ${condo.address}`, 14, 59);

    doc.line(14, 65, 196, 65);

    doc.setFontSize(14);
    doc.text('Detalle de Cuenta', 14, 75);

    doc.autoTable({
        startY: 80,
        head: [['Fecha', 'Descripción', 'Cargo', 'Abono']],
        body: unit.accountHistory.map(item => [
            formatDate(item.date),
            item.description,
            item.type === 'Cargo' ? item.amount.toFixed(2) : '',
            item.type === 'Abono' ? item.amount.toFixed(2) : '',
        ]),
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] },
    });

    const finalY = (doc as any).lastAutoTable.finalY;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Balance Pendiente: RD$ ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 14, finalY + 15);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Favor realizar su pago a la mayor brevedad posible. Gracias.', 14, finalY + 30);

    doc.save(`Aviso-Cobro-${unit.apartmentNumber}-${currentDate}.pdf`);
};

export const generateAccountStatementPDF = (unit: Unit, condo: Condo, startDate: string, endDate: string) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const filteredHistory = unit.accountHistory.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
    });

    let runningBalance = 0;
    const tableBody = filteredHistory.map(item => {
        const charge = item.type === 'Cargo' ? item.amount : 0;
        const credit = item.type === 'Abono' ? item.amount : 0;
        runningBalance += charge - credit;
        return [
            formatDate(item.date),
            item.description,
            charge > 0 ? charge.toFixed(2) : '',
            credit > 0 ? credit.toFixed(2) : '',
            runningBalance.toFixed(2)
        ];
    });

    doc.setFontSize(18);
    doc.text(`Estado de Cuenta - ${condo.name}`, 14, 22);
    doc.setFontSize(12);
    doc.text(`Propietario: ${unit.ownerName} (Unidad ${unit.apartmentNumber})`, 14, 32);
    doc.text(`Período: ${formatDate(startDate)} al ${formatDate(endDate)}`, 14, 40);

    doc.autoTable({
        startY: 50,
        head: [['Fecha', 'Descripción', 'Cargos', 'Abonos', 'Balance']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Estado-de-Cuenta-${unit.apartmentNumber}-${formatDate(startDate)}-${formatDate(endDate)}.pdf`);
};
