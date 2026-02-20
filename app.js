const State = {
    roles: JSON.parse(localStorage.getItem('distro_roles')) || [
        { id: 1, name: 'Super Admin', description: 'Full system access with all module permissions', permissions: { 'Inventory': 'crud', 'Orders': 'crud', 'Users': 'crud', 'Roles': 'crud' }, enabled: true, webAccess: true, mobileAccess: true },
        { id: 2, name: 'Branch Manager', description: 'Manages specific branch operations and local inventory', permissions: { 'Inventory': 'cru', 'Orders': 'cru', 'Users': 'r' }, enabled: true, webAccess: true, mobileAccess: false },
        { id: 3, name: 'Driver', description: 'Mobile access for delivery tracking and order status', permissions: { 'Orders': 'r' }, enabled: true, webAccess: false, mobileAccess: true }
    ],
    auditLogs: JSON.parse(localStorage.getItem('distro_audit')) || [
        { id: 1, roleId: 1, action: 'Role Created', user: 'System', time: new Date().toLocaleString() },
        { id: 2, roleId: 1, action: 'Permissions Updated', user: 'Super Admin', time: new Date().toLocaleString() }
    ],
    users: JSON.parse(localStorage.getItem('distro_users')) || [
        { 
            id: 1, 
            name: 'John Doe', 
            email: 'john@distro.com', 
            pincode: '400001', 
            address: 'Main St, Mumbai',
            roles: ['Super Admin'],
            whatsapp: [{ number: '9876543210', isPrimary: true }, { number: '9876543211', isPrimary: false }],
            business: [{ lat: '19.0760', lng: '72.8777', isPrimary: true }]
        }
    ],
    modules: JSON.parse(localStorage.getItem('distro_modules')) || [
        { id: 101, name: 'Inventory', description: 'Stock management system', enabled: true, priority: 1, subModules: [
            { id: 102, name: 'Stock Levels', description: 'Monitor available items', enabled: true, priority: 1, subModules: [] },
            { id: 103, name: 'Warehousing', description: 'Location management', enabled: true, priority: 2, subModules: [] }
        ]},
        { id: 201, name: 'Orders', description: 'Sales and purchase orders', enabled: true, priority: 2, subModules: [] },
        { id: 301, name: 'Users', description: 'Account management', enabled: true, priority: 3, subModules: [] },
        { id: 401, name: 'Roles', description: 'Access control list', enabled: true, priority: 4, subModules: [] }
    ],
    products: JSON.parse(localStorage.getItem('distro_products')) || [
        { id: 1001, name: 'Electronics', type: 'category', subItems: [
            { id: 1002, name: 'Mobile Phones', type: 'category', subItems: [
                { id: 1003, name: 'iPhone 15 Pro', type: 'product', price: 999, stock: 50, subItems: [] }
            ]}
        ]}
    ],
    currentPage: 'dashboard'
};

let modulePageSearchQuery = '';
let moduleActiveTab = 'config';
let productPageSearchQuery = '';
let productActiveTab = 'info';

// Persistence
const saveData = () => {
    localStorage.setItem('distro_roles', JSON.stringify(State.roles));
    localStorage.setItem('distro_users', JSON.stringify(State.users));
    localStorage.setItem('distro_audit', JSON.stringify(State.auditLogs));
    localStorage.setItem('distro_modules', JSON.stringify(State.modules));
    localStorage.setItem('distro_products', JSON.stringify(State.products));
};

const addAuditLog = (roleId, action) => {
    State.auditLogs.unshift({
        id: Date.now(),
        roleId,
        action,
        user: 'Super Admin',
        time: new Date().toLocaleString()
    });
    saveData();
};

// DOM Elements
const contentArea = document.getElementById('page-content');
const modalContainer = document.getElementById('modal-container');
const modalBody = document.getElementById('modal-body');
const modalTitle = document.getElementById('modal-title');
const closeModalBtn = document.getElementById('close-modal');

// --- Navigation Logic ---
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        State.currentPage = page;
        renderPage(page);
    });
});

const renderPage = (page) => {
    switch(page) {
        case 'dashboard': renderDashboard(); break;
        case 'roles': renderRoles(); break;
        case 'users': renderUsers(); break;
        case 'vendors': renderVendors(); break;
        case 'modules': renderModules(); break;
        case 'products': renderProducts(); break;
        case 'mobile-preview': renderMobilePreview('Driver'); break;
        default: renderDashboard();
    }
    lucide.createIcons();
};

