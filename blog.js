"strict mode";

window.addEventListener("load", () => {
    if (location.href.includes("access")) {
        iniciarBlog();
    } else {
        document.querySelector(".contenedor").innerHTML = `<h2>No tienes permiso para visualizar este blog de notas</h2>`;
    }
});

const iniciarBlog = () => {

}

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

var visible = false;
var visibleCheck = false;

const eventoAbrir = () => {
    fondoModal.style.display = "flex";
    visible = true;
}

const eventoCerrar = () => {
    fondoModal.style.display = "none";
    visible = false;
    blog.innerHTML = "";
    leerObjetos();
}

const eventoSelect = () => {
    if (visible) {
        for (let i = 0; i < divCheck.length; i++) {
            divCheck[i].style.display = "none";
        }
        visible = false;
        eliminar.style.display = "none";
    } else {
        for (let i = 0; i < divCheck.length; i++) {
            divCheck[i].style.display = "flex";
        }
        visible = true;
        eliminar.style.display = "block";
    }
}

añadir.addEventListener("click", () => {
    eventoAbrir();
    nota.value = "";
    tituloModal.textContent = "Titulo";
    fechaModal.textContent = "";
});

cerrarModal.addEventListener("click", () => eventoCerrar());
descartar.addEventListener("click", () => eventoCerrar());
seleccionar.addEventListener("click", () => {
    eventoSelect();
});

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

const leerNota = async id => {
    let db = getObjeto("readonly");
    let cursor = db[0].openCursor();
    cursor.addEventListener("success", () => {
        if (cursor.result) {
            if (cursor.result.key == id) {
                fechaModal.textContent = cursor.result.value.fecha;
                nota.value = cursor.result.value.texto;
            }
            cursor.result.continue();
        } else {
            console.log("Nota leída");
        }
    });
}

const eliminarObjeto = key => {
    let db = getObjeto("readwrite");
    db[0].delete(key);
    db[1].addEventListener("complete", () => {
        console.log("Nota eliminada exitosamente");
    });
}

save.addEventListener("click", () => nuevaNota());

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

    (dia < 10) ? dia = `0${dia}`
        : dia;
    (mes < 10) ? mes = `0${(mes + 1)}`
        : mes;

    return `${dia}/${mes}/${año} - ${hora}:${min}`;
}

console.log(definirFecha());

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

    check.addEventListener("change", () => {
        console.log(check.value);
        if (check.value) {
            checkDelete.push(id);
        } else {
            let i = checkDelete.indexOf(id);
            if (i !== -1) {
                checkDelete.splice(i, 1);
            }
        }
    });
}

var checkDelete = [];

const abrirModal = async (id, title) => {
    eventoAbrir();
    leerNota(id);
    tituloModal.textContent = title;
}

eliminar.addEventListener("click", () => {
    if(checkDelete.length > 0){
        checkDelete.map(d => {
            eliminarObjeto(d);
        });
    }
    blog.innerHTML = "";
    leerObjetos();
    eliminar.style.display = "none";
});