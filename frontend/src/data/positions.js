export const POSITION_ATTRIBUTES = {
  GK: {
    label: "Goalkeeper",
    attrs: ["command_of_area", "one_on_ones", "reflexes", "bravery", "agility"],
  },
  CB: {
    label: "Centre Back",
    attrs: ["positioning", "balance", "jumping_reach", "pace", "strength"],
  },
  FB: {
    label: "Full Back",
    attrs: ["acceleration", "balance", "pace"],
  },
  DM: {
    label: "Defensive Midfielder",
    attrs: ["tackling", "aggression", "acceleration", "pace", "strength"],
  },
  CM: {
    label: "Central Midfielder",
    attrs: ["passing", "technique", "flair", "off_the_ball", "vision"],
  },
  W: {
    label: "Winger",
    attrs: ["dribbling", "decisions", "off_the_ball", "acceleration", "pace"],
  },
  ST: {
    label: "Striker",
    attrs: ["finishing", "determination", "off_the_ball", "acceleration", "jumping_reach"],
  },
};

export function detectPositionGroup(positions) {
  if (!positions || positions.length === 0) return "CM";
  const pos = positions[0].toLowerCase();

  if (pos.includes("goalkeeper")) return "GK";
  if (pos.includes("striker")) return "ST";

  if (pos.includes("defender")) {
    if (pos.includes("centre")) return "CB";
    return "FB";
  }

  if (pos.includes("wing-back") || pos.includes("wingback")) return "FB";

  if (pos.includes("midfielder") || pos.includes("attacking midfielder")) {
    if (pos.includes("right") || pos.includes("left")) return "W";
    if (pos.includes("defensive")) return "DM";
    return "CM";
  }

  return "CM";
}

export function getKeyAttributes(player) {
  const group = detectPositionGroup(player.positions);
  const config = POSITION_ATTRIBUTES[group];
  const allAttrs = {
    ...player.technical,
    ...player.mental,
    ...player.physical,
    ...player.goalkeeping,
  };

  return {
    group,
    label: config.label,
    attrs: config.attrs.map((key) => ({
      key,
      label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      value: allAttrs[key] ?? 0,
    })),
  };
}