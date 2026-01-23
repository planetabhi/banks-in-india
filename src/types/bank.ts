/**
 * Type definitions for Indian bank data
 */

/**
 * Represents a single bank with its details
 */
export interface Bank {
  /** Full name of the bank */
  name: string;
  /** IFSC code prefix for the bank */
  ifsc: string;
  /** URL to the bank's logo/icon */
  icon: string;
  /** Official website URL of the bank */
  website: string;
}

/**
 * Represents a section/category of banks
 */
export interface BankSection {
  /** Display title for the section (e.g., "Private Sector Banks") */
  title: string;
  /** Category identifier (e.g., "private_sector_banks") */
  category: string;
  /** Array of banks in this section */
  content: Bank[];
}

/**
 * Root data structure containing all bank sections
 */
export interface BanksData {
  /** Array of all bank sections */
  banks: BankSection[];
}
