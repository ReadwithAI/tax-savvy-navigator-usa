
export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  eligibilityCriteria: string[];
  potentialSavings: string;
  implementationSteps: string[];
  isEligible: (inputs: any) => boolean;
  calculateSavings: (inputs: any) => { min: number; max: number };
}

export const taxStrategies: TaxStrategy[] = [
  {
    id: "401k_contribution",
    name: "Maximize 401(k) Contributions",
    description: "Contributing to a traditional 401(k) reduces your taxable income for the year while helping you save for retirement.",
    eligibilityCriteria: [
      "Employed with access to employer-sponsored 401(k)",
      "Under the annual contribution limit ($22,500 for 2023, plus $7,500 catch-up if age 50+)"
    ],
    potentialSavings: "22-37% of contribution amount (depending on your tax bracket)",
    implementationSteps: [
      "Contact your HR department or payroll provider",
      "Adjust your contribution percentage",
      "Consider spreading contributions throughout the year to maximize any employer match"
    ],
    isEligible: (inputs) => inputs.salary > 0,
    calculateSavings: (inputs) => {
      const taxBracket = estimateTaxBracket(inputs);
      const currentContrib = inputs.retirement401k || 0;
      const maxContrib = inputs.age >= 50 ? 30000 : 22500;
      const potentialAdditionalContrib = Math.max(0, maxContrib - currentContrib);
      const minSavings = potentialAdditionalContrib * 0.22; // 22% bracket minimum
      const maxSavings = potentialAdditionalContrib * (taxBracket / 100);
      return { min: Math.round(minSavings), max: Math.round(maxSavings) };
    }
  },
  {
    id: "hsa_contributions",
    name: "Health Savings Account (HSA)",
    description: "HSAs offer triple tax benefits: tax-deductible contributions, tax-free growth, and tax-free withdrawals for qualified medical expenses.",
    eligibilityCriteria: [
      "Enrolled in a high-deductible health plan (HDHP)",
      "Not enrolled in Medicare",
      "Not claimed as a dependent on someone else's tax return"
    ],
    potentialSavings: "Annual contribution limit of $3,850 for individuals or $7,750 for families (2023), plus $1,000 catch-up contribution if 55 or older",
    implementationSteps: [
      "Verify your health plan qualifies as a HDHP",
      "Open an HSA through your employer or separately if self-employed",
      "Set up regular contributions"
    ],
    isEligible: (inputs) => true, // We don't have enough info to determine HDHP status, so we show this to everyone
    calculateSavings: (inputs) => {
      const taxBracket = estimateTaxBracket(inputs);
      const contributionLimit = inputs.filingStatus === "single" ? 3850 : 7750;
      const potentialSavings = contributionLimit * (taxBracket / 100);
      return { min: Math.round(potentialSavings * 0.8), max: Math.round(potentialSavings) };
    }
  },
  {
    id: "section_179",
    name: "Section 179 Deduction",
    description: "Allows businesses to deduct the full purchase price of qualifying equipment and software purchased or financed during the tax year.",
    eligibilityCriteria: [
      "Self-employed or business owner",
      "Purchased qualifying equipment or software for business use"
    ],
    potentialSavings: "Up to 100% of the cost of qualifying equipment, subject to annual limits",
    implementationSteps: [
      "Purchase qualifying business equipment or software",
      "Keep detailed records of purchases and business use",
      "Complete Form 4562 with your tax return"
    ],
    isEligible: (inputs) => inputs.otherIncome > 20000, // Simplified assumption for business income
    calculateSavings: (inputs) => {
      const taxBracket = estimateTaxBracket(inputs);
      const estimatedBusinessAssets = inputs.otherIncome * 0.3; // Rough estimate
      const potentialDeduction = Math.min(estimatedBusinessAssets, 1080000); // 2023 limit
      const savings = potentialDeduction * (taxBracket / 100);
      return { min: Math.round(savings * 0.5), max: Math.round(savings) };
    }
  },
  {
    id: "charitable_contributions",
    name: "Charitable Giving Strategies",
    description: "Donations to qualified charities can be deducted if you itemize deductions, potentially reducing your taxable income.",
    eligibilityCriteria: [
      "Must itemize deductions (vs. taking the standard deduction)",
      "Donations must be to qualifying tax-exempt organizations"
    ],
    potentialSavings: "Depends on donation amount and tax bracket",
    implementationSteps: [
      "Research qualified charitable organizations",
      "Consider bunching donations in alternate years to exceed standard deduction threshold",
      "Keep detailed records and receipts of all donations",
      "For larger donations, consider donor-advised funds or appreciated securities"
    ],
    isEligible: (inputs) => inputs.itemizedDeductions > 0 || inputs.totalCompensation > 150000,
    calculateSavings: (inputs) => {
      const taxBracket = estimateTaxBracket(inputs);
      const standardDeduction = getStandardDeduction(inputs);
      const currentItemized = inputs.itemizedDeductions || 0;
      
      // If already itemizing, estimate additional charitable giving
      const potentialDonation = inputs.totalCompensation * 0.05; // Suggest 5% of income
      const taxSavings = potentialDonation * (taxBracket / 100);
      
      // Only count savings that exceed standard deduction
      const effectiveSavings = currentItemized > standardDeduction 
        ? taxSavings 
        : (currentItemized + potentialDonation > standardDeduction) 
          ? (currentItemized + potentialDonation - standardDeduction) * (taxBracket / 100)
          : 0;
          
      return { min: Math.round(effectiveSavings * 0.5), max: Math.round(taxSavings) };
    }
  },
  {
    id: "tax_loss_harvesting",
    name: "Tax-Loss Harvesting",
    description: "Selling investments that have experienced losses to offset capital gains and potentially reduce taxable income.",
    eligibilityCriteria: [
      "Have taxable investment accounts (non-retirement)",
      "Have investments with unrealized losses or capital gains"
    ],
    potentialSavings: "Up to $3,000 in ordinary income per year after offsetting capital gains",
    implementationSteps: [
      "Review your investment portfolio for positions with unrealized losses",
      "Sell losing investments before year-end to realize losses",
      "Use losses to offset capital gains and up to $3,000 of ordinary income",
      "Be aware of wash sale rules when reinvesting"
    ],
    isEligible: (inputs) => inputs.capitalGains > 0 || inputs.dividends > 5000,
    calculateSavings: (inputs) => {
      const haveCaptialGains = inputs.capitalGains > 0;
      const potentialOffset = haveCaptialGains ? inputs.capitalGains : 3000;
      const capitalGainsTaxRate = inputs.totalCompensation > 459750 ? 0.20 : 0.15;
      const ordinaryIncomeTaxRate = estimateTaxBracket(inputs) / 100;
      
      const taxRate = haveCaptialGains ? capitalGainsTaxRate : ordinaryIncomeTaxRate;
      const savings = potentialOffset * taxRate;
      
      return { 
        min: Math.round(Math.min(savings, 3000 * ordinaryIncomeTaxRate)), 
        max: Math.round(savings)
      };
    }
  }
];

// Helper functions
function estimateTaxBracket(inputs: any): number {
  const income = inputs.totalCompensation;
  
  if (inputs.filingStatus === "single") {
    if (income > 578125) return 37;
    if (income > 231250) return 35;
    if (income > 182100) return 32;
    if (income > 95375) return 24;
    if (income > 44725) return 22;
    if (income > 11000) return 12;
    return 10;
  } else if (inputs.filingStatus === "married_joint") {
    if (income > 693750) return 37;
    if (income > 462500) return 35;
    if (income > 364200) return 32;
    if (income > 190750) return 24;
    if (income > 89450) return 22;
    if (income > 22000) return 12;
    return 10;
  }
  
  // Default to middle bracket if status isn't accounted for
  return 24;
}

function getStandardDeduction(inputs: any): number {
  const baseDeduction = inputs.filingStatus === "married_joint" ? 27700 : 13850;
  const ageAdjustment = inputs.age >= 65 ? (inputs.filingStatus === "married_joint" ? 1500 : 1850) : 0;
  return baseDeduction + ageAdjustment;
}
