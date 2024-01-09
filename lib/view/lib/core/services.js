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

export { loadMeta, loadData };
