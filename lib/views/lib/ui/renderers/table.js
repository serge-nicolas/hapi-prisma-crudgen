const buildTable = (classTable, action, hash) => {
  document.querySelector(classTable).innerHTML = "loading...";
  try {
    fetch(`/api/${hash.model.toLowerCase()}/${action}`)
      .then((response) => response.json())
      .then((data) => {
        if (!data.length) {
          document.querySelector(classTable).innerHTML = "empty!";
          return;
        } else {
          document.querySelector(classTable).innerHTML = "";
          const idColNum = Object.keys(data[0]).indexOf("id");
          const createdAtColNum = Object.keys(data[0]).indexOf("createdAt");
          const updatedAtColNum = Object.keys(data[0]).indexOf("updatedAt");
          const table = new window.simpleDatatables.DataTable(classTable, {
            columns: [
              {
                select: idColNum,
                render: (value, _td, _rowIndex, _cellIndex) => `<a class="btn-primary" href="/admin/${hash.model}/edit/${value[0].data}#model=User&action=NEW">EDIT</span>`,
              },
              {
                select: updatedAtColNum,
                render: (value, _td, _rowIndex, _cellIndex) => moment(value.updatedAt).format("L hh:mm:ss")
              },
              {
                select: createdAtColNum,
                render: (value, _td, _rowIndex, _cellIndex) => moment(value.createdAt).format("L hh:mm:ss")
              },
            ],
            labels: {
              placeholder: "Search " + pluralize(hash.model) + "...",
              perPage: pluralize(hash.model) + " per page",
              noRows: "No " + hash.model + " to display",
              info:
                "Showing {start} to {end} of {rows} " +
                pluralize(hash.model) +
                " (Page {page} of {pages} pages)",
            },
            data: {
              headings: ["", ...Object.keys(data[0]).splice(1)],
              data: data.map((item) => [...Object.values(item)]),
            },
            layout: {
              top: "{select}{search}",
              bottom: "{info}{pager}",
            },
          });

          // TODO add table event
        }
      });
  } catch (error) {}
};

export { buildTable };
// 