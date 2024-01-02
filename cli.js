const axios = require("axios");

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve, reject) => {
    readline.question(question, (answer) => {
      resolve(answer);
    });
  });
}

class KerberosServerClient {
  host = "http://localhost:9999";
  tgt = "";
  token = "";
  isAuth = false;

  async getTime() {
    const response = await axios.get(`${this.host}/time/now`);
    return response.data.now;
  }

  // Auth
  async auth(username, password) {
    const response = await axios.post(`${this.host}/auth/as`, {
      username,
      password,
    });

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    this.tgt = response.data.tgt;
    return response.data;
  }

  async getTokens(username, serverId) {
    const response = await axios.post(`${this.host}/auth/tgs`, {
      username,
      tgt: this.tgt,
      serverId,
    });

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    this.token = response.data.token;
    this.isAuth = true;

    return response.data;
  }

  // Management

  async getMe() {
    const response = await axios.get(`${this.host}/management/me`, {
      headers: {
        tgt: this.token,
      },
    });

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  }

  async updatePass(password) {
    const response = await axios.post(
      `${this.host}/management/updatePass`,
      {
        password,
      },
      {
        headers: {
          tgt: this.token,
        },
      }
    );

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  }

  // Admin functions
  async listUsers() {
    const response = await axios.get(`${this.host}/management/users`, {
      headers: {
        tgt: this.token,
      },
    });

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  }

  async createUser(username, email, password, role) {
    const response = await axios.post(
      `${this.host}/management/users`,
      {
        username,
        email,
        password,
        role,
      },
      {
        headers: {
          tgt: this.token,
        },
      }
    );

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  }

  // Update Management server key
  async updateServerKey(serverKey) {
    const response = await axios.post(
      `${this.host}/management/updateServerKey`,
      { serverKey },
      {
        headers: {
          tgt: this.token,
        },
      }
    );

    if (response.data.message !== "success") {
      throw new Error(response.data.message);
    }

    return response.data;
  }
}

const client = new KerberosServerClient();

const main = async () => {
  const mainMenu = "1. Auth\n" + "2. Management\n" + "3. Exit\n";

  const authMenu = "1. As\n" + "2. TGS\n" + "3. Back\n";

  const managementMenu =
    "1. Get Me\n" +
    "2. Update Password\n" +
    "3. List Users\n" +
    "4. Create User\n" +
    "5. Update Server Key\n" +
    "6. Back\n";

  let menuChoice = await ask(mainMenu);
  let username;

  while (menuChoice != 3) {
    switch (menuChoice) {
      case "1":
        let authChoice = await ask(authMenu);
        switch (authChoice) {
          case "1":
            username = await ask("Username: ");
            let password = await ask("Password: ");
            try {
              await client.auth(username, password);
              console.log("Auth success");
            } catch (err) {
              console.log(err);
            }
            break;
          case "2":
            let serverId = await ask("1-> Management\nServer Id: ");
            if (serverId == "1") {
              serverId = "management";
            }
            try {
              await client.getTokens(username, serverId);
              console.log("Get tokens success");
            } catch (err) {
              console.log(err);
            }
            break;
          case "3":
            menuChoice = await ask(mainMenu);
            break;
          default:
            console.log("Invalid choice");
        }
        break;
      case "2":
        let managementChoice = await ask(managementMenu);
        switch (managementChoice) {
          case "1":
            try {
              const me = await client.getMe();
              console.log(me);
            } catch (err) {
              console.log(err);
            }
            break;
          case "2":
            let password = await ask("New Password: ");
            try {
              await client.updatePass(password);
              console.log("Update password success");
            } catch (err) {
              console.log(err);
            }
            break;
          case "3":
            try {
              const users = await client.listUsers();
              console.log(users);
            } catch (err) {
              console.log(err);
            }
            break;
          case "4":
            let username = await ask("Username: ");
            let email = await ask("Email: ");
            let _password = await ask("Password: ");
            let role = await ask("Role: ");
            try {
              await client.createUser(username, email, _password, role);
              console.log("Create user success");
            } catch (err) {
              console.log(err);
            }
            break;
          case "5":
            let serverKey = await ask("New Server Key: ");
            try {
              await client.updateServerKey(serverKey);
              console.log("Update server key success");
            } catch (err) {
              console.log(err);
            }
            break;
          case "6":
            menuChoice = await ask(mainMenu);

            break;
          default:
            console.log("Invalid choice");
        }
        break;
    }
  }
};

main();
