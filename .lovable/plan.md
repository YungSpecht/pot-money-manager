

# Money Pots – Virtual Sub-Account Manager

## Overview
A simple, mobile-first PWA that lets you virtually split a single reserve bank account into named "pots" (e.g., Car, Travel, Insurance). All data is stored locally on your device using localStorage.

## Pages & Features

### 1. Dashboard (Home)
- Shows the **total reserve account balance** at the top
- Lists all pots as cards showing: name, current balance, and a progress indicator
- A summary bar showing allocated vs. unallocated money
- Quick-access button to record the monthly transfer

### 2. Initial Setup / Account Config
- Set the **total account balance** (the real amount in your reserve account)
- Set the **annual interest rate** on the account
- Create your initial pots with names and starting balances
- Validation to ensure pot balances don't exceed the total

### 3. Pot Management
- Add, edit, or delete pots at any time
- Edit a pot's name and current balance
- View a pot's transaction history (deposits, withdrawals, interest)

### 4. Monthly Transfer Setup
- Set the **total monthly transfer amount** arriving into the account
- Define how it splits across pots (fixed amounts or percentages)
- A "Process Monthly Transfer" button to apply the split to all pots at once
- Editable at any time

### 5. Scheduled Withdrawals
- For any pot, set up recurring or one-time withdrawals with:
  - Amount
  - Date (day of month or specific date)
  - Description (e.g., "Car insurance annual premium")
- Dashboard shows upcoming withdrawals in a timeline/list
- When a withdrawal date arrives, it deducts from the pot and shows a notification

### 6. Interest Calculation
- Interest is calculated proportionally across all pots based on the account's annual rate
- When you process a monthly update, interest is auto-applied to each pot
- Shows how much interest each pot has earned

### 7. PWA / Mobile Experience
- Installable as a PWA (add to home screen)
- Mobile-first responsive design optimized for iPhone
- Works offline since all data is local
- Clean, minimal UI with a finance-app feel (cards, subtle colors)

## Data Model (all local)
- Account: total balance, interest rate
- Pots: name, balance, history entries
- Monthly transfer: total amount + split rules
- Scheduled withdrawals: pot, amount, date, description, recurring flag

