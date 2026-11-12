
const API_URL = "http://127.0.0.1:8000/api";

const TOKEN_KEY = "truthmind_access";

const dashboardSection = document.getElementById("dashboardSection");
const analysisSection = document.getElementById("analysisSection");
const historySection = document.getElementById("historySection");

const statementInput = document.getElementById("statementInput");
const analyzeBtn = document.getElementById("analyzeBtn");
const analysisMessage = document.getElementById("analysisMessage");
const resultCard = document.getElementById("resultCard");


// Get saved login token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


// API request helper
async function apiRequest(endpoint, options = {}) {
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { "Authorization": `Bearer ${token}` } : {}),
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail ||
            data.message ||
            "Something went wrong. Please try again."
        );
    }

    return data;
}


// Switch between sections
function showSection(sectionName) {

    dashboardSection.classList.add("hidden");
    analysisSection.classList.add("hidden");
    historySection.classList.add("hidden");

    document.querySelectorAll(".nav-link").forEach(link => {
        link.classList.remove("active");
    });

    if (sectionName === "dashboard") {
        dashboardSection.classList.remove("hidden");
        document.querySelectorAll(".nav-link")[0].classList.add("active");
    }

    if (sectionName === "analysis") {
        analysisSection.classList.remove("hidden");
        document.querySelectorAll(".nav-link")[1].classList.add("active");
    }

    if (sectionName === "history") {
        historySection.classList.remove("hidden");
        document.querySelectorAll(".nav-link")[2].classList.add("active");
        loadHistory();
    }
}


// Navigation
document.querySelectorAll(".nav-link").forEach((link, index) => {

    link.addEventListener("click", event => {
        event.preventDefault();

        if (index === 0) showSection("dashboard");
        if (index === 1) showSection("analysis");
        if (index === 2) showSection("history");
    });

});


// Start analysis button
document.getElementById("startAnalysisBtn").addEventListener("click", () => {
    showSection("analysis");
});


// Character counter
statementInput.addEventListener("input", () => {
    document.getElementById("charCount").textContent =
        `${statementInput.value.length} characters`;
});


// Analyze statement
analyzeBtn.addEventListener("click", async () => {

    const statement = statementInput.value.trim();

    analysisMessage.textContent = "";
    resultCard.classList.add("hidden");

    if (!statement) {
        analysisMessage.textContent = "Please enter a statement first.";
        return;
    }

    if (!getToken()) {
        analysisMessage.textContent =
            "Please login first. Login functionality will be added next.";
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

    try {

        const data = await apiRequest("/analysis/analyze/", {
            method: "POST",
            body: JSON.stringify({ statement })
        });

        const analysis = data.analysis;

        document.getElementById("resultStatus").textContent =
            `Status: ${analysis.status}`;

        document.getElementById("resultText").textContent =
            analysis.result;

        const signalsList = document.getElementById("signalsList");
        signalsList.innerHTML = "";

        const observations = analysis.result
            .split("Observations:\n")[1];

        if (observations) {
            observations.split("\n").forEach(signal => {
                if (signal.trim()) {
                    const li = document.createElement("li");
                    li.textContent = signal.replace(/^- /, "");
                    signalsList.appendChild(li);
                }
            });
        } else {
            const li = document.createElement("li");
            li.textContent = "No additional observations.";
            signalsList.appendChild(li);
        }

        resultCard.classList.remove("hidden");
        analysisMessage.textContent = data.message;

        loadDashboard();

    } catch (error) {

        analysisMessage.textContent = error.message;

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Statement →";

    }
});


// Load analysis history
async function loadHistory() {

    const historyList = document.getElementById("historyList");

    if (!getToken()) {
        historyList.textContent = "Please login to view your history.";
        return;
    }

    historyList.textContent = "Loading history...";

    try {

        const data = await apiRequest("/analysis/history/");

        historyList.innerHTML = "";

        if (!data.history || data.history.length === 0) {
            historyList.textContent = "No analysis records found.";
            return;
        }

        data.history.forEach(item => {

            const div = document.createElement("div");
            div.className = "history-item";

            const title = document.createElement("strong");
            title.textContent = item.statement;

            const details = document.createElement("small");
            details.textContent =
                `Status: ${item.status} | ${new Date(item.created_at).toLocaleString()}`;

            div.appendChild(title);
            div.appendChild(details);

            historyList.appendChild(div);

        });

    } catch (error) {

        historyList.textContent = error.message;

    }
}


// Load dashboard data
async function loadDashboard() {

    if (!getToken()) return;

    try {

        const data = await apiRequest("/analysis/history/");

        document.getElementById("totalAnalyses").textContent =
            data.total ?? 0;

        if (data.history && data.history.length > 0) {
            document.getElementById("lastAnalysis").textContent =
                new Date(data.history[0].created_at).toLocaleDateString();
        }

    } catch (error) {
        console.error("Dashboard error:", error.message);
    }
}


// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("truthmind_refresh");
    localStorage.removeItem("truthmind_username");

    window.location.reload();

});


// Initial setup
const savedUsername = localStorage.getItem("truthmind_username");

if (savedUsername) {
    document.getElementById("sidebarUsername").textContent = savedUsername;
}

loadDashboard();


// Authentication Elements

const authContainer = document.getElementById("authContainer");
const appContainer = document.querySelector(".app-container");

const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

const authMessage = document.getElementById("authMessage");


// Show Login Form

document.getElementById("showLogin").addEventListener("click", (e) => {
    e.preventDefault();

    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    authMessage.textContent = "";
});


// Show Registration Form

document.getElementById("showRegister").addEventListener("click", (e) => {
    e.preventDefault();

    registerForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
    authMessage.textContent = "";
});


// Registration API

document.getElementById("registerFormElement").addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("registerUsername").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    authMessage.textContent = "Creating your account...";

    try {

        const response = await fetch(`${API_URL}/users/register/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(JSON.stringify(data.errors || data));
        }

        authMessage.textContent = "Registration successful! Please login.";
        authMessage.style.color = "#42dca4";

        document.getElementById("registerFormElement").reset();

        loginForm.classList.remove("hidden");
        registerForm.classList.add("hidden");

        document.getElementById("loginUsername").value = username;

    } catch (error) {

        authMessage.textContent = error.message;
        authMessage.style.color = "#ff7777";

    }

});


// Login API

document.getElementById("loginFormElement").addEventListener("submit", async (e) => {

    e.preventDefault();

    const username = document.getElementById("loginUsername").value.trim();
    const password = document.getElementById("loginPassword").value;

    authMessage.textContent = "Logging in...";

    try {

        const response = await fetch(`${API_URL}/login/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Invalid username or password.");
        }

        localStorage.setItem(TOKEN_KEY, data.access);
        localStorage.setItem("truthmind_refresh", data.refresh);
        localStorage.setItem("truthmind_username", username);

        authContainer.classList.add("hidden");
        appContainer.classList.remove("hidden");

        document.getElementById("sidebarUsername").textContent = username;

        authMessage.textContent = "";

        loadDashboard();

    } catch (error) {

        authMessage.textContent = error.message;
        authMessage.style.color = "#ff7777";

    }

});


// Check Login Status on Page Load

if (getToken()) {

    authContainer.classList.add("hidden");
    appContainer.classList.remove("hidden");

} else {

    authContainer.classList.remove("hidden");
    appContainer.classList.add("hidden");

}
