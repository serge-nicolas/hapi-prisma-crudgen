// CONFIG 

const excludeFieldsForResult = (items: Array<any>, valuesToHideForResponse:Array<string> = ["password", "passphrase"]): Array<any> => {
  // DOC create specific type for this response
  type ItemResponseKeys = keyof (typeof items)[0];

  // DOC remove data values if hidden (like password fields)
  items = items.map((item: ItemResponseKeys) => {
    const obj: any = {};
    Object.keys(item).forEach((itemKey: any, index: number) => {
      if (valuesToHideForResponse.includes(itemKey)) {
        obj[itemKey] = "*********";
      } else {
        const ob = Object.entries(item)
          .filter(([key, val]) => {
            return itemKey === key;
          })
          .map(([key, val]) => {
            return itemKey === key ? val : false;
          })[0];
        // BUG false and undefined display null
        obj[itemKey] = ob ? ob : null;
      }
    });
    return obj;
  });
  return items;
};

export { excludeFieldsForResult };
