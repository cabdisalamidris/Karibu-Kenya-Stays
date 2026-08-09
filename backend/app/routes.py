from datetime import date
from sqlalchemy import func
from functools import wraps

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from .extensions import bcrypt, db
from .models import Booking, CarBooking, CarService, Hotel, Review, ServiceRequest, User

api = Blueprint("api", __name__, url_prefix="/api")


def message(text, status=400):
    return jsonify({"message": text}), status


def admin_required(view):
    @wraps(view)
    @jwt_required()
    def wrapped(*args, **kwargs):
        user = db.session.get(User, int(get_jwt_identity()))
        if not user or user.role != "admin":
            return message("Administrator access is required.", 403)
        return view(*args, **kwargs)
    return wrapped


def hotel_payload(data, hotel=None):
    required = ["name", "location", "description", "price_per_night", "available_rooms", "image_url"]
    if hotel is None and any(not str(data.get(field, "")).strip() for field in required):
        raise ValueError("Please complete all required hotel fields.")
    fields = ("name", "location", "description", "price_per_night", "available_rooms", "image_url", "rating", "signature_meal", "featured")
    values = {field: data[field] for field in fields if field in data}
    if "amenities" in data:
        values["amenities"] = ", ".join(data["amenities"]) if isinstance(data["amenities"], list) else str(data["amenities"])
    for field, value in values.items():
        setattr(hotel, field, value)


@api.get("/health")
def health():
    return {"message": "Karibu Stays API is online"}


@api.post("/auth/register")
def register():
    data = request.get_json(silent=True) or {}
    username, email, password = (str(data.get(key, "")).strip() for key in ("username", "email", "password"))
    if len(username) < 3 or "@" not in email or len(password) < 6:
        return message("Use a name of 3+ characters, a valid email, and a password of 6+ characters.")
    if User.query.filter((User.email == email) | (User.username == username)).first():
        return message("An account with that email or username already exists.", 409)
    user = User(username=username, email=email.lower(), password_hash=bcrypt.generate_password_hash(password).decode("utf-8"))
    db.session.add(user)
    db.session.commit()
    return jsonify({"token": create_access_token(identity=str(user.id)), "user": user.public()}), 201


@api.post("/auth/login")
def login():
    data = request.get_json(silent=True) or {}
    email, password = str(data.get("email", "")).strip().lower(), str(data.get("password", ""))
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return message("Incorrect email or password.", 401)
    return {"token": create_access_token(identity=str(user.id)), "user": user.public()}


@api.get("/auth/me")
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    return {"user": user.public()}


@api.get("/hotels")
def hotels():
    city = str(request.args.get("city", "")).strip().lower()
    query = Hotel.query
    if city and city != "all":
        query = query.filter(func.lower(Hotel.location).like(f"{city},%"))
    return jsonify([hotel.public() for hotel in query.order_by(Hotel.featured.desc(), Hotel.rating.desc()).all()])


@api.get("/hotels/<int:hotel_id>")
def hotel_detail(hotel_id):
    hotel = db.session.get(Hotel, hotel_id)
    return jsonify(hotel.public()) if hotel else message("Hotel not found.", 404)


@api.get("/hotels/<int:hotel_id>/reviews")
def hotel_reviews(hotel_id):
    hotel = db.session.get(Hotel, hotel_id)
    if not hotel:
        return message("Hotel not found.", 404)
    return jsonify([review.public() for review in Review.query.filter_by(hotel_id=hotel.id).order_by(Review.id.desc()).all()])


