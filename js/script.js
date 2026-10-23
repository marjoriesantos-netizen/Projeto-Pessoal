/* ==========================================================================
   Portfólio acadêmico — Marjorie da Silva Santos
   script.js — JavaScript puro (sem bibliotecas)

   Funcionalidades:
   01. Menu responsivo (abrir, fechar, teclado e clique fora)
   02. Navegação suave com gerenciamento de foco
   03. Cabeçalho com sombra ao rolar
   04. Destaque da seção atual no menu
   05. Animações discretas durante a rolagem
   06. Galeria com visualização ampliada (lightbox acessível)
   07. Botão para voltar ao topo
   08. Ano atual no rodapé
   ========================================================================== */

(function () {
  'use strict';

  var reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function prefersReducedMotion() {
    return reduceMotionQuery.matches;
  }

  /* ------------------------------------------------------------------------
     01. Menu responsivo
     ------------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('menu-principal');
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));

  function isMenuOpen() {
    return navToggle.getAttribute('aria-expanded') === 'true';
  }

  function openMenu() {
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Fechar menu de navegação');
    nav.classList.add('is-open');
    document.body.classList.add('menu-open');
  }

  function closeMenu(returnFocus) {
    if (!isMenuOpen()) {
      return;
    }
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (returnFocus) {
      navToggle.focus();
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener('click', function () {
      if (isMenuOpen()) {
        closeMenu(false);
      } else {
        openMenu();
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        closeMenu(false);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isMenuOpen()) {
        closeMenu(true);
      }
    });

    document.addEventListener('click', function (event) {
      if (!isMenuOpen()) {
        return;
      }
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) {
        closeMenu(false);
      }
    });

    var desktopQuery = window.matchMedia('(min-width: 1081px)');
    var handleDesktopChange = function (event) {
      if (event.matches) {
        closeMenu(false);
      }
    };

    if (typeof desktopQuery.addEventListener === 'function') {
      desktopQuery.addEventListener('change', handleDesktopChange);
    } else if (typeof desktopQuery.addListener === 'function') {
      desktopQuery.addListener(handleDesktopChange);
    }
  }

  /* ------------------------------------------------------------------------
     02. Navegação suave com gerenciamento de foco
     ------------------------------------------------------------------------ */
  var internalLinks = Array.prototype.slice.call(document.querySelectorAll('a[href^="#"]'));

  internalLinks.forEach(function (link) {
    link.addEventListener('click', function (event) {
      var hash = link.getAttribute('href');
      if (!hash || hash === '#') {
        return;
      }

      var target = document.querySelector(hash);
      if (!target) {
        return;
      }

      event.preventDefault();

      if (isMenuOpen()) {
        closeMenu(false);
      }

      // Permite que leitores de tela anunciem a seção de destino.
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
      }
      target.focus({ preventScroll: true });

      target.scrollIntoView({
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        block: 'start'
      });

      if (window.history && typeof window.history.pushState === 'function') {
        window.history.pushState(null, '', hash);
      }
    });
  });

  /* ------------------------------------------------------------------------
     03. Cabeçalho com sombra ao rolar
     ------------------------------------------------------------------------ */
  function updateHeaderState() {
    if (!header) {
      return;
    }
    if (window.scrollY > 12) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  /* ------------------------------------------------------------------------
     04. Destaque da seção atual no menu
     ------------------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var isCurrent = link.getAttribute('href') === '#' + id;
      if (isCurrent) {
        link.setAttribute('aria-current', 'true');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  function updateActiveSection() {
    if (sections.length === 0) {
      return;
    }

    var referencePoint = window.scrollY + window.innerHeight * 0.35;
    var currentSection = sections[0];

    sections.forEach(function (section) {
      var sectionTop = section.getBoundingClientRect().top + window.scrollY;
      if (sectionTop <= referencePoint) {
        currentSection = section;
      }
    });

    // No fim da página, destaca a última seção mesmo que ela seja curta.
    var atPageEnd = window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    if (atPageEnd) {
      currentSection = sections[sections.length - 1];
    }

    setActiveLink(currentSection.id);
  }

  /* ------------------------------------------------------------------------
     05. Animações discretas durante a rolagem
     ------------------------------------------------------------------------ */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function showAllRevealItems() {
    revealItems.forEach(function (item) {
      item.classList.add('is-visible');
    });
  }

  // Rede de segurança: revela tudo o que já entrou na tela — inclusive os
  // itens "pulados" por uma rolagem rápida ou por um salto de âncora.
  function revealEnteredItems() {
    var viewportLimit = window.innerHeight;
    revealItems.forEach(function (item) {
      if (item.classList.contains('is-visible')) {
        return;
      }
      if (item.getBoundingClientRect().top < viewportLimit) {
        item.classList.add('is-visible');
      }
    });
  }

  function setupReveal() {
    if (revealItems.length === 0) {
      return;
    }

    if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
      showAllRevealItems();
      return;
    }

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.12
    });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });

    // Garantia: se algo impedir a observação, o conteúdo continua visível.
    window.setTimeout(revealEnteredItems, 1200);
  }

  /* ------------------------------------------------------------------------
     06. Galeria com visualização ampliada
     ------------------------------------------------------------------------ */
  var lightbox = document.getElementById('lightbox');
  var lightboxImage = document.getElementById('lightbox-img');
  var lightboxCaption = document.getElementById('lightbox-caption');
  var lightboxCounter = document.getElementById('lightbox-counter');
  var lightboxClose = document.querySelector('.lightbox__close');
  var lightboxPrev = document.querySelector('.lightbox__nav--prev');
  var lightboxNext = document.querySelector('.lightbox__nav--next');
  var galleryButtons = Array.prototype.slice.call(document.querySelectorAll('.gallery__item'));

  var galleryItems = galleryButtons.map(function (button) {
    var image = button.querySelector('img');
    return {
      src: image ? image.getAttribute('src') : '',
      alt: image ? image.getAttribute('alt') : '',
      caption: button.getAttribute('data-caption') || (image ? image.getAttribute('alt') : '')
    };
  });

  var currentImageIndex = 0;
  var lastFocusedElement = null;

  function renderLightboxImage(index) {
    if (galleryItems.length === 0) {
      return;
    }

    currentImageIndex = (index + galleryItems.length) % galleryItems.length;
    var item = galleryItems[currentImageIndex];

    lightboxImage.setAttribute('src', item.src);
    lightboxImage.setAttribute('alt', item.alt);
    lightboxCaption.textContent = item.caption;
    lightboxCounter.textContent = (currentImageIndex + 1) + ' de ' + galleryItems.length;
  }

  function openLightbox(index, trigger) {
    if (!lightbox) {
      return;
    }

    lastFocusedElement = trigger || document.activeElement;
    renderLightboxImage(index);
    lightbox.hidden = false;
    document.body.classList.add('lightbox-open');

    if (lightboxClose) {
      lightboxClose.focus();
    }
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) {
      return;
    }

    lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    lightboxImage.removeAttribute('src');
    lightboxImage.setAttribute('alt', '');

    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function showPreviousImage() {
    renderLightboxImage(currentImageIndex - 1);
  }

  function showNextImage() {
    renderLightboxImage(currentImageIndex + 1);
  }

  function getLightboxFocusableElements() {
    if (!lightbox) {
      return [];
    }
    return Array.prototype.slice.call(
      lightbox.querySelectorAll('button, a[href], [tabindex]:not([tabindex="-1"])')
    ).filter(function (element) {
      return !element.hasAttribute('hidden') && element.offsetParent !== null;
    });
  }

  if (lightbox && galleryButtons.length > 0) {
    galleryButtons.forEach(function (button, index) {
      button.addEventListener('click', function () {
        openLightbox(index, button);
      });
    });

    Array.prototype.forEach.call(
      lightbox.querySelectorAll('[data-close-lightbox]'),
      function (element) {
        element.addEventListener('click', closeLightbox);
      }
    );

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', showPreviousImage);
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', showNextImage);
    }

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        closeLightbox();
        return;
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        showPreviousImage();
        return;
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        showNextImage();
        return;
      }

      if (event.key === 'Tab') {
        var focusable = getLightboxFocusableElements();
        if (focusable.length === 0) {
          return;
        }

        var first = focusable[0];
        var last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ------------------------------------------------------------------------
     07. Botão para voltar ao topo
     ------------------------------------------------------------------------ */
  var toTopButton = document.querySelector('.to-top');
  var heroSection = document.getElementById('inicio');

  function updateToTopButton() {
    if (!toTopButton) {
      return;
    }
    if (window.scrollY > 640) {
      toTopButton.hidden = false;
    } else {
      toTopButton.hidden = true;
    }
  }

  if (toTopButton) {
    toTopButton.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      if (heroSection) {
        heroSection.focus({ preventScroll: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     08. Ano atual no rodapé
     ------------------------------------------------------------------------ */
  var yearElement = document.getElementById('ano-atual');
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------------------------
     Inicialização
     ------------------------------------------------------------------------ */
  setupReveal();
  updateHeaderState();
  updateToTopButton();
  updateActiveSection();

  var ticking = false;

  window.addEventListener('scroll', function () {
    if (ticking) {
      return;
    }
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeaderState();
      updateToTopButton();
      updateActiveSection();
      revealEnteredItems();
      ticking = false;
    });
  }, { passive: true });

  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', function () {
      if (prefersReducedMotion()) {
        showAllRevealItems();
      }
    });
  }
})();
