import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { avataaarsNeutral } from "@dicebear/collection";

function Avatar() {
  const randommizer = () => {
    const avat = [];
  };
  const avatar = useMemo(() => {
    return createAvatar(avataaarsNeutral, {
      size: 128, // Optional: Set avatar size
      seed: "Aneka", // Optional: Seed for deterministic avatar
      // Other options: e.g., backgroundColor: ['red', 'blue']
    }).toDataUri();
  }, []);

  return <img src={avatar} alt="Avatar" />;
}

export default Avatar;