@api.post("/hotels/<int:hotel_id>/reviews")
@jwt_required()
def create_review(hotel_id):
    hotel = db.session.get(Hotel, hotel_id)
    data = request.get_json(silent=True) or {}
    try:
        rating = int(data.get("rating", 0))
    except (TypeError, ValueError):
        rating = 0
    comment = str(data.get("comment", "")).strip()
    user_id = int(get_jwt_identity())
    has_stayed = Booking.query.filter_by(user_id=user_id, hotel_id=hotel_id).first()
    if not hotel:
        return message("Hotel not found.", 404)
    if not has_stayed:
        return message("Only guests with a booking can share a hotel experience.", 403)
    if rating < 1 or rating > 5 or len(comment) < 8:
        return message("Choose a rating from 1 to 5 and add a comment of at least 8 characters.")
    review = Review(rating=rating, comment=comment, user_id=user_id, hotel_id=hotel.id)
    db.session.add(review)
    db.session.flush()
    scores = [item.rating for item in hotel.reviews]
    hotel.rating = round(sum(scores) / len(scores), 1)
    db.session.commit()
    return jsonify({"review": review.public(), "hotel": hotel.public(), "message": "Thank you for sharing your experience."}), 201


@api.get("/cars")
def cars():
    return jsonify([car.public() for car in CarService.query.filter_by(available=True).all()])


@api.post("/bookings")
@jwt_required()
def create_booking():
    data = request.get_json(silent=True) or {}
    try:
        check_in, check_out = date.fromisoformat(data["check_in"]), date.fromisoformat(data["check_out"])
        guests, hotel_id = int(data.get("guests", 1)), int(data["hotel_id"])
    except (KeyError, TypeError, ValueError):
        return message("Enter valid stay dates and guest count.")
    hotel = db.session.get(Hotel, hotel_id)
    if not hotel or check_in < date.today() or check_out <= check_in or guests < 1:
        return message("Please check your selected hotel and travel dates.")
    if hotel.available_rooms < 1:
        return message("This residence has no rooms currently available.", 409)
    hotel.available_rooms -= 1
    booking = Booking(check_in=check_in, check_out=check_out, number_of_guests=guests, user_id=int(get_jwt_identity()), hotel_id=hotel.id)
    db.session.add(booking)
    db.session.commit()
    return jsonify({"booking": booking.public(), "message": "Your residence has been reserved."}), 201


@api.post("/car-bookings")
@jwt_required()
def create_car_booking():
    data = request.get_json(silent=True) or {}
    try:
        service_date, car_id, days = date.fromisoformat(data["service_date"]), int(data["car_id"]), int(data.get("days", 1))
    except (KeyError, TypeError, ValueError):
        return message("Enter a valid service date and duration.")
    car = db.session.get(CarService, car_id)
    pickup = str(data.get("pickup_location", "")).strip()
    if not car or not car.available or not pickup or days < 1:
        return message("Please complete the chauffeur service details.")
    booking = CarBooking(service_date=service_date, days=days, pickup_location=pickup, user_id=int(get_jwt_identity()), car_id=car.id)
    db.session.add(booking)
    db.session.commit()
    return jsonify({"booking": booking.public(), "message": "Your protected transfer has been reserved."}), 201


@api.get("/bookings")
@jwt_required()
def bookings():
    user_id = int(get_jwt_identity())
    stays = Booking.query.filter_by(user_id=user_id).order_by(Booking.check_in.desc()).all()
    transfers = CarBooking.query.filter_by(user_id=user_id).order_by(CarBooking.service_date.desc()).all()
    return jsonify([item.public() for item in stays] + [item.public() for item in transfers])


@api.get("/service-requests")
@jwt_required()
def service_requests():
    requests = ServiceRequest.query.filter_by(user_id=int(get_jwt_identity())).order_by(ServiceRequest.scheduled_for.desc()).all()
    return jsonify([item.public() for item in requests])


@api.post("/service-requests")
@jwt_required()
def create_service_request():
    data = request.get_json(silent=True) or {}
    service_type = str(data.get("service_type", "")).strip().lower()
    service_name = str(data.get("service_name", "")).strip()
    notes = str(data.get("notes", "")).strip()
    allowed_types = {"wellness", "training", "physiotherapy", "guide", "security", "sport_car"}
    try:
        scheduled_for = date.fromisoformat(data["scheduled_for"])
    except (KeyError, TypeError, ValueError):
        return message("Choose a valid service date.")
    if service_type not in allowed_types or not service_name or scheduled_for < date.today():
        return message("Please choose a valid future service and date.")
    request_item = ServiceRequest(
        service_type=service_type, service_name=service_name,
        scheduled_for=scheduled_for, notes=notes[:500], user_id=int(get_jwt_identity()),
    )
    db.session.add(request_item)
    db.session.commit()
    return jsonify({"request": request_item.public(), "message": "Your service request has been sent to the guest team."}), 201


