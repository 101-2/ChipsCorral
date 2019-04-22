function getPosts() {
  var posts = "";
  axios
    .get("https://cub-forum.herokuapp.com/posts")
    .then(data => {
      console.log(data);
      for (var i = 0; i < data.length; i++) {
        posts += `
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">${data[i].title}</h5>
            <h6 class="card-subtitle mb-2 text-muted">${
              getUser(data[i].user_id).displayName
            }</h6>
            <p class="card-text">${data[i].content}</p>
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

function getUser(user_id) {
  axios
    .get(`https://cub-forum.herokuapp.com/user?user_id=${user_id}`)
    .then(data => {
      console.log(data);
      return data;
    })
    .catch(err => {
      console.error(err);
    });
}
