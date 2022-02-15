"strict mode";

const añadir = document.querySelector(".add1");
const seleccionar = document.querySelector(".select");
const eliminar = document.querySelector(".delete");
const fondoModal = document.querySelector(".fondoModal");
const save = document.querySelector(".save");
const descartar = document.querySelector(".descart");
const cerrarModal = document.querySelector(".cerrarModal");
const divCheck = document.getElementsByClassName("divCheck");
const tituloModal = document.querySelector(".tituloModal");
const fechaModal = document.querySelector(".fecha");
const nota = document.getElementById("nota");
const blog = document.querySelector(".blog");
const tituloId = document.getElementById("tituloId");
const all = document.querySelector(".all");

var visible = false;
var visibleCheck = false;
var checksHtml = [];
var checkDelete = [];

let IDBRequest = indexedDB.open("notesDB", 1);

IDBRequest.addEventListener("upgradeneeded", () => {
    let db = IDBRequest.result;
    db.createObjectStore("blogs", {
        autoIncrement: true
    });
    console.log("Base de datos 2 creada exitosamente");
});

IDBRequest.addEventListener("success", () => {
    console.log("Todo está correcto");
    leerObjetos();
});

IDBRequest.addEventListener("error", () => {
    console.warn("Error en la base de datos 2");
});

const getObjeto = modo => {
    let db = IDBRequest.result;
    let IDBTransaction = db.transaction("blogs", modo);
    let objectStore = IDBTransaction.objectStore("blogs");
    return [objectStore, IDBTransaction];
}

const addObjeto = objeto => {
    let db = getObjeto("readwrite");
    db[0].add(objeto);
    db[1].addEventListener("complete", () => {
        console.log("Nota guardada exitosamente");
    });
}

const modificarObjeto = (objeto, key) => {
    let db = getObjeto("readwrite");
    db[0].put(objeto, key);
    db[1].addEventListener("complete", () => {
        console.log("Elemento modificado exitosamente");
    });
}

const leerObjetos = () => {
    let db = getObjeto("readonly");
    let cursor = db[0].openCursor();
    cursor.addEventListener("success", () => {
        if (cursor.result) {
            crearElementos(cursor.result.key, cursor.result.value.titulo);
            cursor.result.continue();
        } else {
            console.log("Datos leídos");
        }
    })
}

const leerNota = id => {
    tituloId.className = `b${id}`;
    save.className = "modify";
    save.classList.add("btn");
    save.classList.add("btn-success");
    descartar.innerHTML = `Eliminar <i class="fas fa-times"></i>`;

    let db = getObjeto("readonly");
    let cursor = db[0].openCursor();
    cursor.addEventListener("success", () => {
        if (cursor.result) {
            if (cursor.result.key == id) {
                fechaModal.textContent = cursor.result.value.fecha;
                nota.value = cursor.result.value.texto;
            }
            cursor.result.continue();
        }
    });
}

const eventoAbrir = () => {
    fondoModal.style.display = "flex";
    visible = true;
    document.body.style.overflow = "hidden";
}

const eventoCerrar = () => {
    document.body.style.overflow = "scroll-y";
    fondoModal.style.display = "none";
    save.style.display = "block";
    save.className = "save";
    visible = false;
    blog.innerHTML = "";
    checksHtml = [];
    leerObjetos();
}

const eventoSelect = () => {
    if (visible) {
        for (let i = 0; i < divCheck.length; i++) {
            divCheck[i].style.display = "none";
        }
        visible = false;
        eliminar.style.display = "none";
        all.style.display = "none";
    } else {
        for (let i = 0; i < divCheck.length; i++) {
            divCheck[i].style.display = "flex";
        }
        visible = true;
        eliminar.style.display = "block";
        all.style.display = "block";
    }
}

const eventoAll = () => {
    console.log(checksHtml);
    checksHtml.map(ch => {
        ch.click();
    });
}

all.addEventListener("click", () => {
    eventoAll();
});

