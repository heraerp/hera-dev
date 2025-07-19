# 📋 PO Approval & Goods Receipt Testing Guide

## 🎯 Overview
This guide provides step-by-step instructions for manually testing Mario's Restaurant PO Approval & Goods Receipt Workflow System.

## 🚀 Getting Started

### Prerequisites
- Application running at `http://localhost:3001`
- Browser with Developer Tools (Chrome/Firefox recommended)
- Access to the following test organization:
  - Organization ID: `00000000-0000-0000-0000-000000000001`

### Test URLs
- **Purchase Orders**: `http://localhost:3001/purchasing/purchase-orders`
- **Approval Dashboard**: `http://localhost:3001/purchasing/approvals`

---

## 📝 Test Scenarios

### 1. Creating Purchase Orders

#### Test Case 1.1: Create Auto-Approved PO ($100 or less)
1. Navigate to `http://localhost:3001/purchasing/purchase-orders`
2. Click **"Create Purchase Order"** button
3. Fill in the form:
   - Supplier: `Quick Office Supplies`
   - Delivery Date: Any future date
   - Items:
     - Item 1: Printer Paper, Qty: 10, Unit Price: $5
     - Item 2: Pens, Qty: 20, Unit Price: $2
   - Total: $90
4. Click **"Create Purchase Order"**
5. **Expected Result**: 
   - Success message shows
   - PO status shows as "auto_approved"
   - No approval required

#### Test Case 1.2: Create Tier 1 Approval PO ($101-$500)
1. Create a new PO with total between $101-$500
2. Example items:
   - Fresh Vegetables: 100kg @ $3.50/kg = $350
3. **Expected Result**:
   - Status: "pending_approval"
   - Assigned to: Chef Mario

#### Test Case 1.3: Create Tier 2 Approval PO ($501-$2000)
1. Create a new PO with total between $501-$2000
2. Example items:
   - Premium Beef: 30kg @ $45/kg = $1,350
3. **Expected Result**:
   - Status: "pending_approval"
   - Assigned to: Sofia Martinez (Manager)

#### Test Case 1.4: Create Tier 3 Approval PO ($2001+)
1. Create a new PO with total over $2001
2. Example items:
   - Commercial Oven: 1 unit @ $5,000
3. **Expected Result**:
   - Status: "pending_approval"
   - Assigned to: Antonio Rossi (Owner)

---

### 2. PO Approval Workflow

#### Test Case 2.1: Approve a Purchase Order
1. Navigate to `http://localhost:3001/purchasing/approvals`
2. Find a PO with status "pending_approval"
3. Click **"Approve"** button
4. **Expected Result**:
   - PO moves to "approved" status
   - Disappears from pending list
   - Metrics update automatically

#### Test Case 2.2: Reject a Purchase Order
1. In approval dashboard, find a pending PO
2. Click **"Reject"** button
3. **Expected Result**:
   - PO status changes to "rejected"
   - Rejection recorded with timestamp

#### Test Case 2.3: Request Modification
1. Find a pending PO
2. Click **"Review"** to open details modal
3. Review items and amounts
4. Click **"Close"** to exit modal
5. Use API or update button to request modification
6. **Expected Result**:
   - Status: "modification_requested"
   - PO returns to requester for updates

#### Test Case 2.4: Search and Filter
1. In approval dashboard:
   - Test search by PO number (e.g., "PO-2025")
   - Test search by supplier name
   - Test status filter dropdown:
     - All Status
     - Pending Approval
     - Approved
     - Rejected
     - Modification Requested
2. **Expected Results**:
   - Search updates results in real-time
   - Filters work correctly
   - Result count updates

---

### 3. Goods Receipt Processing

#### Test Case 3.1: Full Delivery Receipt
1. Navigate to `http://localhost:3001/purchasing/purchase-orders`
2. Find an **approved** PO
3. Click the **orange package icon** (goods receipt)
4. In the Goods Receipt Form:
   - Delivery Date: Today
   - For each item:
     - Received Quantity: Same as ordered
     - Condition: Good
   - Quality Inspection:
     - Temperature: Passed
     - Packaging: Good
     - Visual: Passed
     - Freshness: Good
     - Overall Rating: 5
