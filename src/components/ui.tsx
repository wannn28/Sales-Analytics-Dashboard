import { Dribbble, Instagram, ChevronDown } from "lucide-react";
import type { Employee } from "../types/dashboard";
export const money = (value: number, decimals = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
export function Avatar({
  person,
  small = false,
}: {
  person: Pick<Employee, "name" | "initials" | "color">;
  small?: boolean;
}) {
  return (
    <span
      className={`avatar ${small ? "small" : ""}`}
      style={{ background: person.color }}
      title={person.name}
    >
      <span>{person.initials}</span>
    </span>
  );
}
export function PlatformIcon({ name }: { name: string }) {
  return (
    <span className={`platform-icon ${name.toLowerCase()}`}>
      {name === "Dribbble" ? (
        <Dribbble size={19} />
      ) : name === "Instagram" ? (
        <Instagram size={18} />
      ) : name === "Behance" ? (
        "Bē"
      ) : name === "Google" ? (
        "G"
      ) : (
        "◈"
      )}
    </span>
  );
}
export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand ${small ? "small" : ""}`}>
      C<span />
    </span>
  );
}
export function Down() {
  return <ChevronDown size={12} />;
}
