/**
 * Etsy API v3 Client
 */

const ETSY_API_BASE = "https://api.etsy.com/v3/application";

export interface EtsyListing {
  listing_id: number;
  user_id: number;
  shop_id: number;
  title: string;
  description: string;
  state: string;
  creation_timestamp: number;
  created_timestamp: number;
  ending_timestamp: number;
  original_creation_timestamp: number;
  last_modified_timestamp: number;
  updated_timestamp: number;
  state_timestamp: number;
  quantity: number;
  shop_section_id: number | null;
  featured_rank: number;
  url: string;
  num_favorers: number;
  non_taxable: boolean;
  is_taxable: boolean;
  is_customizable: boolean;
  is_personalizable: boolean;
  personalization_is_required: boolean;
  personalization_char_count_max: number | null;
  personalization_instructions: string | null;
  listing_type: string;
  tags: string[];
  materials: string[];
  shipping_profile_id: number | null;
  return_policy_id: number | null;
  processing_min: number | null;
  processing_max: number | null;
  who_made: string;
  when_made: string;
  is_supply: boolean;
  item_weight: number | null;
  item_weight_unit: string | null;
  item_length: number | null;
  item_width: number | null;
  item_height: number | null;
  item_dimensions_unit: string | null;
  is_private: boolean;
  style: string[];
  file_data: string;
  has_variations: boolean;
  should_auto_renew: boolean;
  language: string;
  price: {
    amount: number;
    divisor: number;
    currency_code: string;
  };
  taxonomy_id: number;
}

export interface EtsyShop {
  shop_id: number;
  user_id: number;
  shop_name: string;
  create_date: number;
  created_timestamp: number;
  title: string | null;
  announcement: string | null;
  currency_code: string;
  is_vacation: boolean;
  vacation_message: string | null;
  sale_message: string | null;
  digital_sale_message: string | null;
  last_updated_timestamp: number;
  listing_active_count: number;
  digital_listing_count: number;
  login_name: string;
  accepts_custom_requests: boolean;
  policy_welcome: string | null;
  policy_payment: string | null;
  policy_shipping: string | null;
  policy_refunds: string | null;
  policy_additional: string | null;
  policy_seller_info: string | null;
  policy_updated_timestamp: number;
  policy_has_private_receipt_info: boolean;
  has_unstructured_policies: boolean;
  policy_privacy: string | null;
  vacation_autoreply: string | null;
  url: string;
  image_url_760x100: string | null;
  num_favorers: number;
  languages: string[];
  icon_url_fullxfull: string | null;
  is_using_structured_policies: boolean;
  has_onboarded_structured_policies: boolean;
  include_dispute_form_link: boolean;
  is_direct_checkout_onboarded: boolean;
  is_calculated_eligible: boolean;
  is_opted_in_to_buyer_promise: boolean;
  is_shop_us_based: boolean;
  transaction_sold_count: number;
  shipping_from_country_iso: string;
  shop_location_country_iso: string | null;
  review_count: number;
  review_average: number | null;
}

export interface EtsyListingImage {
  listing_id: number;
  listing_image_id: number;
  hex_code: string | null;
  red: number;
  green: number;
  blue: number;
  hue: number;
  saturation: number;
  brightness: number;
  is_black_and_white: boolean;
  creation_tsz: number;
  created_timestamp: number;
  rank: number;
  url_75x75: string;
  url_170x135: string;
  url_570xN: string;
  url_fullxfull: string;
  full_height: number;
  full_width: number;
  alt_text: string | null;
}

/**
 * Etsy API Client
 */
export class EtsyAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${ETSY_API_BASE}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options?.headers,
        Authorization: `Bearer ${this.accessToken}`,
        "x-api-key": process.env.ETSY_API_KEY || "",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Etsy API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  /**
   * Get shop by shop ID
   */
  async getShop(shopId: number): Promise<EtsyShop> {
    const data = await this.request<{ results: EtsyShop[] }>(`/shops/${shopId}`);
    return data.results[0];
  }

  /**
   * Get user's shops
   */
  async getUserShops(userId: number): Promise<EtsyShop[]> {
    const data = await this.request<{ results: EtsyShop[] }>(`/users/${userId}/shops`);
    return data.results;
  }

  /**
   * Get shop's active listings
   */
  async getShopListings(shopId: number, limit: number = 100): Promise<EtsyListing[]> {
    const data = await this.request<{ results: EtsyListing[] }>(
      `/shops/${shopId}/listings/active?limit=${limit}`
    );
    return data.results;
  }

  /**
   * Get listing by ID
   */
  async getListing(listingId: number): Promise<EtsyListing> {
    const data = await this.request<{ results: EtsyListing[] }>(`/listings/${listingId}`);
    return data.results[0];
  }

  /**
   * Get listing images
   */
  async getListingImages(listingId: number): Promise<EtsyListingImage[]> {
    const data = await this.request<{ results: EtsyListingImage[] }>(
      `/listings/${listingId}/images`
    );
    return data.results;
  }

  /**
   * Update listing
   */
  async updateListing(
    shopId: number,
    listingId: number,
    updates: Partial<{
      title: string;
      description: string;
      tags: string[];
      materials: string[];
    }>
  ): Promise<EtsyListing> {
    const data = await this.request<{ results: EtsyListing[] }>(
      `/shops/${shopId}/listings/${listingId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams(
          Object.entries(updates).reduce((acc, [key, value]) => {
            if (Array.isArray(value)) {
              acc[key] = value.join(",");
            } else {
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>)
        ),
      }
    );
    return data.results[0];
  }
}

