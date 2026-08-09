import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const destinations = [
  ['Nairobi', 'City & wildlife gateway', 'photo-1516426122078-c23e76319801'],
  ['Nakuru', 'Lake, flamingos & crater', 'photo-1500534314209-a25ddb2bd429'],
  ['Naivasha', 'Safari Rally & lakeside', 'photo-1530789253388-582c481c54b0'],
  ['Mombasa', 'Indian Ocean escapes', 'photo-1507525428034-b723cf961d3e'],
  ['Eldoret', 'Athletics & highlands', 'photo-1500530855697-b586d89ba3ee'],
]
const kenyaCities = new Set(destinations.map(([name]) => name))
const fallbackPhotos = [
  'photo-1516426122078-c23e76319801', 'photo-1542314831-068cd1dbfeeb', 'photo-1566073771259-6a8506099945', 'photo-1584132967334-10e028bd69f7', 'photo-1601918774946-25832a4be0d6',
  'photo-1551882547-ff40c63fe5fa', 'photo-1500534314209-a25ddb2bd429', 'photo-1571896349842-33c89424de2d', 'photo-1596395819057-e37f55a851b7', 'photo-1582719508461-905c673771fd',
  'photo-1540555700478-4be289fbecef', 'photo-1500530855697-b586d89ba3ee', 'photo-1590490360182-c33d57733427', 'photo-1561501900-3701fa6a0864', 'photo-1590490359683-658d3d23f972',
  'photo-1514282401047-d79a71a590e8', 'photo-1499793983690-e29da59ef1c2', 'photo-1520250497591-112f2f40a3f4', 'photo-1507525428034-b723cf961d3e', 'photo-1540202404-a2f29016b523',
  'photo-1522771739844-6a9f6d5f14af', 'photo-1445019980597-93fa8acb246c', 'photo-1556742049-0cfed4f6a45d', 'photo-1556740749-887f6717d7e4', 'photo-1540518614846-7eded433c457',
]
const kenyaHotelNames = [
  ['Giraffe Manor', 'Nairobi Serena Hotel', 'Tribe Hotel', 'Hemingways Nairobi', 'Fairmont The Norfolk'],
  ['Sarova Woodlands Hotel & Spa', 'The Cliff Nakuru', 'Lake Nakuru Lodge', 'Merica Hotel', 'Sarova Lion Hill Game Lodge'],
  ['Enashipai Resort & Spa', 'Great Rift Valley Lodge & Golf Resort', 'Lake Naivasha Sopa Resort', 'Sawela Lodges', 'Lake Naivasha Country Club'],
  ['Sarova Whitesands Beach Resort & Spa', 'EnglishPoint Marina', 'PrideInn Paradise Beach Resort', 'Voyager Beach Resort', 'Serena Beach Resort & Spa'],
  ['Eka Hotel Eldoret', 'Boma Inn Eldoret', 'The Noble Hotel & Conference Centre', 'Sirikwa Hotel', 'Comfy Inn Eldoret'],
]
const demoHotels = destinations.flatMap(([city, tagline, image], cityIndex) => Array.from({ length: 5 }, (_, index) => ({
  id: `demo-${city}-${index}`, name: kenyaHotelNames[cityIndex][index], location: `${city}, Kenya`, city,
  description: `A carefully selected base for ${tagline.toLowerCase()} experiences in Kenya.`, price_per_night: 12000 + index * 4500,
  available_rooms: 8 + index, rating: 4.4 + index / 10, amenities: ['Breakfast', 'Wi-Fi', 'Local concierge'], signature_meal: 'Kenyan seasonal table', featured: index === 0,
  image_url: `https://images.unsplash.com/${fallbackPhotos[cityIndex * 5 + index] || image}?auto=format&fit=crop&w=1200&q=85`,
})))
const currency = new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 })
const today = new Date().toISOString().slice(0, 10)
const storedToken = () => localStorage.getItem('karibu-token') || ''
const imageFallback = (event) => {
  event.currentTarget.onerror = null
  event.currentTarget.src = 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=85'
}

