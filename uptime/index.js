import k8s from "@kubernetes/client-node";
import request from "request";
const kc = new k8s.KubeConfig();

kc.loadFromDefault();

const API = process.env.API;
const opts = {};
kc.applyToRequest(opts);

let timer = 1000;

request.get(
  `${kc.getCurrentCluster().server}/apis/networking.k8s.io/v1beta1/ingresses`,
  opts,
  (error, response, body) => {
    if (error) {
      console.log(`error: ${error}`);
    }
    if (response) {
      console.log(`statusCode: ${response.statusCode}`);
      if(response.statusCode !== 200 || !API) {
        process.exit(1)
      }
    }
    const json = JSON.parse(body);
    json.items.forEach((item) => {
      item.spec.rules.forEach((host) => {
        const url = host.host;
        const regex = ".well-known/acme-challenge";
        let uri = "";
        if (host.http.paths[0].path) {
          host.http.paths.forEach((path) => {
            if (!path.path.match(regex)) {
              uri = url + path.path;
            }
          });
        } else {
          uri = url;
        }
        if (uri.length > 0) {
          const pushMonitor = () => {
            console.log(uri);
            const options = {
              method: "POST",
              url: "https://api.uptimerobot.com/v2/newMonitor",
              headers: {
                "content-type": "application/x-www-form-urlencoded",
                "cache-control": "no-cache",
              },
              form: {
                api_key: API,
                format: "json",
                type: "1",
                url: `https://${uri}`,
                friendly_name: uri,
              },
            };
            request(options, (error, response, body) => {
              if (error) throw new Error(error);
              console.log(body);
            });
          };
          // Free Plans rate limits: 10 requests/minute
          setTimeout(pushMonitor, timer);
          timer = timer + 7000;
        }
      });
    });
  }
);
