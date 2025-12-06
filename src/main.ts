// ===== Types =====
interface PromptCard {
  id: string;
  title: string;
  content: string;
  columnId: string;
  tags: string[];
  icon: string;
  label: string;
  // Advanced LLM Options
  model: string;
  temperature: number;
  topK: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Column {
  id: string;
  title: string;
  icon: string;
  order: number;
}

// ===== Default Data =====
const defaultColumns: Column[] = [
  { id: 'ideas', title: 'Ideas', icon: '💡', order: 0 },
  { id: 'inprogress', title: 'In Progress', icon: '🔄', order: 1 },
  { id: 'ready', title: 'Ready', icon: '✅', order: 2 },
  { id: 'archive', title: 'Archive', icon: '📦', order: 3 },
];

const sampleCards: PromptCard[] = [
  {
    id: '1',
    title: 'Code Review Helper',
    content: 'Please review the following code and provide feedback on:\n1. Code quality and readability\n2. Best practices and patterns\n3. Potential bugs or issues\n4. Performance improvements\n5. Security considerations',
    columnId: 'ready',
    tags: ['coding', 'review'],
    icon: '🔧',
    label: 'blue',
    model: 'gpt-4',
    temperature: 0.7,
    topK: 40,
    maxTokens: 2048,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Writing Assistant',
    content: 'Help me write a professional email that:\n- Is concise and clear\n- Maintains a friendly but professional tone\n- Gets straight to the point\n- Includes a clear call-to-action',
    columnId: 'ready',
    tags: ['writing', 'email'],
    icon: '✨',
    label: 'purple',
    model: 'claude-3-sonnet',
    temperature: 0.8,
    topK: 40,
    maxTokens: 4096,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Brainstorm Session',
    content: 'Generate 10 creative ideas for improving user engagement in a mobile app. Consider gamification, social features, and personalization.',
    columnId: 'ideas',
    tags: ['brainstorm', 'creativity'],
    icon: '💡',
    label: 'yellow',
    model: 'gpt-4-turbo',
    temperature: 1.0,
    topK: 50,
    maxTokens: 2048,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    title: 'Debug Assistant',
    content: 'I have an error in my code. Here is the error message and relevant code snippet. Please help me identify the root cause and suggest a fix.',
    columnId: 'inprogress',
    tags: ['debugging', 'coding'],
    icon: '🚀',
    label: 'red',
    model: 'gpt-4',
    temperature: 0.3,
    topK: 20,
    maxTokens: 4096,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    title: 'Meeting Summary',
    content: 'Summarize the key points from this meeting transcript:\n- Main decisions made\n- Action items with owners\n- Next steps and deadlines\n- Open questions',
    columnId: 'ready',
    tags: ['productivity', 'summary'],
    icon: '📊',
    label: 'green',
    model: 'gemini-pro',
    temperature: 0.5,
    topK: 40,
    maxTokens: 8192,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// ===== State =====
let columns: Column[] = [...defaultColumns];
let cards: PromptCard[] = [...sampleCards];
let selectedCardId: string | null = null;
let editingCardId: string | null = null;
let draggedCardId: string | null = null;

// ===== DOM Elements =====
let boardEl: HTMLElement | null;
let searchModal: HTMLElement | null;
let searchInput: HTMLInputElement | null;
let searchResults: HTMLElement | null;
let promptModal: HTMLElement | null;
let promptForm: HTMLFormElement | null;
let modalTitle: HTMLElement | null;
let viewModal: HTMLElement | null;

// ===== Initialize =====
window.addEventListener('DOMContentLoaded', () => {
  // Get DOM elements
  boardEl = document.getElementById('board');
  searchModal = document.getElementById('search-modal');
  searchInput = document.getElementById('search-input') as HTMLInputElement;
  searchResults = document.getElementById('search-results');
  promptModal = document.getElementById('prompt-modal');
  promptForm = document.getElementById('prompt-form') as HTMLFormElement;
  modalTitle = document.getElementById('modal-title');
  viewModal = document.getElementById('view-modal');

  // Initialize UI
  renderBoard();
  populateColumnSelect();
  setupEventListeners();
});

// ===== Render Functions =====
function renderBoard(): void {
  if (!boardEl) return;

  boardEl.innerHTML = columns
    .sort((a, b) => a.order - b.order)
    .map(column => {
      const columnCards = cards.filter(c => c.columnId === column.id);
      return `
        <div class="column" data-column-id="${column.id}">
          <div class="column-header">
            <span class="column-title">
              ${column.icon} ${column.title}
            </span>
            <span class="column-count">${columnCards.length}</span>
          </div>
          <div class="column-cards" data-column-id="${column.id}">
            ${columnCards.length > 0
          ? columnCards.map(card => renderCard(card)).join('')
          : `<div class="empty-column">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                  <p>Drop cards here</p>
                </div>`
        }
          </div>
        </div>
      `;
    })
    .join('');

  // Setup card event listeners
  setupCardListeners();
  setupDragAndDrop();
}

function renderCard(card: PromptCard): string {
  const isSelected = card.id === selectedCardId;
  return `
    <div class="card ${isSelected ? 'selected' : ''}" 
         data-card-id="${card.id}" 
         draggable="true">
      ${card.label !== 'none' ? `<div class="card-label ${card.label}"></div>` : ''}
      <div class="card-header">
        <span class="card-icon">${card.icon}</span>
        <span class="card-title">${escapeHtml(card.title)}</span>
      </div>
      <div class="card-preview">${escapeHtml(card.content.substring(0, 80))}...</div>
      ${card.tags.length > 0
      ? `<div class="card-tags">
            ${card.tags.map(tag => `<span class="card-tag">${escapeHtml(tag)}</span>`).join('')}
           </div>`
      : ''}
    </div>
  `;
}

function populateColumnSelect(): void {
  const select = document.getElementById('prompt-column') as HTMLSelectElement;
  if (!select) return;

  select.innerHTML = columns
    .map(col => `<option value="${col.id}">${col.icon} ${col.title}</option>`)
    .join('');
}

// ===== Event Listeners =====
function setupEventListeners(): void {
  // Toolbar buttons
  document.getElementById('btn-new')?.addEventListener('click', () => openPromptModal());
  document.getElementById('btn-edit')?.addEventListener('click', handleEditSelected);
  document.getElementById('btn-delete')?.addEventListener('click', handleDeleteSelected);
  document.getElementById('btn-search')?.addEventListener('click', openSearchModal);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd/Ctrl + K for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
    // Escape to close modals
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Search modal
  searchInput?.addEventListener('input', handleSearch);
  searchModal?.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearchModal();
  });

  // Prompt modal
  document.getElementById('modal-close')?.addEventListener('click', closePromptModal);
  document.getElementById('btn-cancel')?.addEventListener('click', closePromptModal);
  promptForm?.addEventListener('submit', handlePromptSubmit);
  promptModal?.addEventListener('click', (e) => {
    if (e.target === promptModal) closePromptModal();
  });

  // Icon picker
  document.querySelectorAll('.icon-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.icon-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Label picker
  document.querySelectorAll('.label-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.label-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // View modal
  document.getElementById('view-close')?.addEventListener('click', closeViewModal);
  document.getElementById('btn-copy')?.addEventListener('click', handleCopy);
  document.getElementById('btn-open-edit')?.addEventListener('click', handleOpenEdit);
  viewModal?.addEventListener('click', (e) => {
    if (e.target === viewModal) closeViewModal();
  });

  // Temperature slider
  const tempSlider = document.getElementById('prompt-temp') as HTMLInputElement;
  const tempValue = document.getElementById('temp-value');
  tempSlider?.addEventListener('input', () => {
    if (tempValue) tempValue.textContent = tempSlider.value;
  });
}

function setupCardListeners(): void {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-card-id');
      if (id) selectCard(id);
    });

    card.addEventListener('dblclick', () => {
      const id = card.getAttribute('data-card-id');
      if (id) openViewModal(id);
    });
  });
}

