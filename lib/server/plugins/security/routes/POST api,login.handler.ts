import type Hapi from "@hapi/hapi";
import { findManySchemas } from "../../../validation/query";
import Joi from "joi";
import type { PrismaClient } from "@prisma/client";
import prismaClientInstance from "../../../controlers/prismaInstance";
import { Logger } from "winston";

import jsonwebtoken from "jsonwebtoken";

import { uuidValidate, generatePGPKeys, generateUUID } from "../helpers";
/*
 * handler to the user login logic passwordless
 * use a user proxy : no need to check if user is already logged, create a temp login proxy user
 * if user proxy exist : can't log
 * if not exists : can log
 * useful to store IP on log and compare to request ip, generate security with PGP, store bearer...
 * should speed up login process if many users are logged
 */
const redeem = async (
  req: Hapi.Request,
  logger: Logger,
  config: any,
  prisma: PrismaClient
) => {
  if (!uuidValidate(req.query?.redeem_code)) {
    return { error: "something wrong" };
  }
  const logAttempt = await prisma.userLogAttempt.findMany({
    where: {
      oneTimeCode: req.query?.redeem_code,
      expire: {
        gte: new Date(Date.now()),
      },
    },
    select: {
      id: true,
      user: true,
    },
  });
  if (logAttempt.length < 1) {
    return { error: "something wrong" };
  }
  const currentLogAttempt = logAttempt[0];

  logger.info(
    `redeem attempt by ${currentLogAttempt.user.email} with code ${req.query?.redeem_code}`
  );
  // remove the used code
  await prisma.userLogAttempt.delete({
    where: {
      id: currentLogAttempt.id,
    },
  });
  await prisma.userTempProxy.deleteMany({
    where: {
      user: {
        id: currentLogAttempt.user.id,
      },
    },
  });
  // create the pgp security
  if (currentLogAttempt.user.passphrase) {
    // create a temp user proxy with id
    const tempProxy = await prisma.userTempProxy.create({
      data: {
        userId: currentLogAttempt.user.id,
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            createdAt: true,
            email: true,
            role: true,
          },
        },
      },
    });
    // create PGP keys for security
    // use the temp id for passphrase
    const { publicKey, privateKey } = await generatePGPKeys(
      currentLogAttempt.user.email,
      tempProxy.id
    );

    // create token
    const authtoken = jsonwebtoken.sign({ ...tempProxy.user }, publicKey);

    const updatedUser = await prisma.userTempProxy.update({
      where: {
        id: tempProxy.id,
      },
      data: {
        publicKey,
        privateKey,
        authtoken,
      },
      select: {
        id: true,
        user: true,
        publicKey: true,
        privateKey: true,
        authtoken: true,
      },
    });

    // build the returned user as defined in config/server.yaml
    const definedUser = {
      id: updatedUser.id,
      authtoken: updatedUser.authtoken,
      publicKey:updatedUser.publicKey 
    };
    config.server.userFieldsAtLogin.forEach((key: string) => {
      Object.assign(definedUser, { [key]: updatedUser.user[key] });
    });

    return definedUser;
  }
};

const loginAttempt = async (
  req: Hapi.Request,
  logger: Logger,
  config: any,
  prisma: PrismaClient
) => {
  const payload: any = req.payload; // BUG ts parsing
  // validate payload against schema
  // TODO use HAPI validation but bug ?
  // TODO choose between HAPI,Prisma or Joi validation
  const schema = findManySchemas("user") as Joi.ObjectSchema;
  const { value, error, warning } = schema.validate(payload);
  // cleanup previous attempts for this email
  logger.info(`login attempt by ${value.email}`);
  await prisma.userLogAttempt.deleteMany({
    where: {
      user: {
        email: value.email,
      },
    },
  });
  // remove the proxy to user
  await prisma.userTempProxy.deleteMany({
    where: {
      user: {
        email: value.email,
      },
    },
  });

  //
  if (error) {
    logger.error(error.message);
    return error;
  }
  // or set in config.server.routes via HAPI api
  // check if user exist
  const user = await prisma.user.findMany({
    where: { ...value, OR: [{ logged: null }, { logged: false }] },
    select: { id: true },
  });
  if (!user?.at(0)) {
    return "no user";
  } else {
    const userId = user.at(0).id;
    const oneTimeCode: string = generateUUID();
    const expire: Date = new Date(
      new Date().setHours(new Date().getHours() + 1)
    );
    // create user log attempt
    const logAttempt = await prisma.userLogAttempt.create({
      data: {
        userId,
        expire,
        oneTimeCode,
      },
      select: {
        oneTimeCode: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    });
    // TODO send email to user
    console.log(`${process.env.SERVER}redeem?code=${oneTimeCode}`);
    // ensure to return the one created in db
    return { code: logAttempt.oneTimeCode };
  }
};

const handler = async (req: Hapi.Request, logger: Logger, config: any) => {
  logger.info(
    "custom route handler " + req.path + " query:" + JSON.stringify(req.query)
  );
  const prisma: PrismaClient = prismaClientInstance;
  if (!prisma) {
    console.error("something wrong");
    throw new Error("something wrong");
  }
  if (req.query?.redeem_code) {
    // check if redeem_code is defined and valid (no expired)
    return redeem(req, logger, config, prisma);
  } else {
    return loginAttempt(req, logger, config, prisma);
  }
};

// route config
const config: any = {
  path: `/api/login`,
  method: "POST",
  options: {
    auth: false,
  },
};

export { handler, config };
