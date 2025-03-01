const sectors = [
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets" },
    { color: "#FF5A10", text: "#333333", label: "Prize draw" },
    { color: "#FFBC03", text: "#333333", label: "Sweets + Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "You lose" },
    { color: "#FFBC03", text: "#333333", label: "Prize draw" },
    { color: "#FF5A10", text: "#333333", label: "Sweets" },
  ];
  
  const events = {
    listeners: {},
    addListener: function (eventName, fn) {
      this.listeners[eventName] = this.listeners[eventName] || [];
      this.listeners[eventName].push(fn);
    },
    fire: function (eventName, ...args) {
      if (this.listeners[eventName]) {
        for (let fn of this.listeners[eventName]) {
          fn(...args);
        }
      }
    },
  };
  
  const rand = (m, M) => Math.random() * (M - m) + m;
  const tot = sectors.length;
  const spinEl = document.querySelector("#spin");
  const ctx = document.querySelector("#wheel").getContext("2d");
  const dia = ctx.canvas.width;
  const rad = dia / 2;
  const PI = Math.PI;
  const TAU = 2 * PI;
  const arc = TAU / sectors.length;
  
  const friction = 0.991; // 0.995=soft, 0.99=mid, 0.98=hard
  let angVel = 0; // Angular velocity
  let ang = 0; // Angle in radians
  
  let spinButtonClicked = false;
  
  const getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot;
  
  function drawSector(sector, i) {
    const ang = arc * i;
    ctx.save();
  
    // COLOR
    ctx.beginPath();
    ctx.fillStyle = sector.color;
    ctx.moveTo(rad, rad);
    ctx.arc(rad, rad, rad, ang, ang + arc);
    ctx.lineTo(rad, rad);
    ctx.fill();
  
    // TEXT
    ctx.translate(rad, rad);
    ctx.rotate(ang + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = sector.text;
    ctx.font = "bold 30px 'Lato', sans-serif";
    ctx.fillText(sector.label, rad - 10, 10);
    //
  
    ctx.restore();
  }
  
  function rotate() {
    const sector = sectors[getIndex()];
    ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`;
  
    spinEl.textContent = !angVel ? "SPIN" : sector.label;
    spinEl.style.background = sector.color;
    spinEl.style.color = sector.text;
  }
  
  function frame() {
    // Fire an event after the wheel has stopped spinning
    if (!angVel && spinButtonClicked) {
      const finalSector = sectors[getIndex()];
      events.fire("spinEnd", finalSector);
      spinButtonClicked = false; // reset the flag
      return;
    }
  
    angVel *= friction; // Decrement velocity by friction
    if (angVel < 0.002) angVel = 0; // Bring to stop
    ang += angVel; // Update angle
    ang %= TAU; // Normalize angle
    rotate();
  }
  
  function engine() {
    frame();
    requestAnimationFrame(engine);
  }
  
  function init() {
    sectors.forEach(drawSector);
    rotate(); // Initial rotation
    engine(); // Start engine
    spinEl.addEventListener("click", () => {
      if (!angVel) angVel = rand(0.25, 0.45);
      spinButtonClicked = true;
    });

    document.getElementById("add_sector_form").addEventListener("submit", (e) => {
      e.preventDefault();
      const label = document.getElementById("sector_label").value;
      const color = document.getElementById("sector_color").value;
      const text = document.getElementById("sector_text_color").value;
      sectors.push({ label, color, text });
      updateSectorList();
      resetWheel();
    });
  
    updateSectorList();
  }

  function updateSectorList() {
    const sectorList = document.getElementById("sector_list");
    sectorList.innerHTML = "";
    sectors.forEach((sector, index) => {
      const li = document.createElement("li");
      li.textContent = `${sector.label} (${sector.color}, ${sector.text})`;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.addEventListener("click", () => {
        sectors.splice(index, 1);
        updateSectorList();
        resetWheel();
      });
      li.appendChild(deleteButton);
      sectorList.appendChild(li);
    });
  }
  
  function resetWheel() {
    ctx.clearRect(0, 0, dia, dia);
    sectors.forEach(drawSector);
    rotate();
  }

  init();
  
  events.addListener("spinEnd", (sector) => {
    console.log(`Woop! You won ${sector.label}`);
  });