const loadMeta = async () => {
  const reponse = await fetch(process.env.META, {
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const meta = await reponse.json();
  return meta;
};

const loadData = async (
  model = "user",
  action = "findMany",
  searchString = ""
) => {
  /* let method = "GET";

  switch (action) {
    case "findUnique":
    case "findMany":
      method = "GET";
    default:
      method = "POST";
  }*/

  console.log(model);

  const reponse = await fetch(`${process.env.API}/${model}/`, {
    cache: "no-cache",
    method,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await reponse.json();
  return data;
};


const saveData = async (url, method, payload) => {
  console.log(url, method, payload);
  if (["PUT", "POST", "PATH"].includes(method)) {
    const reponse = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      method,
      body: JSON.stringify(payload)
    });
    const data = await reponse.json();
    return data;
  }
  throw Error("wrong method to put data");
}

export { loadMeta, loadData, saveData };
