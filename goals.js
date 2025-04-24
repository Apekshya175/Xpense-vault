document.addEventListener('DOMContentLoaded', () => {
  loadGoals();
  updateTotalSavings();

  // Add New Goal
  document.getElementById('add-goal-btn').addEventListener('click', e => {
    e.preventDefault();
    const goalName     = document.getElementById('goal-name').value.trim();
    const targetAmount = document.getElementById('target-amount').value;
    const deadline     = document.getElementById('deadline').value;

    if (!goalName || !targetAmount || !deadline) {
      return alert("Please fill in all fields.");
    }

    fetch('Savinggoal.php?action=add', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ goal_name: goalName, target_amount: targetAmount, deadline })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Goal added successfully!");
        document.getElementById('goal-name').value = "";
        document.getElementById('target-amount').value = "";
        document.getElementById('deadline').value = "";
        loadGoals();
        updateTotalSavings();
      } else {
        alert("Error: " + data.message);
      }
    })
    .catch(console.error);
  });

  // Delete via delegation
  document.getElementById('goal-list').addEventListener('click', e => {
    if (e.target.classList.contains('delete-goal-btn')) {
      const id = e.target.dataset.id;
      if (!confirm("Sure to delete this goal?")) return;
      fetch('Savinggoal.php?action=delete', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ id })
      })
      .then(res => res.json())
      .then(d => {
        if (d.success) {
          alert("Deleted!");
          loadGoals();
          updateTotalSavings();
        } else {
          alert("Error: " + d.message);
        }
      })
      .catch(console.error);
    }
  });
});

function loadGoals() {
  fetch('Savinggoal.php?action=get')
    .then(res => res.json())
    .then(data => {
      const tbody = document.getElementById('goal-list');
      tbody.innerHTML = '';

      if (data.success && data.goals.length) {
        data.goals.forEach(g => {
          const row = document.createElement('tr');
          row.className = "group hover:bg-blue-50/50 transition";
          row.innerHTML = `
            <td class="py-2 px-4 border">${g.goal_name}</td>
            <td class="py-2 px-4 border">$${parseFloat(g.target_amount).toFixed(2)}</td>
            <td class="py-2 px-4 border">$${parseFloat(g.saved).toFixed(2)}</td>
            <td class="py-2 px-4 border">${g.deadline}</td>
            <td class="py-2 px-4 border">
              <button class="delete-goal-btn text-red-500" data-id="${g.id}">Delete</button>
            </td>
          `;
          tbody.appendChild(row);
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="5" class="p-4">No goals found.</td></tr>';
      }
    })
    .catch(console.error);
}

function updateTotalSavings() {
  fetch('Savinggoal.php?action=get_saving_total')
    .then(res => res.json())
    .then(data => {
      if (!data.success) return;
      const total = parseFloat(data.total_saving).toFixed(2);
      document.getElementById('total-savings').textContent       = `$${total}`;
      document.getElementById('total-savings-table').textContent = `$${total}`;
    })
    .catch(console.error);
}
