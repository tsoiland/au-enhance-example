export class MyApp {
  confirmTest() {
    return new Promise(resolve => {
      alert("You should have seen a confirmation dialog before this alert.");
      resolve();
    })
  }
}
