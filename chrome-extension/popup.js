document.addEventListener('DOMContentLoaded', () => {
  const authGate = document.getElementById('auth-gate');
  const mainContent = document.getElementById('main-content');
  const chatSection = document.getElementById('chat-section');
  const queryInput = document.getElementById('query-input');
  const sendBtn = document.getElementById('send-btn');
  const plusBtn = document.getElementById('plus-btn');
  const dropdown = document.getElementById('features-dropdown');
  const menuSummary = document.getElementById('menu-summary');
  const chatMessages = document.getElementById('chat-messages');

  const authNavBtn = document.getElementById('auth-nav-btn');
  const extLoginForm = document.getElementById('extension-login-form');
  const extEmail = document.getElementById('ext-email');
  const extPassword = document.getElementById('ext-password');
  const extLoginBtn = document.getElementById('ext-login-btn');
  const extError = document.getElementById('ext-error');

  const API_BASE = 'http://localhost:8000';
  let currentUser = null;
  let currentVideoUrl = '';
  let currentVideoId = '';

  const checkAuth = () => {
    chrome.storage.local.get(['user_id', 'email', 'access_token', 'current_video_url', 'current_video_id'], (result) => {
      if (result.user_id) {
        currentUser = result;
        authGate.style.display = 'none';
        mainContent.style.display = 'flex';
        if (authNavBtn) {
          authNavBtn.style.display = 'inline-flex';
          authNavBtn.textContent = 'LOGOUT';
        }
      } else {
        currentUser = null;
        authGate.style.display = 'flex';
        mainContent.style.display = 'none';
        if (authNavBtn) {
          authNavBtn.style.display = 'none';
        }
      }

      if (result.current_video_url) {
        currentVideoUrl = result.current_video_url;
      }
      if (result.current_video_id) {
        currentVideoId = result.current_video_id;
      }
    });
  };

  checkAuth();

  if (authNavBtn) {
    authNavBtn.addEventListener('click', () => {
      if (currentUser && currentUser.user_id) {
        chrome.storage.local.remove(['user_id', 'email', 'access_token'], () => {
          checkAuth();
        });
      } else {
        window.open('http://localhost:5173/#/account', '_blank');
      }
    });
  }

  if (extLoginForm) {
    extLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      extError.textContent = '';
      extLoginBtn.disabled = true;
      extLoginBtn.textContent = 'SIGNING IN...';

      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: extEmail.value.trim(),
            password: extPassword.value.trim()
          })
        });

        const data = await res.json();
        if (data.success) {
          chrome.storage.local.set({
            user_id: data.user_id,
            email: data.email,
            access_token: data.access_token || ''
          }, () => {
            checkAuth();
          });
        } else {
          extError.textContent = data.error || 'Invalid credentials';
        }
      } catch (err) {
        extError.textContent = 'Failed to connect to server';
      } finally {
        extLoginBtn.disabled = false;
        extLoginBtn.textContent = 'SIGN IN';
      }
    });
  }

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

  const appendMessage = (text, sender, isHtml = false) => {
    if (chatSection) {
      chatSection.classList.remove('empty-state');
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${sender}`;
    if (isHtml) {
      msgDiv.innerHTML = text;
    } else {
      msgDiv.textContent = text;
    }
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgDiv;
  };

  const getCurrentTabUrl = () => {
    return new Promise((resolve) => {
      if (chrome.tabs && chrome.tabs.query) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs && tabs[0] && tabs[0].url) {
            resolve(tabs[0].url);
          } else {
            resolve(currentVideoUrl || '');
          }
        });
      } else {
        resolve(currentVideoUrl || '');
      }
    });
  };

  const handleSend = async () => {
    const question = queryInput.value.trim();
    if (!question) return;

    if (!currentUser || !currentUser.user_id) {
      checkAuth();
      return;
    }

    queryInput.value = '';
    appendMessage(question, 'user');

    const loadingDiv = appendMessage('Thinking...', 'loading');

    try {
      const activeUrl = await getCurrentTabUrl();
      const videoUrl = activeUrl || currentVideoUrl;

      if (!videoUrl) {
        loadingDiv.remove();
        appendMessage('Could not detect the current YouTube video URL. Please make sure you are on a YouTube watch page.', 'assistant');
        return;
      }

      const askRes = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question,
          video_url: videoUrl,
          user_id: currentUser.user_id
        })
      });

      const askData = await askRes.json();
      loadingDiv.remove();

      if (askData.type === 'answer') {
        appendMessage(askData.answer, 'assistant');
      } else if (askData.type === 'needs_clarification') {
        const clarifDiv = document.createElement('div');
        clarifDiv.className = 'msg msg-assistant';
        clarifDiv.innerHTML = `<p style="margin-bottom: 8px;">Please clarify what you'd like to ask about:</p>`;
        
        const optionsDiv = document.createElement('div');
        optionsDiv.className = 'clarification-options';

        (askData.options || []).forEach((opt) => {
          const btn = document.createElement('button');
          btn.className = 'clarification-btn';
          btn.textContent = opt.label;
          btn.addEventListener('click', async () => {
            clarifDiv.remove();
            appendMessage(`Selected: ${opt.label}`, 'user');
            const resolveLoading = appendMessage('Processing clarification...', 'loading');

            try {
              const resRes = await fetch(`${API_BASE}/api/resolve-clarification`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  choice_key: opt.key,
                  video_url: videoUrl,
                  user_id: currentUser.user_id
                })
              });
              const resData = await resRes.json();
              resolveLoading.remove();
              appendMessage(resData.answer || 'Completed', 'assistant');
            } catch (err) {
              resolveLoading.remove();
              appendMessage('Failed to resolve clarification', 'assistant');
            }
          });
          optionsDiv.appendChild(btn);
        });

        clarifDiv.appendChild(optionsDiv);
        chatMessages.appendChild(clarifDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    } catch (err) {
      loadingDiv.remove();
      appendMessage('Sorry, an error occurred while connecting to the assistant server.', 'assistant');
    }
  };

  sendBtn.addEventListener('click', handleSend);
  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSend();
  });
});
