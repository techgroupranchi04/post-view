/* =========================================================
   FREECOMERS - JAVASCRIPT APPLICATION LOGIC
   Handles interactive features: Post Creation, Like/Comment/Share,
   Category Filtering, Theme Toggle, AI Strategist Chat & Toasts.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileNav();
  initCategoryFilter();
  initPostModals();
  initFestyAI();
  initWhatsAppJoin();
});

/* =========================================================
   0. MOBILE NAVIGATION
   ========================================================= */
function initMobileNav() {
  const appHeader = document.getElementById('appHeader');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const headerNav = document.getElementById('primaryNav');
  const networkDropdown = document.getElementById('networkDropdown');

  if (!appHeader || !mobileMenuBtn || !headerNav) return;

  const closeMenu = () => {
    appHeader.classList.remove('mobile-nav-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
    mobileMenuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
    if (networkDropdown) networkDropdown.classList.remove('mobile-open');
  };

  const openMenu = () => {
    appHeader.classList.add('mobile-nav-open');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
    mobileMenuBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  };

  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = appHeader.classList.contains('mobile-nav-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', (e) => {
    if (window.innerWidth > 860) return;
    if (!appHeader.contains(e.target)) closeMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeMenu();
  });

  const navLinks = headerNav.querySelectorAll('.nav-item[href], .dropdown-menu a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 860) closeMenu();
    });
  });

  if (networkDropdown) {
    networkDropdown.addEventListener('click', (e) => {
      if (window.innerWidth > 860) return;
      if (e.target.closest('.dropdown-menu a')) return;

      e.preventDefault();
      networkDropdown.classList.toggle('mobile-open');
    });
  }
}

/* =========================================================
   1. THEME TOGGLE (LIGHT / DARK)
   ========================================================= */
function initTheme() {
  const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
  const savedTheme = localStorage.getItem('fc_theme') || 'light-theme';

  document.body.className = savedTheme;

  if (themeToggleBtns.length) {
    themeToggleBtns.forEach(themeToggleBtn => {
      themeToggleBtn.addEventListener('click', () => {
        if (document.body.classList.contains('light-theme')) {
          document.body.classList.remove('light-theme');
          document.body.classList.add('dark-theme');
          localStorage.setItem('fc_theme', 'dark-theme');
          showToast('Switched to Dark Mode 🌙');
        } else {
          document.body.classList.remove('dark-theme');
          document.body.classList.add('light-theme');
          localStorage.setItem('fc_theme', 'light-theme');
          showToast('Switched to Light Mode ☀️');
        }
      });
    });
  }
}

/* =========================================================
   2. CATEGORY PILL FILTER CAROUSEL
   ========================================================= */
function initCategoryFilter() {
  const track = document.getElementById('categoriesTrack');
  const prevBtn = document.getElementById('pillPrevBtn');
  const nextBtn = document.getElementById('pillNextBtn');
  const pills = document.querySelectorAll('.cat-pill');

  if (prevBtn && track) {
    prevBtn.addEventListener('click', () => {
      track.scrollBy({ left: -180, behavior: 'smooth' });
    });
  }

  if (nextBtn && track) {
    nextBtn.addEventListener('click', () => {
      track.scrollBy({ left: 180, behavior: 'smooth' });
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const category = pill.getAttribute('data-category');
      filterPostsByCategory(category);
    });
  });
}

function filterPostsByCategory(category) {
  const posts = document.querySelectorAll('.post-card');
  let visibleCount = 0;

  posts.forEach(post => {
    const postCategory = post.getAttribute('data-category') || 'news';
    if (category === 'all' || postCategory === category || category === 'festivals') {
      post.style.display = 'block';
      visibleCount++;
    } else {
      post.style.display = 'none';
    }
  });

  showToast(`Filtered by: ${category.replace('-', ' ').toUpperCase()}`);
}

/* =========================================================
   3. RICH TEXT EDITOR & POST CREATION ENGINE
   ========================================================= */