5. Click **"Process Goods Receipt"**
6. **Expected Result**:
   - Success modal with GR number
   - Auto-closes after 3 seconds
   - Inventory updated

#### Test Case 3.2: Partial Delivery
1. Process goods receipt for approved PO
2. Set received quantities **less than** ordered
3. Example:
   - Ordered: 50kg, Received: 45kg
4. **Expected Result**:
   - Delivery Status: "partial"
   - Variance calculated automatically

#### Test Case 3.3: Quality Issues
1. Process goods receipt with:
   - Some items marked as "damaged" or "rejected"
   - Quality inspection ratings below 5
   - Add notes about issues
2. **Expected Result**:
   - Quality Status: "conditional" or "rejected"
   - Notes saved with receipt

---

### 4. Dashboard and Metrics

#### Test Case 4.1: Metrics Accuracy
1. Check approval dashboard metrics:
   - **Pending Approval**: Count of pending POs
   - **Approved Today**: Today's approvals
   - **Total Value**: Sum of pending amounts
   - **Modification Requests**: Count of modifications
2. Create/approve/reject POs and verify metrics update

#### Test Case 4.2: Real-time Updates
1. Open approval dashboard in two browser tabs
2. Approve a PO in one tab
3. Refresh the other tab
4. **Expected Result**: Changes reflected in both tabs

---

## 🔍 Validation Checklist

### Purchase Order Creation
- [ ] Auto-approval works for orders ≤ $100
- [ ] Tier 1 assignment for $101-$500
- [ ] Tier 2 assignment for $501-$2000
- [ ] Tier 3 assignment for $2001+
- [ ] PO number generated automatically
- [ ] All fields validated properly

### Approval Workflow
- [ ] Approve button works
- [ ] Reject button works
- [ ] Review modal displays correct information
- [ ] Search functionality works
- [ ] Status filters work
- [ ] Metrics update in real-time

### Goods Receipt
- [ ] Only approved POs show receipt button
- [ ] Form pre-fills with PO data
- [ ] Quantity validation works
- [ ] Quality inspection saves correctly
- [ ] GR number generated
- [ ] Success modal auto-closes

### Data Integrity
- [ ] Organization isolation maintained
- [ ] Workflow status tracked correctly
- [ ] Approval history preserved
- [ ] Timestamps accurate
- [ ] Currency formatting consistent

---

## 🐛 Common Issues & Solutions

### Issue: "No purchase orders found"
- **Solution**: Create new POs or check organization ID

### Issue: Approval buttons not showing
- **Solution**: Ensure PO status is "pending_approval"

### Issue: Goods receipt button missing
- **Solution**: PO must be in "approved" status

### Issue: Search not working
- **Solution**: Check for exact matches, search is case-insensitive

---

## 📊 Test Data Reference

### Approval Matrix
| Amount Range | Approval Level | Approver |
|-------------|----------------|----------|
| $0 - $100 | Auto-approved | System |
| $101 - $500 | Tier 1 | Chef Mario |
| $501 - $2000 | Tier 2 | Sofia Martinez |
| $2001+ | Tier 3 | Antonio Rossi |

### Test Suppliers
- Fresh Valley Produce
- Premium Meat Co
- Industrial Kitchen Supply
- Daily Essentials Supply
- Quick Office Supplies

### Expected Statuses
- `pending_approval` - Awaiting approval
- `approved` - Approved and ready for receipt
- `rejected` - Rejected by approver
- `modification_requested` - Needs changes
- `auto_approved` - System approved (≤$100)

---

## 🎯 Success Criteria

The PO Approval system is working correctly when:

1. ✅ All POs route to correct approval tiers
2. ✅ Approval actions update status immediately
3. ✅ Search and filters work accurately
4. ✅ Goods receipt only available for approved POs
5. ✅ Quality inspections save properly
6. ✅ Metrics reflect real-time data
7. ✅ All workflows maintain data integrity

---

## 📝 Notes for Testers

- Use Chrome DevTools Network tab to monitor API calls
- Check Console for any JavaScript errors
- Test with different screen sizes (responsive design)
- Verify dark mode compatibility
- Test keyboard navigation and accessibility

**Happy Testing! 🚀**