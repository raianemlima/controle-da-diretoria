function carregarAcervoIncial() {
    const dadosRelatorio = [
        // Gargalo de 2025
        { num: "0011774-26.2013.8.06.0035", task: "Pendentes RENAJUD", date: "2025-01-31", col: "urgent" },
        { num: "0011286-42.2011.8.06.0035", task: "Dívida Ativa", date: "2025-01-31", col: "urgent" },
        { num: "0051403-60.2020.8.06.0035", task: "Minutar Sentença", date: "2025-02-11", col: "urgent" },
        { num: "0200587-85.2023.8.06.0035", task: "Assinar Sentença", date: "2025-02-12", col: "urgent" },
        { num: "0050268-76.2021.8.06.0035", task: "Minutar Sentença", date: "2025-02-13", col: "urgent" },
        
        // SIPER / Perícias
        { num: "0202634-95.2024.8.06.0035", task: "Gerenciar Perícia", date: "2025-06-03", col: "siper" },
        { num: "0000297-95.2018.8.06.0078", task: "Gerenciar Perícia", date: "2025-06-04", col: "siper" },
        { num: "0051083-73.2021.8.06.0035", task: "Gerenciar Perícia", date: "2025-06-06", col: "siper" },
        { num: "0001422-33.2018.8.06.0035", task: "Gerenciar Perícia", date: "2025-06-20", col: "siper" },
        { num: "0202605-45.2024.8.06.0035", task: "Gerenciar Perícia", date: "2025-06-20", col: "siper" }
    ];

    let db = JSON.parse(localStorage.getItem('kanban_2vara_aracati')) || [];
    
    dadosRelatorio.forEach(item => {
        if (!db.find(p => p.num === item.num)) { // Evita duplicatas
            db.push({ id: Date.now() + Math.random(), ...item });
        }
    });

    localStorage.setItem('kanban_2vara_aracati', JSON.stringify(db));
    location.reload(); // Atualiza a tela para mostrar os cartões
}

// Chame esta função no console do navegador ou adicione temporariamente ao window.onload
// carregarAcervoIncial();