function initPostModals() {
  const openPostModalBtn = document.getElementById('openPostModalBtn');
  const inlinePostInput = document.getElementById('inlinePostInput');
  const inlineImgBtn = document.getElementById('inlineImgBtn');
  const inlineVideoBtn = document.getElementById('inlineVideoBtn');
  const inlineEventBtn = document.getElementById('inlineEventBtn');

  const postModal = document.getElementById('postModal');
  const closePostModalBtn = document.getElementById('closePostModalBtn');
  const cancelPostBtn = document.getElementById('cancelPostBtn');
  const publishPostBtn = document.getElementById('publishPostBtn');

  const editor = document.getElementById('richTextEditor');
  const formatSelect = document.getElementById('formatBlockSelect');
  const toolbar = document.getElementById('editorToolbar');
  const imgFileInput = document.getElementById('richImageFileInput');
  const toolbarImgUploadBtn = document.getElementById('toolbarImageUploadBtn');
  const toolbarImgUrlBtn = document.getElementById('toolbarImageUrlBtn');
  const toolbarVideoBtn = document.getElementById('toolbarVideoEmbedBtn');
  const toolbarLinkBtn = document.getElementById('toolbarLinkBtn');
  const charCounter = document.getElementById('editorCharCount');

  const openModal = () => {
    if (postModal) {
      postModal.style.display = 'flex';
      if (editor) editor.focus();
    }
  };

  const closeModal = () => {
    if (postModal) postModal.style.display = 'none';
  };

  if (openPostModalBtn) openPostModalBtn.addEventListener('click', openModal);
  if (inlinePostInput) inlinePostInput.addEventListener('click', openModal);
  if (closePostModalBtn) closePostModalBtn.addEventListener('click', closeModal);
  if (cancelPostBtn) cancelPostBtn.addEventListener('click', closeModal);

  // Inline buttons open modal with pre-action
  if (inlineImgBtn) {
    inlineImgBtn.addEventListener('click', () => {
      openModal();
      setTimeout(() => { if (imgFileInput) imgFileInput.click(); }, 200);
    });
  }
  if (inlineVideoBtn) {
    inlineVideoBtn.addEventListener('click', () => {
      openModal();
      setTimeout(() => { promptVideoEmbed(); }, 200);
    });
  }
  if (inlineEventBtn) {
    inlineEventBtn.addEventListener('click', () => {
      openModal();
      const catSelect = document.getElementById('postCategorySelect');
      if (catSelect) catSelect.value = 'event-screening';
    });
  }

  // Close on outside backdrop click
  if (postModal) {
    postModal.addEventListener('click', (e) => {
      if (e.target === postModal) closeModal();
    });
  }

  // --- Toolbar Button Actions (Bold, Italic, Lists, Align, etc.) ---
  if (toolbar) {
    const buttons = toolbar.querySelectorAll('button[data-command]');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const command = btn.getAttribute('data-command');
        document.execCommand(command, false, null);
        if (editor) editor.focus();
      });
    });
  }

  // Format Block Select (Paragraph, H1, H2, Quote)
  if (formatSelect) {
    formatSelect.addEventListener('change', (e) => {
      const tag = e.target.value;
      if (tag === 'blockquote') {
        document.execCommand('formatBlock', false, 'blockquote');
      } else if (tag === 'h3') {
        document.execCommand('formatBlock', false, 'h3');
      } else if (tag === 'h4') {
        document.execCommand('formatBlock', false, 'h4');
      } else {
        document.execCommand('formatBlock', false, 'p');
      }
      if (editor) editor.focus();
    });
  }

  // Insert Link
  if (toolbarLinkBtn) {
    toolbarLinkBtn.addEventListener('click', () => {
      const url = prompt('Enter the link URL (e.g., https://filmfestival.org):');
      if (url && url.trim()) {
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        document.execCommand('createLink', false, fullUrl);
      }
    });
  }

  // Upload Local Image File
  if (toolbarImgUploadBtn && imgFileInput) {
    toolbarImgUploadBtn.addEventListener('click', () => {
      imgFileInput.click();
    });

    imgFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          showToast('⚠️ Please select a valid image file (PNG, JPG, WEBP).');
          return;
        }

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
          const imgData = loadEvent.target.result;
          insertImageIntoEditor(imgData, file.name);
          showToast('🖼️ Image inserted into editor!');
        };
        reader.readAsDataURL(file);
      }
      imgFileInput.value = ''; // Reset for re-selection
    });
  }

  // Insert Image by URL
  if (toolbarImgUrlBtn) {
    toolbarImgUrlBtn.addEventListener('click', () => {
      const imgUrl = prompt('Enter the public image URL (e.g. poster or still link):');
      if (imgUrl && imgUrl.trim()) {
        insertImageIntoEditor(imgUrl.trim(), 'Post image');
        showToast('🖼️ Image URL embedded!');
      }
    });
  }

  // Embed Video (YouTube, Vimeo, MP4)
  if (toolbarVideoBtn) {
    toolbarVideoBtn.addEventListener('click', () => {
      promptVideoEmbed();
    });
  }

  // Live Character & Word Counter
  if (editor && charCounter) {
    editor.addEventListener('input', () => {
      const text = editor.innerText.trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = text.length;
      charCounter.textContent = `${words} words • ${chars} chars`;
    });
  }

  // Publish Post Action
  if (publishPostBtn) {
    publishPostBtn.addEventListener('click', () => {
      if (!editor) return;
      const htmlContent = editor.innerHTML.trim();
      const textContent = editor.innerText.trim();
      const category = document.getElementById('postCategorySelect').value;

      if (!textContent && !htmlContent.includes('<img') && !htmlContent.includes('<iframe') && !htmlContent.includes('<video')) {
        alert('Please write something or embed media in your post before publishing!');
        return;
      }

      createNewPost({
        contentHtml: htmlContent,
        category,
        author: 'Abhishek Kumar',
        role: 'Aspiring Filmmaker • Just now'
      });

      // Clear & Close
      editor.innerHTML = '';
      if (charCounter) charCounter.textContent = '0 words';
      closeModal();
      showToast('🎉 Your rich post has been published to Freecomers!');
    });
  }
}

