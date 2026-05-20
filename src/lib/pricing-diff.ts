import { TOOLS, API_PRICING, ToolPricing } from "./pricing-data";

interface PricingSnapshot {
  tools: ToolPricing[];
  apiPricing: any;
  capturedAt: string;
}

interface PricingChange {
  toolName: string;
  planName?: string;
  field: string;
  oldValue: any;
  newValue: any;
}

export function detectPricingChanges(snapshot: PricingSnapshot): PricingChange[] {
  const changes: PricingChange[] = [];
  const currentTools = TOOLS;
  const snapshotTools = snapshot.tools || [];

  for (const currentTool of currentTools) {
    const snapshotTool = snapshotTools.find((t: ToolPricing) => t.name === currentTool.name);
    
    if (!snapshotTool) {
      // New tool added
      changes.push({
        toolName: currentTool.name,
        field: "tool_added",
        oldValue: null,
        newValue: "New tool available",
      });
      continue;
    }

    // Compare plans
    for (const currentPlan of currentTool.plans) {
      const snapshotPlan = snapshotTool.plans.find(
        (p: any) => p.name === currentPlan.name
      );

      if (!snapshotPlan) {
        changes.push({
          toolName: currentTool.name,
          planName: currentPlan.name,
          field: "plan_added",
          oldValue: null,
          newValue: currentPlan.monthlyPricePerSeat,
        });
        continue;
      }

      if (currentPlan.monthlyPricePerSeat !== snapshotPlan.monthlyPricePerSeat) {
        changes.push({
          toolName: currentTool.name,
          planName: currentPlan.name,
          field: "price",
          oldValue: snapshotPlan.monthlyPricePerSeat,
          newValue: currentPlan.monthlyPricePerSeat,
        });
      }
    }

    // Check for removed plans
    for (const snapshotPlan of snapshotTool.plans) {
      const stillExists = currentTool.plans.find((p: any) => p.name === snapshotPlan.name);
      if (!stillExists) {
        changes.push({
          toolName: currentTool.name,
          planName: snapshotPlan.name,
          field: "plan_removed",
          oldValue: snapshotPlan.monthlyPricePerSeat,
          newValue: null,
        });
      }
    }
  }

  return changes;
}

export function getAffectedAudits(
  audits: any[],
  changes: PricingChange[]
): any[] {
  return audits.filter((audit) => {
    if (!audit.tools || !Array.isArray(audit.tools)) return false;
    
    return audit.tools.some((userTool: any) => {
      return changes.some(
        (change) => change.toolName === userTool.toolName
      );
    });
  });
}