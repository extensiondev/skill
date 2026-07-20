/**
 * Extension.js content_script contract: the framework imports this module and
 * calls the default export once on injection; the returned function cleans up
 * on HMR teardown and extension reload.
 */
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
