# Budget Tracking App - Requirements Document

## Project Overview
A personal budget tracking application that allows users to manage their income, expenses, and account balances with real-time synchronization across multiple devices.

## Technical Stack
- **Frontend**: Next.js with TypeScript
- **Database**: Google Firestore
- **Authentication**: Google OAuth (Gmail accounts)
- **State Management**: React Context API
- **Hosting**: Vercel (recommended)
- **UI Framework**: Tailwind CSS (recommended)

## Development Steps

### Step 1: Project Setup & Authentication ✓
**Goal**: Basic Next.js app with Google authentication working

**Requirements**:
- Next.js project with TypeScript configured
- Tailwind CSS setup
- Firebase/Firestore configuration
- Google OAuth authentication
- Protected routes (redirect to login if not authenticated)
- User profile creation on first login

**Data Models Needed**:
```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  preferences?: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}

interface UserPreferences {
  currency: string;       // Default: 'USD'
  timezone: string;       // For handling multi-device sync
  notifications: {
    billReminders: boolean;
    lowBalance: boolean;
    emailNotifications: boolean;
  };
}
```

**Test Criteria**:
- [ ] User can sign in with Google
- [ ] User session persists on refresh
- [ ] User can sign out
- [ ] Non-authenticated users redirected to login
- [ ] User document created in Firestore on first login

---

### Step 2: Account Management ✓
**Goal**: Users can create and manage bank accounts

**Requirements**:
- Accounts page with list view
- Add Account modal form
- Edit Account functionality
- Soft delete (mark as inactive)
- Set default account

**Data Models Needed**:
```typescript
interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash';
  balance: number;
  isDefault: boolean;     // Default account for transactions
  isActive: boolean;      // Soft delete capability
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

**Form Fields**:
| Field | Type | Validation |
|-------|------|------------|
| Name | Text | Required, max 50 chars |
| Type | Select | Required |
| Initial Balance | Number | Required, max 2 decimals |
| Set as Default | Toggle | - |

**Test Criteria**:
- [ ] User can view all their accounts
- [ ] User can add new account with validation
- [ ] User can edit existing account
- [ ] User can soft delete account (only if balance is 0)
- [ ] Only one account can be default
- [ ] Account data persists in Firestore

---

### Step 3: Income Sources ✓
**Goal**: Users can manage income sources

**Requirements**:
- Income page with list view
- Add Income modal form
- Support for one-time and recurring income
- Primary income designation
- Edit/Delete functionality

**Data Models Needed**:
```typescript
interface Income {
  id: string;
  userId: string;
  name: string;           // Income source name
  amount: number;         // Dollar amount
  isOneTime: boolean;     // One-time vs recurring
  firstDay?: Date;        // First occurrence (recurring only)
  dateReceived?: Date;    // Specific date (one-time only)
  frequency?: 1 | 2;      // 1: Monthly, 2: Bi-weekly (recurring only)
  accountId: string;      // Reference to Account
  isPrimary: boolean;     // Only one income can be marked as primary
  isActive: boolean;      // Soft delete capability
  createdAt: Date;
  updatedAt: Date;
}
```

**Form Fields**:
| Field | Type | Validation | Conditional Display |
|-------|------|------------|-------------------|
| Name | Text | Required, max 100 chars | Always visible |
| Amount | Number | Required, positive, max 2 decimals | Always visible |
| One-Time | Toggle | - | Always visible |
| First Day | Date | Required, allows today or future | Visible if !isOneTime |
| Date Received | Date | Required, allows today or future | Visible if isOneTime |
| Frequency | Select | Required | Visible if !isOneTime |
| Account | Select | Required, from user's accounts | Always visible |
| Mark as Primary | Toggle | - | Always visible |
| Notes | Textarea | Optional, max 500 chars | Always visible |

**Test Criteria**:
- [ ] User can view all income sources
- [ ] User can add one-time income
- [ ] User can add recurring income
- [ ] Form shows/hides fields based on one-time toggle
- [ ] Only one income can be primary
- [ ] Account dropdown shows user's accounts
- [ ] Edit and soft delete work correctly

---

### Step 4: Basic Expenses ✓
**Goal**: Users can manage expenses without recurring logic

**Requirements**:
- Expenses page with list view
- Add Expense modal form
- Categories and basic fields
- Edit/Delete functionality
- NO recurring calculation logic yet

**Data Models Needed**:
```typescript
interface Expense {
  id: string;
  userId: string;
  name: string;           // Bill/expense name
  category: 'essential' | 'utility' | 'luxury' | 'credit' | 'loan';
  amount: number;         // Dollar amount
  isOneTime: boolean;     // One-time vs recurring
  dayOfMonth?: number;    // Day 1-31 (recurring only)
  dateDue?: Date;         // Specific due date (one-time only)
  frequency?: 1 | 2;      // 1: Monthly, 2: Every pay period (recurring only)
  accountId?: string;     // Account to pay from
  isSplit: boolean;       // Split between multiple payments
  splitConfig?: SplitConfig;
  isPaid: boolean;        // Payment status for current period
  lastPaidDate?: Date;    // Track when last paid
  nextDueDate?: Date;     // Calculated next due date
  isAutoPay: boolean;     // Automatic payment enabled
  notes?: string;         // Additional notes/memo
  isActive: boolean;      // Soft delete capability
  createdAt: Date;
  updatedAt: Date;
}

