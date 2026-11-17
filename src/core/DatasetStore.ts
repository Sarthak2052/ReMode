import fs from "node:fs";
import path from "node:path";

export type DatasetRow = Record<string, string>;

const DATA_DIR = path.join(process.cwd(), "data");
const fileCache = new Map<string, DatasetRow[]>();

function parseCsv(text: string): DatasetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift() ?? [];
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]))
  );
}

function readDataset(filename: string): DatasetRow[] {
  const cached = fileCache.get(filename);
  if (cached) return cached;

  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file not found: ${filename}`);
  }

  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  fileCache.set(filename, rows);
  return rows;
}

export interface DatasetQuery {
  mode?: string;
  sourceCity?: string;
  destinationCity?: string;
  limit?: number;
  offset?: number;
}

export class DatasetStore {
  public getScenarios(): DatasetRow[] {
    return readDataset("travel_disruption_scenarios.csv");
  }

  public getDictionary(): DatasetRow[] {
    return readDataset("dataset_data_dictionary.csv");
  }

  public getResources(query: DatasetQuery = {}): DatasetRow[] {
    const normalizedMode = query.mode?.toLowerCase();
    const normalizedSource = query.sourceCity?.toLowerCase();
    const normalizedDestination = query.destinationCity?.toLowerCase();
    const offset = Math.max(0, query.offset ?? 0);
    const limit = Math.min(250, Math.max(1, query.limit ?? 50));

    const filtered = readDataset("travel_recovery_master_dataset.csv").filter((row) => {
      const matchesMode = !normalizedMode || row.mode.toLowerCase() === normalizedMode;
      const matchesSource =
        !normalizedSource || row.source_city.toLowerCase().includes(normalizedSource);
      const matchesDestination =
        !normalizedDestination ||
        row.destination_city.toLowerCase().includes(normalizedDestination);
      return matchesMode && matchesSource && matchesDestination;
    });

    return filtered.slice(offset, offset + limit);
  }

  public getSummary() {
    const resources = readDataset("travel_recovery_master_dataset.csv");
    const modeCounts = resources.reduce<Record<string, number>>((counts, row) => {
      counts[row.mode] = (counts[row.mode] ?? 0) + 1;
      return counts;
    }, {});

    return {
      resourceRows: resources.length,
      resourceColumns: Object.keys(resources[0] ?? {}).length,
      scenarioCount: this.getScenarios().length,
      dictionaryColumns: this.getDictionary().length,
      modeCounts,
      provenance: {
        verifiedRows: resources.filter((row) => row.data_verified === "True").length,
        estimatedOrUnverifiedRows: resources.filter((row) => row.data_verified !== "True").length,
      },
    };
  }
}

let datasetStore: DatasetStore | undefined;

export function getDatasetStore(): DatasetStore {
  datasetStore ??= new DatasetStore();
  return datasetStore;
}