añadir.addEventListener("click", () => {
    save.className = "save";
    save.classList.add("btn");
    save.classList.add("btn-success");
    descartar.innerHTML = `Descartar <i class="fas fa-times"></i>`;
    eventoAbrir();
    nota.value = "";
    tituloModal.textContent = "Titulo";
    fechaModal.textContent = "";
});

cerrarModal.addEventListener("click", () => eventoCerrar());
seleccionar.addEventListener("click", () => {
    eventoSelect();
});

const eventoGuardar = (clase) => {
    if (clase == "save") {
        nuevaNota();
    } else if (clase == "modify") {

        let object = {
            titulo: `${tituloModal.textContent}`,
            fecha: `${fechaModal.textContent}`,
            texto: `${nota.value}`
        }

        let id = parseInt((tituloId.className).replace("b", ""));

        modificarObjeto(object, id);
        eventoCerrar();
    }
}

save.addEventListener("click", () => {
    eventoGuardar(save.className);
});

descartar.addEventListener("click", () => {
    if (save.className == "save") {
        save.classList.add("btn");
        save.classList.add("btn-success");
        eventoCerrar();
    } else if (save.className == "modify") {

        let id = parseInt((tituloId.className).replace("b", ""));

        let confirmar = confirm("¿Deseas eliminar esta nota?");

        if (confirmar) {
            eliminarObjeto(id);
            eventoCerrar();
        }
    }
});

const eliminarObjeto = key => {
    let db = getObjeto("readwrite");
    db[0].delete(key);
    db[1].addEventListener("complete", () => {
        console.log("Nota eliminada exitosamente");
    });
}

const nuevaNota = () => {
    let objeto = {
        titulo: `${tituloModal.textContent}`,
        fecha: `${definirFecha()}`,
        texto: `${nota.value}`
    }
    addObjeto(objeto);
    eventoCerrar();
}

const definirFecha = () => {
    let date = new Date;
    let dia = date.getDate();
    let mes = date.getMonth();
    let año = date.getFullYear();
    let hora = date.getHours();
    let min = date.getMinutes();

    return `${ponerCeros(dia)}/${ponerCeros(mes + 1)}/${año} - ${hora}:${ponerCeros(min)}`;
}

const ponerCeros = n => {
    (n < 10) ? n = `0${n}`
        : n;
    return n;
}

const crearElementos = (id, titulo) => {
    const note = document.createElement("DIV");
    const divTitulo = document.createElement("DIV");
    const divCheck = document.createElement("DIV");
    const h2 = document.createElement("H2");
    const check = document.createElement("INPUT");

    note.classList.add("note");
    divTitulo.classList.add("divTitulo");
    divCheck.classList.add("divCheck");
    check.setAttribute("type", "checkbox");
    check.classList.add("check");

    divCheck.appendChild(check);
    divTitulo.appendChild(h2);
    note.appendChild(divTitulo);
    note.appendChild(divCheck);

    blog.appendChild(note);

    h2.textContent = titulo;

    divTitulo.addEventListener("click", () => {
        abrirModal(id, titulo);
    });

    var checked = false;
    check.addEventListener("change", () => {
        if (checked === false) {
            checkDelete.push(id);
            checked = true;
        } else {
            let i = checkDelete.indexOf(id);
            if (i !== -1) {
                checkDelete.splice(i, 1);
            }
            checked = false;
        }
    });

    checksHtml.push(check);
}

const abrirModal = async (id, title) => {
    eventoAbrir();
    leerNota(id);
    tituloModal.textContent = title;
}

eliminar.addEventListener("click", () => {
    if (checkDelete.length >= 0) {
        checkDelete.map(d => {
            eliminarObjeto(d);
        });
        checkDelete = [];
        checksHtml = [];
        console.log(checkDelete);
        console.log(checksHtml);
    }

    blog.innerHTML = "";
    leerObjetos();
    eliminar.style.display = "none";
    all.style.display = "none";
});
