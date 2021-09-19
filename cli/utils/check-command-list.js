module.exports = (initCommand, commandList) => {
  if (!commandList) return [new Error('No commands available')]
  if (!initCommand) return [null, null]

  const command = commandList[`${initCommand}`]

  if (!command) {
    return [new Error('Command not available')]
  }

  return [null, command]
}
