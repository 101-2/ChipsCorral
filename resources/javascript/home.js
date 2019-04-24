function createThread() {
  if (!checkURL()) {
    window.alert("URL does not match requirements");
    return;
  }
  var params = {
    title: document.getElementById("titleInput").value,
    about: document.getElementById("descriptionInput").value,
    public: document.getElementById("publicInput").checked,
    url: document.getElementById("urlInput").value
  };

  axios
    .post("/thread", params)
    .then(data => {
      console.log(data);
      location.reload();
    })
    .catch(err => {
      console.log(err);
    });
}

function checkURL() {
  var urlRegex = RegExp("([A-Za-z0-9-_]+)");
  if (!urlRegex.test(document.getElementById("urlInput").value)) {
    return false;
  }
  return true;
}

function loadThreads() {
  var threads = "";
  axios
    .get("/threads")
    .then(obj => {
      for (var i = 0; i < obj.data.length; i++) {
        threads += `
        <div class="card card-format">
          <a href="https://cub-forum.herokuapp.com/chip/${
            obj.data[i].thread_url
          }" class="btn btn-fix text-left">
            <div class="card-body">
              <h5 class="card-title">${obj.data[i].title}</h4>
              <h6 class="card-subtitle mb-2 text-muted">/chip/${
                obj.data[i].thread_url
              }</h6>
              <p class="card-text">${obj.data[i].about}</p>
            </div>
          </a>
        </div>
        `;
      }
      document.getElementById("thread-container").innerHTML = threads;
    })
    .catch(err => console.log(err));
}
