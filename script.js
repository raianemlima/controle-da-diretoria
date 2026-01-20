function carregarAcervoPorAssunto() {
    const processosOrganizados = [
        // EXECUTIVOS FISCAIS
        { num: "0011774-26.2013.8.06.0035", task: "[FISCAL] Pendente RENAJUD", date: "2025-01-31", col: "urgent" },
        { num: "0011286-42.2011.8.06.0035", task: "[FISCAL] Dívida Ativa", date: "2025-01-31", col: "urgent" },
        
        // FAMÍLIA / SIPER
        { num: "0202634-95.2024.8.06.0035", task: "[FAMÍLIA] Perícia Interdição", date: "2025-06-03", col: "siper" },
        { num: "0050042-08.2020.8.06.0035", task: "[FAMÍLIA] Alimentos", date: "2025-06-20", col: "todo" },
        
        // POSSE / PROPRIEDADE
        { num: "0200235-64.2022.8.06.0035", task: "[IMOBILIÁRIO] Usucapião", date: "2025-02-14", col: "urgent" },
        { num: "0200587-85.2023.8.06.0035", task: "[POSSE] Reintegração", date: "2025-02-12", col: "urgent" },
        
        // RESPONSABILIDADE CIVIL
        { num: "0051052-53.2021.8.06.0035", task: "[CÍVEL] Dano Material", date: "2025-02-25", col: "urgent" },
        { num: "3000466-19.2025.8.06.0035", task: "[CÍVEL] Dano Moral", date: "2025-06-12", col: "todo" }
    ];

    let db = JSON.parse(localStorage.getItem('kanban_2vara_aracati')) || [];
    
    processosOrganizados.forEach(item => {
        if (!db.find(p => p.num === item.num)) {
            db.push({ id: Date.now() + Math.random(), ...item });
        }
    });

    localStorage.setItem('kanban_2vara_aracati', JSON.stringify(db));
    location.reload();
}
