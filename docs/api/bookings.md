# Bookings API

Authenticated clients create stays with `POST /api/bookings`, supplying `hotel_id`, ISO `check_in`, ISO `check_out`, and `guests`. The service rejects past arrivals, invalid date order, empty availability and invalid guest counts.

`GET /api/bookings` returns the active user's stays and chauffeur reservations. `DELETE /api/bookings/:id` cancels only that user's future stay and restores one room to inventory.
