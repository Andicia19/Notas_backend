//al usar esto en parte2 asi como este se genera un error ya que tiene diferente origen
//orgebbn: Mimso protocolo (https), puerto(3001) y host(url)
//por lo tanto se debe instalar npm install cors para
//permitir solicitudes de otros orígenes utilizando el middleware cors de Node.

//importa el módulo de servidor web integrado de Node
//import http from 'http' Es lo mismo
// const http = require('http')
//se usa express envez de http
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

let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
  ]

//El valor application/json en la cabecera Content-Type informa al receptor que los datos están en formato JSON. 
//El array notes se transforma en un string con formato JSON con el método JSON.stringify(notes). 
//Esto es necesario ya que el metodo response.end() espera un string o un buffer para enviar como el cuerpo de la respuesta.
// Esto es con http
// const app = http.createServer((request, response) => {
//     response.writeHead(200, { 'Content-Type': 'application/json' })
//     response.end(JSON.stringify(notes))
// })


//El primer parámetro request contiene toda la información de la solicitud HTTP y el segundo parámetro response
//se utiliza para definir cómo se responde a la solicitud.
app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  const note = notes.find(note => note.id === id)
  //Para que cuando se manda un id que no existe responda con 404
  if (note) {
    response.json(note)
  } else {
    //Se puede personalzar el mensaje de error
    response.statusMessage = "Note not exist"
    response.status(404).end()
  }
})

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})


app.get('/api/notes', (request, response) => {
  response.json(notes)
})
//Para eliminar un recurso
app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)
//Si la eliminación del recurso es exitosa, lo que significa que la nota existe y se elimina, 
//respondemos a la solicitud con el código de estado 204 no content y no devolvemos datos con la respuesta.
  response.status(204).end()
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0
  return maxId + 1
}
//agregar nueva nota
app.post('/api/notes', (request, response) => {
  const body = request.body
//el contenido no puede estar vacio
  if (!body.content) {
    return response.status(400).json({ 
      error: 'content missing' 
    })
  }

  const note = {
    content: body.content,
    important: Boolean(body.important) || false,
    id: generateId(),
  }

  notes = notes.concat(note)

  response.json(note)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

//Agreguemos el siguiente middleware después de nuestras rutas, 
//que se usa para capturar solicitudes realizadas a rutas inexistentes.
app.use(unknownEndpoint)
//Para subir la aplicacion con Fly.io o render se necesita poner esto
const PORT = process.env.PORT || 3001
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