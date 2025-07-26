// Simple utility functions
export function calculateFrequencies(allResponses, question) {
  const frequencies = {}
  let totalResponses = 0
  
  allResponses.forEach(response => {
    if (response && response[question]) {
      const answer = String(response[question]).trim()
      if (answer) {
        frequencies[answer] = (frequencies[answer] || 0) + 1
        totalResponses++
      }
    }
  })
  
  return { frequencies, totalResponses }
}

export function getResponseIdFromUrl() {
  if (typeof window === 'undefined') return null
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('responseId')
}