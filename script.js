let tipoActual = ''; 

// --- 1. CARGA INICIAL ---
window.onload = function() {
    cargarDatosGuardados();
    generarDiasCalendario();
};

// --- 2. NAVEGACIÓN ---
function showView(viewId) {
    // Ocultar todas las vistas
    const views = document.querySelectorAll('.view');
    views.forEach(v => v.classList.remove('active'));

    // Mostrar la seleccionada
    const view = document.getElementById(viewId);
    if (view) {
        view.classList.add('active');
        window.scrollTo(0,0);
    }
}

// --- 3. GESTIÓN DEL MODAL ---
function abrirModal(tipo) {
    tipoActual = tipo;
    const modal = document.getElementById("modalGenerico");
    const titulo = document.getElementById("tituloModal");
    if (modal && titulo) {
        titulo.innerText = tipo === 'proyecto' ? "Nuevo Proyecto" : "Nueva Tarea";
        modal.style.display = "flex";
    }
}

function cerrarModal() {
    document.getElementById("modalGenerico").style.display = "none";
}

// --- 4. PERSISTENCIA Y DATOS ---
function guardarDatos() {
    const nombre = document.getElementById("nombreEntrada").value;
    const entrega = document.getElementById("fechaEntregaEntrada").value;
    const inicio = new Date().toISOString().split('T')[0];

    if (!nombre || !entrega) return alert("Por favor, completa los campos.");

    const nuevoItem = { 
        nombre, 
        inicio, 
        entrega, 
        tipo: tipoActual,
        terminado: false 
    };

    salvarEnLocalStorage(nuevoItem);
    
    // Limpiar y cerrar
    document.getElementById("nombreEntrada").value = "";
    cerrarModal();
    
    // Actualizar vistas y mandarnos a ver el progreso
    cargarDatosGuardados();
    showView('status-view');
}

function salvarEnLocalStorage(item) {
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    datos.push(item);
    localStorage.setItem("TaskSyncData", JSON.stringify(datos));
}

function cargarDatosGuardados() {
    const contenedorEstado = document.getElementById("active-projects-list");
    const contenedorHistorial = document.getElementById("history-list");
    
    if (!contenedorEstado || !contenedorHistorial) return;

    contenedorEstado.innerHTML = "";
    contenedorHistorial.innerHTML = "";

    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    
    datos.forEach((item, index) => {
        if (item.terminado) {
            renderizarTarjeta(item, index, contenedorHistorial);
        } else {
            renderizarTarjeta(item, index, contenedorEstado);
        }
    });
}

// --- 5. RENDERIZADO DE COMPONENTES ---
function renderizarTarjeta(item, index, contenedor) {
    const idBarra = "bar-" + index;
    const div = document.createElement("div");
    div.className = "card";
    
    // Si es del historial, le bajamos la opacidad
    if (item.terminado) div.style.opacity = "0.7";

    div.innerHTML = `
        <div class="card-body">
            <div style="display:flex; justify-content: space-between; align-items: center;">
                <h3 style="margin:0">${item.nombre}</h3>
                ${!item.terminado ? `<input type="checkbox" onclick="finalizarElemento(${index})">` : '✅'}
            </div>
            <p><small>Entrega: ${item.entrega} (${item.tipo})</small></p>
            <div class="progress-bar-container" style="background:#eee; height:8px; border-radius:4px; margin-top:10px;">
                <div id="${idBarra}" class="progress-fill" style="height:100%; border-radius:4px; width:0%; transition: width 0.5s;"></div>
            </div>
        </div>
    `;
    contenedor.appendChild(div);
    actualizarUnaBarra(idBarra, item.inicio, item.entrega);
}

function actualizarUnaBarra(id, inicio, entrega) {
    const hoy = new Date();
    const fInicio = new Date(inicio);
    const fEntrega = new Date(entrega);
    
    const porcentaje = ((hoy - fInicio) / (fEntrega - fInicio)) * 100;
    const pEfectivo = Math.min(Math.max(porcentaje, 0), 100);
    
    const barra = document.getElementById(id);
    if(barra) {
        barra.style.width = pEfectivo + "%";
        // Lógica de colores
        if (pEfectivo > 90) barra.style.backgroundColor = "#f56565"; // Rojo
        else if (pEfectivo > 50) barra.style.backgroundColor = "#ecc94b"; // Amarillo
        else barra.style.backgroundColor = "#48bb78"; // Verde
    }
}

function finalizarElemento(index) {
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    datos[index].terminado = true;
    localStorage.setItem("TaskSyncData", JSON.stringify(datos));
    cargarDatosGuardados();
}

// --- 6. CALENDARIO ---
function generarDiasCalendario() {
    const grid = document.querySelector('.calendar-grid');
    if(!grid) return;
    grid.innerHTML = ""; 

    for (let i = 1; i <= 31; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.innerText = i;

        // Marcamos el 15 de Mayo (ejemplo)
        if (i === 15) {
            day.classList.add('active-event');
            day.innerHTML += `<div class="event-line green" style="width:80%; height:4px; background:#48bb78; margin-top:4px;" onclick="alert('Proyecto: GymSync Pro')"></div>`;
        }
        grid.appendChild(day);
    }
}