// Create and append the modal HTML when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const modalHtml = `
        <div id="logoutModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden flex items-center justify-center">
            <div class="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 transform transition-all">
                <div class="text-center">
                    <h3 class="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h3>
                    <p class="text-gray-500 mb-6">Are you sure you want to log out?</p>
                    <div class="flex justify-center space-x-4">
                        <button onclick="hideLogoutModal()" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200">
                            Cancel
                        </button>
                        <button onclick="confirmLogout()" class="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
});

function showLogoutModal() {
    document.getElementById('logoutModal').classList.remove('hidden');
}

function hideLogoutModal() {
    document.getElementById('logoutModal').classList.add('hidden');
}

function confirmLogout() {
    fetch('process_logout.php', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = 'l.html';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.location.href = 'l.html'; // Fallback to redirect even if there's an error
    });
}
