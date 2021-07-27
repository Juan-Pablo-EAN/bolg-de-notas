"strict mode";

const pass = document.querySelector("#password");
const formulario = document.querySelector(".formulario");
const texto = document.querySelector(".textoLogin");
var existe = true;

pass.addEventListener("keydown", e => {
    if (e.key == "Enter") {
        if (pass.value.length != 0) {
            let pw = pass.value;
            if (existe === true) {
                leerObjeto(pw);
            } else {
                addObjeto({ passw: `${invertir(pw)}` });
                location.reload();
            }
        }
    }
});

let IDBRequest = indexedDB.open("logdb", 1);

IDBRequest.addEventListener("upgradeneeded", () => {
    let db = IDBRequest.result;
    db.createObjectStore("usuario", {
        autoIncrement: true
    });
    console.log("Base de datos y object store creado exitosamente");
    texto.textContent = "Escribe una contraseña para que despues puedas volver a ingresar";
    pass.setAttribute("placeholder", "Contraseña nueva");
    existe = false;
});

IDBRequest.addEventListener("success", () => {
    console.log("Todo salió correctamente");
});

IDBRequest.addEventListener("error", () => {
    console.warn("Error en la base de datos");
});

const getObjeto = modo => {
    let db = IDBRequest.result;
    let IDBTransaction = db.transaction("usuario", modo);
    let objectStore = IDBTransaction.objectStore("usuario");
    return [objectStore, IDBTransaction];
}

const addObjeto = objeto => {
    let db1 = getObjeto("readwrite");
    db1[0].add(objeto);
    db1[1].addEventListener("complete", () => {
        console.log("Objeto añadido exitosamente");
    });
}

const leerObjeto = passValue => {
    const db2 = getObjeto("readonly");
    let cursor = db2[0].openCursor();
    cursor.addEventListener("success", () => {
        if (cursor.result) {

            let p = invertir(cursor.result.value.passw).replace(/0/g, "");

            if (p === passValue) {
                window.open(`blog.html?access=${invertir(passValue)}`, "_self");
            } else {
                alert("Contraseña incorrecta");
            }
            cursor.result.continue();
        } else {
            console.log("Leido");
        }
    });
}

const invertir = psw => {
    let n;
    let x = psw.length;
    let wsp = "";

    while (x >= 0) {
        n = Math.round(Math.random()* (100 - 1) + 1);
        wsp = wsp + "0" + psw.charAt(x);
        x--;
    }
    return wsp;
}