interface SplitConfig {
  type: 'even' | 'custom';
  parts: number;          // Number of splits
  amounts?: number[];     // Custom amounts for each split
}
```

**Form Fields** (without split logic for now):
| Field | Type | Validation | Conditional Display |
|-------|------|------------|-------------------|
| Name | Text | Required, max 100 chars | Always visible |
| Category | Select | Required | Always visible |
| Amount | Number | Required, positive, max 2 decimals | Always visible |
| One-Time | Toggle | - | Always visible |
| Day of Month | Number | Required, 1-31 range | Visible if !isOneTime |
| Date Due | Date | Required, allows today or future | Visible if isOneTime |
| Frequency | Select | Required | Visible if !isOneTime |
| Account | Select | Optional | Always visible |
| Auto-Pay | Toggle | - | Always visible |
| Notes | Textarea | Optional, max 500 chars | Always visible |

**Test Criteria**:
- [ ] User can view all expenses
- [ ] User can add one-time expense
- [ ] User can add recurring expense (just save data, no calculations)
- [ ] Categories work correctly
- [ ] Form validation works
- [ ] Edit and soft delete work correctly

---

### Step 5: Manual Transactions ✓
**Goal**: Users can manually record transactions and update balances

**Requirements**:
- Add transaction when marking expense as paid
- Manual transaction creation
- Account balance updates
- Transaction history view

**Data Models Needed**:
```typescript
interface Transaction {
  id: string;
  userId: string;
  expenseId?: string;     // Reference to Expense
  incomeId?: string;      // Reference to Income
  accountId: string;      // Account affected
  accountToId?: string;   // For transfers between accounts
  amount: number;         // Positive for income, negative for expense
  date: Date;
  type: 'income' | 'expense' | 'transfer';
  description?: string;
  isRecurring: boolean;   // Links to recurring income/expense
  isPending: boolean;     // For scheduled but not cleared transactions
  clearedDate?: Date;     // When transaction actually cleared
  createdAt: Date;
  updatedAt: Date;
}
```

**Business Logic**:
- When expense marked as paid → create transaction
- When transaction created → update account balance
- Support manual balance adjustments

**Test Criteria**:
- [ ] Marking expense as paid creates transaction
- [ ] Transaction updates account balance
- [ ] Can view transaction history per account
- [ ] Can create manual transactions
- [ ] Can transfer between accounts
- [ ] Balance calculations are accurate

---

### Step 6: Basic Overview Dashboard ✓
**Goal**: Simple dashboard showing current state

**Requirements**:
- Total balance across all accounts
- List of all accounts with balances
- List of unpaid expenses (no date filtering yet)
- Quick action buttons

**Components**:
- Account summary cards
- Unpaid expenses list
- Total balance calculation

**Test Criteria**:
- [ ] Dashboard shows correct total balance
- [ ] All active accounts displayed
- [ ] Unpaid expenses shown
- [ ] Can navigate to other pages
- [ ] Can mark expenses as paid from dashboard

---

### Step 7: Recurring Logic & Calculations ✓
**Goal**: Implement recurring income/expense calculations

**Requirements**:
- Calculate next due dates for recurring expenses
- Calculate next income dates
- "Every pay period" logic for expenses
- Handle month-end edge cases (29-31)

**Business Logic**:
```typescript
function getNextDueDate(expense: Expense): Date {
  // Implementation for calculating next due date
}

