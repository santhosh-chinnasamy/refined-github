import React from 'dom-chef';
import cache from 'webext-storage-cache';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import * as api from '../github-helpers/api';
import {getUsername, getCleanPathname} from '../github-helpers';
import attachElement from '../helpers/attach-element';

const doesUserFollow = cache.function(async (userA: string, userB: string): Promise<boolean> => {
	const {httpStatus} = await api.v3(`/users/${userA}/following/${userB}`, {
		json: false,
		ignoreHTTPStatus: true,
	});

	return httpStatus === 204;
}, {
	cacheKey: ([userA, userB]) => `user-follows:${userA}:${userB}`,
});

async function init(): Promise<void> {
	if (!await doesUserFollow(getCleanPathname(), getUsername()!)) {
		return;
	}

	attachElement('.js-profile-editable-area [href$="?tab=following"]', {
		after: () => (
			<span className="color-fg-muted"> · Follows you</span>
		),
	});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	exclude: [
		pageDetect.isOwnUserProfile,
		pageDetect.isPrivateUserProfile,
	],
	init,
});
