import { useEffect, useState } from "react";
import { displayName } from "./channels.js";

// The signed-in user's picture (user_metadata.avatar_url), or their initial.
export default function Avatar({ user, src, size = 32, className = "" }) {
  const url = src ?? user?.user_metadata?.avatar_url;
  const [broken, setBroken] = useState(false);
  useEffect(() => setBroken(false), [url]);

  const style = { width: size, height: size, fontSize: Math.round(size * 0.42) };
  return (
    <span className={`avatar ${className}`} style={style} aria-hidden="true">
      {url && !broken ? (
        <img src={url} alt="" onError={() => setBroken(true)} />
      ) : (
        displayName(user).charAt(0).toUpperCase()
      )}
    </span>
  );
}
