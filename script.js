let db = JSON.parse(localStorage.getItem('vara_aracati_acervo')) || [];

function toggleModal() {
    const modal = document.getElementById('modalOverlay');
    modal.style.display = (modal.style.display === 'flex') ? 'none' : 'flex';
}

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
        db.push({ id: Date.now(), num, task, date, col, concludedDate: null });
        save();
        toggleModal(); // Fecha após cadastrar
        // Limpa campos
        document.getElementById('pNum').value = '';
        document.getElementById('pTask').value = '';
    }
}

function render() {
    const columns = ['urgent', 'todo', 'siper', 'cati', 'done'];
    columns.forEach(c => document.getElementById(c).innerHTML = '');
    
    let metaTotal = 0, metaDone = 0;
    const hoje = new Date();

    db.forEach(p => {
        const days = Math.floor((hoje - new Date(p.date)) / (1000 * 60 * 60 * 24));
        let col = p.col;

        const isMeta2 = days > 300;
        if(isMeta2) metaTotal++;
        if(isMeta2 && p.col === 'todo') col = 'urgent';
        if(isMeta2 && p.col === 'done') metaDone++;

        const card = document.createElement('div');
        const stagnant = (days > 20 && col !== 'done') ? 'stagnant-alert' : '';
        
        card.className = `card ${isMeta2 && col !== 'done' ? 'urgent-meta' : ''} ${stagnant} ${p.col === 'siper' || p.task.includes('Perícia') ? 'siper-task' : ''} ${p.col === 'cati' ? 'cati-task' : ''}`;
        card.dataset.id = p.id;
        card.innerHTML = `
            <span class="proc-num">${p.num}</span>
            <div class="proc-task">${p.task}</div>
            <div class="card-footer">
                <span>Mov: ${p.date.split('-').reverse().join('/')}</span>
                <strong>${days}d</strong>
                <button onclick="remove(${p.id})" style="border:none; background:none; cursor:pointer; color:#ccc;">×</button>
            </div>
        `;
        document.getElementById(col).appendChild(card);
    });

    const perc = metaTotal > 0 ? Math.round((metaDone / metaTotal) * 100) : 0;
    document.getElementById('meta-progress').style.width = perc + '%';
    document.getElementById('meta-perc').innerText = perc;
    initDrag();
}

function importarRelatorioCompleto() {
    const totalAcervo = [
        // Página 1: Execuções Fiscais Críticas
        { num: "0011774-26.2013.8.06.0035", task: "[FISCAL] Pendentes análise RENAJUD", date: "2025-01-31", col: "todo" },
        { num: "0011286-42.2011.8.06.0035", task: "[FISCAL] Dívida Ativa", date: "2025-01-31", col: "todo" },
        
        // Página 1-2: Gabinete (Sentenças Antigas)
        { num: "0051403-60.2020.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-11", col: "todo" },
        { num: "0200587-85.2023.8.06.0035", task: "[GAB] Assinar Sentença", date: "2025-02-12", col: "todo" },
        
        // Página 4: SIPER / Perícias Identificadas
        { num: "0202634-95.2024.8.06.0035", task: "[SIPER] Nomeação Curatela", date: "2025-06-03", col: "siper" },
        { num: "0201013-34.2022.8.06.0035", task: "[SIPER] Gerenciar Perícia", date: "2025-06-20", col: "siper" },
        
        // Página 8: Secretaria (Prazos Recentes)
        { num: "3001745-40.2025.8.06.0035", task: "[SEC] Testamento", date: "2025-07-22", col: "todo" },
        { num: "3002282-36.2025.8.06.0035", task: "[SEC] Internação Compulsória", date: "2025-07-22", col: "todo" }
    ];

    totalAcervo.forEach(a => {
        if(!db.find(p => p.num === a.num)) db.push({ id: Date.now() + Math.random(), ...a });
    });
    save();
}

function initDrag() {
    document.querySelectorAll('.list').forEach(l => {
        new Sortable(l, { group: 'kanban', animation: 150, onEnd: evt => {
            const id = evt.item.dataset.id;
            const idx = db.findIndex(p => p.id == id);
            const target = evt.to.id;
            db[idx].col = target;
            if(target === 'done') db[idx].concludedDate = new Date().toLocaleDateString();
            save();
        }});
    });
}

function remove(id) {
    db = db.filter(p => p.id != id);
    save();
}

function limparBanco() { if(confirm("Apagar todos os dados cadastrados?")) { db = []; save(); } }

window.onload = render;
