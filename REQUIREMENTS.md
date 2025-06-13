# Budget Tracking App - Requirements Document

## Project Overview
A personal budget tracking application that allows users to manage their income, expenses, and account balances with real-time synchronization across multiple devices.

## Technical Stack
- **Frontend**: Next.js with TypeScript
- **Database**: Google Firestore
- **Authentication**: Google OAuth (Gmail accounts)
- **State Management**: React Context API

## Core Requirements

### Authentication
- Users must authenticate using their Gmail account
- Support for multi-device access with data synchronization
- Global state management to ensure data consistency

### Data Architecture

#### User Model
```typescript
interface User {
  id: string;
  email: string;
  createdAt: Date;
  lastLogin: Date;
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
  account: string;        // Bank account name
  isPrimary: boolean;       // Only one income can be marked as primary
  createdAt: Date;
  updatedAt: Date;
}
```

#### Expense Model
```typescript
interface Expense {
  id: string;
  userId: string;
  name: string;                    // Bill/expense name
  category: 'Essential' | 'Utility' | 'Luxury' | 'Credit' | 'Loan';
  amount: number;                  // Dollar amount
  isOneTime: boolean;              // One-time vs recurring
  dayOfMonth?: number;             // Day 1-31 (recurring only)
  dateDue?: Date;                  // Specific due date (one-time only)
  frequency?: 1 | 2;               // 1: Monthly, 2: Every pay period (recurring only)
  isSplit: boolean;                // For future calculations
  isPaid: boolean;                 // Payment status
  createdAt: Date;
  updatedAt: Date;
}
```

## User Interface Specifications

### 1. Overview Page
**Purpose**: Dashboard showing financial snapshot

**Components**:
- Account balances summary
- Upcoming bills list with status indicators

**Bill Status Logic**:
- ❌ **Red**: Overdue bills (due date < current date, not paid)
- 🟠 **Orange**: Due today (due date = current date, not paid)
- ✅ **Green**: Future bills (due date > current date, not paid)
- **Hidden**: Paid bills

**Filtering**: Only show bills due before next primary income period

### 2. Expenses Page
**Purpose**: Manage all bills and one-time expenses

**Components**:
- Comprehensive expense list
- "Add Expense" button triggering modal form

### 3. Income Page
**Purpose**: Manage all income sources

**Components**:
- Income sources list
- "Add Income" button triggering modal form

## Form Specifications

### Income Form Fields
| Field | Type | Validation | Conditional Display |
|-------|------|------------|-------------------|
| Name | Text | Required | Always visible |
| Amount | Number | Required, positive | Always visible |
| One-Time | Checkbox | - | Always visible |
| First Day | Date | Future dates only | Hidden if One-Time = true |
| Date Received | Date | Future dates only | Hidden if One-Time = false |
| Frequency | Dropdown | Required if recurring | Hidden if One-Time = true |
| Account | Text | Required | Always visible |
| Primary Period | Checkbox | Only one income can be primary | Always visible |

**Frequency Options**:
- 1: Monthly
- 2: Bi-weekly

### Expense Form Fields
| Field | Type | Validation | Conditional Display |
|-------|------|------------|-------------------|
| Name | Text | Required | Always visible |
| Category | Dropdown | Required | Always visible |
| Amount | Number | Required, positive | Always visible |
| One-Time | Checkbox | - | Always visible |
| Day of Month | Number | 1-31 range | Hidden if One-Time = true |
| Date Due | Date | Future dates only | Hidden if One-Time = false |
| Frequency | Dropdown | Required if recurring | Hidden if One-Time = true |
| Split | Checkbox | - | Always visible |

**Category Options**:
- Essential
- Utility
- Luxury
- Credit
- Loan

**Frequency Options**:
- 1: Monthly
- 2: Every pay period

## Business Logic Constraints

### Primary Income Rules
- Only one income source can be marked as "Primary" at a time
- When marking an income as primary, any previously primary income should be automatically unmarked
- The primary income period is used to calculate bill display filtering on the Overview page

### Modal Interface Requirements
- All form inputs (Add Income, Add Expense, Edit Income, Edit Expense) must be displayed in modal dialogs
- Modals should close on successful submission or user cancellation
- Form validation should occur before submission
- [ ] Users can authenticate with Gmail
- [ ] Data syncs across multiple devices
- [ ] All CRUD operations work for Income and Expenses
- [ ] Overview page correctly calculates and displays bill statuses
- [ ] Forms validate input according to specifications
- [ ] Responsive design works on desktop and mobile

## Success Criteria
- Primary Period calculations based on primary income frequency (implementation TBD)
- Split expense handling (implementation TBD)
- Account balance tracking and calculations
- Reporting and analytics features