/* Insert Image Element into ContentEditable */
function insertImageIntoEditor(src, alt = '') {
  const editor = document.getElementById('richTextEditor');
  if (!editor) return;

  editor.focus();
  const imgHtml = `<p><img src="${src}" alt="${escapeHtml(alt)}" style="max-width:100%; border-radius:8px; margin:8px 0;" /></p><p><br></p>`;
  document.execCommand('insertHTML', false, imgHtml);
}

/* Prompt and embed Video into Editor */
function promptVideoEmbed() {
  const videoUrl = prompt('Enter YouTube, Vimeo, or MP4 video URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...):');
  if (!videoUrl || !videoUrl.trim()) return;

  const url = videoUrl.trim();
  let embedHtml = '';

  // YouTube embed parser
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    embedHtml = `
      <div class="rich-video-embed">
        <iframe src="https://www.youtube.com/embed/${videoId}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
      </div>
      <p><br></p>
    `;
  }
  // Vimeo embed parser
  else if (url.includes('vimeo.com')) {
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
    if (vimeoMatch && vimeoMatch[3]) {
      const videoId = vimeoMatch[3];
      embedHtml = `
        <div class="rich-video-embed">
          <iframe src="https://player.vimeo.com/video/${videoId}" allowfullscreen></iframe>
        </div>
        <p><br></p>
      `;
    }
  }
  // Direct MP4 or generic video
  else if (url.endsWith('.mp4') || url.endsWith('.webm')) {
    embedHtml = `
      <div class="rich-video-embed">
        <video controls src="${url}"></video>
      </div>
      <p><br></p>
    `;
  } else {
    // Fallback: Embed as responsive iframe or link
    embedHtml = `
      <div class="rich-video-embed">
        <iframe src="${url}" allowfullscreen></iframe>
      </div>
      <p><br></p>
    `;
  }

  const editor = document.getElementById('richTextEditor');
  if (editor) {
    editor.focus();
    document.execCommand('insertHTML', false, embedHtml);
    showToast('🎥 Video embedded in editor!');
  }
}

/* Insert Quick Emoji at Caret */
function insertEmoji(emoji) {
  const editor = document.getElementById('richTextEditor');
  if (editor) {
    editor.focus();
    document.execCommand('insertText', false, emoji);
  }
}

