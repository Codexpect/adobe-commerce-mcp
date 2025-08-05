import { CreateSourceItemInput } from "../schemas";
import type { SourceItem } from "../types/source-item";

/**
 * Maps create source item input to API payload
 */
export function mapCreateSourceItemInputToApiPayload(input: CreateSourceItemInput): SourceItem {
  const { sku, source_code, quantity, status } = input;

  const sourceItem: SourceItem = {
    sku,
    source_code,
    quantity,
  };

  // Handle optional fields
  if (status !== undefined) {
    sourceItem.status = status;
  }

  return sourceItem;
}
