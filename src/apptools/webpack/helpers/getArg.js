export default function getArg(key) {
  var index = process.argv.indexOf(key)
  var next = process.argv[index + 1]
  return (index < 0) ? null : (!next || next[0] === '-') ? true : next
}

export let debug = getArg('--debug') || getArg('-dp') || getArg('-pd') || getArg('-d') || getArg('--d')
export let production = getArg('--prod') || getArg('--production') || getArg('-p')
export let loadappcore = getArg('--all') || getArg('-all') || getArg('-a') || getArg('--a')
export let dist = getArg('--dist') || getArg('-dist')
