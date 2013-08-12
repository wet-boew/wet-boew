var overlays,
    $document = $(document),
    closeText = 'Close', // Take from i18n library instead
    len,
    overlay = {
    init: function(e) {
        var overlay = e.target,
            overlayId = overlay.id,
            links = document.querySelectorAll('a[href="#' + overlayId + '"]'),
            i = links.length,
            link,
            overlayTitle,
            closeLink;
 
        // Enhance links to overlay
        while (i--) {
            link = links[i];
            if (!link.getAttribute('id')) {
                link.id = overlayId + '_' + i;
                link.setAttribute('role', 'button');
                link.setAttribute('aria-controls', overlayId);
                link.setAttribute('aria-expanded', 'false');
                link.className += ' wet-boew-overlay-trigger';
            }
        }
        
        // Enhance overlays
        closeLink = document.createElement('a');
        closeLink.setAttribute('role', 'button');
        closeLink.className += ' wet-boew-overlay-close';
        closeLink.appendChild(document.createTextNode(closeText));
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-hidden', (window.location.hash !== overlayId ? 'true' : 'false'));
        overlayTitle = overlay.getElementsByTagName('h1')[0];
        overlayTitle.setAttribute('tabindex', '-1')
        overlayTitle.parentNode.insertBefore(closeLink, overlayTitle);
    },
    
    onShow: function(e) {
        var trigger = e.target,
            overlay = document.querySelector('#' + trigger.href.split('#')[1]), // very awkward way to get the overlay div...but it works.
            closeLink = overlay.getElementsByTagName('a')[0];
        trigger.setAttribute('aria-expanded', 'true');
        overlay.setAttribute('aria-hidden', 'false');
        overlay.className += ' open';
        closeLink.setAttribute('href', '#' + trigger.id);
        setTimeout(function () {
            closeLink.nextSibling.focus(); // Not working. Should put focus on h1
        }, 0);
    },

    onHide: function() {
        var overlay = document.querySelector('.wet-boew-overlay.open');
        if (overlay !== null) {
            overlay.setAttribute('aria-hidden', 'true');
            overlay.className = overlay.className.replace(' open', '');
            document.getElementById(overlay.getElementsByTagName('a')[0].href.split('#')[1]).setAttribute('aria-expanded', 'false');
        }
    }
}

$document.on('click', '.wet-boew-overlay-trigger', function(e) {
    e.stopPropagation();
    overlay.onShow(e);
});
$document.on('click', '.wet-boew-overlay-close', function(e) {
    e.stopPropagation();
    overlay.onHide();
});
$document.on('click', '.wet-boew-overlay', function(e) {
    return false;
});
$document.on('click keydown', function(e) {
    var closeLink = document.querySelector('.wet-boew-overlay.open .wet-boew-overlay-close');
    if (closeLink !== null && ((e.type === 'click' && e.button === 0) || (!(e.ctrlKey || e.altKey || e.metaKey) && e.keyCode === 27))) { // Left mouse click or escape key (note left mouse click is 1 in IE8 and under)
        closeLink.click();
    }
});

overlays = document.getElementsByClassName('wet-boew-overlay');
len = overlays.length;
while (len--) {
    $document.one('wb.timerpoke', '#' + overlays[len].id, overlay.init);
}

window._timer.add('.wet-boew-overlay');