function getNextIncomeDate(income: Income): Date {
  // Implementation for calculating next income date
}

function getExpensesBeforeNextIncome(): Expense[] {
  // Get expenses due before next primary income
}
```

**Test Criteria**:
- [ ] Recurring monthly expenses calculate correctly
- [ ] Bi-weekly income calculates correctly
- [ ] "Every pay period" expenses work with primary income
- [ ] Month-end dates handled properly (31st → 28th in Feb)
- [ ] Dashboard filters expenses by next income period

---

### Step 8: Enhanced Dashboard & Bill Status ✓
**Goal**: Full dashboard with status indicators

**Requirements**:
- Color-coded bill status (overdue, due today, etc.)
- Upcoming bills filtered by next primary income
- Recent transactions widget
- Quick stats (income vs expenses this month)

**Bill Status Logic**:
- ❌ **Red**: Overdue (due date < today && !isPaid)
- 🟠 **Orange**: Due today (due date = today && !isPaid)
- 🟡 **Yellow**: Due within 3 days (due date <= today + 3 && !isPaid)
- ✅ **Green**: Future bills (due date > today + 3 && !isPaid)
- **Hidden**: Paid bills (isPaid = true)

**Test Criteria**:
- [ ] Bills show correct color status
- [ ] Only shows bills before next primary income
- [ ] Recent transactions display correctly
- [ ] Monthly income/expense calculation accurate
- [ ] All widgets update in real-time

---

### Step 9: Reports & Analytics ✓
**Goal**: Basic reporting functionality

**Requirements**:
- Monthly income vs expenses chart
- Expense breakdown by category
- 6-month trend analysis
- Export to CSV functionality

**Components**:
- Chart library integration (Recharts recommended)
- Date range selector
- Category pie chart
- Trend line graph

**Test Criteria**:
- [ ] Charts display correct data
- [ ] Date filtering works
- [ ] Category totals are accurate
- [ ] CSV export includes all relevant data
- [ ] Reports update when data changes

---

### Step 10: Split Payments ✓
**Goal**: Implement split payment functionality

**Requirements**:
- Split payment UI in expense form
- Even and custom split options
- Multiple transactions for splits
- Track split payment completion

**UI Updates**:
- Add split toggle to expense form
- Show split configuration when enabled
- Display split status in expense list

**Test Criteria**:
- [ ] Can enable split payments
- [ ] Even split calculates correctly
- [ ] Custom split amounts work
- [ ] Creates multiple transactions
- [ ] Shows completion status

---

### Step 11: Search, Filter & Bulk Operations ✓
**Goal**: Enhanced data management features

**Requirements**:
- Search expenses/income by name
- Filter by category, date, status
- Bulk mark expenses as paid
- Sort options for all lists

**Test Criteria**:
- [ ] Search returns correct results
- [ ] Filters work independently and together
- [ ] Can select and pay multiple expenses
- [ ] Sorting persists during session
- [ ] Performance remains fast with filters

---

### Step 12: Real-time Sync & Offline Support ✓
**Goal**: Multi-device support with conflict resolution

**Requirements**:
- Firestore real-time listeners
- Optimistic UI updates
- Offline queue for changes
- Conflict resolution (last-write-wins)

**Technical Implementation**:
- useEffect hooks for Firestore listeners
- Local state management for optimistic updates
- Service worker for offline support

**Test Criteria**:
- [ ] Changes sync across devices instantly
- [ ] Can use app while offline
- [ ] Offline changes sync when reconnected
- [ ] No data loss during conflicts
- [ ] UI shows sync status

---

### Step 13: Settings & Preferences ✓
**Goal**: User customization options

**Requirements**:
- Settings page implementation
- Update user preferences
- Notification toggles
- Data export options
- Account deletion

**Test Criteria**:
- [ ] Can update display name
- [ ] Notification preferences save
- [ ] Timezone selection works
- [ ] Can export all data
- [ ] Account deletion removes all user data

---

### Step 14: Security & Error Handling ✓
**Goal**: Production-ready security and UX

**Requirements**:
- Implement Firestore security rules
- Comprehensive error handling
- Loading states for all operations
- User-friendly error messages
- Rate limiting consideration

**Security Rules**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
    
    match /accounts/{accountId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    match /incomes/{incomeId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    match /expenses/{expenseId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
    
    match /transactions/{transactionId} {
      allow read, write: if request.auth.uid == resource.data.userId;
    }
  }
}
```

