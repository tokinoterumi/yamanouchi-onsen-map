export interface MicroCMSRyokan {
	id: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	revisedAt: string;
	name: string;
	slug: string;
	onsenArea: {
		name: string;
	};
	description: string;
	heroImage?: {
		url: string;
		width: number;
		height: number;
	};
	cover?: {
		url: string;
		width: number;
		height: number;
	};
	gallery?: Array<{
		url: string;
		width: number;
		height: number;
	}>;
	phone?: string;
	web?: string;
	address: string;
	price?: string;
	privateBath?: boolean;
	openAirBath?: boolean;
	onsenRoom?: boolean;
	dayUse?: boolean;
	morningOnlyPlan?: boolean;
	sleepOnlyPlan?: boolean;
	bed?: boolean;
	tattooFriendly?: boolean;
	dogFriendly?: boolean;
	roomType?: string;
	elevator?: boolean;
	barrierFreeWashroom?: boolean;
	barrierFree?: boolean;
	karaoke?: boolean;
	pingPong?: boolean;
	numberOfRooms?: number;
	latitude: number;
	longitude: number;
}

export interface MicroCMSResponse<T> {
	contents: T[];
	totalCount: number;
	offset: number;
	limit: number;
}

const MICROCMS_SERVICE_DOMAIN = '00y7aqc3z0';
// API key will be passed from server-side or set per request

class MicroCMSClient {
	private baseUrl: string;
	private headers: HeadersInit;

	constructor(serviceDomain: string, apiKey?: string) {
		this.baseUrl = `https://${serviceDomain}.microcms.io/api/v1`;
		this.headers = {
			'Content-Type': 'application/json',
			...(apiKey && { 'X-MICROCMS-API-KEY': apiKey })
		};
	}

	async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
		const url = new URL(`${this.baseUrl}${endpoint}`);

		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				url.searchParams.append(key, value);
			});
		}

		const response = await fetch(url.toString(), {
			headers: this.headers
		});

		if (!response.ok) {
			throw new Error(`MicroCMS API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}

	// Get all ryokans
	async getRyokans(params?: {
		limit?: number;
		offset?: number;
		orders?: string;
		q?: string;
		fields?: string;
		filters?: string;
		draftKey?: string;
	}): Promise<MicroCMSResponse<MicroCMSRyokan>> {
		return this.get<MicroCMSResponse<MicroCMSRyokan>>('/ryokan', params);
	}

	// Get single ryokan by ID
	async getRyokan(
		contentId: string,
		params?: {
			fields?: string;
			draftKey?: string;
		}
	): Promise<MicroCMSRyokan> {
		return this.get<MicroCMSRyokan>(`/ryokan/${contentId}`, params);
	}

	// Get ryokan by slug (requires filtering)
	async getRyokanBySlug(slug: string, draftKey?: string): Promise<MicroCMSRyokan | null> {
		const params: Record<string, string> = {
			filters: `slug[equals]${slug}`,
			limit: '1'
		};

		if (draftKey) {
			params.draftKey = draftKey;
		}

		const response = await this.getRyokans(params);
		return response.contents[0] || null;
	}
}

//Create client instance (API key optional for public endpoints)
export const microCMS = new MicroCMSClient(MICROCMS_SERVICE_DOMAIN);

// For server-side usage with API key:
export function createMicroCMSClient(apiKey?: string) {
	return new MicroCMSClient(MICROCMS_SERVICE_DOMAIN, apiKey);
}

// Transform MicroCMS ryokan data for InfoCard
export function transformMicroCMSRyokanForInfoCard(ryokan: MicroCMSRyokan) {
	// Select 2-3 key facilities for display
	const keyFacilities: string[] = [];

	if (ryokan.openAirBath) keyFacilities.push('露天風呂');
	if (ryokan.privateBath) keyFacilities.push('貸切風呂');
	if (ryokan.onsenRoom) keyFacilities.push('温泉付き客室');
	if (ryokan.dayUse) keyFacilities.push('日帰り入浴');
	if (ryokan.tattooFriendly) keyFacilities.push('タトゥーOK');
	if (ryokan.dogFriendly) keyFacilities.push('ペットOK');

	return {
		name: ryokan.name,
		pos: [ryokan.latitude, ryokan.longitude] as [number, number],
		type: 'ryokan' as const,
		icon: '🏮',
		description: ryokan.description,
		details: `
      <div class="onsen-area">♨️ ${ryokan.onsenArea.name}</div>
      <div class="facilities">${keyFacilities.slice(0, 3).join(' • ')}</div>
      <div class="contact">
        <div class="address">📍 ${ryokan.address}</div>
        ${ryokan.phone ? `<div class="phone">📞 ${ryokan.phone}</div>` : ''}
      </div>
    `,
		image: ryokan.heroImage?.url || ryokan.cover?.url || ''
	};
}

// Environment setup
/*
For server-side API access (if needed), create a load function:

// routes/+layout.server.ts or +page.server.ts
import { createMicroCMSClient } from '$lib/microcms';
import { MICROCMS_API_KEY } from '$env/static/private';

export async function load() {
  const microCMS = createMicroCMSClient(MICROCMS_API_KEY);
  
  try {
    const ryokans = await microCMS.getRyokans({
      limit: 100,
      fields: 'id,name,slug,latitude,longitude,onsenArea,description,heroImage,address,phone'
    });
    
    return {
      ryokans: ryokans.contents
    };
  } catch (error) {
    console.error('Failed to fetch ryokans:', error);
    return {
      ryokans: []
    };
  }
}

// Then in your .env file:
MICROCMS_API_KEY=your_api_key_here
*/
