const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";

const movies = []; //電影總清單
let filteredMovies = []; //搜尋清單
let whichPage = 1;
const MOVIES_PER_PAGE = 12; // 每一分頁顯示12部

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const change = document.querySelector("#change-mode");

// 判斷頁面為Card、List
function MoviesListType(page) {
  if (dataPanel.children[0].matches(".by-card-type")) {
    renderMovieListByCardType(getMoviesByPage(page));
  } else if (dataPanel.children[0].matches(".by-list-type")) {
    renderMovieListByListType(getMoviesByPage(page));
  }
}
// Card模式
function renderMovieListByCardType(data) {
  dataPanel.innerHTML = "";
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
    <div class="col-sm-3 by-card-type">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" 
            data-bs-toggle="modal" 
            data-bs-target="#movie-modal" 
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}
// List模式
function renderMovieListByListType(data) {
  dataPanel.innerHTML = "";
  let rawHTML = "";
  rawHTML += `<ul class="by-list-type"><li class="list-group-item"></li>`;
  data.forEach((item) => {
    rawHTML += `
    <li class="list-group-item d-flex justify-content-between align-items-center">${item.title}
    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
		<button type="button" class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
    <button type="button" class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
    </li>`;
  });
  rawHTML += `</tbody>
</table>`;
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;

  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");

  modalTitle.innerText = "";
  modalDate.innerText = "";
  modalDescription.innerText = "";
  modalImage.innerHTML = `<img
                src=""
                alt="movie-poster" class="img-fluid">`;

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;

    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}
//加入收藏清單
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);

  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }

  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

// button監聽事件
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});
// search bar
searchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  renderPaginator(filteredMovies.length);
  whichPage = 1; //--每當搜尋時，分頁預設為第一頁
  MoviesListType(1);
});

// 分頁監聽事件
paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;

  const page = Number(event.target.dataset.page);
  whichPage = page;
  MoviesListType(page);
});
// 切換顯示對應的畫面
change.addEventListener("click", function onChangemodeClicked(event) {
  if (event.target.matches(".card-type")) {
    renderMovieListByCardType(getMoviesByPage(whichPage));
  } else if (event.target.matches(".list-type")) {
    renderMovieListByListType(getMoviesByPage(whichPage));
  }
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieListByCardType(getMoviesByPage(1)); //--頁面預設List模式
  })
  .catch((err) => console.log(err));
