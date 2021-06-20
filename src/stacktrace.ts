// `barrier` invokes a function through a (hopefully) uniquely-named
// function, which then allows `get` to trim the stack trace to just
// seemingly start at the user's invoked function.

function barrier(action: <T = unknown, R = unknown>(args?: T) => R) {
  return eyy_pee_aye_hopefullyUnique_functionName_X7toUJgp(action);
}

function eyy_pee_aye_hopefullyUnique_functionName_X7toUJgp(
  action: <T = unknown, R = unknown>(args?: T) => R
) {
  return action();
}

const top = /.*\n.*\n.*\n/;
const bottom = /\n.*eyy_pee_aye_hopefullyUnique_functionName_X7toUJgp/;

function get(error: Error = Error()) {
  const save = Error.stackTraceLimit;
  Error.stackTraceLimit = Infinity;
  const stack = error.stack ?? '';
  Error.stackTraceLimit = save;
  return stack.replace(top, '').split(bottom, 2)[0];
}

export default { barrier, get };
