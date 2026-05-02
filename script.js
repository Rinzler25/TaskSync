let tipoActual = ''; 

// 1. ABRIR MODAL
function abrirModal(tipo) {
    tipoActual = tipo;
    const modal = document.getElementById("modalGenerico");
    const titulo = document.getElementById("tituloModal");
    titulo.innerText = tipo === 'proyecto' ? "Nuevo Proyecto" : "Nueva Tarea";
    // Configurar el botón de guardar
    document.getElementById("btnGuardar").onclick = guardarDatos;
    modal.style.display = "flex";
}
// 2. CERRAR MODAL (Corregida para apuntar al ID correcto)
function cerrarModal() {
    document.getElementById("modalGenerico").style.display = "none";
}
// 3. GUARDAR DATOS
function guardarDatos() {
    const nombre = document.getElementById("nombreEntrada").value;
    const entrega = document.getElementById("fechaEntregaEntrada").value;
    const inicio = new Date().toISOString().split('T')[0];
    if (!nombre || !entrega) return alert("Completa los campos");
    // Guardar el objeto en un array para el almacenamiento
    const nuevoItem = { nombre, inicio, entrega, tipo: tipoActual };
    if (tipoActual === 'proyecto') {
        crearTarjetaProyecto(nombre, inicio, entrega);
    } else {
        crearTarjetaTarea(nombre, inicio, entrega);
    }
    // --- NUEVO: Guardar en la memoria del navegador ---
    salvarEnLocalStorage(nuevoItem);
    document.getElementById("nombreEntrada").value = "";
    cerrarModal();
}

// 4. CREAR TARJETAS
function crearTarjetaProyecto(nombre, inicio, entrega) {
    const contenedor = document.getElementById("project-grid");
    const idBarra = "bar-" + Date.now();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <div class="card-body">
            <h3>${nombre}</h3>
            <p><small>Entrega: ${entrega}</small></p>
            <div class="progress-container"><div id="${idBarra}" class="progress-bar"></div></div>
            <div class="card-footer">
                <button class="btn-done" onclick="finishProject(this)">Finalizar Proyecto</button>
            </div>
        </div>
    `;
    contenedor.appendChild(div);
    actualizarUnaBarra(idBarra, inicio, entrega);
}

function crearTarjetaTarea(nombre, inicio, entrega) {
    const contenedor = document.getElementById("quick-tasks-container");
    const idBarra = "bar-" + Date.now();
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
        <div class="card-body">
            <div style="display:flex; justify-content: space-between; align-items: center;">
                <h4 style="margin:0">${nombre}</h4>
                <input type="checkbox" onclick="finalizarTarea(this)" style="width:18px; height:18px;">
            </div>
            <p style="font-size:12px; margin: 5px 0;">Límite: ${entrega}</p>
            <div class="progress-container"><div id="${idBarra}" class="progress-bar"></div></div>
        </div>
    `;
    contenedor.appendChild(div);
    actualizarUnaBarra(idBarra, inicio, entrega);
}

// 5. LÓGICA DE BARRAS (Tu lógica de días restantes)
function actualizarUnaBarra(id, inicio, entrega) {
    const hoy = new Date();
    const fInicio = new Date(inicio);
    const fEntrega = new Date(entrega);
    const diferenciaMilisegundos = fEntrega - hoy;
    const diasRestantes = diferenciaMilisegundos / (1000 * 60 * 60 * 24);
    const porcentaje = ((hoy - fInicio) / (fEntrega - fInicio)) * 100;
    const pEfectivo = Math.min(Math.max(porcentaje, 0), 100);
    const barra = document.getElementById(id);
    if(barra) {
        barra.style.width = pEfectivo + "%";
        if (diasRestantes <= 2) barra.className = "progress-bar rojo";
        else if (diasRestantes <= 5) barra.className = "progress-bar amarillo";
        else barra.className = "progress-bar verde";
    }
}
// 6. FINALIZAR (Mover al historial)
function finishProject(boton) {
    const tarjeta = boton.closest('.card');
    document.getElementById('history-grid').appendChild(tarjeta);
    alert("Proyecto archivado.");
}
function finalizarTarea(checkbox) {
    if (checkbox.checked) {
        const tarjeta = checkbox.closest('.card');
        setTimeout(() => {
            document.getElementById('history-grid').appendChild(tarjeta);
            tarjeta.style.opacity = "0.7";
        }, 500);
    }
}
// 7. NAVEGACIÓN
function mostrarSeccion(seccion) {
    document.getElementById('vista-dashboard').style.display = seccion === 'dashboard' ? 'block' : 'none';
    document.getElementById('vista-historial').style.display = seccion === 'historial' ? 'block' : 'none';
}
function guardarEnNubeLocal() {
    const proyectos = [];
    const tareas = [];
    // Extraemos datos de las tarjetas de proyectos
    document.querySelectorAll("#project-grid .card").forEach(tarjeta => {
        proyectos.push({
            nombre: tarjeta.querySelector("h3").innerText,
            entrega: tarjeta.querySelector("small").innerText.replace("Entrega: ", ""),
            tipo: 'proyecto'
        });
    });
    // Extraemos datos de las tarjetas de tareas
    document.querySelectorAll("#quick-tasks-container .card").forEach(tarjeta => {
        tareas.push({
            nombre: tarjeta.querySelector("h4").innerText,
            entrega: tarjeta.querySelector("p").innerText.replace("Límite: ", ""),
            tipo: 'tarea'
        });
    });
    // Guardamos ambos arreglos en el almacenamiento del navegador
    localStorage.setItem("TaskSync_Proyectos", JSON.stringify(proyectos));
    localStorage.setItem("TaskSync_Tareas", JSON.stringify(tareas));
}
window.onload = function() {
    const proyectosGuardados = JSON.parse(localStorage.getItem("TaskSync_Proyectos")) || [];
    const tareasGuardadas = JSON.parse(localStorage.getItem("TaskSync_Tareas")) || [];
    proyectosGuardados.forEach(p => crearTarjetaProyecto(p.nombre, new Date().toISOString().split('T')[0], p.entrega));
    tareasGuardadas.forEach(t => crearTarjetaTarea(t.nombre, new Date().toISOString().split('T')[0], t.entrega));
};
// Función para guardar
function salvarEnLocalStorage(item) {
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    datos.push(item);
    localStorage.setItem("TaskSyncData", JSON.stringify(datos));
}

// Función para cargar al abrir la app
function cargarDatosGuardados() {
    let datos = JSON.parse(localStorage.getItem("TaskSyncData")) || [];
    
    datos.forEach(item => {
        if (item.tipo === 'proyecto') {
            crearTarjetaProyecto(item.nombre, item.inicio, item.entrega);
        } else {
            crearTarjetaTarea(item.nombre, item.inicio, item.entrega);
        }
    });
}

// IMPORTANTE: Llamar a la carga cuando abra la página
window.onload = cargarDatosGuardados;