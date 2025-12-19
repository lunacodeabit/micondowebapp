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

    // =============================================
    // DISEÑO PREMIUM EJECUTIVO - MI CONDO
    // Paleta: Azul Marino + Dorado + Grises
    // =============================================

    // Colores corporativos
    const navyBlue: [number, number, number] = [30, 58, 95];
    const gold: [number, number, number] = [184, 134, 11];
    const darkGray: [number, number, number] = [51, 51, 51];
    const mediumGray: [number, number, number] = [128, 128, 128];

    // Header elegante con azul marino
    doc.setFillColor(...navyBlue);
    doc.rect(0, 0, 210, 45, 'F');

    // Logo/Marca
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('MI CONDO', 20, 25);

    // Subtítulo
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 180, 180);
    doc.text('SISTEMA DE ADMINISTRACIÓN DE CONDOMINIOS', 20, 35);

    // Número de recibo - lado derecho
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('RECIBO N°', 150, 22);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.receiptNumber, 150, 32);

    // Línea decorativa dorada
    doc.setFillColor(...gold);
    doc.rect(0, 45, 210, 3, 'F');

    // Título del documento
    doc.setTextColor(...darkGray);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('COMPROBANTE DE PAGO', 20, 65);

    // Línea sutil bajo el título
    doc.setDrawColor(...mediumGray);
    doc.setLineWidth(0.3);
    doc.line(20, 70, 190, 70);

    // Información del cliente - Sección
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navyBlue);
    doc.text('DATOS DEL CLIENTE', 20, 85);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...darkGray);
    doc.setFontSize(11);

    doc.text('Razón Social:', 20, 95);
    doc.setFont('helvetica', 'bold');
    doc.text(receipt.companyName, 55, 95);

    doc.setFont('helvetica', 'normal');
    doc.text('RNC:', 20, 103);
    doc.text(receipt.companyRnc || 'N/A', 55, 103);

    // Línea separadora elegante
    doc.setDrawColor(220, 220, 220);
    doc.line(20, 112, 190, 112);

    // Detalles del pago
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...navyBlue);
    doc.text('DETALLES DE LA TRANSACCIÓN', 20, 125);

    // Tabla con estilo ejecutivo
    doc.autoTable({
        startY: 130,
        head: [['Concepto', 'Información']],
        body: [
            ['Fecha de Transacción', formatDate(receipt.paymentDate)],
            ['Período Facturado', `${formatDate(receipt.periodStart)} al ${formatDate(receipt.periodEnd)}`],
            ['Forma de Pago', receipt.method],
            ['N° de Referencia', receipt.reference || 'N/A'],
        ],
        theme: 'plain',
        headStyles: {
            fillColor: [245, 245, 245],
            textColor: navyBlue,
            fontStyle: 'bold',
            fontSize: 10,
        },
        bodyStyles: {
            textColor: darkGray,
            fontSize: 10,
        },
        alternateRowStyles: {
            fillColor: [252, 252, 252],
        },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 60 },
            1: { cellWidth: 110 },
        },
        margin: { left: 20, right: 20 },
        tableLineColor: [220, 220, 220],
        tableLineWidth: 0.1,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Box del monto - Estilo premium con borde dorado
    doc.setDrawColor(...gold);
    doc.setLineWidth(1.5);
    doc.setFillColor(252, 252, 250);
    doc.roundedRect(20, finalY, 170, 35, 2, 2, 'FD');

    // Etiqueta
    doc.setTextColor(...mediumGray);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('MONTO TOTAL PAGADO', 30, finalY + 15);

    // Monto grande
    doc.setTextColor(...navyBlue);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(`RD$ ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 30, finalY + 28);

    // Sello de pagado
    doc.setTextColor(39, 174, 96);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('PAGADO', 160, finalY + 22);

    // Pie de página
    const footerY = finalY + 55;

    doc.setDrawColor(220, 220, 220);
    doc.line(20, footerY, 190, footerY);

    doc.setTextColor(...mediumGray);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Este documento es un comprobante oficial de pago emitido por MI CONDO.', 20, footerY + 10);
    doc.text('Guarde este recibo para sus registros contables.', 20, footerY + 16);

    // Footer
    doc.setFillColor(...navyBlue);
    doc.rect(0, 277, 210, 20, 'F');

    doc.setTextColor(180, 180, 180);
    doc.setFontSize(8);
    doc.text('MI CONDO SaaS | Plataforma de Administración de Condominios', 20, 287);
    doc.text(`Documento generado: ${new Date().toLocaleString('es-DO')}`, 140, 287);

    // Abrir PDF en nueva pestaña
    window.open(doc.output('bloburl'), '_blank');
};
