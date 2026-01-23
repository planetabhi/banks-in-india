# Banks in India

[![jsDelivr downloads](https://data.jsdelivr.com/v1/package/npm/banks-in-india/badge)](https://www.jsdelivr.com/package/npm/banks-in-india)

Comprehensive directory of all active Indian banks with IFSC codes, logos, and official websites.

**Live Site:** [banksin.in](https://banksin.in/)

## Features

- 🏦 **Complete Bank Directory** - All active Indian banks across multiple categories
- 🔍 **IFSC Codes** - Bank IFSC code prefixes for easy identification
- 🎨 **Bank Logos** - High-quality logos for all banks via CDN
- 🔗 **Official Links** - Direct links to official bank websites
- 📱 **Responsive Design** - Works seamlessly on all devices
- ⚡ **Fast & Lightweight** - Built with Astro for optimal performance

## Bank Categories

- Private Sector Banks (22 banks)
- Public Sector Banks (12 banks)
- Small Finance Banks (12 banks)
- Payment Banks (6 banks)
- Regional Rural Banks (43 banks)
- Local Area Banks (2 banks)
- Foreign Banks (40+ banks)
- Financial Institutions (4 institutions)

## Installation

Install as an npm package:

```bash
# Using pnpm
pnpm install banks-in-india

# Using npm
npm install banks-in-india

# Using yarn
yarn add banks-in-india
```

## Usage

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

### Icon Library

Download the complete Figma icon library: [Banks in India - Figma Icons ($5)](https://methodblack.gumroad.com/l/banks-in-india)

## Development

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm

### Setup

```bash
# Clone the repository
git clone https://github.com/planetabhi/banks-in-india.git
cd banks-in-india

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The site will be available at `http://localhost:4321`

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
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

## Tech Stack

- **Framework:** [Astro](https://astro.build/) - Static site generator
- **Styling:** [@new-ui/foundations](https://www.npmjs.com/package/@new-ui/foundations) - Design system
- **Deployment:** [Netlify](https://www.netlify.com/)
- **CDN:** [jsDelivr](https://www.jsdelivr.com/) - Icon delivery
- **TypeScript:** Full type safety

## Resources

- [RBI - List of Banks](https://www.rbi.org.in/scripts/banklinks.aspx)
- [NPCI - Live Members](https://www.npci.org.in/)
- [NEFT IFSC Codes](https://rbidocs.rbi.org.in/rdocs/content/docs/68774.xlsx)
- [RTGS IFSC Codes](https://rbidocs.rbi.org.in/rdocs/RTGS/DOCs/RTGEB0815.xlsx)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT © [@planetabhi](https://planetabhi.com/)

## Author

Created and maintained by [@planetabhi](https://planetabhi.com/) (^０^)ノ

---

**Note:** Bank data is sourced from official RBI and NPCI listings. Please verify critical information from official bank websites.