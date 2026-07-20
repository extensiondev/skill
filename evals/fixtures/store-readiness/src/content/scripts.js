export default function initial() {
  const highlight = (event) => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    document.body.dataset.quoteKeeperSelection = 'true'
  }
  document.addEventListener('mouseup', highlight)

  return () => {
    document.removeEventListener('mouseup', highlight)
    delete document.body.dataset.quoteKeeperSelection
  }
}
