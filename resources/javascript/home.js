function createThread() {
  if (!checkURL()) {
    window.alert("URL does not match requirements");
    return;
  }
  var params = {
    title: document.getElementById("titleInput").value,
    about: document.getElementById("descriptionInput").value,
    public: document.getElementById("publicId").checked,
    url: document.getElementById("urlInput").value
  };

  axios
    .post("/thread", params)
    .then(data => {
      console.log(data);
    })
    .catch(err => {
      console.log(err);
    });
}

function checkURL() {
  var urlRegex = RegExp("[A-Za-z0-9-_]+");
  if (!urlRegex.test(document.getElementById("urlInput").value)) {
    return false;
  }
  return true;
}
