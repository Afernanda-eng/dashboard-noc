// Lista de servidores simulados
const servers = [
  { id: 1, name: "Servidor Web - APP 01" },
  { id: 2, name: "Servidor Web - APP 02" },
  { id: 3, name: "Banco de Dados - DB 01" },
  { id: 4, name: "API - Serviço Autenticação" },
  { id: 5, name: "API - Serviço Pagamentos" },
  { id: 6, name: "Servidor de Logs" }
];

// Estado atual
let serverStatus = [];
let incidents = [];

// Inicializa com valores aleatórios
function initServers() {
  serverStatus = servers.map(s => ({
    ...s,
    status: "online", // online | alerta | offline
    cpu: randomBetween(10, 60),
    ram: randomBetween(20, 70),
    latency: randomBetween(20, 120)
  }));
}

// Função util
function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Simula mudanças de status e métricas
function updateServers() {
  serverStatus = serverStatus.map(s => {
    // Pequena chance de mudar status
    const roll = Math.random();

    let newStatus = s.status;

    if (roll < 0.05) {
      newStatus = "offline";
    } else if (roll < 0.15) {
      newStatus = "alerta";
    } else if (roll < 0.8) {
      newStatus = "online";
    }

    // Ajusta métricas baseado no status
    let cpu, ram, latency;
    if (newStatus === "online") {
      cpu = randomBetween(10, 65);
      ram = randomBetween(20, 70);
      latency = randomBetween(20, 120);
    } else if (newStatus === "alerta") {
      cpu = randomBetween(60, 85);
      ram = randomBetween(60, 90);
      latency = randomBetween(100, 250);
    } else {
      // offline
      cpu = 0;
      ram = 0;
      latency = 0;
      // registra incidente se acabou de cair
      if (s.status !== "offline") {
        createIncident(s, "Queda total", "Alta");
      }
    }

    return {
      ...s,
      status: newStatus,
      cpu,
      ram,
      latency
    };
  });

  renderServers();
  renderSummary();
  renderIncidents();
}

// Cria incidente
function createIncident(server, type, severity) {
  const now = new Date();
  const time = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  incidents.unshift({
    time,
    server: server.name,
    type,
    severity, // Alta | Média | Baixa
    status: "Aberto"
  });

  // Limita quantidade de incidentes mostrados
  if (incidents.length > 20) {
    incidents.pop();
  }
}

// Renderiza cards de servidor
function renderServers() {
  const grid = document.getElementById("servers-grid");
  grid.innerHTML = "";

  serverStatus.forEach(s => {
    const card = document.createElement("div");
    card.classList.add("server-card");

    const statusClass =
      s.status === "online"
        ? "status-online"
        : s.status === "alerta"
        ? "status-alerta"
        : "status-offline";

    const statusLabel =
      s.status === "online"
        ? "Online"
        : s.status === "alerta"
        ? "Alerta"
        : "Offline";

    card.innerHTML = `
      <div class="server-header">
        <span class="server-name">${s.name}</span>
        <span class="server-status ${statusClass}">${statusLabel}</span>
      </div>

      <div class="metric-row">
        <span class="metric-label">CPU</span>
        <span>${s.cpu}%</span>
      </div>
      <div class="metric-bar-wrapper">
        <div class="metric-bar" style="width: ${s.cpu}%;"></div>
      </div>

      <div class="metric-row">
        <span class="metric-label">RAM</span>
        <span>${s.ram}%</span>
      </div>
      <div class="metric-bar-wrapper">
        <div class="metric-bar" style="width: ${s.ram}%;"></div>
      </div>

      <div class="metric-row">
        <span class="metric-label">Latência</span>
        <span>${s.latency === 0 ? "-" : s.latency + " ms"}</span>
      </div>
    `;

    grid.appendChild(card);
  });
}

// Resumo superior
function renderSummary() {
  const online = serverStatus.filter(s => s.status === "online").length;
  const alerta = serverStatus.filter(s => s.status === "alerta").length;
  const offline = serverStatus.filter(s => s.status === "offline").length;

  document.getElementById("online-count").textContent = online;
  document.getElementById("alert-count").textContent = alerta;
  document.getElementById("offline-count").textContent = offline;
  document.getElementById("incident-count").textContent = incidents.length;
}

// Render tabela de incidentes
function renderIncidents() {
  const tbody = document.getElementById("incident-body");
  tbody.innerHTML = "";

  incidents.forEach(i => {
    const tr = document.createElement("tr");

    const sevClass =
      i.severity === "Alta"
        ? "badge-alta"
        : i.severity === "Média"
        ? "badge-media"
        : "badge-baixa";

    tr.innerHTML = `
      <td>${i.time}</td>
      <td>${i.server}</td>
      <td>${i.type}</td>
      <td><span class="badge ${sevClass}">${i.severity}</span></td>
      <td><span class="badge badge-aberto">${i.status}</span></td>
    `;

    tbody.appendChild(tr);
  });
}

// Botão limpar incidentes
function setupClearButton() {
  const btn = document.getElementById("clear-incidents");
  btn.addEventListener("click", () => {
    incidents = [];
    renderIncidents();
    renderSummary();
  });
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  initServers();
  renderServers();
  renderSummary();
  renderIncidents();
  setupClearButton();

  // Atualiza a cada 5 segundos
  setInterval(updateServers, 5000);
});