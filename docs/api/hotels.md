# Hotels API

`GET /api/hotels` returns properties ordered by featured status then rating. Pass `city=Nairobi` (or another supported city) to limit the collection.

`GET /api/hotels/:id` returns one property or a 404 response. Each property includes destination city, amenities, room availability, rate, rating and featured status.
