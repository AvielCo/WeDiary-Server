const app = require("./server.init");
const server = app();
const PORT = 8080;

server.listen(PORT, () => {
  console.log(`API Server is listening to port ${PORT}`);
});

// SOME TEMPLATES

//** POST REQUEST */
// app.post("/", (req, res, next) => {
//   try {
//   } catch (err) {
//     next(err);
//   }
// });

//** GET REQUEST */
// app.get("/", (req, res, next) => {
//   try {
//   } catch (err) {
//     next(err);
//   }
// });
