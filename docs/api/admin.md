# Administrator API

Administrator tokens can call `GET /api/admin/dashboard` for property, traveller, reservation and active-stay metrics, booking activity and popularity rankings.

`GET|POST /api/admin/hotels` manages the hotel collection. `PATCH|DELETE /api/admin/hotels/:id` updates or removes a property. These routes return 403 for non-administrator accounts.