async function dataFrom(response) { try { return await response.json() } catch { return {} } }

function App() {
  const [hotels, setHotels] = useState(demoHotels)
  const [city, setCity] = useState('All')
  const [query, setQuery] = useState('')
  const [hotel, setHotel] = useState(null)
  const [auth, setAuth] = useState(null)
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('karibu-user') || 'null'))
  const [token, setToken] = useState(storedToken)
  const [trips, setTrips] = useState([])
  const [admin, setAdmin] = useState(false)
  const [notice, setNotice] = useState('')

  const filtered = useMemo(() => hotels.filter((item) => (city === 'All' || item.city === city || item.location.startsWith(`${city},`)) && `${item.name} ${item.location}`.toLowerCase().includes(query.toLowerCase())), [hotels, city, query])
  const notify = useCallback((text) => { setNotice(text); window.setTimeout(() => setNotice(''), 4200) }, [])

  useEffect(() => {
    fetch(`${API}/api/hotels`).then(async (response) => {
      const payload = await dataFrom(response)
      // Do not render an older/stale API catalogue that includes international
      // demo properties. Only the five supported Kenya destinations belong here.
      const kenyaOnly = Array.isArray(payload) && payload.length && payload.every((item) => {
        const propertyCity = item.city || item.location?.split(',')[0]?.trim()
        return kenyaCities.has(propertyCity) && item.location?.endsWith(', Kenya')
      })
      if (response.ok && kenyaOnly) setHotels(payload)
    }).catch(() => {})
  }, [])

  async function loadTrips() {
    if (!storedToken()) return
    const response = await fetch(`${API}/api/bookings`, { headers: { Authorization: `Bearer ${storedToken()}` } })
    const payload = await dataFrom(response)
    if (response.ok) setTrips(payload.filter((item) => item.type === 'stay'))
  }

  useEffect(() => {
    if (!token) return
    fetch(`${API}/api/bookings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => ({ response, payload: await dataFrom(response) }))
      .then(({ response, payload }) => { if (response.ok) setTrips(payload.filter((item) => item.type === 'stay')) })
      .catch(() => {})
  }, [token])

  function session(payload) {
    localStorage.setItem('karibu-token', payload.token)
    localStorage.setItem('karibu-user', JSON.stringify(payload.user))
    setToken(payload.token); setUser(payload.user)
  }

  async function submitAuth(event) {
    event.preventDefault()
    const body = Object.fromEntries(new FormData(event.currentTarget))
    const response = await fetch(`${API}/api/auth/${auth}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'We could not complete that request.')
    session(payload); setAuth(null); notify(auth === 'login' ? `Welcome back, ${payload.user.username}.` : 'Your traveller profile is ready.')
  }

  async function reserve(event) {
    event.preventDefault()
    if (!token) { setAuth('login'); return notify('Sign in to request this stay.') }
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const response = await fetch(`${API}/api/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ hotel_id: hotel.id, check_in: form.check_in, check_out: form.check_out, guests: Number(form.guests) }) })
    const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'The reservation could not be completed.')
    setHotel(null); notify('Your Kenya stay is confirmed. Find it in My trips.'); loadTrips()
  }

  async function cancelTrip(id) {
    const response = await fetch(`${API}/api/bookings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
    const payload = await dataFrom(response)
    if (!response.ok) return notify(payload.message || 'This booking could not be cancelled.')
    notify(payload.message); loadTrips()
  }

  function signOut() { localStorage.removeItem('karibu-token'); localStorage.removeItem('karibu-user'); setToken(''); setUser(null); setTrips([]); setAdmin(false); notify('You are signed out.') }

  return <main>
    <header className="nav"><a className="brand" href="#top"><span>k</span> KARIBU <i>STAYS</i></a><nav><a href="#stays">Stays</a><a href="#why">Why Kenya</a>{user && <a href="#trips">My trips</a>}</nav><div className="nav-actions">{user?.role === 'admin' && <button className="text-button" onClick={() => setAdmin(true)}>Admin</button>}{user ? <button className="account" onClick={signOut}>{user.username} · Sign out</button> : <button className="account" onClick={() => setAuth('login')}>Sign in <b>↗</b></button>}</div></header>

    <section className="hero" id="top"><div className="hero-image" /><div className="hero-content"><p className="eyebrow">Kenya, made easy to explore</p><h1>Find your place<br /><em>in the wild.</em></h1><p>Thoughtfully selected Kenyan hotels for city breaks, ocean views, wildlife journeys and Safari Rally weekends.</p><a className="primary" href="#stays">Explore Kenya <span>↓</span></a></div><aside className="hero-stat"><b>25</b><span>handpicked stays</span><p>Five remarkable options in every destination.</p></aside></section>

    <section className="destination-strip">{destinations.map(([name, tagline, image]) => <button key={name} onClick={() => { setCity(name); document.querySelector('#stays').scrollIntoView({ behavior: 'smooth' }) }}><img src={`https://images.unsplash.com/${image}?auto=format&fit=crop&w=420&q=80`} alt="" /><span>{name}</span><small>{tagline}</small></button>)}</section>

    <section className="section stays" id="stays"><div className="section-title"><div><p className="eyebrow">Stay by destination</p><h2>Kenya has a room<br /><em>with your name on it.</em></h2></div><p>Compare trusted stays from Nairobi to the coast. Select a property, choose your dates, and make your request securely.</p></div><div className="filters"><div className="city-buttons"><button className={city === 'All' ? 'active' : ''} onClick={() => setCity('All')}>All Kenya</button>{destinations.map(([name]) => <button className={city === name ? 'active' : ''} onClick={() => setCity(name)} key={name}>{name}</button>)}</div><label className="search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a hotel or destination" /></label></div><div className="results-line"><b>{filtered.length}</b> stays available <span>{city === 'All' ? 'Across Kenya' : `${city}, Kenya`}</span></div><div className="hotel-grid">{filtered.map((item) => <article className="hotel-card" key={item.id} onClick={() => setHotel(item)}><div className="photo"><img src={item.image_url} onError={imageFallback} alt={item.name} /><span>★ {Number(item.rating).toFixed(1)}</span><button aria-label={`View ${item.name}`}>↗</button></div><div className="hotel-info"><p>{item.location}</p><h3>{item.name}</h3><div><b>{currency.format(item.price_per_night)}</b><small>per night · {item.available_rooms} rooms</small></div></div></article>)}</div>{!filtered.length && <p className="empty">No stays match that search. Try another destination.</p>}</section>

    <section className="why" id="why"><div className="why-photo" /><div className="why-copy"><p className="eyebrow">Designed for real journeys</p><h2>From rally dust<br />to <em>ocean blue.</em></h2><p>Naivasha properties are selected for Lake Naivasha, wildlife and Safari Rally access. Mombasa choices include beach and ocean-view stays. Every booking begins with your dates, not a random list.</p><div className="promise"><span>01</span><p><b>Kenya-first collection</b><small>Five stays per destination, all in one focused itinerary.</small></p><span>02</span><p><b>Your account, your trips</b><small>Secure sign-in and a personal space to view or cancel future stays.</small></p></div></div></section>

    {user && <section className="section trips" id="trips"><p className="eyebrow">Traveller space</p><h2>Your upcoming <em>Kenya stays.</em></h2><div className="trip-list">{trips.length ? trips.map((trip) => <article key={trip.id}><img src={trip.hotel.image_url} alt="" /><div><small>{trip.status}</small><h3>{trip.hotel.name}</h3><p>{trip.check_in} → {trip.check_out} · {trip.guests} guest{trip.guests > 1 ? 's' : ''}</p></div><button onClick={() => cancelTrip(trip.id)}>Cancel stay</button></article>) : <p className="empty">No bookings yet. Explore the collection to plan your Kenya trip.</p>}</div></section>}

    <footer><a className="brand" href="#top"><span>k</span> KARIBU <i>STAYS</i></a><p>Kenya stays, thoughtfully connected.</p><button onClick={() => setAuth(user ? null : 'register')}>{user ? 'Your account' : 'Create an account'} ↗</button></footer>
    {hotel && <BookingModal hotel={hotel} close={() => setHotel(null)} reserve={reserve} />}
    {auth && <AuthModal mode={auth} close={() => setAuth(null)} submit={submitAuth} switchMode={() => setAuth(auth === 'login' ? 'register' : 'login')} />}
    {admin && <AdminPanel token={token} hotels={hotels} setHotels={setHotels} close={() => setAdmin(false)} notify={notify} />}
    {notice && <div className="notice">✦ {notice}</div>}
  </main>
}

function BookingModal({ hotel, close, reserve }) { return <div className="overlay" onMouseDown={close}><section className="modal booking-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={close}>×</button><img src={hotel.image_url} onError={imageFallback} alt={hotel.name} /><div><p className="eyebrow">{hotel.location}</p><h2>{hotel.name}</h2><p className="description">{hotel.description}</p><div className="details"><b>★ {Number(hotel.rating).toFixed(1)} guest rating</b><span>{hotel.amenities.join(' · ')}</span><strong>{currency.format(hotel.price_per_night)} <small>per night</small></strong></div><form onSubmit={reserve} className="book-form"><label>Check in<input name="check_in" type="date" min={today} required /></label><label>Check out<input name="check_out" type="date" min={today} required /></label><label>Guests<select name="guests" defaultValue="2"><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option></select></label><button className="primary">Request this stay <span>↗</span></button></form></div></section></div> }

function AuthModal({ mode, close, submit, switchMode }) { const register = mode === 'register'; return <div className="overlay" onMouseDown={close}><section className="modal auth-modal" onMouseDown={(e) => e.stopPropagation()}><button className="close" onClick={close}>×</button><p className="eyebrow">Karibu traveller account</p><h2>{register ? 'Start your Kenya story.' : 'Welcome back.'}</h2><p className="description">{register ? 'Create an account to request stays and keep every itinerary in one place.' : 'Sign in to continue your booking or view your trips.'}</p><form onSubmit={submit} className="auth-form">{register && <label>Full name<input name="username" minLength="3" required /></label>}<label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength="6" required /></label><button className="primary">{register ? 'Create account' : 'Sign in'} <span>↗</span></button></form><p className="switch">{register ? 'Already have an account?' : 'New here?'} <button onClick={switchMode}>{register ? 'Sign in' : 'Create one'}</button></p></section></div> }

function AdminPanel({ token, hotels, setHotels, close, notify }) {
  const [data, setData] = useState(null)
  const [tab, setTab] = useState('overview')
  useEffect(() => { fetch(`${API}/api/admin/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(async (r) => { const p = await dataFrom(r); if (r.ok) setData(p); else notify(p.message || 'Admin dashboard unavailable.') }).catch(() => notify('Admin dashboard unavailable.')) }, [token, notify])
  async function addHotel(event) { event.preventDefault(); const raw = Object.fromEntries(new FormData(event.currentTarget)); const body = { ...raw, amenities: raw.amenities.split(',').map((x) => x.trim()).filter(Boolean), featured: raw.featured === 'on' }; const response = await fetch(`${API}/api/admin/hotels`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) }); const p = await dataFrom(response); if (!response.ok) return notify(p.message || 'Hotel could not be added.'); setHotels((items) => [p, ...items]); event.currentTarget.reset(); notify(`${p.name} has been added.`) }
  async function removeHotel(item) { if (!window.confirm(`Remove ${item.name}?`)) return; const response = await fetch(`${API}/api/admin/hotels/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); if (!response.ok) return notify('Hotel could not be removed.'); setHotels((items) => items.filter((hotel) => hotel.id !== item.id)); notify(`${item.name} has been removed.`) }
  async function updateRating(event, item) { event.preventDefault(); const rating = new FormData(event.currentTarget).get('rating'); const response = await fetch(`${API}/api/admin/hotels/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ rating }) }); const p = await dataFrom(response); if (!response.ok) return notify(p.message || 'Rating could not be updated.'); setHotels((items) => items.map((hotel) => hotel.id === item.id ? p : hotel)); notify(`${item.name} rating updated.`) }
  return <div className="overlay admin-overlay"><section className="modal admin-modal"><button className="close" onClick={close}>×</button><p className="eyebrow">Protected administration</p><h2>Karibu control room.</h2><div className="admin-tabs"><button className={tab === 'overview' ? 'active' : ''} onClick={() => setTab('overview')}>Overview</button><button className={tab === 'hotels' ? 'active' : ''} onClick={() => setTab('hotels')}>Hotels</button></div>{tab === 'overview' && <div>{data ? <><div className="metrics">{Object.entries(data.metrics).map(([key, value]) => <div key={key}><b>{value}</b><span>{key.replace('_', ' ')}</span></div>)}</div><div className="admin-columns"><section><h3>Most booked</h3>{data.popular_hotels.map((item) => <p className="rank" key={item.id}><b>{item.name}</b><span>{item.booking_count} booking{item.booking_count === 1 ? '' : 's'} · ★ {item.rating}</span></p>)}</section><section><h3>Recent booking activity</h3>{data.recent_bookings.length ? data.recent_bookings.map((item) => <p className="rank" key={item.id}><b>{item.guest_name} → {item.hotel.name}</b><span>{item.check_in} · {item.guests} guest(s)</span></p>) : <p className="empty">Bookings will appear here as travellers reserve stays.</p>}</section></div><section className="travellers"><h3>Traveller progress</h3>{data.travellers.map((person) => <p key={person.id}><b>{person.username}</b><span>{person.email} · joined {person.joined}</span></p>)}</section></> : <p className="empty">Loading protected dashboard…</p>}</div>}{tab === 'hotels' && <div className="admin-columns hotel-admin"><form onSubmit={addHotel}><h3>Add a hotel</h3><input name="name" placeholder="Hotel name" required /><input name="location" placeholder="City, Kenya (e.g. Nairobi, Kenya)" required /><input name="price_per_night" type="number" min="1" placeholder="Price per night (KES)" required /><input name="available_rooms" type="number" min="0" placeholder="Available rooms" required /><input name="rating" type="number" min="1" max="5" step="0.1" placeholder="Rating (e.g. 4.8)" required /><input name="image_url" type="url" placeholder="Image URL" required /><input name="signature_meal" placeholder="Signature meal" required /><input name="amenities" placeholder="Amenities, comma separated" required /><textarea name="description" placeholder="What makes this stay special?" required /><label className="check"><input name="featured" type="checkbox" /> Feature this hotel</label><button className="primary">Add hotel <span>↗</span></button></form><section className="manage-hotels"><h3>Live collection ({hotels.length})</h3>{hotels.map((item) => <div key={item.id}><img src={item.image_url} alt="" /><p><b>{item.name}</b><span>{item.location}</span></p><form className="rating-form" onSubmit={(event) => updateRating(event, item)}><input name="rating" type="number" min="1" max="5" step="0.1" defaultValue={item.rating} aria-label={`${item.name} rating`} /><button>Save rating</button></form><button onClick={() => removeHotel(item)}>Remove</button></div>)}</section></div>}</section></div>
}

export default App
