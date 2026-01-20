let db = JSON.parse(localStorage.getItem('vara_aracati_acervo')) || [];

function save() {
    localStorage.setItem('vara_aracati_acervo', JSON.stringify(db));
    render();
}

function adicionarProcesso() {
    const num = document.getElementById('pNum').value;
    const task = document.getElementById('pTask').value;
    const date = document.getElementById('pDate').value;
    const col = document.getElementById('pCol').value;
    if(num && date) {
        db.push({ id: Date.now(), num, task, date, col });
        save();
    }
}

function render() {
    const columns = ['urgent', 'todo', 'siper', 'cati', 'done'];
    columns.forEach(c => document.getElementById(c).innerHTML = '');
    
    let metaTotal = 0;
    let metaDone = 0;

    db.forEach(p => {
        const days = Math.floor((new Date() - new Date(p.date)) / (1000 * 60 * 60 * 24));
        let col = p.col;

        // Regra de Gestão: Identificação de Meta 2 (Parados > 300 dias)
        const isMeta2 = days > 300;
        if(isMeta2) metaTotal++;
        if(isMeta2 && p.col === 'todo') col = 'urgent';
        if(isMeta2 && p.col === 'done') metaDone++;

        const card = document.createElement('div');
        card.className = `card ${isMeta2 && col !== 'done' ? 'urgent-meta' : ''} ${p.col === 'siper' || p.task.includes('Perícia') ? 'siper-task' : ''} ${p.col === 'cati' ? 'cati-task' : ''}`;
        card.dataset.id = p.id;
        card.innerHTML = `
            <span class="proc-num">${p.num}</span>
            <div class="proc-task">${p.task}</div>
            <div class="card-footer">
                <span>Últ. Mov: ${p.date.split('-').reverse().join('/')}</span>
                <strong>${days}d parado</strong>
            </div>
        `;
        document.getElementById(col).appendChild(card);
    });

    // Atualiza Barra de Progresso Meta 2
    const perc = metaTotal > 0 ? Math.round((metaDone / metaTotal) * 100) : 0;
    document.getElementById('meta-progress').style.width = perc + '%';
    document.getElementById('meta-perc').innerText = perc;

    initDrag();
}

function importarListaCompleta() {
    const acervo = [
        // PÁGINA 1: Gargalo Meta 2 Crítico (2025)
        { num: "0011774-26.2013.8.06.0035", task: "[FISCAL] Pendentes análise RENAJUD", date: "2025-01-31", col: "todo" },
        { num: "0011286-42.2011.8.06.0035", task: "[FISCAL] Dívida Ativa", date: "2025-01-31", col: "todo" },
        { num: "0051403-60.2020.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-11", col: "todo" },
        { num: "0200587-85.2023.8.06.0035", task: "[GAB] Assinar Sentença", date: "2025-02-12", col: "todo" },
        { num: "0050268-76.2021.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-13", col: "todo" },
        { num: "0200235-64.2022.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-14", col: "todo" },
        { num: "0051081-50.2014.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-19", col: "todo" },
        { num: "0201116-41.2022.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-21", col: "todo" },
        { num: "0050214-47.2020.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-22", col: "todo" },
        { num: "0013705-25.2017.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-22", col: "todo" },

        // PÁGINA 2-4: SIPER / Perícias e Acervo em análise
        { num: "0202634-95.2024.8.06.0035", task: "[SIPER] Gerenciar Perícia - Interdição", date: "2025-06-03", col: "siper" },
        { num: "0000297-95.2018.8.06.0078", task: "[SIPER] Gerenciar Perícia - Perdas e Danos", date: "2025-06-04", col: "siper" },
        { num: "0051083-73.2021.8.06.0035", task: "[SIPER] Gerenciar Perícia - Perdas e Danos", date: "2025-06-06", col: "siper" },
        { num: "0200490-85.2023.8.06.0035", task: "[SIPER] Gerenciar Perícia - Interdição", date: "2025-06-16", col: "siper" },
        { num: "0201013-34.2022.8.06.0035", task: "[SIPER] Gerenciar Perícia - Interdição", date: "2025-06-20", col: "siper" },

        // PÁGINA 5-8: Secretaria e Expedientes Diversos
        { num: "3003642-74.2023.8.06.0035", task: "[SEC] Analisar Manifestação - Paridade", date: "2025-07-04", col: "todo" },
        { num: "0048751-12.2016.8.06.0035", task: "[SEC] Analisar Manifestação - Usucapião", date: "2025-07-10", col: "todo" },
        { num: "0015235-64.2017.8.06.0035", task: "[GAB] Minutar Sentença - Embargos", date: "2025-07-17", col: "todo" },
        { num: "0200264-46.2024.8.06.0035", task: "[SEC] Analisar Distribuição", date: "2025-07-16", col: "todo" },
        { num: "3002282-36.2025.8.06.0035", task: "[SEC] Analisar Manifestação - Internação", date: "2025-07-22", col: "todo" }
    ];

    acervo.forEach(a => {
        if(!db.find(p => p.num === a.num)) db.push({ id: Date.now() + Math.random(), ...a });
    });
    save();
}

function initDrag() {
    document.querySelectorAll('.list').forEach(l => {
        new Sortable(l, { group: 'kanban', animation: 150, onEnd: evt => {
            const id = evt.item.dataset.id;
            const idx = db.findIndex(p => p.id == id);
            db[idx].col = evt.to.id;
            save();
        }});
    });
}

function limparBanco() { if(confirm("Apagar todos os dados?")) { db = []; save(); } }

window.onload = render;
