import { CreateProductAttributeInput } from "../schema.js";
import { ProductAttribute } from "../types/product.js";

const attributeTypeMap = {
  text: { backend_type: "varchar", frontend_input: "text" },
  textarea: { backend_type: "text", frontend_input: "textarea" },
  boolean: { backend_type: "int", frontend_input: "boolean" },
  date: { backend_type: "datetime", frontend_input: "date" },
  integer: { backend_type: "int", frontend_input: "text" },
  decimal: { backend_type: "decimal", frontend_input: "text" },
  singleselect: { backend_type: "int", frontend_input: "select" },
  multiselect: { backend_type: "text", frontend_input: "multiselect" },
};

export function mapCreateProductAttributeInputToApiPayload(input: CreateProductAttributeInput): ProductAttribute {
  const { type, ...rest } = input;
  const typeMapping = attributeTypeMap[type];
  if (!typeMapping) throw new Error(`Unknown attribute type: ${type}`);

  return {
    ...rest,
    ...typeMapping,
    entity_type_id: "4",
  };
}
