// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// React 19 + @testing-library/react v16 compatibility workaround
// The issue is that @testing-library/react uses ReactDOMTestUtils.act which expects React.act to exist
// We provide a minimal implementation that works with React 19's rendering model
const React = require('react')

// Add a simple synchronous act implementation for React 19
// React 19 handles state updates synchronously in most cases, so we don't need to wait
if (!React.act) {
  React.act = (callback) => {
    const result = callback()
    // Return a resolved promise for async compatibility
    return Promise.resolve(result)
  }
}

// Also add to ReactDOM for legacy compatibility
const ReactDOM = require('react-dom')
if (!ReactDOM.act) {
  ReactDOM.act = React.act
}

// Suppress the deprecation warning
const originalError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ReactDOMTestUtils.act is deprecated')) {
    return
  }
  if (typeof args[0] === 'string' && args[0].includes('React.act is not a function')) {
    return
  }
  originalError.call(console, ...args)
}