/* Create and Prepend New Rich Post to Feed */
function createNewPost({ contentHtml, category, author, role }) {
  const postsContainer = document.getElementById('postsContainer');
  if (!postsContainer) return;

  const postId = 'post_' + Date.now();

  const article = document.createElement('article');
  article.className = 'card post-card';
  article.id = postId;
  article.setAttribute('data-category', category);

  article.innerHTML = `
    <!-- Post Header -->
    <div class="post-author-header">
      <div class="author-left">
        <div class="author-logo-avatar" style="background:#3A3238;">
          <span style="font-weight:700; font-size:0.9rem;">AK</span>
        </div>
        <div class="author-details">
          <h4 class="author-name">
            <strong>${author}</strong>
            <span class="author-action-tag">&mdash; posted an update</span>
          </h4>
          <p class="post-meta">
            <span>${role}</span> &bull; <i class="fa-solid fa-globe meta-icon"></i> <span>Public</span>
          </p>
        </div>
      </div>
      <div class="post-options">
        <button class="icon-btn-minimal" aria-label="More options"><i class="fa-solid fa-ellipsis-vertical"></i></button>
      </div>
    </div>

    <!-- Rich Formatted Post Content with Read More -->
    <div class="post-expandable-wrapper">
      <div class="post-rich-content post-expandable-content is-collapsed" id="content_${postId}" style="padding: 0.5rem 1.25rem 0.25rem; font-size: 0.95rem; color: var(--text-primary); line-height: 1.6;">
        ${contentHtml}
      </div>
      <div class="read-more-btn-wrap" id="wrap_readmore_${postId}">
        <button class="btn-read-more" id="btn_readmore_${postId}" onclick="toggleReadMore(this)">
          <span>... Read more</span>
          <i class="fa-solid fa-chevron-down"></i>
        </button>
      </div>
    </div>

    <!-- Engagement Stats -->
    <div class="post-stats-row">
      <div class="stats-left">
        <span class="reaction-icons">
          <span class="reaction-like"><i class="fa-solid fa-heart"></i></span>
        </span>
        <span class="likes-counter" id="likesCounter_${postId}">1 Like</span>
      </div>
      <div class="stats-right">
        <span class="comments-counter" id="commentsCounter_${postId}">0 Comments</span>
        &bull;
        <span class="shares-counter">0 Shares</span>
      </div>
    </div>

    <div class="post-divider"></div>

    <!-- Bottom Actions -->
    <div class="post-bottom-actions">
      <button class="action-btn like-trigger" id="likeBtn_${postId}" onclick="toggleLike('${postId}')">
        <i class="fa-regular fa-thumbs-up like-icon"></i>
        <span class="like-label">Like</span>
      </button>
      
      <button class="action-btn comment-trigger" onclick="toggleComments('${postId}')">
        <i class="fa-regular fa-comment"></i>
        <span>Comment</span>
      </button>
      
      <button class="action-btn share-trigger" onclick="sharePost('Update from ${author}')">
        <i class="fa-solid fa-arrow-up-from-bracket"></i>
        <span>Share</span>
      </button>
    </div>

    <!-- Comments Drawer -->
    <div class="comments-section" id="comments_${postId}" style="display: none;">
      <div class="comment-input-row">
        <div class="comment-user-avatar">AK</div>
        <div class="comment-input-box">
          <input type="text" placeholder="Write a comment..." id="input_comment_${postId}" onkeydown="handleCommentKey(event, '${postId}')">
          <button class="comment-send-btn" onclick="addComment('${postId}')">
            <i class="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
      <div class="comment-list" id="commentList_${postId}"></div>
    </div>
  `;

  postsContainer.insertBefore(article, postsContainer.firstChild);

  // If content is short (under 200px height), remove the read more button
  setTimeout(() => {
    const contentEl = document.getElementById(`content_${postId}`);
    const wrapBtn = document.getElementById(`wrap_readmore_${postId}`);
    if (contentEl && wrapBtn) {
      if (contentEl.scrollHeight <= 220) {
        contentEl.classList.remove('is-collapsed');
        wrapBtn.style.display = 'none';
      }
    }
  }, 100);
}

/* =========================================================
   4. READ MORE / SHOW LESS COLLAPSIBLE HANDLER
   ========================================================= */
