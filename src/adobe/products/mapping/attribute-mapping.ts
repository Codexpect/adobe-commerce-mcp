import {
  AddProductAttributeOptionInput,
  CreateAttributeGroupInput,
  CreateAttributeSetInput,
  CreateProductAttributeInput,
  UpdateAttributeGroupInput,
  UpdateAttributeSetInput,
  UpdateProductAttributeInput,
  UpdateProductAttributeOptionInput,
} from "../schemas";
import { AttributeGroup, AttributeSet, PRODUCT_ENTITY_TYPE_ID, ProductAttribute } from "../types/product";

const attributeTypeMap = {
  text: { backend_type: "varchar", frontend_input: "text" },
  textarea: { backend_type: "text", frontend_input: "textarea" },
  boolean: { backend_type: "int", frontend_input: "boolean" },
  date: { backend_type: "datetime", frontend_input: "date" },
  datetime: { backend_type: "datetime", frontend_input: "datetime" },
  integer: { backend_type: "varchar", frontend_input: "text" },
  decimal: { backend_type: "varchar", frontend_input: "text" },
  weight: { backend_type: "varchar", frontend_input: "text" },
  price: { backend_type: "decimal", frontend_input: "price" },
  singleselect: { backend_type: "int", frontend_input: "select" },
  multiselect: { backend_type: "text", frontend_input: "multiselect" },
};

export function mapCreateProductAttributeInputToApiPayload(input: CreateProductAttributeInput): ProductAttribute {
  const { type, attributeCode, defaultFrontendLabel, scope, options } = input;
  const typeMapping = attributeTypeMap[type as keyof typeof attributeTypeMap];
  if (!typeMapping) throw new Error(`Unknown attribute type: ${type}`);

  return {
    attribute_code: attributeCode,
    entity_type_id: PRODUCT_ENTITY_TYPE_ID,
    default_frontend_label: defaultFrontendLabel,
    scope,
    backend_type: typeMapping.backend_type,
    frontend_input: typeMapping.frontend_input,
    options: options?.map((opt) => ({
      label: opt.label,
      sort_order: opt.sortOrder,
      is_default: opt.isDefault,
      store_labels: opt.storeLabels?.map((storeLabel) => ({
        store_id: storeLabel.storeId,
        label: storeLabel.label,
      })),
    })),
  };
}

export function mapCreateAttributeSetInputToApiPayload(input: CreateAttributeSetInput): AttributeSet {
  return {
    attribute_set_name: input.attributeSetName,
    sort_order: input.sortOrder,
    entity_type_id: PRODUCT_ENTITY_TYPE_ID,
  };
}

export function mapUpdateAttributeSetInputToApiPayload(input: UpdateAttributeSetInput): AttributeSet {
  const { attributeSetId, attributeSetName, sortOrder } = input;

  return {
    attribute_set_id: attributeSetId,
    ...(attributeSetName && { attribute_set_name: attributeSetName }),
    ...(sortOrder !== undefined && { sort_order: sortOrder }),
    entity_type_id: PRODUCT_ENTITY_TYPE_ID,
  };
}

export function mapCreateAttributeGroupInputToApiPayload(input: CreateAttributeGroupInput): AttributeGroup {
  return {
    attribute_set_id: input.attributeSetId,
    attribute_group_name: input.attributeGroupName,
  };
}

export function mapUpdateAttributeGroupInputToApiPayload(input: UpdateAttributeGroupInput): AttributeGroup {
  const { attributeSetId, attributeGroupId, attributeGroupName } = input;
  return {
    attribute_group_id: attributeGroupId,
    attribute_set_id: attributeSetId,
    attribute_group_name: attributeGroupName ?? "",
  };
}

export function mapUpdateProductAttributeInputToApiPayload(input: UpdateProductAttributeInput): ProductAttribute {
  const { defaultFrontendLabel, frontendInput, scope, options, attributeCode } = input;
  const payload: ProductAttribute = {
    attribute_code: attributeCode,
    entity_type_id: PRODUCT_ENTITY_TYPE_ID,
  };

  if (defaultFrontendLabel) {
    payload.default_frontend_label = defaultFrontendLabel;
  }

  if (frontendInput) {
    payload.frontend_input = frontendInput;
  }

  if (scope) {
    payload.scope = scope;
  }

  if (options) {
    payload.options = options.map((opt) => ({
      label: opt.label,
      sort_order: opt.sortOrder,
      is_default: opt.isDefault,
      store_labels: opt.storeLabels?.map((storeLabel) => ({
        store_id: storeLabel.storeId,
        label: storeLabel.label,
      })),
    }));
  }

  return payload;
}

export function mapAddProductAttributeOptionInputToApiPayload(input: AddProductAttributeOptionInput): NonNullable<ProductAttribute["options"]>[0] {
  return {
    label: input.label,
    sort_order: input.sortOrder,
    is_default: input.isDefault,
    store_labels: input.storeLabels?.map((storeLabel) => ({
      store_id: storeLabel.storeId,
      label: storeLabel.label,
    })),
  };
}

export function mapUpdateProductAttributeOptionInputToApiPayload(
  input: UpdateProductAttributeOptionInput
): Partial<NonNullable<ProductAttribute["options"]>[0]> {
  const payload: Partial<NonNullable<ProductAttribute["options"]>[0]> = {};

  if (input.label) {
    payload.label = input.label;
  }

  if (input.sortOrder !== undefined) {
    payload.sort_order = input.sortOrder;
  }

  if (input.isDefault !== undefined) {
    payload.is_default = input.isDefault;
  }

  if (input.storeLabels) {
    payload.store_labels = input.storeLabels.map((storeLabel) => ({
      store_id: storeLabel.storeId,
      label: storeLabel.label,
    }));
  }

  return payload;
}
