import "dotenv/config";

import {
  getData,
  postData,
  deleteUnique,
  updateUnique,
  createData,
} from "../helpers";
import { AxiosResponse } from "axios";

const mockedUser: any = {
  email: "test125@gmail.com",
  role: "ADMIN",
};

describe("users scenario", () => {
  let users: AxiosResponse;
  let newUser: any = {};
  test("should return all users", async () => {
    users = await getData("user", "findMany");
    expect(users.data.length).toBeGreaterThanOrEqual(0);
  });

  /* test("should create a user: " + JSON.stringify(mockedUser), async () => {
    newUser = await createData("user", "create", mockedUser);
    expect(newUser.status).toBe(200);
    const oldLength: number = users.data.length;
    users = await getData("user", "findMany");
    expect(users.data.length).toBeGreaterThan(oldLength);
  }); */

  test("should return a random user", async () => {
    const id = users.data.at(Math.floor(Math.random() * users.data.length)).id;
    const user = await getData("user", "findUnique", {
      id,
    });
    expect(user).not.toBeNull();
    if (user) expect(user.data.id).toBe(id);
  });

  test("should update the last mock user email to todelete@gmail.com ", async () => {
    const newEmail: string = "todelete@gmail.com";
    users = await getData("user", "findMany", { email: mockedUser.email });
    const uid: string = users.data[0].id;
    console.log("user id", uid);
    const user = await updateUnique("user", "update", {
      id: uid,
      email: newEmail,
    });
    expect(user.status).toBe(200);
    const updatedUser: any = await getData("user", "findUnique", { id: uid });
    expect(updatedUser.data.email).toBe(newEmail);
  });

  test("should return a random user with conditions", async () => {
    const randomUser = users.data.at(
      Math.floor(Math.random() * users.data.length)
    ); // get a random user in previous list
    const usersByCond = await getData("user", "findMany", {
      id: randomUser.id,
      email: randomUser.email,
    });
    expect(usersByCond).not.toBeNull();
    if (usersByCond) expect(usersByCond.data.length).toBeGreaterThanOrEqual(0);
  });

  test("should throw an error when creating an existing user (randomly taken from existing): ", async () => {
    let randomUser = users.data.at(
      Math.floor(Math.random() * users.data.length)
    );
    delete randomUser.id;
    newUser = await createData("user", "create", randomUser);
    expect(newUser.status).toBe(204);
    // cleanup if user doesn't exist, test not needed here
    if (newUser.status === 200) {
      const user = await updateUnique("user", "delete", {
        id: newUser.data.id,
      });
      expect(user).not.toBeNull();
      expect(user.status).toBeGreaterThanOrEqual(200);
      expect(user.status).toBeLessThan(400);
    }
  });

  test("cleanup, delete the todelete@gmail.com user", async () => {
    const userToDelete = await getData("user", "findUnique", {
      email: "todelete@gmail.com",
    });
    expect(userToDelete).not.toBeNull();
    const user = await deleteUnique("user", "delete", {
     id: userToDelete.data.id
    });
    expect(user).not.toBeNull();
    expect(user.status).toBe(200);
  });
});
