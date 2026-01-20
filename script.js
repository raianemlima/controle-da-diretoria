async function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const hoje = new Date().toLocaleDateString();
    
    // Filtra processos concluídos na data atual
    const concluidosHoje = db.filter(p => p.col === 'done' && p.concludedDate === hoje);
    
    if (concluidosHoje.length === 0) {
        alert("Não há processos concluídos hoje para exportar.");
        return;
    }

    // Configuração do Cabeçalho Oficial
    doc.setFontSize(14);
    doc.text("PODER JUDICIÁRIO DO ESTADO DO CEARÁ", 105, 15, { align: "center" });
    doc.setFontSize(12);
    doc.text("2ª VARA CÍVEL DA COMARCA DE ARACATI", 105, 22, { align: "center" });
    doc.setFontSize(10);
    doc.text(`Relatório de Produtividade Diária - Secretaria`, 105, 28, { align: "center" });
    
    doc.line(20, 32, 190, 32);

    // Informações da Gestão
    doc.setFont(undefined, 'bold');
    doc.text(`Diretora: Raiane Maiara de Lima`, 20, 40);
    doc.text(`Matrícula: 54849`, 20, 45);
    doc.text(`Data: ${hoje}`, 150, 40);
    doc.setFont(undefined, 'normal');

    // Tabela de Processos
    const rows = concluidosHoje.map(p => [
        p.num,
        p.task.replace('[', '').replace(']', ''),
        "CONCLUÍDO"
    ]);

    doc.autoTable({
        startY: 55,
        head: [['Número do Processo', 'Assunto/Tarefa', 'Status']],
        body: rows,
        headStyles: { fillStyle: [0, 74, 141] }, // Azul do cabeçalho
        theme: 'grid'
    });

    // Rodapé de Assinatura
    const finalY = doc.lastAutoTable.finalY + 30;
    doc.line(60, finalY, 150, finalY);
    doc.text("Raiane Maiara de Lima", 105, finalY + 5, { align: "center" });
    doc.text("Diretora de Secretaria", 105, finalY + 10, { align: "center" });

    doc.save(`Produtividade_2Vara_Aracati_${hoje.replace(/\//g, '-')}.pdf`);
}
