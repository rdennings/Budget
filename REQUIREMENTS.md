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

## Core Requirements

### Authentication
- Users must authenticate using their Gmail account
- Support for multi-device access with real-time data synchronization
- Global state management to ensure data consistency
- Secure user data isolation (users can only access their own data)

### Data Architecture

#### User Model
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

#### Account Model
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

#### Income Model
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

#### Expense Model
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

#### Transaction Model
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

### Firestore Database Schema

```
users/
  {userId}/
    profile: User
    
accounts/
  {accountId}: Account
  
incomes/
  {incomeId}: Income
  
expenses/
  {expenseId}: Expense
  
transactions/
  {transactionId}: Transaction
```

**Indexes Required**:
- `accounts`: userId + isActive
- `incomes`: userId + isActive + isPrimary
- `expenses`: userId + isActive + dateDue
- `transactions`: userId + date + type

## User Interface Specifications

### 1. Overview Page (Dashboard)
**Purpose**: Financial snapshot and quick actions

**Components**:
- **Total Balance Card**: Sum of all active accounts
- **Account Balances**: List of all accounts with current balance
- **Upcoming Bills**: Bills due before next primary income
- **Quick Actions**: Add expense, mark as paid
- **Recent Transactions**: Last 5 transactions

**Bill Status Logic**:
- ❌ **Red**: Overdue (due date < today && !isPaid)
- 🟠 **Orange**: Due today (due date = today && !isPaid)
- 🟡 **Yellow**: Due within 3 days (due date <= today + 3 && !isPaid)
- ✅ **Green**: Future bills (due date > today + 3 && !isPaid)
- **Hidden**: Paid bills (isPaid = true)

**Next Income Period Calculation**:
```typescript
function getNextPrimaryIncomeDate(primaryIncome: Income): Date {
  if (primaryIncome.frequency === 1) { // Monthly
    // Next occurrence on same day of month
  } else { // Bi-weekly
    // Calculate 14 days from last occurrence
  }
}
```

### 2. Expenses Page
**Purpose**: Comprehensive expense management

**Features**:
- **Expense List**: Grouped by category with totals
- **Filters**: By category, paid status, date range
- **Search**: By name or amount
- **Bulk Actions**: Mark multiple as paid
- **Add Expense**: Modal form trigger
- **Edit/Delete**: Per expense actions

**Display Options**:
- Sort by: Due date, amount, name, category
- View: List view, calendar view

### 3. Income Page
**Purpose**: Income source management

**Features**:
- **Income List**: Shows all income sources
- **Primary Indicator**: Highlight primary income
- **Projected Income**: Calculate expected income for current month
- **Add Income**: Modal form trigger
- **Edit/Delete**: Per income actions

### 4. Accounts Page
**Purpose**: Bank account management

**Features**:
- **Account List**: Shows all accounts with balances
- **Add Account**: Create new account
- **Edit Account**: Update name, type, or balance
- **Transaction History**: Per account view
- **Transfer Money**: Between accounts

### 5. Reports Page
**Purpose**: Financial insights and analytics

**Features**:
- **Income vs Expenses**: Monthly comparison chart
- **Category Breakdown**: Pie chart of expense categories
- **Trend Analysis**: 6-month trends
- **Export Data**: CSV/PDF export options

### 6. Settings Page
**Purpose**: User preferences and app configuration

**Features**:
- **Profile Management**: Name, photo
- **Preferences**: Currency, timezone
- **Notifications**: Toggle email/push notifications
- **Data Management**: Export, delete account
- **About**: Version, support links

## Form Specifications

### Income Form Fields
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

**Frequency Options**:
- Monthly (value: 1)
- Bi-weekly (value: 2)

### Expense Form Fields
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
| Split Payment | Toggle | - | Always visible |
| Split Config | Component | Required if isSplit | Visible if isSplit |
| Notes | Textarea | Optional, max 500 chars | Always visible |

**Category Options**:
- Essential (rent, groceries, insurance)
- Utility (electric, water, internet)
- Luxury (entertainment, dining out)
- Credit (credit card payments)
- Loan (personal, auto, student loans)

**Day of Month Handling**:
- If selected day doesn't exist in a month (e.g., 31st), use last day of month
- Warn user when selecting days 29-31

### Account Form Fields
| Field | Type | Validation |
|-------|------|------------|
| Name | Text | Required, max 50 chars |
| Type | Select | Required |
| Initial Balance | Number | Required, max 2 decimals |
| Set as Default | Toggle | - |

## Business Logic

### Primary Income Rules
- Only one income can be marked as primary
- Setting new primary automatically unsets previous
- Primary income determines bill filtering period on dashboard
- System prompts user to set primary if none exists

