document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const contactsTable = document.getElementById('contactsTable');
  const statusMessage = document.getElementById('statusMessage');
  const refreshBtn = document.getElementById('refreshBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const pagination = document.getElementById('pagination');
  const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
  const confirmDeleteBtn = document.getElementById('confirmDelete');
  
  // Configuration
 const API_URL = 'https://working-jd-computer.onrender.com/api/contacts';

  const TOKEN_KEY = 'adminToken';
  let currentPage = 1;
  const itemsPerPage = 10;
  let currentDeleteId = null;

  // Check authentication
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = 'admin-login.html';
    return;
  }

  // Initialize
  loadContacts();

  // Event Listeners
  refreshBtn.addEventListener('click', () => {
    currentPage = 1;
    loadContacts();
  });

  logoutBtn.addEventListener('click', logout);

  confirmDeleteBtn.addEventListener('click', deleteContact);

  // Functions
  async function loadContacts() {
    try {
      showLoading(true);
      clearStatus();
      
      const response = await fetch(`${API_URL}?page=${currentPage}&limit=${itemsPerPage}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data, total, pages } = await response.json();
      renderContacts(data);
      renderPagination(total, pages);
      showStatus('Contacts loaded successfully', 'success');

    } catch (error) {
      console.error('Error:', error);
      showStatus(`Failed to load contacts: ${error.message}`, 'error');
      contactsTable.innerHTML = `<tr><td colspan="6" class="text-center">Error loading contacts. Please try again.</td></tr>`;
    } finally {
      showLoading(false);
    }
  }

  function renderContacts(contacts) {
    if (contacts.length === 0) {
      contactsTable.innerHTML = `<tr><td colspan="6" class="text-center">No contacts found</td></tr>`;
      return;
    }

    contactsTable.innerHTML = contacts.map(contact => `
      <tr data-id="${contact._id}">
        <td>${contact.name}</td>
        <td><a href="mailto:${contact.email}">${contact.email}</a></td>
        <td>${contact.phone || 'N/A'}</td>
        <td>${contact.message}</td>
        <td>${new Date(contact.createdAt).toLocaleString()}</td>
        <td>
          <button class="btn btn-sm btn-danger action-btn delete-btn" data-id="${contact._id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </td>
      </tr>
    `).join('');

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        currentDeleteId = btn.dataset.id;
        deleteModal.show();
      });
    });
  }

  async function deleteContact() {
    try {
      showLoading(true);
      deleteModal.hide();
      
      const response = await fetch(`${API_URL}/${currentDeleteId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      showStatus(result.message || 'Contact deleted successfully', 'success');
      loadContacts(); // Refresh the list

    } catch (error) {
      console.error('Error:', error);
      showStatus(`Failed to delete contact: ${error.message}`, 'error');
    } finally {
      showLoading(false);
      currentDeleteId = null;
    }
  }

  function renderPagination(totalItems, totalPages) {
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = `<nav aria-label="Page navigation">
      <ul class="pagination">`;
    
    // Previous button
    html += `<li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>`;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      html += `<li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }
    
    // Next button
    html += `<li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>`;
    
    html += `</ul></nav>`;
    pagination.innerHTML = html;

    // Add event listeners to pagination buttons
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        currentPage = parseInt(link.dataset.page);
        loadContacts();
      });
    });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = 'admin-login.html';
  }

  function showLoading(isLoading) {
    const icon = refreshBtn.querySelector('i');
    if (isLoading) {
      refreshBtn.disabled = true;
      icon.classList.replace('fa-sync-alt', 'fa-spinner');
      icon.classList.add('fa-spin');
    } else {
      refreshBtn.disabled = false;
      icon.classList.replace('fa-spinner', 'fa-sync-alt');
      icon.classList.remove('fa-spin');
    }
  }

  function showStatus(message, type) {
    statusMessage.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      ${message}
    `;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'flex';
    statusMessage.style.alignItems = 'center';
    statusMessage.style.gap = '8px';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusMessage.style.display = 'none';
      }, 5000);
    }
  }

  function clearStatus() {
    statusMessage.style.display = 'none';
    statusMessage.textContent = '';
  }
});