// --- Dashboard Component ---
const renderDashboard = () => {
    contentArea.innerHTML = `
        <div class="page-header">
            <h2>System Overview</h2>
            <p class="text-muted">Welcome back, Super Admin</p>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary)">
                    <i data-lucide="users"></i>
                </div>
                <div class="stat-value">${State.users.length}</div>
                <div class="stat-label">Total Users</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(16, 185, 129, 0.1); color: var(--success)">
                    <i data-lucide="shield-check"></i>
                </div>
                <div class="stat-value">${State.roles.length}</div>
                <div class="stat-label">Active Roles</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: rgba(245, 158, 11, 0.1); color: var(--warning)">
                    <i data-lucide="box"></i>
                </div>
                <div class="stat-value">12</div>
                <div class="stat-label">Active Modules</div>
            </div>
        </div>
        <div class="table-container">
            <div class="table-header">
                <h3>Recent Activities</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Action</th>
                        <th>Module</th>
                        <th>Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>John Doe</td>
                        <td>Created New Role</td>
                        <td>Roles</td>
                        <td>2 mins ago</td>
                    </tr>
                    <tr>
                        <td>Admin</td>
                        <td>Updated Inventory</td>
                        <td>Inventory</td>
                        <td>1 hour ago</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
};

// --- Roles Management Component ---
let roleSearchQuery = '';
let moduleSearchQuery = '';

const renderRoles = () => {
    const filteredRoles = State.roles.filter(r => 
        r.name.toLowerCase().includes(roleSearchQuery.toLowerCase())
    );

    contentArea.innerHTML = `
        <div class="table-header">
            <div>
                <h2>Roles & Permissions</h2>
                <p class="text-muted">Manage dynamic roles and their modular permissions</p>
            </div>
            <div style="display: flex; gap: 1rem; align-items: center">
                <div class="search-bar" style="width: 250px; height: 40px; margin-bottom: 0">
                    <i data-lucide="search" style="width: 16px"></i>
                    <input type="text" id="role-search" placeholder="Search roles..." value="${roleSearchQuery}" oninput="handleRoleSearch(this.value)">
                </div>
                <button class="btn-primary" onclick="openRoleModal()">
                    <i data-lucide="plus"></i> Create Role
                </button>
            </div>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 70%">Role Information</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredRoles.map(role => `
                        <tr class="clickable-row" onclick="openRoleModal(${role.id})">
                            <td>
                                <div style="font-weight: 700; font-size: 1.05rem">${role.name}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; line-height: 1.4">${role.description || 'No description provided.'}</div>
                                <div style="display: flex; gap: 5px; margin-top: 8px">
                                    ${role.webAccess ? '<span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); font-size: 0.6rem; padding: 1px 6px">Web</span>' : ''}
                                    ${role.mobileAccess ? '<span class="status-badge" style="background: rgba(168, 85, 247, 0.1); color: var(--accent-secondary); font-size: 0.6rem; padding: 1px 6px">Mobile</span>' : ''}
                                </div>
                            </td>
                            <td>
                                <span class="status-badge ${role.enabled ? 'enabled' : 'disabled'}">${role.enabled ? 'Active' : 'Disabled'}</span>
                            </td>
                        </tr>
                    `).join('')}
                    ${filteredRoles.length === 0 ? `<tr><td colspan="2" style="text-align: center; padding: 3rem; color: var(--text-muted)">No roles found matching "${roleSearchQuery}"</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const handleRoleSearch = (query) => {
    roleSearchQuery = query;
    renderRoles();
    document.getElementById('role-search').focus();
};

const openRoleModal = (id = null) => {
    const role = id ? State.roles.find(r => r.id === id) : { name: '', description: '', webAccess: true, mobileAccess: false, permissions: {}, enabled: true };
    moduleSearchQuery = ''; 
    modalContainer.classList.add('slider');
    renderRoleModalContent(id, role);
    modalContainer.classList.remove('hidden');
    lucide.createIcons();
};

const renderRoleModalContent = (id, role) => {
    modalTitle.innerText = id ? `Manage Role: ${role.name}` : 'Create New Role';
    const logs = id ? State.auditLogs.filter(l => l.roleId === id) : [];

    // Recursive search and flatten for permission list
    const flattenModules = (modules, level = 0, path = []) => {
        let result = [];
        modules.forEach(mod => {
            const matches = mod.name.toLowerCase().includes(moduleSearchQuery.toLowerCase());
            const currentItem = { ...mod, level, fullPath: [...path, mod.name].join(' > ') };
            
            // If it matches or has children that might match
            const children = flattenModules(mod.subModules, level + 1, [...path, mod.name]);
            
            if (matches || children.length > 0) {
                result.push(currentItem);
                result = result.concat(children);
            }
        });
        return result;
    };

    const displayModules = flattenModules(State.modules);

    modalBody.innerHTML = `
        <div class="dual-layout">
            <!-- Part 1: Editing Table/Form -->
            <section class="edit-section">
                <h3 class="section-title">Configuration & Permissions</h3>
                <form id="role-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
                        <div class="form-group">
                            <label>Role Name</label>
                            <input type="text" class="form-control" id="role-name" value="${role.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Access Platforms</label>
                            <div style="display: flex; gap: 15px; padding: 0.6rem; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid var(--glass-border)">
                                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.8rem">
                                    <input type="checkbox" id="access-web" ${role.webAccess ? 'checked' : ''}> Web
                                </label>
                                <label style="display: flex; align-items: center; gap: 5px; cursor: pointer; font-size: 0.8rem">
                                    <input type="checkbox" id="access-mobile" ${role.mobileAccess ? 'checked' : ''}> Mobile
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <input type="text" class="form-control" id="role-desc" value="${role.description || ''}" placeholder="Brief role purpose...">
                    </div>

                    <div class="form-group">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem">
                            <label style="margin-bottom: 0">Module Permissions</label>
                            <div class="search-bar" style="width: 180px; height: 32px; background: #0f1118">
                                <i data-lucide="search" style="width: 14px"></i>
                                <input type="text" id="module-search" placeholder="Filter modules..." value="${moduleSearchQuery}" 
                                    style="font-size: 0.8rem" oninput="handleModuleSearch(this.value, ${id}, ${JSON.stringify(role).replace(/"/g, '&quot;')})">
                            </div>
                        </div>
                        <div class="table-container" style="border-radius: 12px; max-height: 300px; overflow-y: auto">
                            <table style="font-size: 0.85rem">
                                <thead style="position: sticky; top: 0; background: var(--sidebar-bg); z-index: 10">
                                    <tr>
                                        <th>Module</th><th>C</th><th>R</th><th>U</th><th>D</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${displayModules.map(mod => {
                                        const p = role.permissions[mod.fullPath] || '';
                                        return `
                                            <tr>
                                                <td>
                                                    <div style="padding-left: ${mod.level * 20}px; display: flex; align-items: center; gap: 6px">
                                                        ${mod.level > 0 ? '<i data-lucide="corner-down-right" style="width: 12px; opacity: 0.5"></i>' : ''}
                                                        <span style="${mod.level === 0 ? 'font-weight: 700' : ''}">${mod.name}</span>
                                                    </div>
                                                </td>
                                                <td><input type="checkbox" class="perm-check" data-mod="${mod.fullPath}" data-p="c" ${p.includes('c') ? 'checked' : ''}></td>
                                                <td><input type="checkbox" class="perm-check" data-mod="${mod.fullPath}" data-p="r" ${p.includes('r') ? 'checked' : ''}></td>
                                                <td><input type="checkbox" class="perm-check" data-mod="${mod.fullPath}" data-p="u" ${p.includes('u') ? 'checked' : ''}></td>
                                                <td><input type="checkbox" class="perm-check" data-mod="${mod.fullPath}" data-p="d" ${p.includes('d') ? 'checked' : ''}></td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <button type="submit" class="btn-primary" style="width: 100%; margin-top: 1rem">
                        <i data-lucide="save"></i> ${id ? 'Update Changes' : 'Create Role'}
                    </button>
                </form>
            </section>

            <!-- Part 2: Audit Logs Table -->
            ${id ? `
            <section class="audit-section">
                <h3 class="section-title">Audit History</h3>
                <div class="table-container" style="border-radius: 12px; max-height: 250px; overflow-y: auto">
                    <table style="font-size: 0.8rem">
                        <thead style="position: sticky; top: 0; background: var(--sidebar-bg); z-index: 10">
                            <tr>
                                <th>Action</th><th>User</th><th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td><span style="color: var(--accent-secondary)">${log.action}</span></td>
                                    <td>${log.user}</td>
                                    <td class="text-muted">${log.time}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="text-align: center">No activity found</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </section>
            ` : ''}
        </div>
        
        <!-- Slider Footer -->
        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center">
            <div style="display: flex; align-items: center; gap: 10px">
                <span style="font-size: 0.9rem; color: var(--text-muted)">Role Status:</span>
                <button type="button" class="status-badge ${role.enabled ? 'enabled' : 'disabled'}" style="cursor: pointer; border: none" 
                    onclick="handleToggleInsideSlider(${id}, ${role.enabled})">
                    ${role.enabled ? 'Active' : 'Disabled'}
                </button>
            </div>
            <button type="button" class="btn-primary" onclick="saveRoleForm(${id})">
                <i data-lucide="check-circle-2"></i> Save Changes
            </button>
        </div>
    `;

    document.getElementById('role-form').onsubmit = (e) => {
        e.preventDefault();
        saveRoleForm(id);
    };
    lucide.createIcons();
    if(moduleSearchQuery) document.getElementById('module-search').focus();
};

const handleModuleSearch = (query, id, currentRole) => {
    moduleSearchQuery = query;
    const name = document.getElementById('role-name').value;
    const description = document.getElementById('role-desc').value;
    const webAccess = document.getElementById('access-web').checked;
    const mobileAccess = document.getElementById('access-mobile').checked;
    
    const updatedRole = { ...currentRole, name, description, webAccess, mobileAccess };
    document.querySelectorAll('.perm-check').forEach(cb => {
        const mod = cb.getAttribute('data-mod');
        const p = cb.getAttribute('data-p');
        if(cb.checked) {
            updatedRole.permissions[mod] = (updatedRole.permissions[mod] || '').includes(p) ? updatedRole.permissions[mod] : updatedRole.permissions[mod] + p;
        } else {
            updatedRole.permissions[mod] = (updatedRole.permissions[mod] || '').replace(p, '');
        }
    });

    renderRoleModalContent(id, updatedRole);
};

const saveRoleForm = (id) => {
    const name = document.getElementById('role-name').value;
    const description = document.getElementById('role-desc').value;
    const webAccess = document.getElementById('access-web').checked;
    const mobileAccess = document.getElementById('access-mobile').checked;
    
    const role = id ? State.roles.find(r => r.id === id) : { permissions: {} };
    const finalPermissions = { ...role.permissions };

    document.querySelectorAll('.perm-check').forEach(cb => {
        const mod = cb.getAttribute('data-mod');
        const p = cb.getAttribute('data-p');
        if(cb.checked) {
            finalPermissions[mod] = (finalPermissions[mod] || '').includes(p) ? finalPermissions[mod] : finalPermissions[mod] + p;
        } else {
            finalPermissions[mod] = (finalPermissions[mod] || '').replace(p, '');
        }
    });

    if(id) {
        const idx = State.roles.findIndex(r => r.id === id);
        State.roles[idx] = { ...State.roles[idx], name, description, webAccess, mobileAccess, permissions: finalPermissions };
        addAuditLog(id, 'Role Updated');
    } else {
        const newId = Date.now();
        State.roles.push({ id: newId, name, description, webAccess, mobileAccess, permissions: finalPermissions, enabled: true });
        addAuditLog(newId, 'Role Created');
    }
    
    saveData();
    closeModal();
    renderRoles();
};

const handleToggleInsideSlider = (id, currentStatus) => {
    if(!id) return; // Cannot toggle status for unsaved roles easily
    const idx = State.roles.findIndex(r => r.id === id);
    State.roles[idx].enabled = !currentStatus;
    addAuditLog(id, State.roles[idx].enabled ? 'Role Enabled' : 'Role Disabled');
    saveData();
    // Re-render slider content to show new status
    renderRoleModalContent(id, State.roles[idx]);
};

const toggleRole = (id) => {
    const idx = State.roles.findIndex(r => r.id === id);
    State.roles[idx].enabled = !State.roles[idx].enabled;
    const action = State.roles[idx].enabled ? 'Role Enabled' : 'Role Disabled';
    addAuditLog(id, action);
    saveData();
    renderRoles();
};

// --- User Management Component ---
let userSearchQuery = '';
let userRoleFilter = '';
let userSortKey = 'name';
let userActiveTab = 'profile';

const renderUsers = () => {
    let filteredUsers = State.users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                             user.email.toLowerCase().includes(userSearchQuery.toLowerCase());
        const matchesRole = userRoleFilter === '' || user.roles.includes(userRoleFilter);
        return matchesSearch && matchesRole;
    });

    // Sorting
    filteredUsers.sort((a, b) => {
        if (userSortKey === 'name') return a.name.localeCompare(b.name);
        if (userSortKey === 'newest') return b.id - a.id;
        return 0;
    });

    contentArea.innerHTML = `
        <div class="table-header" style="flex-wrap: wrap; gap: 1rem">
            <div>
                <h2>User Management</h2>
                <p class="text-muted">Manage system users, roles, and contacts</p>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-grow: 1; justify-content: flex-end; align-items: center">
                <div class="search-bar" style="width: 220px; height: 38px; margin-bottom: 0">
                    <i data-lucide="search" style="width: 14px"></i>
                    <input type="text" id="user-search" placeholder="Search users..." value="${userSearchQuery}" oninput="handleUserSearch(this.value)">
                </div>
                <select class="form-control" style="width: 150px; padding: 0.4rem; font-size: 0.85rem" onchange="handleUserRoleFilter(this.value)">
                    <option value="">All Roles</option>
                    ${State.roles.map(r => `<option value="${r.name}" ${userRoleFilter === r.name ? 'selected' : ''}>${r.name}</option>`).join('')}
                </select>
                <select class="form-control" style="width: 130px; padding: 0.4rem; font-size: 0.85rem" onchange="handleUserSort(this.value)">
                    <option value="name" ${userSortKey === 'name' ? 'selected' : ''}>Sort: A-Z</option>
                    <option value="newest" ${userSortKey === 'newest' ? 'selected' : ''}>Sort: Newest</option>
                </select>
                <button class="btn-primary" onclick="openUserSlider()">
                    <i data-lucide="user-plus"></i> Add User
                </button>
            </div>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 40%">User Information</th>
                        <th>Roles</th>
                        <th>Primary Contact</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredUsers.map(user => {
                        const primaryWA = user.whatsapp.find(w => w.isPrimary) || user.whatsapp[0] || { number: '-' };
                        return `
                        <tr class="clickable-row" onclick="openUserSlider(${user.id})">
                            <td>
                                <div style="display: flex; align-items: center; gap: 12px">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}" style="width: 32px; height: 32px; border-radius: 50%; background: #222">
                                    <div>
                                        <div style="font-weight: 600">${user.name}</div>
                                        <div style="font-size: 0.75rem; color: var(--text-muted)">${user.email}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div style="display: flex; flex-wrap: wrap; gap: 4px">
                                    ${user.roles.map(r => `<span class="status-badge" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); font-size: 0.7rem; padding: 1px 6px">${r}</span>`).join('')}
                                </div>
                            </td>
                            <td style="font-size: 0.9rem">
                                <div>${primaryWA.number}</div>
                                <div style="font-size: 0.7rem; color: var(--success)">Primary WhatsApp</div>
                            </td>
                            <td>
                                <span class="status-badge enabled" style="font-size: 0.75rem">Active</span>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                    ${filteredUsers.length === 0 ? `<tr><td colspan="4" style="text-align: center; padding: 4rem; color: var(--text-muted)">No users found matching your criteria.</td></tr>` : ''}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const handleUserSearch = (query) => { userSearchQuery = query; renderUsers(); document.getElementById('user-search').focus(); };
const handleUserRoleFilter = (role) => { userRoleFilter = role; renderUsers(); };
const handleUserSort = (sort) => { userSortKey = sort; renderUsers(); };

const openUserSlider = (id = null) => {
    const user = id ? State.users.find(u => u.id === id) : { 
        name: '', email: '', password: '', pincode: '', address: '', roles: [], 
        whatsapp: [{number: '', isPrimary: true}], 
        business: [{lat: '', lng: '', isPrimary: true}] 
    };
    userActiveTab = 'profile';
    modalContainer.classList.add('slider');
    renderUserSliderContent(id, user);
    modalContainer.classList.remove('hidden');
    lucide.createIcons();
};

const renderUserSliderContent = (id, user) => {
    modalTitle.innerText = id ? `User Profile: ${user.name}` : 'Create New User';
    
    modalBody.innerHTML = `
        <div class="tabs-container" style="display: flex; gap: 20px; border-bottom: 1px solid var(--glass-border); margin-bottom: 1.5rem; padding-bottom: 0; overflow-x: auto; white-space: nowrap">
            <div class="tab-item ${userActiveTab === 'profile' ? 'active' : ''}" onclick="switchUserTab('profile', ${id}, ${JSON.stringify(user).replace(/"/g, '&quot;')})" 
                style="padding: 0.75rem 0.5rem; cursor: pointer; color: ${userActiveTab === 'profile' ? 'var(--accent-primary)' : 'var(--text-muted)'}; position: relative; font-size: 0.85rem; font-weight: 500">
                General Profile
                ${userActiveTab === 'profile' ? '<div style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--accent-primary)"></div>' : ''}
            </div>
            <div class="tab-item ${userActiveTab === 'contacts' ? 'active' : ''}" onclick="switchUserTab('contacts', ${id}, ${JSON.stringify(user).replace(/"/g, '&quot;')})"
                style="padding: 0.75rem 0.5rem; cursor: pointer; color: ${userActiveTab === 'contacts' ? 'var(--accent-primary)' : 'var(--text-muted)'}; position: relative; font-size: 0.85rem; font-weight: 500">
                WhatsApp
                ${userActiveTab === 'contacts' ? '<div style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--accent-primary)"></div>' : ''}
            </div>
            <div class="tab-item ${userActiveTab === 'business' ? 'active' : ''}" onclick="switchUserTab('business', ${id}, ${JSON.stringify(user).replace(/"/g, '&quot;')})"
                style="padding: 0.75rem 0.5rem; cursor: pointer; color: ${userActiveTab === 'business' ? 'var(--accent-primary)' : 'var(--text-muted)'}; position: relative; font-size: 0.85rem; font-weight: 500">
                Business Details
                ${userActiveTab === 'business' ? '<div style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--accent-primary)"></div>' : ''}
            </div>
            <div class="tab-item ${userActiveTab === 'sessions' ? 'active' : ''}" onclick="switchUserTab('sessions', ${id}, ${JSON.stringify(user).replace(/"/g, '&quot;')})"
                style="padding: 0.75rem 0.5rem; cursor: pointer; color: ${userActiveTab === 'sessions' ? 'var(--accent-primary)' : 'var(--text-muted)'}; position: relative; font-size: 0.85rem; font-weight: 500">
                Login Sessions
                ${userActiveTab === 'sessions' ? '<div style="position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: var(--accent-primary)"></div>' : ''}
            </div>
        </div>

        <form id="user-slider-form">
            <div id="tab-content">
                ${renderUserTabContent(user)}
            </div>

            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center">
                <div>
                     ${id ? `<button type="button" class="icon-btn" style="color: var(--danger); width: auto; padding: 0 1rem; gap: 6px" onclick="deleteUser(${id})"><i data-lucide="trash-2"></i> Delete User</button>` : ''}
                </div>
                <button type="submit" class="btn-primary">
                    <i data-lucide="save"></i> ${id ? 'Save Changes' : 'Create User'}
                </button>
            </div>
        </form>
    `;

    document.getElementById('user-slider-form').onsubmit = (e) => {
        e.preventDefault();
        saveUserFromSlider(id, user);
    };
    lucide.createIcons();
};

const switchUserTab = (tab, id, currentUser) => {
    // Capture data from current tab before switching
    const currentData = captureUserUIState(currentUser);
    userActiveTab = tab;
    renderUserSliderContent(id, currentData);
};

const renderUserTabContent = (user) => {
    if (userActiveTab === 'profile') {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" class="form-control" id="user-name" value="${user.name}" required>
                </div>
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" class="form-control" id="user-email" value="${user.email}" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" class="form-control" id="user-password" value="${user.password || ''}" placeholder="••••••••">
                </div>
                <div class="form-group">
                    <label>Pincode</label>
                    <input type="text" class="form-control" id="user-pincode" value="${user.pincode}">
                </div>
            </div>
            <div class="form-group">
                <label>Address</label>
                <textarea class="form-control" id="user-address" rows="2">${user.address}</textarea>
            </div>
            <div class="form-group">
                <label>Assigned Roles</label>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: rgba(0,0,0,0.1); padding: 1rem; border-radius: 12px">
                    ${State.roles.map(role => `
                        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer">
                            <input type="checkbox" class="role-check" value="${role.name}" ${user.roles.includes(role.name) ? 'checked' : ''}>
                            ${role.name}
                        </label>
                    `).join('')}
                </div>
            </div>
        `;
    } else if (userActiveTab === 'contacts') {
        return `
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1rem">Manage multiple WhatsApp contacts linked to this user.</p>
            <div id="whatsapp-list" class="dynamic-list">
                ${user.whatsapp.map((w, i) => `
                    <div class="dynamic-item" style="background: rgba(255,255,255,0.02); padding: 10px; border-radius: 12px; border: 1px solid var(--glass-border)">
                        <input type="text" class="form-control wa-num" placeholder="91XXXXXXXXXX" value="${w.number}" style="flex: 1">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; min-width: 90px">
                            <input type="radio" name="primary-wa" class="wa-primary" ${w.isPrimary ? 'checked' : ''}> Set Primary
                        </label>
                        <button type="button" class="icon-btn" style="color: var(--danger)" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-primary" style="margin-top: 1rem; background: rgba(255,255,255,0.05); color: var(--text-main); border: 1px dashed var(--glass-border)" onclick="addDynamicItem('whatsapp-list')">
                <i data-lucide="plus"></i> Add Another Number
            </button>
        `;
    } else if (userActiveTab === 'business') {
        return `
            <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 1.5rem">Configure business footprints, GST, and names.</p>
            <div id="business-list" class="dynamic-list">
                ${user.business.map((b, i) => `
                    <div class="dynamic-item" style="display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border)">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
                            <div class="form-group" style="margin-bottom:0">
                                <label style="font-size: 0.7rem">Business Name</label>
                                <input type="text" class="form-control biz-name" placeholder="ABC Traders" value="${b.name || ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:0">
                                <label style="font-size: 0.7rem">GST Number</label>
                                <input type="text" class="form-control biz-gst" placeholder="27XXXX" value="${b.gst || ''}">
                            </div>
                        </div>
                        <div class="form-group" style="margin-bottom:0">
                            <label style="font-size: 0.7rem">Description</label>
                            <input type="text" class="form-control biz-desc" placeholder="Main warehouse for electronics" value="${b.desc || ''}">
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; opacity: 0.8">
                            <div class="form-group" style="margin-bottom:0">
                                <label style="font-size: 0.7rem">Latitude</label>
                                <input type="text" class="form-control biz-lat" placeholder="19.0760" value="${b.lat || ''}">
                            </div>
                            <div class="form-group" style="margin-bottom:0">
                                <label style="font-size: 0.7rem">Longitude</label>
                                <input type="text" class="form-control biz-lng" placeholder="72.8777" value="${b.lng || ''}">
                            </div>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px">
                            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer">
                                <input type="radio" name="primary-biz" class="biz-primary" ${b.isPrimary ? 'checked' : ''}> Set as Primary Business
                            </label>
                            <button type="button" class="icon-btn" style="color: var(--danger)" onclick="this.parentElement.parentElement.remove()"><i data-lucide="trash-2"></i> Remove</button>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button type="button" class="btn-primary" style="margin-top: 1rem; width: 100%; border: 1px dashed var(--glass-border); background: transparent" onclick="addDynamicItem('business-list')">
                <i data-lucide="plus"></i> Add New Business Location
            </button>
        `;
    } else {
        // sessions tab
        const mockSessions = [
            { id: 1, device: 'iPhone 15 Pro', ip: '122.161.45.2', time: 'Today, 10:45 AM', location: 'Mumbai, India' },
            { id: 2, device: 'MacBook Pro M2', ip: '122.161.45.2', time: 'Yesterday, 09:20 PM', location: 'Mumbai, India' },
            { id: 3, device: 'Windows PC (Chrome)', ip: '106.213.12.9', time: '15 Feb 2024', location: 'Delhi, India' }
        ];
        return `
            <div class="table-container" style="background: transparent; border: none">
                <p class="text-muted" style="font-size: 0.8rem; margin-bottom: 1.5rem">Track recent account activity and login locations.</p>
                <table style="font-size: 0.8rem">
                    <thead style="background: rgba(255,255,255,0.02)">
                        <tr><th>Device / Info</th><th>Location</th><th>Activity</th></tr>
                    </thead>
                    <tbody>
                        ${mockSessions.map(s => `
                            <tr>
                                <td>
                                    <div style="font-weight: 500">${s.device}</div>
                                    <div style="font-size: 0.7rem; color: var(--text-muted)">IP: ${s.ip}</div>
                                </td>
                                <td>${s.location}</td>
                                <td style="color: var(--text-muted)">${s.time}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 2rem; background: rgba(239, 68, 68, 0.05); padding: 1rem; border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.1)">
                <h4 style="color: #ef4444; font-size: 0.85rem; margin-bottom: 0.5rem">Security Settings</h4>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 1rem">Log out of all other active sessions on different devices.</p>
                <button type="button" class="btn-primary" style="background: #ef4444; width: 100%; font-size: 0.8rem">Logout All Sessions</button>
            </div>
        `;
    }
};

const captureUserUIState = (currentUser) => {
    const roles = Array.from(document.querySelectorAll('.role-check:checked') || []).map(cb => cb.value);
    
    // Capture WhatsApp
    const whatsapp = [];
    document.querySelectorAll('#whatsapp-list .dynamic-item').forEach(item => {
        const number = item.querySelector('.wa-num').value;
        const isPrimary = item.querySelector('.wa-primary').checked;
        if(number) whatsapp.push({ number, isPrimary });
    });

    // Capture Business
    const business = [];
    document.querySelectorAll('#business-list .dynamic-item').forEach(item => {
        const name = item.querySelector('.biz-name').value;
        const gst = item.querySelector('.biz-gst').value;
        const desc = item.querySelector('.biz-desc').value;
        const lat = item.querySelector('.biz-lat').value;
        const lng = item.querySelector('.biz-lng').value;
        const isPrimary = item.querySelector('.biz-primary').checked;
        if(name || lat || lng) business.push({ name, gst, desc, lat, lng, isPrimary });
    });

    return {
        ...currentUser,
        name: document.getElementById('user-name')?.value || currentUser.name,
        email: document.getElementById('user-email')?.value || currentUser.email,
        password: document.getElementById('user-password')?.value || currentUser.password,
        pincode: document.getElementById('user-pincode')?.value || currentUser.pincode,
        address: document.getElementById('user-address')?.value || currentUser.address,
        roles: roles.length ? roles : currentUser.roles,
        whatsapp: whatsapp.length ? whatsapp : currentUser.whatsapp,
        business: business.length ? business : currentUser.business
    };
};

const saveUserFromSlider = (id, user) => {
    const finalData = captureUserUIState(user);

    if (id) {
        const idx = State.users.findIndex(u => u.id === id);
        State.users[idx] = { ...finalData, id };
    } else {
        State.users.push({ ...finalData, id: Date.now() });
    }

    saveData();
    closeModal();
    renderUsers();
};

const addDynamicItem = (listId) => {
    const list = document.getElementById(listId);
    if (listId === 'whatsapp-list') {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.style = 'background: rgba(255,255,255,0.02); padding: 10px; border-radius: 12px; border: 1px solid var(--glass-border)';
        item.innerHTML = `
            <input type="text" class="form-control wa-num" placeholder="91XXXXXXXXXX" style="flex: 1">
            <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; min-width: 90px">
                <input type="radio" name="primary-wa" class="wa-primary"> Set Primary
            </label>
            <button type="button" class="icon-btn" style="color: var(--danger)" onclick="this.parentElement.remove()"><i data-lucide="x"></i></button>
        `;
        list.appendChild(item);
    } else if (listId === 'business-list') {
        const item = document.createElement('div');
        item.className = 'dynamic-item';
        item.style = 'display: flex; flex-direction: column; gap: 12px; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 16px; border: 1px solid var(--glass-border)';
        item.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px">
                <div class="form-group" style="margin-bottom:0">
                    <label style="font-size: 0.7rem">Business Name</label>
                    <input type="text" class="form-control biz-name" placeholder="ABC Traders">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <label style="font-size: 0.7rem">GST Number</label>
                    <input type="text" class="form-control biz-gst" placeholder="27XXXX">
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0">
                <label style="font-size: 0.7rem">Description</label>
                <input type="text" class="form-control biz-desc" placeholder="Brief description">
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; opacity: 0.8">
                <div class="form-group" style="margin-bottom:0">
                    <label style="font-size: 0.7rem">Latitude</label>
                    <input type="text" class="form-control biz-lat" placeholder="19.0760">
                </div>
                <div class="form-group" style="margin-bottom:0">
                    <label style="font-size: 0.7rem">Longitude</label>
                    <input type="text" class="form-control biz-lng" placeholder="72.8777">
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 5px">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.75rem; cursor: pointer">
                    <input type="radio" name="primary-biz" class="biz-primary"> Set as Primary
                </label>
                <button type="button" class="icon-btn" style="color: var(--danger)" onclick="this.parentElement.parentElement.remove()"><i data-lucide="trash-2"></i> Remove</button>
            </div>
        `;
        list.appendChild(item);
    }
    lucide.createIcons();
};

const deleteUser = (id) => {
    if(confirm('Are you sure you want to delete this user?')) {
        State.users = State.users.filter(u => u.id !== id);
        saveData();
        renderUsers();
    }
};

// --- Modules Management Component ---
const renderModules = () => {
    contentArea.innerHTML = `
        <div class="table-header" style="flex-wrap: wrap; gap: 1rem">
            <div>
                <h2>System Modules</h2>
                <p class="text-muted">Hierarchical capabilities sorted by priority</p>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-grow: 1; justify-content: flex-end; align-items: center">
                <div class="search-bar" style="width: 250px; height: 38px; margin-bottom: 0">
                    <i data-lucide="search" style="width: 14px"></i>
                    <input type="text" id="module-page-search" placeholder="Search modules..." value="${modulePageSearchQuery}" oninput="handleModulePageSearch(this.value)">
                </div>
                <button class="btn-primary" onclick="openModuleSlider()">
                    <i data-lucide="plus-circle"></i> Create Root Module
                </button>
            </div>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 75%">Module Details</th>
                        <th style="width: 25%">Status</th>
                    </tr>
                </thead>
                <tbody id="modules-tree-body">
                    ${renderModuleTree(State.modules)}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const handleModulePageSearch = (query) => {
    modulePageSearchQuery = query;
    renderModules();
    document.getElementById('module-page-search').focus();
};

const renderModuleTree = (modules, level = 0, path = []) => {
    if (!modules || modules.length === 0) return '';
    
    // Check if module or any descendant matches search
    const matchesSearch = (mod) => {
        if (!modulePageSearchQuery) return true;
        const selfMatches = mod.name.toLowerCase().includes(modulePageSearchQuery.toLowerCase()) || 
                           (mod.description && mod.description.toLowerCase().includes(modulePageSearchQuery.toLowerCase()));
        const childrenMatch = mod.subModules && mod.subModules.some(sub => matchesSearch(sub));
        return selfMatches || childrenMatch;
    };

    return modules
        .filter(mod => matchesSearch(mod))
        .sort((a, b) => (a.priority || 0) - (b.priority || 0))
        .map((mod, index) => {
            const indent = level * 30;
            const currentPath = [...path, index];
            const pathStr = currentPath.join(',');
            
            return `
                <tr class="clickable-row" onclick="openModuleSlider('${pathStr}')">
                    <td>
                        <div style="display: flex; align-items: flex-start; gap: 12px; padding-left: ${indent}px">
                            <div style="margin-top: 4px">
                                ${level > 0 ? '<i data-lucide="corner-down-right" style="width: 14px; opacity: 0.5"></i>' : '<i data-lucide="box" style="width: 18px; color: var(--accent-primary)"></i>'}
                            </div>
                            <div>
                                <div style="font-weight: ${level === 0 ? '700' : '500'}; font-size: 1rem">${mod.name}</div>
                                <div class="text-muted" style="font-size: 0.75rem; margin-top: 2px">${mod.description || 'No description provided.'}</div>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="status-badge ${mod.enabled ? 'enabled' : 'disabled'}">${mod.enabled ? 'Active' : 'Disabled'}</span>
                    </td>
                </tr>
                ${renderModuleTree(mod.subModules, level + 1, currentPath)}
            `;
        }).join('');
};

const openModuleSlider = (pathStr = null, isAddSub = false) => {
    modalContainer.classList.add('slider');
    let mod = { name: '', description: '', enabled: true, subModules: [] };
    let parentName = 'Root';
    
    if (pathStr !== null) {
        const indices = pathStr.split(',').map(Number);
        let current = State.modules;
        let target = null;
        indices.forEach((idx, i) => {
            if (i === indices.length - 1) {
                target = current[idx];
            } else {
                current = current[idx].subModules;
            }
        });
        
        if (isAddSub) {
            parentName = target.name;
            mod = { name: '', description: '', enabled: true, subModules: [] };
        } else {
            mod = target;
        }
    }

    renderModuleSliderContent(pathStr, mod, isAddSub, parentName);
    modalContainer.classList.remove('hidden');
    lucide.createIcons();
};

const switchModuleTab = (tab, pathStr) => {
    moduleActiveTab = tab;
    // We need to re-find the module and parent info since we're re-rendering
    const indices = pathStr ? pathStr.split(',').map(Number) : null;
    let mod = { name: '', description: '', enabled: true, priority: 1, subModules: [] };
    let parentName = 'Root';
    
    if (indices) {
        let current = State.modules;
        indices.forEach((idx, i) => {
            if (i === indices.length - 1) mod = current[idx];
            else current = current[idx].subModules;
        });
    }
    renderModuleSliderContent(pathStr, mod, false, parentName);
};

const renderModuleSliderContent = (pathStr, mod, isAddSub, parentName) => {
    const isEdit = pathStr !== null && !isAddSub;
    modalTitle.innerText = isAddSub ? `New Sub-module for ${parentName}` : (pathStr ? `Module: ${mod.name}` : 'New Root Module');
    
    const moduleLogs = isEdit ? State.auditLogs.filter(l => l.moduleId === mod.id) : [];

    modalBody.innerHTML = `
        <div class="tabs-container" style="display: flex; gap: 20px; border-bottom: 1px solid var(--glass-border); margin-bottom: 1.5rem; padding-bottom: 0; overflow-x: auto; white-space: nowrap">
            <div class="tab-item ${moduleActiveTab === 'config' ? 'active' : ''}" onclick="switchModuleTab('config', '${pathStr}')">
                <i data-lucide="settings" style="width: 16px"></i> Configuration
            </div>
            ${isEdit ? `
            <div class="tab-item ${moduleActiveTab === 'activity' ? 'active' : ''}" onclick="switchModuleTab('activity', '${pathStr}')">
                <i data-lucide="history" style="width: 16px"></i> Activity Log
            </div>
            ` : ''}
        </div>

        <div class="tab-content">
            ${moduleActiveTab === 'config' ? `
                <section class="edit-section" style="max-width: 600px">
                    <form id="module-slider-form">
                        <div class="form-group">
                            <label>Module Name</label>
                            <input type="text" class="form-control" id="mod-name" value="${mod.name}" required>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <textarea class="form-control" id="mod-desc" rows="3">${mod.description || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label>Display Position</label>
                            <input type="number" class="form-control" id="mod-priority" value="${mod.priority || 0}" min="0">
                            <p class="text-muted" style="font-size: 0.7rem; margin-top: 4px">Lower numbers appear first in the sidebar and tables.</p>
                        </div>
                        
                        ${isEdit ? `
                        <div style="margin-top: 1.5rem">
                            <button type="button" class="btn-primary" style="width: 100%; background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); border: 1px dashed var(--accent-primary)" onclick="openModuleSlider('${pathStr}', true)">
                                <i data-lucide="plus-circle"></i> Add Child Module
                            </button>
                        </div>
                        ` : ''}

                        <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center">
                            <div style="display: flex; align-items: center; gap: 10px">
                                 <span style="font-size: 0.9rem; color: var(--text-muted)">Status:</span>
                                 <button type="button" class="status-badge ${mod.enabled ? 'enabled' : 'disabled'}" style="cursor: pointer; border: none; font-size: 0.75rem" 
                                    onclick="toggleModuleStatusInsideSlider('${pathStr}', ${mod.enabled})">
                                    ${mod.enabled ? 'Active' : 'Disabled'}
                                 </button>
                            </div>
                            <button type="submit" class="btn-primary">
                                <i data-lucide="save"></i> ${isEdit ? 'Save Changes' : 'Create Module'}
                            </button>
                        </div>
                    </form>
                </section>
            ` : `
                <section class="audit-section">
                    <div class="table-container" style="border-radius: 12px; max-height: 500px; overflow-y: auto">
                        <table style="font-size: 0.85rem">
                            <thead>
                                <tr>
                                    <th style="width: 50%">Action Taken</th>
                                    <th>Performed By</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${moduleLogs.map(log => `
                                    <tr>
                                        <td>
                                            <div style="display: flex; align-items: center; gap: 8px">
                                                <div style="width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary)"></div>
                                                <span style="font-weight: 500">${log.action}</span>
                                            </div>
                                        </td>
                                        <td class="text-muted">${log.user || 'System'}</td>
                                        <td class="text-muted">${log.time}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 2rem">No activity recorded yet for this module.</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </section>
            `}
        </div>
    `;

    if (moduleActiveTab === 'config') {
        document.getElementById('module-slider-form').onsubmit = (e) => {
            e.preventDefault();
            saveModuleFromSlider(pathStr, isAddSub, mod);
        };
    }
    lucide.createIcons();
};

const toggleModuleStatusInsideSlider = (pathStr, currentStatus) => {
    if (!pathStr) return;
    const indices = pathStr.split(',').map(Number);
    let current = State.modules;
    let target;
    indices.forEach((idx, i) => {
        if (i === indices.length - 1) target = current[idx];
        else current = current[idx].subModules;
    });
    
    target.enabled = !currentStatus;
    addModuleAuditLog(target.id, target.enabled ? 'Status: Active' : 'Status: Disabled');
    saveData();
    renderModuleSliderContent(pathStr, target, false, null);
};

const saveModuleFromSlider = (pathStr, isAddSub, originalMod) => {
    const name = document.getElementById('mod-name').value;
    const description = document.getElementById('mod-desc').value;
    const priority = parseInt(document.getElementById('mod-priority').value);
    
    const data = {
        id: originalMod.id || Date.now() + Math.floor(Math.random() * 1000),
        name,
        description,
        priority,
        enabled: originalMod.enabled,
        subModules: isAddSub ? [] : originalMod.subModules
    };

    if (pathStr === null) {
        State.modules.push(data);
        addModuleAuditLog(data.id, 'Root Module Created');
    } else {
        const indices = pathStr.split(',').map(Number);
        let current = State.modules;
        if (isAddSub) {
            indices.forEach(idx => { current = current[idx].subModules; });
            current.push(data);
            addModuleAuditLog(data.id, 'Sub-module Created');
        } else {
            indices.forEach((idx, i) => {
                if (i === indices.length - 1) {
                    current[idx] = data;
                } else {
                    current = current[idx].subModules;
                }
            });
            addModuleAuditLog(data.id, 'Module Settings Updated');
        }
    }
    
    saveData();
    closeModal();
    renderModules();
};

const addModuleAuditLog = (moduleId, action) => {
    State.auditLogs.unshift({
        id: Date.now(),
        moduleId,
        action,
        user: 'Super Admin',
        time: new Date().toLocaleString()
    });
    saveData();
};

// --- Products Management Component ---
const renderProducts = () => {
    contentArea.innerHTML = `
        <div class="table-header" style="flex-wrap: wrap; gap: 1rem">
            <div>
                <h2>Product Catalog</h2>
                <p class="text-muted">Manage hierarchical categories and products</p>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-grow: 1; justify-content: flex-end; align-items: center">
                <div class="search-bar" style="width: 250px; height: 38px; margin-bottom: 0">
                    <i data-lucide="search" style="width: 14px"></i>
                    <input type="text" id="product-page-search" placeholder="Search catalog..." value="${productPageSearchQuery}" oninput="handleProductPageSearch(this.value)">
                </div>
                <button class="btn-primary" onclick="openProductSlider()">
                    <i data-lucide="plus-circle"></i> Create Root Category
                </button>
            </div>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 60%">Item Name</th>
                        <th style="width: 15%; text-align: center">Type</th>
                        <th style="width: 25%">Status</th>
                    </tr>
                </thead>
                <tbody id="products-tree-body">
                    ${renderProductTree(State.products)}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const handleProductPageSearch = (query) => {
    productPageSearchQuery = query;
    renderProducts();
    document.getElementById('product-page-search').focus();
};

const renderProductTree = (items, level = 0, path = []) => {
    if (!items || items.length === 0) return '';
    
    const matchesSearch = (item) => {
        if (!productPageSearchQuery) return true;
        const selfMatches = item.name.toLowerCase().includes(productPageSearchQuery.toLowerCase());
        const childrenMatch = item.subItems && item.subItems.some(sub => matchesSearch(sub));
        return selfMatches || childrenMatch;
    };

    return items
        .filter(item => matchesSearch(item))
        .map((item, index) => {
            const indent = level * 30;
            const currentPath = [...path, index];
            const pathStr = currentPath.join(',');
            const isCategory = item.type === 'category';
            
            return `
                <tr class="clickable-row" onclick="openProductSlider('${pathStr}')">
                    <td>
                        <div style="display: flex; align-items: center; gap: 12px; padding-left: ${indent}px">
                            ${level > 0 ? '<i data-lucide="corner-down-right" style="width: 14px; opacity: 0.5"></i>' : ''}
                            <div style="background: ${isCategory ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)'}; color: ${isCategory ? 'var(--accent-primary)' : '#10b981'}; padding: 6px; border-radius: 6px">
                                <i data-lucide="${isCategory ? 'folder' : 'package'}" style="width: 16px"></i>
                            </div>
                            <div>
                                <div style="font-weight: ${isCategory ? '700' : '500'}; font-size: 0.95rem">${item.name}</div>
                                ${item.type === 'product' ? `<div class="text-muted" style="font-size: 0.75rem">$${item.price} • ${item.stock} in stock</div>` : ''}
                            </div>
                        </div>
                    </td>
                    <td style="text-align: center">
                        <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px; color: var(--text-muted)">
                            ${item.type}
                        </span>
                    </td>
                    <td>
                        <span class="status-badge ${item.enabled !== false ? 'enabled' : 'disabled'}">${item.enabled !== false ? 'Active' : 'Disabled'}</span>
                    </td>
                </tr>
                ${renderProductTree(item.subItems, level + 1, currentPath)}
            `;
        }).join('');
};

const openProductSlider = (pathStr = null, forceType = null) => {
    modalContainer.classList.add('slider');
    let item = { name: '', description: '', type: forceType || 'category', enabled: true, subItems: [], price: 0, stock: 0 };
    let parentName = 'Root';
    
    if (pathStr !== null) {
        const indices = pathStr.split(',').map(Number);
        let current = State.products;
        let target = null;
        indices.forEach((idx, i) => {
            if (i === indices.length - 1) target = current[idx];
            else current = current[idx].subItems;
        });
        
        if (forceType) {
            parentName = target.name;
            item = { name: '', description: '', type: forceType, enabled: true, subItems: [], price: 0, stock: 0 };
        } else {
            item = target;
        }
    }

    renderProductSliderContent(pathStr, item, forceType !== null, parentName);
    modalContainer.classList.remove('hidden');
    lucide.createIcons();
};

const switchProductTab = (tab, pathStr) => {
    productActiveTab = tab;
    // Re-find target for re-render
    const indices = pathStr ? pathStr.split(',').map(Number) : null;
    let item = { name: '', description: '', type: 'category', enabled: true, subItems: [], price: 0, stock: 0 };
    if (indices) {
        let current = State.products;
        indices.forEach((idx, i) => {
            if (i === indices.length - 1) item = current[idx];
            else current = current[idx].subItems;
        });
    }
    renderProductSliderContent(pathStr, item, false, 'Root');
};

const renderProductSliderContent = (pathStr, item, isNew, parentName) => {
    const isEdit = pathStr !== null && !isNew;
    modalTitle.innerText = isNew ? `Add ${item.type} to ${parentName}` : (pathStr ? `Edit ${item.type}: ${item.name}` : 'Create Root Category');
    
    const logs = isEdit ? State.auditLogs.filter(l => l.productId === item.id) : [];

    modalBody.innerHTML = `
        <div class="tabs-container" style="display: flex; gap: 20px; border-bottom: 1px solid var(--glass-border); margin-bottom: 1.5rem; padding-bottom: 0; overflow-x: auto; white-space: nowrap">
            <div class="tab-item ${productActiveTab === 'info' ? 'active' : ''}" onclick="switchProductTab('info', '${pathStr}')">
                <i data-lucide="info" style="width: 16px"></i> General Info
            </div>
            ${item.type === 'product' ? `
            <div class="tab-item ${productActiveTab === 'inventory' ? 'active' : ''}" onclick="switchProductTab('inventory', '${pathStr}')">
                <i data-lucide="database" style="width: 16px"></i> Inventory & Price
            </div>
            ` : ''}
            ${isEdit ? `
            <div class="tab-item ${productActiveTab === 'activity' ? 'active' : ''}" onclick="switchProductTab('activity', '${pathStr}')">
                <i data-lucide="history" style="width: 16px"></i> Activity Log
            </div>
            ` : ''}
        </div>

        <div class="tab-content">
            ${productActiveTab === 'info' ? `
                <form id="product-slider-form">
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" class="form-control" id="prod-name" value="${item.name}" required>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea class="form-control" id="prod-desc" rows="3">${item.description || ''}</textarea>
                    </div>
                    
                    ${isEdit && item.type === 'category' ? `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1.5rem">
                        <button type="button" class="btn-primary" style="background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); border: 1px dashed var(--accent-primary)" onclick="openProductSlider('${pathStr}', 'category')">
                            <i data-lucide="folder-plus"></i> Add Sub-Category
                        </button>
                        <button type="button" class="btn-primary" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px dashed #10b981" onclick="openProductSlider('${pathStr}', 'product')">
                            <i data-lucide="plus-circle"></i> Add Product
                        </button>
                    </div>
                    ` : ''}

                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); display: flex; justify-content: space-between; align-items: center">
                        <div style="display: flex; align-items: center; gap: 10px">
                             <span style="font-size: 0.9rem; color: var(--text-muted)">Status:</span>
                             <button type="button" class="status-badge ${item.enabled !== false ? 'enabled' : 'disabled'}" style="cursor: pointer; border: none" onclick="toggleProductStatusInsideSlider('${pathStr}', ${item.enabled !== false})">
                                ${item.enabled !== false ? 'Active' : 'Disabled'}
                             </button>
                        </div>
                        <button type="submit" class="btn-primary">
                            <i data-lucide="save"></i> ${isEdit ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            ` : productActiveTab === 'inventory' ? `
                <form id="product-slider-form">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem">
                        <div class="form-group">
                            <label>Sale Price ($)</label>
                            <input type="number" class="form-control" id="prod-price" value="${item.price || 0}" step="0.01">
                        </div>
                        <div class="form-group">
                            <label>Stock Level</label>
                            <input type="number" class="form-control" id="prod-stock" value="${item.stock || 0}">
                        </div>
                    </div>
                    <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--glass-border); text-align: right">
                        <button type="submit" class="btn-primary">
                            <i data-lucide="save"></i> Save Pricing
                        </button>
                    </div>
                </form>
            ` : `
                <div class="table-container" style="border-radius: 12px; max-height: 500px; overflow-y: auto">
                    <table style="font-size: 0.85rem">
                        <thead>
                            <tr><th>Action</th><th>User</th><th>Timestamp</th></tr>
                        </thead>
                        <tbody>
                            ${logs.map(log => `
                                <tr>
                                    <td>${log.action}</td>
                                    <td class="text-muted">Super Admin</td>
                                    <td class="text-muted">${log.time}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="text-align: center; padding: 2rem">No activity yet.</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `}
        </div>
    `;

    const form = document.getElementById('product-slider-form');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            saveProductFromSlider(pathStr, isNew, item);
        };
    }
    lucide.createIcons();
};

const toggleProductStatusInsideSlider = (pathStr, currentStatus) => {
    const indices = pathStr.split(',').map(Number);
    let current = State.products;
    let target;
    indices.forEach((idx, i) => {
        if (i === indices.length - 1) target = current[idx];
        else current = current[idx].subItems;
    });
    target.enabled = !currentStatus;
    addProductAuditLog(target.id, target.enabled ? 'Item Enabled' : 'Item Disabled');
    saveData();
    renderProductSliderContent(pathStr, target, false, null);
};

const saveProductFromSlider = (pathStr, isNew, originalItem) => {
    const nameEl = document.getElementById('prod-name');
    const descEl = document.getElementById('prod-desc');
    const priceEl = document.getElementById('prod-price');
    const stockEl = document.getElementById('prod-stock');

    const data = {
        ...originalItem,
        name: nameEl ? nameEl.value : originalItem.name,
        description: descEl ? descEl.value : originalItem.description,
        price: priceEl ? parseFloat(priceEl.value) : originalItem.price,
        stock: stockEl ? parseInt(stockEl.value) : originalItem.stock,
        id: originalItem.id || Date.now() + Math.floor(Math.random() * 1000)
    };

    if (pathStr === null) {
        State.products.push(data);
        addProductAuditLog(data.id, 'Category Created');
    } else {
        const indices = pathStr.split(',').map(Number);
        let current = State.products;
        if (isNew) {
            indices.forEach(idx => { current = current[idx].subItems; });
            current.push(data);
            addProductAuditLog(data.id, data.type === 'category' ? 'Sub-Category Created' : 'Product Added');
        } else {
            indices.forEach((idx, i) => {
                if (i === indices.length - 1) current[idx] = data;
                else current = current[idx].subItems;
            });
            addProductAuditLog(data.id, 'Settings Updated');
        }
    }

    saveData();
    closeModal();
    renderProducts();
};

const addProductAuditLog = (productId, action) => {
    State.auditLogs.unshift({
        id: Date.now(),
        productId,
        action,
        time: new Date().toLocaleString()
    });
    saveData();
};

// --- Vendor Management Component ---
const renderVendors = () => {
    const vendors = JSON.parse(localStorage.getItem('distro_vendors')) || [
        { id: 1, name: 'Eco Logistics', address: 'Bandra, Mumbai', contact: '9000011111' }
    ];

    contentArea.innerHTML = `
        <div class="table-header">
            <div>
                <h2>Vendor Information</h2>
                <p class="text-muted">Information storage for third-party vendors (No login access)</p>
            </div>
            <button class="btn-primary" onclick="openVendorModal()">
                <i data-lucide="plus"></i> Add Vendor
            </button>
        </div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Vendor Name</th>
                        <th>Address</th>
                        <th>Contact</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${vendors.map(v => `
                        <tr>
                            <td><strong>${v.name}</strong></td>
                            <td>${v.address}</td>
                            <td>${v.contact}</td>
                            <td>
                                <div class="action-btns">
                                    <button class="icon-btn" onclick="openVendorModal(${v.id})"><i data-lucide="edit-3"></i></button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    lucide.createIcons();
};

const openVendorModal = (id = null) => {
    const vendors = JSON.parse(localStorage.getItem('distro_vendors')) || [];
    const v = id ? vendors.find(x => x.id === id) : { name: '', address: '', contact: '' };
    
    modalTitle.innerHTML = id ? 'Edit Vendor' : 'Add Vendor';
    modalBody.innerHTML = `
        <form id="vendor-form">
            <div class="form-group">
                <label>Vendor Name</label>
                <input type="text" class="form-control" id="v-name" value="${v.name}" required>
            </div>
            <div class="form-group">
                <label>Address</label>
                <input type="text" class="form-control" id="v-address" value="${v.address}">
            </div>
            <div class="form-group">
                <label>Contact Number</label>
                <input type="text" class="form-control" id="v-contact" value="${v.contact}">
            </div>
            <button type="submit" class="btn-primary" style="width:100%">${id ? 'Update' : 'Save'}</button>
        </form>
    `;
    modalContainer.classList.remove('hidden');

    document.getElementById('vendor-form').onsubmit = (e) => {
        e.preventDefault();
        const vendors = JSON.parse(localStorage.getItem('distro_vendors')) || [];
        const data = {
            id: id || Date.now(),
            name: document.getElementById('v-name').value,
            address: document.getElementById('v-address').value,
            contact: document.getElementById('v-contact').value
        };

        if(id) {
            const idx = vendors.findIndex(x => x.id === id);
            vendors[idx] = data;
        } else {
            vendors.push(data);
        }

        localStorage.setItem('distro_vendors', JSON.stringify(vendors));
        closeModal();
        renderVendors();
    };
};

// --- Mobile Preview Feature ---
const renderMobilePreview = (role) => {
    contentArea.innerHTML = `
        <div class="page-header">
            <h2>Mobile View Preview (${role})</h2>
            <p class="text-muted">Simulating the mobile application interface for ${role}s</p>
        </div>
        <div style="display: flex; justify-content: center; margin-top: 2rem;">
            <div style="width: 320px; height: 640px; background: #000; border: 8px solid #333; border-radius: 40px; position: relative; overflow: hidden; box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);">
                <div style="height: 30px; background: #000;"></div>
                <div style="padding: 20px; color: #fff; height: 100%; display: flex; flex-direction: column;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px;">
                        <div>
                            <p style="font-size: 0.8rem; color: #999;">Welcome back,</p>
                            <h4 style="margin: 0;">${role === 'Driver' ? 'Ramesh' : 'Customer'}</h4>
                        </div>
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mobile" style="width: 40px; border-radius: 50%;">
                    </div>
                    
                    <div style="background: linear-gradient(135deg, #6366f1, #a855f7); padding: 20px; border-radius: 20px; margin-bottom: 20px;">
                        <p style="margin: 0; font-size: 0.8rem; opacity: 0.8;">My Balance</p>
                        <h2 style="margin: 10px 0;">₹ 45,280</h2>
                        <div style="font-size: 0.7rem; background: rgba(255,255,255,0.2); width: fit-content; padding: 4px 8px; border-radius: 10px;">Primary Business</div>
                    </div>

                    <p style="font-weight: 600; font-size: 0.9rem; margin-bottom: 15px;">Active Tasks</p>
                    <div style="background: #1a1a1a; padding: 15px; border-radius: 15px; margin-bottom: 10px; display: flex; gap: 15px;">
                        <div style="background: rgba(16,185,129,0.1); padding: 10px; border-radius: 10px;"><i data-lucide="package" style="color: #10b981; width: 20px;"></i></div>
                        <div>
                            <p style="margin:0; font-size: 0.85rem;">Order #8921</p>
                            <p style="margin:0; font-size: 0.7rem; color: #666;">In Transit | Mumbai</p>
                        </div>
                    </div>

                    <div style="flex: 1;"></div>
                    
                    <div style="display: flex; justify-content: space-around; padding: 15px 0; border-top: 1px solid #333;">
                        <i data-lucide="home" style="width: 20px; color: #6366f1;"></i>
                        <i data-lucide="search" style="width: 20px;"></i>
                        <i data-lucide="bell" style="width: 20px;"></i>
                        <i data-lucide="user" style="width: 20px;"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
};

// Add to navigation or custom triggers
// For now, let's just make the Driver/Customer list items in roles trigger this preview?
// Or better, add a "Mobile Preview" link in the sidebar.

// --- Modal Utilities ---
const closeModal = () => {
    modalContainer.classList.add('hidden');
    modalContainer.classList.remove('slider');
};

closeModalBtn.onclick = closeModal;
window.onclick = (e) => { if(e.target === modalContainer) closeModal(); };

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    renderPage('dashboard');
});
