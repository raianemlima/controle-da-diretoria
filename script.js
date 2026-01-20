let processes = JSON.parse(localStorage.getItem('vara_aracati_db')) || [];

document.getElementById('addBtn').addEventListener('click', () => {
    const num = document.getElementById('procNum').value;
    const task = document.getElementById('procTask').value;
    const date = document.getElementById('procDate').value;
    const column = document.getElementById('procCol').value;

    if (!num || !date) return alert("Preencha o número e a data da última movimentação.");

    processes.push({ id: Date.now(), num, task, date, column });
    saveAndRender();
});

function calculateDays(dateString) {
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60 * 60 * 24));
    return diff;
}

function saveAndRender() {
    localStorage.setItem('vara_aracati_db', JSON.stringify(processes));
    render();
}

function render() {
    const columns = ['todo', 'siper', 'urgent', 'cati', 'done'];
    columns.forEach(id => document.getElementById(id).innerHTML = '');

    processes.forEach(p => {
        const days = calculateDays(p.date);
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = p.id;
        
        if (days > 300 && p.column !== 'done') card.classList.add('ancient');
        if (p.column === 'siper' || p.task.toLowerCase().includes('pericia')) card.classList.add('siper-task');
        if (p.column === 'cati') card.classList.add('cati-task');

        card.innerHTML = `
            <span class="delete-btn" onclick="removeProc(${p.id})">×</span>
            <span class="title">${p.num}</span>
            <span class="desc">${p.task}</span>
            <span class="days">Parado há ${days} dias</span>
        `;

        let targetCol = p.column;
        if (days > 300 && p.column === 'todo') targetCol = 'urgent';

        document.getElementById(targetCol).appendChild(card);
    });
    initDragAndDrop();
}

function initDragAndDrop() {
    document.querySelectorAll('.list').forEach(list => {
        new Sortable(list, {
            group: 'kanban',
            animation: 150,
            onEnd: (evt) => {
                const id = evt.item.dataset.id;
                const index = processes.findIndex(p => p.id == id);
                processes[index].column = evt.to.id;
                localStorage.setItem('vara_aracati_db', JSON.stringify(processes));
            }
        });
    });
}

function carregarAcervoPorAssunto() {
    const dados = [
        { num: "0011774-26.2013.8.06.0035", task: "EF - RENAJUD", date: "2025-01-31", column: "todo" },
        { num: "0011286-42.2011.8.06.0035", task: "EF - Dívida Ativa", date: "2025-01-31", column: "todo" },
        { num: "0202634-95.2024.8.06.0035", task: "Perícia Curatela", date: "2025-06-03", column: "siper" }
    ];
    dados.forEach(d => {
        if (!processes.find(p => p.num === d.num)) processes.push({ id: Date.now() + Math.random(), ...d });
    });
    saveAndRender();
}

function removeProc(id) {
    processes = processes.filter(p => p.id != id);
    saveAndRender();
}

window.onload = render;
