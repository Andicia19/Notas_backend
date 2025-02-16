//al usar esto en parte2 asi como este se genera un error ya que tiene diferente origen
//origen: Mimso protocolo (https), puerto(3001) y host(url)
//por lo tanto se debe instalar npm install cors para
//permitir solicitudes de otros orígenes utilizando el middleware cors de Node.

//importa el módulo de servidor web integrado de Node
//import http from 'http' Es lo mismo
// const http = require('http')
//se usa express envez de http

//el orden de los middleware es inportante
//orden correcto
// app.use(express.static('build'))
// app.use(express.json())
// app.use(logger)
//app.post('/api/notes', (request, response) => {
  //const body = request.body
  // ...
//})
//const unknownEndpoint = (request, response) => {
  //response.status(404).send({ error: 'unknown endpoint' })
//
// controlador de solicitudes con endpoint desconocido
//app.use(unknownEndpoint)
//const errorHandler = (error, request, response, next) => {
  // ...
//}
// controlador de solicitudes que resulten en errores
//app.use(errorHandler)


//Llamar variables de entorno
require('dotenv').config()

const express = require('express')

const app = express()
//expres.json() para usar json parser
//El json-parser funciona para que tome los datos JSON de una solicitud, 
//los transforme en un objeto JavaScript y luego los adjunte a la propiedad body del objeto request
app.use(express.json())
//Middleware el jason_parser es un middleware tambien
const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

//para permitir recursos de otros origenes
const cors = require('cors')

app.use(cors())

app.use(requestLogger)

//Para hacer que Express muestre contenido estático, la página index.html y el JavaScript, etc., 
//necesitamos un middleware integrado de Express llamado static.
app.use(express.static('dist'))
//Ahora las solicitudes HTTP GET a la dirección www.serversaddress.com/index.html o 
//www.serversaddress.com mostrarán el frontend de React. Las solicitudes GET a la dirección
//www.serversaddress.com/api/notes serán manejadas por el código del backend.

// let notes = [
//     {
//       id: 1,
//       content: "HTML is easy",
//       important: true
//     },
//     {
//       id: 2,
//       content: "Browser can execute only JavaScript",
//       important: false
//     },
//     {
//       id: 3,
//       content: "GET and POST are the most important methods of HTTP protocol",
//       important: true
//     }
//   ]

//El valor application/json en la cabecera Content-Type informa al receptor que los datos están en formato JSON. 
//El array notes se transforma en un string con formato JSON con el método JSON.stringify(notes). 
//Esto es necesario ya que el metodo response.end() espera un string o un buffer para enviar como el cuerpo de la respuesta.
// Esto es con http
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })

// const mongoose = require('mongoose')

// if (process.argv.length<3) {
//   console.log('give password as argument')
//   process.exit(1)
// }

// const password = process.argv[2]

// const url =
// `mongodb+srv://Andres:${password}@cluster0.v8ssa.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

// mongoose.set('strictQuery',false)

// mongoose.connect(url)

// const noteSchema = new mongoose.Schema({
//   content: String,
//   important: Boolean,
// })

// //Para eliminar id y __v
// noteSchema.set('toJSON', {
//   transform: (document, returnedObject) => {
//     returnedObject.id = returnedObject._id.toString()
//     delete returnedObject._id
//     delete returnedObject.__v
//   }
// })

// const Note = mongoose.model('Note', noteSchema)
//importar modulo
const Note = require('./models/note')

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/notes', (request, response) => {
  //Sin mongo: response.json(notes)
  Note.find({}).then(notes => {
    response.json(notes)
  })  
})

