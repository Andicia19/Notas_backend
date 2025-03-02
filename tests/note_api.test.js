const { test, after, beforeEach } = require("node:test");
const Note = require("../models/note");
const mongoose = require("mongoose");
const supertest = require("supertest");
const assert = require("node:assert");
const helper = require("./test_helper");
const app = require("../app");

//La prueba importa la aplicación Express del módulo app.js y la envuelve con la función supertest en un
//objeto llamado superagent. Este objeto se asigna a la variable api y las pruebas pueden usarlo para realizar
//solicitudes HTTP al backend.
const api = supertest(app);

// const initialNotes = [
//     {
//       content: 'HTML is easy',
//       important: false,
//     },
//     {
//       content: 'Browser can execute only JavaScript',
//       important: true,
//     },
//   ]

//Se hace antes de cada prueba
beforeEach(async () => {
  //await Note.deleteMany({});
  ////let noteObject = new Note(initialNotes[0])
  //let noteObject = new Note(helper.initialNotes[0]);
  //await noteObject.save();
  //// noteObject = new Note(initialNotes[1])
  //noteObject = new Note(helper.initialNotes[1]);
  //await noteObject.save();

  //El problema es que cada iteración del bucle forEach genera su propia operación asíncrona, y
  //beforeEach no esperará a que terminen de ejecutarse. En otras palabras, los comandos await definidos
  //dentro del bucle forEach no están en la función beforeEach, sino en funciones separadas que beforeEach no esperará.

  //   await Note.deleteMany({});
  //   console.log("cleared");

  //   helper.initialNotes.forEach(async (note) => {
  //     let noteObject = new Note(note);
  //     await noteObject.save();
  //     console.log("saved");
  //   });
  //   console.log("done");

  //Una forma de arreglar esto es esperar a que todas las operaciones asíncronas terminen de ejecutarse con el método Promise.all:
  await Note.deleteMany({});

  const noteObjects = helper.initialNotes.map((note) => new Note(note));
  const promiseArray = noteObjects.map((note) => note.save());
  //El método Promise.all se puede utilizar para transformar una serie de promesas en una única promesa,
  // que se cumplirá una vez que se resuelva cada promesa en el array que se le pasa como argumento.
  // La última línea de código await Promise.all(promiseArray) espera a que finalice cada promesa de guardar una nota,
  // lo que significa que la base de datos se ha inicializado.
  await Promise.all(promiseArray);

  //Promise.all ejecuta las promesas que recibe en paralelo. Si las promesas deben ejecutarse en un orden particular,
  //esto será problemático. En situaciones como esta, las operaciones se pueden ejecutar dentro de un for...of,
  // que garantiza un orden de ejecución especifico.
  //beforeEach(async () => {
  //   await Note.deleteMany({})

  //   for (let note of helper.initialNotes) {
  //     let noteObject = new Note(note)
  //     await noteObject.save()
  //   }
  // })
});
//Nuestra prueba realiza una solicitud HTTP GET a la URL api/notes y verifica que se responda a la solicitud
// con el código de estado 200. La prueba también verifica que el encabezado Content-Type se establece
// en application/json, lo que indica que los datos están en el formato deseado.
//Se usa only para especificar que pruebas se van a ejecutar junto con el comando npm test -- --test-only
test.only("notes are returned as json", async () => {
  await api
    .get("/api/notes")
    .expect(200)
    //El valor lo definimos como una expresión regular o en palabras cortas: regex. Las expresiones regulares en
    //JavaScript inician y finalizan con un slash /. Dado que la cadena deseada application/json también contiene
    //el mismo slash en el medio, entonces se precede por un \ de tal manera que no se interprete como un caracter de terminación.
    //En principio, el test podría también ser definido simplemente como una cadena:
    //.expect('Content-Type', 'application/json')
    .expect("Content-Type", /application\/json/);
});

test.only("there are two notes", async () => {
  const response = await api.get("/api/notes");

  // assert.strictEqual(response.body.length, initialNotes.length)
  assert.strictEqual(response.body.length, helper.initialNotes.length);
});

test("the first note is about HTTP methods", async () => {
  const response = await api.get("/api/notes");

  const contents = response.body.map((e) => e.content);
  // assert.strictEqual(contents.includes('HTML is easy'), true)
  assert(contents.includes("HTML is easy"));
});

test("a valid note can be added ", async () => {
  const newNote = {
    content: "async/await simplifies making async calls",
    important: true,
  };

  await api
    .post("/api/notes")
    .send(newNote)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  //const response = await api.get("/api/notes");

  //const contents = response.body.map((r) => r.content);

  const notesAtEnd = await helper.notesInDb();
  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length + 1);
  // assert.strictEqual(response.body.length, initialNotes.length + 1)

  const contents = notesAtEnd.map((n) => n.content);
  assert(contents.includes("async/await simplifies making async calls"));
});

test("note without content is not added", async () => {
  const newNote = {
    important: true,
  };

  await api.post("/api/notes").send(newNote).expect(400);

  const notesAtEnd = await helper.notesInDb();

  //const response = await api.get("/api/notes");

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length);
});

test("a specific note can be viewed", async () => {
  const notesAtStart = await helper.notesInDb();

  const noteToView = notesAtStart[0];

  const resultNote = await api
    .get(`/api/notes/${noteToView.id}`)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  assert.deepStrictEqual(resultNote.body, noteToView);
});

test("a note can be deleted", async () => {
  const notesAtStart = await helper.notesInDb();
  const noteToDelete = notesAtStart[0];

  await api.delete(`/api/notes/${noteToDelete.id}`).expect(204);

  const notesAtEnd = await helper.notesInDb();

  const contents = notesAtEnd.map((r) => r.content);
  assert(!contents.includes(noteToDelete.content));

  assert.strictEqual(notesAtEnd.length, helper.initialNotes.length - 1);
});

//Una vez que todas las pruebas hayan terminado de ejecutarse, tenemos que cerrar la conexión
//a la base de datos utilizada por Mongoose. Esto se puede lograr fácilmente con el método after
after(async () => {
  await mongoose.connection.close();
});
