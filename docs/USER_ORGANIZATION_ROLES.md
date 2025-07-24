# HERA User Organization Roles

## 🎭 Available Roles for Organizations

The User Organizations API supports the following roles for managing team members within an organization:

### **1. Owner** 👑
- **Description**: The business owner or primary stakeholder
- **Example**: Mario (Restaurant Owner)
- **Permissions**: Full control over the organization
- **Use Case**: Business founders, sole proprietors

### **2. Manager** 📊
- **Description**: Management-level employees with administrative responsibilities
- **Example**: Sofia Martinez (Restaurant Manager)
- **Permissions**: Can manage staff, view reports, handle operations
- **Use Case**: General managers, department heads, supervisors

### **3. Staff** 👥
- **Description**: Regular employees who work in the organization
- **Examples**: 
  - Giuseppe Rossi (Head Chef)
  - Maria Gonzalez (Server)
  - Kitchen staff, bartenders, hosts
- **Permissions**: Access to operational tools, limited administrative access
- **Use Case**: All non-management employees

### **4. Accountant** 🧮
- **Description**: Financial professionals who manage the organization's books
- **Examples**:
  - Michael Numbers (External Accountant)
  - Sarah Books (Internal Bookkeeper)
- **Permissions**: Access to financial data, reports, invoicing
- **Use Case**: CPAs, bookkeepers, financial advisors

### **5. Viewer** 👀
- **Description**: Read-only access to organization data
- **Example**: Auditors, temporary consultants
- **Permissions**: Can view but not modify any data
- **Use Case**: Limited access for monitoring or review purposes

## 🚫 Removed Role

### **Customer** (Removed)
- Customers will be managed through a separate Customer Relationship API
- This allows for more specialized customer management features
- Customer data will have its own dedicated endpoints and functionality

## 📝 Usage Examples

```javascript
// Add a manager to the organization
POST /api/user-organizations
{
  "userId": "user-uuid",
  "organizationId": "org-uuid",
  "role": "manager"
}

// Add an accountant
POST /api/user-organizations
{
  "userId": "accountant-uuid",
  "organizationId": "org-uuid",
  "role": "accountant"
}

// Update someone's role from staff to manager
PUT /api/user-organizations/[relationship-id]
{
  "role": "manager"
}
```

## 🔐 Role Hierarchy

1. **Owner** - Highest level, typically one per organization
2. **Manager** - Administrative access, can manage staff
3. **Accountant** - Financial access, specialized permissions
4. **Staff** - Operational access, standard employee
5. **Viewer** - Read-only access, lowest permissions

## 🎯 Best Practices

- Each organization should have at least one **owner**
- **Managers** should be limited to those with actual management responsibilities
- **Accountants** should only be assigned to financial professionals
- Use **staff** for all regular employees
- **Viewer** role should be used sparingly for temporary access needs

## 🔄 Future Considerations

- Customer relationships will be handled by a dedicated Customer API
- This separation allows for:
  - Customer loyalty programs
  - Purchase history tracking
  - Marketing communications
  - Customer preferences
  - Review and feedback systems