const API_BASE = '/api';
let isLoginMode = true; // Tracks if we are on Login or Sign Up

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if (token) {
        showDashboard();
    }
});

// --- AUTH UI TOGGLE LOGIC ---
// We target the new elements added in Phase 6
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthBtn = document.getElementById('toggle-auth-mode');
const emailInput = document.getElementById('email');
const authMessage = document.getElementById('auth-message');

if (toggleAuthBtn) {
    toggleAuthBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        
        // Update UI text
        authTitle.innerText = isLoginMode ? 'DevPulse Login' : 'DevPulse Sign Up';
        authSubmitBtn.innerText = isLoginMode ? 'Login' : 'Sign Up';
        toggleAuthBtn.innerText = isLoginMode 
            ? 'Need an account? Sign Up' 
            : 'Already have an account? Login';
        
        // Show/Hide email field
        emailInput.classList.toggle('hidden', isLoginMode);
        authMessage.classList.add('hidden');
    });
}

// --- UNIFIED AUTH LOGIC (LOGIN & REGISTER) ---
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;

        // Determine which endpoint to hit
        const endpoint = isLoginMode ? '/token/' : '/register/';
        const payload = isLoginMode 
            ? { username, password } 
            : { username, password, email };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                if (isLoginMode) {
                    // Success Login
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    showDashboard();
                } else {
                    // Success Registration
                    alert("Account created successfully! Please login.");
                    location.reload(); 
                }
            } else {
                // Handle Errors (e.g., user already exists)
                authMessage.innerText = data.detail || "Authentication failed. Please check your data.";
                authMessage.classList.remove('hidden');
            }
        } catch (err) {
            console.error("Auth Error:", err);
        }
    });
}

// --- DASHBOARD ACTIONS ---

function showDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    fetchProjects();
}

// Helper function to keep headers DRY (Don't Repeat Yourself)
function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

// FETCH ALL PROJECTS
async function fetchProjects() {
    try {
        const response = await fetch(`${API_BASE}/projects/`, {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) logout(); // Token expired? Force logout.

        const projects = await response.json();
        const container = document.getElementById('project-list');
        
        container.innerHTML = projects.map(p => `
            <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between border-t-4 ${p.is_completed ? 'border-green-500' : 'border-indigo-500'}">
                
                <!-- Project Info -->
                <div>
                    <h3 class="font-bold text-lg text-gray-800">${p.title}</h3>
                    <p class="text-gray-600 text-sm mt-2">${p.description || 'No description provided.'}</p>
                </div>

                <!-- Tasks Section -->
                <div class="mt-4 border-t pt-4">
                    <h4 class="text-xs font-bold uppercase text-gray-400 mb-2">Tasks</h4>
                    <ul class="space-y-2 mb-4">
                        ${p.tasks.map(t => `
                            <li class="flex items-center justify-between text-sm">
                                <span class="${t.is_done ? 'line-through text-gray-400' : 'text-gray-700'}">
                                    ${t.title}
                                </span>
                                <input type="checkbox" ${t.is_done ? 'checked' : ''} 
                                    onchange="toggleTask(${t.id}, ${t.is_done})"
                                    class="rounded text-indigo-600 cursor-pointer">
                            </li>
                        `).join('')}
                    </ul>

                    <!-- Quick Add Task -->
                    <div class="flex gap-2">
                        <input type="text" id="task-input-${p.id}" placeholder="New task..."
                            class="text-xs border rounded p-1 flex-grow outline-none focus:border-indigo-500">
                        <button onclick="addTask(${p.id})"
                            class="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-indigo-600 hover:text-white transition">
                            Add
                        </button>
                    </div>
                </div>

                <!-- Status + Delete -->
                <div class="mt-6 flex justify-between items-center">
                    <span class="px-2 py-1 text-xs font-semibold rounded ${
                        p.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }">
                        ${p.is_completed ? '✓ Completed' : '○ In Progress'}
                    </span>

                    <button onclick="deleteProject(${p.id})" class="text-red-400 hover:text-red-600 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Fetch Error:", err);
    }
}

// CREATE PROJECT
const projectForm = document.getElementById('project-form');
const modal = document.getElementById('modal-backdrop');

if (projectForm) {
    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectData = {
            title: document.getElementById('proj-title').value,
            description: document.getElementById('proj-desc').value
        };

        const response = await fetch(`${API_BASE}/projects/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(projectData)
        });

        if (response.ok) {
            projectForm.reset();
            modal.classList.add('hidden');
            fetchProjects();
        }
    });
}

// DELETE PROJECT
async function deleteProject(id) {
    if (!confirm("Delete this project and all its tasks?")) return;

    const response = await fetch(`${API_BASE}/projects/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    if (response.ok) fetchProjects();
}

// ADD TASK
async function addTask(projectId) {
    const input = document.getElementById(`task-input-${projectId}`);
    const title = input.value;
    if (!title) return;

    const response = await fetch(`${API_BASE}/tasks/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ project: projectId, title: title })
    });
    
    if (response.ok) fetchProjects();
}

// TOGGLE TASK STATUS (PATCH)
async function toggleTask(taskId, currentState) {
    await fetch(`${API_BASE}/tasks/${taskId}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ is_done: !currentState })
    });
    
    fetchProjects();
}

// MODAL OPEN/CLOSE
document.getElementById('open-modal-btn')?.addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('close-modal-btn')?.addEventListener('click', () => modal.classList.add('hidden'));

// LOGOUT
function logout() {
    localStorage.clear();
    location.reload();
}

document.getElementById('logout-btn')?.addEventListener('click', logout);