import {
  CreateAttributeGroupInput,
  CreateAttributeSetInput,
  CreateProductAttributeInput,
  UpdateAttributeGroupInput,
  UpdateAttributeSetInput,
} from "../schema";
import { AttributeGroup, AttributeSet, PRODUCT_ENTITY_TYPE_ID, ProductAttribute } from "../types/product";

const attributeTypeMap = {
  text: { backend_type: "varchar", frontend_input: "text" },
  textarea: { backend_type: "text", frontend_input: "textarea" },
  boolean: { backend_type: "int", frontend_input: "boolean" },
  date: { backend_type: "datetime", frontend_input: "date" },
  integer: { backend_type: "varchar", frontend_input: "text" },
  decimal: { backend_type: "varchar", frontend_input: "text" },
  weight: { backend_type: "varchar", frontend_input: "text" },
  price: { backend_type: "decimal", frontend_input: "price" },
  singleselect: { backend_type: "int", frontend_input: "select" },
  multiselect: { backend_type: "text", frontend_input: "multiselect" },
};

export function mapCreateProductAttributeInputToApiPayload(input: CreateProductAttributeInput): ProductAttribute {
  const { type, attributeCode, defaultFrontendLabel, scope, options } = input;
  const typeMapping = attributeTypeMap[type];
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
