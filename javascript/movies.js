let allMovies = [];

function parseJwt(token) {
  let base64Url = token.split('.')[1];
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  let jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
  return JSON.parse(jsonPayload);
}

function parseTime(timeStr) {
  const now = new Date();
  const AM_PM = timeStr.slice(-2);
  const time = timeStr.slice(0, -2).trim();
  const [hoursStr, minuteStr] = time.split(":");

  let hour = parseInt(hoursStr);
  const minute = parseInt(minuteStr);

  if (AM_PM === "PM" && hour < 12) hour += 12;
  if (AM_PM === "AM" && hour === 12) hour = 0;

  const showTime = new Date(now);
  showTime.setHours(hour, minute, 0, 0);

  return showTime;
}

function renderMovies(movies, userId, token) {
  const container = document.getElementById("movieContainer");
  container.innerHTML = "";

  movies.forEach(async (movie) => {
    const showTime = parseTime(movie.time);
    const now = new Date();
    if (now > showTime) return;

    const div = document.createElement("div");
    div.classList.add("movieCard");

    div.innerHTML = `
      <h3>${movie.name}</h3>
      <p>Time: ${movie.time}</p>
      <p>Available Seats: ${movie.availableSeats}</p>
      <img src="${movie.image}" width="200" alt="${movie.name}" />
      <br/>
      <button class="bookBtn" data-movie-id="${movie._id}" data-user-id="${userId}">Book</button>
      <a href="view-review.html?movieName=${encodeURIComponent(movie.name)}">
        <button class="reviewBtn">View Reviews</button>
      </a>
      <a href="getPdf.html?movieId=${movie._id}&userId=${userId}">
        <button class="ticketBtn">Download Ticket</button>
      </a>
      ${movie.link ? `<button class="trailerBtn" data-link="${movie.link}">View Trailer</button>` : ''}
      <hr/>
    `;

    container.appendChild(div);

    const res = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/bookings/${movie._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const booking = await res.json();
    const btn = div.querySelector(".bookBtn");

    if (booking !== null) {
  btn.innerText = "Booked!";
  btn.disabled = true;
  btn.style.backgroundColor = "#888";
  btn.style.color = "#fff";
  btn.style.cursor = "not-allowed";
  btn.style.border = "1px solid #666";


  const cancelBtn = document.createElement("button");
  cancelBtn.innerText = "Cancel Booking";
  cancelBtn.classList.add("cancelBtn");

  cancelBtn.style.marginLeft = "10px";
  cancelBtn.style.backgroundColor = "#f44336";
  cancelBtn.style.color = "#fff";
  cancelBtn.style.border = "none";
  cancelBtn.style.padding = "5px 10px";
  cancelBtn.style.cursor = "pointer";

  div.appendChild(cancelBtn);

  cancelBtn.addEventListener("click", async () => {
    const confirmCancel = confirm("Are you sure you want to cancel the booking?");
    if (!confirmCancel) return;

    try {
      const cancelRes = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/cancel/${movie._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const cancelData = await cancelRes.json();
      alert(cancelData.message);

      btn.innerText = "Book";
      btn.disabled = false;
      btn.style.backgroundColor = "";
      btn.style.color = "";
      btn.style.cursor = "";
      btn.style.border = "";

      cancelBtn.remove(); 
    } catch (err) {
      alert("Cancellation failed");
      console.error(err);
    }
  });
}

    btn.addEventListener("click", async () => {
  const seats = prompt("Enter number of seats to book:");
  if (!seats || Number(seats) < 1) {
    alert("Invalid input.");
    return;
  }

  try {
    const bookingRes = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/book/${movie._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ numberOfSeats: Number(seats) }),
    });

    const bookingData = await bookingRes.json();
    alert(bookingData.message);

    btn.innerText = "Booked!";
    btn.disabled = true;
    btn.style.backgroundColor = "#888";
    btn.style.color = "#fff";
    btn.style.cursor = "not-allowed";
    btn.style.border = "1px solid #666";

    const cancelBtn = document.createElement("button");
    cancelBtn.innerText = "Cancel Booking";
    cancelBtn.classList.add("cancelBtn");

    cancelBtn.style.marginLeft = "10px";
    cancelBtn.style.backgroundColor = "#f44336";
    cancelBtn.style.color = "#fff";
    cancelBtn.style.border = "none";
    cancelBtn.style.padding = "5px 10px";
    cancelBtn.style.cursor = "pointer";

    btn.parentElement.appendChild(cancelBtn);

    cancelBtn.addEventListener("click", async () => {
      const confirmCancel = confirm("Are you sure you want to cancel the booking?");
      if (!confirmCancel) return;

      try {
        const cancelRes = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/cancel/${movie._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const cancelData = await cancelRes.json();
        alert(cancelData.message);

        btn.innerText = "Book";
        btn.disabled = false;
        btn.style.backgroundColor = "";
        btn.style.color = "";
        btn.style.cursor = "";
        btn.style.border = "";

        cancelBtn.remove();
      } catch (err) {
        alert("Cancellation failed");
        console.error(err);
      }
    });
  } catch (err) {
    alert("Booking failed");
    console.error(err);
  }
});


    const trailerBtn = div.querySelector(".trailerBtn");
    if (trailerBtn) {
      trailerBtn.addEventListener("click", () => {
        const link = trailerBtn.dataset.link;
        const embedLink = link.replace("watch?v=", "embed/");
        
        const modal = document.getElementById("trailerModal");
        const iframe = document.getElementById("trailerIframe");
        
        iframe.src = embedLink;
        modal.style.display = "flex"; // to center with flex properties
      });
    }
  });
}

function handleSearch() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const token = localStorage.getItem("token");
  const userId = parseJwt(token).id;

  const filtered = allMovies.filter(movie =>
    movie.name.toLowerCase().startsWith(input)
  );

  renderMovies(filtered, userId, token);
}

(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    location.href = "login.html";
    return;
  }

  const userId = parseJwt(token).id;

  try {
    const res = await fetch("https://movie-booking-backend-7oy8.onrender.com/user/movies", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    allMovies = data;
    renderMovies(allMovies, userId, token);
  } catch (err) {
    alert("Failed to load movies.");
    console.error(err);
  }
})();


document.getElementById("closeTrailerBtn").addEventListener("click", () => {
  const modal = document.getElementById("trailerModal");
  const iframe = document.getElementById("trailerIframe");

  iframe.src = ""; 
  modal.style.display = "none";
});
