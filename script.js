window.addEventListener('load', () => {
    cargarDatosGuardados();
    generarDiasCalendario();
});

function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(viewId);
    if(target) target.classList.add('active');
}

function abrirModal() {
    document.getElementById("modalGenerico").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalGenerico").style.display = "none";
}

function guardarDatos() {
    const nombre = document.getElementById("nombreEntrada").value;
    const entrega = document.getElementById("fechaEntregaEntrada").value;
    const tipo = document.getElementById("tipoEntrada").value;
    const inicio = new Date().toISOString().split('T')[0];

    if (!nombre || !entrega) return alert("Completa los campos obligatorios");

    const nuevoItem = { nombre, inicio, entrega, tipo, terminado: false };
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    datos.push(nuevoItem);
    localStorage.setItem("TaskSyncData", JSON.stringify(datos));

    // Resetear y cerrar
    document.getElementById("nombreEntrada").value = "";
    document.getElementById("fechaEntregaEntrada").value = "";
    cerrarModal();
    cargarDatosGuardados(); 
    generarDiasCalendario();
    showView('status-view');
}

function cargarDatosGuardados() {
    const contEstado = document.getElementById("active-projects-list");
    const contHistorial = document.getElementById("history-list");
    if (!contEstado || !contHistorial) return;

    contEstado.innerHTML = "";
    contHistorial.innerHTML = "";

    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    
    datos.forEach((item, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.setAttribute('data-tipo', item.tipo);

        div.innerHTML = `
            <div style="display:flex; justify-content: space-between; align-items:center">
                <h4 style="margin:0">${item.nombre} <small>(${item.tipo})</small></h4>
                ${!item.terminado ? `<input type="checkbox" onclick="finalizar(${index})">` : '✅'}
            </div>
            <p style="font-size:12px; color:gray; margin:5px 0">Entrega: ${item.entrega}</p>
            <div class="progress-container">
                <div id="bar-${index}" class="progress-fill"></div>
            </div>
        `;

        if (item.terminado) {
            div.style.opacity = "0.6";
            contHistorial.appendChild(div);
        } else {
            contEstado.appendChild(div);
        }
        
        setTimeout(() => setProgreso(`bar-${index}`, item.inicio, item.entrega), 100);
    });
}

function setProgreso(id, inicio, entrega) {
    const hoy = new Date();
    const fIn = new Date(inicio);
    const fOut = new Date(entrega);
    const pct = Math.min(Math.max(((hoy - fIn) / (fOut - fIn)) * 100, 0), 100);
    
    const bar = document.getElementById(id);
    if(bar) {
        bar.style.width = pct + "%";
        bar.style.backgroundColor = pct > 85 ? "#f56565" : pct > 50 ? "#ecc94b" : "#48bb78";
    }
}

function finalizar(index) {
    let datos = JSON.parse(localStorage.getItem("TaskSyncData"));
    datos[index].terminado = true;
    localStorage.setItem("TaskSyncData", JSON.stringify(datos));
    cargarDatosGuardados();
}

function filterContent(tipo) {
    showView('status-view');
    document.getElementById('status-title').innerText = "Mis " + tipo.charAt(0).toUpperCase() + tipo.slice(1) + "s";
    document.querySelectorAll('#active-projects-list .card').forEach(card => {
        card.style.display = card.getAttribute('data-tipo') === tipo ? "block" : "none";
    });
}

function generarDiasCalendario() {
    const grid = document.querySelector('.calendar-grid');
    if(!grid) return;
    grid.innerHTML = ""; 
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    for (let i = 1; i <= 31; i++) {
        const diaContenedor = document.createElement('div');
        diaContenedor.className = 'day';
        diaContenedor.innerHTML = `<span>${i}</span>`;
        const diaFormateado = `2026-05-${i.toString().padStart(2, '0')}`;
        const tareasDelDia = datos.filter(item => item.entrega === diaFormateado);
        tareasDelDia.forEach(tarea => {
            const marca = document.createElement('div');
            marca.className = tarea.tipo === 'proyecto' ? 'event-line rojo' : 'event-line verde';
            marca.title = tarea.nombre; 
            marca.style.width = "80%";
            marca.style.height = "4px";
            marca.style.marginTop = "2px";
            marca.style.borderRadius = "2px";
            marca.style.backgroundColor = tarea.tipo === 'proyecto' ? "#f56565" : "#48bb78";
            diaContenedor.appendChild(marca);
        });
        grid.appendChild(diaContenedor);
    }
}