
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TaxInputs, StrategySavings, estimateFederalTax, estimateTaxableIncome } from "@/utils/calculators";
import { taxStrategies } from "@/utils/taxStrategies";
import { StrategyCard } from "@/components/StrategyCard";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface TaxSavingsResultsProps {
  taxInputs: TaxInputs;
  onReset: () => void;
}

export const TaxSavingsResults = ({ taxInputs, onReset }: TaxSavingsResultsProps) => {
  const [showAll, setShowAll] = useState(false);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get eligible strategies and calculate potential savings
  const eligibleStrategies = taxStrategies
    .map(strategy => {
      const isEligible = strategy.isEligible(taxInputs);
      const savings = strategy.calculateSavings(taxInputs);
      
      return {
        strategy,
        isEligible,
        potentialSavings: savings
      };
    })
    .filter(item => showAll || item.isEligible)
    .sort((a, b) => b.potentialSavings.max - a.potentialSavings.max);
    
  const estimatedTaxWithoutStrategies = estimateFederalTax(taxInputs);
  const taxableIncome = estimateTaxableIncome(taxInputs);
  
  // Calculate max potential savings (simplified - doesn't account for interdependencies)
  const totalPotentialSavings = eligibleStrategies
    .filter(item => item.isEligible)
    .reduce((sum, item) => sum + item.potentialSavings.max, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Your Tax Savings Strategies</h2>
          <p className="text-gray-600 mt-1">
            Based on your income of {formatCurrency(taxInputs.totalCompensation)}
          </p>
        </div>
        <Button onClick={onReset} variant="outline">
          Start Over
        </Button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4">Tax Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Estimated Taxable Income</div>
            <div className="text-2xl font-bold">{formatCurrency(taxableIncome)}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="text-sm text-gray-500">Estimated Federal Tax</div>
            <div className="text-2xl font-bold">{formatCurrency(estimatedTaxWithoutStrategies)}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-md">
            <div className="text-sm text-green-700">Potential Tax Savings</div>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(Math.min(totalPotentialSavings, estimatedTaxWithoutStrategies * 0.8))}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              By implementing eligible strategies
            </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recommended Strategies</h3>
          <Button 
            variant="outline" 
            onClick={() => setShowAll(!showAll)}
            size="sm"
          >
            {showAll ? "Show Eligible Only" : "Show All Strategies"}
          </Button>
        </div>

        <Alert className="mb-4 bg-blue-50 text-blue-800 border-blue-200">
          <Info className="h-4 w-4" />
          <AlertDescription>
            These recommendations are based on the information you provided. Consult with a tax professional before implementing any strategy.
          </AlertDescription>
        </Alert>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {eligibleStrategies.map(({ strategy, isEligible, potentialSavings }) => (
            <div 
              key={strategy.id}
              className={!isEligible ? "opacity-70" : ""}
            >
              <StrategyCard 
                strategy={strategy}
                potentialSavings={potentialSavings}
              />
              {!isEligible && (
                <div className="mt-2 text-sm text-gray-500 italic">
                  You may not be eligible for this strategy based on your inputs.
                </div>
              )}
            </div>
          ))}
        </div>
        
        {eligibleStrategies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-500">
              No strategies found based on your inputs. Try adjusting your information or contact a tax professional.
            </p>
          </div>
        )}
      </div>
      
      <Separator />
      
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-lg font-semibold mb-2">Important Disclaimer</h3>
        <p className="text-sm">
          This tax strategy advisor provides general information only and does not constitute tax, legal, or accounting advice. 
          The information may not apply to your specific circumstances. Always consult with a qualified tax professional 
          before implementing any tax strategy.
        </p>
      </div>
    </div>
  );
};