// ===== Drag and Drop =====
function setupDragAndDrop(): void {
  document.querySelectorAll('.card').forEach(card => {
    (card as HTMLElement).addEventListener('dragstart', handleDragStart as EventListener);
    (card as HTMLElement).addEventListener('dragend', handleDragEnd as EventListener);
  });

  document.querySelectorAll('.column-cards').forEach(column => {
    (column as HTMLElement).addEventListener('dragover', handleDragOver as EventListener);
    (column as HTMLElement).addEventListener('dragleave', handleDragLeave as EventListener);
    (column as HTMLElement).addEventListener('drop', handleDrop as EventListener);
  });
}

function handleDragStart(e: DragEvent): void {
  const target = e.target as HTMLElement;
  draggedCardId = target.getAttribute('data-card-id');
  target.classList.add('dragging');

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', draggedCardId || '');
  }
}

function handleDragEnd(e: DragEvent): void {
  const target = e.target as HTMLElement;
  target.classList.remove('dragging');
  draggedCardId = null;

  document.querySelectorAll('.column-cards').forEach(col => {
    col.classList.remove('drag-over');
  });
}

function handleDragOver(e: DragEvent): void {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  target.classList.add('drag-over');

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move';
  }
}

function handleDragLeave(e: DragEvent): void {
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('drag-over');
}

