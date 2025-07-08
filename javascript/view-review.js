(async function () {
  const params = new URLSearchParams(window.location.search);
  const movieName = decodeURIComponent(params.get("movieName"));

  const token = localStorage.getItem("token");
  
  async function loadReviews() {
    try {
      const res = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/reviews/${movieName}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const error = await res.text();
        console.error("Error response:", error);
        alert("Failed to fetch reviews: " + res.status);
        return;
      }

      const reviews = await res.json();
      const container = document.getElementById("reviewsContainer");

      if (reviews.length === 0) {
        container.innerHTML = "<p>No reviews yet.</p>";
        document.getElementById("avgRating").innerText = "Average Rating: N/A";
        return;
      }

      let total = 0;

      reviews.forEach(review => {
        total += review.rating;

        const box = document.createElement("div");
        box.className = "reviewBox";

        const time = new Date(review.time).toLocaleString();

        box.innerHTML = `
          <h3>${review.userName}</h3>
          <p><strong>Rating:</strong> ${review.rating}/5</p>
          <p>${review.comment}</p>
          <p class="timestamp">${time}</p>
        `;

        container.appendChild(box);
      });

      const avg = (total / reviews.length).toFixed(2);
      document.getElementById("avgRating").innerText = `Average Rating: ${avg}/5`;

    } catch (err) {
      console.error("Failed to fetch reviews", err);
      alert("Error loading reviews");
    }
  }

  loadReviews();
})();
