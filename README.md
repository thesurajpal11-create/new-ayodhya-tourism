# Ayodhya Ramnagari Tourism Website

A complete tour and travel booking website for pilgrimage destinations in India featuring Ayodhya, Varanasi, Chitrakoot, Mathura, and Gaya.

## Features

✅ **User Management**
- User registration and login
- Secure authentication with tokens
- User profile management

✅ **Destinations**
- 5 sacred pilgrimage destinations
- Detailed destination pages with descriptions
- Navigation and recommendations
- Best time to visit information

✅ **Booking System**
- Hotels and accommodations
- Guided tours
- Transportation services
- Multi-day packages
- Restaurant reservations

✅ **Admin Panel**
- Manage destinations
- Manage services and pricing
- View and manage bookings
- Update booking status

✅ **Contact Features**
- WhatsApp integration
- Phone contact
- Email support
- Instagram & YouTube links

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: MySQL
- **Authentication**: Token-based (can be upgraded to JWT)
- **ORM**: SQLAlchemy

### Frontend
- **HTML5**
- **CSS3**
- **Vanilla JavaScript**
- **Responsive Design**

## Project Structure

```
tour/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── destination.py
│   │   │   ├── booking.py
│   │   │   └── service.py
│   │   ├── schemas/
│   │   │   ├── user.py
│   │   │   ├── destination.py
│   │   │   ├── booking.py
│   │   │   └── service.py
│   │   └── routes/
│   ├── main.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   ├── auth.js
│   │   ├── bookings.js
│   │   └── destinations.js
│   ├── pages/
│   │   ├── destinations.html
│   │   ├── login.html
│   │   ├── signup.html
│   │   ├── bookings.html
│   │   └── contact.html
│   └── images/
└── README.md
```

## Installation & Setup

### Prerequisites
- Python 3.8+
- MySQL Server running
- Node.js or browser for frontend

### Backend Setup

1. **Clone or navigate to the backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup MySQL Database**
   ```sql
   CREATE DATABASE ayodhya_tourism;
   ```

5. **Update database connection** in `database.py`
   ```python
   DATABASE_URL = "mysql+mysqlconnector://root:your_password@localhost:3306/ayodhya_tourism"
   ```

6. **Run the server**
   ```bash
   python main.py
   ```
   Or with uvicorn:
   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Serve using Python**
   ```bash
   python -m http.server 5500
   ```
   Or use any HTTP server like:
   ```bash
   npx http-server
   ```

3. **Access in browser**
   ```
   http://localhost:5500
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Destinations
- `GET /api/destinations` - Get all destinations
- `GET /api/destinations/{id}` - Get specific destination
- `POST /api/destinations` - Create destination (Admin)

### Services
- `GET /api/services/destination/{destination_id}` - Get destination services
- `POST /api/services` - Create service (Admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/{id}` - Get specific booking

### Admin
- `GET /api/admin/bookings` - Get all bookings (Admin)
- `PUT /api/admin/bookings/{id}/status` - Update booking status (Admin)

## Default Destinations

1. **Ayodhya** 🏛️
   - Ram Mandir
   - Ancient pilgrimage site

2. **Varanasi (Kashi)** 🌊
   - Ganges Ghats
   - Spiritual center

3. **Chitrakoot** 🏔️
   - Ramghat
   - Ram Darshan site

4. **Mathura** 🐄
   - Krishna Birthplace
   - Religious significance

5. **Gaya** 🕉️
   - Vishnupad Temple
   - Sacred pilgrimage

## Services Offered

- 🛏️ **Hotels** - Various accommodation options
- 🚌 **Transportation** - Buses, cars, taxis
- 🗺️ **Guided Tours** - Expert guides
- 📦 **Packages** - Multi-day tour packages
- 🍽️ **Restaurants** - Pure vegetarian dining

## Contact Information

- **Phone**: 7607745628
- **WhatsApp**: 7607745628
- **Email**: info@ayodhyaramnagari.com
- **Instagram**: @ayodhyaramnagari
- **YouTube**: [Channel Link]

## Database Schema

### Users Table
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR 100)
- email (VARCHAR 100, UNIQUE)
- password (VARCHAR 255)
- phone (VARCHAR 20)
- is_admin (BOOLEAN)
- created_at (DATETIME)
```

### Destinations Table
```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR 100, UNIQUE)
- description (TEXT)
- short_description (VARCHAR 255)
- image_url (VARCHAR 500)
- rating (FLOAT)
- best_time_to_visit (VARCHAR 100)
- created_at (DATETIME)
```

### Bookings Table
```sql
- id (INT, PRIMARY KEY)
- user_id (INT, FOREIGN KEY)
- destination_id (INT, FOREIGN KEY)
- service_type (VARCHAR 100)
- check_in_date (DATETIME)
- check_out_date (DATETIME)
- number_of_people (INT)
- total_price (FLOAT)
- status (ENUM: pending, confirmed, completed, cancelled)
- created_at (DATETIME)
```

### Services Table
```sql
- id (INT, PRIMARY KEY)
- destination_id (INT, FOREIGN KEY)
- service_type (VARCHAR 100)
- name (VARCHAR 200)
- description (TEXT)
- price_per_unit (FLOAT)
- unit (VARCHAR 50)
- rating (FLOAT)
- created_at (DATETIME)
```

## Future Enhancements

- [ ] YouTube video integration on destination pages
- [ ] Payment gateway integration (Razorpay/PayPal)
- [ ] Admin dashboard for statistics
- [ ] User reviews and ratings
- [ ] Email notifications
- [ ] Social media integration
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Advanced search and filters

## Security Notes

**Current Implementation:**
- Simple token-based authentication
- Password hashing with bcrypt

**For Production:**
- Implement JWT tokens
- Add CORS properly
- Use HTTPS
- Environment variables for secrets
- Rate limiting
- Input validation
- SQL injection prevention (already done with ORM)

## Testing

To test the API endpoints, you can use:
- Postman
- cURL
- Thunder Client
- API testing tools in VS Code

Example cURL request:
```bash
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","phone":"7607745628"}'
```

## Troubleshooting

### "Connection refused" error
- Ensure MySQL server is running
- Check database credentials in `database.py`

### API not responding
- Check if uvicorn server is running
- Verify port 8000 is not in use
- Check firewall settings

### Frontend not loading data
- Ensure backend API is running
- Check if CORS is properly configured
- Verify API_BASE_URL in `js/main.js`

## Contributing

Feel free to fork and submit pull requests for improvements.

## License

This project is open source and available under the MIT License.

## Support

For issues or feature requests, please contact:
- Email: info@ayodhyaramnagari.com
- WhatsApp: 7607745628

---

**Happy Travels!** 🚀✈️🏖️
>>>>>>> af56191 (first commit)
