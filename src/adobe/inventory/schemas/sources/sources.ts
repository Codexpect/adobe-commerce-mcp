import { z } from "zod";
import { sourceCodeSchema } from "../common/validation-schemas";

/**
 * Schema for creating new inventory sources
 *
 * Required fields:
 * - source_code: Unique identifier for the source
 * - name: Human-readable name for the source
 * - enabled: Whether the source is active
 * - country_id: ISO country code for the source location
 *
 * Optional fields:
 * - email: Contact email for the source
 * - contact_name: Name of the contact person
 * - description: Detailed description of the source
 * - latitude/longitude: Geographic coordinates
 * - address fields: Full address information
 */
export const createSourceInputSchema = {
  source_code: sourceCodeSchema.describe("Unique identifier for the source (e.g., 'warehouse_us', 'store_nyc')."),
  name: z.string().min(1, "Source name is required").describe("Human-readable name for the source (e.g., 'US Warehouse', 'NYC Store')."),
  enabled: z.boolean().describe("Whether the source is active and can be used for inventory."),
  email: z.string().email("Invalid email format").optional().describe("Contact email for the source."),
  contact_name: z.string().optional().describe("Name of the contact person for this source."),
  description: z.string().optional().describe("Detailed description of the source and its purpose."),
  latitude: z.number().min(-90).max(90).optional().describe("Latitude coordinate for the source location (-90 to 90)."),
  longitude: z.number().min(-180).max(180).optional().describe("Longitude coordinate for the source location (-180 to 180)."),
  country_id: z.string().length(2, "Country ID must be a 2-letter ISO code").describe("ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA')."),
  region_id: z.number().int().min(0).optional().describe("Region ID if source has registered region."),
  region: z.string().optional().describe("Region name if source has custom region."),
  city: z.string().optional().describe("City name for the source location."),
  street: z.string().optional().describe("Street address for the source location."),
  postcode: z.string().optional().describe("Postal/ZIP code for the source location."),
  phone: z.string().optional().describe("Contact phone number for the source."),
  fax: z.string().optional().describe("Fax number for the source."),
  use_default_carrier_config: z.boolean().optional().describe("Whether to use default carrier configuration."),
  carrier_links: z
    .array(
      z.object({
        carrier_code: z.string().describe("Carrier code (e.g., 'ups', 'fedex')."),
        position: z.number().int().min(0).describe("Position/priority of the carrier."),
      })
    )
    .optional()
    .describe("Shipping carrier configurations for this source."),
};

/**
 * Schema for updating existing sources
 *
 * Required fields:
 * - source_code: Unique identifier of the source to update
 *
 * Optional fields:
 * - All other fields from create schema can be updated
 */
export const updateSourceInputSchema = {
  source_code: sourceCodeSchema.describe("Unique identifier of the source to update."),
  name: z.string().min(1, "Source name cannot be empty").optional().describe("Updated human-readable name for the source."),
  enabled: z.boolean().optional().describe("Updated status - whether the source is active."),
  email: z.string().email("Invalid email format").optional().describe("Updated contact email for the source."),
  contact_name: z.string().optional().describe("Updated contact person name."),
  description: z.string().optional().describe("Updated description of the source."),
  latitude: z.number().min(-90).max(90).optional().describe("Updated latitude coordinate."),
  longitude: z.number().min(-180).max(180).optional().describe("Updated longitude coordinate."),
  country_id: z.string().length(2, "Country ID must be a 2-letter ISO code").optional().describe("Updated ISO country code."),
  region_id: z.number().int().min(0).optional().describe("Updated region ID."),
  region: z.string().optional().describe("Updated region name."),
  city: z.string().optional().describe("Updated city name."),
  street: z.string().optional().describe("Updated street address."),
  postcode: z.string().optional().describe("Updated postal code."),
  phone: z.string().optional().describe("Updated phone number."),
  fax: z.string().optional().describe("Updated fax number."),
  use_default_carrier_config: z.boolean().optional().describe("Updated carrier configuration setting."),
  carrier_links: z
    .array(
      z.object({
        carrier_code: z.string().describe("Carrier code."),
        position: z.number().int().min(0).describe("Carrier position/priority."),
      })
    )
    .optional()
    .describe("Updated shipping carrier configurations."),
};

/**
 * Schema for getting source by code
 *
 * Required fields:
 * - source_code: Unique identifier of the source to retrieve
 */
export const getSourceByCodeInputSchema = {
  source_code: sourceCodeSchema.describe("Unique identifier of the source to retrieve."),
};
