# Banks in India

```bash
bun i banks-in-india
```

### As a Data Source

```typescript
import banksData from 'banks-in-india/src/datasets/banksData.json';

// Access all banks
const { banks } = banksData;

// Filter by category
const privateBanks = banks.find(section => 
  section.category === 'private_sector_banks'
);
```

## Data Structure

### Bank Object

```typescript
interface Bank {
  name: string;      // Full name of the bank
  ifsc: string;      // IFSC code prefix
  icon: string;      // URL to bank logo (via jsDelivr CDN)
  website: string;   // Official website URL
}
```

### Bank Section

```typescript
interface BankSection {
  title: string;     // Display title (e.g., "Private Sector Banks")
  category: string;  // Category identifier (e.g., "private_sector_banks")
  content: Bank[];   // Array of banks in this category
}
```
