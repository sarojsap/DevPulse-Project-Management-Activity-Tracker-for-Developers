const API_BASE = '/api';

//Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('access_token');
    if(token){
        showDashboard();
    }
});

// Login Logic
const loginForm = document.getElementById('login-form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try{
        const response = await fetch(`${API_BASE}/token/`, {
            method:'POST',
            headers:{'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            showDashboard();
        } else{
            document.getElementById('login-error').classList.remove('hidden')
        }
    } catch (err){
        console.error("Login Failed", err)
    }
});

function showDashboard(){
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    fetchProjects();
}

// MODAL TOGGLE LOGIC
const modal = document.getElementById('modal-backdrop');
document.getElementById('open-modal-btn').addEventListener('click', () => modal.classList.remove('hidden'));
document.getElementById('close-modal-btn').addEventListener('click', () => modal.classList.add('hidden'));

// CREATE PROJECT
const projectForm = document.getElementById('project-form');
projectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('access_token');
    
    const projectData = {
        title: document.getElementById('proj-title').value,
        description: document.getElementById('proj-desc').value
    };

    const response = await fetch(`${API_BASE}/projects/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(projectData)
    });

    if (response.ok) {
        projectForm.reset();
        modal.classList.add('hidden');
        fetchProjects(); // Refresh the list
    }
});

// DELETE PROJECT
async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/projects/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (response.ok) {
        fetchProjects(); // Refresh the list
    }
}

// UPDATE fetchProjects to include the Delete button
async function fetchProjects() {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/projects/`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const projects = await response.json();
    
    const container = document.getElementById('project-list');
    container.innerHTML = projects.map(p => `
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between">
            <div>
                <h3 class="font-bold text-lg text-gray-800">${p.title}</h3>
                <p class="text-gray-600 text-sm mt-2">${p.description || 'No description provided.'}</p>
            </div>
            <div class="mt-6 flex justify-between items-center">
                <span class="px-2 py-1 text-xs font-semibold rounded ${p.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${p.is_completed ? 'Completed' : 'In Progress'}
                </span>
                <button onclick="deleteProject(${p.id})" class="text-red-400 hover:text-red-600 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}
// Logout Logic
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});