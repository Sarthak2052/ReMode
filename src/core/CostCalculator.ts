import type { CancellationRule, ItineraryItem } from "../types/index.ts";

export interface CostCalculationResult {
  originalCost: number;
  refundPercent: number;
  refundAmount: number;
  newCost: number;
  netAdditionalCost: number;
  policyExplanation: string;
}

export class CostCalculator {
  public static calculateRefund(
    item: ItineraryItem,
    hoursBeforeEvent: number = 2
  ): { percent: number; amount: number; explanation: string } {
    if (!item.cancellationPolicy || item.cancellationPolicy.length === 0) {
      const defaultPercent = item.isFlexible ? 70 : 0;
      return {
        percent: defaultPercent,
        amount: Math.round((item.cost * defaultPercent) / 100),
        explanation: item.isFlexible
          ? "Standard flexible booking policy: 70% refund applied."
          : "Non-refundable booking tier.",
      };
    }

    const rules = [...item.cancellationPolicy].sort(
      (a, b) => b.thresholdHours - a.thresholdHours
    );

    for (const rule of rules) {
      if (hoursBeforeEvent >= rule.thresholdHours) {
        const amount = Math.round((item.cost * rule.refundPercent) / 100);
        return {
          percent: rule.refundPercent,
          amount,
          explanation: `Notice period (${hoursBeforeEvent.toFixed(
            1
          )}h) satisfies ≥${rule.thresholdHours}h threshold -> ${
            rule.refundPercent
          }% refund.`,
        };
      }
    }

    const minRule = rules[rules.length - 1];
    const amount = Math.round((item.cost * (minRule?.refundPercent || 0)) / 100);
    return {
      percent: minRule?.refundPercent || 0,
      amount,
      explanation: `Late disruption (<${minRule?.thresholdHours || 0}h) -> ${
        minRule?.refundPercent || 0
      }% refund under policy terms.`,
    };
  }

  public static calculateReplacementCost(
    originalItem: ItineraryItem,
    newCost: number,
    hoursBeforeEvent: number = 2
  ): CostCalculationResult {
    const refund = this.calculateRefund(originalItem, hoursBeforeEvent);
    const netAdditionalCost = newCost - refund.amount;

    return {
      originalCost: originalItem.cost,
      refundPercent: refund.percent,
      refundAmount: refund.amount,
      newCost,
      netAdditionalCost,
      policyExplanation: refund.explanation,
    };
  }
}