function toggleReadMore(contentRef, btnId) {
  let contentEl = null;
  let btnEl = null;

  // Preferred path for inline handlers: toggleReadMore(this)
  if (contentRef instanceof HTMLElement) {
    btnEl = contentRef;
    const wrapper = btnEl.closest('.post-expandable-wrapper');
    if (wrapper) {
      contentEl = wrapper.querySelector('.post-expandable-content');
    }
  } else if (typeof contentRef === 'string') {
    // Backward compatibility for older calls: toggleReadMore(contentId, btnId)
    contentEl = document.getElementById(contentRef);
    btnEl = btnId ? document.getElementById(btnId) : null;

    // If button id is missing or duplicated, infer from local wrapper.
    if (!btnEl && contentEl) {
      const wrapper = contentEl.closest('.post-expandable-wrapper');
      if (wrapper) {
        btnEl = wrapper.querySelector('.btn-read-more');
      }
    }
  }

  if (!contentEl || !btnEl) return;

  const isCollapsed = contentEl.classList.contains('is-collapsed');

  if (isCollapsed) {
    contentEl.classList.remove('is-collapsed');
    btnEl.classList.add('is-expanded');
    btnEl.innerHTML = `<span>Show less</span> <i class="fa-solid fa-chevron-down"></i>`;
  } else {
    contentEl.classList.add('is-collapsed');
    btnEl.classList.remove('is-expanded');
    btnEl.innerHTML = `<span>... Read more</span> <i class="fa-solid fa-chevron-down"></i>`;

    // Smooth scroll back to top of the post if user was scrolled deep
    const postCard = contentEl.closest('.post-card');
    if (postCard) {
      postCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

/* =========================================================
   5. POST ENGAGEMENT (LIKE, COMMENT, SHARE)
   ========================================================= */
const postLikesState = {
  featuredPost: { count: 142, liked: false },
  myCustomPostId: { count: 86, liked: false },
  richPostDemo: { count: 86, liked: false }
};

function toggleLike(postId) {
  if (!postLikesState[postId]) {
    postLikesState[postId] = { count: 1, liked: false };
  }

  const state = postLikesState[postId];
  state.liked = !state.liked;
  state.count += state.liked ? 1 : -1;

  const btn = document.getElementById(`likeBtn_${postId}`);
  const counter = document.getElementById(`likesCounter_${postId}`);

  if (btn) {
    if (state.liked) {
      btn.classList.add('liked');
      btn.innerHTML = `<i class="fa-solid fa-thumbs-up like-icon" style="color:var(--color-primary)"></i> <span class="like-label" style="color:var(--color-primary)">Liked</span>`;
      showToast('❤️ Post liked!');
    } else {
      btn.classList.remove('liked');
      btn.innerHTML = `<i class="fa-regular fa-thumbs-up like-icon"></i> <span class="like-label">Like</span>`;
    }
  }

  if (counter) {
    counter.textContent = `${state.count} Likes`;
  }
}

function toggleComments(postId) {
  const section = document.getElementById(`comments_${postId}`);
  if (!section) return;

  if (section.style.display === 'none' || !section.style.display) {
    section.style.display = 'block';
    const input = document.getElementById(`input_comment_${postId}`);
    if (input) input.focus();
  } else {
    section.style.display = 'none';
  }
}

function handleCommentKey(event, postId) {
  if (event.key === 'Enter') {
    addComment(postId);
  }
}

function addComment(postId) {
  const input = document.getElementById(`input_comment_${postId}`);
  const list = document.getElementById(`commentList_${postId}`);
  const counter = document.getElementById(`commentsCounter_${postId}`);

  if (!input || !list) return;

  const text = input.value.trim();
  if (!text) return;

  const commentItem = document.createElement('div');
  commentItem.className = 'comment-item';
  commentItem.innerHTML = `
    <div class="comment-avatar">AK</div>
    <div class="comment-bubble">
      <div class="comment-header">
        <strong>Abhishek Kumar</strong>
        <span>Just now</span>
      </div>
      <p>${escapeHtml(text)}</p>
    </div>
  `;

  list.prepend(commentItem);
  input.value = '';

  // Update count
  const currentComments = list.children.length;
  if (counter) {
    counter.textContent = `${currentComments} Comments`;
  }

  showToast('💬 Comment posted!');
}

function sharePost(title) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href);
    showToast(`🔗 Link copied to clipboard for "${title}"!`);
  } else {
    showToast('🔗 Post shared to your network!');
  }
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

/* =========================================================
   5. ASK FESTY AI STRATEGIST
   ========================================================= */
function initFestyAI() {
  const askFestyBtn = document.getElementById('askFestyBtn');
  const festyModal = document.getElementById('festyModal');
  const closeFestyModalBtn = document.getElementById('closeFestyModalBtn');

  if (askFestyBtn && festyModal) {
    askFestyBtn.addEventListener('click', () => {
      festyModal.style.display = 'flex';
      const input = document.getElementById('festyInput');
      if (input) input.focus();
    });
  }

  if (closeFestyModalBtn && festyModal) {
    closeFestyModalBtn.addEventListener('click', () => {
      festyModal.style.display = 'none';
    });
  }

  if (festyModal) {
    festyModal.addEventListener('click', (e) => {
      if (e.target === festyModal) festyModal.style.display = 'none';
    });
  }
}

function handleFestyKey(event) {
  if (event.key === 'Enter') {
    sendFestyMessage();
  }
}

function sendFestyPrompt(promptText) {
  const input = document.getElementById('festyInput');
  if (input) {
    input.value = promptText;
    sendFestyMessage();
  }
}

function sendFestyMessage() {
  const input = document.getElementById('festyInput');
  const container = document.getElementById('festyChatContainer');
  if (!input || !container) return;

  const query = input.value.trim();
  if (!query) return;

  // Append user message
  const userMsg = document.createElement('div');
  userMsg.className = 'festy-message user';
  userMsg.innerHTML = `<div class="festy-msg-bubble">${escapeHtml(query)}</div>`;
  container.appendChild(userMsg);
  input.value = '';

  // Scroll to bottom
  container.scrollTop = container.scrollHeight;

  // Generate contextual AI recommendation
  setTimeout(() => {
    const aiMsg = document.createElement('div');
    aiMsg.className = 'festy-message assistant';

    let responseText = '';
    const qLower = query.toLowerCase();

    if (qLower.includes('short') || qLower.includes('drama')) {
      responseText = `🎬 <strong>Recommended Roadmap for Shorts / Drama:</strong><br>
      1. <strong>IFP Season 16 (Mumbai)</strong> - Target the 50-Hour Filmmaking / Official Short Showcase (Oct 24).<br>
      2. <strong>DIFF Dharamshala</strong> - Exceptional indie short section (Oct 29 - Nov 1).<br>
      3. <strong>Clermont-Ferrand & Aspen Shortsfest</strong> - Submit before early deadlines for global Oscar-qualifying circuit!`;
    } else if (qLower.includes('doc') || qLower.includes('grant') || qLower.includes('lab')) {
      responseText = `📽️ <strong>Recommended Doc Labs & Grants (2026):</strong><br>
      1. <strong>Docedge Kolkata Incubator</strong> - Mentorship for Asian non-fiction.<br>
      2. <strong>Film Bazaar Co-Production Market & WIP Lab</strong> - Submissions open for Goa (Nov 2026).<br>
      3. <strong>Sundance Documentary Fund</strong> - Rolling review round now active.`;
    } else {
      responseText = `✨ <strong>Custom AI Strategy for "${escapeHtml(query)}":</strong><br>
      Based on your profile and October 2026 calendar, start with <strong>Dehradun International Film Festival (DIFF)</strong> for North-Indian regional buzz, follow with <strong>IFP Mumbai</strong> for producer networking, and prepare the screener for <strong>DIFF Dharamshala</strong>.`;
    }

    aiMsg.innerHTML = `<div class="festy-msg-bubble"><strong>Festy AI:</strong> ${responseText}</div>`;
    container.appendChild(aiMsg);
    container.scrollTop = container.scrollHeight;
  }, 400);
}

/* =========================================================
   6. WHATSAPP & PROFILE QUICK ACTIONS
   ========================================================= */
function initWhatsAppJoin() {
  const joinBtn = document.getElementById('joinWhatsappBtn');
  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      showToast('📲 Redirecting to Freecomers WhatsApp Filmmaker Hub...');
      setTimeout(() => {
        window.open('https://chat.whatsapp.com/', '_blank');
      }, 600);
    });
  }

  const claimOfferBtn = document.getElementById('claimOfferBtn');
  if (claimOfferBtn) {
    claimOfferBtn.addEventListener('click', () => {
      showToast('🎟️ Masterclass Code FREEINDIE30 applied! Pass unlocked.');
    });
  }

  const editProfileBtn = document.getElementById('editProfileBtn');
  if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
      const newName = prompt('Enter your name / display title:', 'Abhishek Kumar');
      if (newName && newName.trim()) {
        document.querySelector('.profile-name').textContent = newName.trim();
        showToast('👤 Profile updated successfully!');
      }
    });
  }
}

/* =========================================================
   7. TOAST NOTIFICATIONS
   ========================================================= */
function showToast(message) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-danger"></i> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}
