import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const localDate = (date = new Date()) => {
  const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60_000))
  return offsetDate.toISOString().slice(0, 10)
}
const addDays = (dateValue, days) => {
  const date = new Date(`${dateValue}T00:00:00`)
  date.setDate(date.getDate() + days)
  return localDate(date)
}
const today = localDate()
const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })
const destinations = [
  ['Nairobi', 'Kenya', 'City, culture & wildlife'], ['Nakuru', 'Kenya', 'Lake & Rift Valley'], ['Naivasha', 'Kenya', 'Rally & lakeside'],
  ['Mombasa', 'Kenya', 'Indian Ocean coast'], ['Eldoret', 'Kenya', 'Athletics & highlands'],
]
const fallbackHotelNames = [
  ['Giraffe Manor', 'Nairobi Serena Hotel', 'Tribe Hotel', 'Hemingways Nairobi', 'Fairmont The Norfolk'],
  ['Sarova Woodlands Hotel & Spa', 'The Cliff Nakuru', 'Lake Nakuru Lodge', 'Merica Hotel', 'Sarova Lion Hill Game Lodge'],
  ['Enashipai Resort & Spa', 'Great Rift Valley Lodge & Golf Resort', 'Lake Naivasha Sopa Resort', 'Sawela Lodges', 'Lake Naivasha Country Club'],
  ['Sarova Whitesands Beach Resort & Spa', 'EnglishPoint Marina', 'PrideInn Paradise Beach Resort', 'Voyager Beach Resort', 'Serena Beach Resort & Spa'],
  ['Eka Hotel Eldoret', 'Boma Inn Eldoret', 'The Noble Hotel & Conference Centre', 'Sirikwa Hotel', 'Comfy Inn Eldoret'],
]
const fallbackHotelPhotos = [
  'photo-1516426122078-c23e76319801', 'photo-1542314831-068cd1dbfeeb', 'photo-1566073771259-6a8506099945', 'photo-1584132967334-10e028bd69f7', 'photo-1601918774946-25832a4be0d6',
  'photo-1551882547-ff40c63fe5fa', 'photo-1500534314209-a25ddb2bd429', 'photo-1571896349842-33c89424de2d', 'photo-1564501049412-61c2a3083791', 'photo-1582719508461-905c673771fd',
  'photo-1540555700478-4be289fbecef', 'photo-1500530855697-b586d89ba3ee', 'photo-1590490360182-c33d57733427', 'photo-1561501900-3701fa6a0864', 'photo-1590490359683-658d3d23f972',
  'photo-1514282401047-d79a71a590e8', 'photo-1499793983690-e29da59ef1c2', 'photo-1520250497591-112f2f40a3f4', 'photo-1507525428034-b723cf961d3e', 'photo-1540202404-a2f29016b523',
  'photo-1522771739844-6a9f6d5f14af', 'photo-1445019980597-93fa8acb246c', 'photo-1556742049-0cfed4f6a45d', 'photo-1556740749-887f6717d7e4', 'photo-1540518614846-7eded433c457',
]
const demoHotels = destinations.flatMap(([city, country, focus], cityIndex) => fallbackHotelNames[cityIndex].map((name, index) => ({
  id: `preview-${cityIndex}-${index}`, name, location: `${city}, ${country}`,
  description: `A considered ${focus.toLowerCase()} hotel experience in Kenya.`,
  price_per_night: 16000 + (cityIndex * 1800) + (index * 4200), available_rooms: 7 + index,
  rating: 4.4 + (index / 10), amenities: ['Breakfast', 'Gym access', 'Wi-Fi', 'Local concierge'],
  image_url: `https://images.unsplash.com/${fallbackHotelPhotos[(cityIndex * 5) + index]}?auto=format&fit=crop&w=1200&q=85`,
})) )
const serviceCards = [
  { type: 'wellness', icon: '◌', title: 'Yoga & recovery', text: 'Sunrise yoga, mobility and restorative sessions in the hotel gym.', action: 'Reserve a yoga session' },
  { type: 'training', icon: '↗', title: 'Gym & training', text: 'Strength, cardio and guided training activities for every level.', action: 'Plan a training session' },
  { type: 'training', icon: '✦', title: 'Personal trainer', text: 'Book one-to-one coaching tailored to your goals and available time.', action: 'Request a trainer' },
  { type: 'physiotherapy', icon: '＋', title: 'Physiotherapy', text: 'Request a qualified physiotherapy appointment for recovery support.', action: 'Request an appointment' },
  { type: 'guide', icon: '⌁', title: 'Tour guide desk', text: 'Arrange a local guide for city, wildlife, coast and cultural experiences.', action: 'Find a guide' },
  { type: 'security', icon: '◆', title: 'Security centre', text: 'Request vetted driver, event and personal security coordination.', action: 'Speak to security' },
]
const fallbackCars = [
  { id: 'sport-1', name: 'Safari Grand Tourer', vehicle_type: 'Porsche Cayenne', price_per_day: 42000, seats: 4, image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=85' },
  { id: 'sport-2', name: 'Coastal Roadster', vehicle_type: 'Mercedes-AMG SL', price_per_day: 52000, seats: 2, image_url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=85' },
  { id: 'sport-3', name: 'Highland Sport SUV', vehicle_type: 'Range Rover Sport', price_per_day: 46000, seats: 5, image_url: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1200&q=85' },
]

const storedToken = () => localStorage.getItem('karibu-token') || ''
const dataFrom = async (response) => { try { return await response.json() } catch { return {} } }
const imageFallback = (event) => { event.currentTarget.onerror = null; event.currentTarget.src = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85' }

function App() {
  const [hotels, setHotels] = useState(demoHotels)
  const [cars, setCars] = useState(fallbackCars)
  const [country, setCountry] = useState('All')
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('karibu-user') || 'null'))
  const [token, setToken] = useState(storedToken)
  const [bookings, setBookings] = useState([])
  const [serviceRequests, setServiceRequests] = useState([])
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [reviewBooking, setReviewBooking] = useState(null)
  const [auth, setAuth] = useState(null)
  const [admin, setAdmin] = useState(false)
  const [notice, setNotice] = useState('')

  const notify = useCallback((text) => { setNotice(text); window.setTimeout(() => setNotice(''), 4500) }, [])
  const loadHotels = useCallback(async () => {
    try { const response = await fetch(`${API}/api/hotels`); const payload = await dataFrom(response); if (response.ok && Array.isArray(payload) && payload.length) setHotels(payload) } catch { /* The curated preview catalogue remains available offline. */ }
  }, [notify])
  const loadJourney = useCallback(async () => {
    if (!token) return
    const headers = { Authorization: `Bearer ${token}` }
    try {
      const [bookingResponse, serviceResponse] = await Promise.all([fetch(`${API}/api/bookings`, { headers }), fetch(`${API}/api/service-requests`, { headers })])
      const [bookingData, serviceData] = await Promise.all([dataFrom(bookingResponse), dataFrom(serviceResponse)])
      if (bookingResponse.ok) setBookings(bookingData.filter((item) => item.type === 'stay'))
      if (serviceResponse.ok) setServiceRequests(serviceData)
    } catch { notify('Your journey information could not be loaded.') }
  }, [token, notify])

  useEffect(() => { loadHotels(); fetch(`${API}/api/cars`).then(async (response) => ({ response, payload: await dataFrom(response) })).then(({ response, payload }) => { if (response.ok && Array.isArray(payload) && payload.length) setCars(payload) }).catch(() => {}) }, [loadHotels])
  useEffect(() => { loadJourney() }, [loadJourney])

  const countries = useMemo(() => ['All', ...new Set(hotels.map((hotel) => hotel.location?.split(',').at(-1)?.trim()).filter(Boolean))], [hotels])
  const cities = useMemo(() => destinations.filter(([, destinationCountry]) => country === 'All' || destinationCountry === country).map(([name]) => name), [country])
  const filteredHotels = useMemo(() => hotels.filter((hotel) => {
    const [hotelCity, hotelCountry] = hotel.location.split(',').map((part) => part.trim())
    return (country === 'All' || hotelCountry === country) && (city === 'All' || hotelCity === city) && `${hotel.name} ${hotel.location}`.toLowerCase().includes(query.toLowerCase())
  }), [hotels, country, city, query])

  function saveSession(payload) { localStorage.setItem('karibu-token', payload.token); localStorage.setItem('karibu-user', JSON.stringify(payload.user)); setToken(payload.token); setUser(payload.user) }
  async function submitAuth(event) {
    event.preventDefault()
    if (!API && !import.meta.env.DEV) return notify('Account service is not configured. Set VITE_API_URL to the Flask API URL, then redeploy.')
    const body = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const response = await fetch(`${API}/api/auth/${auth}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const payload = await dataFrom(response)
      if (!response.ok) return notify(payload.message || 'We could not complete that request.')
      saveSession(payload); setAuth(null); notify(`Welcome, ${payload.user.username}.`)
    } catch {
      notify('The account service could not be reached. Check VITE_API_URL and Render FRONTEND_URL settings.')
    }
  }
  async function reserveHotel(event) {
    event.preventDefault(); if (!token) { setAuth('login'); return notify('Sign in or create an account to book a hotel.') }
    const form = Object.fromEntries(new FormData(event.currentTarget))
    if (form.check_in < today) return notify('Choose today or a future date for check-in.')
    if (form.check_out <= form.check_in) return notify('Check-out must be at least one day after check-in.')
    const response = await fetch(`${API}/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ hotel_id: selectedHotel.id, check_in: form.check_in, check_out: form.check_out, guests: Number(form.guests) }) }); const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'Your booking could not be completed.')
    setSelectedHotel(null); notify('Your hotel is reserved. Find it in My journey.'); loadJourney(); loadHotels()
  }
  async function requestService(event) {
    event.preventDefault(); if (!token) { setAuth('login'); return notify('Sign in or create an account to request a guest service.') }
    const form = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`${API}/api/service-requests`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ service_type: selectedService.type, service_name: selectedService.title || selectedService.name, scheduled_for: form.scheduled_for, notes: form.notes }) }); const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'Your service request could not be sent.')
    setSelectedService(null); notify(payload.message); loadJourney()
  }
  async function submitReview(event) {
    event.preventDefault(); const form = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`${API}/api/hotels/${reviewBooking.hotel.id}/reviews`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating: Number(form.rating), comment: form.comment }) }); const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'Your review could not be saved.')
    setReviewBooking(null); notify(payload.message); loadHotels()
  }
  async function cancelBooking(id) { const response = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); const payload = await dataFrom(response); if (!response.ok) return notify(payload.message || 'This booking could not be cancelled.'); notify(payload.message); loadJourney(); loadHotels() }
  function signOut() { localStorage.removeItem('karibu-token'); localStorage.removeItem('karibu-user'); setToken(''); setUser(null); setBookings([]); setServiceRequests([]); setAdmin(false); notify('You have signed out.') }

  if (admin && user?.role === 'admin') return <AdminWorkspace token={token} hotels={hotels} setHotels={setHotels} exit={() => setAdmin(false)} notify={notify} />
  return <main>
    <header className="nav"><a className="brand" href="#home"><span>k</span> KARIBU <i>STAYS</i></a><nav><a href="#hotels">Hotels</a><a href="#services">Guest services</a>{user && <a href="#journey">My journey</a>}</nav><div className="nav-actions">{user?.role === 'admin' && <button className="nav-button" onClick={() => setAdmin(true)}>Admin area</button>}{user ? <button className="account" onClick={signOut}>{user.username} <small>Sign out</small></button> : <button className="account" onClick={() => setAuth('login')}>Sign in <b>↗</b></button>}</div></header>
    <section className="hero" id="home"><div className="hero-image" /><div className="hero-copy"><p className="eyebrow">Kenya stays · one considered journey</p><h1>Every stay.<br /><em>More Kenya.</em></h1><p>Explore hotels by country and destination, then bring the rest of your trip together in one guest space.</p><a className="primary" href="#hotels">Browse all hotels <span>↓</span></a></div><aside className="hero-stat"><b>{hotels.length || 25}</b><span>hotels in the collection</span><p>From city energy to coast and highlands.</p></aside></section>
    <section className="country-intro"><p className="eyebrow">Explore by location</p><h2>A hotel home page<br />built around <em>where you are going.</em></h2><p>Start with a country, refine by destination and make your booking directly from the hotel collection.</p></section>
    <section className="section hotel-section" id="hotels"><div className="filter-panel"><div><span>Country</span><div className="filter-buttons">{countries.map((item) => <button key={item} className={country === item ? 'active' : ''} onClick={() => { setCountry(item); setCity('All') }}>{item === 'All' ? 'All countries' : item}</button>)}</div></div><div><span>Destination</span><div className="filter-buttons"> <button className={city === 'All' ? 'active' : ''} onClick={() => setCity('All')}>All destinations</button>{cities.map((item) => <button key={item} className={city === item ? 'active' : ''} onClick={() => setCity(item)}>{item}</button>)}</div></div><label className="search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a hotel" /></label></div><div className="section-heading"><div><p className="eyebrow">Hotel collection</p><h2>Find a stay<br /><em>worth arriving for.</em></h2></div><p><b>{filteredHotels.length}</b> hotels shown · {country === 'All' ? 'all locations' : country}</p></div><div className="hotel-grid">{filteredHotels.map((hotel) => <article className="hotel-card" key={hotel.id}><button className="hotel-open" onClick={() => setSelectedHotel(hotel)}><img src={hotel.image_url} onError={imageFallback} alt={hotel.name} /><span>★ {Number(hotel.rating).toFixed(1)}</span><i>View hotel ↗</i></button><div><p>{hotel.location}</p><h3>{hotel.name}</h3><b>{currency.format(hotel.price_per_night)} <small>per night</small></b><button className="link-button" onClick={() => setSelectedHotel(hotel)}>Explore & book</button></div></article>)}</div>{!filteredHotels.length && <p className="empty">No hotel matches this search yet.</p>}</section>
    <section className="services" id="services"><div className="section-heading"><div><p className="eyebrow">Guest services</p><h2>Your stay has<br /><em>more to offer.</em></h2></div><p>Make requests from your client space. The guest team and admin can follow every request.</p></div><div className="service-grid">{serviceCards.map((service) => <article key={service.title}><span>{service.icon}</span><h3>{service.title}</h3><p>{service.text}</p><button className="link-button light" onClick={() => setSelectedService(service)}>{service.action} ↗</button></article>)}</div><div className="cars"><div><p className="eyebrow">Explore Kenya in motion</p><h2>Sports cars, chosen<br />for the <em>long way round.</em></h2><p>Request a premium vehicle for a private Kenya itinerary, with practical support from the guest team.</p></div><div className="car-grid">{cars.map((car) => <article key={car.id}><img src={car.image_url} onError={imageFallback} alt={car.name} /><p>{car.vehicle_type}</p><h3>{car.name}</h3><b>{currency.format(car.price_per_day)} <small>per day</small></b><button className="link-button" onClick={() => setSelectedService({ type: 'sport_car', title: car.name })}>Request this car ↗</button></article>)}</div></div></section>
    {user && <section className="section journey" id="journey"><div className="section-heading"><div><p className="eyebrow">Client page</p><h2>My <em>journey.</em></h2></div><p>Bookings and service requests are private to your account.</p></div><div className="journey-grid"><section><h3>Hotel bookings</h3>{bookings.length ? bookings.map((booking) => <article className="journey-card" key={booking.id}><img src={booking.hotel.image_url} alt="" /><div><span>{booking.status}</span><h4>{booking.hotel.name}</h4><p>{booking.check_in} → {booking.check_out} · {booking.guests} guest(s)</p></div><div className="journey-actions"><button onClick={() => setReviewBooking(booking)}>Review stay</button><button onClick={() => cancelBooking(booking.id)}>Cancel</button></div></article>) : <p className="empty">No hotel bookings yet. Start with the hotel collection above.</p>}</section><section><h3>Guest service requests</h3>{serviceRequests.length ? serviceRequests.map((item) => <article className="service-request" key={item.id}><span>{item.status}</span><h4>{item.service_name}</h4><p>{item.scheduled_for} · {item.notes || 'No additional notes'}</p></article>) : <p className="empty">Your yoga, training, guide, security and vehicle requests will appear here.</p>}</section></div></section>}
    <footer><a className="brand" href="#home"><span>k</span> KARIBU <i>STAYS</i></a><p>Stay well. Explore more.</p><button onClick={() => setAuth(user ? null : 'register')}>{user ? 'Your client page' : 'Create an account'} ↗</button></footer>
    {selectedHotel && <HotelModal hotel={selectedHotel} close={() => setSelectedHotel(null)} reserve={reserveHotel} />}
    {selectedService && <ServiceModal service={selectedService} close={() => setSelectedService(null)} submit={requestService} />}
    {reviewBooking && <ReviewModal booking={reviewBooking} close={() => setReviewBooking(null)} submit={submitReview} />}
    {auth && <AuthModal mode={auth} close={() => setAuth(null)} submit={submitAuth} switchMode={() => setAuth(auth === 'login' ? 'register' : 'login')} />}
    {notice && <div className="notice">✦ {notice}</div>}
  </main>
}

