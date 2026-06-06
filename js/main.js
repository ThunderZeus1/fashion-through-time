/* Fashion Through Time - main.js
   All page interactions in one file. Uses jQuery (self-hosted, js/lib/jquery.min.js).
   Sections:
     1)  Page loader fade-out
     2)  Hamburger menu
     3)  Navbar shrink on scroll
     4)  Scroll progress bar (gold line at top)
     5)  Custom cursor follower (desktop only)
     6)  Back-to-top button
     7)  Scroll reveal (sections + timeline cards)
     8)  Hero parallax (home page)
     9)  Carousel (home page)
     10) Card tilt effect (designer / decade / tech cards)
     11) Designer lightbox (artists page)
     12) Genre tabs + artist filter (artists page)
     13) Contact form validation + thanks modal
     14) Smooth scroll for in-page #links
     15) Spotify embeds (decade flip cards) - uses Spotify's external iframe API
*/


/* ---- 1) PAGE LOADER ---- */
/* hide as soon as the window finishes loading so all the fonts and images
   are ready before we let people see the page */
$(window).on('load', function () {
    setTimeout(function () {
        $('#pageLoader').addClass('done');
        // remove from DOM so it doesn't block clicks
        setTimeout(function () { $('#pageLoader').remove(); }, 900);
    }, 350);
});