**Test Criteria**:
- [ ] Users cannot access other users' data
- [ ] All errors show user-friendly messages
- [ ] Loading states prevent duplicate submissions
- [ ] Forms handle validation errors gracefully
- [ ] Network errors don't crash the app

---

### Step 15: Performance & Polish ✓
**Goal**: Production-ready performance

**Requirements**:
- Code splitting implementation
- Lazy loading for routes
- Image optimization
- Firestore query optimization
- Responsive design verification

**Performance Targets**:
- Initial load: < 3 seconds
- Route changes: < 1 second
- Data operations: < 500ms

**Test Criteria**:
- [ ] Meets performance targets
- [ ] Works on all screen sizes
- [ ] Smooth animations
- [ ] Efficient Firestore usage
- [ ] No memory leaks

---

### Step 16: PWA & Accessibility ✓
**Goal**: Progressive Web App with full accessibility

**Requirements**:
- PWA manifest and service worker
- Offline page
- Install prompts
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support

**Test Criteria**:
- [ ] Can install as PWA
- [ ] Works offline with message
- [ ] All interactive elements keyboard accessible
- [ ] Screen reader announces all content
- [ ] Color contrast passes WCAG
- [ ] Focus indicators visible

---

## Data Validation Rules

### Dates
- One-time expenses: Due date must be today or future
- Recurring expenses: Day of month 1-31
- One-time income: Date received must be today or future
- Recurring income: First day must be today or future
- Transaction dates: Can be past, present, or future

### Amounts
- All amounts must be positive numbers
- Maximum 2 decimal places
- Maximum value: 999,999,999.99
- Minimum value: 0.01

### Text Fields
- Names: 1-100 characters, alphanumeric + common symbols
- Notes: 0-500 characters
- No HTML or script injection
- Trim whitespace on save

### Business Rules
- Cannot delete account with non-zero balance
- Cannot delete account with linked transactions
- Cannot set negative balance on non-credit accounts
- Warn when expense exceeds account balance
- Prevent duplicate income/expense names (warning only)

## API Endpoints Reference

### Authentication
- `POST /api/auth/google` - Google OAuth login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update preferences
- `DELETE /api/users/account` - Delete user account

### Accounts
- `GET /api/accounts` - List user's accounts
- `POST /api/accounts` - Create account
- `PUT /api/accounts/:id` - Update account
- `DELETE /api/accounts/:id` - Soft delete account
- `GET /api/accounts/:id/transactions` - Get account transactions

### Income
- `GET /api/income` - List all income sources
- `POST /api/income` - Create income
- `PUT /api/income/:id` - Update income
- `DELETE /api/income/:id` - Soft delete income
- `POST /api/income/:id/set-primary` - Set as primary

### Expenses
- `GET /api/expenses` - List all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Soft delete expense
- `POST /api/expenses/:id/pay` - Mark as paid
- `POST /api/expenses/bulk-pay` - Mark multiple as paid

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `POST /api/transactions/transfer` - Transfer between accounts

### Reports
- `GET /api/reports/summary` - Monthly income/expense summary
- `GET /api/reports/categories` - Expense by category
- `GET /api/reports/trends` - Historical trends
- `GET /api/reports/export` - Export data (CSV/PDF)

## Environment Variables
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
SENTRY_DSN
```

## Testing Checklist Summary

### Core Functionality
- [ ] Authentication works correctly
- [ ] All CRUD operations for each entity
- [ ] Real-time sync across devices
- [ ] Offline functionality
- [ ] Data validation and error handling

### Business Logic
- [ ] Primary income calculations
- [ ] Recurring transaction logic
- [ ] Account balance tracking
- [ ] Bill status indicators
- [ ] Split payment functionality

### User Experience
- [ ] Responsive on all devices
- [ ] Accessible via keyboard
- [ ] Screen reader compatible
- [ ] Fast performance
- [ ] Intuitive navigation

### Production Readiness
- [ ] Security rules enforced
- [ ] Error tracking active
- [ ] Performance monitoring
- [ ] Backup strategy working
- [ ] PWA installable

## Future Enhancements (Post-MVP)
- Budget categories with spending limits
- Bill payment reminders via email/push
- Receipt photo uploads
- Shared expenses with other users
- Investment account integration
- Automated transaction import from banks
- Advanced analytics and forecasting
- Multi-currency support
- Dark mode theme
- Mobile app (React Native)