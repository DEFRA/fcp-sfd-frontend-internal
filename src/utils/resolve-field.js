export const resolveField = ({ current, original, fallback, showSuccess }) => {
  return original && !showSuccess ? original : (current || fallback || '')
}
