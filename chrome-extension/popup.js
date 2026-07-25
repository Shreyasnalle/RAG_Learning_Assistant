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

  const API_BASE = 'https://simply-kwm.onrender.com';
  let currentUser = null;
  let currentVideoUrl = '';
  let currentVideoId = '';

  const checkAuth = () => {
    chrome.storage.local.get(['user_id', 'email', 'access_token', 'login_timestamp', 'current_video_url', 'current_video_id'], (result) => {
      let isExpired = false;
      if (result.login_timestamp) {
        const ts = parseInt(result.login_timestamp, 10);
        if (isNaN(ts) || (Date.now() - ts) >= SESSION_DURATION_MS) {
          isExpired = true;
        }
      } else if (result.user_id) {
        chrome.storage.local.set({ login_timestamp: Date.now().toString() });
      }

      if (result.user_id && !isExpired) {
        currentUser = result;
        authGate.style.display = 'none';
        mainContent.style.display = 'flex';
        if (authNavBtn) {
          authNavBtn.style.display = 'inline-flex';
          authNavBtn.textContent = 'LOGOUT';
        }
        loadChatHistory();
      } else {
        if (result.user_id && isExpired) {
          chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp', 'current_chat_history']);
        }
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

  if (authNavBtn) {
    authNavBtn.addEventListener('click', () => {
      if (currentUser && currentUser.user_id) {
        chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp'], () => {
          checkAuth();
        });
      } else {
        window.open('http://localhost:5173/', '_blank');
      }
    });
  }

  const initAuthVisualizer = () => {
    const canvas = document.getElementById('auth-visualizer-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = 260;
    const height = 170;
    canvas.width = width;
    canvas.height = height;

    const columns = [
      { id: 0, x: 55, y: 135, width: 50, height: 70, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false },
      { id: 1, x: 130, y: 135, width: 50, height: 115, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false },
      { id: 2, x: 205, y: 135, width: 50, height: 92, targetScale: 1, currentScale: 1, dotOffset: 0, hovered: false }
    ];

    let mouse = { x: -1000, y: -1000 };

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
      mouse.x = -1000;
      mouse.y = -1000;
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(10, 126);
      ctx.lineTo(250, 126);
      ctx.strokeStyle = '#fb8569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      columns.forEach(col => {
        const isHovered = (
          mouse.x >= col.x - col.width / 2 - 8 &&
          mouse.x <= col.x + col.width / 2 + 8 &&
          mouse.y >= col.y - col.height - 20 &&
          mouse.y <= col.y + 10
        );

        col.hovered = isHovered;
        col.targetScale = isHovered ? 1.12 : 1.0;
        col.currentScale += (col.targetScale - col.currentScale) * 0.15;

        if (isHovered) {
          col.dotOffset += 0.8;
        } else {
          col.dotOffset += 0.05;
        }

        const s = col.currentScale;
        const W = col.width * s;
        const H = col.height * s;
        const skew = W * 0.35;

        const topPeak = { x: col.x, y: col.y - H };
        const topLeft = { x: col.x - W / 2, y: col.y - H + skew / 2 };
        const topBottom = { x: col.x, y: col.y - H + skew };
        const topRight = { x: col.x + W / 2, y: col.y - H + skew / 2 };

        const bottomCenter = { x: col.x, y: col.y };
        const bottomLeft = { x: col.x - W / 2, y: col.y - skew / 2 };
        const bottomRight = { x: col.x + W / 2, y: col.y - skew / 2 };

        ctx.save();
        ctx.beginPath();
        const centerY = col.y - skew / 2;
        ctx.ellipse(col.x, centerY, W / 2, skew / 2, 0, 0, 2 * Math.PI);
        const shadowGrad = ctx.createRadialGradient(col.x, centerY, 0, col.x, centerY, W / 2);
        shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
        shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.35)');
        shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = shadowGrad;
        ctx.fill();
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();

        const leftGrad = ctx.createLinearGradient(topLeft.x, topLeft.y, bottomCenter.x, bottomCenter.y);
        leftGrad.addColorStop(0, '#242424');
        leftGrad.addColorStop(1, '#101010');
        ctx.fillStyle = leftGrad;
        ctx.fill();

        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.lineTo(bottomLeft.x, bottomLeft.y);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = '#fb8569';
        const numDotCols = 5;
        const dotSpacingY = 8;
        for (let c = 0; c < numDotCols; c++) {
          const u = (c + 0.5) / numDotCols;
          const px = col.x + (-W / 2 + u * (W / 2));

          const yTop = topLeft.y * (1 - u) + topBottom.y * u;
          const yBottom = bottomLeft.y * (1 - u) + bottomCenter.y * u;

          const startY = yBottom - (col.dotOffset % dotSpacingY);
          for (let py = startY; py >= yTop; py -= dotSpacingY) {
            ctx.beginPath();
            ctx.arc(px, py, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.closePath();

        const rightGrad = ctx.createLinearGradient(topBottom.x, topBottom.y, bottomRight.x, bottomRight.y);
        rightGrad.addColorStop(0, '#1a1a1a');
        rightGrad.addColorStop(1, '#0a0a0a');
        ctx.fillStyle = rightGrad;
        ctx.fill();

        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.lineTo(bottomRight.x, bottomRight.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.closePath();
        ctx.clip();

        ctx.fillStyle = 'rgba(251, 133, 105, 0.75)';
        for (let c = 0; c < numDotCols; c++) {
          const u = (c + 0.5) / numDotCols;
          const px = col.x + u * (W / 2);

          const yTop = topBottom.y * (1 - u) + topRight.y * u;
          const yBottom = bottomCenter.y * (1 - u) + bottomRight.y * u;

          const startY = yBottom - (col.dotOffset % dotSpacingY);
          for (let py = startY; py >= yTop; py -= dotSpacingY) {
            ctx.beginPath();
            ctx.arc(px, py, 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        ctx.beginPath();
        ctx.moveTo(topPeak.x, topPeak.y);
        ctx.lineTo(topLeft.x, topLeft.y);
        ctx.lineTo(topBottom.x, topBottom.y);
        ctx.lineTo(topRight.x, topRight.y);
        ctx.closePath();

        const topGrad = ctx.createLinearGradient(topLeft.x, topLeft.y, topRight.x, topRight.y);
        topGrad.addColorStop(0, '#ffac99');
        topGrad.addColorStop(1, '#fb8569');
        ctx.fillStyle = topGrad;
        ctx.fill();

        ctx.strokeStyle = '#fb8569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(topBottom.x, topBottom.y);
        ctx.lineTo(bottomCenter.x, bottomCenter.y);
        ctx.strokeStyle = 'rgba(251, 133, 105, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      });

      requestAnimationFrame(render);
    };

    render();
  };

  initAuthVisualizer();

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
            access_token: data.access_token || '',
            login_timestamp: Date.now().toString()
          }, () => {
            checkAuth();
          });
        } else {
          extError.textContent = data.error || 'EmailID\\Password is wrong';
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
    handleSend();
    setTimeout(adjustInputHeight, 0);
  });

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const formatSecondsToMMSS = (secondsStr) => {
    const totalSec = parseFloat(secondsStr);
    if (isNaN(totalSec)) return secondsStr;
    const mins = Math.floor(totalSec / 60);
    const secs = Math.floor(totalSec % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const formatMarkdown = (text) => {
    if (!text) return '';
    let html = escapeHtml(text);

    html = html.replace(/```([\s\S]*?)```/g, (match, p1) => {
      return `<pre><code>${p1.trim()}</code></pre>`;
    });

    html = html.replace(/`([^`]+)`/g, (match, p1) => {
      return `<code>${p1}</code>`;
    });

    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/\[(\d+(\.\d+)?s)\]/g, (match, p1) => {
      const mmss = formatSecondsToMMSS(p1);
      return `<span class="timestamp-text">[${mmss}]</span>`;
    });
    html = html.replace(/(\b\d+(\.\d+)?s\b)(?![^<]*>)/gi, (match, p1) => {
      const mmss = formatSecondsToMMSS(p1);
      return `<span class="timestamp-text">[${mmss}]</span>`;
    });

    html = html.replace(/\[(\d{1,2}:\d{2})\]/g, '<span class="timestamp-text">[$1]</span>');

    const lines = html.split('\n');
    let inList = false;
    let result = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        if (!inList) {
          inList = true;
          result.push('<ul>');
        }
        result.push(`<li>${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          inList = false;
          result.push('</ul>');
        }
        if (trimmed) {
          result.push(`<p>${line}</p>`);
        }
      }
    });
    if (inList) {
      result.push('</ul>');
    }

    return result.join('');
  };

  const appendMessage = (text, sender, isHtml = false) => {
    if (chatSection) {
      chatSection.classList.remove('empty-state');
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `msg msg-${sender}`;
    if (isHtml) {
      msgDiv.innerHTML = text;
    } else if (sender === 'assistant') {
      msgDiv.innerHTML = formatMarkdown(text);
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
          if (tabs && tabs[0] && tabs[0].url && tabs[0].url.includes('youtube.com/watch')) {
            resolve(tabs[0].url);
            return;
          }
          chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs2) => {
            if (tabs2 && tabs2[0] && tabs2[0].url && tabs2[0].url.includes('youtube.com/watch')) {
              resolve(tabs2[0].url);
              return;
            }
            chrome.tabs.query({ url: '*://*.youtube.com/watch*' }, (ytTabs) => {
              const activeYt = (ytTabs || []).find(t => t.active) || (ytTabs || [])[0];
              if (activeYt && activeYt.url) {
                resolve(activeYt.url);
              } else {
                resolve(currentVideoUrl || '');
              }
            });
          });
        });
      } else {
        resolve(currentVideoUrl || '');
      }
    });
  };

  const normalizeUrl = (url) => {
    if (!url) return '';
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : url;
  };

  const updateLocalHistory = (videoUrl, ...newMsgs) => {
    chrome.storage.local.get(['current_chat_history', 'current_video_url'], (storage) => {
      let history = (normalizeUrl(storage.current_video_url) === videoUrl && Array.isArray(storage.current_chat_history)) 
        ? [...storage.current_chat_history] 
        : [];
      newMsgs.forEach(m => history.push(m));
      chrome.storage.local.set({
        current_chat_history: history,
        current_video_url: videoUrl
      });
    });
  };

  const syncChatHistoryFromBackend = async (userId, videoUrl) => {
    if (!userId || !videoUrl) return;
    try {
      const res = await fetch(`${API_BASE}/api/chat-history`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.access_token || currentUser?.user_id || userId}`
        },
        body: JSON.stringify({ user_id: userId, video_url: videoUrl })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        chrome.storage.local.get(['current_chat_history', 'current_video_url'], (storage) => {
          if (storage.current_video_url === videoUrl && Array.isArray(storage.current_chat_history)) {
            if (data.messages.length < storage.current_chat_history.length) {
              return; // Prevent race condition where backend hasn't saved yet
            }
          }
          chrome.storage.local.set({
            current_chat_history: data.messages,
            current_video_url: videoUrl
          });
        });
      }
    } catch (e) {}
  };

  const loadChatHistory = async () => {
    chrome.storage.local.get(['user_id', 'current_chat_history', 'current_video_url'], async (storage) => {
      const userId = storage.user_id || (currentUser ? currentUser.user_id : null);
      if (!userId) return;

      const activeUrl = await getCurrentTabUrl();
      const rawUrl = activeUrl || storage.current_video_url || currentVideoUrl;
      const videoUrl = normalizeUrl(rawUrl);

      const renderMessages = (messages) => {
        chatMessages.innerHTML = '';
        if (messages && messages.length > 0) {
          if (chatSection) chatSection.classList.remove('empty-state');
          messages.forEach((msg) => {
            appendMessage(msg.message, msg.role);
          });
        } else {
          if (chatSection) chatSection.classList.add('empty-state');
        }
      };

      let initialRenderDone = false;
      if (storage.current_video_url === videoUrl && storage.current_chat_history && storage.current_chat_history.length > 0) {
        renderMessages(storage.current_chat_history);
        initialRenderDone = true;
      }

      if (videoUrl) {
        try {
          const res = await fetch(`${API_BASE}/api/chat-history`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentUser?.access_token || currentUser?.user_id || userId}`
            },
            body: JSON.stringify({
              user_id: userId,
              video_url: videoUrl
            })
          });
          const data = await res.json();
          if (data.success && Array.isArray(data.messages)) {
            if (data.messages.length > 0) {
              chrome.storage.local.set({ 
                current_chat_history: data.messages,
                current_video_url: videoUrl
              });
              renderMessages(data.messages);
            } else {
              chrome.storage.local.set({ 
                current_chat_history: [],
                current_video_url: videoUrl
              });
              renderMessages([]);
            }
          }
        } catch (err) {
        }
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
      const videoUrl = normalizeUrl(activeUrl || currentVideoUrl);

      if (!videoUrl) {
        loadingDiv.remove();
        appendMessage('Could not detect the current YouTube video URL. Please make sure you are on a YouTube watch page.', 'assistant');
        return;
      }

      const askRes = await fetch(`${API_BASE}/api/ask`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.access_token || currentUser.user_id || ''}`
        },
        body: JSON.stringify({
          question: question,
          video_url: videoUrl
        })
      });

      const askData = await askRes.json();
      loadingDiv.remove();

      if (!askRes.ok) {
        if (askRes.status === 401) {
          chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp', 'current_chat_history'], () => {
            currentUser = null;
            checkAuth();
          });
          appendMessage('Session expired or user account not found. Please sign in again.', 'assistant');
          return;
        }
        const errDetail = askData.detail || askData.error || 'Server error occurred.';
        appendMessage(`Sorry, an error occurred: ${errDetail}`, 'assistant');
        return;
      }

      if (askData.type === 'answer') {
        appendMessage(askData.answer, 'assistant');
        updateLocalHistory(videoUrl, { role: 'user', message: question }, { role: 'assistant', message: askData.answer });
        syncChatHistoryFromBackend(currentUser.user_id, videoUrl);
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
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${currentUser.access_token || currentUser.user_id || ''}`
                },
                body: JSON.stringify({
                  choice_key: opt.key,
                  video_url: videoUrl
                })
              });
              const resData = await resRes.json();
              resolveLoading.remove();
              if (!resRes.ok) {
                if (resRes.status === 401) {
                  chrome.storage.local.remove(['user_id', 'email', 'access_token', 'login_timestamp', 'current_chat_history'], () => {
                    currentUser = null;
                    checkAuth();
                  });
                  appendMessage('Session expired or user account not found. Please sign in again.', 'assistant');
                  return;
                }
                appendMessage('Failed to resolve clarification: ' + (resData.detail || resData.error || 'Server error'), 'assistant');
                return;
              }
              appendMessage(resData.answer || 'Completed', 'assistant');
              updateLocalHistory(videoUrl, { role: 'user', message: `Selected: ${opt.label}` }, { role: 'assistant', message: resData.answer || 'Completed' });
              syncChatHistoryFromBackend(currentUser.user_id, videoUrl);
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
      } else {
        appendMessage(askData.answer || askData.message || 'Completed', 'assistant');
      }
    } catch (err) {
      loadingDiv.remove();
      appendMessage('Sorry, an error occurred while connecting to the assistant server.', 'assistant');
    }
  };

  const adjustInputHeight = () => {
    queryInput.style.height = 'auto';
    const newHeight = Math.min(queryInput.scrollHeight, 100);
    queryInput.style.height = `${newHeight}px`;
  };

  queryInput.addEventListener('input', adjustInputHeight);

  sendBtn.addEventListener('click', () => {
    handleSend();
    setTimeout(adjustInputHeight, 0);
  });

  queryInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      setTimeout(adjustInputHeight, 0);
    }
  });

  const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
  checkAuth();
});
