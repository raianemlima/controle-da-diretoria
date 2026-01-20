// 1. INICIALIZAÇÃO E PERSISTÊNCIA DE DADOS
let db = JSON.parse(localStorage.getItem('vara_aracati_acervo')) || [];

// Função para salvar e atualizar a interface
function save() {
    localStorage.setItem('vara_aracati_acervo', JSON.stringify(db));
    render();
}

// 2. CONTROLE DE MODAL (INTERFACE LIMPA)
function toggleModal() {
    const m = document.getElementById('modalOverlay');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
}

// 3. CADASTRO COM VALIDAÇÃO DE DUPLICIDADE
function adicionarProcesso() {
    const num = document.getElementById('pNum').value.trim();
    const task = document.getElementById('pTask').value;
    const date = document.getElementById('pDate').value;
    const col = document.getElementById('pCol').value;

    if(!num || !date) {
        return alert("Erro: Número do processo e data da última movimentação são obrigatórios.");
    }
    
    // Verificação de Duplicidade: Evita retrabalho nas 6.412 tarefas
    if(db.find(p => p.num === num)) {
        return alert("Atenção: Este processo já consta no seu painel de controle.");
    }

    db.push({ 
        id: Date.now(), 
        num, 
        task, 
        date, 
        col, 
        concludedDate: null 
    });

    save();
    toggleModal();
    
    // Limpeza de campos para novo uso
    document.getElementById('pNum').value = '';
    document.getElementById('pTask').value = '';
}

// 4. MOTOR DE RENDERIZAÇÃO E INTELIGÊNCIA DE PRAZOS
function render() {
    const columns = ['urgent', 'todo', 'siper', 'cati', 'done'];
    columns.forEach(c => {
        const el = document.getElementById(c);
        if(el) el.innerHTML = '';
    });
    
    let metaTotal = 0, metaDone = 0;
    const hoje = new Date();

    db.forEach(p => {
        const dataMov = new Date(p.date);
        const diffTempo = Math.abs(hoje - dataMov);
        const days = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
        
        let colDestino = p.col;

        // Lógica Meta 2: Processos parados há mais de 300 dias (Acervo 2025)
        const isMeta2 = days > 300;
        if(isMeta2) metaTotal++;
        if(isMeta2 && p.col === 'todo') colDestino = 'urgent';
        if(isMeta2 && p.col === 'done') metaDone++;

        // Alerta de Inatividade: Piscar se estiver parado há mais de 20 dias
        const isStagnant = (days > 20 && colDestino !== 'done');
        
        const card = document.createElement('div');
        card.className = `card ${isMeta2 && colDestino !== 'done' ? 'urgent-meta' : ''} 
                          ${isStagnant ? 'stagnant-alert' : ''} 
                          ${p.col === 'siper' || p.task.includes('Perícia') ? 'siper-task' : ''} 
                          ${p.col === 'cati' ? 'cati-task' : ''}`;
        
        card.dataset.id = p.id;
        card.innerHTML = `
            <span class="proc-num">${p.num}</span>
            <div class="proc-task">${p.task}</div>
            <div class="card-footer">
                <span>Mov: ${p.date.split('-').reverse().join('/')}</span>
                <strong>${days} dias</strong>
                <button onclick="remove(${p.id})" style="border:none; background:none; cursor:pointer; color:#ccc; font-size:14px;">&times;</button>
            </div>
        `;
        
        const listEl = document.getElementById(colDestino);
        if(listEl) listEl.appendChild(card);
    });

    // Atualização da Barra de Progresso Meta 2
    const perc = metaTotal > 0 ? Math.round((metaDone / metaTotal) * 100) : 0;
    const progressBar = document.getElementById('meta-progress');
    const progressPerc = document.getElementById('meta-perc');
    
    if(progressBar) progressBar.style.width = perc + '%';
    if(progressPerc) progressPerc.innerText = perc;

    initDrag();
}

