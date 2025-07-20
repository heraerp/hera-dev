# Mario's Plumbing Supply - Invoice Processing Scenario

## Business Context
Mario Bros. Plumbing Co. just received an invoice from Luigi's Pipe Supply Company for specialty warp pipes and plumbing fixtures.

## Document Details
- **Invoice Number**: INV-LUIGI-2024-0001
- **Vendor**: Luigi's Pipe Supply Co.
- **Invoice Date**: 2024-01-18
- **Amount**: $3,450.00
- **Items**: 
  - 5x Warp Pipes (Green) @ $500 each = $2,500
  - 10x Golden Plumbing Fixtures @ $75 each = $750
  - Installation Manual = $200

## Digital Accountant Workflow Test

### 1. Document Upload & AI Processing
**Expected Flow:**
- User uploads Luigi's invoice PDF via drag & drop
- AI processes document and extracts:
  - Vendor: "Luigi's Pipe Supply Co."
  - Amount: $3,450.00
  - Invoice #: INV-LUIGI-2024-0001
  - Date: 2024-01-18
- AI Confidence Score: 94% (High)
- Status: Ready for relationship detection

### 2. Automatic Relationship Detection
**Expected Results:**
- System finds matching PO: PO-MARIO-2024-0156
- Links to Goods Receipt: GR-MARIO-2024-0089
- Confidence: 96% (Perfect match on PO number and vendor)
- Status: Ready for three-way match validation

### 3. Three-Way Match Validation
**Expected Validation:**
- ✅ PO exists: PO-MARIO-2024-0156 ($3,450.00)
- ✅ GR exists: GR-MARIO-2024-0089 ($3,450.00)
- ✅ Amount match: Perfect match
- ✅ Vendor match: Luigi's Pipe Supply Co.
- ✅ Date sequence: PO → GR → Invoice
- **Result**: PASSED - Ready for automated posting

### 4. AI Journal Entry Creation
**Expected Journal Entry:**
```
Journal Entry: JE-20240118-MARIO-001
Description: Accrual for plumbing supplies - Luigi's Pipe Supply

Debit:  6200001 - Plumbing Supplies Expense    $3,450.00
Credit: 2100001 - Accounts Payable                     $3,450.00

AI Confidence: 98%
Status: Auto-posted (high confidence threshold met)
```

### 5. Workflow Cascade
**Expected Automation:**
- Invoice approved for payment
- Vendor payment scheduled
- Inventory updated for received items
- Cost allocation to "Mushroom Kingdom Maintenance" project
- Notification sent to Princess Peach (Finance Manager)

## Testing Verification Points
1. Document processing confidence ≥ 90%
2. Relationship detection finds correct PO/GR links
3. Three-way match passes all validation checks
4. Journal entry auto-posts without manual review
5. Audit trail captures all AI decisions
6. Workflow triggers proper notifications