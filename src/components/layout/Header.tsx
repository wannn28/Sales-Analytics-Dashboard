import { Search, Menu, Plus, ChevronDown } from "lucide-react";
export function Header({
  toggleNav,
  onCreate,
  search,
  setSearch,
}: {
  toggleNav: () => void;
  onCreate: () => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  return (
    <header className="app-header">
      <button className="workspace-selector" onClick={toggleNav}>
        iQuee
        <ChevronDown size={12} />
      </button>
      <label className="search-box">
        <Search size={16} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={"Try searching “Insights”"}
          aria-label="Search team"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="header-actions">
        <button
          className="round-button"
          onClick={toggleNav}
          aria-label="Toggle navigation"
        >
          <Menu size={17} />
        </button>
        <span className="profile-avatar" title="iQuee workspace" />
        <button
          className="round-button pink"
          onClick={onCreate}
          aria-label="Create report"
        >
          <Plus size={20} />
        </button>
      </div>
    </header>
  );
}