@api.delete("/bookings/<int:booking_id>")
@jwt_required()
def cancel_booking(booking_id):
    booking = db.session.get(Booking, booking_id)
    if not booking or booking.user_id != int(get_jwt_identity()):
        return message("Booking not found.", 404)
    if booking.check_in <= date.today():
        return message("Only future stays can be cancelled.", 409)
    booking.hotel.available_rooms += 1
    db.session.delete(booking)
    db.session.commit()
    return {"message": "Your stay has been cancelled and inventory restored."}


@api.get("/admin/dashboard")
@admin_required
def admin_dashboard():
    recent_bookings = Booking.query.order_by(Booking.id.desc()).limit(12).all()
    popular = (
        db.session.query(Hotel, func.count(Booking.id).label("booking_count"))
        .outerjoin(Booking)
        .group_by(Hotel.id)
        .order_by(func.count(Booking.id).desc(), Hotel.rating.desc())
        .limit(5)
        .all()
    )
    users = User.query.order_by(User.created_at.desc()).limit(12).all()
    recent_services = ServiceRequest.query.order_by(ServiceRequest.id.desc()).limit(12).all()
    recent_reviews = Review.query.order_by(Review.id.desc()).limit(8).all()
    return jsonify({
        "metrics": {
            "travellers": User.query.filter_by(role="customer").count(),
            "reservations": Booking.query.count(),
            "active_stays": Booking.query.filter(Booking.check_out >= date.today()).count(),
            "properties": Hotel.query.count(),
            "service_requests": ServiceRequest.query.count(),
            "guest_reviews": Review.query.count(),
        },
        "popular_hotels": [{**hotel.public(), "booking_count": count} for hotel, count in popular],
        "recent_bookings": [{
            **booking.public(),
            "guest_name": booking.user.username,
            "guest_email": booking.user.email,
        } for booking in recent_bookings],
        "recent_services": [item.public() for item in recent_services],
        "recent_reviews": [item.public() for item in recent_reviews],
        "travellers": [{
            **member.public(), "joined": member.created_at.date().isoformat(),
            "booking_count": Booking.query.filter_by(user_id=member.id).count(),
            "service_count": ServiceRequest.query.filter_by(user_id=member.id).count(),
            "review_count": Review.query.filter_by(user_id=member.id).count(),
        } for member in users],
    })


@api.route("/admin/hotels", methods=["GET", "POST"])
@admin_required
def admin_hotels():
    if request.method == "GET":
        return jsonify([hotel.public() for hotel in Hotel.query.order_by(Hotel.id.desc()).all()])
    data = request.get_json(silent=True) or {}
    hotel = Hotel()
    try:
        hotel_payload(data, hotel)
        hotel.price_per_night, hotel.available_rooms = float(hotel.price_per_night), int(hotel.available_rooms)
        hotel.rating = float(hotel.rating or 4.8)
    except (ValueError, TypeError):
        return message("Please supply valid hotel details.")
    db.session.add(hotel)
    db.session.commit()
    return jsonify(hotel.public()), 201


@api.route("/admin/hotels/<int:hotel_id>", methods=["PATCH", "DELETE"])
@admin_required
def admin_hotel(hotel_id):
    hotel = db.session.get(Hotel, hotel_id)
    if not hotel:
        return message("Hotel not found.", 404)
    if request.method == "DELETE":
        db.session.delete(hotel)
        db.session.commit()
        return "", 204
    try:
        hotel_payload(request.get_json(silent=True) or {}, hotel)
        hotel.price_per_night, hotel.available_rooms = float(hotel.price_per_night), int(hotel.available_rooms)
        hotel.rating = float(hotel.rating or 4.8)
    except (ValueError, TypeError):
        return message("Please supply valid hotel details.")
    db.session.commit()
    return jsonify(hotel.public())