function handleDrop(e: DragEvent): void {
  e.preventDefault();
  const target = e.currentTarget as HTMLElement;
  target.classList.remove('drag-over');

  const cardId = e.dataTransfer?.getData('text/plain');
  const newColumnId = target.getAttribute('data-column-id');

  if (cardId && newColumnId) {
    const card = cards.find(c => c.id === cardId);
    if (card) {
      card.columnId = newColumnId;
      card.updatedAt = new Date();
      renderBoard();
      showToast('Card moved successfully');
    }
  }
}

// ===== Card Actions =====
function selectCard(id: string): void {
  selectedCardId = id;
  renderBoard();
}

function openViewModal(id: string): void {
  const card = cards.find(c => c.id === id);
  if (!card || !viewModal) return;

  selectedCardId = id;

  const iconEl = document.getElementById('view-icon');
  const titleEl = document.getElementById('view-title-text');
  const tagsEl = document.getElementById('view-tags');
  const contentEl = document.getElementById('view-content');

  if (iconEl) iconEl.textContent = card.icon;
  if (titleEl) titleEl.textContent = card.title;
  if (tagsEl) {
    tagsEl.innerHTML = card.tags
      .map(tag => `<span class="view-tag">${escapeHtml(tag)}</span>`)
      .join('');
  }
  if (contentEl) contentEl.textContent = card.content;

  viewModal.classList.remove('hidden');
}

function closeViewModal(): void {
  viewModal?.classList.add('hidden');
}

function handleCopy(): void {
  const card = cards.find(c => c.id === selectedCardId);
  if (!card) return;

  navigator.clipboard.writeText(card.content).then(() => {
    showToast('Copied to clipboard!');
    closeViewModal();
  });
}

function handleOpenEdit(): void {
  if (selectedCardId) {
    closeViewModal();
    openPromptModal(selectedCardId);
  }
}

// ===== Search =====
function openSearchModal(): void {
  if (!searchModal || !searchInput) return;
  searchModal.classList.remove('hidden');
  searchInput.value = '';
  searchInput.focus();
  renderSearchResults('');
}

function closeSearchModal(): void {
  searchModal?.classList.add('hidden');
}

function handleSearch(e: Event): void {
  const query = (e.target as HTMLInputElement).value;
  renderSearchResults(query);
}

