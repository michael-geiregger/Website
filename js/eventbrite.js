/**
 * Eventbrite Integration for Michael Geiregger Website
 * This script fetches live events from Eventbrite and renders them dynamically.
 */

const EVENTBRITE_CONFIG = {
    PRIVATE_TOKEN: 'N75POTQOTC5J5URPAW7V',
    ORG_ID: '239725805730'
};

async function fetchEvents() {
    // If placeholders are still there, return mock data for development
    if (EVENTBRITE_CONFIG.PRIVATE_TOKEN === 'PLACEHOLDER_TOKEN') {
        console.warn('Eventbrite tokens not set. Using mock data.');
        return getMockEvents();
    }

    const url = `https://www.eventbriteapi.com/v3/organizations/${EVENTBRITE_CONFIG.ORG_ID}/events/?status=live&order_by=start_asc&expand=venue`;

    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${EVENTBRITE_CONFIG.PRIVATE_TOKEN}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Failed to fetch events');
        }

        const data = await response.json();
        return data.events || [];
    } catch (error) {
        console.error('Error fetching Eventbrite events:', error);
        return [];
    }
}

function renderEvents(events) {
    const container = document.getElementById('event-container');
    if (!container) return;

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="reveal" style="grid-column: 1/-1; text-align: center; padding: 3rem; background: var(--color-warm-white); border-radius: 2rem;">
                <p>Aktuell sind keine öffentlichen Events geplant. Schau bald wieder vorbei oder kontaktiere mich direkt!</p>
                <a href="kontakt.html" class="btn btn-primary" style="margin-top: 1rem;">Kontakt aufnehmen</a>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map((event, index) => {
        const startDate = new Date(event.start.local);
        const dateString = startDate.toLocaleDateString('de-DE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        const timeString = startDate.toLocaleTimeString('de-DE', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Use event image if available, else a placeholder
        const imageUrl = event.logo ? event.logo.original.url : 'images/event-placeholder.jpg';

        return `
            <div class="vision-block reveal" style="--i: ${index}">
                <div class="vision-number">${(index + 1).toString().padStart(2, '0')}</div>
                <div class="vision-content">
                    ${event.logo ? `<img src="${imageUrl}" alt="${event.name.text}" style="width: 100%; height: auto; max-height: 300px; object-fit: cover; border-radius: 1.5rem; margin-bottom: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">` : ''}
                    <h3 style="font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; color: var(--color-night); margin-bottom: 0.8rem;">${event.name.text}</h3>
                    <div class="event-meta" style="margin-bottom: 1.5rem; font-size: 0.95rem; color: var(--color-text-light); display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;">
                        <span>📅 ${dateString}</span>
                        <span>⏰ ${timeString} Uhr</span>
                        ${event.venue ? `<span>📍 ${event.venue.name}</span>` : ''}
                    </div>
                    <p style="margin-bottom: 2rem; opacity: 0.9;">${event.description.text ? truncateText(event.description.text, 180) : ''}</p>
                    <a href="${event.url}" target="_blank" class="btn btn-outline" style="display: inline-flex;">Platz sichern &rarr;</a>
                </div>
            </div>
        `;
    }).join('');

    // Re-trigger reveal animation for dynamic elements
    if (window.revealObserver) {
        container.querySelectorAll('.reveal').forEach(el => {
            window.revealObserver.observe(el);
        });
    }
}

function truncateText(text, length) {
    if (text.length <= length) return text;
    const truncated = text.substring(0, length);
    // Find the last space to avoid cutting words
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > 0) {
        return truncated.substring(0, lastSpace).trim() + '...';
    }
    return truncated.trim() + '...';
}

function getMockEvents() {
    return [
        {
            name: { text: 'Psychedelic Breath Session (Demo)' },
            start: { local: new Date(Date.now() + 86400000 * 7).toISOString() },
            description: { text: 'Erlebe eine tiefgehende Atemsitzung, die dich in veränderte Bewusstseinszustände führt. Perfekt für Klarheit und emotionale Freiheit.' },
            url: '#',
            logo: null,
            venue: { name: 'Wien / Online' }
        },
        {
            name: { text: 'Deep Dive Workshop (Demo)' },
            start: { local: new Date(Date.now() + 86400000 * 14).toISOString() },
            description: { text: 'Ein intensiver Tag voller Selbsterkenntnis und Transformation. Wir arbeiten an deinen tiefsten Blockaden.' },
            url: '#',
            logo: null,
            venue: { name: 'Salzburg' }
        }
    ];
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('event-container');
    if (container) {
        const events = await fetchEvents();
        renderEvents(events);
    }
});