function HotelModal({ hotel, close, reserve }) {
  const [reviews, setReviews] = useState([])
  const [checkIn, setCheckIn] = useState(today)
  const [checkOut, setCheckOut] = useState(addDays(today, 1))
  const minimumCheckOut = addDays(checkIn || today, 1)

  useEffect(() => { fetch(`${API}/api/hotels/${hotel.id}/reviews`).then(dataFrom).then((data) => { if (Array.isArray(data)) setReviews(data) }).catch(() => {}) }, [hotel.id])

  function changeCheckIn(event) {
    const value = event.target.value
    setCheckIn(value)
    const earliestCheckout = addDays(value || today, 1)
    if (!checkOut || checkOut < earliestCheckout) setCheckOut(earliestCheckout)
  }

  return <div className="overlay" onMouseDown={close}><section className="modal hotel-modal" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={close}>×</button><img src={hotel.image_url} onError={imageFallback} alt={hotel.name} /><div className="modal-copy"><p className="eyebrow">{hotel.location}</p><h2>{hotel.name}</h2><p>{hotel.description}</p><div className="details"><b>★ {Number(hotel.rating).toFixed(1)} guest perspective</b><span>{hotel.amenities.join(' · ')}</span><strong>{currency.format(hotel.price_per_night)} <small>per night</small></strong></div><form className="book-form" onSubmit={reserve}><label>Check in<input name="check_in" type="date" min={today} value={checkIn} onChange={changeCheckIn} required /></label><label>Check out<input name="check_out" type="date" min={minimumCheckOut} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} required /></label><label>Guests<select name="guests" defaultValue="2">{[1, 2, 3, 4, 5, 6].map((number) => <option key={number}>{number}</option>)}</select></label><p className="date-help">Check-out must be at least one night after check-in.</p><button className="primary">Book this hotel <span>↗</span></button></form><div className="reviews"><h3>Guest experiences</h3>{reviews.length ? reviews.slice(0, 3).map((review) => <article key={review.id}><b>★ {review.rating} · {review.guest_name}</b><p>{review.comment}</p></article>) : <p>Be the first booked guest to share an experience.</p>}</div></div></section></div>
}
function ServiceModal({ service, close, submit }) { return <div className="overlay" onMouseDown={close}><section className="modal compact-modal" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={close}>×</button><p className="eyebrow">Guest service request</p><h2>{service.title}</h2><p>Tell the guest team when you would like this service. They will track and confirm the request in your journey.</p><form className="book-form" onSubmit={submit}><label>Preferred date<input name="scheduled_for" type="date" min={today} required /></label><label className="wide">Notes<textarea name="notes" placeholder="Time, goals, pickup point, group size or any useful details" maxLength="500" /></label><button className="primary">Send request <span>↗</span></button></form></section></div> }
function ReviewModal({ booking, close, submit }) { return <div className="overlay" onMouseDown={close}><section className="modal compact-modal" onMouseDown={(event) => event.stopPropagation()}><button className="close" onClick={close}>×</button><p className="eyebrow">Guest perspective</p><h2>How was {booking.hotel.name}?</h2><p>Your rating and comment help future guests and update the hotel’s customer score.</p><form className="book-form" onSubmit={submit}><label>Rating<select name="rating" defaultValue="5">{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select></label><label className="wide">Your experience<textarea name="comment" minLength="8" placeholder="What did you enjoy, and what should a future guest know?" required /></label><button className="primary">Publish review <span>↗</span></button></form></section></div> }
function AuthModal({ mode, close, submit, switchMode }) { const registering = mode === 'register'; return <div className="overlay" onMouseDown={close}><section className="modal compact-modal" onMouseDown={(event) => event.stopPropagation()}><button type="button" className="close" onClick={close}>×</button><p className="eyebrow">Karibu account</p><h2>{registering ? 'Start your journey.' : 'Welcome back.'}</h2><p>{registering ? 'Create an account to book hotels, request guest services and leave guest reviews.' : 'Sign in to manage your bookings and requests.'}</p><form className="book-form" onSubmit={submit}>{registering && <label className="wide">Full name<input name="username" minLength="3" required /></label>}<label className="wide">Email<input name="email" type="email" required /></label><label className="wide">Password<input name="password" type="password" minLength="6" required /></label><button type="submit" className="primary">{registering ? 'Create account' : 'Sign in'} <span>↗</span></button></form><p className="switch">{registering ? 'Already have an account?' : 'New to Karibu?'} <button type="button" onClick={switchMode}>{registering ? 'Sign in' : 'Create one'}</button></p></section></div> }

function AdminWorkspace({ token, hotels, setHotels, exit, notify }) {
  const [data, setData] = useState(null); const [tab, setTab] = useState('overview')
  const loadDashboard = useCallback(async () => { try { const response = await fetch(`${API}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }); const payload = await dataFrom(response); if (response.ok) setData(payload); else notify(payload.message || 'Admin access was declined.') } catch { notify('The admin dashboard is unavailable.') } }, [token, notify])
  useEffect(() => { loadDashboard() }, [loadDashboard])
  async function addHotel(event) { event.preventDefault(); const raw = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch(`${API}/api/admin/hotels`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...raw, amenities: raw.amenities.split(',').map((item) => item.trim()).filter(Boolean), featured: raw.featured === 'on' }) }); const payload = await dataFrom(response); if (!response.ok) return notify(payload.message || 'Hotel could not be added.'); setHotels((items) => [payload, ...items]); event.currentTarget.reset(); notify(`${payload.name} was added.`); loadDashboard() }
  async function removeHotel(hotel) { if (!window.confirm(`Remove ${hotel.name}?`)) return; const response = await fetch(`${API}/api/admin/hotels/${hotel.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) return notify('Hotel could not be removed.'); setHotels((items) => items.filter((item) => item.id !== hotel.id)); notify(`${hotel.name} was removed.`); loadDashboard() }
  return <main className="admin-page"><header className="admin-header"><a className="brand" href="#admin"><span>k</span> KARIBU <i>ADMIN</i></a><button className="account" onClick={exit}>← Back to website</button></header><div className="admin-shell"><aside><p className="eyebrow">Authenticated admin workspace</p><h1>Guest progress,<br /><em>in one place.</em></h1><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'guests' ? 'active' : ''} onClick={() => setTab('guests')}>Guest progress</button><button className={tab === 'hotels' ? 'active' : ''} onClick={() => setTab('hotels')}>Hotel management</button></aside><section className="admin-content">{!data ? <p className="empty">Loading secure workspace…</p> : <>{tab === 'overview' && <><p className="eyebrow">Live overview</p><h2>Today’s guest <em>activity.</em></h2><div className="metrics">{Object.entries(data.metrics).map(([key, value]) => <article key={key}><b>{value}</b><span>{key.replaceAll('_', ' ')}</span></article>)}</div><div className="admin-columns"><section><h3>Recent stays</h3>{data.recent_bookings.length ? data.recent_bookings.map((item) => <p className="admin-row" key={item.id}><b>{item.guest_name} → {item.hotel.name}</b><span>{item.check_in} · {item.guests} guest(s)</span></p>) : <p className="empty">No hotel bookings yet.</p>}</section><section><h3>Recent service requests</h3>{data.recent_services.length ? data.recent_services.map((item) => <p className="admin-row" key={item.id}><b>{item.guest_name} → {item.service_name}</b><span>{item.scheduled_for} · {item.status}</span></p>) : <p className="empty">No guest service requests yet.</p>}</section></div><div className="admin-columns"><section><h3>Customer-rated hotels</h3>{data.popular_hotels.map((item) => <p className="admin-row" key={item.id}><b>{item.name}</b><span>★ {item.rating} · {item.review_count || 0} reviews · {item.booking_count} bookings</span></p>)}</section><section><h3>Latest guest comments</h3>{data.recent_reviews.length ? data.recent_reviews.map((review) => <p className="admin-row" key={review.id}><b>★ {review.rating} · {review.guest_name}</b><span>{review.comment}</span></p>) : <p className="empty">Guest comments will appear after reviewed stays.</p>}</section></div></>}{tab === 'guests' && <><p className="eyebrow">Client progress</p><h2>Every guest,<br /><em>their whole journey.</em></h2><div className="guest-list">{data.travellers.map((guest) => <article key={guest.id}><div><b>{guest.username}</b><span>{guest.email} · joined {guest.joined}</span></div><p><b>{guest.booking_count}</b> stays</p><p><b>{guest.service_count}</b> services</p><p><b>{guest.review_count}</b> reviews</p></article>)}</div></>}{tab === 'hotels' && <div className="hotel-admin"><div><p className="eyebrow">Hotel management</p><h2>Add a new<br /><em>destination stay.</em></h2><form className="admin-form" onSubmit={addHotel}><input name="name" placeholder="Hotel name" required /><input name="location" placeholder="City, Country" required /><input name="price_per_night" type="number" min="1" placeholder="Nightly rate (KES)" required /><input name="available_rooms" type="number" min="0" placeholder="Available rooms" required /><input name="image_url" type="url" placeholder="Image URL" required /><input name="signature_meal" placeholder="Signature meal" required /><input name="amenities" placeholder="Amenities, comma separated" required /><textarea name="description" placeholder="What makes this stay special?" required /><label><input name="featured" type="checkbox" /> Feature this hotel on home</label><button className="primary">Add hotel <span>↗</span></button></form></div><section className="manage-hotels"><h3>Live hotel collection ({hotels.length})</h3>{hotels.map((hotel) => <article key={hotel.id}><img src={hotel.image_url} onError={imageFallback} alt="" /><div><b>{hotel.name}</b><span>{hotel.location} · ★ {Number(hotel.rating).toFixed(1)} from guests</span></div><button onClick={() => removeHotel(hotel)}>Remove</button></article>)}</section></div>}</>}</section></div></main>
}

export default App
