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

(async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    location.href = "login.html";
    return;
  }

  const decoded = parseJwt(token);
  const userId = decoded.id;

  try {
    const res = await fetch("https://movie-booking-backend-7oy8.onrender.com/user/movies", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    const data = await res.json();

    const container = document.getElementById("movieContainer");

    for (let i = 0; i < data.length; i++) {
      const movie = data[i];
      const showTime = parseTime(movie.time);
      const now = new Date();

      const bookingRes = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/bookings/${movie._id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const bookingData = await bookingRes.json();

      // Show only watched & booked movies
      if (now < showTime || bookingData === null) continue;

      const div = document.createElement("div");
      div.classList.add("movieCard");
      div.innerHTML = `
        <h3>${movie.name}</h3>
        <p>Time: ${movie.time}</p>
        <p>Available Seats: ${movie.availableSeats}</p>
        <img src="${movie.image}" width="200" alt="${movie.name}" />
        <br/>
        <button
          class="reviewBtn"
          data-movie-id="${movie._id}"
        >
          Add Review
        </button>
        <hr/>
      `;
      container.appendChild(div);
    }

    const reviewButtons = document.querySelectorAll(".reviewBtn");
    reviewButtons.forEach(button => {
      const movieId = button.getAttribute("data-movie-id");
      button.addEventListener("click", () => {
        location.href = `add-review.html?movieId=${movieId}`;
      });
      button.style.backgroundColor = "#1DB954";
      button.style.color = "#000";
      button.style.fontWeight = "bold";
      button.style.border = "none";
      button.style.cursor = "pointer";
      button.style.padding = "10px";
      button.style.borderRadius = "5px";
    });

  } catch (err) {
    alert("Failed to load movies");
    console.error(err);
  }
})();
