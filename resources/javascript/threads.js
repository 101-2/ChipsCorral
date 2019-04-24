function getPosts() {
  var posts = "";
  axios
    .get("https://cub-forum.herokuapp.com/posts")
    .then(obj => {
      for (var i = 0; i < obj.data.length; i++) {
        posts += `
        <div class="card card-format">
          <div class="card-body">
            <h5 class="card-title">${obj.data[i].title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${
              obj.data[i].username
            } - ${obj.data[i].date_posted}</h6>
            <p class="card-text">${obj.data[i].content}</p>
          </div>
        </div>
        `;
      }
      document.getElementById("post-container").innerHTML = posts;
    })
    .catch(err => {
      console.error(err);
    });
}

function createPost() {
  var params = {
    title: document.getElementById("titleInput").value,
    content: document.getElementById("contentInput").value
  };

  axios
    .post("https://cub-forum.herokuapp.com/post", params)
    .then(data => {
      console.log(data);
      location.reload();
    })
    .catch(err => {
      console.log(err);
    });
}
