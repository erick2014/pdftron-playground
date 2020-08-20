// Make a POST request with XFDF string
var saveXfdfString = function (documentId, xfdfString) {
  return new Promise(function (resolve) {
    fetch(`http://localhost:8080/server/annotationHandler.js?documentId=${documentId}`, {
      method: 'POST',
      body: xfdfString
    }).then(function (response) {
      if (response.status === 200) {
        resolve();
      }
    });
  });
};

// Make a GET request to get XFDF string
var loadXfdfString = async (documentId) => {
  const response = await fetch(
    `http://localhost:8080/server/annotationHandler.js?documentId=${documentId}`, {
    method: 'GET'
  })
  if (response.status === 200) {
    const xfdfString = await response.text()
    return xfdfString
  }
};

module.exports = {
  saveXfdfString,
  loadXfdfString
}