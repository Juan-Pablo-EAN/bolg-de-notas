"strict mode";

const añadir = document.querySelector(".add1");
const save = document.querySelector(".save");
const tituloModal = document.querySelector(".tituloModal");
const fechaModal = document.querySelector(".fecha");
const nota = document.getElementById("exampleTextarea");
const blog = document.querySelector(".accordion");

var idModify;

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
        save.classList.remove("modificar");
        // location.reload();
        leerObjetos();
    });
}

const obtenerObjeto = id => {
    let db = getObjeto("readonly");
    let objeto = db[0].get(id);
    objeto.addEventListener("success", () => {
        tituloModal.textContent = objeto.result.titulo;
        fechaModal.textContent = objeto.result.fecha;
        nota.textContent = objeto.result.texto;
    });
}

const leerObjetos = () => {
    blog.innerHTML = "";
    let db = getObjeto("readonly");
    let cursor = db[0].openCursor();
    cursor.addEventListener("success", () => {
        if (cursor.result) {
            crearElementos(cursor.result.key, cursor.result.value.titulo, cursor.result.value.texto);
            cursor.result.continue();
        } else {
            console.log("Datos leídos");
        }
    });
}

const eliminarObjeto = key => {
    let db = getObjeto("readwrite");
    db[0].delete(key);
    db[1].addEventListener("complete", () => {
        console.log("Nota eliminada exitosamente");
        // location.reload();
        leerObjetos();
    });
}

save.addEventListener("click", () => {
    console.log(save.classList[save.classList.length - 1]);
    if (save.classList[save.classList.length - 1] == "modificar") {
        let objeto = {
            id: `${fechaModal.textContent}`,
            titulo: `${tituloModal.textContent}`,
            fecha: `${fechaModal.textContent}`,
            texto: `${nota.value}`
        }
        modificarObjeto(objeto, idModify);
    } else {
        let fecha = new Date;
        let objeto = {
            id: `${fecha.getMilliseconds() + 77}`,
            titulo: `${tituloModal.textContent}`,
            fecha: `${definirFecha()}`,
            texto: `${nota.value}`
        }
        addObjeto(objeto);
        crearElementos(objeto.id, objeto.titulo, objeto.texto);
    }
});

const definirFecha = () => {
    let date = new Date;
    let dia = date.getDate();
    let mes = date.getMonth();
    let año = date.getFullYear();
    let hora = date.getHours();
    let min = date.getMinutes();

    return `${ponerCeros(dia)}/${ponerCeros(mes + 1)}/${año} - ${hora}:${ponerCeros(min)}`;
}

const crearElementos = (id, titulo, texto) => {
    let item = `
    <div class="accordion-item">
        <h2 class="accordion-header" id="heading${id}">
            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
            data-bs-target="#collapse${id}" aria-expanded="false" aria-controls="collapse${id}">
                ${titulo}
            </button>
        </h2>
    <div id="collapse${id}" class="accordion-collapse collapse" aria-labelledby="heading${id}"
    data-bs-parent="#accordionExample" style="">
        <div class="accordion-body">
        ${texto}
        </div>
        <div class="btn-group" role="group" aria-label="Basic mixed styles example">
        <button onclick="eliminarObjeto(${id})" type="button" class="btn btn-warning">Eliminar</button>
        <button onclick="editarOb(${id})" type="button" class="btn btn-success">Editar</button>
        </div>
    </div>  
    </div>
    `;
    blog.innerHTML += item;
}

const ponerCeros = n => {
    (n < 10) ? n = `0${n}`
        : n;
    return n;
}

const editarOb = (id) => {
    save.classList.add("modificar");
    idModify = id;
    añadir.click();
    obtenerObjeto(id);
}