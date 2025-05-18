
import { useState } from "react";
import { TaxForm } from "@/components/TaxForm";
import { TaxSavingsResults } from "@/components/TaxSavingsResults";
import { TaxInputs } from "@/utils/calculators";

const Index = () => {
  const [taxInputs, setTaxInputs] = useState<TaxInputs | null>(null);

  const handleSubmit = (inputs: TaxInputs) => {
    setTaxInputs(inputs);
  };

  const handleReset = () => {
    setTaxInputs(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">U.S. Tax Strategy Advisor</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find personalized tax-saving strategies based on your financial situation.
            Learn how to optimize your tax position and potentially save thousands.
          </p>
        </header>

        <div className="max-w-4xl mx-auto">
          {!taxInputs ? (
            <div className="bg-white p-6 md:p-8 rounded-lg shadow-md">
              <TaxForm onSubmit={handleSubmit} />
            </div>
          ) : (
            <TaxSavingsResults 
              taxInputs={taxInputs} 
              onReset={handleReset}
            />
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© 2025 Tax Strategy Advisor. For educational purposes only.</p>
          <p className="mt-2">This application does not provide tax, legal, or accounting advice.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
