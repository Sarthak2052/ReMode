import type { ItineraryItem, Priority } from "../types/index.ts";

export interface GraphNode {
  item: ItineraryItem;
  dependents: string[];
  prerequisites: string[];
}

export class TripGraph {
  private nodes: Map<string, GraphNode> = new Map();

  constructor(items: ItineraryItem[]) {
    this.buildGraph(items);
  }

  private buildGraph(items: ItineraryItem[]): void {
    for (const item of items) {
      this.nodes.set(item.id, {
        item,
        dependents: [],
        prerequisites: [...item.dependencies],
      });
    }

    for (const [id, node] of Array.from(this.nodes.entries())) {
      for (const prereqId of node.prerequisites) {
        const prereqNode = this.nodes.get(prereqId);
        if (prereqNode && !prereqNode.dependents.includes(id)) {
          prereqNode.dependents.push(id);
        }
      }
    }

    const sorted = [...items].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      const nextNode = this.nodes.get(next.id);
      if (nextNode && nextNode.prerequisites.length === 0) {
        nextNode.prerequisites.push(current.id);
        const currNode = this.nodes.get(current.id);
        if (currNode && !currNode.dependents.includes(next.id)) {
          currNode.dependents.push(next.id);
        }
      }
    }
  }

  public getItem(id: string): ItineraryItem | undefined {
    return this.nodes.get(id)?.item;
  }

  public getAllItems(): ItineraryItem[] {
    return Array.from(this.nodes.values()).map((n) => n.item);
  }

  public isCritical(item: ItineraryItem): boolean {
    return item.priority === "CRITICAL";
  }

  public getDirectImpact(disruptedItemIds: string[]): string[] {
    const direct = new Set<string>();
    for (const id of disruptedItemIds) {
      if (this.nodes.has(id)) {
        direct.add(id);
      }
    }
    return Array.from(direct);
  }

  public getDownstreamImpact(disruptedItemIds: string[]): string[] {
    const visited = new Set<string>();
    const queue: string[] = [];

    for (const id of disruptedItemIds) {
      const node = this.nodes.get(id);
      if (node) {
        for (const depId of node.dependents) {
          if (!disruptedItemIds.includes(depId) && !visited.has(depId)) {
            visited.add(depId);
            queue.push(depId);
          }
        }
      }
    }

    while (queue.length > 0) {
      const currId = queue.shift()!;
      const currNode = this.nodes.get(currId);
      if (currNode) {
        for (const nextId of currNode.dependents) {
          if (!visited.has(nextId) && !disruptedItemIds.includes(nextId)) {
            visited.add(nextId);
            queue.push(nextId);
          }
        }
      }
    }

    return Array.from(visited);
  }

  public getCriticalEvents(): ItineraryItem[] {
    return Array.from(this.nodes.values())
      .map((n) => n.item)
      .filter((it) => it.priority === "CRITICAL");
  }

  public static scoreBufferRisk(bufferMinutes: number): "HIGH" | "MEDIUM" | "LOW" {
    if (bufferMinutes < 15) return "HIGH";
    if (bufferMinutes <= 45) return "MEDIUM";
    return "LOW";
  }

  public checkLuggageConstraint(
    hasLuggage: boolean,
    skippingHotelFirst: boolean
  ): { hasIssue: boolean; advice: string } {
    if (hasLuggage && skippingHotelFirst) {
      return {
        hasIssue: true,
        advice:
          "Luggage constraint detected: Going straight from airport to business event. Recommended: Use Airport Express Luggage Drop or Keynote Venue Cloakroom rather than carrying large bags to the conference hall.",
      };
    }
    return { hasIssue: false, advice: "No luggage conflict." };
  }
}