$(document).ready(function () {

    // ---- 2) HAMBURGER MENU ----
    $('#hamburger').on('click', function () {
        $(this).toggleClass('active');
        $('#navLinks').toggleClass('open');
    });
    $('#navLinks a').on('click', function () {
        $('#hamburger').removeClass('active');
        $('#navLinks').removeClass('open');
    });


    // ---- 3) NAVBAR SHRINKS ON SCROLL ----
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 60) {
            $('#navbar').addClass('scrolled');
        } else {
            $('#navbar').removeClass('scrolled');
        }
    });


    // ---- 4) SCROLL PROGRESS BAR ----
    // thin gold bar at the very top of the viewport, fills 0 -> 100% as you scroll
    var $progress = $('#scrollProgress');
    if ($progress.length) {
        $(window).on('scroll', function () {
            var docH = $(document).height() - $(window).height();
            var pct = docH > 0 ? ($(window).scrollTop() / docH) * 100 : 0;
            $progress.css('width', pct + '%');
        });
    }


    // ---- 5) CUSTOM CURSOR FOLLOWER ----
    // gold ring + dot that follows the mouse, expands on hover over links/cards.
    // skipped on touch devices and on small screens (handled via CSS too).
    var $cursorDot  = $('#cursorDot');
    var $cursorRing = $('#cursorRing');
    var isTouch     = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    if ($cursorRing.length && !isTouch && window.innerWidth > 900) {
        var mouseX = 0, mouseY = 0;
        var ringX  = 0, ringY  = 0;

        $(document).on('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            // dot snaps instantly
            $cursorDot.css('transform', 'translate(' + mouseX + 'px,' + mouseY + 'px)');
        });

        // ring lags behind with easing for a smooth follow
        function animateRing() {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            $cursorRing.css('transform', 'translate(' + ringX + 'px,' + ringY + 'px)');
            requestAnimationFrame(animateRing);
        }
        animateRing();

        // grow ring on hover over interactive things
        $(document).on('mouseenter',
            'a, button, .artist-card, .artist-large-card, .flip-card, .timeline-card, .device-card, .tech-card, .intro-card',
            function () { $cursorRing.addClass('hover'); }
        );
        $(document).on('mouseleave',
            'a, button, .artist-card, .artist-large-card, .flip-card, .timeline-card, .device-card, .tech-card, .intro-card',
            function () { $cursorRing.removeClass('hover'); }
        );
    } else {
        // not desktop -> hide so they don't see broken half-cursors
        $('#cursorDot, #cursorRing').remove();
    }


    // ---- 6) BACK-TO-TOP BUTTON ----
    var $backTop = $('#backToTop');
    $(window).on('scroll', function () {
        if ($(window).scrollTop() > 600) {
            $backTop.addClass('show');
        } else {
            $backTop.removeClass('show');
        }
    });
    $backTop.on('click', function () {
        $('html, body').animate({ scrollTop: 0 }, 600);
    });


    // ---- 7) SCROLL REVEAL ----
    function makeRevealer(selector, threshold) {
        var items = document.querySelectorAll(selector);
        if (!('IntersectionObserver' in window) || !items.length) {
            $(selector).addClass('visible');
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].isIntersecting) {
                    entries[i].target.classList.add('visible');
                    io.unobserve(entries[i].target);
                }
            }
        }, { threshold: threshold });
        items.forEach(function (el) { io.observe(el); });
    }
    makeRevealer('.reveal', 0.15);
    makeRevealer('.timeline-item', 0.2);


    // ---- 8) HERO PARALLAX (home page) ----
    // gentle translate on the hero video as you scroll, so it feels alive
    var $heroVideo = $('.hero-video');
    if ($heroVideo.length) {
        $(window).on('scroll', function () {
            var y = $(window).scrollTop();
            if (y < 700) {
                $heroVideo.css('transform', 'translateY(' + (y * 0.25) + 'px) scale(1.05)');
            }
        });
    }


    // ---- 9) CAROUSEL (home page) ----
    var carousel = $('#carousel');
    if (carousel.length) {
        var currentSlide = 0;
        var totalSlides = carousel.find('.carousel-slide').length;
        var autoplayTimer;

        function goToSlide(index) {
            currentSlide = (index + totalSlides) % totalSlides;
            carousel.css('transform', 'translateX(' + (-currentSlide * 100) + '%)');
            $('.carousel-dot').removeClass('active');
            $('.carousel-dot').eq(currentSlide).addClass('active');
        }

        function startAutoplay() {
            autoplayTimer = setInterval(function () { goToSlide(currentSlide + 1); }, 5500);
        }
        function stopAutoplay() { clearInterval(autoplayTimer); }

        $('#nextSlide').on('click', function () { goToSlide(currentSlide + 1); stopAutoplay(); startAutoplay(); });
        $('#prevSlide').on('click', function () { goToSlide(currentSlide - 1); stopAutoplay(); startAutoplay(); });
        $('.carousel-dot').on('click', function () {
            goToSlide(parseInt($(this).data('slide'), 10));
            stopAutoplay(); startAutoplay();
        });

        // keyboard left/right when the carousel is on screen
        $(document).on('keydown', function (e) {
            if (e.key === 'ArrowLeft')  { goToSlide(currentSlide - 1); stopAutoplay(); startAutoplay(); }
            if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); stopAutoplay(); startAutoplay(); }
        });

        $('.carousel-wrap').on('mouseenter', stopAutoplay);
        $('.carousel-wrap').on('mouseleave', startAutoplay);

        startAutoplay();
    }


    // ---- 10) CARD TILT EFFECT ----
    // when you hover one of these cards, tilt it a few degrees based on
    // where the mouse is. nothing crazy - just a bit of life.
    var tiltSelector = '.artist-card, .artist-large-card, .tech-card, .device-card, .intro-card, .timeline-card';
    $(document).on('mousemove', tiltSelector, function (e) {
        if (isTouch) return;
        var rect = this.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;   // 0 -> 1
        var y = (e.clientY - rect.top)  / rect.height;  // 0 -> 1
        var tiltX = (0.5 - y) * 6;   // up/down rotation
        var tiltY = (x - 0.5) * 6;   // left/right rotation
        $(this).css('transform',
            'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-4px)'
        );
    });
    $(document).on('mouseleave', tiltSelector, function () {
        $(this).css('transform', '');
    });


    // ---- 10b) DECADE JUMP-NAV (decades page) ----
    // observes each .timeline-item - the one most-visible gets .active in the side nav
    var $jumpLinks = $('.decade-jump a');
    if ($jumpLinks.length && 'IntersectionObserver' in window) {
        var decadeIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    var id = entry.target.id; // e.g. "dec-70s"
                    $jumpLinks.removeClass('active');
                    $('.decade-jump a[href="#' + id + '"]').addClass('active');
                }
            });
        }, { rootMargin: '-45% 0px -45% 0px' });
        $('.timeline-item[id]').each(function () { decadeIO.observe(this); });
    }


    // ---- 11) DESIGNER LIGHTBOX (artists page) ----
    // tap a designer card -> opens an elegant lightbox with bigger photo + bio
    var $lightbox = $('#designerLightbox');
    if ($lightbox.length) {
        $('.artist-large-card').on('click', function (e) {
            // don't trigger when the click is on a filter/search inside the card
            if ($(e.target).is('input, button')) return;

            var $card = $(this);
            var name  = $card.find('h3').text();
            var genre = $card.find('.genre-tag').text();
            var bio   = $card.find('p').text();
            var imgSrc = $card.find('.artist-avatar img').attr('src') || '';

            $lightbox.find('.lb-image').css('background-image', 'url("' + imgSrc + '")');
            $lightbox.find('.lb-name').text(name);
            $lightbox.find('.lb-genre').text(genre);
            $lightbox.find('.lb-bio').text(bio);
            $lightbox.addClass('is-open');
            $('body').css('overflow', 'hidden');
        });

        function closeLightbox() {
            $lightbox.removeClass('is-open');
            $('body').css('overflow', '');
        }
        $lightbox.find('.lb-close, .lb-backdrop').on('click', closeLightbox);
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $lightbox.hasClass('is-open')) closeLightbox();
        });
    }


    // ---- 12) GENRE TABS + ARTIST FILTER (artists page) ----
    $('.genre-pill').on('click', function () {
        var target = $(this).data('genre');
        $('.genre-pill').removeClass('active');
        $(this).addClass('active');
        $('.genre-detail').removeClass('active');
        $('.genre-detail[data-genre="' + target + '"]').addClass('active');
    });

    var searchBox = $('#artistSearch');
    var currentFilter = 'all';

    function applyArtistFilter() {
        var query = (searchBox.val() || '').toLowerCase().trim();
        var visibleCount = 0;
        $('#artistGrid .artist-large-card').each(function () {
            var name = ($(this).data('name') || '').toString().toLowerCase();
            var genre = ($(this).data('genre') || '').toString();
            var matchesSearch = name.indexOf(query) !== -1;
            var matchesFilter = (currentFilter === 'all') || (genre === currentFilter);
            if (matchesSearch && matchesFilter) {
                $(this).fadeIn(300);
                visibleCount++;
            } else {
                $(this).fadeOut(200);
            }
        });
        if (visibleCount === 0) { $('#noResults').fadeIn(200); }
        else                    { $('#noResults').fadeOut(200); }
    }
    if (searchBox.length) searchBox.on('input', applyArtistFilter);
    $('.filter-btn').on('click', function () {
        currentFilter = $(this).data('filter');
        $('.filter-btn').removeClass('active');
        $(this).addClass('active');
        applyArtistFilter();
    });


    // ---- 13) CONTACT FORM VALIDATION + THANKS MODAL ----
    $('#contactForm').on('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var allGood = true;
        $('.form-group').removeClass('has-error');

        if ($('#name').val().trim().length < 2) {
            $('#nameGroup').addClass('has-error'); allGood = false;
        }
        var email = $('#email').val().trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#emailGroup').addClass('has-error'); allGood = false;
        }
        if ($('#message').val().trim().length < 10) {
            $('#messageGroup').addClass('has-error'); allGood = false;
        }
        if (!allGood) return false;

        var form = $(this);
        // When developing with Live Server (port 5500) it can't run PHP.
        // If Live Server is active, forward AJAX to the local PHP dev server.
        var actionUrl = form.attr('action');
        if (window.location.port === '5500') {
            actionUrl = 'http://127.0.0.1:8000/php/send-mail.php';
        }

        var $submit = form.find('button[type=submit]');
        var isNetlify = form.data('netlify') || (window.location.hostname.indexOf('netlify.app') !== -1);
        $submit.prop('disabled', true).addClass('is-loading');

        $.ajax({
            url: actionUrl,
            method: 'POST',
            data: form.serialize(),
            dataType: isNetlify ? 'text' : 'json',
            crossDomain: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            },
            success: function (resp, textStatus, xhr) {
                if (isNetlify) {
                    // Netlify returns a 200/redirect; consider 200 as success
                    showThanksModal();
                    return;
                }
                if (resp && resp.success) {
                    showThanksModal();
                } else if (typeof resp === 'string' && resp.indexOf('success') !== -1) {
                    showThanksModal();
                } else if (resp && resp.errors) {
                    var txt = resp.errors.join(', ');
                    if (txt.toLowerCase().indexOf('name') !== -1) $('#nameGroup').addClass('has-error');
                    if (txt.toLowerCase().indexOf('email') !== -1) $('#emailGroup').addClass('has-error');
                    if (txt.toLowerCase().indexOf('message') !== -1) $('#messageGroup').addClass('has-error');
                    alert('Please fix: ' + txt);
                } else if (resp && resp.message) {
                    alert(resp.message);
                } else {
                    alert('Unexpected server response.');
                }
            },
            error: function (xhr) {
                var msg = 'Server error. Please try again later.';
                if (xhr.status === 0) {
                    msg = 'Cannot reach the local PHP server. Start it with: php -S 127.0.0.1:8000';
                } else {
                    try {
                        var json = JSON.parse(xhr.responseText || '{}');
                        if (json && json.message) msg = json.message;
                    } catch (e) {}
                }
                console.error('Contact form AJAX failed:', xhr);
                alert(msg);
            },
            complete: function () {
                $submit.prop('disabled', false).removeClass('is-loading');
            }
        });

        return false;
    });

    function showThanksModal() {
        var modal = $('#thanksModal');
        if (!modal.length) return;
        modal.addClass('is-open').attr('aria-hidden', 'false');
        $('body').css('overflow', 'hidden');
        setTimeout(function () { $('#modalOk').trigger('focus'); }, 50);
    }
    $(document).on('click', '#modalOk', function () {
        window.location.href = '../index.html';
    });
    $(document).on('click', '#thanksModal .modal-backdrop', function () {
        window.location.href = '../index.html';
    });
    $(document).on('keydown', function (e) {
        if (e.key === 'Escape' && $('#thanksModal').hasClass('is-open')) {
            window.location.href = '../index.html';
        }
    });
    $('#name, #email, #message').on('input', function () {
        $(this).closest('.form-group').removeClass('has-error');
    });


    // ---- 14) SMOOTH SCROLL FOR IN-PAGE LINKS ----
    $('a[href^="#"]').on('click', function (e) {
        var target = $(this).attr('href');
        if (target.length > 1 && $(target).length) {
            e.preventDefault();
            $('html, body').animate({ scrollTop: $(target).offset().top - 80 }, 700);
        }
    });


    // ---- 15) SPOTIFY EMBEDS (flip cards) ----
    // (Spotify is one of the allowed external APIs - pulls in the iframe script
    // from open.spotify.com and exposes window.onSpotifyIframeApiReady.)
    var spotifyControllers = {};
    var pendingPlayDecade = null;

    window.onSpotifyIframeApiReady = function (IFrameAPI) {
        $('.spotify-embed').each(function () {
            var el = this;
            var $el = $(el);
            var decade = $el.closest('.flip-card').data('decade');
            var trackId = $el.data('track-id');
            if (!trackId) return;

            IFrameAPI.createController(el, {
                uri: 'spotify:track:' + trackId,
                width: '100%',
                height: '352'
            }, function (controller) {
                spotifyControllers[decade] = controller;
                $el.addClass('ready');
                if (pendingPlayDecade === decade) {
                    pendingPlayDecade = null;
                    try { controller.play(); } catch (e) {}
                }
            });
        });
    };

    (function loadSpotifyApi() {
        if (document.getElementById('spotify-iframe-api')) return;
        // only load it on a page that actually uses it
        if (!$('.spotify-embed').length) return;
        var tag = document.createElement('script');
        tag.id = 'spotify-iframe-api';
        tag.src = 'https://open.spotify.com/embed/iframe-api/v1';
        tag.async = true;
        document.head.appendChild(tag);
    })();

    function pauseAllSpotifyExcept(exceptDecade) {
        for (var d in spotifyControllers) {
            if (d === exceptDecade) continue;
            try { spotifyControllers[d].pause(); } catch (e) {}
        }
        $('.flip-card.flipped').each(function () {
            if ($(this).data('decade') !== exceptDecade) {
                $(this).removeClass('flipped');
            }
        });
    }

    $('.flip-card').on('click', function (e) {
        if ($(e.target).closest('.song-link').length) return;
        if ($(e.target).closest('.spotify-embed').length) return;
        if ($(e.target).closest('iframe').length) return;

        var card = $(this);
        var decade = card.data('decade');

        if (card.hasClass('flipped')) {
            card.removeClass('flipped');
            try { spotifyControllers[decade].pause(); } catch (e) {}
            return;
        }
        pauseAllSpotifyExcept(decade);
        card.addClass('flipped');
        card.addClass('playing');
        setTimeout(function () { card.removeClass('playing'); }, 1300);

        var ctrl = spotifyControllers[decade];
        if (ctrl && typeof ctrl.play === 'function') {
            try { ctrl.play(); } catch (e) {}
        } else {
            pendingPlayDecade = decade;
        }
    });


    // ---- console hello ----
    console.log('%cFashion Through Time - loaded.',
        'color:#D4AF37; font-family:serif; font-size:14px; letter-spacing:2px;');
});
