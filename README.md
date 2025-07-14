# Money Tracking App for South Indian Functions

A comprehensive React application for tracking cash gifts at South Indian functions with 500-1500 guests.

## Features

- **Login System**: Super Admin and User roles with one-time password system
- **Money Entry**: Track guest names, addresses, and amounts
- **Record Editor**: Edit/delete entries with password confirmation
- **Admin Portal**: User management and function details configuration
- **PDF Reports**: Generate comprehensive reports with jsPDF
- **Mobile-Friendly**: Responsive design for all devices

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Enable Firestore Database
4. Enable Storage
5. Copy your Firebase configuration

### 2. Update Firebase Configuration

Replace the configuration in `src/firebase/config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Create Admin User

1. Go to Firebase Console > Authentication
2. Add user manually:
   - Email: admin@money-tracker.com
   - Password: admin123

### 5. Local Development

```bash
npm install
npm start
```

### 6. Deploy to Netlify

#### Option 1: GitHub Integration
1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy automatically

#### Option 2: Manual Deploy
```bash
npm run build
# Upload the 'build' folder to Netlify
```

## Default Credentials

- **Super Admin**: admin@money-tracker.com / admin123
- **Users**: Created by admin with one-time passwords

## Project Structure

```
src/
  components/
    Layout.js              # Navigation and layout wrapper
    ProtectedRoute.js      # Route protection component
  pages/
    LoginPage.js           # Login with function details display
    MoneyEntryPage.js      # Money entry form and recent entries
    RecordEditorPage.js    # Edit/delete existing entries
    AdminPortal.js         # User management and function settings
  firebase/
    config.js              # Firebase configuration
  App.js                   # Main app component with routing
  index.js                 # App entry point
  App.css                  # Styles
```

## Usage

1. **Admin Setup**: Login as admin and configure function details
2. **User Creation**: Admin creates users with one-time passwords
3. **Money Entry**: Users log in and start entering guest donations
4. **Record Management**: Users can edit/delete their entries
5. **Reports**: Generate PDF reports with all entries

## Features in Detail

### Authentication
- Role-based access control
- One-time password system for users
- Password change on first login

### Money Entry
- Guest name, address, and amount tracking
- User attribution for each entry
- Real-time statistics dashboard

### Record Editor
- Edit existing entries with password confirmation
- Delete entries with confirmation
- Track modification history

### Admin Portal
- Create/delete user accounts
- Reset user passwords
- Update function details and host photo
- View user statistics

### PDF Reports
- Comprehensive reports with all entries
- Function details header
- Total calculations
- Professional formatting

## Security Features

- Firebase Authentication
- Role-based access control
- Password confirmation for edits
- Protected routes
- Input validation

## Mobile Responsiveness

- Responsive design for all screen sizes
- Touch-friendly interface
- Optimized for mobile data entry

## Support

For issues or questions, please check the Firebase console for authentication and database errors.
