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

async function fetchProjects(){
    const token = localStorage.getItem('access_token');
    const response = await fetch(`$(API_BASE)/projects/`,{
        headers: {'Authorization': `Bearer ${token}`}
    });
    const projects = await response.json();

    const container = document.getElementById('project-list');
    container.innerHTML = projects.map(p => `
        <div class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
            <h3 class="font-bold text-lg text-gray-800">${p.title}</h3>
            <p class="text-gray-600 text-sm mt-2">${p.description}</p>
            <div class="mt-4 flex justify-between items-center">
                <span class="px-2 py-1 text-xs rounded ${p.is_completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">
                    ${p.is_completed ? 'Completed' : 'In Progress'}
                </span>
            </div>
        </div>
    `).join('');)
}

// Logout Logic
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    location.reload();
});