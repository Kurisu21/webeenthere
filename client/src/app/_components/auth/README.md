# Authentication System

This directory contains all authentication-related components for the WEBeenThere application.

## Components Overview

### 1. AuthContext (`AuthContext.tsx`)
Centralized authentication state management for the entire application.

**Features:**
- User session persistence using localStorage
- Authentication state management
- Login/logout functionality
- Automatic session restoration on page refresh

**Usage:**
```tsx
import { useAuth } from '../auth/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return <div>Welcome, {user.username}!</div>;
}
```

### 2. AuthGuard (`AuthGuard.tsx`)
Component that protects routes requiring authentication.

**Features:**
- Automatic authentication checking
- Customizable redirect destination
- Configurable countdown timer before redirect
- Login required page with beautiful UI

**Usage:**
```tsx
import { AuthGuard } from '../auth/AuthGuard';

function ProtectedPage() {
  return (
    <AuthGuard redirectTo="/login" countdownSeconds={10}>
      <YourProtectedContent />
    </AuthGuard>
  );
}
```

### 3. LoginRequired (`LoginRequired.tsx`)
Displays a beautiful page informing users they need to log in.

**Features:**
- Visual countdown timer
- Automatic redirect after countdown expires
- Manual login and registration buttons
- Responsive design with animations

### 4. requireAuth HOC (`requireAuth.tsx`)
Higher Order Component for protecting routes declaratively.

**Usage - Method 1 (HOC):**
```tsx
import { requireAuth } from '../auth/requireAuth';

const ProtectedComponent = requireAuth(MyComponent, {
  redirectTo: '/login',
  countdownSeconds: 10
});

export default ProtectedComponent;
```

**Usage - Method 2 (Hook-based):**
```tsx
import { useAuthProtection } from '../auth/requireAuth';

function MyPage() {
  const ProtectedContent = useAuthProtection(MyContent, {
    redirectTo: '/custom-login',
    countdownSeconds: 5
  });
  
  return <ProtectedContent />;
}
```

## Implementation Examples

### Example 1: Individual Page Protection
```tsx
// pages/secure-info.tsx
import { requireAuth } from '../components/auth/requireAuth';

const SecureInfo = () => (
  <div>
    <h1>Sensitive Information</h1>
    <p>Only authenticated users can see this.</p>
  </div>
);

export default requireAuth(SecureInfo, { countdownSeconds: 8 });
```

### Example 2: Direct AuthGuard Usage
```tsx
// pages/protected-dashboard.tsx
import { AuthGuard } from '../components/auth/AuthGuard';

export default function ProtectedDashboard() {
  return (
    <AuthGuard redirectTo="/signin" countdownSeconds={5}>
      <DashboardContent />
    </AuthGuard>
  );
}
```

### Example 3: Layout-Level Protection
```tsx
// layouts/ProtectedLayout.tsx
import { AuthGuard } from '../components/auth/AuthGuard';

export default function ProtectedLayout({ children }) {
  return (
    <AuthGuard countdownSeconds={10}>
      <div className="protected-layout">
        <Header />
        <main>{children}</main>
        <Footer />
      </div>
    </AuthGuard>
  );
}
```

## Customization Options

### AuthGuard Props
- `redirectTo?: string` - Where to redirect (default: '/login')
- `countdownSeconds?: number` - Countdown duration (default: 10)

### LoginRequired Props
- `redirectTo?: string` - Where to redirect (default: '/login')  
- `countdownSeconds?: number` - Countdown duration (default: 10)

## Styling

All components use Tailwind CSS classes and follow the application's design system:
- Purple/blue gradient brand colors
- Dark theme (gray-900 background)
- Glass morphism effects (backdrop-blur)
- Smooth animations and transitions
- Responsive design for all screen sizes

## Security Features

1. **Session Validation**: Checks localStorage for valid tokens
2. **Automatic Redirect**: Prevents unauthorized access
3. **Countdown Timer**: Gives users time to understand why they're being redirected
4. **Manual Override**: Users can click buttons to navigate immediately
5. **Token Expiration**: Sessions expire after 24 hours (configurable in backend)
6. **Email Verification**: Accounts must be verified before login access

## Integration Points

1. **Registration Flow**: Users register → receive email → verify → can login
2. **Login Flow**: Users login → session stored → dashboard access
3. **Logout Flow**: Users logout → session cleared → redirect to home
4. **Session Restoration**: On refresh, checks stored session automatically

This authentication system provides both security and excellent user experience with beautiful interfaces and smooth transitions.
