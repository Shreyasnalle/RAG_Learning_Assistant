document.addEventListener('DOMContentLoaded', () => {
  const queryInput = document.getElementById('query-input');
  const sendBtn = document.getElementById('send-btn');
  const plusBtn = document.getElementById('plus-btn');
  const dropdown = document.getElementById('features-dropdown');
  const menuSummary = document.getElementById('menu-summary');

  plusBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    dropdown.classList.remove('show');
  });

  menuSummary.addEventListener('click', () => {
    dropdown.classList.remove('show');
    queryInput.value = 'Summarize this video';
  });

  const handleSend = () => {
    const question = queryInput.value.trim();
    if (!question) return;
    queryInput.value = '';
  };

  sendBtn.addEventListener('click', handleSend);
  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