//El primer parámetro request contiene toda la información de la solicitud HTTP y el segundo parámetro response
//se utiliza para definir cómo se responde a la solicitud.
app.get('/api/notes/:id', (request, response, next) => {
  const id = String(request.params.id)
  // Note.findById(id).then(note => {
  //   response.json(note)
  // })
  Note.findById(id)
  .then(note => {
    if (note) {
      response.json(note)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => next(error))
  // .catch(error => {
  //   console.log(error)
  //   response.status(400).send({error: "malformatted id"})
  // })
  // const id = Number(request.params.id)
  // const note = notes.find(note => note.id === id)
  // //Para que cuando se manda un id que no existe responda con 404
  // if (note) {
  //   response.json(note)
  // } else {
  //   //Se puede personalzar el mensaje de error
  //   response.statusMessage = "Note not exist"
  //   response.status(404).end()
  // }
})

//Para eliminar un recurso
app.delete('/api/notes/:id', (request, response, next) => {
  const id = String(request.params.id)
  Note.findByIdAndDelete(id)
  .then(result => {
    response.status(204).end()
  })
  .catch(error => next(error))
//   const id = Number(request.params.id)
//   notes = notes.filter(note => note.id !== id)
// //Si la eliminación del recurso es exitosa, lo que significa que la nota existe y se elimina, 
// //respondemos a la solicitud con el código de estado 204 no content y no devolvemos datos con la respuesta.
//   response.status(204).end()
})

// const generateId = () => {
//   const maxId = notes.length > 0
//     ? Math.max(...notes.map(n => n.id))
//     : 0
//   return maxId + 1
// }

//agregar nueva nota
app.post('/api/notes', (request, response, next) => {
  const body = request.body
//el contenido no puede estar vacio, ahora se pone con las reglas de validacion qu estan en note
  // if (!body.content) {
  //   return response.status(400).json({ 
  //     error: 'content missing' 
  //   })
  // }

  // const note = {
  //   content: body.content,
  //   important: Boolean(body.important) || false,
  //   id: generateId(),
  // }

  // notes = notes.concat(note)

  // response.json(note)

  // con mongo
  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))
})

//actualizar importancia
//Hay un detalle importante con respecto al uso del método findByIdAndUpdate. De forma predeterminada, 
//el parámetro updatedNote del controlador de eventos recibe el documento original sin las modificaciones. 
//Agregamos el parámetro opcional { new: true }, que hará que nuestro controlador de eventos sea llamado con el nuevo 
//documento modificado en lugar del original.
app.put('/api/notes/:id', (request, response, next) => {
  // const body = request.body
  //para aplicar la reglas de validacion al ahce una actualizacion s deb hacer esto
  const { content, important } = request.body
  const id = String(request.params.id)

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(id,//note, { new: true })
    { content, important},
    { new: true, runValidators: true, context: 'query'}
  )
    .then(updatedNote => {
      response.json(updatedNote)
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Agreguemos el siguiente middleware después de nuestras rutas, 
//que se usa para capturar solicitudes realizadas a rutas inexistentes.
app.use(unknownEndpoint)

//Cooontrolador de errores
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error:error.message })
  }

  next(error)
}

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

//Para subir la aplicacion con Fly.io o render se necesita poner esto
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

//Ahora estamos utilizando el puerto definido en la variable de entorno PORT o el puerto 3001 
//si la variable de entorno PORT no está definida. Fly.io y Render configuran el puerto de la 
//aplicación en función de esa variable de entorno.

// const PORT = 3001
// app.listen(PORT)
// console.log(`Server running on port ${PORT}`)


// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'text/plain' })
//     response.end('Hello World')
//   })

//El código usa el método createServer del módulo http para crear un nuevo servidor web. 
//Se registra un controlador de eventos en el servidor, que se llama cada vez que se realiza una 
//solicitud HTTP a la dirección del servidor http://localhost:3001.

//La solicitud se responde con el código de estado 200, con el cabecera Content-Type establecido en
//text/plain, y el contenido del sitio que se devolverá establecido en Hello World.

//Las últimas filas enlazan el servidor http asignado a la variable app, 
//para escuchar las solicitudes HTTP enviadas al puerto 3001: