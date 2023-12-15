import "dotenv/config";

import { getData, postData } from "./helpers";

describe("get user", () => {
  let users: Array<any> = [];
  test("should return all users", async () => {
    users = await getData("user", "findMany");
    expect(users.length).toBeGreaterThanOrEqual(0);
  });
  test("should create a random user", async () => {
    users = await postData("user", "create", {});
    expect(users.length).toBeGreaterThanOrEqual(0);
  });
  test("should return a random user", async () => {
    const id = users.at(Math.floor(Math.random() * users.length)).id;
    const user = await getData("user", "findUnique", {
      id,
    });
    expect(user.id).toBe(id);
  });
  test("should return a random with conditions", async () => {
    const randomUser = users.at(Math.floor(Math.random() * users.length)); // get a random user in previous list
    const usersByCond = await getData("user", "findMany", {
      id: randomUser.id,
      email: randomUser.email,
    });
    expect(usersByCond.length).toBeGreaterThanOrEqual(0);
  });
});
