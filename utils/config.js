//manejo variables de entorno
require('dotenv').config()

const PORT = process.env.PORT

//selecciona la base de datos segun el modo, yo uso la misma para no crear otra
const MONGODB_URI = process.env.NODE_ENV === 'test' 
  ? process.env.TEST_MONGODB_URI
  : process.env.MONGODB_URI

module.exports = {
  MONGODB_URI,
  PORT
}