import { themeOptions, themes } from "../data/themes";

export default function ThemeSwitcher({ themeId, onChangeTheme, onCycleTheme }) {
  return (
    <div className="theme-switcher" aria-label="Theme controls">
      <button type="button" className="theme-cycle-btn" onClick={onCycleTheme} title="Cycle theme">
        cycle theme
      </button>
      <label className="theme-select-label" htmlFor="theme-select">
        theme
      </label>
      <select
        id="theme-select"
        className="theme-select"
        value={themeId}
        onChange={(event) => onChangeTheme(event.target.value)}
      >
        {themeOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="theme-blurb">{themes[themeId]?.blurb}</span>
    </div>
  );
}
