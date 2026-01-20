// Banco de dados local com suporte a data de conclusão
let db = JSON.parse(localStorage.getItem('vara2_db')) || [];

function save() { 
    localStorage.setItem('vara2_db', JSON.stringify(db)); 
    render(); 
}

function render(filter = 'all') {
    const lists = ['todo', 'siper', 'urgent', 'cati', 'done'];
    lists.forEach(l => document.getElementById(l).innerHTML = '');
    let counts = { urgent: 0, siper: 0, cati: 0 };

    db.forEach(p => {
        if(filter !== 'all' && !p.task.toUpperCase().includes(filter)) return;

        const days = Math.floor((new Date() - new Date(p.date)) / (1000 * 60 * 60 * 24));
        let finalCol = p.col;
        
        // Lógica de Meta 2: Processos parados há mais de 300 dias (Relatório Jan/2026)
        if(days > 300 && p.col === 'todo') finalCol = 'urgent';
        
        if(finalCol === 'urgent') counts.urgent++;
        if(finalCol === 'siper') counts.siper++;
        if(finalCol === 'cati') counts.cati++;

        const card = document.createElement('div');
        card.className = `card ${days > 300 ? 'meta2' : ''} ${finalCol === 'siper' ? 'siper-task' : ''} ${finalCol === 'cati' ? 'cati-task' : ''}`;
        card.dataset.id = p.id;
        card.innerHTML = `
            <span class="badge">${days > 300 ? 'META 2' : 'URGENTE'}</span>
            <span class="proc-num">${p.num}</span>
            <div class="proc-task">${p.task}</div>
            <div class="proc-footer">
                <span>Últ. Mov: ${p.date.split('-').reverse().join('/')}</span>
                <strong>${days} dias</strong>
                <button onclick="remove(${p.id})" style="border:none; background:none; cursor:pointer;">×</button>
            </div>
        `;
        document.getElementById(finalCol).appendChild(card);
    });

    document.getElementById('count-urgent').innerText = counts.urgent;
    document.getElementById('count-siper').innerText = counts.siper;
    document.getElementById('count-cati').innerText = counts.cati;
    initDrag();
}

function initDrag() {
    document.querySelectorAll('.list').forEach(l => {
        new Sortable(l, { 
            group: 'kanban', 
            animation: 150, 
            onEnd: evt => {
                const id = evt.item.dataset.id;
                const idx = db.findIndex(p => p.id == id);
                const targetCol = evt.to.id;
                
                db[idx].col = targetCol;
                
                // Se movido para Concluído, registra a data de hoje
                if(targetCol === 'done') {
                    db[idx].concludedDate = new Date().toLocaleDateString();
                }
                save();
            }
        });
    });
}

// NOVA FUNÇÃO: Resumo de Produtividade Diária
function gerarResumoProdutividade() {
    const hoje = new Date().toLocaleDateString();
    const concluidosHoje = db.filter(p => p.col === 'done' && p.concludedDate === hoje);
    
    if (concluidosHoje.length === 0) {
        alert("Nenhum processo foi movido para 'Concluído' hoje.");
        return;
    }

    let resumo = `--- RESUMO DE PRODUTIVIDADE DIÁRIA ---\n`;
    resumo += `Unidade: 2ª Vara Cível de Aracati\n`;
    resumo += `Diretora: Raiane Lima (Matrícula: 54849)\n`;
    resumo += `Data: ${hoje}\n\n`;
    resumo += `Total de Processos Impulsionados: ${concluidosHoje.length}\n\n`;
    resumo += `Lista de Processos:\n`;
    
    concluidosHoje.forEach(p => {
        resumo += `- ${p.num} (${p.task})\n`;
    });

    console.log(resumo);
    alert(resumo);
}
