// Minimal jsx-dev-runtime stub for tests
// Exports compatible helpers used by compiled JSX implementations
exports.Fragment = Symbol.for('react.fragment')
exports.jsx = function(type, props, key){ return {$$typeof: Symbol.for('react.element'), type, props, key} }
exports.jsxs = exports.jsx
