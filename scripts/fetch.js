import https from "https";
https.get("https://komtim.id/livestreamer/", (res) => {
  let data = "";
  res.on("data", (chunk) => data += chunk);
  res.on("end", () => console.log(data));
});
