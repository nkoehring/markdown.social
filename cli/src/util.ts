export function debugMsg(message: string, line = -1, severity?: Severity): DebugMessage {
  return { message, line, severity: severity ?? 'debug' }
}
export function infoMsg(msg: string, line?: number) {
  return debugMsg(msg, line, 'info')
}
export function warnMsg(msg: string, line?: number) {
  return debugMsg(msg, line, 'warning')
}
export function errMsg(msg: string, line?: number) {
  return debugMsg(msg, line, 'error')
}

/// checks if given string is of format YYYY-MM-DDTHH:MM:SS+TZ
export function isRfc3339Date(s: string): s is Rfc3339Date {
  const match = s.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})T([0-9]{2}):([0-9]{2}):([0-9]{2})(Z|[\+-]?[0-9]{2}:[0-9]{2})$/)

  return !!match
}
