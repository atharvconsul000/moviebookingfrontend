(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    location.href = "login.html";
    return;
  }
  try {
    const res = await fetch("https://movie-booking-backend-7oy8.onrender.com/admin/movies", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    const container = document.getElementById("movieContainer");
    data.forEach(movie => {
      const div = document.createElement("div");
      div.classList.add("movieCard");
      div.innerHTML = `
        <input type="text" value="${movie.name}" disabled id="name-${movie._id}" />
        <input type="text" value="${movie.time}" disabled id="time-${movie._id}" />
        <input type="number" value="${movie.availableSeats}" disabled id="seats-${movie._id}" />
        <input type="text" value="${movie.image}" disabled id="image-${movie._id}" />
        <input type="url" value="${movie.link || ''}" disabled id="link-${movie._id}" placeholder="YouTube trailer link" />
        <button class="updateBtn" data-movie-id="${movie._id}">Edit</button>
        <button class="deleteBtn" data-movie-id="${movie._id}">Delete</button>
      `;
      container.appendChild(div);
    });

    const updateButtons = document.querySelectorAll(".updateBtn");
    updateButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const movieId = button.getAttribute("data-movie-id");
        const isEdit = button.innerText === "Edit";

        const fields = ["name", "time", "seats", "image", "link"];
        fields.forEach(field => {
          document.getElementById(`${field}-${movieId}`).disabled = !isEdit;
        });

        if (!isEdit) {
          const updatedMovie = {
            name: document.getElementById(`name-${movieId}`).value,
            time: document.getElementById(`time-${movieId}`).value,
            availableSeats: Number(document.getElementById(`seats-${movieId}`).value),
            image: document.getElementById(`image-${movieId}`).value,
            link: document.getElementById(`link-${movieId}`).value
          };

          try {
            await fetch(`https://movie-booking-backend-7oy8.onrender.com/admin/movies/${movieId}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify(updatedMovie)
            });
            alert("Movie updated successfully");
            button.innerText = "Edit";
          } catch (err) {
            console.error(err);
            alert("Update failed");
          }
        } else {
          button.innerText = "Save";
        }
      });
    });

    const deleteButtons = document.querySelectorAll(".deleteBtn");
    deleteButtons.forEach(button => {
      button.addEventListener("click", async () => {
        const movieId = button.getAttribute("data-movie-id");

        try {
          await fetch(`https://movie-booking-backend-7oy8.onrender.com/admin/delete-movie/${movieId}`, {
            method: "DELETE",
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
          alert("Movie deleted successfully");
          location.reload();
        } catch (err) {
          console.error(err);
          alert("Failed to delete movie");
        }
      });
    });
  } catch (err) {
    alert("Failed to load movies");
    console.error(err);
  }
})();
