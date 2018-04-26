import { init as initApm } from '../../..'
var createApmBase = require('../e2e')
var apm = createApmBase({
  serviceName: 'manual-timing',
  hasRouterLibrary: true,
  sendNavigationTimingTransaction: false,
  operationMode: 'manual'
})

var transaction = apm.startTransaction('transaction-name', 'transaction-type')
transaction.addTask('load-event')
window.addEventListener('load', function () {
  setTimeout(() => {
    transaction.addNavigationTimingMarks()
    transaction.removeTask('load-event')
  })
})

var span = transaction.startSpan('span-name', 'span-type')

var appEl = document.getElementById('app')
var testEl = document.createElement('h2')
testEl.setAttribute('id', 'test-element')
testEl.innerHTML = 'Passed'
appEl.appendChild(testEl)

span.end()

function generateError () {
  throw new Error('timeout test error with a secret')
}

setTimeout(function () {
  try {
    generateError()
  } catch (e) {
    apm.captureError(e)
  }
}, 100)

var url = '/test/e2e/react/data.json?test=hamid'
var httpSpan = transaction.startSpan('FETCH ' + url, 'http')
fetch(url)
  .then((resp) => {
    if (!resp.ok) {
      apm.captureError(new Error(`fetch failed with status ${resp.status} ${resp.statusText}`))
    }
    httpSpan.end()
  })
