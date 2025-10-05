import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors())
app.use('/static/*', serveStatic({ root: './public' }))

const hashPassword = (password: string): string => {
  return `hashed_${password}_123`
}

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash
}

// API Routes
app.get('/api/schools', async (c) => {
  return c.json([
    { id: 'botani', name: 'Botani International School' },
    { id: 'imperial', name: 'Imperial International School' }
  ])
})

app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()
  
  try {
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (!user || !verifyPassword(password, user.password_hash as string)) {
      return c.json({ error: 'Invalid credentials' }, 401)
    }
    
    const { password_hash, ...userInfo } = user
    return c.json({ user: userInfo })
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500)
  }
})

app.post('/api/register', async (c) => {
  const { email, password, name, phone, role, school, student_class, parent_student_id } = await c.req.json()
  
  try {
    const passwordHash = hashPassword(password)
    
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, name, phone, role, school, student_class, parent_student_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(email, passwordHash, name, phone, role, school, student_class, parent_student_id).run()
    
    return c.json({ success: true, userId: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Registration failed' }, 500)
  }
})

app.get('/api/routes/:school', async (c) => {
  const school = c.req.param('school')
  
  try {
    const routes = await c.env.DB.prepare(
      'SELECT * FROM routes WHERE school = ? AND status = "active" ORDER BY name'
    ).bind(school).all()
    
    return c.json({ routes: routes.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch routes' }, 500)
  }
})

app.get('/api/routes/:routeId/stops', async (c) => {
  const routeId = c.req.param('routeId')
  
  try {
    const stops = await c.env.DB.prepare(`
      SELECT * FROM route_stops 
      WHERE route_id = ? 
      ORDER BY sequence_order
    `).bind(routeId).all()
    
    return c.json({ stops: stops.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch stops' }, 500)
  }
})

app.get('/api/vans/available', async (c) => {
  const { route_id, date, is_morning } = c.req.query()
  
  try {
    const dayOfWeek = new Date(date as string).getDay() || 7
    
    const vans = await c.env.DB.prepare(`
      SELECT v.*, u.name as driver_name, u.phone as driver_phone,
             vr.id as van_route_id
      FROM vans v
      JOIN users u ON v.driver_id = u.id
      JOIN van_routes vr ON v.id = vr.van_id
      WHERE vr.route_id = ? AND vr.day_of_week = ? AND vr.is_morning = ? AND vr.status = 'active'
      AND v.status = 'active'
    `).bind(route_id, dayOfWeek, is_morning === 'true' ? 1 : 0).all()
    
    return c.json({ vans: vans.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch available vans' }, 500)
  }
})

app.post('/api/bookings', async (c) => {
  const { student_id, van_route_id, route_stop_id, booking_date, booked_by, special_instructions } = await c.req.json()
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO bookings (student_id, van_route_id, route_stop_id, booking_date, booked_by, special_instructions)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(student_id, van_route_id, route_stop_id, booking_date, booked_by, special_instructions).run()
    
    return c.json({ success: true, bookingId: result.meta.last_row_id })
  } catch (error) {
    return c.json({ error: 'Failed to create booking' }, 500)
  }
})

app.get('/api/bookings/user/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  try {
    const bookings = await c.env.DB.prepare(`
      SELECT b.*, r.name as route_name, rs.stop_name, rs.pickup_time, rs.dropoff_time,
             v.plate_number, u.name as driver_name, u.phone as driver_phone
      FROM bookings b
      JOIN van_routes vr ON b.van_route_id = vr.id
      JOIN routes r ON vr.route_id = r.id
      JOIN route_stops rs ON b.route_stop_id = rs.id
      JOIN vans v ON vr.van_id = v.id
      JOIN users u ON v.driver_id = u.id
      WHERE b.student_id = ? OR b.booked_by = ?
      ORDER BY b.booking_date DESC, rs.pickup_time
    `).bind(userId, userId).all()
    
    return c.json({ bookings: bookings.results })
  } catch (error) {
    return c.json({ error: 'Failed to fetch bookings' }, 500)
  }
})

app.put('/api/bookings/:bookingId/cancel', async (c) => {
  const bookingId = c.req.param('bookingId')
  
  try {
    await c.env.DB.prepare(
      'UPDATE bookings SET status = "cancelled", updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(bookingId).run()
    
    return c.json({ success: true })
  } catch (error) {
    return c.json({ error: 'Failed to cancel booking' }, 500)
  }
})

app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>School Van Ride - Botani & Imperial International School Ipoh</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
    <link href="/static/style.css" rel="stylesheet">
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <nav class="bg-white shadow-lg">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <div class="flex-shrink-0">
                            <i class="fas fa-bus text-2xl text-blue-600 mr-3"></i>
                            <span class="text-xl font-bold text-gray-800">School Van Ride</span>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <button id="loginBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                            <i class="fas fa-sign-in-alt mr-2"></i>Login
                        </button>
                        <button id="registerBtn" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            <i class="fas fa-user-plus mr-2"></i>Register
                        </button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Van Ride Booking System</h1>
                <p class="text-xl text-gray-600 mb-2">For Botani International School & Imperial International School Ipoh</p>
                <div class="flex justify-center space-x-8 mt-8">
                    <div class="text-center">
                        <div class="bg-white p-6 rounded-lg shadow-md school-card">
                            <i class="fas fa-school text-4xl text-blue-600 mb-4"></i>
                            <h3 class="text-lg font-semibold">Botani International</h3>
                            <p class="text-gray-600">School van services</p>
                        </div>
                    </div>
                    <div class="text-center">
                        <div class="bg-white p-6 rounded-lg shadow-md school-card">
                            <i class="fas fa-graduation-cap text-4xl text-green-600 mb-4"></i>
                            <h3 class="text-lg font-semibold">Imperial International</h3>
                            <p class="text-gray-600">School van services</p>
                        </div>
                    </div>
                </div>
            </div>

            <div id="authSection" class="hidden max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                <div id="loginForm">
                    <h2 class="text-2xl font-bold mb-4">Login</h2>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="loginEmail" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="loginPassword" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Login</button>
                    </form>
                    <p class="mt-4 text-center text-sm text-gray-600">
                        Don't have an account? <a href="#" id="showRegister" class="text-blue-600 hover:underline">Register here</a>
                    </p>
                </div>

                <div id="registerForm" class="hidden">
                    <h2 class="text-2xl font-bold mb-4">Register</h2>
                    <form class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="regName" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" id="regEmail" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" id="regPhone" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="regPassword" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select id="regRole" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                <option value="">Select Role</option>
                                <option value="student">Student</option>
                                <option value="parent">Parent</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">School</label>
                            <select id="regSchool" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" required>
                                <option value="">Select School</option>
                                <option value="botani">Botani International School</option>
                                <option value="imperial">Imperial International School</option>
                            </select>
                        </div>
                        <div id="studentFields" class="hidden">
                            <label class="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <input type="text" id="regClass" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="e.g., Form 4A, Year 10" />
                        </div>
                        <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Register</button>
                    </form>
                    <p class="mt-4 text-center text-sm text-gray-600">
                        Already have an account? <a href="#" id="showLogin" class="text-green-600 hover:underline">Login here</a>
                    </p>
                </div>
            </div>

            <div id="dashboard" class="hidden">
                <div class="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 class="text-2xl font-bold mb-4">Welcome, <span id="userName"></span>!</h2>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-gray-600">Role: <span id="userRole" class="font-semibold"></span></p>
                            <p class="text-gray-600">School: <span id="userSchool" class="font-semibold"></span></p>
                        </div>
                        <button id="logoutBtn" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </div>
                </div>

                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-plus-circle mr-2 text-green-600"></i>Book a Ride
                        </h3>
                        <form id="bookingForm" class="space-y-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Route</label>
                                <select id="routeSelect" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">Select Route</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Stop</label>
                                <select id="stopSelect" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required disabled>
                                    <option value="">Select Stop</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" id="bookingDate" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Time</label>
                                <select id="timeSelect" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="true">Morning (Pick-up)</option>
                                    <option value="false">Afternoon (Drop-off)</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
                                <textarea id="instructions" class="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="Any special instructions..."></textarea>
                            </div>
                            <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">Book Ride</button>
                        </form>
                    </div>

                    <div class="bg-white rounded-lg shadow-md p-6">
                        <h3 class="text-xl font-bold mb-4">
                            <i class="fas fa-list mr-2 text-blue-600"></i>My Bookings
                        </h3>
                        <div id="bookingsList" class="space-y-3">
                            <p class="text-gray-500 text-center py-8">No bookings found</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
    <script src="/static/app.js"></script>
</body>
</html>`)
})

export default app