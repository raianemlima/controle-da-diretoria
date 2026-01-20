const addBtn = document.getElementById('addBtn');
let processes = JSON.parse(localStorage.getItem('vara_aracati_db')) || [];

addBtn.addEventListener('click', () => {
    const num = document.getElementById('procNum').value;
    const task = document.getElementById('procTask').value;
    const date = document.getElementById('procDate').value;

    if (!num || !date) return alert("Preencha o número e a data da última movimentação.");

    const newProc = {
        id: Date.now(),
        num,
        task,
        date,
        column: "todo"
    };

    processes.push(newProc);
    saveAndRender();
    clearInputs();
});

function calculateDays(dateString) {
    const lastMov = new Date(dateString);
    const today = new Date();
    const diff = Math.floor((today - lastMov) / (1000 * 60 * 60 * 24));
    return diff;
}

function saveAndRender() {
    localStorage.setItem('vara_aracati_db', JSON.stringify(processes));
    render();
}

function render() {
    const lists = ['todo', 'siper', 'urgent', 'done'];
    lists.forEach(id => document.getElementById(id).innerHTML = '');

    processes.forEach(p => {
        const days = calculateDays(p.date);
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.id = p.id;
        
        // Se o processo está parado há mais de 300 dias (ex: relatório de Jan/2026 )
        if (days > 300) card.classList.add('ancient');
        if (p.task.toLowerCase().includes('pericia') || p.task.toLowerCase().includes('siper')) {
            card.classList.add('siper-task');
        }

        card.innerHTML = `
            <span class="delete-btn" onclick="removeProc(${p.id})">×</span>
            <span class="title">${p.num}</span>
            <span class="desc">${p.task}</span>
            <span class="days">Parado há ${days} dias</span>
        `;

        // Lógica de destino automático se for muito antigo
        let targetCol = p.column;
        if (days > 300 && p.column !== 'done') targetCol = 'urgent';

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
                const newCol = evt.to.id;
                const index = processes.findIndex(p => p.id == id);
                processes[index].column = newCol;
                localStorage.setItem('vara_aracati_db', JSON.stringify(processes));
            }
        });
    });
}

function removeProc(id) {
    processes = processes.filter(p => p.id != id);
    saveAndRender();
}

function clearInputs() {
    document.getElementById('procNum').value = '';
    document.getElementById('procTask').value = '';
}

window.onload = render;
