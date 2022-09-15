export function injectScript(url) {
  if (document.querySelector(`script[src="${url}"]`))
    return true

  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.type = 'text/javascript'
    s.src = url
    s.onload = resolve
    s.onerror = reject
    document.body.appendChild(s)
  })
}