### Recurring Transaction Generation
- Generate upcoming occurrences for next 3 months
- Create actual transactions only when confirmed/paid
- Handle month-end edge cases (29th, 30th, 31st)
- Adjust for weekends/holidays (optional feature)

### Account Balance Management
- Balance updates immediately upon transaction creation
- Support manual balance adjustments with audit trail
- Warn on negative balances for non-credit accounts
- Prevent deletion of accounts with transactions

### Split Payment Logic
- Even split: Divide amount by number of parts
- Custom split: User specifies amount for each part
- Generate separate transactions for each split
- Track split payment completion

### Data Validation Rules

#### Dates
- One-time expenses: Due date must be today or future
- Recurring expenses: Day of month 1-31
- One-time income: Date received must be today or future
- Recurring income: First day must be today or future
- Transaction dates: Can be past, present, or future

#### Amounts
- All amounts must be positive numbers
- Maximum 2 decimal places
- Maximum value: 999,999,999.99
- Minimum value: 0.01

#### Text Fields
- Names: 1-100 characters, alphanumeric + common symbols
- Notes: 0-500 characters
- No HTML or script injection
- Trim whitespace on save

#### Business Rules
- Cannot delete account with non-zero balance
- Cannot delete account with linked transactions
- Cannot set negative balance on non-credit accounts
- Warn when expense exceeds account balance
- Prevent duplicate income/expense names (warning only)

## Error Handling

### User-Facing Errors
- Form validation: Inline field errors
- Network errors: Toast notifications with retry
- Auth errors: Redirect to login with message
- Data conflicts: Prompt user to refresh

### System Errors
- Log to error tracking service (e.g., Sentry)
- Graceful degradation for non-critical features
- Automatic retry for transient failures
- User-friendly error messages

## Security Requirements

### Authentication & Authorization
- OAuth 2.0 with Google
- Session management with refresh tokens
- Secure cookie storage for auth tokens

### Firestore Security Rules
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

### Data Protection
- Encrypt sensitive data at rest
- Use HTTPS for all communications
- Implement rate limiting on API endpoints
- Regular security audits

## Performance Requirements

### Loading Times
- Initial page load: < 3 seconds
- Subsequent navigation: < 1 second
- Data operations: < 500ms
- Search results: < 200ms

### Data Management
- Pagination: 50 items per page
- Lazy loading for historical data
- Cache frequently accessed data
- Implement virtual scrolling for long lists

### Optimization Strategies
- Code splitting by route
- Image optimization and lazy loading
- Minimize Firestore reads with intelligent caching
- Batch write operations when possible

## Accessibility Requirements

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode option
- Focus indicators on all interactive elements
- Proper ARIA labels and roles

## API Endpoints (RESTful)

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

## Notification System

### Email Notifications
- Bill due reminders (1, 3, 7 days before)
- Low account balance alerts
- Weekly summary reports
- Payment confirmations

### In-App Notifications
- Real-time sync status
- Payment success/failure
- Account balance updates
- System maintenance alerts

### Push Notifications (Future)
- Mobile app bill reminders
- Low balance alerts
- Payment confirmations

## Success Criteria

- [ ] Users can authenticate with Gmail and maintain sessions
- [ ] Data syncs in real-time across multiple devices
- [ ] All CRUD operations work for Income, Expenses, Accounts, and Transactions
- [ ] Overview page correctly calculates balances and bill statuses
- [ ] Forms validate input with clear error messages
- [ ] Responsive design works on all device sizes
- [ ] Primary income period calculations work correctly
- [ ] Split expense functionality creates proper transactions
- [ ] Account balances update automatically with transactions
- [ ] Reports show accurate income vs expense analysis
- [ ] Data persists securely with proper access controls
- [ ] Performance meets specified benchmarks
- [ ] Accessibility standards are met
- [ ] Error handling provides good user experience
- [ ] Export functionality works for tax/backup purposes

## Future Enhancements (Phase 2)

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

## Environment Configuration

### Development
- Local Firestore emulator
- Hot module replacement
- Debug logging enabled
- Mock payment processing

### Staging
- Separate Firestore database
- Production-like environment
- Integration testing enabled
- Limited user access

### Production
- Production Firestore
- Error tracking (Sentry)
- Performance monitoring
- Analytics enabled (Google Analytics)

### Environment Variables
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

## Deployment and DevOps

### CI/CD Pipeline
- Automated testing on pull requests
- Code quality checks (ESLint, Prettier)
- Build optimization
- Automated deployment to Vercel

### Monitoring
- Uptime monitoring (99.9% SLA)
- Error rate tracking
- Performance metrics
- User analytics

### Rollback Strategy
- Instant rollback capability
- Database migration versioning
- Feature flags for gradual rollout
- A/B testing infrastructure