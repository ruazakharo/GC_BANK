import UserDAO from '../dao/UserDAO';
import SignageAdsDAO from '../dao/SignageAdsDAO';

import * as API from '../models/api';
import * as UserService from './UserService';
import { NotFoundError } from '../models/error';

export async function getIdentifiedSignage(req: API.SignageIdentificationRequest): Promise<API.SignageIdentification> {
    const phoneNumber = UserService.getNormalizedPhoneNumber(req.phoneNumber);
    const user = await UserDAO.getByPhoneNumber(phoneNumber);

    let client: API.SignageIdentificationClient;
    if (user) {
        client = {
            name: user.name,
            phoneNumber: user.phoneNumber
        };
    }

    const ads = await SignageAdsDAO.getMany({});

    return {
        client,
        ads
    };
}

export async function updateSignagePresence(req: API.SignagePresenceUpdate): Promise<void> {
    const phoneNumber = UserService.getNormalizedPhoneNumber(req.phoneNumber);
    const user = await UserDAO.getByPhoneNumber(phoneNumber);

    if (!user) {
        throw new NotFoundError('User not found, phone number: ' + phoneNumber);
    }

    await UserService.updateUserPresence(user.id, {
        signage: req.visible
    });
}