import amenitiesHandler from './_routes/amenities.js';
import analyticsHandler from './_routes/analytics.js';
import authHandler from './_routes/auth.js';
import brokersHandler from './_routes/brokers.js';
import citiesHandler from './_routes/cities.js';
import contactHandler from './_routes/contact.js';
import favoritesHandler from './_routes/favorites.js';
import listingsHandler from './_routes/listings.js';
import notificationsHandler from './_routes/notifications.js';
import profilesHandler from './_routes/profiles.js';
import propertiesHandler from './_routes/properties.js';
import qrHandler from './_routes/qr.js';
import reviewsHandler from './_routes/reviews.js';
import searchHandler from './_routes/search.js';
import universitiesHandler from './_routes/universities.js';
import visitsHandler from './_routes/visits.js';

const routes = {
  amenities: amenitiesHandler,
  analytics: analyticsHandler,
  auth: authHandler,
  brokers: brokersHandler,
  cities: citiesHandler,
  contact: contactHandler,
  favorites: favoritesHandler,
  listings: listingsHandler,
  notifications: notificationsHandler,
  profiles: profilesHandler,
  properties: propertiesHandler,
  qr: qrHandler,
  reviews: reviewsHandler,
  search: searchHandler,
  universities: universitiesHandler,
  visits: visitsHandler,
};

export default async function handler(req, res) {
  try {
    const rawUrl = req.url || '';
    const cleanUrl = rawUrl.split('?')[0];
    const pathParts = cleanUrl.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const routeName = pathParts[0];

    const routeHandler = routes[routeName];
    if (!routeHandler) {
      return res.status(404).json({ error: `API route /api/${routeName || ''} not found` });
    }

    return await routeHandler(req, res);
  } catch (err) {
    console.error('API Index Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }
}
