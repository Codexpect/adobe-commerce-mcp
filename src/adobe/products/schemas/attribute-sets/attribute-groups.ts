import {
  attributeCodeSchema,
  attributeGroupIdSchema,
  attributeSetIdSchema,
  nonEmptyLabelSchema,
  sortOrderSchema,
} from "../common/validation-schemas";

/**
 * Attribute Group Schemas
 *
 * Attribute groups organize attributes within an attribute set into logical sections.
 * For example, within a "Clothing" attribute set, you might have groups like:
 * - "General" (Name, Description, Price)
 * - "Physical Properties" (Size, Color, Material)
 * - "Care Instructions" (Washing, Drying)
 */

/**
 * Schema for creating new attribute groups within an attribute set
 *
 * Required fields:
 * - attributeSetId: The attribute set to add the group to
 * - attributeGroupName: Display name for the group
 *
 * Note: Groups help organize the product edit form in the admin interface
 */
export const createAttributeGroupInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set to which the group will be added."),
  attributeGroupName: nonEmptyLabelSchema.describe("Name of the new attribute group."),
};

/**
 * Schema for updating existing attribute groups
 *
 * Required fields:
 * - attributeSetId: The attribute set containing the group
 * - attributeGroupId: The specific group to update
 *
 * Optional fields:
 * - attributeGroupName: New name for the group
 */
export const updateAttributeGroupInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set containing the group."),
  attributeGroupId: attributeGroupIdSchema.describe("ID of the attribute group to update."),
  attributeGroupName: nonEmptyLabelSchema.optional().describe("New name for the attribute group (optional)."),
};

/**
 * Schema for deleting an attribute group
 *
 * Required fields:
 * - attributeGroupId: The group to delete
 *
 * Note:
 * - Cannot delete groups that contain attributes
 * - Move all attributes to other groups before deletion
 * - Cannot delete system groups (like "General")
 */
export const deleteAttributeGroupInputSchema = {
  attributeGroupId: attributeGroupIdSchema.describe("ID of the attribute group to delete."),
};

/**
 * Schema for assigning an attribute to a specific group within an attribute set
 *
 * Required fields:
 * - attributeSetId: The attribute set containing the group
 * - attributeGroupId: The group to assign the attribute to
 * - attributeCode: The attribute to assign
 * - sortOrder: Position within the group (affects admin form layout)
 *
 * Note: This determines where the attribute appears in the product edit form
 */
export const assignAttributeToSetGroupInputSchema = {
  attributeSetId: attributeSetIdSchema.describe("ID of the attribute set."),
  attributeGroupId: attributeGroupIdSchema.describe("ID of the attribute group within the set."),
  attributeCode: attributeCodeSchema.describe("Code of the attribute to assign."),
  sortOrder: sortOrderSchema.describe("Sort order of the attribute in the group."),
};
