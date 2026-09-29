import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { Avatar, PlatformIcon, money } from "../ui";
import type { Employee, Platform, DynamicPoint } from "../../types/dashboard";
import { SalesDynamicChart } from "./SalesDynamicChart";
import { loadMemberDetails } from "../../services/api";
export function TeamPerformance({
  team,
  period,
  search,
}: {
  team: Employee[];
  period: string;
  search: string;
}) {
  const [expanded, setExpanded] = useState(2);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [dynamics, setDynamics] = useState<DynamicPoint[]>([]);
  const [detailsError, setDetailsError] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const controller = new AbortController();
    setPlatforms([]);
    setDynamics([]);
    setDetailsError(false);
    loadMemberDetails(period, expanded, controller.signal)
      .then((result) => {
        setPlatforms(result.platforms);
        setDynamics(result.dynamics);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setDetailsError(true);
      });
    return () => controller.abort();
  }, [period, expanded]);
  const people = team.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="team-section">
      <div className="team-labels">
        <span>Sales</span>
        <span>Revenue</span>
        <span>Leads</span>
        <span>KPI</span>
        <span>W/L</span>
        <span />
      </div>
      {people.length === 0 && (
        <p className="no-results">No team members match “{search}”.</p>
      )}
      {people.map((person) => (
        <div
          className={`team-member ${expanded === person.id ? "expanded" : ""}`}
          key={person.id}
        >
          <button
            className="team-row"
            onClick={() => setExpanded(expanded === person.id ? 0 : person.id)}
            aria-expanded={expanded === person.id}
          >
            <span>
              <Avatar person={person} small />
              {person.name}
            </span>
            <strong>{money(person.revenue)}</strong>
            <span>
              <b>{person.deals}</b>
              <em>{person.leads}</em>
            </span>
            <span>{person.kpi.toFixed(2)}</span>
            <span>
              {person.winRate.toFixed(0)}%
              <b>{Math.round((person.deals * person.winRate) / 100)}</b>
            </span>
            <span className="expand-indicator">
              {expanded === person.id ? <ChevronUp size={11} /> : "›"}
            </span>
          </button>
          {expanded === person.id && (
            <div className="team-expanded">
              {detailsError && (
                <p role="alert">
                  Member details unavailable. Reopen this row to retry.
                </p>
              )}
              <div className="achievements">
                <span>Top sales ✨</span>
                <span>Sales streak 🔥</span>
                <span>Top review 👍</span>
              </div>
              <div className="platforms-heading">
                <h3>Work with platforms</h3>
                <div>
                  <b>↗ 3</b>
                  <b>{money(person.revenue)}</b>
                </div>
              </div>
              <div className="platform-mosaic">
                <div className="mosaic-primary">
                  <span>
                    <PlatformIcon name="Dribbble" />
                    Dribbble
                  </span>
                  <div>
                    <strong>{platforms[0]?.share.toFixed(1)}%</strong>
                    <em>
                      {money(
                        (person.revenue * (platforms[0]?.share ?? 0)) / 100,
                      )}
                    </em>
                  </div>
                </div>
                <div className="mosaic-instagram">
                  <span>
                    <PlatformIcon name="Instagram" />
                    Instagram
                  </span>
                  <strong>
                    {platforms[1]?.share.toFixed(1)}%
                    <em>
                      {money(
                        (person.revenue * (platforms[1]?.share ?? 0)) / 100,
                      )}
                    </em>
                  </strong>
                </div>
                <div className="mosaic-google">
                  <span>
                    <PlatformIcon name="Google" />
                    Google
                  </span>
                  <strong>
                    {platforms[3]?.share.toFixed(1)}%
                    <em>
                      {money(
                        (person.revenue * (platforms[3]?.share ?? 0)) / 100,
                      )}
                    </em>
                  </strong>
                </div>
                <div className="mosaic-behance">
                  <PlatformIcon name="Behance" />
                  <strong>{platforms[2]?.share.toFixed(1)}%</strong>
                </div>
                <div className="mosaic-other">
                  <span>
                    <PlatformIcon name="Other" />
                    Other
                  </span>
                  <strong>{platforms[4]?.share.toFixed(1)}%</strong>
                </div>
              </div>
              <SalesDynamicChart data={dynamics} />
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
