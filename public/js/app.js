
const taskInput = document.getElementById('taskInput');
const addButton = document.getElementById('addButton');
const taskList = document.getElementById('taskList');

// Display tasks from the database
async function loadTasks() {
    try {
        const response = await fetch('/api/tasks');

        if (!response.ok) {
            throw new Error('Failed to load tasks');
        }

        const tasks = await response.json();
        taskList.innerHTML = '';

        tasks.forEach(task => {
            const listItem = document.createElement('li');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.completed;

            const text = document.createElement('span');
            text.textContent = task.title;

            if (task.completed) {
                text.style.textDecoration = 'line-through';
            }

            checkbox.addEventListener('change', async () => {
                const result = await fetch(`/api/tasks/${task.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ completed: checkbox.checked })
                });

                if (result.ok) {
                    text.style.textDecoration = checkbox.checked
                        ? 'line-through'
                        : 'none';
                } else {
                    checkbox.checked = !checkbox.checked;
                    alert('Could not update task.');
                }
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';

            deleteButton.addEventListener('click', async () => {
                const result = await fetch(`/api/tasks/${task.id}`, {
                    method: 'DELETE'
                });

                if (result.ok) {
                    loadTasks();
                } else {
                    alert('Could not delete task.');
                }
            });

            listItem.append(checkbox, text, deleteButton);
            taskList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
        alert('Could not load tasks from the database.');
    }
}

// Save a new task
addButton.addEventListener('click', async () => {
    const title = taskInput.value.trim();

    if (!title) {
        alert('Please enter a task!');
        return;
    }

    addButton.disabled = true;

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            throw new Error('Failed to save task');
        }

        taskInput.value = '';
        await loadTasks();
    } catch (error) {
        console.error(error);
        alert('Could not save task. Please try again.');
    } finally {
        addButton.disabled = false;
    }
});

// Load saved tasks when the page opens
loadTasks();
