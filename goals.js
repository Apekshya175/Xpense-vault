document.addEventListener('DOMContentLoaded', function() {
    // Load existing goals when page loads and update total savings at the top
    loadGoals();
    updateTotalSavings();
  
    // Handle add-goal button click
    document.getElementById('add-goal-btn').addEventListener('click', function(e) {
      e.preventDefault();
  
      const goalName = document.getElementById('goal-name').value.trim();
      const targetAmount = document.getElementById('target-amount').value;
      const deadline = document.getElementById('deadline').value;
  
      if (!goalName || !targetAmount || !deadline) {
        alert("Please fill in all fields.");
        return;
      }
  
      const payload = {
        goal_name: goalName,
        target_amount: targetAmount,
        deadline: deadline
      };
  
      fetch('Savinggoal.php?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Goal added successfully!");
          // Clear the input fields
          document.getElementById('goal-name').value = "";
          document.getElementById('target-amount').value = "";
          document.getElementById('deadline').value = "";
          loadGoals();
          updateTotalSavings();
        } else {
          alert("Error: " + data.message);
        }
      })
      .catch(error => console.error('Error:', error));
    });
  
    // Event delegation for delete button in goals list
    document.getElementById('goal-list').addEventListener('click', function(e) {
      if (e.target && e.target.classList.contains('delete-goal-btn')) {
        const goalId = e.target.getAttribute('data-id');
        if (confirm("Are you sure you want to delete this goal?")) {
          fetch('Savinggoal.php?action=delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: goalId })
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              alert("Goal deleted successfully!");
              loadGoals();
              updateTotalSavings();
            } else {
              alert("Error: " + data.message);
            }
          })
          .catch(error => console.error('Error:', error));
        }
      }
    });
  });
  
  // Function to load the saving goals for the current user
  function loadGoals() {
    fetch('Savinggoal.php?action=get')
      .then(response => response.json())
      .then(data => {
        const goalList = document.getElementById('goal-list');
        goalList.innerHTML = "";
        if (data.success && data.goals) {
          // Fetch current total saving before checking each goal
          fetch('Savinggoal.php?action=get_saving_total')
            .then(res => res.json())
            .then(savingData => {
              const totalSaving = parseFloat(savingData.total_saving || 0);
              data.goals.forEach(goal => {
                // Create a table row for each goal
                const row = document.createElement('tr');
                row.className = "transition-all duration-300 hover:bg-blue-50/50 group";
                row.innerHTML = `
                  <td class="py-2 px-4 border">${goal.goal_name}</td>
                  <td class="py-2 px-4 border">$${goal.target_amount}</td>
                  <td class="py-2 px-4 border">${goal.saved || 0}</td>
                  <td class="py-2 px-4 border">${goal.deadline}</td>
                  <td class="py-2 px-4 border">
                    <button class="delete-goal-btn text-red-500" data-id="${goal.id}">Delete</button>
                  </td>
                `;
                goalList.appendChild(row);
  
                // If current savings reach/exceed the goal's target amount, show a popup
                if (totalSaving >= parseFloat(goal.target_amount)) {
                  showPopup(`Congratulations! You have reached the goal "${goal.goal_name}"`);
                }
              });
            })
            .catch(error => console.error('Error fetching saving total:', error));
        } else {
          goalList.innerHTML = "<tr><td colspan='5'>No goals found.</td></tr>";
        }
      })
      .catch(error => console.error('Error:', error));
  }
  
  // Function to update the total savings displayed at the top
  function updateTotalSavings() {
    fetch('Savinggoal.php?action=get_saving_total')
      .then(response => response.json())
      .then(data => {
        const total = parseFloat(data.total_saving || 0).toFixed(2);
        document.getElementById('total-savings').textContent = `$${total}`;
        document.getElementById('total-savings-table').textContent = `$${total}`;
      })
      .catch(error => console.error('Error updating total savings:', error));
  }
  
  // Function to show popup message when a goal is achieved
  function showPopup(message) {
    const popup = document.createElement('div');
    popup.textContent = message;
    popup.style.position = "fixed";
    popup.style.top = "30%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.backgroundColor = "green";
    popup.style.color = "white";
    popup.style.padding = "1rem 2rem";
    popup.style.borderRadius = "8px";
    popup.style.fontWeight = "bold";
    popup.style.zIndex = "1000";
  
    document.body.appendChild(popup);
  
    setTimeout(() => {
      popup.remove();
    }, 3000);
  }
  