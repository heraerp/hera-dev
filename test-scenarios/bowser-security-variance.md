# Bowser's Castle Security - Variance Exception Scenario

## Business Context
Mario's security team ordered defense equipment from Bowser Industries, but there's a discrepancy between what was ordered, received, and invoiced.

## Transaction Chain

### Purchase Order: PO-MARIO-2024-0234
- **Vendor**: Bowser Industries Inc.
- **Date**: 2024-01-15
- **Amount**: $8,500.00
- **Items**: 
  - 20x Fire Flower Security Systems @ $300 = $6,000
  - 5x Koopa Shell Barriers @ $500 = $2,500

### Goods Receipt: GR-MARIO-2024-0456  
- **Date**: 2024-01-16
- **Received Amount**: $7,200.00
- **Items Actually Received**:
  - 20x Fire Flower Security Systems @ $300 = $6,000
  - 3x Koopa Shell Barriers @ $400 = $1,200 (PARTIAL DELIVERY)
- **Missing**: 2 Koopa Shell Barriers

### Invoice: INV-BOWSER-2024-0789
- **Date**: 2024-01-18  
- **Invoice Amount**: $7,200.00
- **Bowser's Note**: "Partial delivery - remaining barriers backordered"

## Digital Accountant Workflow Test

### 1. Document Processing
**Expected Results:**
- AI extracts invoice data successfully
- Confidence: 91% (slight concern about partial delivery note)
- Flags: "Partial delivery mentioned in description"

### 2. Relationship Detection  
**Expected Links:**
- Finds PO-MARIO-2024-0234 (98% confidence)
- Finds GR-MARIO-2024-0456 (95% confidence)
- Notes: Strong vendor and reference number match

### 3. Three-Way Match Validation
**Expected Validation Results:**
- ✅ PO exists: $8,500.00
- ✅ GR exists: $7,200.00  
- ❌ Amount variance: $1,300.00 (15.3% difference)
- ✅ Vendor match: Bowser Industries Inc.
- ✅ Date sequence: Correct
- **Result**: WARNING - Manual review required

### 4. Exception Handling Workflow
**Expected Process:**
1. **AI Analysis**: 
   - Detects variance exceeds 5% threshold
   - Identifies partial delivery scenario
   - Recommends: "Review for partial delivery acceptance"

2. **Manual Review Queue**:
   - Priority: HIGH (due to large variance)
   - Assigned to: Mario (Purchasing Manager)
   - AI Recommendation: "Verify partial delivery documentation"

3. **Review Actions Available**:
   - ✅ Approve variance (partial delivery)
   - ❌ Reject and investigate  
   - 🔄 Request additional documentation
   - 📝 Create credit memo for backorder

### 5. Resolution Workflow
**Expected Manager Action:**
- Mario reviews and approves partial delivery
- Override reason: "Approved partial delivery - backorder confirmed with vendor"
- AI learns from this decision for future similar scenarios

### 6. AI Journal Entry (Post-Approval)
**Expected Journal Entry:**
```
Journal Entry: JE-20240118-MARIO-002
Description: Partial delivery - Bowser security equipment

Debit:  6300001 - Security Equipment Expense  $7,200.00
Credit: 2100001 - Accounts Payable                    $7,200.00

Override Applied: Variance approved for partial delivery
AI Confidence: 85% (with manual override)
```

## Testing Verification Points
1. System detects variance correctly (15.3%)
2. Flags for manual review due to threshold breach
3. AI provides intelligent recommendations
4. Manual override workflow functions properly
5. Audit trail captures approval reasoning
6. AI learning system updates for future scenarios
7. Notification sent to relevant stakeholders

## Learning Outcome
This scenario tests the system's ability to:
- Handle complex variance situations
- Provide intelligent recommendations
- Support manual override workflows
- Learn from human decisions
- Maintain complete audit compliance