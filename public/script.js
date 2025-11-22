// const form = document.getElementById("loginForm");
// const msg = document.getElementById("message");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   msg.textContent = "Logging in...";
//   msg.className = "msg";

//   const username = document.getElementById("username").value;
//   const password = document.getElementById("password").value;
//   const device = navigator.userAgent;

//   let location = "Unknown";
//   try {
//     const pos = await new Promise((resolve, reject) => {
//       navigator.geolocation.getCurrentPosition(
//         (p) => resolve(p),
//         (err) => reject(err),
//         { timeout: 5000 }
//       );
//     });
//     location = `lat:${pos.coords.latitude.toFixed(4)}, lon:${pos.coords.longitude.toFixed(4)}`;
//   } catch {
//     location = "Location denied";
//   }

//   try {
//     const response = await fetch("/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password, location, device }),
//     });

//     const data = await response.json();

//     if (data.success) {
//       msg.textContent = "Login successful! Redirecting...";
//       msg.className = "msg success";
//       setTimeout(() => {
//         window.location.href = "http://127.0.0.1:5500/Silver-Annapurna-Temp-252005/index.htm";
//       }, 1500);
//     } else {
//       msg.textContent = data.message;
//       msg.className = "msg error";
//     }
//   } catch (err) {
//     msg.textContent = "Error connecting to server.";
//     msg.className = "msg error";
//   }
// });

// 2nd
// const form = document.getElementById("loginForm");
// const msg = document.getElementById("message");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   msg.textContent = "Logging in...";
//   msg.className = "msg";

//   const username = document.getElementById("username").value;
//   const password = document.getElementById("password").value;

//   // let location = "Unknown";
//   // try {
//   //   const pos = await new Promise((resolve, reject) => {
//   //     navigator.geolocation.getCurrentPosition(
//   //       (p) => resolve(p),
//   //       (err) => reject(err),
//   //       { timeout: 5000 }
//   //     );
//   //   });
//   //   location = `lat:${pos.coords.latitude.toFixed(4)}, lon:${pos.coords.longitude.toFixed(4)}`;
//   // } catch {
//   //   location = "Location denied";
//   // }

//   let location = "Unknown";

// try {
//   const pos = await new Promise((resolve, reject) => {
//     navigator.geolocation.getCurrentPosition(
//       (p) => resolve(p),
//       (err) => reject(err),
//       { timeout: 5000 }
//     );
//   });

//   const lat = pos.coords.latitude.toFixed(4);
//   const lon = pos.coords.longitude.toFixed(4);

//   // Get readable area name using OpenStreetMap (Nominatim)
//   const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
//   const data = await response.json();

//   // Extract the area / city / state
//   const address = data.address;
//   const area =
//     address.suburb ||
//     address.village ||
//     address.town ||
//     address.city ||
//     address.county ||
//     address.state ||
//     "Unknown area";

//   location = `${area} (lat:${lat}, lon:${lon})`;

// } catch (err) {
//   console.error(err);
//   location = "Location denied";
// }

// console.log("Detected location:", location);


//   try {
//     const response = await fetch("/login", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ username, password, location }),
//     });

//     const data = await response.json();

//     if (data.success) {
//       msg.textContent = "Login successful! Redirecting...";
//       msg.className = "msg success";
//       setTimeout(() => {
//         window.location.href = "http://127.0.0.1:5500/Silver-Annapurna-Temp-252005/index.htm";
//       }, 1500);
//     } else {
//       msg.textContent = data.message;
//       msg.className = "msg error";
//     }
//   } catch (err) {
//     msg.textContent = "Error connecting to server.";
//     msg.className = "msg error";
//   }
// });

const form = document.getElementById("loginForm");
const msg = document.getElementById("message");
const loader = document.getElementById("loader");
const btnText = document.querySelector(".btn-text");

// Machine ID for THIS device (add different ID for each computer)
const machineId = "46923E66-D80E-C943-9D3E-04453B5A6200";

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
        (window.location.href = "http://127.0.0.1:5500/Silver-Annapurna-Temp-252005/index.htm"), 
      1500);
    } else {
      msg.textContent = data.message;
      msg.className = "msg error";
    }

  } catch {
    msg.textContent = "CSV file is open";
    msg.className = "msg error";
  }

  loader.style.display = "none";
  btnText.textContent = "ENTER VR";
});

