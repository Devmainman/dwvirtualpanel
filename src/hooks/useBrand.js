import { useEffect, useState } from "react";
import { API_BASE_URL } from "../api/config";

let cache = "";

/** Site name from the public settings; also titles the browser tab. */
export default function useBrand() {
  const [brand, setBrand] = useState(cache);
  useEffect(() => {
    if (cache) return;
    fetch(`${API_BASE_URL}/public/settings`)
      .then((r) => r.json())
      .then((d) => {
        cache = d?.settings?.websiteName || "";
        setBrand(cache);
        document.title = cache ? `${cache} Admin` : "Admin";
      })
      .catch(() => {});
  }, []);
  return brand;
}
