// Van Ride App Frontend JavaScript

class VanRideApp {
  constructor() {
    this.currentUser = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setMinDate();
    
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showDashboard();
    }
  }

  setupEventListeners() {
    // Login/Register button events
    document.getElementById('loginBtn').addEventListener('click', () => this.showAuth('login'));
    document.getElementById('registerBtn').addEventListener('click', () => this.showAuth('register'));
    document.getElementById('showRegister').addEventListener('click', (e) => {
      e.preventDefault();
      this.showAuth('register');
    });
    document.getElementById('showLogin').addEventListener('click', (e) => {
      e.preventDefault();
      this.showAuth('login');
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('registerForm').addEventListener('submit', (e) => this.handleRegister(e));
    document.getElementById('bookingForm').addEventListener('submit', (e) => this.handleBooking(e));

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

    // Role change event for registration
    document.getElementById('regRole').addEventListener('change', (e) => {
      const studentFields = document.getElementById('studentFields');
      if (e.target.value === 'student') {
        studentFields.classList.remove('hidden');
      } else {
        studentFields.classList.add('hidden');
      }
    });

    // Route selection change
    document.getElementById('routeSelect').addEventListener('change', (e) => {
      this.loadRouteStops(e.target.value);
    });
  }

  setMinDate() {
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
  }

  showAuth(type) {
    document.getElementById('authSection').classList.remove('hidden');
    
    if (type === 'login') {
      document.getElementById('loginForm').classList.remove('hidden');
      document.getElementById('registerForm').classList.add('hidden');
    } else {
      document.getElementById('loginForm').classList.add('hidden');
      document.getElementById('registerForm').classList.remove('hidden');
    }
  }

  hideAuth() {
    document.getElementById('authSection').classList.add('hidden');
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const response = await axios.post('/api/login', { email, password });
      
      if (response.data.user) {
        this.currentUser = response.data.user;
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.showDashboard();
        this.showMessage('Login successful!', 'success');
      }
    } catch (error) {
      this.showMessage(error.response?.data?.error || 'Login failed', 'error');
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    
    const formData = {
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      phone: document.getElementById('regPhone').value,
      password: document.getElementById('regPassword').value,
      role: document.getElementById('regRole').value,
      school: document.getElementById('regSchool').value,
      student_class: document.getElementById('regClass').value || null
    };

    try {
      const response = await axios.post('/api/register', formData);
      
      if (response.data.success) {
        this.showMessage('Registration successful! Please login.', 'success');
        this.showAuth('login');
        // Clear form
        document.getElementById('registerForm').reset();
      }
    } catch (error) {
      this.showMessage(error.response?.data?.error || 'Registration failed', 'error');
    }
  }

  async showDashboard() {
    this.hideAuth();
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = this.currentUser.name;
    document.getElementById('userRole').textContent = this.currentUser.role;
    document.getElementById('userSchool').textContent = this.currentUser.school;
    
    // Load routes for the user's school
    await this.loadRoutes();
    
    // Load user's bookings
    await this.loadUserBookings();
  }

  async loadRoutes() {
    try {
      const response = await axios.get(`/api/routes/${this.currentUser.school}`);
      const routeSelect = document.getElementById('routeSelect');
      
      // Clear existing options
      routeSelect.innerHTML = '<option value="">Select Route</option>';
      
      response.data.routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = `${route.name} - ${route.area}`;
        routeSelect.appendChild(option);
      });
    } catch (error) {
      this.showMessage('Failed to load routes', 'error');
    }
  }

  async loadRouteStops(routeId) {
    const stopSelect = document.getElementById('stopSelect');
    
    if (!routeId) {
      stopSelect.innerHTML = '<option value="">Select Stop</option>';
      stopSelect.disabled = true;
      return;
    }

    try {
      const response = await axios.get(`/api/routes/${routeId}/stops`);
      
      // Clear existing options
      stopSelect.innerHTML = '<option value="">Select Stop</option>';
      
      response.data.stops.forEach(stop => {
        const option = document.createElement('option');
        option.value = stop.id;
        option.textContent = `${stop.stop_name} - ${stop.pickup_time}`;
        stopSelect.appendChild(option);
      });
      
      stopSelect.disabled = false;
    } catch (error) {
      this.showMessage('Failed to load stops', 'error');
    }
  }

  async handleBooking(e) {
    e.preventDefault();
    
    const routeId = document.getElementById('routeSelect').value;
    const stopId = document.getElementById('stopSelect').value;
    const date = document.getElementById('bookingDate').value;
    const isMorning = document.getElementById('timeSelect').value === 'true';
    const instructions = document.getElementById('instructions').value;

    if (!routeId || !stopId || !date) {
      this.showMessage('Please fill in all required fields', 'error');
      return;
    }

    try {
      // First get available vans
      const vansResponse = await axios.get('/api/vans/available', {
        params: { route_id: routeId, date: date, is_morning: isMorning }
      });
      
      if (vansResponse.data.vans.length === 0) {
        this.showMessage('No vans available for this route and time', 'error');
        return;
      }
      
      // Use the first available van
      const vanRoute = vansResponse.data.vans[0];
      
      const bookingData = {
        student_id: this.currentUser.role === 'student' ? this.currentUser.id : this.currentUser.parent_student_id,
        van_route_id: vanRoute.van_route_id,
        route_stop_id: stopId,
        booking_date: date,
        booked_by: this.currentUser.id,
        special_instructions: instructions || null
      };

      const response = await axios.post('/api/bookings', bookingData);
      
      if (response.data.success) {
        this.showMessage('Booking created successfully!', 'success');
        document.getElementById('bookingForm').reset();
        document.getElementById('stopSelect').disabled = true;
        await this.loadUserBookings();
      }
    } catch (error) {
      this.showMessage(error.response?.data?.error || 'Booking failed', 'error');
    }
  }

  async loadUserBookings() {
    try {
      const response = await axios.get(`/api/bookings/user/${this.currentUser.id}`);
      const bookingsList = document.getElementById('bookingsList');
      
      if (response.data.bookings.length === 0) {
        bookingsList.innerHTML = '<p class="text-gray-500 text-center py-8">No bookings found</p>';
        return;
      }
      
      bookingsList.innerHTML = response.data.bookings.map(booking => `
        <div class="border rounded-lg p-4 ${booking.status === 'cancelled' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="font-semibold text-gray-800">${booking.route_name}</h4>
              <p class="text-sm text-gray-600">${booking.stop_name}</p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-calendar mr-1"></i>${new Date(booking.booking_date).toLocaleDateString()}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-clock mr-1"></i>${booking.pickup_time} - ${booking.dropoff_time}
              </p>
              <p class="text-sm text-gray-600">
                <i class="fas fa-bus mr-1"></i>${booking.plate_number} (${booking.driver_name})
              </p>
              <p class="text-sm font-medium ${booking.status === 'confirmed' ? 'text-green-600' : booking.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'}">
                Status: ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </p>
            </div>
            ${booking.status === 'confirmed' ? `
              <button onclick="app.cancelBooking(${booking.id})" 
                      class="text-red-600 hover:text-red-800 text-sm">
                <i class="fas fa-times mr-1"></i>Cancel
              </button>
            ` : ''}
          </div>
        </div>
      `).join('');
    } catch (error) {
      this.showMessage('Failed to load bookings', 'error');
    }
  }

  async cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const response = await axios.put(`/api/bookings/${bookingId}/cancel`);
      
      if (response.data.success) {
        this.showMessage('Booking cancelled successfully', 'success');
        await this.loadUserBookings();
      }
    } catch (error) {
      this.showMessage('Failed to cancel booking', 'error');
    }
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Hide dashboard and show auth buttons
    document.getElementById('dashboard').classList.add('hidden');
    
    // Clear forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('bookingForm').reset();
    
    this.showMessage('Logged out successfully', 'success');
  }

  showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`;
    messageEl.textContent = message;
    
    document.body.appendChild(messageEl);
    
    // Remove after 5 seconds
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 5000);
  }
}

// Initialize the app when DOM is loaded
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new VanRideApp();
});