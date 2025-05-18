
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TaxInputs, calculateTotalIncome } from "@/utils/calculators";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TaxFormProps {
  onSubmit: (inputs: TaxInputs) => void;
}

export const TaxForm = ({ onSubmit }: TaxFormProps) => {
  const [formData, setFormData] = useState<TaxInputs>({
    salary: 0,
    rsu: 0,
    dividends: 0,
    capitalGains: 0,
    otherIncome: 0,
    totalCompensation: 0,
    filingStatus: "single",
    hasDependents: false,
    age: 30,
    homeowner: false,
    stateOfResidence: "CA",
    retirement401k: 0,
    itemizedDeductions: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    // Clear previous messages when user makes changes
    setError(null);
    setInfoMessage(null);
  };

  // Auto-calculate total compensation based on sources
  const handleCalculateTotal = () => {
    const calculatedTotal = calculateTotalIncome(formData);
    setFormData({ ...formData, totalCompensation: calculatedTotal });
    setInfoMessage("Total compensation auto-calculated from your income sources.");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.totalCompensation <= 0) {
      setError("Please enter a valid total compensation amount");
      return;
    }

    // Check if income sources add up reasonably to total compensation
    const totalIncomeEntered = calculateTotalIncome(formData);
    
    // Allow more flexibility (within 20% difference instead of 10%)
    if (Math.abs(totalIncomeEntered - formData.totalCompensation) > formData.totalCompensation * 0.2) {
      setError("Your income sources don't approximately match your total compensation. You can use the 'Calculate Total' button to set the correct value.");
      return;
    }

    setError(null);
    setInfoMessage(null);
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Income Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">Annual Salary ($)</Label>
            <Input
              id="salary"
              name="salary"
              type="number"
              min="0"
              step="1000"
              value={formData.salary || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="rsu">RSU Income ($)</Label>
            <Input
              id="rsu"
              name="rsu"
              type="number"
              min="0"
              value={formData.rsu || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="dividends">Dividend Income ($)</Label>
            <Input
              id="dividends"
              name="dividends"
              type="number"
              min="0"
              value={formData.dividends || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="capitalGains">Capital Gains ($)</Label>
            <Input
              id="capitalGains"
              name="capitalGains"
              type="number"
              min="0"
              value={formData.capitalGains || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="otherIncome">Other Income ($)</Label>
            <Input
              id="otherIncome"
              name="otherIncome"
              type="number"
              min="0"
              value={formData.otherIncome || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="totalCompensation">Total Compensation ($)</Label>
            <div className="flex gap-2">
              <Input
                id="totalCompensation"
                name="totalCompensation"
                type="number"
                min="0"
                required
                value={formData.totalCompensation || ''}
                onChange={handleInputChange}
                className="w-full"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleCalculateTotal}
                className="whitespace-nowrap"
              >
                Calculate Total
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Total should approximately match the sum of your income sources above
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="filingStatus">Filing Status</Label>
            <select 
              id="filingStatus" 
              name="filingStatus"
              value={formData.filingStatus}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="single">Single</option>
              <option value="married_joint">Married Filing Jointly</option>
              <option value="married_separate">Married Filing Separately</option>
              <option value="head_of_household">Head of Household</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stateOfResidence">State of Residence</Label>
            <select 
              id="stateOfResidence" 
              name="stateOfResidence"
              value={formData.stateOfResidence}
              onChange={handleInputChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
            >
              <option value="AL">Alabama</option>
              <option value="AK">Alaska</option>
              <option value="AZ">Arizona</option>
              <option value="AR">Arkansas</option>
              <option value="CA">California</option>
              <option value="CO">Colorado</option>
              <option value="CT">Connecticut</option>
              <option value="DE">Delaware</option>
              <option value="FL">Florida</option>
              <option value="GA">Georgia</option>
              <option value="HI">Hawaii</option>
              <option value="ID">Idaho</option>
              <option value="IL">Illinois</option>
              <option value="IN">Indiana</option>
              <option value="IA">Iowa</option>
              <option value="KS">Kansas</option>
              <option value="KY">Kentucky</option>
              <option value="LA">Louisiana</option>
              <option value="ME">Maine</option>
              <option value="MD">Maryland</option>
              <option value="MA">Massachusetts</option>
              <option value="MI">Michigan</option>
              <option value="MN">Minnesota</option>
              <option value="MS">Mississippi</option>
              <option value="MO">Missouri</option>
              <option value="MT">Montana</option>
              <option value="NE">Nebraska</option>
              <option value="NV">Nevada</option>
              <option value="NH">New Hampshire</option>
              <option value="NJ">New Jersey</option>
              <option value="NM">New Mexico</option>
              <option value="NY">New York</option>
              <option value="NC">North Carolina</option>
              <option value="ND">North Dakota</option>
              <option value="OH">Ohio</option>
              <option value="OK">Oklahoma</option>
              <option value="OR">Oregon</option>
              <option value="PA">Pennsylvania</option>
              <option value="RI">Rhode Island</option>
              <option value="SC">South Carolina</option>
              <option value="SD">South Dakota</option>
              <option value="TN">Tennessee</option>
              <option value="TX">Texas</option>
              <option value="UT">Utah</option>
              <option value="VT">Vermont</option>
              <option value="VA">Virginia</option>
              <option value="WA">Washington</option>
              <option value="WV">West Virginia</option>
              <option value="WI">Wisconsin</option>
              <option value="WY">Wyoming</option>
              <option value="DC">District of Columbia</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="18"
              max="120"
              value={formData.age || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="retirement401k">401(k) Contributions ($)</Label>
            <Input
              id="retirement401k"
              name="retirement401k"
              type="number"
              min="0"
              max="22500"
              value={formData.retirement401k || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="itemizedDeductions">Itemized Deductions ($)</Label>
            <Input
              id="itemizedDeductions"
              name="itemizedDeductions"
              type="number"
              min="0"
              value={formData.itemizedDeductions || ''}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="hasDependents"
              name="hasDependents"
              checked={formData.hasDependents}
              onChange={(e) => setFormData({ ...formData, hasDependents: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="hasDependents">I have dependents</Label>
          </div>
          
          <div className="flex items-center space-x-2 pt-6">
            <input
              type="checkbox"
              id="homeowner"
              name="homeowner"
              checked={formData.homeowner}
              onChange={(e) => setFormData({ ...formData, homeowner: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="homeowner">I own a home</Label>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {infoMessage && (
        <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>{infoMessage}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full md:w-auto">
        Generate Tax Strategies
      </Button>
    </form>
  );
};
