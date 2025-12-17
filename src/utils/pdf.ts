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

// =============================================
// RECIBO DE PAGO SAAS
// =============================================
export type SaasPaymentReceipt = {
    receiptNumber: string;
    companyName: string;
    companyRnc: string;
    amount: number;
    paymentDate: string;
    periodStart: string;
    periodEnd: string;
    method: string;
    reference?: string;
};

export const generateSaasPaymentReceiptPDF = (receipt: SaasPaymentReceipt) => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header con logo/marca
    doc.setFillColor(99, 102, 241); // Indigo
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MI CONDO', 14, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Administración de Condominios', 14, 33);

    // Recibo número
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(`Recibo #${receipt.receiptNumber}`, 150, 25);

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGO', 14, 55);

    // Información del cliente
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Cliente:', 14, 70);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.companyName, 40, 70);
    
    doc.setFont('helvetica', 'normal');
    doc.text('RNC:', 14, 78);
    doc.text(receipt.companyRnc || 'N/A', 40, 78);

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 85, 196, 85);

    // Detalles del pago
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Pago', 14, 95);

    // Tabla de detalles
    doc.autoTable({
        startY: 100,
        head: [['Concepto', 'Detalle']],
        body: [
            ['Fecha de Pago', formatDate(receipt.paymentDate)],
            ['Período Cubierto', `${formatDate(receipt.periodStart)} - ${formatDate(receipt.periodEnd)}`],
            ['Método de Pago', receipt.method],
            ['Referencia', receipt.reference || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 120 },
        },
    });

    const finalY = (doc as any).lastAutoTable.finalY;

    // Monto total - Box destacado
    doc.setFillColor(34, 197, 94); // Green
    doc.roundedRect(14, finalY + 10, 182, 30, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('MONTO PAGADO:', 24, finalY + 27);
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(`RD$ ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 100, finalY + 28);

    // Reset color
    doc.setTextColor(0, 0, 0);

    // Pie de página
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Este recibo es un comprobante de pago válido.', 14, finalY + 55);
    doc.text('Conserve este documento para sus registros.', 14, finalY + 62);
    
    doc.setTextColor(100, 100, 100);
    doc.text('MI CONDO SaaS - www.micondo.app', 14, 280);
    doc.text(`Generado: ${new Date().toLocaleString('es-DO')}`, 140, 280);

    // Guardar
    const fileName = `Recibo-${receipt.receiptNumber}-${receipt.companyName.replace(/\s/g, '-')}.pdf`;
    doc.save(fileName);
};
