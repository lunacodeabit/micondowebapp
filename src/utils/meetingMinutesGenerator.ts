import { formatDate } from './date';
export const generateMeetingMinutesPDF = (data: any, condoName: string) => {
    const { jsPDF } = (window as any).jspdf || { jsPDF: class { } };
    if (!(window as any).jspdf) {
        console.error("jsPDF not loaded");
        return;
    }

    const doc = new jsPDF();
    const { assembly, attendance, votes } = data;
    let finalY = 20;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("ACTA DE ASAMBLEA", 105, finalY, { align: 'center' });

    finalY += 12;
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(condoName, 105, finalY, { align: 'center' });

    finalY += 20;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text("DATOS DE LA ASAMBLEA", 14, finalY);
    doc.line(14, finalY + 2, 200, finalY + 2);

    finalY += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Título: ${assembly.title}`, 14, finalY);
    finalY += 7;
    doc.text(`Fecha: ${formatDate(assembly.date)}`, 14, finalY);
    finalY += 7;
    doc.text(`Tipo: ${assembly.type === 'ordinary' ? 'Ordinaria' : 'Extraordinaria'}`, 14, finalY);

    // Attendance & Quorum
    finalY += 15;
    doc.setFont(undefined, 'bold');
    doc.text("QUÓRUM Y ASISTENCIA", 14, finalY);
    doc.line(14, finalY + 2, 200, finalY + 2);

    const totalWeight = attendance.reduce((sum: number, a: any) => sum + (a.unit?.percentage || 0), 0);
    finalY += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`Unidades Presentes: ${attendance.length}`, 14, finalY);
    doc.text(`Quórum Alcanzado: ${totalWeight.toFixed(2)}%`, 120, finalY);

    // Attendance Table
    finalY += 5;
    doc.autoTable({
        startY: finalY,
        head: [['Unidad', 'Propietario', 'Poder/Voto (%)', 'Estado']],
        body: attendance.map((a: any) => [
            a.unit?.apartment_number || 'N/A',
            a.unit?.owner_name || 'N/A',
            `${(a.unit?.percentage || 0).toFixed(2)}%`,
            a.is_present ? 'Presente' : 'Ausente'
        ]),
        headStyles: { fillColor: [52, 73, 94] },
    });

    finalY = doc.lastAutoTable.finalY + 15;

    // Resolutions & Voting
    doc.setFont(undefined, 'bold');
    doc.text("RESOLUCIONES Y VOTACIONES", 14, finalY);
    doc.line(14, finalY + 2, 200, finalY + 2);
    finalY += 10;

    assembly.topics.forEach((topic: any, index: number) => {
        if (finalY > 250) {
            doc.addPage();
            finalY = 20;
        }

        doc.setFont(undefined, 'bold');
        doc.text(`${index + 1}. ${topic.title}`, 14, finalY);
        finalY += 7;
        doc.setFont(undefined, 'normal');
        doc.setFontSize(10);
        doc.text(topic.description || '', 14, finalY, { maxWidth: 180 });

        // Calculate votes for this topic
        const topicVotes = votes.filter((v: any) => v.topic_id === topic.id);
        const results = topic.options.map((opt: any) => {
            const weight = topicVotes
                .filter((v: any) => v.option_id === opt.id)
                .reduce((sum: number, v: any) => sum + v.weight, 0);
            return [opt.label, `${weight.toFixed(2)}%`];
        });

        doc.autoTable({
            startY: finalY + 5,
            head: [['Opción', 'Resultado (Ponderado)']],
            body: results,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            margin: { left: 20 }
        });

        finalY = doc.lastAutoTable.finalY + 12;
        doc.setFontSize(12);
    });

    // Signature Section
    if (finalY > 230) {
        doc.addPage();
        finalY = 40;
    } else {
        finalY += 30;
    }

    doc.line(30, finalY, 90, finalY);
    doc.line(120, finalY, 180, finalY);
    finalY += 5;
    doc.setFontSize(10);
    doc.text("PRESIDENTE", 60, finalY, { align: 'center' });
    doc.text("SECRETARIO", 150, finalY, { align: 'center' });

    doc.save(`ACTA_ASAMBLEA_${assembly.id.slice(0, 8)}.pdf`);
};
