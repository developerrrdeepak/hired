const { spawn } = require('child_process')

// Start Firebase emulators for testing
const emulators = spawn('firebase', ['emulators:start', '--only', 'auth,firestore,storage'], {
  stdio: 'inherit',
  shell: true
})

emulators.on('close', (code) => {
  console.log(`Firebase emulators exited with code ${code}`)
})

process.on('SIGINT', () => {
  emulators.kill('SIGINT')
  process.exit()
})