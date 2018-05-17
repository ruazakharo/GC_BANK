import * as Log4js from 'log4js';
import * as Config from 'config';
import * as _ from 'lodash';

import * as API from '../models/api';
import * as TokenService from './TokenService';
import * as AppointmentService from './AppointmentService';
import * as SmsSenderService from './SmsSenderService';
import UserDAO from '../dao/UserDAO';
import { BadRequestError, NotAuthorizedError, NotFoundError } from '../models/error';

type UserServiceConfig = {
    welcomeMessageText: string;
};
const serviceConfig = Config.get<UserServiceConfig>('user');

const logger = Log4js.getLogger('services.user');

const PHONE_NUMBER_PATTERN = /^(\+\d)?\d{10}$/;

export function getNormalizedPhoneNumber(phoneNumber: string) {
    if (!PHONE_NUMBER_PATTERN.exec(phoneNumber)) {
        throw new BadRequestError('Invalid phone number');
    }

    if (!phoneNumber.startsWith('+')) {
        return '+1' + phoneNumber;
    } else {
        return phoneNumber;
    }
}

export async function signupUser(req: API.SignupRequest) {
    const phoneNumber = getNormalizedPhoneNumber(req.phoneNumber);

    let user = await UserDAO.getByPhoneNumber(phoneNumber);

    if (!user) {
        logger.info(`Creating new user, phone number: ${phoneNumber}`);

        user = await UserDAO.insertOne({
            value: {
                name: req.name,
                phoneNumber
            }
        });
    }

    const message = _.template(serviceConfig.welcomeMessageText)({
        name: req.name
    });

    SmsSenderService.sendMessage(user.phoneNumber, message);

    return AppointmentService.createAppointment(user.id, {
        reasonId: req.appointmentReasonId,
        officeId: (await AppointmentService.getOffices())[0].id
    });
}

export async function authenticateUser(req: API.SigninRequest): Promise<API.SigninResponse> {
    if (!PHONE_NUMBER_PATTERN.exec(req.phoneNumber)) {
        throw new BadRequestError('Invalid phone number');
    }

    const phoneNumber = getNormalizedPhoneNumber(req.phoneNumber);

    const user = await UserDAO.getByPhoneNumber(phoneNumber);

    if (!user) {
        throw new NotAuthorizedError('User not found');
    }

    const res = {
        token: await TokenService.createToken({
            user: user
        })
    };

    return res;
}

export async function getUserInfo(userId: string): Promise<API.UserInfo> {
    const user = await UserDAO.getOne({
        filterById: userId
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return {
        name: user.name,
        phoneNumber: user.phoneNumber,
        currentAppointment: await AppointmentService.tryGetCurrentAppointment(userId)
    };
}