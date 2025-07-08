document.getElementById("SignUpButton").addEventListener("click",async function(){
    const name = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const res = await fetch("https://movie-booking-backend-7oy8.onrender.com/user/signup",{
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({name,email,password}),
    });
    const data = await res.json();
    console.log(data)
    alert(data.message);
    location.href="index.html"
});