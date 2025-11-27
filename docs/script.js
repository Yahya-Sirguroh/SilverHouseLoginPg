const form = document.getElementById("loginForm");
const msg = document.getElementById("message");
const loader = document.getElementById("loader");
const btnText = document.querySelector(".btn-text");

// --------------------------------------------
// AUTO-GENERATE PERSISTENT MACHINE ID
// --------------------------------------------
let machineId = localStorage.getItem("machineId");

if (!machineId) {
  machineId = crypto.randomUUID();   // unique ID per device
  localStorage.setItem("machineId", machineId);
}

console.log("Machine ID:", machineId);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  msg.textContent = "Detecting location...";
  msg.className = "msg";
  loader.style.display = "inline-block";
  btnText.textContent = "Entering VR...";

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  let location = "Unknown";

  try {
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 7000 });
    });

    const lat = pos.coords.latitude.toFixed(4);
    const lon = pos.coords.longitude.toFixed(4);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
      { headers: { "User-Agent": "SilverHouseApp/1.0" } }
    );

    if (response.ok) {
      const data = await response.json();
      const address = data.address || {};
      const area =
        address.suburb || address.town || address.city || address.state || "Unknown area";
      location = `${area} (lat:${lat}, lon:${lon})`;
    }
  } catch {
    location = "Location denied";
  }

  try {
    const response = await fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, location, machineId }),
    });

    const data = await response.json();

    if (data.success) {
      msg.textContent = "Login successful! Redirecting...";
      msg.className = "msg success";
      setTimeout(() =>
        (window.location.href = "https://yahya-sirguroh.github.io/SilverAnnapurnaTemp/"),
      1500);
    } else {
      msg.textContent = data.message;
      msg.className = "msg error";
    }

  } catch {
    msg.textContent = "Server error";
    msg.className = "error";
  }

  loader.style.display = "none";
  btnText.textContent = "ENTER VR";
});
