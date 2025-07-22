import { createMicroCMSClient } from '$lib/microcms';
import { MICROCMS_API_KEY } from '$env/static/private';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, url }) => {
	// Use the factory to create a secure, server-side client
	const microCMS = createMicroCMSClient(MICROCMS_API_KEY);
	const draftKey = url.searchParams.get('draftKey');

	try {
		// Call your new, specific helper for a single ryokan
		const ryokan = await microCMS.getRyokan(params.id, {
			...(draftKey && { draftKey })
		});

		return {
			ryokan: ryokan
		};
	} catch (error) {
		console.error(`Failed to fetch ryokan with ID ${params.id}:`, error);
		return {
			ryokan: null
		};
	}
};
