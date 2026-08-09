from datetime import datetime

from .extensions import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="customer")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    bookings = db.relationship("Booking", back_populates="user", cascade="all, delete-orphan")
    car_bookings = db.relationship("CarBooking", back_populates="user", cascade="all, delete-orphan")
    reviews = db.relationship("Review", back_populates="user", cascade="all, delete-orphan")
    service_requests = db.relationship("ServiceRequest", back_populates="user", cascade="all, delete-orphan")

    def public(self):
        return {"id": self.id, "username": self.username, "email": self.email, "role": self.role}


class Hotel(db.Model):
    __tablename__ = "hotels"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price_per_night = db.Column(db.Float, nullable=False)
    available_rooms = db.Column(db.Integer, nullable=False, default=0)
    image_url = db.Column(db.String(500), nullable=False)
    rating = db.Column(db.Float, nullable=False, default=4.8)
    amenities = db.Column(db.Text, nullable=False, default="")
    signature_meal = db.Column(db.String(250), nullable=False, default="Chef's tasting menu")
    featured = db.Column(db.Boolean, nullable=False, default=False)

    bookings = db.relationship("Booking", back_populates="hotel", cascade="all, delete-orphan")
    reviews = db.relationship("Review", back_populates="hotel", cascade="all, delete-orphan")

    def public(self):
        return {
            "id": self.id, "name": self.name, "location": self.location,
            "city": self.location.split(",")[0].strip(),
            "description": self.description, "price_per_night": self.price_per_night,
            "available_rooms": self.available_rooms, "image_url": self.image_url,
            "rating": self.rating, "amenities": [item.strip() for item in self.amenities.split(",") if item.strip()],
            "signature_meal": self.signature_meal, "featured": self.featured,
            "review_count": len(self.reviews),
        }


class CarService(db.Model):
    __tablename__ = "car_services"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    vehicle_type = db.Column(db.String(80), nullable=False)
    price_per_day = db.Column(db.Float, nullable=False)
    seats = db.Column(db.Integer, nullable=False)
    security_detail = db.Column(db.String(150), nullable=False)
    image_url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=False)
    available = db.Column(db.Boolean, nullable=False, default=True)

    bookings = db.relationship("CarBooking", back_populates="car", cascade="all, delete-orphan")

    def public(self):
        return {
            "id": self.id, "name": self.name, "vehicle_type": self.vehicle_type,
            "price_per_day": self.price_per_day, "seats": self.seats,
            "security_detail": self.security_detail, "image_url": self.image_url,
            "description": self.description, "available": self.available,
        }


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(db.Integer, primary_key=True)
    check_in = db.Column(db.Date, nullable=False)
    check_out = db.Column(db.Date, nullable=False)
    number_of_guests = db.Column(db.Integer, nullable=False)
    booking_status = db.Column(db.String(20), nullable=False, default="Confirmed")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey("hotels.id"), nullable=False)
    user = db.relationship("User", back_populates="bookings")
    hotel = db.relationship("Hotel", back_populates="bookings")

    def public(self):
        return {
            "id": self.id, "type": "stay", "status": self.booking_status,
            "check_in": self.check_in.isoformat(), "check_out": self.check_out.isoformat(),
            "guests": self.number_of_guests, "hotel": self.hotel.public(),
        }


class CarBooking(db.Model):
    __tablename__ = "car_bookings"

    id = db.Column(db.Integer, primary_key=True)
    service_date = db.Column(db.Date, nullable=False)
    days = db.Column(db.Integer, nullable=False, default=1)
    pickup_location = db.Column(db.String(250), nullable=False)
    booking_status = db.Column(db.String(20), nullable=False, default="Confirmed")
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    car_id = db.Column(db.Integer, db.ForeignKey("car_services.id"), nullable=False)
    user = db.relationship("User", back_populates="car_bookings")
    car = db.relationship("CarService", back_populates="bookings")

    def public(self):
        return {
            "id": self.id, "type": "chauffeur", "status": self.booking_status,
            "service_date": self.service_date.isoformat(), "days": self.days,
            "pickup_location": self.pickup_location, "car": self.car.public(),
        }


class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    hotel_id = db.Column(db.Integer, db.ForeignKey("hotels.id"), nullable=False)
    user = db.relationship("User", back_populates="reviews")
    hotel = db.relationship("Hotel", back_populates="reviews")

    def public(self):
        return {
            "id": self.id, "rating": self.rating, "comment": self.comment,
            "created_at": self.created_at.date().isoformat(),
            "guest_name": self.user.username,
            "hotel_id": self.hotel_id,
        }


class ServiceRequest(db.Model):
    __tablename__ = "service_requests"

    id = db.Column(db.Integer, primary_key=True)
    service_type = db.Column(db.String(50), nullable=False)
    service_name = db.Column(db.String(150), nullable=False)
    scheduled_for = db.Column(db.Date, nullable=False)
    notes = db.Column(db.String(500), nullable=False, default="")
    status = db.Column(db.String(30), nullable=False, default="Requested")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    user = db.relationship("User", back_populates="service_requests")

    def public(self):
        return {
            "id": self.id, "type": self.service_type, "service_name": self.service_name,
            "scheduled_for": self.scheduled_for.isoformat(), "notes": self.notes,
            "status": self.status, "guest_name": self.user.username,
            "guest_email": self.user.email,
        }
