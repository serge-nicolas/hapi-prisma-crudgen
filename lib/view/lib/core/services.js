const loadMeta = async () => {
  const reponse = await fetch("http://localhost:3002/meta", {
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
  let method = "GET";

  switch (action) {
    case "findUnique":
    case "findMany":
      method = "GET";
    default:
      method = "POST";
  }

  const reponse = await fetch(`http://localhost:3002/api/${model}/`, {
    cache: "no-cache",
    method,
    headers: {
      "Content-Type": "application/json",
    },
  });
  const meta = await reponse.json();
  return meta;
};

export { loadMeta, loadData };
