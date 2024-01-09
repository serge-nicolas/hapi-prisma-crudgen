config folder

It uses yaml-with-import

# config fiels
## server.yaml

all items are mandatory

|   |   |
|---|---|
|protectedFields|array of fields with value replaced by #### (ex: password) server side |
|autoFields|array of fields with value auto filled by server (ex: createdAt) |
|auth|type of auth choosen in [passworlesswithemail, TBD]|
|imports|list of files to import with yaml-with-import|
|path|path to lib/assets/admin for HAPI routes|
|redirect|pages to redirect to (ex: login.success)|

## server/view.yaml

|   |   |
|---|---|
|table.model|field to display in each model table list|