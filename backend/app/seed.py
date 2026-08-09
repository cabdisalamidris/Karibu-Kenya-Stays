"""Curated Kenya catalogue for first-run/demo data.

Names and destination context are based on established Kenyan properties. Prices,
availability, images and ratings are demonstration inventory, not live supplier rates.
"""
from .extensions import bcrypt, db
from .models import Booking, CarService, Hotel, User


IMAGE = "https://images.unsplash.com/{}?auto=format&fit=crop&w=1200&q=85"

HOTELS = [
    # Nairobi — city, culture and wildlife gateway
    ("Giraffe Manor", "Nairobi, Kenya", "An iconic Lang'ata manor where breakfast can include a gentle giraffe visitor.", 145000, 6, IMAGE.format("photo-1516426122078-c23e76319801"), 4.9, "Giraffe encounters,All-inclusive dining,Garden walks,Airport transfer", "Garden-to-table breakfast", True),
    ("Nairobi Serena Hotel", "Nairobi, Kenya", "A calm five-star base beside Central Park, ideal for city culture and safari connections.", 42000, 18, IMAGE.format("photo-1542314831-068cd1dbfeeb"), 4.8, "Maisha Spa,Pool,City views,Concierge", "Mandhari tasting menu", True),
    ("Tribe Hotel", "Nairobi, Kenya", "A design-forward stay in Gigiri, close to the forest, galleries and the diplomatic district.", 36000, 15, IMAGE.format("photo-1566073771259-6a8506099945"), 4.7, "Kaya Spa,Art collection,Airport transfer,Fast Wi-Fi", "Jiko African grill", False),
    ("Hemingways Nairobi", "Nairobi, Kenya", "A refined Karen retreat with butler service, overlooking the Ngong Hills.", 62000, 9, IMAGE.format("photo-1584132967334-10e028bd69f7"), 4.9, "Butler service,Spa,Ngong Hills views,Private dining", "Brasserie afternoon tea", False),
    ("Fairmont The Norfolk", "Nairobi, Kenya", "A heritage city hotel with leafy courtyards and effortless access to Nairobi's landmarks.", 39000, 20, IMAGE.format("photo-1564501049412-61c2a3083791"), 4.7, "Heated pool,Historic gardens,Spa,Airport concierge", "Lord Delamere terrace dining", False),
    # Nakuru — Lake Nakuru and Rift Valley travellers
    ("Sarova Woodlands Hotel & Spa", "Nakuru, Kenya", "A polished Milimani stay positioned for Lake Nakuru National Park and Menengai Crater.", 26500, 16, IMAGE.format("photo-1551882547-ff40c63fe5fa"), 4.7, "Spa,Pool,Lake Nakuru trips,Family rooms", "Flame Tree cuisine", True),
    ("The Cliff Nakuru", "Nakuru, Kenya", "An intimate lake-facing retreat with panoramic views over Lake Nakuru National Park.", 48000, 8, IMAGE.format("photo-1500530855697-b586d89ba3ee"), 4.8, "Lake views,Game drives,Infinity pool,Private deck", "Rift Valley grill", True),
    ("Lake Nakuru Lodge", "Nakuru, Kenya", "A wildlife lodge inside the national park for unhurried early game drives.", 31000, 14, IMAGE.format("photo-1516426122078-c23e76319801"), 4.6, "Park access,Game drives,Pool,Bird watching", "Bush breakfast", False),
    ("Merica Hotel", "Nakuru, Kenya", "A central Nakuru address that makes city meetings and national-park day trips easy.", 14500, 22, IMAGE.format("photo-1566073771259-6a8506099945"), 4.4, "Conference rooms,Pool,City centre,Restaurant", "Highland buffet", False),
    ("Sarova Lion Hill Game Lodge", "Nakuru, Kenya", "A safari lodge within Lake Nakuru National Park, surrounded by acacia woodland.", 38500, 12, IMAGE.format("photo-1530789253388-582c481c54b0"), 4.7, "Game drives,Pool,Wildlife viewing,Family cottages", "Lakeside sundowner", False),
    # Naivasha — WRC Safari Rally, lake and wildlife
    ("Enashipai Resort & Spa", "Naivasha, Kenya", "A five-star Great Rift Valley resort for rally weekends, lake escapes and restorative stays.", 42000, 18, IMAGE.format("photo-1540555700478-4be289fbecef"), 4.8, "Spa,Pool,Rally transfers,Kids club", "Sirocco Kenyan fusion", True),
    ("Great Rift Valley Lodge & Golf Resort", "Naivasha, Kenya", "Highland cottages and championship golf above Lake Naivasha, ideal for Safari Rally travellers.", 37000, 16, IMAGE.format("photo-1500534314209-a25ddb2bd429"), 4.7, "Golf,Safari Rally shuttle,Pool,Lake views", "Rift Valley roast", True),
    ("Lake Naivasha Sopa Resort", "Naivasha, Kenya", "A spacious lakeside wildlife retreat where giraffes and hippos are part of the landscape.", 30000, 20, IMAGE.format("photo-1516426122078-c23e76319801"), 4.6, "Wildlife walks,Pool,Boat rides,Family rooms", "Lakeside barbecue", False),
    ("Sawela Lodges", "Naivasha, Kenya", "A green lakeside hideaway with easy access to Hell's Gate and rally routes.", 28000, 17, IMAGE.format("photo-1551882547-ff40c63fe5fa"), 4.6, "Infinity pool,Boat rides,Conference centre,Rally parking", "Farm-fresh Kenyan plate", False),
    ("Lake Naivasha Country Club", "Naivasha, Kenya", "A classic colonial-era garden stay for boat excursions, birding and relaxed lake mornings.", 25500, 15, IMAGE.format("photo-1582719478250-c89cae4dc85b"), 4.5, "Lake access,Gardens,Boat trips,Pool", "Country club breakfast", False),
    # Mombasa — ocean views and beach holidays
    ("Sarova Whitesands Beach Resort & Spa", "Mombasa, Kenya", "A lively Bamburi beachfront resort with Indian Ocean views and extensive pools.", 35000, 24, IMAGE.format("photo-1507525428034-b723cf961d3e"), 4.7, "Ocean view,Spa,Water sports,Kids club", "Minazi ocean catch", True),
    ("EnglishPoint Marina", "Mombasa, Kenya", "A modern waterfront stay at the meeting point of the old town, marina and Indian Ocean.", 45000, 12, IMAGE.format("photo-1499793983690-e29da59ef1c2"), 4.7, "Marina views,Infinity pool,Spa,Dhow cruises", "Seafront seafood", True),
    ("PrideInn Paradise Beach Resort", "Mombasa, Kenya", "A family-friendly Shanzu Beach escape with water slides and direct ocean access.", 29000, 23, IMAGE.format("photo-1473116763249-2faaef81ccda"), 4.5, "Beachfront,Water park,Kids club,Airport transfer", "Swahili coastal buffet", False),
    ("Voyager Beach Resort", "Mombasa, Kenya", "A cruise-themed beachfront resort with lively entertainment and a warm Indian Ocean shoreline.", 27000, 20, IMAGE.format("photo-1507525428034-b723cf961d3e"), 4.5, "Ocean view,Water sports,Entertainment,All-inclusive", "Captain's seafood night", False),
    ("Serena Beach Resort & Spa", "Mombasa, Kenya", "A Swahili-inspired beachfront retreat set in tropical gardens on Shanzu Beach.", 39000, 16, IMAGE.format("photo-1540202404-a2f29016b523"), 4.7, "Ocean view,Maisha Spa,Dhow dinner,Diving", "Jahazi coastal dining", False),
    # Eldoret — athletes, business and western Kenya gateway
    ("Eka Hotel Eldoret", "Eldoret, Kenya", "A contemporary Rupa's Mall hotel designed for athletes, business travellers and comfortable stopovers.", 18000, 18, IMAGE.format("photo-1566073771259-6a8506099945"), 4.5, "Gym,Airport access,Fast Wi-Fi,Restaurant", "Local runners' breakfast", True),
    ("Boma Inn Eldoret", "Eldoret, Kenya", "A tranquil Elgon View Drive hotel with gardens, spa facilities and welcoming local hospitality.", 16000, 17, IMAGE.format("photo-1551882547-ff40c63fe5fa"), 4.5, "Spa,Gardens,Pool,Conference rooms", "Uasin Gishu grill", False),
    ("The Noble Hotel & Conference Centre", "Eldoret, Kenya", "A practical and polished town-centre base for meetings, marathon weekends and regional travel.", 12000, 19, IMAGE.format("photo-1542314831-068cd1dbfeeb"), 4.3, "Conference centre,City access,Restaurant,Wi-Fi", "Highland coffee breakfast", False),
    ("Sirikwa Hotel", "Eldoret, Kenya", "A long-standing garden hotel in town with a relaxed atmosphere for business and family stays.", 11000, 20, IMAGE.format("photo-1582719478250-c89cae4dc85b"), 4.2, "Gardens,Pool,Restaurant,Parking", "Kenyan nyama choma", False),
    ("Comfy Inn Eldoret", "Eldoret, Kenya", "A central, value-conscious base for visitors exploring Kenya's high-altitude running capital.", 8500, 21, IMAGE.format("photo-1564501049412-61c2a3083791"), 4.2, "City centre,Restaurant,Wi-Fi,Airport shuttle", "Home-style Kenyan supper", False),
]

