import type { AddConfigurableProductOptionInput, UpdateConfigurableProductOptionInput } from "../schemas";
import { ConfigurableProductOption } from "../types/product";

export function mapAddConfigurableProductOptionInputToApiPayload(input: AddConfigurableProductOptionInput): ConfigurableProductOption {
  const { attributeId, label, optionIds, position, isUseDefault } = input;

  return {
    attribute_id: attributeId,
    label: label ?? "",
    position: position ?? 0,
    is_use_default: isUseDefault ?? false,
    values: optionIds.map((optionId) => ({
      value_index: optionId,
    })),
  };
}

export function mapUpdateConfigurableProductOptionInputToApiPayload(input: UpdateConfigurableProductOptionInput): ConfigurableProductOption {
  const { attributeId, label, optionIds, position, isUseDefault, id } = input;

  return {
    id,
    attribute_id: attributeId,
    label: label ?? "",
    position: position ?? 0,
    is_use_default: isUseDefault ?? false,
    values: optionIds.map((optionId) => ({
      value_index: optionId,
    })),
  };
}