function renderSearchResults(query: string): void {
  if (!searchResults) return;

  const filtered = query
    ? cards.filter(c =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.content.toLowerCase().includes(query.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    )
    : cards;

  if (filtered.length === 0) {
    searchResults.innerHTML = `
      <li class="search-empty">
        ${query ? 'No prompts found' : 'Start typing to search...'}
      </li>
    `;
    return;
  }

  searchResults.innerHTML = filtered
    .map(card => {
      const column = columns.find(c => c.id === card.columnId);
      return `
        <li class="search-result" data-card-id="${card.id}">
          <span class="search-result-icon">${card.icon}</span>
          <div class="search-result-content">
            <div class="search-result-title">${escapeHtml(card.title)}</div>
            <div class="search-result-preview">${escapeHtml(card.content.substring(0, 60))}...</div>
          </div>
          <span class="search-result-column">${column?.title || ''}</span>
        </li>
      `;
    })
    .join('');

  // Add click listeners to results
  searchResults.querySelectorAll('.search-result').forEach(result => {
    result.addEventListener('click', () => {
      const id = result.getAttribute('data-card-id');
      if (id) {
        closeSearchModal();
        openViewModal(id);
      }
    });
  });
}

// ===== Prompt Modal =====
function openPromptModal(cardId?: string): void {
  if (!promptModal || !modalTitle) return;

  editingCardId = cardId || null;

  // Reset form
  const form = promptForm;
  if (form) form.reset();

  // Reset pickers
  document.querySelectorAll('.icon-btn').forEach((b, i) => {
    b.classList.toggle('selected', i === 0);
  });
  document.querySelectorAll('.label-btn').forEach((b, i) => {
    b.classList.toggle('selected', i === 0);
  });

  // Reset advanced options to defaults
  const tempSlider = document.getElementById('prompt-temp') as HTMLInputElement;
  const tempValue = document.getElementById('temp-value');
  if (tempSlider) tempSlider.value = '0.7';
  if (tempValue) tempValue.textContent = '0.7';
  (document.getElementById('prompt-model') as HTMLInputElement).value = 'gpt-4';
  (document.getElementById('prompt-topk') as HTMLInputElement).value = '40';
  (document.getElementById('prompt-maxtokens') as HTMLInputElement).value = '2048';

  if (cardId) {
    // Edit mode
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    modalTitle.textContent = 'Edit Prompt';
    (document.getElementById('prompt-title') as HTMLInputElement).value = card.title;
    (document.getElementById('prompt-content') as HTMLTextAreaElement).value = card.content;
    (document.getElementById('prompt-column') as HTMLSelectElement).value = card.columnId;
    (document.getElementById('prompt-tags') as HTMLInputElement).value = card.tags.join(', ');

    // Select correct icon
    document.querySelectorAll('.icon-btn').forEach(btn => {
      const icon = btn.getAttribute('data-icon');
      btn.classList.toggle('selected', icon === card.icon);
    });

    // Select correct label
    document.querySelectorAll('.label-btn').forEach(btn => {
      const label = btn.getAttribute('data-label');
      btn.classList.toggle('selected', label === card.label);
    });

    // Set advanced options
    (document.getElementById('prompt-model') as HTMLInputElement).value = card.model;
    if (tempSlider) tempSlider.value = card.temperature.toString();
    if (tempValue) tempValue.textContent = card.temperature.toString();
    (document.getElementById('prompt-topk') as HTMLInputElement).value = card.topK.toString();
    (document.getElementById('prompt-maxtokens') as HTMLInputElement).value = card.maxTokens.toString();
  } else {
    modalTitle.textContent = 'New Prompt';
  }

  promptModal.classList.remove('hidden');
  (document.getElementById('prompt-title') as HTMLInputElement)?.focus();
}

function closePromptModal(): void {
  promptModal?.classList.add('hidden');
  editingCardId = null;
}

function handlePromptSubmit(e: Event): void {
  e.preventDefault();

  const title = (document.getElementById('prompt-title') as HTMLInputElement).value.trim();
  const content = (document.getElementById('prompt-content') as HTMLTextAreaElement).value.trim();
  const columnId = (document.getElementById('prompt-column') as HTMLSelectElement).value;
  const tagsValue = (document.getElementById('prompt-tags') as HTMLInputElement).value;
  const tags = tagsValue ? tagsValue.split(',').map(t => t.trim()).filter(t => t) : [];

  const selectedIcon = document.querySelector('.icon-btn.selected')?.getAttribute('data-icon') || '📝';
  const selectedLabel = document.querySelector('.label-btn.selected')?.getAttribute('data-label') || 'none';

  // Advanced options
  const model = (document.getElementById('prompt-model') as HTMLInputElement).value;
  const temperature = parseFloat((document.getElementById('prompt-temp') as HTMLInputElement).value);
  const topK = parseInt((document.getElementById('prompt-topk') as HTMLInputElement).value) || 40;
  const maxTokens = parseInt((document.getElementById('prompt-maxtokens') as HTMLInputElement).value) || 2048;

  if (!title || !content) return;

  if (editingCardId) {
    // Update existing card
    const card = cards.find(c => c.id === editingCardId);
    if (card) {
      card.title = title;
      card.content = content;
      card.columnId = columnId;
      card.tags = tags;
      card.icon = selectedIcon;
      card.label = selectedLabel;
      card.model = model;
      card.temperature = temperature;
      card.topK = topK;
      card.maxTokens = maxTokens;
      card.updatedAt = new Date();
      showToast('Prompt updated');
    }
  } else {
    // Create new card
    const newCard: PromptCard = {
      id: generateId(),
      title,
      content,
      columnId,
      tags,
      icon: selectedIcon,
      label: selectedLabel,
      model,
      temperature,
      topK,
      maxTokens,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    cards.unshift(newCard);
    selectedCardId = newCard.id;
    showToast('Prompt created');
  }

  closePromptModal();
  renderBoard();
}

// ===== Toolbar Actions =====
function handleEditSelected(): void {
  if (!selectedCardId) {
    showToast('Please select a card first');
    return;
  }
  openPromptModal(selectedCardId);
}

function handleDeleteSelected(): void {
  if (!selectedCardId) {
    showToast('Please select a card first');
    return;
  }

  const confirmed = confirm('Are you sure you want to delete this prompt?');
  if (confirmed) {
    cards = cards.filter(c => c.id !== selectedCardId);
    selectedCardId = null;
    renderBoard();
    showToast('Prompt deleted');
  }
}

// ===== Modal Helpers =====
function closeAllModals(): void {
  closeSearchModal();
  closePromptModal();
  closeViewModal();
}

// ===== Utilities =====
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showToast(message: string): void {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast success';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}