CARS = [
    ("Safari Grand Tourer", "Porsche Cayenne", 42000, 4, "Professional driver and route support", IMAGE.format("photo-1503376780353-7e6692767b70"), "A performance grand tourer for Nairobi, the Rift Valley and the coast."),
    ("Coastal Roadster", "Mercedes-AMG SL", 52000, 2, "Concierge handover and roadside support", IMAGE.format("photo-1492144534655-ae79c964c9d7"), "An open-top sports car for a curated coastal drive and private photo stops."),
    ("Highland Sport SUV", "Range Rover Sport", 46000, 5, "Vetted driver-guide available", IMAGE.format("photo-1519641471654-76ce0107ad1b"), "A capable premium vehicle for highland roads, lodges and day adventures."),
]

# A distinct visual for every property keeps the destination catalogue useful at
# a glance. These are presentation images, not photographs supplied by hotels.
HOTEL_PHOTOS = {
    "Giraffe Manor": IMAGE.format("photo-1516426122078-c23e76319801"),
    "Nairobi Serena Hotel": IMAGE.format("photo-1542314831-068cd1dbfeeb"),
    "Tribe Hotel": IMAGE.format("photo-1566073771259-6a8506099945"),
    "Hemingways Nairobi": IMAGE.format("photo-1584132967334-10e028bd69f7"),
    "Fairmont The Norfolk": IMAGE.format("photo-1601918774946-25832a4be0d6"),
    "Sarova Woodlands Hotel & Spa": IMAGE.format("photo-1551882547-ff40c63fe5fa"),
    "The Cliff Nakuru": IMAGE.format("photo-1500534314209-a25ddb2bd429"),
    "Lake Nakuru Lodge": IMAGE.format("photo-1571896349842-33c89424de2d"),
    "Merica Hotel": IMAGE.format("photo-1564501049412-61c2a3083791"),
    "Sarova Lion Hill Game Lodge": IMAGE.format("photo-1582719508461-905c673771fd"),
    "Enashipai Resort & Spa": IMAGE.format("photo-1540555700478-4be289fbecef"),
    "Great Rift Valley Lodge & Golf Resort": IMAGE.format("photo-1500530855697-b586d89ba3ee"),
    "Lake Naivasha Sopa Resort": IMAGE.format("photo-1590490360182-c33d57733427"),
    "Sawela Lodges": IMAGE.format("photo-1561501900-3701fa6a0864"),
    "Lake Naivasha Country Club": IMAGE.format("photo-1590490359683-658d3d23f972"),
    "Sarova Whitesands Beach Resort & Spa": IMAGE.format("photo-1514282401047-d79a71a590e8"),
    "EnglishPoint Marina": IMAGE.format("photo-1499793983690-e29da59ef1c2"),
    "PrideInn Paradise Beach Resort": IMAGE.format("photo-1520250497591-112f2f40a3f4"),
    "Voyager Beach Resort": IMAGE.format("photo-1507525428034-b723cf961d3e"),
    "Serena Beach Resort & Spa": IMAGE.format("photo-1540202404-a2f29016b523"),
    "Eka Hotel Eldoret": IMAGE.format("photo-1522771739844-6a9f6d5f14af"),
    "Boma Inn Eldoret": IMAGE.format("photo-1445019980597-93fa8acb246c"),
    "The Noble Hotel & Conference Centre": IMAGE.format("photo-1556742049-0cfed4f6a45d"),
    "Sirikwa Hotel": IMAGE.format("photo-1556740749-887f6717d7e4"),
    "Comfy Inn Eldoret": IMAGE.format("photo-1540518614846-7eded433c457"),
}


