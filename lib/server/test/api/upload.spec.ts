import "dotenv/config";

import { createReadStream, existsSync, readFileSync } from "node:fs";

import { resolve } from "node:path";

import { userLogin, userLoginRedeem, postData } from "../helpers";
import { AxiosResponse } from "axios";

console.log("testing user login");

const mockedUser: any = {
  email: "test125@gmail.com",
  role: "ADMIN",
};
describe("user login story", () => {
  let user: AxiosResponse;
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
  test("upload file (PDF)", async () => {
    const filePath = resolve(`./mocks/files/sample.pdf`);

    if (existsSync(filePath)) {
      const data = createReadStream(filePath);
      let formData = new FormData();

      formData.append("file", data as unknown as Blob);

      await postData("file", "upload", formData, {
        Authorization: `${bearer}`,
      });
    } else {
      throw Error("file doesnt exists");
    }
  });
});