// 5. SISTEMA DE ARRASTE (KANBAN INTERATIVO)
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
                
                // Registro de data para o Relatório de Produtividade
                if(targetCol === 'done') {
                    db[idx].concludedDate = new Date().toLocaleDateString();
                } else {
                    db[idx].concludedDate = null;
                }
                save();
            }
        });
    });
}

// 6. IMPORTAÇÃO AUTOMÁTICA (DADOS DO RELATÓRIO PDF PAG 1-8)
function importarRelatorioCompleto() {
    const acervoDados = [
        // Meta 2 - Gargalo 2025 [cite: 12]
        { num: "0011774-26.2013.8.06.0035", task: "[EF] Pendentes RENAJUD", date: "2025-01-31", col: "todo" },
        { num: "0011286-42.2011.8.06.0035", task: "[EF] Dívida Ativa", date: "2025-01-31", col: "todo" },
        { num: "0051403-60.2020.8.06.0035", task: "[GAB] Minutar Sentença", date: "2025-02-11", col: "todo" },
        { num: "0200587-85.2023.8.06.0035", task: "[GAB] Assinar Sentença", date: "2025-02-12", col: "todo" },
        
        // SIPER / Perícias [cite: 19]
        { num: "0202634-95.2024.8.06.0035", task: "[SIPER] Nomeação Curatela", date: "2025-06-03", col: "siper" },
        { num: "0000297-95.2018.8.06.0078", task: "[SIPER] Gerenciar Perícia", date: "2025-06-04", col: "siper" },
        { num: "0201013-34.2022.8.06.0035", task: "[SIPER] Interdição", date: "2025-06-20", col: "siper" },

        // Secretaria e Outros Prazos [cite: 25, 258]
        { num: "3003642-74.2023.8.06.0035", task: "[SEC] Paridade Salarial", date: "2025-07-04", col: "todo" },
        { num: "3001745-40.2025.8.06.0035", task: "[SEC] Testamento", date: "2025-07-22", col: "todo" },
        { num: "3002282-36.2025.8.06.0035", task: "[SEC] Internação Compulsória", date: "2025-07-22", col: "todo" }
    ];

    acervoDados.forEach(a => {
        if(!db.find(p => p.num === a.num)) {
            db.push({ id: Date.now() + Math.random(), ...a });
        }
    });
    save();
    alert("Processos das 8 páginas do relatório importados com sucesso!");
}

// 7. EXPORTAÇÃO E SEGURANÇA (PDF E BACKUP)
function exportarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const hoje = new Date().toLocaleDateString();
    const concluidos = db.filter(p => p.col === 'done' && p.concludedDate === hoje);
    
    if (concluidos.length === 0) return alert("Não há processos concluídos hoje para o relatório.");

    doc.setFontSize(14);
    doc.text("RELATÓRIO DE PRODUTIVIDADE - 2ª VARA CÍVEL ARACATI", 105, 15, {align:"center"});
    doc.setFontSize(10);
    doc.text(`Responsável: Raiane Lima | Data: ${hoje}`, 105, 22, {align:"center"});
    
    doc.autoTable({
        startY: 30,
        head: [['Processo', 'Tarefa/Assunto', 'Status']],
        body: concluidos.map(p => [p.num, p.task, 'CONCLUÍDO'])
    });
    doc.save(`Produtividade_Aracati_${hoje.replace(/\//g,'-')}.pdf`);
}

function exportarBackup() {
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Backup_Acervo_2Vara_Aracati.json`;
    link.click();
}

function importarBackup(e) {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            db = JSON.parse(evt.target.result);
            save();
            alert("Sistema restaurado com sucesso!");
        } catch(e) { alert("Erro ao ler o arquivo de backup."); }
    };
    reader.readAsText(file);
}

// 8. FUNÇÕES DE MANUTENÇÃO
function remove(id) {
    if(confirm("Deseja remover este processo do controle?")) {
        db = db.filter(p => p.id != id);
        save();
    }
}

function limparBanco() {
    if(confirm("ATENÇÃO: Isso apagará todos os dados do painel. Deseja continuar?")) {
        db = [];
        save();
    }
}

// Inicialização automática
window.onload = render;
