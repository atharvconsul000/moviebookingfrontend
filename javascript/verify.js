const params = new URLSearchParams(window.location.search);
    const bookingId = params.get("bookingId");
    const detailsDiv = document.getElementById("details");
    const statusDiv = document.getElementById("status");

    async function loadBookingDetails() {
      if (!bookingId) {
        statusDiv.innerText = "No Booking ID";
        detailsDiv.innerText = "No booking ID provided in URL.";
        return;
      }

      try {
        const response = await fetch(`https://movie-booking-backend-7oy8.onrender.com/user/verify/${bookingId}`);
        if (!response.ok) {
          throw new Error("Invalid booking ID");
        }

        const data = await response.json();

        const html = `
          <p><strong>Booking ID:</strong> ${data.bookingId}</p>
          <p><strong>Movie:</strong> ${data.movieName}</p>
          <p><strong>Movie Time:</strong> ${data.movieTime}</p>
          <p><strong>User:</strong> ${data.userName}</p>
          <p><strong>Seats Booked:</strong> ${data.numberOfSeats}</p>
          <p><strong>Booking Time:</strong> ${new Date(data.bookingTime).toLocaleString()}</p>
        `;

        detailsDiv.innerHTML = html;
      } catch (error) {
        console.error(error);
        statusDiv.innerText = " Verification Failed";
        detailsDiv.innerText = "Error verifying booking.";
      }
    }
    loadBookingDetails();