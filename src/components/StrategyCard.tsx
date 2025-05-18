
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { TaxStrategy } from "@/utils/taxStrategies";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Check } from "lucide-react";

interface StrategyCardProps {
  strategy: TaxStrategy;
  potentialSavings: {
    min: number;
    max: number;
  };
}

export const StrategyCard = ({ strategy, potentialSavings }: StrategyCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl">{strategy.name}</CardTitle>
        <CardDescription className="line-clamp-2">{strategy.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-1">Potential Tax Savings</h4>
          <p className="text-2xl font-bold text-green-600">
            {potentialSavings.min === potentialSavings.max
              ? formatCurrency(potentialSavings.min)
              : `${formatCurrency(potentialSavings.min)} - ${formatCurrency(potentialSavings.max)}`}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-1">Eligibility</h4>
          <ul className="text-sm space-y-1">
            {strategy.eligibilityCriteria.map((criterion, index) => (
              <li key={index} className="flex items-start">
                <Check className="text-green-500 mr-2 mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">Learn More</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{strategy.name}</DialogTitle>
              <DialogDescription>{strategy.description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-1">Potential Savings</h4>
                <p>{strategy.potentialSavings}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Implementation Steps</h4>
                <ol className="list-decimal pl-5 space-y-1">
                  {strategy.implementationSteps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