def seed_database():
    db.create_all()
    if not User.query.filter_by(email="admin@karibustays.co.ke").first():
        db.session.add(User(username="karibuadmin", email="admin@karibustays.co.ke", role="admin", password_hash=bcrypt.generate_password_hash("KaribuAdmin2026!").decode("utf-8")))
    # Upgrade the original demo catalogue in local development. This condition is
    # deliberately narrow so a real deployed Kenya catalogue is never replaced.
    if Hotel.query.filter_by(name="Villa Aurora").first():
        Booking.query.delete()
        Hotel.query.delete()
        db.session.commit()
    if not Hotel.query.first():
        for hotel in HOTELS:
            db.session.add(Hotel(name=hotel[0], location=hotel[1], description=hotel[2], price_per_night=hotel[3], available_rooms=hotel[4], image_url=HOTEL_PHOTOS[hotel[0]], rating=hotel[6], amenities=hotel[7], signature_meal=hotel[8], featured=hotel[9]))
    else:
        # Upgrade the seeded presentation inventory without touching hotels an
        # administrator added later.
        for name, image_url in HOTEL_PHOTOS.items():
            hotel = Hotel.query.filter_by(name=name).first()
            if hotel:
                hotel.image_url = image_url
    if not CarService.query.first():
        for car in CARS:
            db.session.add(CarService(name=car[0], vehicle_type=car[1], price_per_day=car[2], seats=car[3], security_detail=car[4], image_url=car[5], description=car[6]))
    elif CarService.query.count() == 3:
        for record, car in zip(CarService.query.order_by(CarService.id).all(), CARS):
            record.name, record.vehicle_type, record.price_per_day = car[0], car[1], car[2]
            record.seats, record.security_detail, record.image_url, record.description = car[3], car[4], car[5], car[6]
    db.session.commit()
