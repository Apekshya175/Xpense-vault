<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Logout - Xpense Vault</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div id="logoutModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 transform transition-all">
            <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-900 mb-4">Confirm Logout</h3>
                <p class="text-gray-500 mb-6">Are you sure you want to log out?</p>
                <div class="flex justify-center space-x-4">
                    <button onclick="window.history.back()" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-200">
                        Cancel
                    </button>
                    <button onclick="confirmLogout()" class="px-6 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-all duration-200">
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
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
    </script>
</body>
</html>?> 