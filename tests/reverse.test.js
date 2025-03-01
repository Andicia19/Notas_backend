//La prueba define la palabra clave test y la librería assert, que es utilizada por las pruebas para verificar los resultados de las funciones bajo prueba
const { test } = require('node:test')
const assert = require('node:assert')

//llama la funcion a ser probada
const reverse = require('../utils/for_testing').reverse

test('reverse of a', () => {
  const result = reverse('a')

  assert.strictEqual(result, 'a')
})

test('reverse of react', () => {
  const result = reverse('react')

  assert.strictEqual(result, 'tcaer')
})

test('reverse of saippuakauppias', () => {
  const result = reverse('saippuakauppias')

  assert.strictEqual(result, 'saippuakauppias')
})