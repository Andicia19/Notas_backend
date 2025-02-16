const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

//El código también asume que se le pasará la contraseña de las credenciales que creamos en MongoDB Atlas, como un parámetro de línea de comando
//se ejecuta con el comando node mongo.js yourPassword
const password = process.argv[2]

const url =
`mongodb+srv://Andres:${password}@cluster0.v8ssa.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`
// `mongodb+srv://Andres:${password}@cluster0.v8ssa.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
//arriba se agrego nombre de bases de datos como noteApp


mongoose.set('strictQuery',false)

mongoose.connect(url)

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})
//el primer parámetro de "Note" es el nombre singular del modelo. El nombre de la colección será el plural notes en minúsculas,
// porque la convención de Mongoose es nombrar automáticamente las colecciones como el plural (por ejemplo, notes)
// cuando el esquema se refiere a ellas en singular (por ejemplo, Note).
const Note = mongoose.model('Note', noteSchema)

//crea un nuevo objeto con la ayuda del modelo Note
const note = new Note({
    content: 'Mongoose makes things easy',
    important: true, 
})

//Los modelos son funciones constructoras que crean nuevos objetos JavaScript basados ​​en los parámetros proporcionados. 
//Dado que los objetos se crean con la función constructora del modelo, tienen todas las propiedades del modelo, 
//que incluyen métodos para guardar el objeto en la base de datos.


//Guardar el objeto en la base de datos ocurre con el método save, 
//que se puede proporcionar con un controlador de eventos con el método then
// note.save().then(result => {
//   console.log('note saved!')
//   console.log(result)
//   mongoose.connection.close()
// })

//Cuando el objeto se guarda en la base de datos, el controlador de eventos proporcionado a then se invoca.
//El controlador de eventos cierra la conexión de la base de datos con el comando mongoose.connection.close().
//Si la conexión no se cierra, el programa nunca terminará su ejecución.

//Obteniendo objetos de la base de datos
Note.find({}).then(result => {
    result.forEach(note => {
      console.log(note)
    })
    mongoose.connection.close()
  })

// Incluye solo las importantes
//   Note.find({ important: true }).then(result => {
//     // ...
//   })