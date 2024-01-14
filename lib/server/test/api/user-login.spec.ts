import "dotenv/config";

import { userLogin, userLoginRedeem, getData } from "../helpers";
import { AxiosResponse } from "axios";

console.log("testing user login");

const mockedUser: any = {
  email: "test125@gmail.com",
  role: "ADMIN",
};
describe("user login story", () => {
  let user: AxiosResponse;
  let foundUser: any = {};
  let bearer: string;
  test("user login passwordless", async () => {
    const userEmail = "test125@gmail.com";
    // login user
    user = await userLogin("user", { email: userEmail });
    expect(user).not.toBeNull();
    expect(user.status).toBe(200);
    expect(user.data.code).toBeDefined(); // uuid templogin code

    // send request to redeem
    const redeem = await userLoginRedeem(user.data.code);
    expect(redeem.data).not.toBeNull();

    // get the result and set the bearer
    bearer = `Bearer ${redeem.data.authtoken}`;
  });
  test("should return all users with headers", async () => {
    const users = await getData("user", "findMany", undefined, {
      Authorization: `${bearer}`,
    });
    expect(users.data.length).toBeGreaterThan(0);
  });
  test("should return all users with NO headers", async () => {
    const users = await getData("user", "findMany", undefined, {});
    expect(users.status).toBe(204);
  });
});
