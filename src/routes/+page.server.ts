import { createMicroCMSClient } from '$lib/microcms';
import { MICROCMS_API_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	// Use the factory to create a secure, server-side client
	const microCMS = createMicroCMSClient(MICROCMS_API_KEY);
	const draftKey = url.searchParams.get('draftKey');

	try {
		// Call your clean helper method
		const ryokansResponse = await microCMS.getRyokans({
			limit: 100,
			fields:
				'id,name,latitude,longitude,onsenArea,description,heroImage,cover,address,phone,openAirBath,privateBath,onsenRoom,dayUse,tattooFriendly,dogFriendly',
			...(draftKey && { draftKey })
		});

		return {
			ryokans: ryokansResponse.contents
		};
	} catch (error) {
		console.error('Failed to fetch ryokans for main page:', error);
		return {
			ryokans: []
		};
	}
};
