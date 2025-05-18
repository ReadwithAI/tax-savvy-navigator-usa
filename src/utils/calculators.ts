
export interface TaxInputs {
  salary: number;
  rsu: number;
  dividends: number;
  capitalGains: number;
  otherIncome: number;
  totalCompensation: number;
  filingStatus: string;
  hasDependents: boolean;
  age: number;
  homeowner: boolean;
  stateOfResidence: string;
  retirement401k: number;
  itemizedDeductions: number;
}

export interface StrategySavings {
  strategyId: string;
  potentialSavingsMin: number;
  potentialSavingsMax: number;
}

export const calculateTotalIncome = (inputs: TaxInputs): number => {
  return (
    inputs.salary +
    inputs.rsu +
    inputs.dividends +
    inputs.capitalGains +
    inputs.otherIncome
  );
};

export const estimateTaxableIncome = (inputs: TaxInputs): number => {
  const totalIncome = calculateTotalIncome(inputs);
  
  // Standard deduction based on filing status (2023 values)
  let standardDeduction = 0;
  switch (inputs.filingStatus) {
    case "single":
      standardDeduction = 13850;
      break;
    case "married_joint":
      standardDeduction = 27700;
      break;
    case "married_separate":
      standardDeduction = 13850;
      break;
    case "head_of_household":
      standardDeduction = 20800;
      break;
    default:
      standardDeduction = 13850;
  }
  
  // Adjust for age
  if (inputs.age >= 65) {
    standardDeduction += inputs.filingStatus === "married_joint" ? 1500 : 1850;
  }
  
  // Basic deductions (simplified)
  let deductions = Math.max(standardDeduction, inputs.itemizedDeductions);
  
  // 401(k) contributions
  deductions += inputs.retirement401k || 0;
  
  return Math.max(0, totalIncome - deductions);
};

export const estimateFederalTax = (inputs: TaxInputs): number => {
  let taxableIncome = estimateTaxableIncome(inputs);
  
  // 2023 tax brackets (simplified)
  let tax = 0;
  
  if (inputs.filingStatus === "single") {
    if (taxableIncome > 578125) {
      tax += (taxableIncome - 578125) * 0.37;
      taxableIncome = 578125;
    }
    if (taxableIncome > 231250) {
      tax += (taxableIncome - 231250) * 0.35;
      taxableIncome = 231250;
    }
    if (taxableIncome > 182100) {
      tax += (taxableIncome - 182100) * 0.32;
      taxableIncome = 182100;
    }
    if (taxableIncome > 95375) {
      tax += (taxableIncome - 95375) * 0.24;
      taxableIncome = 95375;
    }
    if (taxableIncome > 44725) {
      tax += (taxableIncome - 44725) * 0.22;
      taxableIncome = 44725;
    }
    if (taxableIncome > 11000) {
      tax += (taxableIncome - 11000) * 0.12;
      taxableIncome = 11000;
    }
    tax += taxableIncome * 0.10;
  } else if (inputs.filingStatus === "married_joint") {
    if (taxableIncome > 693750) {
      tax += (taxableIncome - 693750) * 0.37;
      taxableIncome = 693750;
    }
    if (taxableIncome > 462500) {
      tax += (taxableIncome - 462500) * 0.35;
      taxableIncome = 462500;
    }
    if (taxableIncome > 364200) {
      tax += (taxableIncome - 364200) * 0.32;
      taxableIncome = 364200;
    }
    if (taxableIncome > 190750) {
      tax += (taxableIncome - 190750) * 0.24;
      taxableIncome = 190750;
    }
    if (taxableIncome > 89450) {
      tax += (taxableIncome - 89450) * 0.22;
      taxableIncome = 89450;
    }
    if (taxableIncome > 22000) {
      tax += (taxableIncome - 22000) * 0.12;
      taxableIncome = 22000;
    }
    tax += taxableIncome * 0.10;
  }
  
  return Math.round(tax);
};
